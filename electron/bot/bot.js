const { StaticAuthProvider } = require('@twurple/auth');
const { ChatClient } = require('@twurple/chat');
const { PubSubClient } = require('@twurple/pubsub');

const EventQueue = require('./components/base/eventQueue');

const readline = require('readline');

const requestPlugin = require('./botPlugins/requests');
const deathCounterPlugin = require('./botPlugins/deathCounter');
const cameraObscura = require('./botPlugins/cameraObscura');
const modTools = require('./botPlugins/modTools');

const versionNumber = "3.0b";

/*
 * INDEXES
 */

let client, pubSubClient;
let listeners = [];
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

        EventQueue.sendEvent({
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

        EventQueue.sendEvent({
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

// Define configuration options for chat bot
const startBot = async (botConfig) => {
    try {
        let {accessToken, clientId, twitchChannel, devMode} = botConfig;
        let botContext = {};

        let plugins = [deathCounterPlugin, requestPlugin, cameraObscura, modTools];
        
        const onConsoleCommand = (command) => {
            client.say(twitchChannel, command);
        }

        // Called every time a message comes in
        const onMessageHandler = async (target, context, msg) => {
            let commands = {};
            plugins.forEach((plugin) => {
                commands = {...commands, ...plugin.commands};
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
                            EventQueue.sendInfoToChat(`Streamcrabs version ${versionNumber} written by thetruekingofspace`);
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
                    EventQueue.sendErrorToChat(new Error(e));
                }
            }
        }

        // Called every time the bot connects to Twitch chat
        const onConnectedHandler = async () => {
            if (devMode) {
                console.log("* RUNNING IN DEV MODE");
            }
            console.log("* Connected to Twitch Chat");

            botContext = {botConfig, plugins, client};

            // Initialize all plugins
            for (let plugin of plugins) {
                plugin.init(botContext);
            }

            // Start queue consumer
            await EventQueue.startEventListener(botContext);

            // Announce restart
            EventQueue.sendInfoToChat(`Streamcrabs version ${versionNumber} is online.  All systems nominal.`);
        }
        
        const onRaid = async (channel, username, viewers) => {
            console.log("RAID DETECTED: " + channel + ":" + username + ":" + viewers);
            let raidContext = {channel, username, viewers};
        
            // Run raid function of each plugin
            for (let plugin of plugins) {
                if (plugin.raidHook) {
                    plugin.raidHook(raidContext, botContext);
                }
            }
        }

        const onSubscription = async (subMessage) => {
            try {
                // Run through subscription plugin hooks
                for (let plugin of plugins) {
                    if (plugin.subscriptionHook) {
                        plugin.subscriptionHook(subMessage, botContext);
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
                        plugin.bitsHook(bitsMessage, botContext);
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

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: true
        });

        const authProvider = new StaticAuthProvider(clientId, accessToken, ["chat:read", "chat:edit", "channel:read:redemptions", "channel:read:subscriptions", "bits:read", "channel_subscriptions"], "user");
        client = new ChatClient({authProvider, channels: [twitchChannel]});
        pubSubClient = new PubSubClient();
        const userId = await pubSubClient.registerUserListener(authProvider);
        
        rl.on('line', onConsoleCommand);

        // Register our event handlers (defined below)
        client.onMessage((channel, username, message) => {
            onMessageHandler(channel, {username, id: ""}, message);
        });
        client.onConnect(onConnectedHandler);
        client.onRaid((channel, username, {viewerCount}) => {onRaid(channel, username, viewerCount)});
        let subListener = await pubSubClient.onSubscription(userId, onSubscription);
        let cheerListener = await pubSubClient.onBits(userId, onBits);
        let redemptionListener = await pubSubClient.onRedemption(userId, onRedemption);

        listeners = [subListener, cheerListener, redemptionListener];

        // Connect to twitch chat and pubsub
        client.connect();
    } catch (error) {
        console.error(`* Failed to start bot: ${error}`);
    }
};

const stopBot = () => {
    EventQueue.stopEventListener();
    client.quit();
    listeners.forEach((listener) => {
        listener.remove();
    });
};

module.exports = {
    startBot,
    stopBot
}