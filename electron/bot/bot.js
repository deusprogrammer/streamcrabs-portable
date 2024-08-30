const { StaticAuthProvider } = require('@twurple/auth');
const { ChatClient } = require('@twurple/chat');
const { ApiClient } = require('@twurple/api');
const { EventSubWsListener } = require('@twurple/eventsub-ws');
const { EventListener } = require('./components/base/eventQueue');
const ollamaJs = require('ollama');

const readline = require('readline');

const versionNumber = "3.0b";

class OllamaClient {
    constructor(aiSettings) {
        this.aiSettings = aiSettings;
        this.messages = [];
        this.client  = new ollamaJs.Ollama({ host: aiSettings.llmUrl });        
    }

    setup = async (setupPrompt) => {
        this.messages.push({
            role: "system",
            content: setupPrompt
        });
        await this.client.chat({
            stream: false,
            model: this.aiSettings.llmModel,
            messages: this.messages
        });
    }

    send = async (username, message) => {
        this.messages.push({
            role: "user",
            content: `${username}: ${message}`
        });
        let response = await this.client.chat({
            stream: false,
            model: this.aiSettings.llmModel,
            messages: this.messages
        });
        this.messages.push(response.message);
        return response.message.content;
    }
}

class AIChatBot {
    constructor(botConfig, botUser) {
        this.botConfig = botConfig;
        this.botUser = botUser;
        this.eventQueue = new EventListener();
        this.isRunning = false;
    }

    // Define configuration options for chat bot
    start = async () => {
        console.log("STARTING LLAMA BOT " + this.botUser);

        try {
            let {clientId, twitchChannel, botUsers} = this.botConfig;
            let {accessToken: chatAccessToken, aiSettings} = botUsers[this.botUser];
            let ollama;

            if (aiSettings?.aiEnabled) {
                ollama = new OllamaClient(aiSettings);
                ollama.setup(`You are a chatter in a Twitch stream.  The following is a description of your personality: "${aiSettings.chatBotPersonalityPrompt}".  Every prompt after this one is a message from one of the other people in Twitch chat preceded by their name.  When you reply you do not need to append your username to the beginning of your response.`)
            }

            this.eventListener = this.eventListener = new EventListener();

            // Called every time a message comes in
            const onMessageHandler = async (target, context, msg) => {
                // Remove whitespace from chat message
                const command = msg.trim();

                if (aiSettings?.aiEnabled && command.includes(this.botUser)) {
                    let response = await ollama.send(context.username, command);
                    this.chatClient.say(twitchChannel, response);
                }
            }

            // Called every time the bot connects to Twitch chat
            const onConnectedHandler = async () => {
                console.log("* Connected to Twitch Chat");

                // Announce restart
                this.chatClient.say(twitchChannel, `Streamcrabs Llama Bot version ${versionNumber} is online.  All systems nominal.`);
                this.isRunning = true;
            }

            const chatAuthProvider = new StaticAuthProvider(clientId, chatAccessToken, ["chat:read", "chat:edit", "channel:read:redemptions", "channel:read:subscriptions", "bits:read", "channel_subscriptions"], "user");
            this.chatClient = new ChatClient({authProvider: chatAuthProvider, channels: [twitchChannel]});

            // Register our event handlers (defined below)
            this.chatClient.onMessage((channel, username, message) => {
                onMessageHandler(channel, {username, id: ""}, message);
            });
            this.chatClient.onConnect(onConnectedHandler);

            // Connect to twitch chat and pubsub
            await this.chatClient.connect();
        } catch (error) {
            console.error(`* Failed to start bot: ${error}`);
            throw error;
        }
    };

    stop = async () => {
        if (!this.isRunning) {
            return;
        }

        console.log("STOPPING BOT " + this.botUser);
        await this.chatClient.quit();
    };
}

class StreamcrabsBot {
    constructor(botConfig, botUser, installedPlugins) {
        this.installedPlugins = installedPlugins;
        this.botConfig = botConfig;
        this.botUser = botUser;
        this.eventQueue = new EventListener();
        this.isRunning = false;
    }

    // Define configuration options for chat bot
    start = async () => {
        console.log("STARTING STREAMCRABS BOT " + this.botUser);

        try {
            let {accessToken, clientId, twitchChannel, botUsers, devMode, broadcasterId} = this.botConfig;
            let botContext = {};
            let {accessToken: chatAccessToken} = botUsers[this.botUser];

            this.eventListener = this.eventListener = new EventListener();
            let plugins = this.installedPlugins.map(Plugin => (new Plugin(this.eventListener)));

            let cooldowns = {};
            let units = {
                ms: 1,
                s: 1000,
                m: 60 * 1000,
                h: 60 * 60 * 1000
            }

            const performCustomCommand = (command, {type, coolDown, target}, botContext) => {
                console.log("COOLDOWN LEFT: " + cooldowns[command] - Date.now());
                if (cooldowns[command] && cooldowns[command] - Date.now() <= 0) {
                    console.log("COOLDOWN OVER");
                    delete cooldowns[command];
                } else if (cooldowns[command] && cooldowns[command] - Date.now() > 0) {
                    throw "Custom command '" + command + "' is on cooldown until " + new Date(cooldowns[command]);
                }

                let match = coolDown.match(/(\d+)(ms|s|m|h)/);
                if (!match) {
                    throw "Custom command has invalid cooldown string";
                }

                console.log("COOLDOWN PARSED: " + match[1] + " " + match[2]);

                cooldowns[command] = Date.now() + parseInt(match[1]) * units[match[2]];

                console.log("COOLDOWN ENDS AT: " + cooldowns[command]);

                if (type === "VIDEO") {
                    let {url, volume, name, chromaKey} = botContext.botConfig.videoPool.find(video => video.id === target);

                    this.eventListener.sendEvent({
                        type,
                        targets: ["panel"],
                        eventData: {
                            message: [''],
                            mediaName: name,
                            url,
                            chromaKey,
                            volume,
                            results: {}
                        }
                    });
                } else if (type === "AUDIO") {
                    let {url, volume, name} = botContext.botConfig.audioPool.find(audio => audio.id === target);

                    this.eventListener.sendEvent({
                        type,
                        targets: ["panel"],
                        eventData: {
                            message: [''],
                            mediaName: name,
                            url,
                            volume,
                            results: {}
                        }
                    });
                }
            }
            
            const onConsoleCommand = (command) => {
                this.chatClient.say(twitchChannel, command);
            }

            // Called every time a message comes in
            const onMessageHandler = async (target, context, msg) => {
                let commands = {};
                plugins.forEach((plugin) => {
                    commands = {...commands, ...plugin.getCommands()};
                });

                const caller = {
                    id: context["user-id"],
                    name: context.username
                }

                // Remove whitespace from chat message
                const command = msg.trim();
                const [commandName, ...text] = command.split(" ");
                const tokens = command.split(" ");

                const commandText = text.join(" ");

                // Handle battle commands here
                if (command.startsWith("!")) {
                    context.command = command;
                    context.commandName = commandName;
                    context.text = commandText;
                    context.tokens = tokens;
                    context.caller = caller;
                    context.target = target;

                    console.log("Received command!")
                    console.log("Tokens: " + context.tokens);

                    try {
                        switch (context.tokens[0]) {
                            case "!about":
                                this.eventListener.sendInfoToChat(`Streamcrabs Bot version ${versionNumber} written by thetruekingofspace`);
                                break;
                            default:
                                if (commands[context.tokens[0]]) {
                                    await commands[context.tokens[0]](context, botContext);
                                } else if (botContext.botConfig.commands[context.tokens[0]]) {
                                    await performCustomCommand(context.tokens[0], botContext.botConfig.commands[context.tokens[0]], botContext);
                                }
                        }
                    } catch (e) {
                        console.error(e.message + ": " + e.stack);
                        this.eventListener.sendErrorToChat(new Error(e));
                    }
                }
            }

            // Called every time the bot connects to Twitch chat
            const onConnectedHandler = async () => {
                if (devMode) {
                    console.log("* RUNNING IN DEV MODE");
                }
                console.log("* Connected to Twitch Chat");

                botContext = {botConfig: this.botConfig, plugins, client: this.chatClient};

                // Initialize all plugins
                for (let plugin of plugins) {
                    plugin.init(botContext);
                }

                // Start queue consumer and event sub listener
                await this.eventListener.start(botContext);
                await this.eventSubListener.start();

                // Announce restart
                this.eventListener.sendInfoToChat(`Streamcrabs version ${versionNumber} is online.  All systems nominal.`);
                this.isRunning = true;
            }
            
            const onRaid = async (raidMessage) => {
                try {
                    // Run raid function of each plugin
                    for (let plugin of plugins) {
                        if (plugin.raidHook) {
                            plugin.raidHook(raidMessage);
                        }
                    }
                } catch (e) {
                    console.log(`RAID ERROR: ${e}`);
                }
            }

            const onSubscription = async (subMessage) => {
                try {
                    // Run through subscription plugin hooks
                    for (let plugin of plugins) {
                        if (plugin.subscriptionHook) {
                            plugin.subscriptionHook(subMessage);
                        }
                    }
                } catch (error) {
                    console.error("SUB FAILURE: " + error);
                }
            } 

            const onBits = async (bitsMessage) => {
                try {
                    // Run through bit plugin hooks
                    for (let plugin of plugins) {
                        if (plugin.bitsHook) {
                            plugin.bitsHook(bitsMessage);
                        }
                    }
                } catch (error) {
                    console.error("BIT FAILURE: " + error);
                }
            }

            const onRedemption = async (redemptionMessage) => {
                try {
                    // Run through redemption plugin hooks
                    for (let plugin of plugins) {
                        if (plugin.redemptionHook) {
                            plugin.redemptionHook(redemptionMessage, botContext);
                        }
                    }
                } catch (error) {
                    console.error("REDEMPTION FAILURE: " + error);
                }
            }

            const onFollow = async (followEvent) => {
                try {
                    // Run through redemption plugin hooks
                    for (let plugin of plugins) {
                        if (plugin.followHook) {
                            plugin.followHook(followEvent, botContext);
                        }
                    }
                } catch (error) {
                    console.error("FOLLOW FAILURE: " + error);
                }
            }

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: true
            });

            const authProvider = new StaticAuthProvider(clientId, accessToken, ["chat:read", "chat:edit", "channel:read:redemptions", "channel:read:subscriptions", "bits:read", "moderator:read:followers", "channel_subscriptions"], "user");
            const apiClient = new ApiClient({authProvider});
            
            const chatAuthProvider = new StaticAuthProvider(clientId, chatAccessToken, ["chat:read", "chat:edit", "channel:read:redemptions", "channel:read:subscriptions", "bits:read", "channel_subscriptions"], "user");
            this.chatClient = new ChatClient({authProvider: chatAuthProvider, channels: [twitchChannel]});
            
            apiClient.eventSub.deleteAllSubscriptions();
            this.eventSubListener = new EventSubWsListener({ apiClient });
            
            rl.on('line', onConsoleCommand);

            // Register our event handlers (defined below)
            this.chatClient.onMessage((channel, username, message) => {
                onMessageHandler(channel, {username, id: ""}, message);
            });
            this.chatClient.onConnect(onConnectedHandler);

            let followListener =  this.eventSubListener.onChannelFollow(broadcasterId, broadcasterId, onFollow);
            let raidListener =  this.eventSubListener.onChannelRaidTo(broadcasterId, ({raidingBroadcasterName, viewers}) => onRaid(twitchChannel, raidingBroadcasterName, viewers));
            let redemptionListener =  this.eventSubListener.onChannelRedemptionAdd(broadcasterId, onRedemption);
            let subListener =  this.eventSubListener.onChannelSubscription(broadcasterId, onSubscription);
            let cheerListener =  this.eventSubListener.onChannelCheer(broadcasterId, onBits);

            this.listeners = [subListener, cheerListener, redemptionListener, followListener, raidListener];

            // Connect to twitch chat and pubsub
            await this.chatClient.connect();
        } catch (error) {
            console.error(`* Failed to start bot: ${error}`);
            throw error;
        }
    };

    stop = async () => {
        if (!this.isRunning) {
            return;
        }

        console.log("STOPPING BOT " + this.botUser);

        await this.eventListener.stop();
        await this.chatClient.quit();
        this.listeners.forEach((listener) => {
            if (listener.remove) {
                listener.remove();
            } else if (listener.stop) {
                listener.stop();
            }
        });
    };
}

module.exports = {
    StreamcrabsBot,
    AIChatBot
}