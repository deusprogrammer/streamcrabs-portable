const { ipcMain } = require('electron');
const EventQueue = require('../components/base/eventQueue');
const Xhr = require('../components/base/xhr');

let redemptionTypeMap = {
    VIDEO: "MULTI",
    IMAGE: "MULTI",
    DYNAMIC: "MULTI",
    AUDIO: "SOUND_PLAYER"
};

const updateGauge = (gauges) => {
    ipcMain.emit('updateGauges', gauges);
}

const performAction = async (type, id, soundId, subPanel, message, botContext) => {
    let port = botContext.botConfig.imageServerPort;

    if (type === "VIDEO") {
        let video;
        if (id === null) {
            let enabledVideo = botContext.botConfig.videoPool.filter((element) => {
                return element.enabled;
            });
            let n = Math.floor((Math.random() * enabledVideo.length));
            video = enabledVideo[n];
        } else {
            video = botContext.botConfig.videoPool.find(video => video.id === id);
        }

        let {url, volume, chromaKey} = video;

        url = url.replace("app://", `/`);

        if (!volume) {
            volume = 1.0;
        }

        EventQueue.sendEventToOverlays(type, {
            url,
            message,
            chromaKey,
            volume,
            subPanel
        });
    } else if (type === "AUDIO") {
        let audio;
        if (id === null) {
            let enabledAudio = botContext.botConfig.audioPool.filter((element) => {
                return element.enabled;
            });
            let n = Math.floor((Math.random() * enabledAudio.length));
            audio = enabledAudio[n];
        } else {
            audio = botContext.botConfig.audioPool.find(audio => audio.id === id);
        }

        let {url, volume} = audio;

        url = url.replace("app://", `/`);

        if (!volume) {
            volume = 1.0;
        }

        EventQueue.sendEventToOverlays(type, {
            url,
            message,
            volume
        });
    } else if (type === "IMAGE") {
        let image;
        if (id === null) {
            let enabledImage = botContext.botConfig.imagePool;
            let n = Math.floor((Math.random() * enabledImage.length));
            image = enabledImage[n];
        } else {
            image = botContext.botConfig.imagePool.find(image => image.id === id);
        }

        let audio;
        if (soundId === null) {
            let enabledAudio = botContext.botConfig.audioPool.filter((element) => {
                return element.enabled;
            });
            let n = Math.floor((Math.random() * enabledAudio.length));
            audio = enabledAudio[n];
        } else {
            audio = botContext.botConfig.audioPool.find(audio => audio.id === soundId);
        }

        let {url} = image;
        let {url: soundUrl, volume: soundVolume} = audio;

        url = url.replace("app://", `/`);
        soundUrl = soundUrl.replace("app://", `/`);

        if (!soundVolume) {
            soundVolume = 1.0;
        }

        EventQueue.sendEventToOverlays(type, {
            url,
            message,
            soundUrl,
            soundVolume,
            subPanel
        });

        return;
    }
}

const alert = async (message, alertType, {variable}, botContext) => {
    const {enabled, type, name, id, soundId, panel} = botContext.botConfig.alertConfigs[alertType];

    if (!enabled) {
        return;
    }

    if (type === "DYNAMIC") {
        let customTheme;
        let theme;
        if (id) {
            theme = "STORED";
            customTheme = botContext.botConfig.dynamicAlerts.find(dynamicAlert => dynamicAlert.id === id);
        } else {
            theme = name;
        }

        customTheme.sprites.forEach((sprite) => {
            sprite.file = sprite.file.replace("app://", "/");
        });

        customTheme.music.file = customTheme.music.file.replace("app://", "/");
        customTheme.leavingSound.file = customTheme.music.file.replace("app://", "/");
        
        EventQueue.sendEventToOverlays(type, {
            message,
            variable,
            theme,
            customTheme,
            subPanel: panel
        });
    } else {
        performAction(type, id, soundId, panel, message, botContext);
    }
}

exports.commands = {
    "!test:raid": (twitchContext, botContext) => {
        if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
            throw "Only a mod can test raid";
        }

        this.raidHook({username: "test_user", viewers: 100}, botContext);
    },
    "!test:sub": (twitchContext, botContext) => {
        if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
            throw "Only a mod can test subs";
        }

        this.subscriptionHook({userName: "test_user", subPlan: 3000}, botContext);
    },
    "!test:follow": (twitchContext, botContext) => {
        if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
            throw "Only a mod can test follow";
        }

        this.followHook({userName: "test_user"}, botContext);
    },
    "!test:cheer": (twitchContext, botContext) => {
        if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
            throw "Only a mod can test cheer";
        }

        this.bitsHook({bits: 1000, userName: "test_user"}, botContext);
    }
}
exports.init = async (botContext) => {}

exports.followHook = async ({userName}, botContext) => {
    const {enabled, messageTemplate} = botContext.botConfig.alertConfigs.followAlert;

    let alertMessage = `${userName} just followed!`;
    if (messageTemplate) {
        alertMessage = messageTemplate.replace("${username}", userName);
    }

    if (!enabled) {
        return;
    }

    await alert(alertMessage, "followAlert", {variable: 1}, botContext);
}

exports.bitsHook = async ({bits, userName}, botContext) => {
    const {enabled, messageTemplate} = botContext.botConfig.alertConfigs.cheerAlert;
    
    let alertMessage = `${userName} cheered ${bits} bits!`;
    if (messageTemplate) {
        alertMessage = messageTemplate.replace("${bits}", bits).replace("${username}", userName);
    }

    // Get all gauges related to subscription tracking
    // const subGauges = Object.keys(botContext.botConfig.gauges).filter(key => botContext.botConfig.gauges[key].type === "CHEER");
    // if (subGauges.length > 0) {
    //     // Refresh token
    //     for (const subPanel of subGauges) {
    //         const {label, currentValue, maxValue, increaseSound, decreaseSound, completeSound} = botContext.botConfig.gauges[subPanel];

    //         let {url: increaseSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === increaseSound);
    //         let {url: decreaseSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === decreaseSound);
    //         let {url: completeSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === completeSound);

    //         EventQueue.sendEventToOverlays("GAUGE", {
    //             type: "CHEER",
    //             subPanel: "_ALL_GAUGES",
    //             gaugeKey: subPanel,
    //             label,
    //             currentValue: currentValue + bits,
    //             maxValue,
    //             increaseSoundUrl,
    //             decreaseSoundUrl,
    //             completeSoundUrl,
    //             init: false
    //         });

    //         botContext.botConfig.gauges[subPanel].currentValue = currentValue + bits;
    //         updateGauge(TWITCH_EXT_CHANNEL_ID, botContext.botConfig.gauges);
    //     }
    // }

    if (!enabled) {
        return;
    }

    await alert(alertMessage, "cheerAlert", {variable: bits}, botContext);
}

exports.subscriptionHook = async ({userName, subPlan}, botContext) => {
    const {enabled, messageTemplate} = botContext.botConfig.alertConfigs.subAlert;
    let alertMessage = `${userName} subscribed at ${subPlan !== 'prime' ? 'tier ' + subPlan / 1000 : 'prime'}!`;
    if (messageTemplate) {
        alertMessage = messageTemplate.replace("${username}", userName).replace("${subTier}", subPlan !== 'prime' ? subPlan / 1000 : 'prime');
    }

    // Get all gauges related to subscription tracking
    const subGauges = Object.keys(botContext.botConfig.gauges).filter(key => botContext.botConfig.gauges[key].type === "SUB");
    if (subGauges.length > 0) {
        // Refresh token
        const {total: currentValue} = await Xhr.getSubscriptionMeta(botContext.botConfig);
        for (const subPanel of subGauges) {
            const {label, maxValue, increaseSound, decreaseSound, completeSound} = botContext.botConfig.gauges[subPanel];

            let {url: increaseSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === increaseSound);
            let {url: decreaseSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === decreaseSound);
            let {url: completeSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === completeSound);

            EventQueue.sendEventToOverlays("GAUGE", {
                type: "SUB",
                subPanel: "_ALL_GAUGES",
                gaugeKey: subPanel,
                label,
                currentValue,
                maxValue,
                increaseSoundUrl,
                decreaseSoundUrl,
                completeSoundUrl,
                init: false
            });
        }
    }

    if (!enabled) {
        return;
    }

    await alert(alertMessage, "subAlert", {variable: 100}, botContext);
}

exports.raidHook = async ({username, viewers}, botContext) => {
    const {enabled, messageTemplate} = botContext.botConfig.alertConfigs.raidAlert;
    const alertMessage = messageTemplate.replace("${raider}", username).replace("${viewers}", viewers);

    if (!enabled) {
        return;
    }

    await alert(alertMessage, "raidAlert", {variable: viewers}, botContext);
}

exports.joinHook = async (joinContext, botContext) => {
}

exports.redemptionHook = async ({rewardId, rewardPrompt, id, rewardTitle, userName}, botContext) => {
    let botConfig = botContext.botConfig;

    // Perform commands found in prompt.
    let commandMatch = rewardPrompt.match(/\[(.*):(.*):(.*):(.*)\]/);
    if (commandMatch) {
        let [,type, subPanel, action, parameter] = commandMatch;

        switch (type) {
            case "GAUGE": {
                if (!botConfig.gauges[subPanel]) {
                    break;
                }

                let {label, currentValue, maxValue, increaseSound, decreaseSound, completeSound, type} = botConfig.gauges[subPanel];

                if (type !== "CUSTOM") {
                    return;
                }

                if (action === "ADD") {
                    currentValue += parseInt(parameter);
                } else if (action === "SUB") {
                    currentValue -= parseInt(parameter);
                } else if (action === "SET") {
                    currentValue = parseInt(parameter);
                }

                let {url: increaseSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === increaseSound);
                let {url: decreaseSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === decreaseSound);
                let {url: completeSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === completeSound);

                EventQueue.sendEventToOverlays("GAUGE", {
                    label,
                    subPanel: "_ALL_GAUGES",
                    gaugeKey: subPanel,
                    currentValue,
                    maxValue,
                    increaseSoundUrl,
                    decreaseSoundUrl,
                    completeSoundUrl,
                    init: false
                });
                botConfig.gauges[subPanel].currentValue = currentValue;

                updateGauge(botConfig.gauges);
                break; 
            }
        default:
            break;
        }
    }

    // If there is a custom reward with this id, perform the associated action.
    let customReward = botConfig.redemptions[rewardId];
    if (customReward) {

        let {id: mediaId, soundId, type, subPanel} = customReward;
        if (!EventQueue.isPanelInitialized(redemptionTypeMap[type], subPanel)) {
            EventQueue.sendInfoToChat("Required panel is not available for this stream");
            await Xhr.refundRedemption(rewardId, id, botConfig);
            return;
        }
        performAction(type, mediaId, soundId, subPanel, null, botContext);
        await Xhr.clearRedemption(rewardId, id, botConfig);
        return;
    }

    if (rewardTitle.toUpperCase() === "RANDOM SOUND" || rewardTitle.toUpperCase() === "PLAY RANDOM SOUND") {
        if (!EventQueue.isPanelInitialized("SOUND_PLAYER")) {
            EventQueue.sendInfoToChat("Sound panel is not available for this stream");
            await Xhr.refundRedemption(rewardId, id, botConfig);
            return;
        }
        
        performAction("AUDIO", null, null, "default", null, botContext);

        await Xhr.clearRedemption(rewardId, id, botConfig);
    }  else if (rewardTitle.toUpperCase() === "RANDOM VIDEO" || rewardTitle.toUpperCase() === "PLAY RANDOM VIDEO") {
        if (!EventQueue.isPanelInitialized("MULTI")) {
            EventQueue.sendInfoToChat("Video panel is not available for this stream");
            await Xhr.refundRedemption(rewardId, id, botConfig);
            return;
        }

        performAction("VIDEO", null, null, "default", null, botContext);

        await Xhr.clearRedemption(rewardId, id, botConfig, botContext);
    } else if (rewardTitle.toUpperCase() === "BIRD UP") {
        if (!EventQueue.isPanelInitialized("MULTI")) {
            EventQueue.sendInfoToChat("Video panel is not available for this stream");
            await Xhr.refundRedemption(rewardId, id, botConfig);
            return;
        }

        EventQueue.sendEventToOverlays("BIRDUP", {subPanel: "default"});

        await Xhr.clearRedemption(rewardId, id, botConfig);
    } else if (rewardTitle.toUpperCase() === "BAD APPLE") {
        if (!EventQueue.isPanelInitialized("MULTI")) {
            EventQueue.sendInfoToChat("Video panel is not available for this stream");
            await Xhr.refundRedemption(rewardId, id, botConfig);
            return;
        }

        EventQueue.sendEventToOverlays("VIDEO", {
            url: "/videos/badapple.mp4",
            chromaKey: "black",
            volume: "0.8",
            subPanel: "default"
        });

        await Xhr.clearRedemption(rewardId, id, botConfig);
    } else if (rewardTitle.toUpperCase() === "BE A BIG SHOT") {
        if (!EventQueue.isPanelInitialized("MULTI") || !EventQueue.isPanelInitialized("FILE_WRITER")) {
            EventQueue.sendInfoToChat("Video panel or filewriter proxy is not available for this stream");
            await Xhr.refundRedemption(rewardId, id, botConfig);
            return;
        }

        EventQueue.sendEventToOverlays("VIDEO", {
            message: `${userName} is a big shot for the week!`,
            url: "/videos/bigshot.mp4",
            chromaKey: null,
            volume: "0.8",
            subPanel: "default"
        });

        EventQueue.sendEventToOverlays("FILE_WRITER", {
            textToWrite: userName,
            fileToWriteTo: "BIG_SHOT"
        });

        EventQueue.sendInfoToChat(`${userName} is now a BIG SHOT!`);

        await Xhr.clearRedemption(rewardId, id, botConfig);
    }
}

exports.wsInitHook = async ({subPanel: reqKey, name}, botContext) => {
    let botConfig = botContext.botConfig;

    if (name === "GAUGE") {
        let gauges = [];
        if (reqKey !== "_ALL_GAUGES") {
            gauges.push({subPanel: reqKey, gaugeKey: reqKey, ...botConfig.gauges[reqKey]});
        } else {
            gauges = Object.keys(botConfig.gauges).map((key) => {
                let gauge = botConfig.gauges[key];

                return {
                    subPanel: reqKey,
                    gaugeKey: key,
                    ...gauge
                }
            });
        }

        for (let gauge of gauges) {
            if (!gauge) {
                return;
            }

            console.log("GAUGE: " + JSON.stringify(gauge, null, 5));

            let {label, subPanel, gaugeKey, currentValue, maxValue, increaseSound, decreaseSound, completeSound, type} = gauge;

            let {url: increaseSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === increaseSound);
            let {url: decreaseSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === decreaseSound);
            let {url: completeSoundUrl} = botContext.botConfig.audioPool.find(audio => audio.id === completeSound);

            if (type === "SUB") {
                currentValue = (await Xhr.getSubscriptionMeta(botContext.botConfig)).total;
                console.log("SUB: " + currentValue);
            }

            EventQueue.sendEventToOverlays("GAUGE", {
                label,
                currentValue,
                maxValue,
                subPanel,
                gaugeKey,
                increaseSoundUrl,
                decreaseSoundUrl, 
                completeSoundUrl,
                init: true
            });
        }
    }
}