import React from 'react';
// import { fireOverlayEvent } from '../api/StreamCrabsApi';

const Preview = ({alert, botConfig}) => {
    switch (alert.type) {
        case "SOUND":
            let sound = botConfig.audioPool.find(({id}) => alert.id === id);
            return (
                <div className="video-preview">
                    <audio
                        src={sound?.url} 
                        width="300px" 
                        controls />
                </div>
            )
        case "VIDEO":
            let video = botConfig.videoPool.find(({id}) => alert.id === id);
            return (
                <div className="video-preview">
                    <video 
                        src={video?.url} 
                        width="300px" 
                        controls />
                </div>
            )
        case "IMAGE":
            let image = botConfig.imagePool.find(({id}) => alert.id === id);
            return (
                <div className="video-preview">
                    <img
                        src={image?.url} 
                        width="300px"
                        alt="alert" />
                </div>
            )
        case "DYNAMIC":
            return (
                <div>
                </div>
            )
        default:
            return (
                <div></div>
            )
    }
}

export default Preview;