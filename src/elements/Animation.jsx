import React, {useEffect, useRef, useState} from 'react';

const Animation = (props) => {
    const canvas = useRef();
    const [dimensions, setDimensions] = useState({w: 1, h: 1});
    const [canvasUpdater, setCanvasUpdater] = useState(null);

    const CanvasUpdater = class {
        constructor(width, height, canvas, img) {
            this.frame = 0;
            this.canvas = canvas;
            this.img = img;
            this.width = width;
            this.height = height;
            this.frameWidth = width;
            this.frameHeight = height;
            this.interval = null;
        }

        clearInterval = () => {
            if (this.interval) {
                clearInterval(this.interval);
            }
        }

        updateCanvas = (frameCount, speed, startFrame, endFrame) => {
            if (this.interval) {
                clearInterval(this.interval);
            }

            this.frame = startFrame;
            this.frameWidth = this.width/frameCount;
            this.frameHeight = this.height;

            this.interval = setInterval(() => {
                if (this.frame + 1 > endFrame) {
                    this.frame = startFrame;
                } else {
                    this.frame++;
                }

                if (!this.canvas || !this.canvas.current) {
                    this.clearInterval(this.interval);
                    return;
                }

                const x = this.frame * this.frameWidth;
                const ctx = this.canvas.current.getContext("2d");
                ctx.clearRect(0, 0, this.frameWidth, this.frameHeight);
                ctx.drawImage(this.img, x, 0, this.frameWidth, this.frameHeight, 0, 0, this.frameWidth, this.frameHeight);
            }, 1000/speed);

            return {frameWidth: this.frameWidth, frameHeight: this.frameHeight};
        }
    }

    const updateImage = () => {
        let img = new Image();
        img.src = props.url;
        img.addEventListener('load', (e) => {
            let {width, height} = e.path[0];
            setDimensions({w: width, h: height});
            let updater = new CanvasUpdater(width, height, canvas, img);
            updater.updateCanvas(parseInt(props.frameCount), parseInt(props.speed), parseInt(props.startFrame), parseInt(props.endFrame));
            props.onLoaded(updater.frameWidth, updater.frameHeight);
            setCanvasUpdater(updater);
        }, false);
    }

    useEffect(() => {
        if (canvasUpdater) {
            const {frameWidth, frameHeight} = canvasUpdater.updateCanvas(parseInt(props.frameCount), parseInt(props.speed), parseInt(props.startFrame), parseInt(props.endFrame));
            props.onLoaded(frameWidth, frameHeight);
        }
    }, [props.frameCount, props.speed, props.startFrame, props.endFrame]);

    useEffect(() => {
        if (canvasUpdater) {
            canvasUpdater.clearInterval();
            updateImage();
        }
    }, [props.url]);

    useEffect(() => {
        updateImage();
    }, []);

    return (
        <canvas 
            ref={canvas} 
            style={{border: "1px solid black"}}
            width={dimensions.w/props.frameCount} 
            height={dimensions.h} />
    )
};

export default Animation;