import { useEffect, useState } from "react";
import { getBotConfig, storeBotConfig } from "../api/StreamCrabsApi";

export const useConfig = () => {
    const [config, setConfig] = useState(null);

    const updateConfig = async (newConfig) => {
        await storeBotConfig(newConfig);
        setConfig(newConfig);
    }

    const refreshConfig = async () => {
        let botConfig  = await getBotConfig();
        setConfig(botConfig);
    }

    useEffect(() => {
        (async () => {
            let botConfig = await getBotConfig();
            setConfig(botConfig);
        })();
    }, []);

    return [config, updateConfig, refreshConfig];
}

export const useBots = () => {
    const [botRunning, setBotRunning] = useState({});
    
    useEffect(() => {
        pullBots();
    }, []);

    const pullBots = async () => {
        let tmp = await window.api.send("getBotRunning");
        console.log("RUNNING " + JSON.stringify(tmp, null, 5));
        setBotRunning(tmp);
    }

    const startBot = async (userName) => {
        console.log(`STARTING ${userName}`);
        await window.api.send(`startBot`, userName);
        console.log("BOT STARTED");
        pullBots();
    }

    const stopBot = async (userName) => {
        console.log(`STOPPING ${userName}`);
        await window.api.send(`stopBot`, userName);
        console.log("BOT STARTED");
        pullBots();
    }
    
    return [botRunning, startBot, stopBot];
}