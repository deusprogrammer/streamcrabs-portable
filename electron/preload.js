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
                "updateUiLock",
                "getUiLock",
                "startBot", 
                "stopBot", 
                "getBotRunning",
                "restartBot",
                "login",
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
                "updateCommands",
                "saveCommand",
                "removeCommand",
                "updateRedemptions",
                "updateGauges",
                "checkMigration",
                "migrate",
                "fireOverlayEvent"
            ];
            if (validChannels.includes(channel)) {
                return await ipcRenderer.invoke(channel, args);
            } else {
                throw `Invalid channel: ${channel}`;
            }
        }
    }
);