import React, {useEffect, useRef} from 'react';

const previewSize = 64;

const removeAllChildren = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

const SpriteStripe = (props) => {
    const framesDiv = useRef();
    useEffect(() => {
        updateImage();
    }, [props.url, props.frameCount, props.startFrame, props.endFrame]);

    const updateImage = () => {
        let img = new Image();
        img.src = props.url;
        removeAllChildren(framesDiv.current);
        img.addEventListener('load', function (e) {
            let {width, height} = e.target;
            let frameWidth = width/props.frameCount;
            for (let i = 0; i < props.frameCount; i++) {
                let canvas = document.createElement('canvas');
                let aspectRatioH = frameWidth/height;
                let aspectRatioV = height/frameWidth;
                canvas.width = previewSize * aspectRatioH;
                canvas.height = previewSize * aspectRatioV;
                canvas.onclick = (e) => {
                    props.onStartFrameClick(i);
                    e.preventDefault();
                };
                canvas.oncontextmenu = (e) => {
                    props.onEndFrameClick(i);
                    e.preventDefault();
                }

                if (!framesDiv || !framesDiv.current) {
                    return;
                }

                framesDiv.current.append(canvas);

                let ctx = canvas.getContext("2d");
                if (i >= props.startFrame && i <= props.endFrame) {
                    ctx.fillStyle = "#00ffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, frameWidth * i, 0, frameWidth, height, 0, 0, canvas.width, canvas.height);
                
                const s = `${i}`;
                ctx.font = '20px serif';
                ctx.fillStyle = "black";
                let textPos = {x: canvas.width - ctx.measureText(s).width, y: canvas.height};
                ctx.fillText(s, textPos.x, textPos.y);


                // If this element is the startIndex, scroll into view.
                if (i === props.endFrame) {
                    canvas.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                }
            }
        }, false);
    }

    return (
        <div style={{width: "100%", overflowX: "scroll"}} ref={framesDiv} />
    )
}

export default SpriteStripe;