const EventQueue = require('../components/base/eventQueue');

exports.commands = {
    "!tools:death": async (twitchContext, botContext) => {
        // Check if mod
        if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
            throw "Only a mod can increment the death counter";
        }

        let count = -1;
        if (twitchContext.tokens.length > 1) {
            count = parseInt(twitchContext.tokens[1]);
        }

        EventQueue.sendEvent({
            type: "DEATH_COUNT",
            targets: ["panel"],
            eventData: {
                results: {},
                count
            }
        });
    }
}

exports.init = async (botContext) => {}
exports.redemptionHook = async () => {}
exports.bitsHook = async () => {}
exports.subscriptionHook = async () => {}
exports.wsInitHook = () => {}