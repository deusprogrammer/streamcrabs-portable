import React, { useEffect, useState } from 'react';
import { useConfig } from '../hooks/BotConfigHook';

const Settings = () => {
    const [botConfig, , refreshBotConfig] = useConfig();
    const [animationSubPanel, setAnimationSubPanel] = useState('default');

    const loginBotUser = async () => {
        await window.api.send('loginBotUser');
        refreshBotConfig();
    }

    const deleteBotUser = async  (botUser) => {
        await window.api.send('deleteBotUser', botUser);
        if (botUser === botConfig.defaultBotUser) {
            await window.api.send('saveDefaultBotUser', {defaultBotUser: botConfig.twitchChannel});
        }
        refreshBotConfig();
    }

    useEffect(() => {
    }, []);

    return (
        <div>
            <h1>Settings</h1>
            <h2>Overlay URLs</h2>
            <p>Bring the below into your XSplit or OBS presentation layouts to show monsters and battle notifications.  It is recommended to place the encounter panel on either side of the screen, and the notification panel on the top or bottom of the screen.</p>
            <div style={{display: "table"}}>
                <div style={{display: "table-row"}}>
                    <div style={{display: "table-cell", padding: "10px", fontWeight: "bolder"}}>Death Counter Panel:</div>
                    <div style={{display: "table-cell", padding: "10px"}}><input type="text" value={`http://localhost:${botConfig?.imageServerPort}/overlays/death-counter`} style={{width: "400px"}} /></div>
                </div>
                <div style={{display: "table-row"}}>
                    <div style={{display: "table-cell", padding: "10px", fontWeight: "bolder"}}>Request Panel:</div>
                    <div style={{display: "table-cell", padding: "10px"}}><input type="text" value={`http://localhost:${botConfig?.imageServerPort}/overlays/requests`} style={{width: "400px"}} /></div>
                </div>
                <div style={{display: "table-row"}}>
                    <div style={{display: "table-cell", padding: "10px", fontWeight: "bolder"}}>Soundboard:</div>
                    <div style={{display: "table-cell", padding: "10px"}}><input type="text" value={`http://localhost:${botConfig?.imageServerPort}/overlays/sound-player`} style={{width: "400px"}} /></div>
                </div>
                <div style={{display: "table-row"}}>
                    <div style={{display: "table-cell", padding: "10px", fontWeight: "bolder"}}>Animation Overlay:</div>
                    <div style={{display: "table-cell", padding: "10px"}}><input type="text" value={`http://localhost:${botConfig?.imageServerPort}/overlays/multi${animationSubPanel ? `?subPanel=${animationSubPanel}` : ''}`} style={{width: "400px"}} /></div>
                    <div><input type="text" value={animationSubPanel} onChange={(e) => setAnimationSubPanel(e.target.value)} /></div>
                </div>
            </div>
            <h2>Bot Users</h2>
            <table>
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(botConfig?.botUsers || {}).map(userName => {
                        return <tr key={`bot-user-${userName}`} >
                            <td>{userName}</td>
                            {botConfig.twitchChannel !== userName ? <td><button onClick={() => {deleteBotUser(userName)}}>Delete</button></td> : <td></td>}
                        </tr>;
                    })}
                </tbody>
            </table>
            <button onClick={() => {loginBotUser()}}>Add Bot User</button>
            <h2>AI Integration</h2>
            <div style={{display: 'flex', flexDirection:'column'}}>
                <h3>LLM Settings</h3>
                <div>
                    <input type="checkbox" />
                    <label>Enable Bot Personality</label>
                </div>
                <label>LLM Server URL</label>
                <input type="text" value={"http://localhost:11434"} />
                <label>Model</label>
                <select>
                    <option>llama3.1</option>
                </select>
                <label>Personality prompt</label>
                <textarea value={""} />
                <h3>Moderation</h3>
                <div>
                    <input type="checkbox" /><label>Enable AI Moderation</label>
                </div>
                <label>LLM Server URL</label>
                <input type="text" value={"http://localhost:11434"} />
                <label>Model</label>
                <select>
                    <option>llama-guard3</option>
                </select>
                <h4>Examples of Prohibited Content</h4>
                <label>Sexual</label>
                <input type="text" />
                <label>Racial</label>
                <input type="text" />
                <label>Political</label>
                <input type="text" />
                <label>Violence</label>
                <input type="text" />
            </div>
        </div>
    )
}

export default Settings;