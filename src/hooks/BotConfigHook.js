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