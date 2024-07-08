import axios from "axios";

export const login = async () => {
    return await window.api.send('login');
}

export const getBotConfig = async () => {
    return await window.api.send("getBotConfig");
}

export const updateAudioPool = async (mediaPool) => {
    return await window.api.send("updateAudioPool", mediaPool);
}

export const updateVideoPool = async (mediaPool) => {
    return await window.api.send("updateVideoPool", mediaPool);
}

export const updateImagePool = async (mediaPool) => {
    return await window.api.send("updateImagePool", mediaPool);
}

export const storeMediaData = async (mediaData) => {
    return await window.api.send("storeMedia", mediaData);
}

export const storeDynamicAlert = async (dynamicAlertConfig) => {
    return await window.api.send("saveDynamicAlert", dynamicAlertConfig);
}

export const updateDynamicAlert = async (dynamicAlertConfig) => {
    return await window.api.send("saveDynamicAlert", dynamicAlertConfig);
}

export const removeDynamicAlert = async (dynamicAlertConfig) => {
    return await window.api.send("removeDynamicAlert", dynamicAlertConfig);
}

export const getDynamicAlert = async (id) => {
    return await window.api.send("getDynamicAlert", id);
}

export const getDynamicAlerts = async () => {
    return await window.api.send("getDynamicAlerts");
}

export const updateCommands = async (commands) => {
    await window.api.send("updateCommands", commands);
}

export const updateAlerts = async (alertConfigs) => {
    await window.api.send("updateAlerts", alertConfigs);
}

export const updateRedemptions = async (redemptions) => {
    await window.api.send("updateRedemptions", redemptions);
}

export const updateGauges = async (gauges) => {
    await window.api.send("updateGauges", gauges); 
}

export const createChannelPointReward = async (title, cost, botConfig) => {
    let {data: {data: rewards}} = await axios.post(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${botConfig.broadcasterId}`, {
        title,
        cost
    }, {
        headers: {
            'content-type': 'application/json',
            'client-id': botConfig.clientId,
            'authorization': `Bearer ${botConfig.accessToken}`
        }
    });

    return rewards;
}

export const removeChannelPointReward = async (id, botConfig) => {
    let {data: {data: rewards}} = await axios.delete(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${botConfig.broadcasterId}&id=${id}`, {
        headers: {
            'content-type': 'application/json',
            'client-id': botConfig.clientId,
            'authorization': `Bearer ${botConfig.accessToken}`
        }
    });

    return rewards;
}

export const getChannelPointRewards = async (botConfig) => {
    let {data: {data: rewards}} = await axios.get(`https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${botConfig.broadcasterId}`, {
        headers: {
            'content-type': 'application/json',
            'client-id': botConfig.clientId,
            'authorization': `Bearer ${botConfig.accessToken}`
        }
    });

    return rewards;
}

export const migrate = async (key) => {
    await window.api.send("migrate", key); 
}

export const checkMigration = async () => {
    return await window.api.send("checkMigration"); 
}

export const fireOverlayEvent = async (type, eventData) => {
    return await window.api.send("fireOverlayEvent", {type, eventData});
}