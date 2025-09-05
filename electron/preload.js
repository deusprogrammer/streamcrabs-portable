const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: async (channel, args) => {
            // whitelist channels
            let validChannels = [
                "deleteBotUser",
                "saveDefaultBotUser",
                "updateUiLock",
                "getUiLock",
                "startBot", 
                "stopBot", 
                "getBotRunning",
                "restartBot",
                "login",
                "loginBotUser",
                "storeMedia",
                "updateEnableList",
                "getDynamicAlert",
                "removeDynamicAlert",
                "saveDynamicAlert",
                "removeRaidAlert",
                "updateVideoPool",
                "updateAudioPool",
                "updateImagePool",
                "getUserData",
                "updateUserData",
                "updateAlerts",
                "getBotConfig",
                "storeBotConfig",
                "updateCommands",
                "saveCommand",
                "removeCommand",
                "updateRedemptions",
                "updateGauges",
                "getLlmList",
                "checkMigration",
                "migrate",
                "fireOverlayEvent"
            ];
            if (validChannels.includes(channel)) {
                return await ipcRenderer.invoke(channel, args);
            } else {
                throw new Error(`Invalid channel: ${channel}`);
            }
        }
    }
);