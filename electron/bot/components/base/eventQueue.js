const WebSocket = require('ws');

// Queue for messages to avoid flooding
let queue = [];

// List of panels that have initialized
let panels = {};

/* 
* CHAT BOT 
*/

let sockets = [];
let listenerInterval;
let extWs;

// Setup websocket to communicate with extension
const connectWs = () => {
    extWs = new WebSocket.Server({ port: 8081 });

    extWs.on('connection', async (ws) => {
        sockets.push(ws);

        ws.on('message', async (message) => {
            let event = JSON.parse(message);
    
            console.log("BOT WS: " + JSON.stringify(event, null, 5));
    
            if (event.type === "PANEL_INIT") {
                for (let plugin of eventContext.botContext.plugins) {
                    plugin.wsInitHook(event, eventContext.botContext);
                }
    
                // Add panel to list for enabling and disabling functionality
                panels[event.name] = Date.now();
            } else if (event.type === "PANEL_PING") {
                panels[event.name] = Date.now();
            }
        });
    });
}

const sendEventToPanels = async (event) => {
    event.to = "PANELS";
    sockets.forEach(ws => ws.send(JSON.stringify(event)));
}

const sendEvent = async (event, verbosity = "simple") => {
    queue.unshift({event, level: verbosity});
}

const sendInfoToChat = async (message, includePanel = false) => {
    let targets = ["chat"]

    if (includePanel) {
        targets.push("panel");
    }

    sendEvent({
        type: "INFO",
        targets,
        eventData: {
            results: {
                message
            }
        }
    })
}

const sendErrorToChat = async(message) => {
    let targets = ["chat"]

    sendEvent({
        type: "INFO",
        targets,
        eventData: {
            results: {
                message
            }
        }
    })
}

const sendEventToOverlays = (type, eventData) => {
    const targets = ["panel"];

    if (!eventData.results) {
        eventData.results = {};
    }

    sendEvent({
        type,
        targets,
        eventData
    })
}

let eventContext = {
    botContext: {}
}

let startEventListener = async (botContext) => {
    eventContext.botContext = botContext;
    connectWs();
    //await Redemption.startListener(queue, eventContext.botContext, botContext.plugins);
    listenerInterval = setInterval(async () => {
        let message = queue.pop();

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
                    eventContext.botContext.client.say(eventContext.botContext.botConfig.twitchChannel, text);
                } else {
                    eventContext.botContext.client.say(eventContext.botContext.botConfig.twitchChannel, "/me " + text);
                }
            }
            // Send event to panel via web socket
            if (event.targets.includes("panel")) {
                sendEventToPanels(event);
            }
        }
    }, 2500);
}

let stopEventListener = () => {
    clearInterval(listenerInterval);
    extWs.close();
    sockets.forEach((socket) => {
        socket.close();
    });
}

const isPanelInitialized = (panelName) => {
    return Date.now() - panels[panelName] <= 30000;
}

exports.sendEvent = sendEvent;
exports.sendEventToPanels = sendEventToPanels;
exports.sendInfoToChat = sendInfoToChat;
exports.sendErrorToChat = sendErrorToChat;
exports.startEventListener = startEventListener;
exports.stopEventListener = stopEventListener;
exports.isPanelInitialized = isPanelInitialized;
exports.sendEventToOverlays = sendEventToOverlays;