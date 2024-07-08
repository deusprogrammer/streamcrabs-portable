import React, {useState, useRef, useEffect} from 'react';
import Animation from '../elements/Animation';

import SpriteStrip from '../elements/SpriteStrip';

import { getDynamicAlert, storeDynamicAlert, storeMediaData, updateDynamicAlert } from '../api/StreamCrabsApi';
import { useNavigate, useParams } from 'react-router';
import { createAbsoluteUrl } from '../utils/UrlUtil';

const readFileAsDataUri = (file) => {
    return new Promise(function(resolve,reject){
        let fr = new FileReader();

        fr.onload = function(){
            resolve(fr.result);
        };

        fr.onerror = function(){
            reject(fr);
        };

        fr.readAsDataURL(file)
    });
}

let variantMap = {
    "CHARGE_RIGHT": "Charge Right",
    "CHARGE_LEFT": "Charge Left",
    "CHARGE_UP": "Charge Up",
    "CHARGE_DOWN": "Charge Down"
}

const RaidAlertCustomizer = (props) => {
    const [sprites, setSprites] = useState([]);
    const [sfx, setSFX] = useState({});
    const [bgm, setBGM] = useState({});
    const [sfxVolume, setSFXVolume] = useState(1.0);
    const [bgmVolume, setBGMVolume] = useState(1.0);
    const [name, setName] = useState("Sprite");
    const [message, setMessage] = useState("Incoming raid of size ${raidSize} from ${raider}");
    const [variant, setVariant] = useState("CHARGE_RIGHT");
    const [saving, setSaving] = useState(false);
    const fileInput = useRef();
    const bgmFileInput = useRef();
    const sfxFileInput = useRef();
    const {id} = useParams();
    const navigate = useNavigate();

    let getAlert = async () => {
        if (id) {
            let dynamicAlert = await getDynamicAlert(id);

            dynamicAlert.sprites.forEach((sprite) => {
                sprite.isStored = true;
                sprite.frames = sprite.cellCount;
            });

            dynamicAlert.music.isStored = true;
            dynamicAlert.leavingSound.isStored = true;

            setName(dynamicAlert.name);
            setVariant(dynamicAlert.variant);
            setMessage(dynamicAlert.message);
            setSprites(dynamicAlert.sprites);
            setBGM(dynamicAlert.music);
            setSFX(dynamicAlert.leavingSound);
        }
    }

    useEffect(() => {
        getAlert();
    }, []);

    const removeSprite = async (index) => {
        let temp = [...sprites];
        temp.splice(index, 1);
        setSprites(temp);
    };

    const storeAudio = async (imagePayload, title) => {
        let mediaData = {
            mimeType: "audio/mp3",
            extension: ".mp3",
            imagePayload,
            title
        };

        return await storeMediaData(mediaData);
    };

    const storeImage = async (imagePayload, title) => {
        let mediaData = {
            mimeType: "image/png",
            extension: ".png",
            imagePayload,
            title
        };

        return await storeMediaData(mediaData);
    };

    const store = async () => {
        for (let sprite of sprites) {
            if (!sprite.isStored) {
                sprite.file = await storeImage(sprite.file.substring(sprite.file.indexOf(',') + 1), "Raid-Sprite");
            }
        }

        let bgmFile = bgm.file;
        if (!bgm.isStored) {
            bgmFile = await storeAudio(bgm.file.substring(bgm.file.indexOf(',') + 1), "Raid-BGM");
        }

        let sfxFile = sfx.file;
        if (!sfx.isStored) {
            sfxFile = await storeAudio(sfx.file.substring(sfx.file.indexOf(',') + 1), "Raid-SFX");
        }

        let config = {
            name,
            variant,
            message,
            sprites: sprites.map((sprite) => {
                return {
                    file: sprite.file,
                    startFrame: sprite.startFrame,
                    endFrame: sprite.endFrame,
                    frameWidth: sprite.frameWidth,
                    frameHeight: sprite.frameHeight,
                    frameRate: sprite.frameRate,
                    cellCount: sprite.frames
                }
            }),
            music: {
                file: bgmFile,
                volume: bgmVolume
            },
            leavingSound: {
                file: sfxFile,
                volume: sfxVolume
            }
        };

        if (id) {
            config.id = id;
            return await updateDynamicAlert(config);
        } else {
            return await storeDynamicAlert(config);
        }
    };

    return (
        <div>
            <hr />
            <h1>Create a New Custom Raid Alert</h1>
            <hr />
            <h2>Metadata</h2>
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>Name:</td>
                            <td>
                                <input 
                                    type="text" 
                                    style={{width: "400px"}}
                                    value={name}
                                    disabled={saving}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }} />
                            </td>
                        </tr>
                        <tr>
                            <td>Variant:</td>
                            <td>
                                <select
                                    style={{width: "400px"}}
                                    value={variant}
                                    disabled={saving}
                                    onChange={(e) => {
                                        setVariant(e.target.value);
                                    }}>
                                        {Object.keys(variantMap).map((key) => {
                                            let variantName = variantMap[key];
                                            return (
                                                <option value={key}>{variantName}</option>
                                            )
                                        })}
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <hr />
            <div>
                <h2>Sprites</h2>
                {sprites.map((sprite, index) => {
                    return (
                        <div key={`sprite-${index}`} style={{border: "1px solid black"}}>
                            <h3>Sprite {index}</h3>
                            <div style={{marginLeft: "10px"}}>
                                <div style={{width: "100%", overflowX: "scroll"}}>
                                    <Animation 
                                        url={createAbsoluteUrl(sprite.file)}
                                        frameCount={sprite.frames}
                                        speed={sprite.frameRate}
                                        startFrame={sprite.startFrame}
                                        endFrame={sprite.endFrame}
                                        onLoaded={(frameWidth, frameHeight) => {
                                            const temp = [...sprites];
                                            sprite.frameWidth = Math.floor(frameWidth);
                                            sprite.frameHeight = Math.floor(frameHeight);
                                            temp[index] = sprite;
                                            setSprites(temp);
                                        }} />
                                </div>
                                <div style={{width: "100%", backgroundColor: "white", overflowX: "scroll", whiteSpace: "nowrap"}}>
                                    <SpriteStrip
                                        url={createAbsoluteUrl(sprite.file)}
                                        frameCount={sprite.frames}
                                        startFrame={sprite.startFrame}
                                        endFrame={sprite.endFrame} 
                                        onStartFrameClick={(frame) => {
                                            if (frame < sprite.endFrame) {
                                                const temp = [...sprites];
                                                sprite.startFrame = frame;
                                                temp[index] = sprite;
                                                setSprites(temp);
                                            }
                                        }}
                                        onEndFrameClick={(frame) => {
                                            if (sprite.startFrame < frame) {
                                                const temp = [...sprites];
                                                sprite.endFrame = frame;
                                                temp[index] = sprite;
                                                setSprites(temp);
                                            }
                                        }} />
                                </div>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td>Sprite Size:</td>
                                            <td>{sprite.frameWidth}X{sprite.frameHeight}</td>
                                        </tr>
                                        <tr>
                                            <td>Cell Count:</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    value={sprite.frames} 
                                                    disabled={saving}
                                                    onChange={(e) => {
                                                        const temp = [...sprites];
                                                        sprite.frames = e.target.value ? parseInt(e.target.value) : 1;
                                                        sprite.endFrame = sprite.frames - 1;
                                                        temp[index] = sprite;
                                                        setSprites(temp);
                                                    }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Frame Rate:</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    value={sprite.frameRate} 
                                                    disabled={saving}
                                                    onChange={(e) => {
                                                        const temp = [...sprites];
                                                        sprite.frameRate = e.target.value ? parseInt(e.target.value) : 15;
                                                        temp[index] = sprite;
                                                        setSprites(temp);
                                                    }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Start Frame:</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    value={sprite.startFrame} 
                                                    disabled={saving}
                                                    onChange={(e) => {
                                                        const temp = [...sprites];
                                                        sprite.startFrame = e.target.value ? parseInt(e.target.value) : 0;
                                                        temp[index] = sprite;
                                                        setSprites(temp);
                                                    }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>End Frame:</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    value={sprite.endFrame} 
                                                    disabled={saving}
                                                    onChange={(e) => {
                                                        const temp = [...sprites];
                                                        sprite.endFrame = e.target.value ? parseInt(e.target.value) : sprite.frames;
                                                        temp[index] = sprite;
                                                        setSprites(temp);
                                                    }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td><button onClick={() => {removeSprite(index)}}>Remove</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div style={{backgroundColor: "gray", color: "white"}}>
                <input 
                    type="file" 
                    ref={fileInput}
                    accept=".png"
                    multiple
                    disabled={saving}
                    onChange={(e) => {
                        let readers = [];
                        for (let file of e.target.files) {
                            readers.push(readFileAsDataUri(file));
                        };
                        Promise.all(readers).then((results) => {
                            let newSprites = results.map((dataUri) => {
                                return {
                                    file: dataUri,
                                    width: 0,
                                    height: 0,
                                    frames: 1,
                                    startFrame: 0,
                                    endFrame: 0,
                                    frameRate: 15,
                                    isStored: false
                                };
                            });
                            setSprites([...sprites, ...newSprites]);
                            fileInput.current.value = '';
                        });
                    }}/>
            </div>
            <hr />
            <h2>Sounds</h2>
            <table>
                <tbody>
                    <tr>
                        <td style={{verticalAlign: "middle"}}>BGM:</td>
                        <td style={{verticalAlign: "middle"}}>
                            <input 
                                type="file" 
                                ref={bgmFileInput}
                                accept=".mp3"
                                disabled={saving}
                                onChange={(e) => {
                                    const f = e.target.files[0];
                                    const fr = new FileReader();
                                    fr.addEventListener("load", (event) => {
                                        setBGM({file: event.target.result, isStored: false});
                                    });
                                    fr.readAsDataURL(f);
                                }}/>
                            <input 
                                type="range" 
                                min={0} 
                                max={1} 
                                step={0.1} 
                                value={bgmVolume} 
                                onChange={(e) => {setBGMVolume(parseFloat(e.target.value))}} />
                        </td>
                        <td style={{verticalAlign: "middle"}}>
                            <audio 
                                src={createAbsoluteUrl(bgm.file)}
                                width="300px" 
                                controls  />
                        </td>
                    </tr>
                    <tr>
                        <td style={{verticalAlign: "middle"}}>SFX:</td>
                        <td style={{verticalAlign: "middle"}}>
                            <input 
                                type="file" 
                                ref={sfxFileInput}
                                accept=".mp3"
                                disabled={saving}
                                onChange={(e) => {
                                    const f = e.target.files[0];
                                    const fr = new FileReader();
                                    fr.addEventListener("load", (event) => {
                                        setSFX({file: event.target.result, isStored: false});
                                    });
                                    fr.readAsDataURL(f);
                                }}/>
                            <input 
                                type="range" 
                                min={0} 
                                max={1} 
                                step={0.1} 
                                value={sfxVolume} 
                                onChange={(e) => {setSFXVolume(parseFloat(e.target.value))}} />
                        </td><td style={{verticalAlign: "middle"}}>
                            <audio 
                                src={createAbsoluteUrl(sfx.file)} 
                                width="300px" 
                                controls />
                        </td>
                    </tr>
                </tbody>
            </table>
            <hr />
            <button 
                disabled={!name || !message || !sfx.file || !bgm.file || sprites.length <= 0 || saving}
                onClick={async () => {
                    setSaving(true);
                    await store();
                    setSaving(false);
                    navigate("/configs/dynamic-alerts");
            }}>
                { id ? "Update" : "Create" }
            </button>
        </div>
    )
};

export default RaidAlertCustomizer;