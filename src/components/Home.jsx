import React, {useState, useEffect} from 'react';
import { getBotConfig } from '../api/StreamCrabsApi';

const Home = () => {
    const [botStarted, setBotStarted] = useState(false);
    const [config, setConfig] = useState(null);
    const [selectedBotUser, setSelectedBotUser] = useState("_broadcaster")

    useEffect(() => {
        (async () => {
            let config = await getBotConfig();
            let botStarted = await window.api.send("getBotRunning");
            setBotStarted(botStarted);
            setConfig(config);
            setSelectedBotUser(config.defaultBotUser);
        })();
    }, []);

    const startBot = () => {
        window.api.send(`startBot`, {selectedBotUser});
        setBotStarted(true);
    }

    const stopBot = () => {
        window.api.send(`stopBot`);
        setBotStarted(false);
    }

    const onSelectBot = async (defaultBotUser) => {
        await window.api.send('saveDefaultBotUser', {defaultBotUser});
        setSelectedBotUser(defaultBotUser);
    }

    return (
        <div className="splash-screen">
            <img className="streamcrab-logo" alt="streamcrab logo" src={`${process.env.PUBLIC_URL}/crab.png`} /><br />
            <div>
                <label>Launch bot as:</label>
                <select value={selectedBotUser} onChange={(e) => {onSelectBot(e.target.value)}}>
                    {Object.keys(config?.botUsers || {}).map(userName => {
                        return <option key={`bot-user-${userName}`} value={`${userName}`}>{userName}</option>;
                    })}
                </select>
            </div>
            <br />
            {!botStarted ? 
                <button style={{width: "200px", height: "100px", fontSize: "20pt", background: "green", color: "white"}} onClick={startBot}>Start Bot</button> 
                :
                <button style={{width: "200px", height: "100px", fontSize: "20pt", background: "red", color: "white"}} onClick={stopBot}>Stop Bot</button>
            }
        </div>
    )
};

export default Home;