const axios = require('axios');
const { BrowserWindow } = require('electron');

const getTwitchUser = async (clientId, username, accessToken) => {
    let url = `https://api.twitch.tv/helix/users`;
    if (username) {
        url += `?login=${username}`;
    }
    let [{login, id, profile_image_url}] = (await axios.get(url, {
        headers: {
            "authorization": `Bearer ${accessToken}`,
            "client-id": clientId
        }
    })).data.data;

    return {twitchChannel: login, profileImage: profile_image_url, id};
}

const getAccessToken = async (clientId, clientSecret, code) => {
    try {
        let res = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=http://localhost`);
        return res.data;
    } catch (error) {
        console.error("Call to get access token failed! " + error.message);
        throw error;
    }
}

const validateAccessToken = async (accessToken) => {
    let res = await axios.get(`https://id.twitch.tv/oauth2/validate`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });

    return res.data;
}

const refreshAccessToken = async (clientId, clientSecret, refreshToken) => {
    var params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', encodeURIComponent(refreshToken));
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    let res = await axios.post(`https://id.twitch.tv/oauth2/token`, params, {responseType: "json"});

    return res.data;
}

const getTwitchAuth = (clientId, clientSecret, forceVerify = false) => {
    const win = new BrowserWindow({ width: 800, height: 600 });

    // Load a remote URL
    win.loadURL(`https://id.twitch.tv/oauth2/authorize?force_verify=${forceVerify ? 'true' : 'false'}&response_type=code&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=http://localhost&scope=chat%3Aread%20chat%3Aedit%20channel%3Aread%3Aredemptions%20channel%3Aread%3Asubscriptions%20bits%3Aread%20channel%3Amanage%3Aredemptions%20moderator%3Aread%3Afollowers`);

    win.show();

    return new Promise((resolve, reject) => {
        win.webContents.on('will-navigate',async (event, newUrl) => {
            console.log(newUrl);

            if (newUrl.startsWith("http://localhost/")) {
                win.close();

                newUrl = newUrl.replace("http://localhost/?", "");
                const queryPairs = newUrl.split("&");
                let code = "";
                queryPairs.forEach(pair => {
                    let [key, value] = pair.split("=");
                    console.log(`${key} = ${value}`);
                    if (key === "code") {
                        code = value;
                    }
                });

                if (!code) {
                    return;
                }

                const {access_token: accessToken, refresh_token: refreshToken} = await getAccessToken(clientId, clientSecret, code);

                console.log("Retrieved access token: " + accessToken);

                let {twitchChannel, profileImage, id} = await getTwitchUser(clientId, null, accessToken);

                resolve({username: twitchChannel, profileImage, id, accessToken, refreshToken});
            }
        });
    });
}

module.exports = {
    getAccessToken,
    refreshAccessToken,
    validateAccessToken,
    getTwitchAuth,
    getTwitchUser
}