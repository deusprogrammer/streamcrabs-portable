(this["webpackJsonpstreamcrabs-overlays"]=this["webpackJsonpstreamcrabs-overlays"]||[]).push([[0],{34:function(e,t,s){},35:function(e,t,s){},65:function(e,t,s){"use strict";s.r(t);var a=s(1),n=s.n(a),i=s(27),r=s.n(i),o=(s(34),s(35),s(9)),c=s(2);class l{constructor(e,t,s,a,n){this.connect=()=>{},this.disconnect=()=>{clearInterval(this.interval),this.ws.onmessage=()=>{},this.ws.onclose=()=>{},this.ws.onerror=()=>{},this.ws.close()},this.next=()=>{if(this.queue.length<=0)return null;let e=this.queue[0];return this.queue=this.queue.slice(1),e},this.hasNext=()=>!(this.queue.length<=0),this.channelId=a,Array.isArray(n)||(n=[n]),this.label=n,this.panelName=t,this.listenFor=s,this.interval={},this.queue=[],this.wsAddress=e,this.ws=null}}var h=s(11);class d extends l{constructor(e,t,s,a,n){super(e,t,s,a,n),this.connect=()=>{this.ws=new h.w3cwebsocket(this.wsAddress),this.ws.onopen=()=>{this.label.forEach((e=>{this.ws.send(JSON.stringify({type:"PANEL_INIT",from:"PANEL",name:this.panelName,subPanel:e})),this.interval[e]&&clearInterval(this.interval),this.interval[e]=setInterval((()=>{this.ws.send(JSON.stringify({type:"PANEL_PING",from:"PANEL",name:this.panelName,subPanel:e}))}),2e4)}))},this.ws.onmessage=e=>{let t=JSON.parse(e.data),s=t.eventData&&t.eventData.subPanel?t.eventData.subPanel:"default";this.listenFor.includes(t.type)&&this.label.includes(s)&&(console.log("Received: "+JSON.stringify(t,null,5)),this.queue.push(t))},this.ws.onclose=e=>{console.log("Socket is closed. Reconnect will be attempted in 5 second.",e.reason),clearInterval(this.interval),setTimeout((()=>{this.connect()}),5e3)},this.ws.onerror=e=>{console.error("Socket encountered error: ",e.message,"Closing socket"),this.ws.close()}}}}let u=function(e,t,s){let a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"default";return console.log("BUILD TARGET: electron"),new d("ws://localhost:8081",e,t,null,a)};var m=s(0);class p extends n.a.Component{constructor(e){var t;super(e),t=this,this.consumer=()=>{if(!this.ws.hasNext())return;let e=this.ws.next();this.onDeath(e.eventData.count)},this.onReset=e=>(this.setState({deaths:0,textScale:1}),e.preventDefault(),!1),this.onDeath=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;t.setState((t=>({deaths:-1!==e?e:t.deaths+1,textScale:1})));let s=1,a=setInterval((()=>{t.state.textScale<=2&&s>0&&t.setState((e=>({textScale:Math.min(e.textScale+.1,2)}))),t.state.textScale>=1&&s<0&&t.setState((e=>({textScale:Math.max(e.textScale-.1,1)}))),t.state.textScale>=2&&s>0&&(s=-1),t.state.textScale<=1&&s<0&&clearInterval(a)}),10)},this.ws=null,this.interval=null,this.state={currentEvent:null,deaths:0,textScale:1}}componentDidMount(){let e=new URLSearchParams(window.location.search);this.ws=u("DEATH_COUNTER",["DEATH_COUNT"],e.get("channelId")),this.ws.connect(),setInterval(this.consumer,0),document.addEventListener("contextmenu",(e=>{this.onReset(e)}))}componentWillUnmount(){document.removeEventListener("contextmenu",(e=>{this.onReset(e)})),this.ws.disconnect()}render(){return Object(m.jsx)("div",{style:{height:"100vh",width:"100vw",userSelect:"none"},className:"App",children:Object(m.jsxs)("span",{style:{fontWeight:"bolder",fontSize:"".concat(32*this.state.textScale,"pt"),WebkitTextStroke:"2px black",WebkitTextFillColor:"white",lineHeight:"100vh",height:"100vh"},children:["Deaths: ",this.state.deaths]})})}}var g=p,b=()=>{const[e,t]=Object(a.useState)(0);return Object(m.jsxs)("div",{style:{textAlign:"center",margin:"auto",width:"100vw",height:"100vh",backgroundColor:"rgb(".concat(e,", ").concat(e,", ").concat(e,")"),color:"rgb(".concat(255-e,", ").concat(255-e,", ").concat(255-e,")")},children:[Object(m.jsx)("h1",{children:"Twitch Tools"}),Object(m.jsxs)("div",{children:[Object(m.jsx)(o.b,{to:"".concat("","/death-counter"),children:"Death Counter"}),Object(m.jsx)("br",{}),Object(m.jsx)(o.b,{to:"".concat("","/sound-player"),children:"Sound Player"}),Object(m.jsx)("br",{}),Object(m.jsx)(o.b,{to:"".concat("","/birdup"),children:"BIRD UP"}),Object(m.jsx)("br",{}),Object(m.jsx)("input",{type:"range",value:e,max:255,onChange:e=>{let{target:{value:s}}=e;t(s)}}),Object(m.jsx)("span",{children:e})]})]})};class x extends n.a.Component{constructor(e){super(e),this.consumer=()=>{if(!this.ws.hasNext())return;let e=this.ws.next();this.setState({requestList:e.eventData.requestList})},this.showQueue=()=>{this.setState({mode:"QUEUE"}),setTimeout((()=>{this.setState({mode:"NEXT_UP"})}),1e4)},this.ws=null,this.interval=null,this.state={mode:"NEXT_UP",requestList:[]}}componentDidMount(){let e=new URLSearchParams(window.location.search);this.ws=u("REQUESTS",["REQUEST"],e.get("channelId")),this.ws.connect(),setInterval(this.consumer,0),setInterval((()=>{this.showQueue()}),6e4)}componentWillUnmount(){this.ws.disconnect()}render(){return Object(m.jsxs)("div",{style:{height:"100vh",width:"100vw",userSelect:"none",position:"relative"},className:"App",children:[Object(m.jsx)("div",{style:{width:"100vw",position:"absolute",bottom:"0px",left:"0px",textAlign:"center",fontSize:"20pt",WebkitTextStroke:"1px black",WebkitTextFillColor:"white"},onClick:this.showQueue,children:this.state.requestList.length>0?Object(m.jsxs)("marquee",{children:["Next up: ",this.state.requestList[this.state.requestList.length-1].request," from ",this.state.requestList[this.state.requestList.length-1].requester]}):Object(m.jsx)("marquee",{children:"No requests so far.  Make a request by donating!"})}),Object(m.jsx)("div",{style:{width:"100vw",position:"absolute",bottom:"0px",left:"0px",textAlign:"center"},children:Object(m.jsxs)("div",{className:"QUEUE"===this.state.mode?"open":"closed",style:{maxWidth:"50%",margin:"auto",padding:"0px 5px",backgroundColor:"gray",color:"white"},children:[Object(m.jsx)("strong",{children:"Coming up:"}),this.state.requestList.slice().reverse().slice(0,3).map(((e,t)=>Object(m.jsxs)("div",{style:{color:0===t?"yellow":"white"},children:[t+1,": ",e.request," from ",e.requester]},"entry-".concat(t))))]})})]})}}var v=x;new URLSearchParams(window.location.search);class j extends n.a.Component{constructor(){super(),this.birdup=async()=>{this.stages[0].current.style.display="block";let e=new Audio("".concat("","/sounds/birdup.mp3"));await e.play();let t=1,s=setInterval((()=>{if(t>=this.stages.length)return clearInterval(s),void setTimeout((()=>{for(let e of this.stages)e.current.style.display="none";setTimeout((()=>{this.playing=!1,this.props.onComplete("birdup")}),5e3)}),2e3);this.stages[t++].current.style.display="block"}),300)},this.playing=!1,this.textRef=n.a.createRef(),this.imageRef1=n.a.createRef(),this.imageRef2=n.a.createRef(),this.imageRef3=n.a.createRef(),this.imageRef4=n.a.createRef(),this.imageRef5=n.a.createRef(),this.imageRef6=n.a.createRef(),this.stages=[this.textRef,this.imageRef1,this.imageRef2,this.imageRef3,this.imageRef4,this.imageRef5,this.imageRef6],this.birdQueue=[],this.state={}}componentDidMount(){this.birdup()}render(){return Object(m.jsxs)("div",{style:{height:"100vh",width:"100vw",userSelect:"none",position:"relative"},className:"App",children:[Object(m.jsx)("img",{alt:"birdup",style:{position:"absolute",fontSize:"20px",right:"0px",bottom:"0px",height:"20%",zIndex:"101",display:"none"},ref:this.imageRef1,src:"".concat("","/images/birdup.png")}),Object(m.jsx)("img",{alt:"birdup",style:{position:"absolute",fontSize:"20px",right:"0px",bottom:"0px",height:"40%",zIndex:"102",display:"none"},ref:this.imageRef2,src:"".concat("","/images//birdup.png")}),Object(m.jsx)("img",{alt:"birdup",style:{position:"absolute",fontSize:"20px",right:"0px",bottom:"0px",height:"60%",zIndex:"103",display:"none"},ref:this.imageRef3,src:"".concat("","/images//birdup.png")}),Object(m.jsx)("img",{alt:"birdup",style:{position:"absolute",fontSize:"20px",right:"0px",bottom:"0px",height:"80%",zIndex:"104",display:"none"},ref:this.imageRef4,src:"".concat("","/images//birdup.png")}),Object(m.jsx)("img",{alt:"birdup",style:{position:"absolute",fontSize:"20px",right:"0px",bottom:"0px",height:"100%",zIndex:"105",display:"none"},ref:this.imageRef5,src:"".concat("","/images//birdup.png")}),Object(m.jsx)("img",{alt:"birdup",style:{position:"absolute",fontSize:"20px",right:"0px",bottom:"0px",height:"120%",zIndex:"106",display:"none"},ref:this.imageRef6,src:"".concat("","/images//birdup.png")}),Object(m.jsx)("div",{style:{position:"absolute",fontFamily:"Cooper Black",WebkitTextStroke:"5px black",WebkitTextFillColor:"#CE01E2",bottom:"0px",left:"50%",transform:"translate(-50%, -50%)",fontSize:"70pt",zIndex:"200",display:"none"},ref:this.textRef,children:"BIRD UP!"})]})}}var w=j,f=s(10),y=s.n(f);var O=e=>{let t,s,n=!1,i=!1,r=null,o=1440;function c(){this.load.image("ground","/images/ground.png"),this.load.image("water","/images/water.png"),this.load.spritesheet("slime","/images/slime-sprite.png",{frameWidth:80,frameHeight:80}),this.load.spritesheet("link","/images/link.png",{frameWidth:80,frameHeight:160}),this.load.audio("bgm",["/sounds/bgm.mp3"]),this.load.audio("battle",["/sounds/battle.wav"]),this.load.audio("hurt",["/sounds/hurt.wav"]),this.load.audio("die",["/sounds/die.wav"]),this.load.audio("fanfare",["/sounds/fanfare.wav"])}function l(){const a=e.variable,c=this.game.scale.width/o,l=this.textures.get("ground").getSourceImage().width*c,h=this.textures.get("ground").getSourceImage().height*c,d=this.textures.get("water").getSourceImage().width*c,u=[(100*Math.random()+200)*c,(100*Math.random()+200)*c];t=this.physics.add.staticGroup(),s=this.physics.add.staticGroup(),this.anims.create({key:"wobble",frames:this.anims.generateFrameNumbers("slime",{start:0,end:2}),frameRate:10,repeat:-1}),this.anims.create({key:"idle",frames:this.anims.generateFrameNumbers("link",{start:0,end:0}),frameRate:10,repeat:-1}),this.anims.create({key:"hurt",frames:this.anims.generateFrameNumbers("link",{start:1,end:1}),frameRate:10,repeat:-1});let m=this.sound.add("bgm",{loop:!0,volume:.25}),p=this.sound.add("battle",{loop:!1}),g=this.sound.add("hurt",{loop:!1,volume:3}),b=this.sound.add("die",{loop:!1}),x=this.sound.add("fanfare",{loop:!1,volume:1});b.once("complete",(()=>{this.scene.stop(),this.sys.game.destroy(!0),clearTimeout(r),e.onComplete()})),x.once("complete",(()=>{this.scene.stop(),this.sys.game.destroy(!0),clearTimeout(r),e.onComplete()})),p.play(),m.play();const v=this.game.scale.height-(h-u[1]);let j=this.physics.add.sprite(l+200,v,"link");j.setOrigin(0,1),j.setBounce(.5),j.setScale(c),j.setGravityY(300),j.refreshBody(),j.body.setCollideWorldBounds(!0),j.anims.play("idle",!0),this.physics.add.collider(j,t);for(let e=0;e<a;e++){let a=this.physics.add.sprite(.5*-e,Math.random()*(this.game.scale.height-100)-(h-u[0]),"slime");a.setScale(c),a.setBounce(Math.min(1,Math.random()+.5)),a.body.setGravity(400),a.anims.play("wobble",!0),a.setVelocityX(300*Math.random()),this.physics.add.collider(a,t),this.physics.add.overlap(j,a,(()=>{n||(n=!0,g.play()),j.play("hurt"),j.setVelocity(500,-50),j.body.useDamping=!0,j.setDrag(.99)}),null,this),this.physics.add.overlap(j,s,(()=>{i||(i=!0,b.play()),m.stop(),j.play("hurt"),j.setVelocity(0,50)}),null,this)}let w=0;for(;w<this.game.scale.width;){let e=s.create(0,0,"water");e.setScale(c),e.setOrigin(0,1),e.x=w,e.y=this.game.scale.height+100,e.refreshBody(),w+=d}for(let e=0;e<2;e++){let s=e*(l+200),a=u[e],n=t.create(s,this.game.scale.height+a,"ground");n.setOrigin(0,1),n.setScale(c),n.refreshBody()}r=setTimeout((()=>{m.stop(),x.play()}),1e4)}function h(){}return Object(a.useEffect)((()=>{(()=>{const e={type:y.a.AUTO,width:"100vw",height:"100vh",transparent:!0,parent:"phaser",scene:{preload:c,create:l,update:h},physics:{default:"arcade",arcade:{gravity:{y:200}}}};new y.a.Game(e)})()}),[]),Object(m.jsx)("div",{children:Object(m.jsx)("div",{id:"phaser"})})};var S=e=>{let t=0,s=!1,n=1440;function i(){this.load.image("ground","/images/ground.png"),e.config.sprites.forEach(((e,t)=>{this.load.spritesheet("sprite".concat(t),e.file,{frameWidth:e.frameWidth,frameHeight:e.frameHeight})})),this.load.audio("music",[e.config.music.file]),this.load.audio("leaving",[e.config.leavingSound.file])}function r(){const a=this.game.scale.width/n,i=e.variable,r=e.config.variant?e.config.variant:"CHARGE_RIGHT";e.config.sprites.forEach(((e,t)=>{this.anims.create({key:"animation".concat(t),frames:this.anims.generateFrameNumbers("sprite".concat(t),{start:e.startFrame,end:e.endFrame}),frameRate:e.frameRate,repeat:-1})}));let o,c=this.sound.add("music",{loop:!0,volume:e.config.music.volume}),l=this.sound.add("leaving",{loop:!1,volume:e.config.leavingSound.volume}),h=100*Math.ceil(Math.log2(i)+1),d=Math.ceil(5e3/i);"CHARGE_RIGHT"===r?(o=this.physics.add.sprite(this.game.scale.width+256,0,"ground"),o.setOrigin(0,0),o.displayHeight=this.game.scale.height):"CHARGE_LEFT"===r?(o=this.physics.add.sprite(-256,0,"ground"),o.setOrigin(1,0),o.displayHeight=this.game.scale.height):"CHARGE_UP"===r?(o=this.physics.add.sprite(0,-256,"ground"),o.setOrigin(0,1),o.displayWidth=this.game.scale.width):"CHARGE_DOWN"===r&&(o=this.physics.add.sprite(0,this.game.scale.width+256,"ground"),o.setOrigin(0,0),o.displayWidth=this.game.scale.width),t=i,c.play();for(let s=0;s<i;s++){let n,i=Math.floor(Math.random()*e.config.sprites.length);const c=e.config.sprites[i].frameHeight*a,u=e.config.sprites[i].frameWidth*a;"CHARGE_RIGHT"===r?(n=this.physics.add.sprite(-s*d,Math.random()*(this.game.scale.height-c),"sprite".concat(i)),n.setOrigin(0,0),n.setScale(a),n.body.setGravity(0),n.anims.play("animation".concat(i),!0),n.setVelocityX(h)):"CHARGE_LEFT"===r?(n=this.physics.add.sprite(s*d+this.game.scale.width,Math.random()*(this.game.scale.height-c),"sprite".concat(i)),n.setOrigin(0,0),n.setScale(a),n.body.setGravity(0),n.anims.play("animation".concat(i),!0),n.setVelocityX(-h)):"CHARGE_UP"===r?(n=this.physics.add.sprite(Math.random()*(this.game.scale.width-u),s*d+this.game.scale.height,"sprite".concat(i)),n.setOrigin(0,0),n.setScale(a),n.body.setGravity(0),n.anims.play("animation".concat(i),!0),n.setVelocityY(-h)):"CHARGE_DOWN"===r&&(n=this.physics.add.sprite(Math.random()*(this.game.scale.width-u),-s*d,"sprite".concat(i)),n.setOrigin(0,0),n.setScale(a),n.body.setGravity(0),n.anims.play("animation".concat(i),!0),n.setVelocityY(h)),this.physics.add.overlap(n,o,(()=>{l.play(),n.destroy(),t--}),null,this)}setTimeout((()=>{s=!0}),15e3)}function o(){t<=0&&s&&(this.scene.stop(),this.sys.game.destroy(!0),e.onComplete&&e.onComplete())}return Object(a.useEffect)((()=>{(()=>{const e={type:y.a.AUTO,width:window.innerWidth,height:window.innerHeight,transparent:!0,parent:"phaser",scene:{preload:i,create:r,update:o},physics:{default:"arcade",arcade:{gravity:{y:0}}}};new y.a.Game(e)})()}),[]),Object(m.jsx)("div",{children:Object(m.jsx)("div",{id:"phaser"})})};class E extends n.a.Component{constructor(e){super(e),this.timerCallback=()=>{this.videoElement&&this.videoElement.current&&(this.videoElement.current.paused||this.videoElement.current.ended)||(this.computeFrame(),this.timeOut=setTimeout((()=>{this.timerCallback()}),0))},this.computeFrame=()=>{if(!this.videoElement.current)return;this.ctx1.drawImage(this.videoElement.current,0,0,this.state.vw,this.state.vh);const e=this.ctx1.getImageData(0,0,this.state.vw,this.state.vh),t=e.data.length;for(let s=0;s<t;s+=4){const t=e.data[s+0],a=e.data[s+1],n=e.data[s+2];"green"===this.props.chromaKey?a>t+n&&(e.data[s+3]=0):"red"===this.props.chromaKey?t>a+n&&(e.data[s+3]=0):"blue"===this.props.chromaKey?n>t+a&&(e.data[s+3]=0):"black"===this.props.chromaKey?a<=177&&t<=177&&n<=177&&(e.data[s+3]=0):"custom"===this.props.chromaKey&&a>=this.props.lowerBound&&a<=this.props.upperBound&&t>=this.props.lowerBound&&t<=n>=this.props.lowerBound&&this.props.upperBound&&n<=this.props.upperBound&&(e.data[s+3]=0)}this.ctx2.putImageData(e,0,0)},this.videoElement=n.a.createRef(),this.canvasElement1=n.a.createRef(),this.canvasElement2=n.a.createRef(),this.ctx1=null,this.ctx2=null,this.timeOut=null,this.state={averageColor:{r:0,g:0,b:0},vh:Math.max(document.documentElement.clientHeight||0,window.innerHeight||0),vw:Math.max(document.documentElement.clientWidth||0,window.innerWidth||0)}}componentDidMount(){this.videoElement.current.addEventListener("ended",(()=>{this.timeOut&&clearTimeout(this.timeOut),this.props.onComplete("randomcustomvideo")})),this.ctx1=this.canvasElement1.current.getContext("2d"),this.ctx2=this.canvasElement2.current.getContext("2d"),this.videoElement.current.addEventListener("play",(()=>{this.timerCallback()}),!1),window.onresize=()=>{this.setState({vh:Math.max(document.documentElement.clientHeight||0,window.innerHeight||0),vw:Math.max(document.documentElement.clientWidth||0,window.innerWidth||0)})},this.videoElement.current.volume=this.props.volume,this.videoElement.current.play()}render(){Math.ceil(7*Math.random());return Object(m.jsxs)("div",{style:{overflow:"hidden"},children:[Object(m.jsx)("video",{style:{display:"none"},src:this.props.url,controls:!1,crossOrigin:"anonymous",ref:this.videoElement}),Object(m.jsx)("canvas",{height:this.state.vh,width:this.state.vw,style:{display:"none"},ref:this.canvasElement1}),Object(m.jsx)("canvas",{height:this.state.vh,width:this.state.vw,style:{border:"1px solid black"},ref:this.canvasElement2})]})}}class k extends n.a.Component{constructor(e){super(e)}async componentDidMount(){let e=new Audio(this.props.soundUrl);e.volume=this.props.volume,e.addEventListener("ended",(()=>{this.props.onComplete()})),await e.play()}render(){return Object(m.jsx)("img",{src:this.props.url})}}var I=k;class T extends n.a.Component{constructor(e){super(e),this.consumer=()=>{if(!this.ws.hasNext()||this.state.currentEvent)return void console.log("SKIPPING: ".concat(this.ws.hasNext()," || ").concat(this.state.currentEvent));console.log("EVENT");let e=this.ws.next();this.setState({currentEvent:e})},this.reset=()=>{this.setState({currentEvent:null})},this.ws=null,this.interval=null,this.state={currentEvent:null,connected:!1}}componentDidMount(){let e=new URLSearchParams(window.location.search);this.ws=u("MULTI",["BIRDUP","BADAPPLE","VIDEO","IMAGE","DYNAMIC"],e.get("channelId"),e.get("subPanel")?e.get("subPanel"):"default",(()=>{this.setState({connected:!0})})),this.ws.connect(),setInterval(this.consumer,5e3)}componentWillUnmount(){this.ws.disconnect()}render(){let e=null;if(!this.state.currentEvent)return Object(m.jsx)("div",{});switch(this.state.currentEvent.type){case"BIRDUP":e=Object(m.jsx)(w,{onComplete:this.reset,requester:this.state.currentEvent.eventData.requester});break;case"VIDEO":e=Object(m.jsx)(E,{onComplete:this.reset,url:this.state.currentEvent.eventData.url,volume:this.state.currentEvent.eventData.volume,soundUrl:this.state.currentEvent.eventData.soundUrl,soundVolume:this.state.currentEvent.eventData.soundVolume,chromaKey:this.state.currentEvent.eventData.chromaKey});break;case"IMAGE":e=Object(m.jsx)(I,{onComplete:this.reset,url:this.state.currentEvent.eventData.url,soundUrl:this.state.currentEvent.eventData.soundUrl,volume:this.state.currentEvent.eventData.soundVolume});break;case"DYNAMIC":"ZELDA2"===this.state.currentEvent.eventData.theme?e=Object(m.jsx)(O,{onComplete:this.reset,variable:this.state.currentEvent.eventData.variable}):"STORED"===this.state.currentEvent.eventData.theme&&(e=Object(m.jsx)(S,{onComplete:this.reset,variable:this.state.currentEvent.eventData.variable,config:this.state.currentEvent.eventData.customTheme}))}return Object(m.jsx)("div",{children:Object(m.jsxs)("div",{className:"multiContainer",children:[e,Object(m.jsx)("span",{className:"alert-text",children:this.state.currentEvent.eventData.message})]})})}}class D extends n.a.Component{constructor(e){super(e),this.consumer=async()=>{if(!this.ws.hasNext()||this.consumerLocked)return;let e=this.ws.next(),{url:t,volume:s}=e.eventData;this.consumerLocked=!0;let a=new Audio(t);this.setState({soundPlaying:!0}),a.addEventListener("ended",(()=>{this.setState({soundPlaying:!1}),setTimeout((()=>{this.consumerLocked=!1}),5e3)})),a.volume=s,await a.play()},this.ws=null,this.consumerLocked=!1,this.state={soundPlaying:!1,requester:null,mediaName:null}}componentDidMount(){let e=new URLSearchParams(window.location.search);this.ws=u("SOUND_PLAYER",["AUDIO"],e.get("channelId"),"default",(()=>{this.setState({connected:!0})})),this.ws.connect(),setInterval(this.consumer,5e3)}componentWillUnmount(){this.ws.disconnect()}render(){return Object(m.jsx)("div",{style:{height:"100vh",width:"100vw",userSelect:"none"},className:"App",children:this.state.soundPlaying?Object(m.jsxs)("div",{children:[Object(m.jsx)("img",{style:{position:"absolute",width:"100px",height:"100px",top:"50%",left:"50%",transform:"translate(-50%, -50%)"},src:"".concat("","/images/speaker.png")}),Object(m.jsx)("span",{style:{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%, -50%)",fontSize:"20pt",WebkitTextStroke:"1px black",WebkitTextFillColor:"white"},children:this.state.message})]}):null})}}var C=D;var R=e=>Object(m.jsxs)("div",{children:[Object(m.jsx)("h1",{children:"Speech Synthesis Tester"}),Object(m.jsxs)("table",{children:[Object(m.jsxs)("tr",{children:[Object(m.jsx)("td",{children:"SpeechSynthesisUtterance Supported"}),Object(m.jsx)("td",{children:SpeechSynthesisUtterance?"Yes":"No"})]}),Object(m.jsxs)("tr",{children:[Object(m.jsx)("td",{children:"window.speechSynthesis Supported"}),Object(m.jsx)("td",{children:window.speechSynthesis?"Yes":"No"})]})]}),Object(m.jsx)("button",{onClick:()=>{(()=>{let e=new SpeechSynthesisUtterance;e.text="This is a test of the web standard Speech Synthesis module.  If you can hear this, the test was a success.",window.speechSynthesis.speak(e)})()},children:"Test Speech Synthesis"})]});let U=e=>{let t=Math.floor(e/60),s=Math.floor(e%60),a=Math.floor(1e3*(e-Math.trunc(e)));return"".concat(t.toString().padStart(2,"0"),":").concat(s.toString().padStart(2,"0"),".").concat(a.toString().padStart(3,"0"))},A=(e,t)=>"data:text/vtt;base64,"+btoa(((e,t)=>(t&&""!==t||(t="[Missing Audio]"),"WEBVTT\n\n"+e.map((e=>!t||"[male_dub]"!==e.text&&"[female_dub]"!==e.text?"".concat(U(e.startTime)," --\x3e ").concat(U(e.endTime),"\n").concat(e.text):"".concat(U(e.startTime)," --\x3e ").concat(U(e.endTime),"\n").concat(t))).join("\n\n")))(e,t));class L extends n.a.Component{constructor(e){super(e),this.videoElement=n.a.createRef(),this.timeOut=null,this.currentIndex=-1,this.isTalking=!1,this.hasEnded=!1,this.state={vh:Math.max(document.documentElement.clientHeight||0,window.innerHeight||0),vw:Math.max(document.documentElement.clientWidth||0,window.innerWidth||0),muted:!1}}componentDidMount(){window.onresize=()=>{this.setState({vh:Math.max(document.documentElement.clientHeight||0,window.innerHeight||0),vw:Math.max(document.documentElement.clientWidth||0,window.innerWidth||0)})},this.videoElement.current.play(),this.zombieInterval=window.setInterval((()=>{if(console.log("CHECKING FOR ZOMBIES"),console.log("IS TALKING? "+this.isTalking),console.log("HAS ENDED?  "+this.hasEnded),!this.isTalking&&this.hasEnded)return console.log("OKAY, NOW I'M DONE."),this.pauseListener(),void this.props.onComplete()}),3e3)}componentWillUnmount(){console.log("SHIT"),window.clearInterval(this.zombieInterval)}setIsTalking(e){this.isTalking=e}setMuted(e){this.setState({muted:e})}setCurrentIndex(e){this.currentIndex=e}speak(e,t){let s=null;this.setIsTalking(!0),s="[male_dub]"===e.text?window.maleVoice:window.femaleVoice;let a=new SpeechSynthesisUtterance;a.voice=s,a.text=t,a.onend=()=>{console.log("SPEAKING HAS ENDED"),this.setIsTalking(!1),document.getElementById("videoElement").play()},window.speechSynthesis.speak(a)}updateSubtitle(e){let t=this.props.subtitles.findIndex((t=>e.currentTime>t.startTime&&e.currentTime<t.endTime));if(t!==this.currentIndex){if(this.isTalking)return void e.pause();if(this.currentIndex>=0){let e=this.props.subtitles[this.currentIndex];"[male_dub]"!==e.text&&"[female_dub]"!==e.text||this.setMuted(!1)}if(t>=0){let e=this.props.subtitles[t];"[male_dub]"!==e.text&&"[female_dub]"!==e.text||(this.setMuted(!0),this.props.substitution&&this.speak(e,this.props.substitution))}this.setCurrentIndex(t)}}startListener(){this.interval=setInterval((()=>{let e=document.getElementById("videoElement");e?this.updateSubtitle(e):this.pauseListener()}),1e3/60)}pauseListener(){clearInterval(this.interval)}render(){return Object(m.jsx)("div",{style:{overflow:"hidden",width:"100vw",height:"100vh",position:"relative"},children:Object(m.jsx)("div",{style:{position:"absolute",top:"0px",width:"100%",height:"100vh",zIndex:9998,backgroundColor:"black"},children:Object(m.jsx)("video",{id:"videoElement",src:this.props.url,style:{width:this.state.vw,height:this.state.vh},controls:!1,crossOrigin:"anonymous",onPlay:()=>{this.startListener()},onPause:()=>{this.pauseListener()},onEnded:()=>{this.isTalking?(console.log("DONE"),this.pauseListener(),this.props.onComplete()):(console.log("NOT QUITE DONE"),this.hasEnded=!0)},muted:this.state.muted,ref:this.videoElement,children:Object(m.jsx)("track",{label:"English",kind:"subtitles",srcLang:"en",src:A(this.props.subtitles,this.props.substitution),default:!0})})})})}}class N extends n.a.Component{constructor(e){super(e),this.consumer=()=>{if(!this.ws.hasNext()||this.state.currentEvent)return;let e=this.ws.next();e.eventData.substitution&&(e.eventData.substitution=e.eventData.substitution.replace(/[^\x00-\x7F]/g,"")),this.setState({currentEvent:e})},this.ws=null,this.state={currentEvent:null,joinedMiniGame:!1}}componentDidMount(){let e=new URLSearchParams(window.location.search);this.ws=u("WTD",["DUB"],e.get("channelId")),this.ws.connect(),setInterval(this.consumer,0)}componentWillUnmount(){this.ws.disconnect()}render(){return this.state.currentEvent&&this.state.joinedMiniGame?Object(m.jsxs)("div",{style:{backgroundColor:"black"},children:[Object(m.jsx)("div",{style:{position:"absolute",top:"0px",left:"0px",width:"20vw",zIndex:9999},children:Object(m.jsx)("img",{style:{width:"20vw"},src:"images/wtd.png"})}),this.state.currentEvent.eventData.requester?Object(m.jsxs)("span",{style:{position:"absolute",top:"0px",left:"50%",transform:"translateX(-50%)",fontSize:"20pt",WebkitTextStroke:"1px black",WebkitTextFillColor:"white",zIndex:"9999"},children:["Submitted By ",this.state.currentEvent.eventData.requester]}):null,Object(m.jsx)(L,{url:this.state.currentEvent.eventData.videoData.videoUrl,subtitles:this.state.currentEvent.eventData.videoData.subtitles,substitution:this.state.currentEvent.eventData.substitution,onComplete:()=>{this.setState({currentEvent:null})}})]}):Object(m.jsxs)("div",{style:{background:"black",height:"100vh"},children:[Object(m.jsx)("div",{style:{position:"absolute",top:"0px",left:"0px",width:"20vw",zIndex:9999},children:Object(m.jsx)("img",{style:{width:"20vw"},src:"images/wtd.png"})}),Object(m.jsx)("div",{style:{position:"absolute",width:"100vw",textAlign:"center",top:"50%",left:"50%",transform:"translate(-50%, -50%)",fontSize:"20pt",WebkitTextStroke:"1px black",WebkitTextFillColor:"white"},children:'Submit your answer with the command "!games:wtd:answer" followed by your submission!'}),this.state.joinedMiniGame?null:Object(m.jsx)("button",{onClick:()=>{this.setState({joinedMiniGame:!0})},style:{position:"absolute",bottom:"0px",right:"0px",width:"200px",height:"100px"},children:"Click to Join Mini Games"})]})}}const M={YOSHI:{message:"Incoming raid from ${raider} with a party of ${raidSize}!",sprites:[{file:"/images/yoshi/yoshi-walk.png",startFrame:0,endFrame:9,frameWidth:128,frameHeight:128,frameRate:15},{file:"/images/yoshi/yoshi-walk-black.png",startFrame:0,endFrame:9,frameWidth:128,frameHeight:128,frameRate:15},{file:"/images/yoshi/yoshi-walk-blue.png",startFrame:0,endFrame:9,frameWidth:128,frameHeight:128,frameRate:15},{file:"/images/yoshi/yoshi-walk-pink.png",startFrame:0,endFrame:9,frameWidth:128,frameHeight:128,frameRate:15},{file:"/images/yoshi/yoshi-walk-purple.png",startFrame:0,endFrame:9,frameWidth:128,frameHeight:128,frameRate:15},{file:"/images/yoshi/yoshi-walk-yellow.png",startFrame:0,endFrame:9,frameWidth:128,frameHeight:128,frameRate:15}],music:{file:"/sounds/yoshi/yoshi-fanfare.mp3",volume:1},leavingSound:{file:"/sounds/yoshi/yoshi-tongue.mp3",volume:1}},SKULLMAN:{message:"HOLY SHIT! ${raider} raided with a party of ${raidSize}!",sprites:[{file:"/images/skullman/skullman-walk.png",startFrame:0,endFrame:9,frameWidth:99,frameHeight:128,frameRate:15}],music:{file:"/sounds/skullman/battle.mp3",volume:1},leavingSound:{file:"/sounds/skullman/ash-groovy.mp3",volume:3}},CHAIR:{message:"CHEESE IT UP! ${raider} raided with a party of ${raidSize}!",sprites:[{file:"/images/chair/cheesesteak-walk.png",startFrame:0,endFrame:5,frameWidth:128,frameHeight:128,frameRate:15},{file:"/images/chair/yuu.png",startFrame:24,endFrame:29,frameWidth:128,frameHeight:128,frameRate:15},{file:"/images/chair/tanako.png",startFrame:30,endFrame:41,frameWidth:128,frameHeight:128,frameRate:15}],music:{file:"/sounds/chair/music.mp3",volume:1},leavingSound:{file:"/sounds/chair/cheeseitup.wav",volume:1}}};var W=s(29),P=s.n(W);var H=()=>{const[e,t]=Object(a.useState)(!1),[s,n]=Object(a.useState)("daddyfartbux"),[i,r]=Object(a.useState)(100),[o,c]=Object(a.useState)("CUSTOM"),[l,h]=Object(a.useState)("SKULLMAN"),[d,u]=Object(a.useState)({});Object(a.useEffect)((async()=>{const e=new URLSearchParams(window.location.search),t=e.get("theme"),s=e.get("key");if(n(e.get("raider")?e.get("raider"):"daddyfartbux"),r(e.get("raidSize")?e.get("raidSize"):10),c(e.get("theme")?e.get("theme"):"YOSHI"),h(e.get("key")?e.get("key"):"SKULLMAN"),"STORED"===t){let e=await(async e=>(await P.a.get("https://deusprogrammer.com/api/streamcrabs/dynamic-alerts/".concat(e),{headers:{"X-Access-Token":localStorage.getItem("accessToken")}})).data)(s);u(e)}}),[]);let p=null;switch(o){case"ZELDA":p=Object(m.jsx)(O,{variable:i,onComplete:()=>{t(!1)}});break;case"CUSTOM":p=Object(m.jsx)(S,{variable:i,config:M[l],onComplete:()=>{t(!1)}});break;case"STORED":p=Object(m.jsx)(S,{variable:i,config:d,onComplete:()=>{t(!1)}});break;default:p=null}return Object(m.jsx)("div",{children:e?Object(m.jsxs)("div",{children:[p,Object(m.jsx)("span",{className:"alert-text",children:"".concat(s," is raiding with ").concat(i," viewers.")})]}):Object(m.jsxs)("div",{children:[Object(m.jsxs)("p",{children:["Testing with size ",Object(m.jsx)("b",{children:i})," and raider ",Object(m.jsx)("b",{children:s})]}),Object(m.jsx)("button",{onClick:()=>{t(!0)},children:"Click to Test"}),Object(m.jsx)("h3",{children:"Debug"}),Object(m.jsx)("pre",{children:JSON.stringify(d,null,5)})]})})};class G extends n.a.Component{constructor(e){super(e),this.consumer=()=>{if(!this.ws.hasNext()||this.consumerLocked)return;let e=this.ws.next(),{requester:t,text:s}=e.eventData;this.consumerLocked=!0;let a=new SpeechSynthesisUtterance;a.text="".concat(t," said: '").concat(s,"'"),a.voice=window.maleVoice;let n=[...this.state.textList];n.push("- "+a.text),window.speechSynthesis.speak(a),this.setState({textList:n}),a.onend=()=>{setTimeout((()=>{this.consumerLocked=!1}),5e3)}},this.start=()=>{let e=new URLSearchParams(window.location.search);this.ws=u("TTS",["TTS"],e.get("channelId")),this.ws.connect(),setInterval(this.consumer,0),this.setState({started:!0,textList:["** Connected to Websocket **"]})},this.consumerLocked=!1,this.state={soundPlaying:!1,requester:null,mediaName:null,started:!1,textList:[]}}componentWillUnmount(){this.ws.disconnect()}render(){return Object(m.jsxs)("div",{children:[Object(m.jsx)("h1",{children:"TTS Tool (Open in Browser, not in Streaming Tool)"}),this.state.started?Object(m.jsx)("button",{disabled:!0,children:"TTS Activated"}):Object(m.jsx)("button",{onClick:()=>{this.start()},children:"Activate TTS"}),Object(m.jsx)("h3",{children:"Log"}),Object(m.jsx)("pre",{style:{backgroundColor:"gray",color:"white",width:"80%",height:"500px",marginLeft:"10px"},children:this.state.textList.map((e=>" "+e+"\n"))})]})}}var F=G;var z=()=>{const[e,t]=Object(a.useState)(null),[s,n]=Object(a.useState)(0),[i,r]=Object(a.useState)(255),[o,c]=Object(a.useState)(!0);let l=new URLSearchParams(window.location.search),h=l.get("videoUrl"),d=l.get("backgroundUrl");return Object(m.jsxs)("div",{style:{background:"url(".concat(d,")")},children:[o?Object(m.jsx)(E,{url:h,volume:1,chromaKey:e,lowerBound:s,upperBound:i,onComplete:()=>{c(!1),setTimeout((()=>{c(!0)}),500)}}):null,Object(m.jsxs)("div",{style:{position:"absolute",bottom:"0px",width:"100vw",textAlign:"center",zIndex:"9999"},children:[Object(m.jsx)("label",{children:"Chroma Key\xa0"}),Object(m.jsxs)("select",{onChange:e=>{let{target:{value:s}}=e;t(s)},children:[Object(m.jsx)("option",{children:"None"}),Object(m.jsx)("option",{value:"red",children:"Red"}),Object(m.jsx)("option",{value:"green",children:"Green"}),Object(m.jsx)("option",{value:"blue",children:"Blue"}),Object(m.jsx)("option",{value:"black",children:"Black"}),Object(m.jsx)("option",{value:"custom",children:"Custom"})]}),Object(m.jsx)("br",{}),"custom"===e?Object(m.jsxs)(m.Fragment,{children:[Object(m.jsx)("label",{children:"Lower Bound"}),Object(m.jsx)("input",{type:"range",value:s,max:255,onChange:e=>{let{target:{value:t}}=e;n(t)}}),Object(m.jsx)("span",{children:s}),Object(m.jsx)("br",{}),Object(m.jsx)("label",{children:"Upper Bound"}),Object(m.jsx)("input",{type:"range",value:i,max:255,onChange:e=>{let{target:{value:t}}=e;r(t)}}),Object(m.jsx)("span",{children:i})]}):null]})]})},V=()=>{let e;const[t,s]=Object(a.useState)(0),[n,i]=Object(a.useState)(0),[r,o]=Object(a.useState)(""),[c,l]=Object(a.useState)(!1);let h={},d=0,p=0;const g=()=>{if(!e.hasNext()||c)return;if(!e)return;let t=e.next();t.eventData.init?(h={increase:new Audio(t.eventData.increaseSoundUrl),decrease:new Audio(t.eventData.decreaseSoundUrl),complete:new Audio(t.eventData.completeSoundUrl)},d=t.eventData.currentValue,p=t.eventData.maxValue,s(t.eventData.currentValue),i(t.eventData.maxValue)):b(t.eventData.currentValue)};Object(a.useEffect)((()=>{let t=new URLSearchParams(window.location.search);e=u("GAUGE",["GAUGE"],t.get("channelId"),t.get("subPanel")?t.get("subPanel"):"default",(()=>{})),e.connect(),o(t.get("label"));const s=setInterval(g,5e3);return()=>{clearInterval(s)}}),[]);const b=e=>{let t=(e-d)/20;e=parseInt(e);let a=setInterval((()=>{s((s=>(s>=p&&h.complete.play(),s>=e?(s=e,d=e,clearInterval(a),l(!1),s):(h.increase.currentTime=0,h.increase.play(),s+t))))}),100);l(!0)};return n?Object(m.jsxs)("div",{style:{position:"relative"},children:[Object(m.jsxs)("progress",{style:{height:"100vh",maxHeight:"100px",width:"100vw"},value:t,max:n,children:[t,"%"]}),Object(m.jsx)("br",{}),Object(m.jsx)("span",{style:{position:"absolute",top:"50%",transform:"translateY(-50%)",textAlign:"center",width:"100vw",fontSize:"30px",fontFamily:"Marker Felt, fantasy",WebkitTextStrokeWidth:"1px",WebkitTextStrokeColor:"black",color:"white"},children:"".concat(r," ").concat(t,"/").concat(n)})]}):Object(m.jsx)("div",{})},B=()=>{let e;const[t,s]=Object(a.useState)(!1),[n,i]=Object(a.useState)(null),[r,o]=Object(a.useState)(!1),c={};let l=0;const h=()=>{if(!e||!e.hasNext()||t)return;let s=e.next();s.eventData.init?(console.log("Adding Gauge: "+s.eventData.subPanel),c[s.eventData.gaugeKey]={label:s.eventData.label,currentProgress:s.eventData.currentValue,maxValue:s.eventData.maxValue,sounds:{increase:new Audio(s.eventData.increaseSoundUrl),decrease:new Audio(s.eventData.decreaseSoundUrl),complete:new Audio(s.eventData.completeSoundUrl)}}):p(s.eventData.gaugeKey,s.eventData.currentValue)},d=()=>{if(!t){const e=Object.keys(c);l+=1,l>=e.length&&(l=0);const t=e[l],s=c[t];if(console.log("GAUGES:     "+e),console.log("NEXT GAUGE: "+JSON.stringify(s,null,5)),!s)return;o(!0),setTimeout((()=>{i({label:s.label,progress:s.currentProgress,max:s.maxValue}),o(!1)}),1e3)}};Object(a.useEffect)((()=>{let t=new URLSearchParams(window.location.search);e=u("GAUGE",["GAUGE"],t.get("channelId"),"_ALL_GAUGES",(()=>{})),e.connect();const s=setInterval(h,500),a=setInterval(d,1e4);return()=>{clearInterval(s),clearInterval(a)}}),[]);const p=(e,t)=>{s(!0),l=Object.keys(c).indexOf(e);let a=c[e],n=(t-a.currentProgress)/20;t=parseInt(t);let r=setInterval((()=>{i((e=>(a.currentProgress>=a.maxValue&&a.sounds.complete.play(),a.currentProgress>=t?(a.currentProgress=t,clearInterval(r),s(!1),{label:a.label,progress:a.currentProgress,max:a.maxValue}):(a.sounds.increase.currentTime=0,a.sounds.increase.play(),a.currentProgress+=n,{label:a.label,progress:a.currentProgress,max:a.maxValue}))))}),100)};return n?Object(m.jsxs)("div",{className:r?"gauge disappearing":"gauge appearing",style:{position:"relative"},children:[Object(m.jsxs)("progress",{style:{height:"100vh",maxHeight:"100px",width:"100vw"},value:n.progress,max:n.max,children:[n.progress,"%"]}),Object(m.jsx)("br",{}),Object(m.jsx)("span",{style:{position:"absolute",top:"50%",transform:"translateY(-50%)",textAlign:"center",width:"100vw",fontSize:"30px",fontFamily:"Marker Felt, fantasy",WebkitTextStrokeWidth:"1px",WebkitTextStrokeColor:"black",color:"white"},children:"".concat(n.label," ").concat(n.progress,"/").concat(n.max)})]}):Object(m.jsx)("div",{})};class q extends n.a.Component{render(){return Object(m.jsx)(o.a,{children:Object(m.jsxs)(c.c,{children:[Object(m.jsx)(c.a,{path:"".concat("","/tts"),component:F,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/wtd"),component:N,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/speech/test"),component:R,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/multi"),component:T,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/death-counter"),component:g,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/sound-player"),component:C,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/requests"),component:v,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/raid-test"),component:H,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/video-test"),component:z,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/tools/raid-test"),component:H,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/tools/video-test"),component:z,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/overlays/multi"),component:T,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/overlays/death-counter"),component:g,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/overlays/sound-player"),component:C,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/overlays/requests"),component:v,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/overlays/gauges"),component:V,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/overlays/mgauge"),component:B,exact:!0}),Object(m.jsx)(c.a,{path:"".concat("","/"),component:b})]})})}}var _=q;var K=e=>{e&&e instanceof Function&&s.e(3).then(s.bind(null,66)).then((t=>{let{getCLS:s,getFID:a,getFCP:n,getLCP:i,getTTFB:r}=t;s(e),a(e),n(e),i(e),r(e)}))};window.speechSynthesis.onvoiceschanged=()=>{window.maleVoice=window.speechSynthesis.getVoices().find((e=>"Microsoft David - English (United States)"===e.name)),window.femaleVoice=window.speechSynthesis.getVoices().find((e=>"Microsoft Zira - English (United States)"===e.name)),console.log("MAN:   "+window.maleVoice),console.log("WOMAN: "+window.femaleVoice)},r.a.render(Object(m.jsx)(n.a.StrictMode,{children:Object(m.jsx)(_,{})}),document.getElementById("root")),K()}},[[65,1,2]]]);
//# sourceMappingURL=main.e8bff595.chunk.js.map