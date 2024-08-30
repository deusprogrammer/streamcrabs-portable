module.exports.BotPlugin = class BotPlugin {
    constructor(eventListener) {
        this.eventListener = eventListener;
    }

    init = (botContext) => {
        this.botContext = botContext;
    }

    getCommands = () => ({});
    followHook = (event) => {};
    bitsHook = (event) => {};
    subscriptionHook = (event) => {};
    raidHook = (event) => {};
    joinHook = (event) => {};
    redemptionHook = (event) => {};
    wsInitHook = (event) => {};
}