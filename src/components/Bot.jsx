import React from 'react';
import { getBotConfig } from '../api/StreamCrabsApi';
export default class Bot extends React.Component {
    state = {
        botConfig: {},
        animationSubPanel: "default"
    }

    getPort = async () => {
        let botConfig = await getBotConfig();
        this.setState({botConfig});
    }

    loginBotUser = async () => {
        await window.api.send('loginBotUser');
        let botConfig  = await getBotConfig();
        this.setState({botConfig});
    }

    deleteBotUser = async  (botUser) => {
        await window.api.send('deleteBotUser', botUser);
        if (botUser === this.state.botConfig.defaultBotUser) {
            await window.api.send('saveDefaultBotUser', {defaultBotUser: this.state.botConfig.twitchChannel});
        }
        let botConfig   = await getBotConfig();
        this.setState({botConfig});
    }

    componentDidMount() {
        this.getPort();
    }

    render() {
        return (
            <div>
                <h1>Settings</h1>
                <h2>Bot Users</h2>
                <table>
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(this.state.botConfig?.botUsers || {}).map(userName => {
                            return <tr key={`bot-user-${userName}`} >
                                <td>{userName}</td>
                                {this.state.botConfig.twitchChannel !== userName ? <td><button onClick={() => {this.deleteBotUser(userName)}}>Delete</button></td> : <td></td>}
                            </tr>;
                        })}
                    </tbody>
                </table>
                <button onClick={() => {this.loginBotUser()}}>Add Bot User</button>
                <h2>Overlay URLs</h2>
                <p>Bring the below into your XSplit or OBS presentation layouts to show monsters and battle notifications.  It is recommended to place the encounter panel on either side of the screen, and the notification panel on the top or bottom of the screen.</p>
                <div style={{display: "table"}}>
                    <div style={{display: "table-row"}}>
                        <div style={{display: "table-cell", padding: "10px", fontWeight: "bolder"}}>Death Counter Panel:</div>
                        <div style={{display: "table-cell", padding: "10px"}}><input type="text" value={`http://localhost:${this.state.botConfig?.imageServerPort}/overlays/death-counter`} style={{width: "400px"}} /></div>
                    </div>
                    <div style={{display: "table-row"}}>
                        <div style={{display: "table-cell", padding: "10px", fontWeight: "bolder"}}>Request Panel:</div>
                        <div style={{display: "table-cell", padding: "10px"}}><input type="text" value={`http://localhost:${this.state.botConfig?.imageServerPort}/overlays/requests`} style={{width: "400px"}} /></div>
                    </div>
                    <div style={{display: "table-row"}}>
                        <div style={{display: "table-cell", padding: "10px", fontWeight: "bolder"}}>Soundboard:</div>
                        <div style={{display: "table-cell", padding: "10px"}}><input type="text" value={`http://localhost:${this.state.botConfig?.imageServerPort}/overlays/sound-player`} style={{width: "400px"}} /></div>
                    </div>
                    <div style={{display: "table-row"}}>
                        <div style={{display: "table-cell", padding: "10px", fontWeight: "bolder"}}>Animation Overlay:</div>
                        <div style={{display: "table-cell", padding: "10px"}}><input type="text" value={`http://localhost:${this.state.botConfig?.imageServerPort}/overlays/multi${this.state.animationSubPanel ? `?subPanel=${this.state.animationSubPanel}` : ''}`} style={{width: "400px"}} /></div>
                        <div><input type="text" value={this.state.animationSubPanel} onChange={(e) => this.setState({animationSubPanel: e.target.value})} /></div>
                    </div>
                </div>
            </div>
        )
    }
}