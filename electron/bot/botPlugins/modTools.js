const EventQueue = require('../components/base/eventQueue');

let announcement = null;
let announcementInterval = null;

let units = {
    second: 1000,
    seconds: 1000,
    minute: 60 * 1000,
    minutes: 60 * 1000,
    hour: 60 * 1000,
    hours: 60 * 60 * 1000
}

exports.commands = {
    "!announce": async (twitchContext, botContext) => {
        // Check if mod
        if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
            throw "Only a mod can create an announcment";
        }

        let requestMatch = twitchContext.text.match(/"(.*)" every ([0-9]+) (seconds|second|minutes|minute|hours|hour)/);

        if (!requestMatch) {
            throw `Invalid syntax.  Correct syntax is: !announce "[announcement_text]" every [time_interval] [seconds|minutes|hours]`;
        }

        let interval = parseInt(requestMatch[2]);
        let intervalUnit = requestMatch[3];
        let intervalUnitValue = units[requestMatch[3]];
        announcement = requestMatch[1];
        announcementInterval = setInterval(() => {
            EventQueue.sendInfoToChat(`${announcement}`);
        }, interval * intervalUnitValue);

        EventQueue.sendInfoToChat(`Announcement created, will fire every ${interval} ${intervalUnit}.`);
    },
    "!unannounce": async (twitchContext, botContext) => {
        // Check if mod
        if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
            throw "Only a mod can remove an announcment";
        }

        EventQueue.sendInfoToChat("Announcement destroyed.");

        clearInterval(announcementInterval);
    },
}
exports.init = async (botContext) => {}
exports.bitsHook = async ({bits, userName, userId}, botContext) => {}
exports.subscriptionHook = async ({userName, userId, subPlan}, botContext) => {}
exports.followHook = async ({userId, userName}, botContext) => {}
exports.redemptionHook = async ({rewardTitle, userName, userId}, botContext) => {}
exports.onWsMessage = async (event, ws, botContext) => {}
exports.wsInitHook = (from) => {}