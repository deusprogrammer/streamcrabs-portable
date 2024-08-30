import React from 'react';
import { useBots, useConfig } from '../hooks/BotConfigHook';

const Home = () => {
    const [config] = useConfig();
    const [botsStarted, startBot, stopBot] = useBots();

    return (
        <div className="splash-screen">
            <img className="streamcrab-logo" alt="streamcrab logo" src={`${process.env.PUBLIC_URL}/crab.png`} /><br />
            <table>
                <tbody>
                {Object.keys(config?.botUsers || {}).map(userName => {
                    return (
                        <tr key={`bot-user-${userName}`}>
                            <td><img alt={`profile for ${userName}`} style={{width: "50px"}} src={config?.botUsers[userName].profileImage} /></td>
                            <td>{userName}</td>
                            <td className={`${config?.botUsers[userName].role}-role-col`}>{config?.botUsers[userName].role}</td>
                            <td>
                                {!botsStarted?.[userName] ? 
                                    <button style={{width: "200px", height: "50px", fontSize: "20pt", background: "green", color: "white"}} onClick={() => startBot(userName)}>Start Bot</button> 
                                    :
                                    <button style={{width: "200px", height: "50px", fontSize: "20pt", background: "red", color: "white"}} onClick={() => stopBot(userName)}>Stop Bot</button>
                                }
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    )
};

export default Home;