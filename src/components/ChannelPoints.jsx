import React, {useEffect, useState} from 'react';
import { toast } from 'react-toastify';
import MediaPoolSelector from '../elements/MediaPoolSelector';
import { createChannelPointReward, getBotConfig, getChannelPointRewards, removeChannelPointReward, updateRedemptions } from '../api/StreamCrabsApi';

const rewardNames =  ["random sound", "random video", "bad apple", "bird up", "be a big shot"];
const rewardParams = {
    "random sound": {title: "Random Sound", cost: 100},
    "random video": {title: "Random Video", cost: 500},
    "bad apple": {title: "Bad Apple", cost: 2000},
    "bird up": {title: "Bird Up", cost: 200},
    "be a big shot": {title: "Be a Big Shot", cost: 10000}
}

const ChannelPoints = (props) => {
    const [rewards, setRewards] = useState(null);
    const [config, setConfig] = useState(null);
    const [newRedemption, setNewRedemption] = useState({type: "VIDEO", panel: "default"});
    useEffect(() => {
        (async () => {
            let config = await getBotConfig();
            let rewards = await getChannelPointRewards(config);
            rewards = rewards.filter(reward => rewardNames.includes(reward.title.toLowerCase()));
            setRewards(rewards);
            setConfig(config);
        })();
    }, []);

    const removeReward = async (rewardId) => {
        await removeChannelPointReward(rewardId, config);
        let rewards = await getChannelPointRewards(config);
        rewards = rewards.filter(reward => rewardNames.includes(reward.title.toLowerCase()))
        setRewards(rewards);
    }

    const addReward = async (rewardName) => {
        await createChannelPointReward(rewardParams[rewardName].title, rewardParams[rewardName].cost, config);
        let rewards = await getChannelPointRewards(config);
        rewards = rewards.filter(reward => rewardNames.includes(reward.title.toLowerCase()))
        setRewards(rewards);
    }

    const updateRedemption = (key, field, value) => {
        let redemptions = {...config.redemptions};
        let redemption = {...redemptions[key]};
        redemption[field] = value;
        redemptions[key] = redemption;
        config.redemptions = redemptions;
        setConfig(config);
    }

    const updateNewRedemption = (field, value) => {
        let redemption = {...newRedemption};
        redemption[field] = value;
        setNewRedemption(redemption);
    }

    const addRedemption = async () => {
        let redemptions = {...config.redemptions};
        let rewards = null;
        try {
            rewards = await createChannelPointReward(newRedemption.name, 1, config);
        } catch (error) {
            toast.error("Failed to create reward on Twitch, please check name for banned words");
            return;
        }
        redemptions[rewards[0].id] = newRedemption;
        setConfig({...config, redemptions});
        setNewRedemption({name: "", type: "VIDEO", panel: "default"});
        await updateRedemptions(redemptions);
    }

    const removeRedemption = async (id) => {
        let newConfig = {...config}
        let redemptions = {...newConfig.redemptions};
        delete redemptions[id];
        newConfig.redemptions = redemptions;
        setConfig(newConfig);
        await updateRedemptions(redemptions);
        await removeChannelPointReward(id, config);
    }

    if (!rewards || !config) {
        return (
            <div style={{position: "absolute", width: "100vw", top: "50%", left: "0px", transform: "translateY(-50%)", textAlign: "center"}}>
                Loading Config...
            </div>
        )
    }

    return (
        <div>
            <h1>Channel Point Rewards</h1>
            <p>With this section you can add some premade channel point rewards to your channel that will trigger some neat things.  Eventually we will have custom rewards you can create yourself for anything from custom gagues to custom video/sound content.</p>
            <p>Random video and sound is sourced from your media pool.  Any item in your media pool that is checked will be included in the random selections of these rewards.</p>
            <h2>Standard Rewards</h2>
            <div style={{marginLeft: "20px"}}>
            {rewardNames.map((rewardName) => {
                let reward = rewards.find(reward => reward.title.toLowerCase() === rewardName)
                if (reward) {
                    return <React.Fragment key={`${rewardName}-remove`}><button onClick={() => {removeReward(reward.id)}}>Remove {rewardParams[rewardName].title}</button><br/></React.Fragment>
                } else {
                    return <React.Fragment key={`${rewardName}-add`}><button onClick={() => {addReward(rewardName)}}>Add {rewardParams[rewardName].title}</button><br/></React.Fragment>
                }
            })}
            </div>
            <h2>Custom Rewards</h2>
            <div style={{marginLeft: "20px"}}>
                <table className="command-config-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Action Type</th>
                            <th>Media</th>
                            <th>Audio</th>
                            <th>Sub Panel</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(config.redemptions).map((key) => {
                            let redemption = config.redemptions[key];

                            return (
                                <tr key={`redemption-${key}`}>
                                    <td>
                                        <input 
                                            type="text" 
                                            value={redemption.name}
                                            disabled={true}
                                            onChange={({target: {value}}) => {
                                                updateRedemption(key, "name", value);
                                            }}
                                             />
                                    </td>
                                    <td>
                                        <select  
                                            value={redemption.type}
                                            disabled={true}
                                            onChange={({target: {value}}) => {
                                                updateRedemption(key, "type", value);
                                            }}>
                                                <option value="VIDEO">Video</option>
                                                <option value="IMAGE">Gif</option>
                                                <option value="AUDIO">Audio</option>
                                        </select>
                                    </td>
                                    <td>
                                        <MediaPoolSelector 
                                            type={redemption.type} 
                                            config={config} 
                                            keySuffix={key}
                                            value={redemption.id}
                                            disabled={true}
                                            onChange={({target: {value}}) => {
                                                updateRedemption(key, "id", value);
                                            }} />
                                    </td>
                                    <td>
                                        {["IMAGE"].includes(redemption.type) ? 
                                            <MediaPoolSelector 
                                                type="AUDIO" 
                                                config={config} 
                                                keySuffix={`${key}-gif`} 
                                                value={redemption.soundId}
                                                disabled={true}
                                                onChange={({target: {value}}) => {
                                                    updateRedemption(key, "soundId", value);
                                                }}/> : null }
                                    </td>
                                    <td>
                                        <input 
                                            type="text" 
                                            value={redemption.panel}
                                            disabled={true}
                                            onChange={({target: {value}}) => {
                                                updateRedemption(key, "panel", value);
                                            }} />
                                    </td>
                                    <td><button className="destructive" onClick={() => {removeRedemption(key)}}>Delete</button></td>
                                </tr>
                            )
                        })}
                        <tr>
                            <td>
                                <input 
                                    type="text" 
                                    value={newRedemption.name}
                                    onChange={({target: {value}}) => {
                                        updateNewRedemption("name", value);
                                    }}
                                        />
                            </td>
                            <td>
                                <select  
                                    value={newRedemption.type}
                                    onChange={({target: {value}}) => {
                                        updateNewRedemption("type", value);
                                    }}>
                                        <option value="VIDEO">Video</option>
                                        <option value="IMAGE">Gif</option>
                                        <option value="AUDIO">Audio</option>
                                </select>
                            </td>
                            <td>
                                <MediaPoolSelector 
                                    type={newRedemption.type} 
                                    config={config} 
                                    keySuffix={`new`}
                                    value={newRedemption.id}
                                    onChange={({target: {value}}) => {
                                        updateNewRedemption("id", value);
                                    }} />
                            </td>
                            <td>
                                {["IMAGE"].includes(newRedemption.type) ? 
                                    <MediaPoolSelector 
                                        type="AUDIO" 
                                        config={config} 
                                        keySuffix={`new-gif`}
                                        value={newRedemption.soundId}
                                        onChange={({target: {value}}) => {
                                            updateNewRedemption("soundId", value);
                                        }} /> : null}
                            </td>
                            <td>
                                <input 
                                    type="text" 
                                    value={newRedemption.panel}
                                    onChange={({target: {value}}) => {
                                        updateNewRedemption("panel", value);
                                    }} />
                            </td>
                            <td><button onClick={() => {addRedemption()}}>Add</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ChannelPoints;