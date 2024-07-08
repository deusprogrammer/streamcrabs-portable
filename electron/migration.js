const fs = require("fs");
const { default: axios } = require("axios");
const path = require("path");

const downloadFile = async (asset, storeTo) => {
    // Download file and write to file
    let response = await axios.get(asset.url,
        {
            responseType: 'arraybuffer',
            headers: {
                'Accept': 'application/octet-stream'
            }
        }
    );
    let localUrl = path.join(storeTo, `${asset._id}.${asset.extension}`);
    fs.writeFileSync(localUrl, response.data);
    return `app://media/${asset._id}.${asset.extension}`;
}

const reorderObjectKeys = (object, order) => {
    let reorderedObject = {};
    for (let key of order) {
        console.log("WRITING " + key);
        reorderedObject[key] = object[key];
    }

    return reorderedObject;
}

module.exports.migrateConfig = async (migratedConfig, homeDirectory) => {
    const DOWNLOAD_DIRECTORY = path.join(homeDirectory, "media");
    const CONFIG_FILE = path.join(homeDirectory, "config.json");
    const ORDER = [
        "videoPool",
        "audioPool",
        "imagePool",
        "dynamicAlerts",
        "alertConfigs",
        "redemptions",
        "gauges",
        "commands",
        "config",
        "imageServerPort",
        "clientId",
        "clientSecret",
        "twitchChannel",
        "broadcasterId",
        "profileImage",
        "accessToken",
        "refreshToken"
    ];
    let localConfigObject = JSON.parse(fs.readFileSync(CONFIG_FILE).toString());

    // Insert video clips
    for (let asset of migratedConfig.videoPool) {
        let url = await downloadFile({...asset, extension: 'mp4'}, DOWNLOAD_DIRECTORY);

        let newAsset = {
            ...asset,
            id: asset._id,
            url
        };
        delete newAsset._id;
        if (!localConfigObject.videoPool) {
            localConfigObject.videoPool = [];
        }
        localConfigObject.videoPool.push(newAsset);
    }

    // Insert audio clips
    for (let asset of migratedConfig.audioPool) {
        let url = await downloadFile({...asset, extension: 'mp3'}, DOWNLOAD_DIRECTORY);

        let newAsset = {
            ...asset,
            id: asset._id,
            url
        };
        delete newAsset._id;
        if (!localConfigObject.audioPool) {
            localConfigObject.audioPool = [];
        }
        localConfigObject.audioPool.push(newAsset);
    }

    // Insert images
    for (let asset of migratedConfig.imagePool) {
        let url = await downloadFile({...asset, extension: 'gif'}, DOWNLOAD_DIRECTORY);

        let newAsset = {
            ...asset,
            id: asset._id,
            url
        };
        delete newAsset._id;
        if (!localConfigObject.imagePool) {
            localConfigObject.imagePool = [];
        }
        localConfigObject.imagePool.push(newAsset);
    }

    // Insert dynamic alerts
    for (let dynamicAlert of migratedConfig.dynamicAlerts) {
        let newDynamicAlert = {...dynamicAlert, id: dynamicAlert._id, sprites: []};
        delete newDynamicAlert._id;
        for (let sprite of dynamicAlert.sprites) {
            let url = await downloadFile({...sprite, extension: 'png', url: sprite.file}, DOWNLOAD_DIRECTORY);
            let newSprite = {
                ...sprite,
                id: sprite._id,
                file: url
            };
            delete newSprite._id;
            delete newSprite.url;
            newDynamicAlert.sprites.push(newSprite);
        }

        let url = await downloadFile({...dynamicAlert.music, extension: 'mp3', url: dynamicAlert.music.file}, DOWNLOAD_DIRECTORY);
        let music = {
            ...dynamicAlert.music,
            id: dynamicAlert.music._id,
            file: url
        };
        delete music._id;
        delete music.url;
        newDynamicAlert.music = music;

        url = await downloadFile({...dynamicAlert.leavingSound, extension: 'mp3', url: dynamicAlert.leavingSound.file}, DOWNLOAD_DIRECTORY);
        let leavingSound = {
            ...dynamicAlert.leavingSound,
            id: dynamicAlert.leavingSound._id,
            file: url
        };
        delete leavingSound._id;
        delete leavingSound.url;
        newDynamicAlert.leavingSound = leavingSound;

        localConfigObject.dynamicAlerts.push(newDynamicAlert);
    }

    // Update alerts
    for (let key in migratedConfig.alertConfigs) {
        if (!localConfigObject.alertConfigs) {
            localConfigObject.alertConfigs = {};
        }

        localConfigObject.alertConfigs[key] = migratedConfig.alertConfigs[key];
        delete localConfigObject.alertConfigs[key]._id;
    }

    // Update gauges
    for (let key in migratedConfig.gauges) {
        if (!localConfigObject.gauges) {
            localConfigObject.gauges = {};
        }

        localConfigObject.gauges[key] = {...migratedConfig.gauges[key]};
        delete localConfigObject.gauges[key]._id;
    }

    // Copy over redemptions
    for (let key in migratedConfig.redemptions) {
        if (!localConfigObject.redemptions) {
            localConfigObject.redemptions = {};
        }

        localConfigObject.redemptions[key] = {...migratedConfig.redemptions[key]};
        delete localConfigObject.redemptions[key]._id;
    }

    // Copy over commands
    for (let key in migratedConfig.commands) {
        if (!localConfigObject.commands) {
            localConfigObject.commands = {};
        }

        localConfigObject.commands[key] = {...migratedConfig.commands[key]};
        delete localConfigObject.commands[key]._id;
    }

    return reorderObjectKeys(localConfigObject, ORDER);
}