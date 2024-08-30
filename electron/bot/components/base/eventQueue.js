const WebSocket = require('ws');

class EventListener {
    constructor() {
        this.queue = [];
        this.sockets = [];
        this.panels = {};
    }

    start = (botContext) => {
        this.connectWs(botContext.plugins);
        this.listenerInterval = setInterval(async () => {
            let message = this.queue.pop();

            if (message) {
                let event = message.event;
                let text = event.eventData ? event.eventData.results.message : "EXT MESSAGE";

                if (!event.targets) {
                    event.targets = ["chat"];
                }

                if (typeof text === "object" && text.stack) {
                    console.error("ERROR: " + text.message + ":\n" + text.stack);
                    text = text.message;
                }

                // Send event to chat
                if (event.targets.includes("chat")) {
                    if (text.startsWith("/")) {
                        botContext.client.say(botContext.botConfig.twitchChannel, text);
                    } else {
                        botContext.client.say(botContext.botConfig.twitchChannel, "/me " + text);
                    }
                }

                // Send event to panel via web socket
                if (event.targets.includes("panel")) {
                    this.sendEventToPanels(event);
                }
            }
        }, 2500);
    }

    stop = () => {
        clearInterval(this.listenerInterval);
        this.extWs.close();
        this.sockets.forEach((socket) => {
            socket.close();
        });
    }

    // Setup websocket to communicate with extension
    connectWs = (plugins) => {
        this.extWs = new WebSocket.Server({ port: 8081 });

        this.extWs.on('connection', async (ws) => {
            this.sockets.push(ws);

            ws.on('message', async (message) => {
                let event = JSON.parse(message);
        
                console.log("BOT WS: " + JSON.stringify(event, null, 5));
        
                if (event.type === "PANEL_INIT") {
                    for (let plugin of plugins) {
                        plugin.wsInitHook(event);
                    }
        
                    // Add panel to list for enabling and disabling functionality
                    this.panels[event.name] = Date.now();
                } else if (event.type === "PANEL_PING") {
                    this.panels[event.name] = Date.now();
                }
            });
        });
    }

    sendEventToPanels = async (event) => {
        event.to = "PANELS";
        this.sockets.forEach(ws => ws.send(JSON.stringify(event)));
    }

    sendEvent = async (event, verbosity = "simple") => {
        this.queue.unshift({event, level: verbosity});
    }

    sendInfoToChat = async (message, includePanel = false) => {
        let targets = ["chat"]

        if (includePanel) {
            targets.push("panel");
        }

        this.sendEvent({
            type: "INFO",
            targets,
            eventData: {
                results: {
                    message
                }
            }
        })
    }

    sendErrorToChat = async(message) => {
        let targets = ["chat"]

        this.sendEvent({
            type: "INFO",
            targets,
            eventData: {
                results: {
                    message
                }
            }
        })
    }

    sendEventToOverlays = (type, eventData) => {
        const targets = ["panel"];

        if (!eventData.results) {
            eventData.results = {};
        }

        this.sendEvent({
            type,
            targets,
            eventData
        })
    }

    isPanelInitialized = (panelName) => {
        return Date.now() - this.panels[panelName] <= 30000;
    }
}

exports.EventListener = EventListener;