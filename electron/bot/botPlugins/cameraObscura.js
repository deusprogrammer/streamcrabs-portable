const { ipcMain } = require('electron');
const Xhr = require('../components/base/xhr');
const { BotPlugin } = require('../botPlugin');

module.exports.CameraObscuraPlugin = class CameraObscuraPlugin extends BotPlugin {
    redemptionTypeMap = {
        VIDEO: "MULTI",
        IMAGE: "MULTI",
        DYNAMIC: "MULTI",
        AUDIO: "SOUND_PLAYER"
    };
    
    updateGauge = (gauges) => {
        ipcMain.emit('updateGauges', gauges);
    }
    
    performAction = async (type, id, soundId, subPanel, message) => {
        if (type === "VIDEO") {
            let video;
            if (id === null) {
                let enabledVideo = this.botContext.botConfig.videoPool.filter((element) => {
                    return element.enabled;
                });
                let n = Math.floor((Math.random() * enabledVideo.length));
                video = enabledVideo[n];
            } else {
                video = this.botContext.botConfig.videoPool.find(video => video.id === id);
            }
    
            let {url, volume, chromaKey} = video;
    
            url = url.replace("app://", `/`);
    
            if (!volume) {
                volume = 1.0;
            }
    
            this.eventListener.sendEventToOverlays(type, {
                url,
                message,
                chromaKey,
                volume,
                subPanel
            });
        } else if (type === "AUDIO") {
            let audio;
            if (id === null) {
                let enabledAudio = this.botContext.botConfig.audioPool.filter((element) => {
                    return element.enabled;
                });
                let n = Math.floor((Math.random() * enabledAudio.length));
                audio = enabledAudio[n];
            } else {
                audio = this.botContext.botConfig.audioPool.find(audio => audio.id === id);
            }
    
            let {url, volume} = audio;
    
            url = url.replace("app://", `/`);
    
            if (!volume) {
                volume = 1.0;
            }
    
            this.eventListener.sendEventToOverlays(type, {
                url,
                message,
                volume
            });
        } else if (type === "IMAGE") {
            let image;
            if (id === null) {
                let enabledImage = this.botContext.botConfig.imagePool;
                let n = Math.floor((Math.random() * enabledImage.length));
                image = enabledImage[n];
            } else {
                image = this.botContext.botConfig.imagePool.find(image => image.id === id);
            }
    
            let audio;
            if (soundId === null) {
                let enabledAudio = this.botContext.botConfig.audioPool.filter((element) => {
                    return element.enabled;
                });
                let n = Math.floor((Math.random() * enabledAudio.length));
                audio = enabledAudio[n];
            } else {
                audio = this.botContext.botConfig.audioPool.find(audio => audio.id === soundId);
            }
    
            let {url} = image;
            let {url: soundUrl, volume: soundVolume} = audio;
    
            url = url.replace("app://", `/`);
            soundUrl = soundUrl.replace("app://", `/`);
    
            if (!soundVolume) {
                soundVolume = 1.0;
            }
    
            this.eventListener.sendEventToOverlays(type, {
                url,
                message,
                soundUrl,
                soundVolume,
                subPanel
            });
    
            return;
        }
    }
    
    alert = async (message, alertType, {variable}) => {
        const {enabled, type, name, id, soundId, panel} = this.botContext.botConfig.alertConfigs[alertType];
    
        if (!enabled) {
            return;
        }
    
        if (type === "DYNAMIC") {
            let customTheme;
            let theme;
            if (id) {
                theme = "STORED";
                customTheme = this.botContext.botConfig.dynamicAlerts.find(dynamicAlert => dynamicAlert.id === id);
            } else {
                theme = name;
            }
    
            customTheme.sprites.forEach((sprite) => {
                sprite.file = sprite.file.replace("app://", "/");
            });
    
            customTheme.music.file = customTheme.music.file.replace("app://", "/");
            customTheme.leavingSound.file = customTheme.music.file.replace("app://", "/");
            
            this.eventListener.sendEventToOverlays(type, {
                message,
                variable,
                theme,
                customTheme,
                subPanel: panel
            });
        } else {
            this.performAction(type, id, soundId, panel, message);
        }
    }

    getCommands = () => ({
        "!test:raid": (twitchContext, botContext) => {
            console.log("TEST RAID");
            if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
                throw "Only a mod can test raid";
            }

            this.raidHook({username: "test_user", viewers: 100});
        },
        "!test:sub": (twitchContext, botContext) => {
            console.log("TEST SUB");
            if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
                throw "Only a mod can test subs";
            }

            this.subscriptionHook({userName: "test_user", subPlan: 3000});
        },
        "!test:follow": (twitchContext, botContext) => {
            console.log("TEST FOLLOW");
            if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
                throw "Only a mod can test follow";
            }

            this.followHook({userName: "test_user"});
        },
        "!test:cheer": (twitchContext, botContext) => {
            console.log("TEST CHEER");
            if (twitchContext.username !== botContext.botConfig.twitchChannel && !twitchContext.mod) {
                throw "Only a mod can test cheer";
            }

            this.bitsHook({bits: 1000, userName: "test_user"});
        }
    });

    followHook = async ({userName}) => {
        const {enabled, messageTemplate} = this.botContext.botConfig.alertConfigs.followAlert;

        console.log("FOLLOW EVENT: " + userName);

        let alertMessage = `${userName} just followed!`;
        if (messageTemplate) {
            alertMessage = messageTemplate.replace("${username}", userName);
        }

        if (!enabled) {
            return;
        }

        await this.alert(alertMessage, "followAlert", {variable: 1});
    };

    bitsHook = async ({userName, bits}) => {
        const {enabled, messageTemplate} = this.botContext.botConfig.alertConfigs.cheerAlert;
    
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
    
        //         this.eventListener.sendEventToOverlays("GAUGE", {
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
    
        await this.alert(alertMessage, "cheerAlert", {variable: bits});
    };

    subscriptionHook = async ({userName, subPlan}) => {
        const {enabled, messageTemplate} = this.botContext.botConfig.alertConfigs.subAlert;
        let alertMessage = `${userName} subscribed at ${subPlan !== 'prime' ? 'tier ' + subPlan / 1000 : 'prime'}!`;
        if (messageTemplate) {
            alertMessage = messageTemplate.replace("${username}", userName).replace("${subTier}", subPlan !== 'prime' ? subPlan / 1000 : 'prime');
        }
    
        // Get all gauges related to subscription tracking
        const subGauges = Object.keys(this.botContext.botConfig.gauges).filter(key => this.botContext.botConfig.gauges[key].type === "SUB");
        if (subGauges.length > 0) {
            // Refresh token
            const {total: currentValue} = await Xhr.getSubscriptionMeta(this.botContext.botConfig);
            for (const subPanel of subGauges) {
                const {label, maxValue, increaseSound, decreaseSound, completeSound} = this.botContext.botConfig.gauges[subPanel];
    
                let {url: increaseSoundUrl} = this.botContext.botConfig.audioPool.find(audio => audio.id === increaseSound);
                let {url: decreaseSoundUrl} = this.botContext.botConfig.audioPool.find(audio => audio.id === decreaseSound);
                let {url: completeSoundUrl} = this.botContext.botConfig.audioPool.find(audio => audio.id === completeSound);
    
                this.eventListener.sendEventToOverlays("GAUGE", {
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
    
        await this.alert(alertMessage, "subAlert", {variable: 100});
    };

    raidHook = async ({userName, viewers}) => {
        const {enabled, messageTemplate} = this.botContext.botConfig.alertConfigs.raidAlert;
        const alertMessage = messageTemplate.replace("${raider}", userName).replace("${viewers}", viewers);
    
        if (!enabled) {
            return;
        }
    
        await this.alert(alertMessage, "raidAlert", {variable: viewers});
    }

    redemptionHook = async ({rewardId, rewardPrompt, id, rewardTitle, userName}) => {
        let botConfig = this.botContext.botConfig;
    
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
    
                    let {url: increaseSoundUrl} = this.botContext.botConfig.audioPool.find(audio => audio.id === increaseSound);
                    let {url: decreaseSoundUrl} = this.botContext.botConfig.audioPool.find(audio => audio.id === decreaseSound);
                    let {url: completeSoundUrl} = this.botContext.botConfig.audioPool.find(audio => audio.id === completeSound);
    
                    this.eventListener.sendEventToOverlays("GAUGE", {
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
    
                    this.updateGauge(botConfig.gauges);
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
            if (!this.eventListener.isPanelInitialized(this.redemptionTypeMap[type], subPanel)) {
                this.eventListener.sendInfoToChat("Required panel is not available for this stream");
                await Xhr.refundRedemption(rewardId, id, botConfig);
                return;
            }
            this.performAction(type, mediaId, soundId, subPanel, null);
            await Xhr.clearRedemption(rewardId, id, botConfig);
            return;
        }
    
        if (rewardTitle.toUpperCase() === "RANDOM SOUND" || rewardTitle.toUpperCase() === "PLAY RANDOM SOUND") {
            if (!this.eventListener.isPanelInitialized("SOUND_PLAYER")) {
                this.eventListener.sendInfoToChat("Sound panel is not available for this stream");
                await Xhr.refundRedemption(rewardId, id, botConfig);
                return;
            }
            
            this.performAction("AUDIO", null, null, "default", null);
    
            await Xhr.clearRedemption(rewardId, id, botConfig);
        }  else if (rewardTitle.toUpperCase() === "RANDOM VIDEO" || rewardTitle.toUpperCase() === "PLAY RANDOM VIDEO") {
            if (!this.eventListener.isPanelInitialized("MULTI")) {
                this.eventListener.sendInfoToChat("Video panel is not available for this stream");
                await Xhr.refundRedemption(rewardId, id, botConfig);
                return;
            }
    
            this.performAction("VIDEO", null, null, "default", null);
    
            await Xhr.clearRedemption(rewardId, id, botConfig);
        } else if (rewardTitle.toUpperCase() === "BIRD UP") {
            if (!this.eventListener.isPanelInitialized("MULTI")) {
                this.eventListener.sendInfoToChat("Video panel is not available for this stream");
                await Xhr.refundRedemption(rewardId, id, botConfig);
                return;
            }
    
            this.eventListener.sendEventToOverlays("BIRDUP", {subPanel: "default"});
    
            await Xhr.clearRedemption(rewardId, id, botConfig);
        } else if (rewardTitle.toUpperCase() === "BAD APPLE") {
            if (!this.eventListener.isPanelInitialized("MULTI")) {
                this.eventListener.sendInfoToChat("Video panel is not available for this stream");
                await Xhr.refundRedemption(rewardId, id, botConfig);
                return;
            }
    
            this.eventListener.sendEventToOverlays("VIDEO", {
                url: "/videos/badapple.mp4",
                chromaKey: "black",
                volume: "0.8",
                subPanel: "default"
            });
    
            await Xhr.clearRedemption(rewardId, id, botConfig);
        } else if (rewardTitle.toUpperCase() === "BE A BIG SHOT") {
            if (!this.eventListener.isPanelInitialized("MULTI") || !this.eventListener.isPanelInitialized("FILE_WRITER")) {
                this.eventListener.sendInfoToChat("Video panel or filewriter proxy is not available for this stream");
                await Xhr.refundRedemption(rewardId, id, botConfig);
                return;
            }
    
            this.eventListener.sendEventToOverlays("VIDEO", {
                message: `${userName} is a big shot for the week!`,
                url: "/videos/bigshot.mp4",
                chromaKey: null,
                volume: "0.8",
                subPanel: "default"
            });
    
            this.eventListener.sendEventToOverlays("FILE_WRITER", {
                textToWrite: userName,
                fileToWriteTo: "BIG_SHOT"
            });
    
            this.eventListener.sendInfoToChat(`${userName} is now a BIG SHOT!`);
    
            await Xhr.clearRedemption(rewardId, id, botConfig);
        }
    };

    wsInitHook = async ({name, reqKey}) => {
        let botConfig = this.botContext.botConfig;

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

                let {url: increaseSoundUrl} = this.botContext.botConfig.audioPool.find(audio => audio.id === increaseSound);
                let {url: decreaseSoundUrl} = this.botContext.botConfig.audioPool.find(audio => audio.id === decreaseSound);
                let {url: completeSoundUrl} = this.botContext.botConfig.audioPool.find(audio => audio.id === completeSound);

                if (type === "SUB") {
                    currentValue = (await Xhr.getSubscriptionMeta(this.botContext.botConfig)).total;
                    console.log("SUB: " + currentValue);
                }

                this.eventListener.sendEventToOverlays("GAUGE", {
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
    };
}