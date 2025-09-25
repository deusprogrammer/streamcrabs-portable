const path = require('path');
const fs = require('fs');
const axios = require('axios');
const OpenAI = require('openai');

const eventQueue = require('./bot/components/base/eventQueue');

const { app, ipcMain, protocol, BrowserWindow } = require('electron');

const { runImageServer } = require('./fileServer');
const { StreamcrabsBot, AIChatBot } = require('./bot/bot');
const { CameraObscuraPlugin } = require('./bot/botPlugins/cameraObscura');
const { migrateConfig } = require('./migration');

const { getTwitchAuth, refreshAccessToken } = require('./twitchAuth');

const HOME =
    process.platform === 'darwin'
        ? `${process.env.HOME}/.streamcrabs` || '/'
        : `${process.env.HOMEDRIVE}${process.env.HOMEPATH}/AppData/Local/streamcrabs`;
const MEDIA_DIRECTORY = path.join(HOME, "media");
const CONFIG_FILE = path.join(HOME, "config.json");
const MIGRATION_FILE = path.join(HOME, "migration.json");
const USER_DATA_FILE = path.join(HOME, "config.json");
const DEFAULT_FILE_SERVER_PORT = "8080";
const ENV = process.env.RUNTIME_ENV || "prod";

console.log("ENV:         " + ENV);
console.log("HOME:        " + HOME);
console.log("CONFIG FILE: " + CONFIG_FILE);

if (!fs.existsSync(HOME)) {
    console.log("HOME NOT FOUND");
    fs.mkdirSync(HOME, {recursive: true});
}

if (!fs.existsSync(MEDIA_DIRECTORY)) {
    console.log("MEDIA DIRECTORY NOT FOUND");
    fs.mkdirSync(MEDIA_DIRECTORY, {recursive: true});
}

if (!fs.existsSync(CONFIG_FILE)) {
    console.log("CONFIG FILE NOT FOUND");
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({
        "videoPool": [],
        "audioPool": [],
        "imagePool": [],
        "dynamicAlerts": [],
        "alertConfigs": {
             "raidAlert": {},
             "subAlert": {},
             "cheerAlert": {},
             "followAlert": {}
        },
        "redemptions": {},
        "gauges": {},
        "commands": {},
        "twitchChannel": "",
        "broadcasterId": "",
        "profileImage": "",
        "accessToken": "",
        "refreshToken": "",
        "defaultBotUser": null,
        "botUsers": {},
        "clientId": "z9sxe9lmchklcfoqpcaoe1fo8a660e",
        "clientSecret": "ebtdjo3gx50d5qyk331mn6rrzh5wlx",
   }));
}

let config = JSON.parse(fs.readFileSync(CONFIG_FILE).toString());
let userData = JSON.parse(fs.readFileSync(USER_DATA_FILE).toString());
let bots = {};
let uiLocked = false;

const uuidv4 = () => {
    return Date.now().toString();
}

if (!config.clientId || !config.clientSecret) {
    config.clientId = process.env.TWITCH_CLIENT_ID;
    config.clientSecret = process.env.TWITCH_CLIENT_SECRET;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config));
}

let win;
const createWindow = async () => {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            webSecurity: false,
            preload: path.join(__dirname, "preload.js") // use a preload script
        },
    });
    // and load the index.html of the app.
    if (ENV === "dev"){
        //for dev
        win.loadURL('http://localhost:3000/');
    } else if (ENV === "prod" || ENV === "production"){
        const url = require('url').format({
            protocol: 'file',
            slashes: true,
            pathname: require('path').join(__dirname, '../build/index.html')
          })
          win.loadURL(url)
    } else {
        throw new Error("wrong env");
    }

    // win.webContents.setWindowOpenHandler((e, url) => {
    //     e.preventDefault();
    //     shell.openExternal(url);
    // });

    protocol.interceptFileProtocol('app', function (request, callback) {
        let url = request.url.substr(6);
        let dir = path.normalize(path.join(HOME, url));
        console.log("FILE: " + url);
        console.log("PATH: " + dir);
        callback(dir);
    }, function (err) {
        if (err) {
            console.error('Failed to register protocol');
        }
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
    let port = await runImageServer(HOME, DEFAULT_FILE_SERVER_PORT);
    config.imageServerPort = port;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 5));
    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

const twitchRefresh = async () => {
    try {
        let {access_token, refresh_token} = await refreshAccessToken(config.clientId, config.clientSecret, config.refreshToken);
        config.accessToken = access_token;
        config.refreshToken = refresh_token;
        fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    } catch (e) {
        console.error("Twitch refresh failed: " + e);
    }
}

const twitchRefreshBotUser = async (userName) => {
    let botUser = config.botUsers[userName];

    if (!botUser) {
        return null;
    }

    try {
        let {access_token, refresh_token} = await refreshAccessToken(config.clientId, config.clientSecret, botUser.refreshToken);
        if (!config.botUsers) {
            config.botUsers = {};
        }

        config.botUsers[userName] = {
            ...botUser,
            accessToken: access_token,
            refreshToken: refresh_token
        }
        fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    } catch (e) {
        console.error("Twitch refresh failed: " + e);
    }
}

const twitchLogin = async () => {
    try {
        let twitchAuth = await getTwitchAuth(config.clientId, config.clientSecret, true);
        
        if (!config.botUsers) {
            config.botUsers = {};
        }

        config.botUsers[twitchAuth.username] = {...twitchAuth, aiSettings: {}};

        config.accessToken = twitchAuth.accessToken;
        config.refreshToken = twitchAuth.refreshToken;
        config.twitchChannel = twitchAuth.username;
        config.profileImage = twitchAuth.profileImage;
        config.broadcasterId = twitchAuth.id;
        fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    } catch (e) {
        console.error("Twitch logon failed: " + e);
    }
}

const twitchLoginBotUser = async () => {
    try {
        let twitchAuth = await getTwitchAuth(config.clientId, config.clientSecret, true);
        if (!config.botUsers) {
            config.botUsers = {};
        }

        config.botUsers[twitchAuth.username] = {...twitchAuth, aiSettings: {}};

        fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    } catch (e) {
        console.error("Twitch logon failed: " + e);
    }
}

if (config.clientId && config.clientSecret && config.accessToken && config.refreshToken) {
    twitchRefresh();

    Object.keys(config.botUsers || {}).forEach((botUser) => {
        twitchRefreshBotUser(botUser);
    });
}

// Bridged functionality

ipcMain.handle('updateUiLock', (event, locked) => {
    uiLocked = locked;
})

ipcMain.handle('getUiLock', () => {
    return uiLocked;
});

ipcMain.handle('startBot', async(event, botUser) => {
    if (botUser in bots) {
        return;
    }

    let bot;

    if (config.botUsers[botUser].role === 'twitch-bot') {
        bot = new StreamcrabsBot(config, botUser, [CameraObscuraPlugin]);
    } else if (config.botUsers[botUser].role === 'chat-bot') {
        bot = new AIChatBot(config, botUser);
    }

    bots[botUser] = bot;
    await bot.start();
});

ipcMain.handle('stopBot', async (event, botUser) => {
    if (!(botUser in bots)) {
        return;
    }

    await bots[botUser].stop();
    delete bots[botUser];
});

ipcMain.handle('getBotRunning', () => {
    let botsRunning = {};
    for (let bot in bots) {
        botsRunning[bot] = bots[bot] ? true : false;
    }
    return botsRunning;
});

ipcMain.handle('login', async () => {
    try {
        await twitchLogin();
        return true;
    } catch (e) {
        console.error('Unable to retrieve access token: ' + e);
        return false;
    }
});

ipcMain.handle('loginBotUser', async () => {
    try {
        await twitchLoginBotUser();
        return true;
    } catch (e) {
        console.error('Unable to retrieve access token: ' + e);
        return false;
    }
});

ipcMain.handle('saveDefaultBotUser', async (event, {defaultBotUser}) => {
    config = {...config, defaultBotUser};
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
});

ipcMain.handle('deleteBotUser', async (event, botUserName) => {
    delete config.botUsers[botUserName];
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
});

ipcMain.handle('storeMedia', (event, {imagePayload, extension}) => {
    let buffer = Buffer.from(imagePayload, "base64");
    let filename = Date.now() + extension;
    let filePath = path.normalize(`${MEDIA_DIRECTORY}/${filename}`);
    fs.writeFileSync(filePath, buffer);
    return `app://media/${filename}`;
});

ipcMain.handle('updateEnableList', (event, enabled) => {
    config = {...config, enabled};
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    return;
});

ipcMain.handle('saveDynamicAlert', (event, dynamicAlert) => {
    if (dynamicAlert.id) {
        let index = config.dynamicAlerts.findIndex(({id: alertId}) => alertId === dynamicAlert.id);
        config.dynamicAlerts[index] = dynamicAlert;
    } else {
        dynamicAlert.id = uuidv4();
        config.dynamicAlerts.push(dynamicAlert);
    }
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    return dynamicAlert.id;
});

ipcMain.handle('removeDynamicAlert', (event, dynamicAlert) => {
    let index = config.dynamicAlerts.findIndex(({id: alertId}) => alertId === dynamicAlert.id);
    config.dynamicAlerts.splice(index, 1);
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    return;
});

ipcMain.handle('getDynamicAlert', (event, id) => {
    return config.dynamicAlerts.find(({id: alertId}) => alertId === id);
});

ipcMain.handle('updateVideoPool', (event, videoPool) => {
    if (!config.videoPool) {
        config.videoPool = [];
    }
    config.videoPool = videoPool;
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    return;
});

ipcMain.handle('updateAudioPool', (event, audioPool) => {
    if (!config.audioPool) {
        config.audioPool = [];
    }
    config.audioPool = audioPool;
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    return;
});

ipcMain.handle('updateImagePool', (event, imagePool) => {
    if (!config.imagePool) {
        config.imagePool = [];
    }
    config.imagePool = imagePool;
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
    return;
});

ipcMain.handle('updateUserData', (event, update) => {
    userData[update.username] = update.data;
    return;
});

ipcMain.handle('getUserData', (event) => {
    return userData;
});

ipcMain.handle('updateAlerts', (event, alertConfigs) => {
    config.alertConfigs = alertConfigs;
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
});

ipcMain.handle('updateCommands', (event, commands) => {
    config.commands = commands;
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
});

ipcMain.handle('saveCommand', (event, commandConfig) => {
    commandConfig.config.target = parseInt(commandConfig.config.target);
    config.commands[commandConfig.key] = commandConfig.config;
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
});

ipcMain.handle('removeCommand', (event, key) => {
    delete config.commands[key];
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
});

ipcMain.handle('updateRedemptions', (event, redemptions) => {
    config.redemptions = redemptions;
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
});

ipcMain.handle('updateGauges', (event, gauges) => {
    config.gauges = gauges;
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
});

ipcMain.handle('getBotConfig', () => {
    return config;
});

ipcMain.handle('storeBotConfig', (event, botConfig) => {
    config = botConfig;
    console.log("BOT CONFIG: " + JSON.stringify(botConfig, null, 2));
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
});

ipcMain.handle('checkMigration', async () => {
    return fs.existsSync(MIGRATION_FILE);
});

ipcMain.handle('migrate', async (event, migrationKey) => {
    if (fs.existsSync(MIGRATION_FILE)) {
        console.log("MIGRATION FILE EXISTS");
        let migrationJSON = fs.readFileSync(MIGRATION_FILE);
        let migrationData = JSON.parse(migrationJSON);
        
        config = await migrateConfig(migrationData, HOME);
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 5));
        
        return;
    }
    let res = await axios.get(`https://deusprogrammer.com/api/streamcrabs/migrations/${migrationKey}`);
    fs.writeFileSync(MIGRATION_FILE, Buffer.from(JSON.stringify(res.data, null, 5)));
    
    config = await migrateConfig(res.data, HOME);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 5));

    return;
});

ipcMain.handle('getLlmList', async (event, domain) => {
    try {
        const { data } = await axios.get(`${domain}/api/tags`);
        return data.models;
    } catch (e) {
        return [];
    }
});

ipcMain.handle('fireOverlayEvent', (event, {type, eventData}) => {
    eventQueue.sendEventToOverlays(type, eventData);
});

// In your main process (where other IPC handlers are)
ipcMain.handle('getOpenAIModels', async (event, apiKey, baseURL = 'https://api.openai.com/v1') => {
    try {
        const openai = new OpenAI({
            apiKey,
            baseURL
        });
        
        const response = await openai.models.list();
        return response.data; // Array of model objects
    } catch (error) {
        console.error('Error fetching OpenAI models:', error);
        throw error;
    }
});

ipcMain.on('updateGauges', (event, gauges) => {
    config.gauges = gauges;
    fs.writeFileSync(CONFIG_FILE, Buffer.from(JSON.stringify(config, null, 5)));
});