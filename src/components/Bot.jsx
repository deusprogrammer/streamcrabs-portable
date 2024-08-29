import React, { useEffect, useState } from 'react';
import { useConfig } from '../hooks/BotConfigHook';
import { toast } from'react-toastify';

const Settings = () => {
    const [botConfig, updateBotConfig, refreshBotConfig] = useConfig();
    const [animationSubPanel, setAnimationSubPanel] = useState('default');
    const [selectedBot, setSelectedBot] = useState(null);
    const [aiSettings, setAiSettings] = useState({
        aiEnabled: false,
        aiModerationEnabled: false,
        llmModel: "llama3.1",
        llmUrl: "http://localhost:11434",
        chatBotPersonalityPrompt: "",
        moderationLlmModel: "llama-guard3.1",
        moderationLlmUrl: "http://localhost:11434",
        violencePrompt: "",
        sexualPrompt: "",
        politicalPrompt: "",
        racialPrompt: "",
    });

    const loginBotUser = async () => {
        await window.api.send('loginBotUser');
        refreshBotConfig();
    }

    const onChangeSelectedBotUser = (botUser) => {
        setSelectedBot(botUser);
        saveAiSettings();
    }

    const deleteBotUser = async  (botUser) => {
        await window.api.send('deleteBotUser', botUser);
        if (botUser === botConfig.defaultBotUser) {
            await window.api.send('saveDefaultBotUser', {defaultBotUser: botConfig.twitchChannel});
        }
        refreshBotConfig();
    }

    const updateAiSetting = (setting, value) => {
        const newAiSettings = {...aiSettings};
        newAiSettings[setting] = value;
        setAiSettings({...newAiSettings});
    }

    const saveAiSettings = async () => {
        toast.info('Saving AI Settings...');
        let botUsers = {...botConfig.botUsers};
        botUsers[selectedBot] = {...botUsers[selectedBot], aiSettings};
        await updateBotConfig({...botConfig, botUsers});
        toast.info('AI settings saved!');
    }

    useEffect(() => {
        if (botConfig?.aiSettings) {
            setAiSettings(botConfig?.aiSettings[selectedBot]);
        }
        if (!selectedBot) {
            setSelectedBot(botConfig?.twitchChannel);
        }
    }, [botConfig, selectedBot]);

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
                <select value={selectedBot} onChange={e => onChangeSelectedBotUser(e.target.value)}>
                    {Object.keys(botConfig?.botUsers || {}).map(userName => {
                        return (<option key={`llm-bot-${userName}`} value={userName}>{userName}</option>);
                    })}
                </select>
                <div>
                    <input type="checkbox" checked={aiSettings.aiEnabled} onChange={(e) => updateAiSetting('aiEnabled', e.target.checked)} />
                    <label>Enable Bot Personality</label>
                </div>
                <label>LLM Server URL</label>
                <input type="text" value={aiSettings.llmUrl} onChange={(e) => {updateAiSetting('llmUrl', e.target.value)}} />
                <label>Model</label>
                <select value={aiSettings.llmModel} onChange={(e) => {updateAiSetting('llmModel', e.target.value)}}>
                    <option>llama3.1</option>
                </select>
                <label>Personality prompt</label>
                <textarea onChange={(e) => {updateAiSetting('chatBotPersonalityPrompt', e.target.value)}} value={aiSettings.chatBotPersonalityPrompt}></textarea>
                <h3>Moderation</h3>
                <div>
                    <input type="checkbox" checked={aiSettings.aiModerationEnabled} onChange={(e) => updateAiSetting('aiModerationEnabled', e.target.checked)} /><label>Enable AI Moderation</label>
                </div>
                <label>LLM Server URL</label>
                <input type="text" value={aiSettings.moderationLlmUrl} />
                <label>Model</label>
                <select value={aiSettings.moderationLlmModel} onChange={(e) => {updateAiSetting('moderationLlmModel', e.target.value)}}>
                    <option>llama-guard3.1</option>
                </select>
                <h4>Examples of Prohibited Content</h4>
                <label>Sexual</label>
                <input type="text" value={aiSettings.sexualPrompt} onChange={(e) => {updateAiSetting('sexualPrompt', e.target.value)}} />
                <label>Racial</label>
                <input type="text" value={aiSettings.racialPrompt} onChange={(e) => {updateAiSetting('racialPrompt', e.target.value)}} />
                <label>Political</label>
                <input type="text" value={aiSettings.politicalPrompt} onChange={(e) => {updateAiSetting('politicalPrompt', e.target.value)}} />
                <label>Violence</label>
                <input type="text" value={aiSettings.violencePrompt} onChange={(e) => {updateAiSetting('violencePrompt', e.target.value)}} />
                <button onClick={() => {saveAiSettings()}}>Save AI Settings</button>
            </div>
        </div>
    )
}

export default Settings;