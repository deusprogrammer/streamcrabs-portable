import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import { useEffect, useState } from 'react';
import {HashRouter as Router, Route, Routes} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Bot from './components/Bot';
import Home from './components/Home';
import ChannelPoints from './components/ChannelPoints';
import DynamicAlertCustomizer from './components/DynamicAlertCustomizer';
import MediaPoolConfig from './components/MediaPoolConfig';
import DynamicAlertManager from './components/DynamicAlertManager';
import AlertConfig from './components/AlertConfig';
import CommandConfig from './components/CommandConfig';

import Menu from './elements/Menu';
import Gauges from './components/Gauges';
import Migration from './components/Migration';
import { checkMigration, getBotConfig, login } from './api/StreamCrabsApi';

const EXAMPLE = `{
    ...
    'clientId': '<YOUR CLIENT ID>',
    'clientSecret': '<YOUR CLIENT SECRET>'
}`

const App = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [profileImage, setProfileImage] = useState();
    const [twitchChannel, setTwitchChannel] = useState();
    const [clientId, setClientId] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [alreadyMigrated, setAlreadyMigrated] = useState(true);

    useEffect(() => {
        (async () => {
            let {accessToken, refreshToken, profileImage, twitchChannel, clientId, clientSecret} = await getBotConfig();
            let alreadyMigrated = await checkMigration();
            setAlreadyMigrated(alreadyMigrated);
            setLoggedIn(accessToken && refreshToken);
            setTwitchChannel(twitchChannel);
            setProfileImage(profileImage);
            setClientId(clientId);
            setClientSecret(clientSecret);
        })();
    }, []);

    const onLogin = async () => {
        if (await login()) {
            let {accessToken, refreshToken, profileImage, twitchChannel} = await getBotConfig();
            let alreadyMigrated = await checkMigration();
            setAlreadyMigrated(alreadyMigrated);
            setLoggedIn(accessToken && refreshToken);
            setTwitchChannel(twitchChannel);
            setProfileImage(profileImage);
        }
    }

    if (!clientId || !clientSecret) {
        return (<div className="splash-screen">
            <img className="streamcrab-logo" src={`${process.env.PUBLIC_URL}/crab.png`} alt="Streamcrabs logo" /><br />
            <h3>No client id or secret found!</h3>
            <p>If you built this project from Git Hub, please add your Twitch client id and client secret into the config.js like below and then restart the app.</p>
            <pre style={{display: "inline-block", background: "gray", padding: "5px", textAlign: "left"}}>{EXAMPLE}</pre>
        </div>);
    }

    if (!loggedIn) {
        return (
            <div className="splash-screen">
                <h1>Welcome to Streamcrabs Pocket</h1>
                <p>If you are ready to unleash the Streamcrabs, just login to Twitch below.</p>
                <img className="streamcrab-logo" src={`${process.env.PUBLIC_URL}/crab.png`} alt="Streamcrabs logo" /><br />
                <button onClick={() => onLogin()}>Twitch Login</button>
            </div>
        );
    }

    let menu = (
        <Menu
            title="Streamcrabs Control Panel"
            menu={{
                "Broadcaster": {
                    items: [
                        {
                            label: "Bot",
                            to: `/`
                        }, {
                            label: "Overlays",
                            to: `/configs/overlays`
                        }, {
                            label: "MediaPool",
                            to: `/configs/media`
                        }, {
                            label: "Commands",
                            to: `/configs/commands`
                        }, {
                            label: "Alert Config",
                            to: `/configs/alerts`
                        }, {
                            label: "Dynamic Alerts",
                            to: `/configs/dynamic-alerts`
                        }, {
                            label: "Channel Points",
                            to: `/configs/points`
                        }, {
                            label: "Gauges",
                            to: `/configs/gauges`
                        }, {
                            label: "Migration",
                            to: `/migrations`,
                            show: !alreadyMigrated
                        }
                    ],
                    show: true
                }
            }} />
    );

    return (
        <div>
            <ToastContainer />
            <Router>
                <div style={{textAlign: "center"}}>
                    {menu}
                </div>
                <div className="profile-image">
                    <img src={profileImage} alt="Twitch profile avatar" /><br/>
                    {twitchChannel}
                </div>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/migrations" element={<Migration />} />
                    <Route path="/configs/overlays" element={<Bot />} />
                    <Route path="/configs/media" element={<MediaPoolConfig />} />
                    <Route path="/configs/alerts" element={<AlertConfig />} />
                    <Route path="/configs/commands" element={<CommandConfig />} />
                    <Route path="/configs/points" element={<ChannelPoints />} />
                    <Route path="/configs/gauges" element={<Gauges />} />
                    <Route path="/configs/dynamic-alert" element={<DynamicAlertCustomizer />} />
                    <Route path="/configs/dynamic-alerts" element={<DynamicAlertManager />} />
                    <Route path="/configs/dynamic-alert/:id" element={<DynamicAlertCustomizer />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
