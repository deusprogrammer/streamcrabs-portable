import React, {useState, useEffect} from 'react';
import MediaPoolSelector from '../elements/MediaPoolSelector';

import {toast} from 'react-toastify';
import { getBotConfig, updateGauges } from '../api/StreamCrabsApi';

const Gauges = (props) => {
    const [config, setConfig] = useState(null);
    const [newGauge, setNewGauge] = useState({});
    const [selected, setSelected] = useState(null);
    const [delta, setDelta] = useState(1);

    useEffect(() => {
        refreshGauges();
    }, []);

    const refreshGauges = async () => {
        let config = await getBotConfig();
        let keys = Object.keys(config.gauges);
        if (!config.gauges["_SUBMETER"]) {
            config.gauges["_SUBMETER"] = {type: "SUB"};
        }
        setConfig(config);
        setSelected(keys.length > 0 ? keys[0]: null);
    }

    const updateNewGauge = (field, value) => {
        let gauge = {...newGauge};
        gauge[field] = value;
        setNewGauge(gauge);
    }

    const addGauge = async () => {
        let gauges = {...config.gauges};

        if (newGauge.key.startsWith("_")) {
            newGauge.key = newGauge.key.subString(1);
        }

        newGauge.currentValue = 0;
        newGauge.maxValue = parseInt(newGauge.maxValue);
        gauges[newGauge.key] = newGauge;
        setNewGauge({key: "", label: "", maxValue: null, increaseSound: '', decreaseSound: '', completeSound: ''});
        await updateGauges(gauges);
        toast.info("Added Gauge");
        refreshGauges();
    }

    const removeGauge = async (id) => {
        let newConfig = {...config}
        let gauges = {...newConfig.gauges};
        delete gauges[id];
        newConfig.gauges = gauges;
        await updateGauges(gauges);
        toast.info("Removed Gauge");
        refreshGauges();
    }

    const updateGoalGauge = async (type, field, value) => {
        let gauges = {...config.gauges};
        if (field === "maxValue") {
            value = parseInt(value);
        }
        gauges[`_${type}METER`][field] = value;
        setConfig({...config, gauges});
    }

    const saveGauges = async () => {
        let gauges = {...config.gauges};
        await updateGauges(gauges);
        toast.info("Saved Gauges");
    }

    if (!config) {
        return (
            <div style={{position: "absolute", width: "100vw", top: "50%", left: "0px", transform: "translateY(-50%)", textAlign: "center"}}>
                Loading Config...
            </div>
        )
    }

    return (
        <div>
            <h1>Gauges</h1>
            <h2>Goal Gauges</h2>
            <p>Set your goal gauges here</p>
            <div style={{marginLeft: "20px"}}>
                <h3>Sub Gauge</h3>
                <table className="alert-config-table">
                    <tbody>
                        <tr>
                            <td>Label</td>
                            <td><input 
                                type="text" 
                                value={config.gauges["_SUBMETER"].label} 
                                placeholder="Label"
                                onChange={({target: {value}}) => {
                                    updateGoalGauge("SUB", "label", value);
                                }}
                                 /></td>
                        </tr>
                        <tr>
                            <td>Goal</td>
                            <td><input 
                                type="number" 
                                value={config.gauges["_SUBMETER"].maxValue} 
                                placeholder="Goal"
                                onChange={({target: {value}}) => {
                                    updateGoalGauge("SUB", "maxValue", value);
                                }}
                                 /></td>
                        </tr>
                        <tr>
                            <td>Increase Sound</td>
                            <td>
                                <MediaPoolSelector 
                                    type={"AUDIO"} 
                                    config={config} 
                                    keySuffix={"new"}
                                    value={config.gauges["_SUBMETER"].increaseSound}
                                    onChange={({target: {value}}) => {
                                        updateGoalGauge("SUB", "increaseSound", value);
                                    }} />
                            </td>
                        </tr>
                        <tr>
                            <td>Decrease Sound</td>
                            <td>
                                <MediaPoolSelector 
                                    type={"AUDIO"} 
                                    config={config} 
                                    keySuffix={"new"}
                                    value={config.gauges["_SUBMETER"].decreaseSound}
                                    onChange={({target: {value}}) => {
                                        updateGoalGauge("SUB", "decreaseSound", value);
                                    }} />
                            </td>
                        </tr>
                        <tr>
                            <td>Complete Sound</td>
                            <td>
                                <MediaPoolSelector 
                                    type={"AUDIO"} 
                                    config={config} 
                                    keySuffix={"new"}
                                    value={config.gauges["_SUBMETER"].completeSound}
                                    onChange={({target: {value}}) => {
                                        updateGoalGauge("SUB", "completeSound", value);
                                    }} />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button className="primary" type="button" onClick={saveGauges}>Save</button>
            </div>
            <h2>Custom Gauges</h2>
            <p>With this section you can create gauges that can be triggered by channel point redemptions.  The overlay for this is still in development.</p>
            <div style={{marginLeft: "20px"}}>
                {Object.keys(config.gauges).map((key) => {
                    let gauge = config.gauges[key];

                    if (key.startsWith("_")) {
                        return null;
                    }

                    return (
                        <>
                            <table className="alert-config-table" key={`gauge-${key}`}>
                                <tbody>
                                    <tr>
                                        <td>Name</td>
                                        <td>
                                            <input 
                                                type="text" 
                                                value={key}
                                                disabled={true}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Label</td>
                                        <td>
                                            <input 
                                                type="text" 
                                                value={gauge.label}
                                                disabled={true}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Max Value</td>
                                        <td>
                                            <input 
                                                type="number" 
                                                value={gauge.maxValue}
                                                disabled={true}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Trigger Event</td>
                                        <td>
                                            <select 
                                                value={gauge.type}
                                                disabled={true}>
                                                    <option>Choose Trigger...</option>
                                                    <option value="SUB">Subscriptions</option>
                                                    <option value="CHEER">Cheers</option>
                                                    <option value="CUSTOM">Channel Points</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Increase Sound</td>
                                        <td>
                                            <MediaPoolSelector 
                                                type={"AUDIO"} 
                                                config={config} 
                                                keySuffix={key}
                                                value={gauge.increaseSound}
                                                disabled={true}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Decrease Sound</td>
                                        <td>
                                            <MediaPoolSelector 
                                                type={"AUDIO"} 
                                                config={config} 
                                                keySuffix={key}
                                                value={gauge.decreaseSound}
                                                disabled={true}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Complete Sound</td>
                                        <td>
                                            <MediaPoolSelector 
                                                type={"AUDIO"} 
                                                config={config} 
                                                keySuffix={key}
                                                value={gauge.completeSound}
                                                disabled={true}/>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <button className="destructive" onClick={() => {removeGauge(key)}}>Delete</button>
                        </>
                    )
                })}
                <hr/>
                <table className="alert-config-table">
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td>
                                <input 
                                    type="text" 
                                    value={newGauge.key}
                                    onChange={({target: {value}}) => {
                                        updateNewGauge("key", value);
                                    }} />
                            </td>
                        </tr>
                        <tr>
                            <td>Label</td>
                            <td>
                                <input  
                                    type="text" 
                                    value={newGauge.label}
                                    onChange={({target: {value}}) => {
                                        updateNewGauge("label", value);
                                    }} />
                            </td>
                        </tr>
                        <tr>
                            <td>Trigger Event</td>
                            <td>
                                <select 
                                    value={newGauge.type}
                                    onChange={({target: {value}}) => {
                                        updateNewGauge("type", value);
                                    }}>
                                        <option>Choose Trigger...</option>
                                        <option value="SUB">Subscriptions</option>
                                        <option value="CHEER">Cheers</option>
                                        <option value="CUSTOM">Channel Points</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td>Max Value</td>
                            <td>
                                <input  
                                    type="number" 
                                    value={newGauge.maxValue}
                                    onChange={({target: {value}}) => {
                                        updateNewGauge("maxValue", value);
                                    }} />
                            </td>
                        </tr>
                        <tr>
                            <td>Increase Sound</td>
                            <td>
                                <MediaPoolSelector 
                                    type={"AUDIO"} 
                                    config={config} 
                                    keySuffix={"new"}
                                    value={newGauge.increaseSound}
                                    onChange={({target: {value}}) => {
                                        updateNewGauge("increaseSound", value);
                                    }} />
                            </td>
                        </tr>
                        <tr>
                            <td>Decrease Sound</td>
                            <td>
                                <MediaPoolSelector 
                                    type={"AUDIO"} 
                                    config={config} 
                                    keySuffix={"new"}
                                    value={newGauge.decreaseSound}
                                    onChange={({target: {value}}) => {
                                        updateNewGauge("decreaseSound", value);
                                    }} />
                            </td>
                        </tr>
                        <tr>
                            <td>Complete Sound</td>
                            <td>
                                <MediaPoolSelector 
                                    type={"AUDIO"} 
                                    config={config} 
                                    keySuffix={"new"}
                                    value={newGauge.completeSound}
                                    onChange={({target: {value}}) => {
                                        updateNewGauge("completeSound", value);
                                    }} />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <button onClick={() => {addGauge()}}>Add</button>
            </div>
            <h2>Create Command Block</h2>
            <div style={{marginLeft: "20px"}}>
                <p>To have a channel point reward trigger a change in a gauge you have to add a command block to the reward description on Twitch.  Use the tool below to create a command block.</p>
                <table className="command-config-table">
                    <thead style={{textAlign: "center"}}>
                        <tr>
                            <th>Gauge</th>
                            <th>Amount</th>
                            <th>Command Block</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <select 
                                    value={selected}
                                    onChange={({target: {value}}) => {
                                        setSelected(value);
                                    }}>
                                        <option value={null}>Select Gauge</option>
                                        {Object.keys(config.gauges).map((key) => {
                                            let gauge = config.gauges[key];
                                            return (
                                                <option value={key}>{gauge.label}</option>
                                            )
                                        })}
                                </select>
                            </td>
                            <td>
                                <input type="number" value={delta} onChange={({target: {value}}) => {setDelta(value)}} />
                            </td>
                            <td style={{width: "300px", textAlign: "center"}}>
                                <preformatted>{`[GAUGE:${selected}:ADD:${delta}]`}</preformatted>
                            </td>
                            <td><button onClick={() => {navigator.clipboard.writeText(`[GAUGE:${selected}:ADD:${delta}]`).then(() => {toast.info("Copied Command Block")})}}>Copy</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Gauges;