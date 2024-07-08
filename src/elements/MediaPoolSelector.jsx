import React from 'react';

const MediaPoolSelector = (props) => {
    switch (props.type) {
        case "VIDEO":
            return (
                <select value={props.value} onChange={props.onChange} disabled={props.disabled}>
                    <option value=''>Choose a Video...</option>
                    {props.config.videoPool.map((video) => {
                        return <option key={`video-${video.id}-${props.keySuffix}`} value={video.id}>{video.name}</option>
                    })}
                </select>
            );
        case "AUDIO":
            return (
                <select value={props.value} onChange={props.onChange} disabled={props.disabled}>
                    <option value=''>Choose a Sound...</option>
                    {props.config.audioPool.map((audio) => {
                        return <option key={`audio-${audio.id}-${props.keySuffix}`} value={audio.id}>{audio.name}</option>
                    })}
                </select>
            );
        case "IMAGE":
            return (
                <select value={props.value} onChange={props.onChange} disabled={props.disabled}>
                    <option value=''>Choose a Gif...</option>
                    {props.config.imagePool.map((image) => {
                        return <option key={`image-${image.id}-${props.keySuffix}`} value={image.id}>{image.name}</option>
                    })}
                </select>
            );
        default:
            return <></>
    }
}

export default MediaPoolSelector;