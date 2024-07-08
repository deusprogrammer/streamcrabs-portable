import React from 'react';
import {toast} from 'react-toastify';
import { getBotConfig, updateAudioPool, updateVideoPool, updateImagePool, storeMediaData } from '../api/StreamCrabsApi';
import { createAbsoluteUrl } from '../utils/UrlUtil';

export default class MediaPoolConfig extends React.Component {
    constructor(props) {
        super(props);

        this.audioDataRef = React.createRef();
        this.videoDataRef = React.createRef();
        this.imageDataRef = React.createRef();

        this.state = {
            videoPool: [],
            audioPool: [],
            imagePool: [],
            uploadVideoData: "",
            uploadAudioData: "",
            uploadImageData: "",
            uploadVideoDataUrl: "",
            uploadAudioDataUrl: "",
            uploadImageDataUrl: "",
            addVideoUrl: "",
            addAudioUrl: "",
            addImageUrl: "",
            uploadVideoFileName: "",
            uploadAudioFileName: "",
            uploadImageFileName: "",
            selectedAudioIndex: -1,
            selectedVideoIndex: -1,
            selectedImageIndex: -1,
            videoPreview: {},
            audioPreview: {},
            imagePreview: {},
            saving: false,
            dirtyFlags: {}
        }
    }

    componentDidMount = async () => {
        try {
            await this.loadMediaData();
        } catch (e) {
            console.error(e);
        }
    }

    loadMediaData = async () => {
        let {videoPool, audioPool, imagePool} = await getBotConfig();
        this.setState({videoPool, audioPool, imagePool});
    }

    onFileLoaded = (e) => {
        let fr = new FileReader();
        let file = e.target.files[0];

        const uploadFileName = file.name;
        const lastDot = uploadFileName.lastIndexOf('.');
        const ext = uploadFileName.substring(lastDot + 1);

        fr.onload = () => {
            let base64Media = fr.result.substring(fr.result.indexOf(',') + 1);

            if (ext === "mp4") {
                this.setState({uploadVideoData: base64Media, uploadVideoDataUrl: fr.result, uploadVideoFileName: uploadFileName});
            } else if (ext === "mp3") {
                this.setState({uploadAudioData: base64Media, uploadAudioDataUrl: fr.result, uploadAudioFileName: uploadFileName});
            } else if (ext === "gif") {
                this.setState({uploadImageData: base64Media, uploadImageDataUrl: fr.result, uploadImageFileName: uploadFileName});
            }
        }

        fr.readAsDataURL(file);
    }

    onDisableMedia = async (e, type, index) => {
        let mediaPool = {};
        if (type === "audio") {
            mediaPool = [...this.state.audioPool];
        } else if (type === "video") {
            mediaPool = [...this.state.videoPool];
        } else if (type === "image") {
            mediaPool = [...this.state.imagePool];
        } else {
            return;
        }

        mediaPool[index].enabled = e.target.checked;

        try {
            if (type === "audio") {
                this.setState({audioPool: mediaPool, saving: true});
                await updateAudioPool(mediaPool);
            } else if (type === "video") {
                this.setState({videoPool: mediaPool, saving: true});
                await updateVideoPool(mediaPool);
            } else if (type === "image") {
                this.setState({imagePool: mediaPool, saving: true});
                await updateImagePool(mediaPool);
            }  else {
                return;
            }
            toast(`Disabled media`, {type: "info"});
            this.setState({saving: false});
        } catch(e) {
            console.error(e);
            toast("Failed to update media pool!");
            return;
        }
    }

    onDeleteMedia = async (type, index) => {
        let mediaPool = {};
        if (type === "audio") {
            mediaPool = [...this.state.audioPool];
        } else if (type === "video") {
            mediaPool = [...this.state.videoPool];
        } else if (type === "image") {
            mediaPool = [...this.state.imagePool];
        }  else {
            return;
        }

        mediaPool.splice(index, 1);

        try {
            if (type === "audio") {
                this.setState({audioPool: mediaPool, saving: true});
                await updateAudioPool(mediaPool);
            } else if (type === "video") {
                this.setState({videoPool: mediaPool, saving: true});
                await updateVideoPool(mediaPool);
            } else if (type === "image") {
                this.setState({imagePool: mediaPool, saving: true});
                await updateImagePool(mediaPool);
            }  else {
                return;
            }
            toast(`Deleted media`, {type: "info"});
            this.setState({saving: false});
        } catch(e) {
            console.error(e);
            toast("Failed to update media pool!")
            return;
        }
    }

    storeMedia = async (type) => {
        let mediaPool = {};
        let mediaData = {};
        let mediaUrl = "";
        if (type === "audio") {
            mediaData.mimeType = "audio/mp3";
            mediaData.extension = ".mp3";
            mediaData.imagePayload = this.state.uploadAudioData;
            mediaData.title = this.state.uploadAudioFileName;
            mediaPool = [...this.state.audioPool];
            mediaUrl = this.state.addAudioUrl;
        } else if (type === "video") {
            mediaData.mimeType = "video/mp4";
            mediaData.extension = ".mp4";
            mediaData.imagePayload = this.state.uploadVideoData;
            mediaData.title = this.state.uploadVideoFileName;
            mediaPool = [...this.state.videoPool];
            mediaUrl = this.state.addVideoUrl;
        } else if (type === "image") {
            mediaData.mimeType = "image/gif";
            mediaData.extension = ".gif";
            mediaData.imagePayload = this.state.uploadImageData;
            mediaData.title = this.state.uploadImageFileName;
            mediaPool = [...this.state.imagePool];
            mediaUrl = this.state.addImageUrl;
        } else {
            return;
        }

        this.setState({saving: true});
        if (!this.state.addAudioUrl && !this.state.addVideoUrl && !this.state.addImageUrl) {
            try {
                let url = await storeMediaData(mediaData);
                mediaPool.push({
                    id: `${Date.now()}`,
                    enabled: false,
                    volume: 1,
                    name: type + (mediaPool.length + 1),
                    url
                });
            } catch (e) {
                console.error(e);
                toast("Failed to store video file!")
                return;
            }
        } else {
            mediaPool.push({
                id: `${Date.now()}`,
                enabled: false,
                volume: 1,
                name: type + (mediaPool.length + 1),
                url: mediaUrl
            });
        }

        try {
            switch (type) {
                case "video":
                    await updateVideoPool(mediaPool);
                    break;
                case "audio":
                    await updateAudioPool(mediaPool);
                    break;
                case "image":
                    await updateImagePool(mediaPool);
                    break;
                default:
                    console.log("Unimplemented");
            }
        } catch (e) {
            console.error(e);
            toast("Failed to update media pool!")
            return;
        }
        toast(`Media stored successfully`, {type: "info"});
        this.setState({saving: false});

        this.audioDataRef.current.value = null;
        this.videoDataRef.current.value = null;
        // this.imageDataRef.current.value = null;

        this.setState({uploadAudioData: "", uploadAudioDataUrl: "", uploadAudioFileName: "", uploadVideoData: "", uploadVideoDataUrl: "", uploadVideoFileName: "", uploadImageData: "", uploadImageDataUrl: "", uploadImageFileName: ""});
        this.loadMediaData();
    }

    updateMedia = (e, index, type) => {
        let mediaPool = [];

        if (type === "audio") {
            mediaPool = [...this.state.audioPool];
        } else if (type === "video") {
            mediaPool = [...this.state.videoPool];
        } else if (type === "image") {
            mediaPool = [...this.state.imagePool];
        }  else {
            return;
        }

        mediaPool[index].name = e.target.value;

        console.log(`SETTING DIRTY ${type}${index}`);
        let dirtyFlags = {...this.state.dirtyFlags};
        dirtyFlags[`${type}${index}`] = true;
        this.setState({dirtyFlags});

        if (type === "audio") {
            this.setState({audioPool: mediaPool});
        } else if (type === "video") {
            this.setState({videoPool: mediaPool});
        } else if (type === "image") {
            this.setState({imagePool: mediaPool});
        } else {
            return;
        }
    }

    updateChromaKey = (e, index, type) => {
        let mediaPool = [];

        if (type === "audio") {
            mediaPool = [...this.state.audioPool];
        } else if (type === "video") {
            mediaPool = [...this.state.videoPool];
        } else {
            return;
        }

        mediaPool[index].chromaKey = e.target.value;

        console.log(`SETTING DIRTY ${type}${index}`);
        let dirtyFlags = {...this.state.dirtyFlags};
        dirtyFlags[`${type}${index}`] = true;
        this.setState({dirtyFlags});

        if (type === "audio") {
            this.setState({audioPool: mediaPool});
        } else if (type === "video") {
            this.setState({videoPool: mediaPool});
        } else {
            return;
        }
    }

    updateVolume = (e, index, type) => {
        let mediaPool = [];

        if (type === "audio") {
            mediaPool = [...this.state.audioPool];
        } else if (type === "video") {
            mediaPool = [...this.state.videoPool];
        } else {
            return;
        }

        mediaPool[index].volume = parseFloat(e.target.value);

        console.log(`SETTING DIRTY ${type}${index}`);
        let dirtyFlags = {...this.state.dirtyFlags};
        dirtyFlags[`${type}${index}`] = true;
        this.setState({dirtyFlags});

        if (type === "audio") {
            this.setState({audioPool: mediaPool});
        } else if (type === "video") {
            this.setState({videoPool: mediaPool});
        } else {
            return;
        }
    }

    updatePosition = (e, index, portion, type) => {
        let mediaPool = [];

        if (type === "audio") {
            mediaPool = [...this.state.audioPool];
        } else if (type === "video") {
            mediaPool = [...this.state.videoPool];
        } else {
            return;
        }

        mediaPool[index][portion] = e.target.value;

        console.log(`SETTING DIRTY ${type}${index}`);
        let dirtyFlags = {...this.state.dirtyFlags};
        dirtyFlags[`${type}${index}`] = true;
        this.setState({dirtyFlags});

        if (type === "audio") {
            this.setState({audioPool: mediaPool});
        } else if (type === "video") {
            this.setState({videoPool: mediaPool});
        } else {
            return;
        }
    }

    saveMediaConfig = async (type) => {
        let mediaPool = [];

        if (type === "audio") {
            mediaPool = [...this.state.audioPool];
        } else if (type === "video") {
            mediaPool = [...this.state.videoPool];
        } else if (type === "image") {
            mediaPool = [...this.state.imagePool];
        } else {
            return;
        }

        this.setState({dirtyFlags: {}});

        try {
            this.setState({saving: true});
            switch (type) {
                case "video":
                    await updateVideoPool(mediaPool);
                    break;
                case "audio":
                    await updateAudioPool(mediaPool);
                    break;
                case "image":
                    await updateImagePool(mediaPool);
                    break;
                default:
                    console.log("Unimplemented");
            }
            this.setState({saving: false});
            toast(`Media config save successful`, {type: "info"});
        } catch (e) {
            console.error(e);
            toast("Failed to save media pool config!")
            return;
        }
    }

    render() {
        return (
            <div id="media-pool">
                <div id="audio-pool" className="media-pool-div">
                    <h3>My Audio</h3>
                    <ul>
                        { this.state.audioPool.map((element, index) => {
                            if (!element.volume) {
                                element.volume = 1.0;
                            }
                            
                            return (
                                <li key={`audio${index}`} style={{border: this.state.dirtyFlags[`audio${index}`] ? "2px solid red" : "none"}}>
                                    <div className="video-preview">
                                        <audio 
                                            id="audio-preview"
                                            src={createAbsoluteUrl(element.url)} 
                                            width="300px" 
                                            controls 
                                            preload="none" />
                                    </div>
                                    <label>Name</label>
                                    <input type="text" value={element.name} onChange={(e) => {this.updateMedia(e, index, "audio")}} disabled={this.state.saving} />
                                    <label>Volume</label>
                                    <div className="volume-control">
                                        <input type="range" min={0} max={1} step={0.1} value={element.volume} onChange={(e) => {this.updateVolume(e, index, "audio")}} />
                                        <span style={{width: "50px"}}>{element.volume * 100}%</span>
                                    </div>
                                    <div className="random-checkbox">
                                        <input type="checkbox" onChange={(e) => {this.onDisableMedia(e, "audio", index)}} checked={element.enabled} disabled={this.state.saving}/>
                                        <label>Include in Random</label>
                                    </div>
                                    <div></div>
                                    <div className="button-bank">
                                        <button className="primary" onClick={(e) => {this.saveMediaConfig("audio")}} disabled={!this.state.dirtyFlags[`audio${index}`]}>Save</button>
                                        <button className="destructive" onClick={() => {this.onDeleteMedia("audio", index)}}>Delete</button>
                                    </div>
                                </li>)
                        })}
                        <li>
                            <div className="video-preview">
                                <audio src={this.state.uploadAudioDataUrl} width="300px" controls />
                            </div>
                            <input ref={this.audioDataRef} onChange={(e) => {this.onFileLoaded(e)}} accept=".mp3" type="file" disabled={this.state.addAudioUrl ? true : false} />
                            <div className="button-bank">
                                <button className="primary" onClick={() => {this.storeMedia("audio")}} disabled={this.state.uploadAudioData || this.state.addAudioUrl || this.state.saving ? false : true}>Store Audio</button>
                            </div>
                        </li>
                    </ul>
                </div>
                <div id="video-pool" className="media-pool-div">
                    <h3>My Video</h3>
                    <ul>
                        { this.state.videoPool.map((element, index) => {
                            if (!element.volume) {
                                element.volume = 1.0;
                            }

                            return (
                                <li key={`video${index}`} style={{border: this.state.dirtyFlags[`video${index}`] ? "2px solid red" : "none"}}>
                                    <div className="video-preview">
                                        <video 
                                            src={createAbsoluteUrl(element.url)} 
                                            width="300px" 
                                            controls 
                                            preload="none" />
                                    </div>
                                    <label>Name</label>
                                    <input type="text" value={element.name} onChange={(e) => {this.updateMedia(e, index, "video")}} disabled={this.state.saving} />
                                    <label>Chroma Key</label>
                                    <select
                                        value={element.chromaKey}
                                        onChange={(e) => {this.updateChromaKey(e, index, "video")}}>
                                            <option value="none">No Chroma</option>
                                            <option value="red">Red</option>
                                            <option value="green">Green</option>
                                            <option value="blue">Blue</option>
                                            <option value="black">Black</option>
                                    </select>
                                    <label>Volume</label>
                                    <div className="volume-control">
                                        <input type="range" min={0} max={1} step={0.1} value={element.volume} onChange={(e) => {this.updateVolume(e, index, "video")}} />
                                        <span style={{width: "50px"}}>{element.volume * 100}%</span>
                                    </div>
                                    <div className="random-checkbox">
                                        <input type="checkbox" onChange={(e) => {this.onDisableMedia(e, "video", index)}} checked={element.enabled} disabled={this.state.saving}/>
                                        <label>Include in Random</label>
                                    </div>
                                    <div></div>
                                    <div className="button-bank">
                                        <button className="primary" onClick={() => {this.saveMediaConfig("video")}} disabled={!this.state.dirtyFlags[`video${index}`]}>Save</button>
                                        <button className="destructive" onClick={() => {this.onDeleteMedia("video", index)}}>Delete</button>
                                    </div>
                                </li>)
                        })}
                        <li>
                            <div className="video-preview">
                                <video src={this.state.uploadVideoDataUrl} width="300px" controls />
                            </div>
                            <input ref={this.videoDataRef} onChange={(e) => {this.onFileLoaded(e)}} accept=".mp4" type="file" disabled={this.state.addVideoUrl ? true : false} />
                            <div className="button-bank">
                                <button className="primary" onClick={() => {this.storeMedia("video")}} disabled={this.state.uploadVideoData || this.state.addVideoUrl || this.state.saving ? false : true}>Store Video</button>
                            </div>
                        </li>                      
                    </ul>
                </div>
                <div id="image-pool" className="media-pool-div">
                    <h3>My Animated Gifs</h3>
                    <ul>
                        { this.state.imagePool.map((element, index) => {
                            return (
                                <li key={`image${index}`} style={{border: this.state.dirtyFlags[`image${index}`] ? "2px solid red" : "none"}}>
                                    <div className="video-preview">
                                        <img 
                                            id="img-preview"
                                            src={createAbsoluteUrl(element.url)} 
                                            width="300px"
                                            alt="alert" />
                                    </div>
                                    <label>Name</label>
                                    <input type="text" value={element.name} onChange={(e) => {this.updateMedia(e, index, "image")}} disabled={this.state.saving} />
                                    <div></div>
                                    <div className="button-bank">
                                        <button className="primary" onClick={() => {this.saveMediaConfig("image")}} disabled={!this.state.dirtyFlags[`image${index}`]}>Save</button>
                                        <button className="destructive" onClick={() => {this.onDeleteMedia("image", index)}}>Delete</button>
                                    </div>
                                </li>)
                        })}
                        <li>
                            <div className="video-preview" style={{width: "300px", height: "300px"}}>
                                <img src={this.state.uploadImageDataUrl} />
                            </div>
                            <div>
                                <input ref={this.imageDataRef} onChange={(e) => {this.onFileLoaded(e)}} accept=".gif" type="file" /><br/>
                                <div className="button-bank">
                                    <button className="primary" onClick={() => {this.storeMedia("image")}} disabled={this.state.uploadImageData || this.state.saving ? false : true}>Store Gif</button>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}