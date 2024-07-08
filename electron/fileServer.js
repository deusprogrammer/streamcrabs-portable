const express = require('express');
const path = require('path');
const portFinder = require('portfinder');

const app = express();

const runImageServer = async (root, defaultPort) => {
    let mediaPath = path.join(root, 'media');
    app.use(express.json({limit: "50Mb"}))
    app.use("/media", express.static(mediaPath));
    app.use(express.static(path.join(__dirname, 'overlay')));
    app.get('*', (req,res) =>{
        res.sendFile(path.join(__dirname, 'overlay/index.html'));
    });

    let port = await portFinder.getPortPromise({port: defaultPort});
    app.listen(port);

    console.log("FILE SERVER STARTED");
    console.log("MEDIA PATH: " + mediaPath);
    console.log("PORT:       " + port);

    return port;
}

module.exports = {
    runImageServer
};