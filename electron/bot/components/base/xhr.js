const axios = require('axios');

const getSubscriptionMeta = async (botConfig) => {
    let {data: {total, points}} = await axios.get(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${botConfig.broadcasterId}`,
    {headers: {
        'client-id': botConfig.clientId,
        'authorization': `Bearer ${botConfig.accessToken}`
    }});

    return {total, points};
}

const refundRedemption = async (rewardId, id, botConfig) => {
    let {data: {data: redemption}} = await axios.patch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${botConfig.broadcasterId}&reward_id=${rewardId}&id=${id}`,
    {
        status: 'CANCELED'
    },
    {headers: {
        'content-type': 'application/json',
        'client-id': botConfig.clientId,
        'authorization': `Bearer ${botConfig.accessToken}`
    }});
    return redemption;
}

const clearRedemption = async (rewardId, id, botConfig) => {
    let {data: {data: redemption}} = await axios.patch(`https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions?broadcaster_id=${botConfig.broadcasterId}&reward_id=${rewardId}&id=${id}`,
    {
        status: 'FULFILLED'
    },
    {headers: {
        'content-type': 'application/json',
        'client-id': botConfig.clientId,
        'authorization': `Bearer ${botConfig.accessToken}`
    }});
    return redemption;
}

module.exports = {
    refundRedemption,
    clearRedemption,
    getSubscriptionMeta,
}