var CainPixi =  CainPixi || {};
/**
角色元建
CainPixi.Npc(image,bgImage,max_c,maxNum)
	image角色圖,(無對話之後可不設)bgImage對話框底圖,message訊息,max_c每行最多字數,maxNum最多幾行

動畫速度 
texture.textureV 10

說話
talk(_msg)
	_msg訊息
移動
move(_type,_v)
	_type方向編號 0下1左2上3右,_v距離
	
自動移動
autoMove(_v,_point,endCall)
	_v速度,_point位置{x:? ,y:?},endCall結束執行(可不設)

下一格	
nextFrame()
	每個requestAnimFrame須執行
**/
CainPixi.Npc = function(image,bgImage,max_c,maxNum){
	var npc = CainPixi.NpcSprite(image);
	npc.texture.textureV = 10; //動畫速度
	if(bgImage != undefined){
		npc.talkBoxId = 0;
		npc.talkBox = null;
		//說話 _msg訊息
		npc.talk = function(_msg){
			if(npc.talkBox){
				clearTimeout(npc.talkBoxId);
				npc.removeChild(npc.talkBox);
				npc.talkBox = null;
			}
			npc.talkBox = CainPixi.TalkBox(bgImage,_msg,max_c,maxNum);
			npc.talkBox.position.y = -npc.height;
			npc.addChild(npc.talkBox);
			npc.talkBoxId = setTimeout(function(){
				npc.removeChild(npc.talkBox);
				npc.talkBox = null;
			},3000);
		};
	}else{
		npc.talk = function(){};
	}
	//移動 _type方向編號 0下1左2上3右,_v距離
	npc.move = function(_type,_v){
		npc.setDirection(_type);
		switch(_type){
			case 0: //下
				npc.position.y += _v;
			break;
			case 1: //左
				npc.position.x -= _v;
			break;
			case 2: //上
				npc.position.y -= _v;
			break;
			case 3: //右
				npc.position.x += _v;
			break;
			default:
		}
	};
	//自動移動 _v速度,_point位置{x:? ,y:?},endCall結束執行(可不設)
	npc.autoMove = function(_v,_point,endCall){
		var _dx,_dy,_p = Math.floor(Math.random()*20)+10;
		npc.v = _v;
		npc.autoMovePo = _point;
		if(endCall!=undefined){
			npc.endCall = endCall;
		}else{
			npc.endCall = undefined;
		}
		_dx = npc.autoMovePo.x-npc.position.x;
		_dy = npc.autoMovePo.y-npc.position.y;
		if(Math.abs(_dx)>Math.abs(_dy)){
			npc.chkAotoMove = function(){
				_p--;
				if(_p==0){
					npc.autoMove(_v,_point,endCall);
					return;
				}
				_dx = npc.autoMovePo.x-npc.position.x;
				if(Math.abs(_dx)<npc.v){
					npc.v = Math.abs(_dx);
				}
				if(_dx>0){
					npc.move(3,npc.v);
				}else if(_dx<0){
					npc.move(1,npc.v);
				}else{
					npc.autoMove(_v,_point,endCall);
				}
			}	
		}else if(Math.abs(_dx)<Math.abs(_dy)){
			npc.chkAotoMove = function(){
				_p--;
				if(_p==0){
					npc.autoMove(_v,_point,endCall);
					return;
				}
				_dy = npc.autoMovePo.y-npc.position.y;
				if(Math.abs(_dy)<npc.v){
					npc.v = Math.abs(_dy);
				}
				if(_dy>0){
					npc.move(0,npc.v);
				}else if(_dy<0){
					npc.move(2,npc.v);
				}else{
					npc.autoMove(_v,_point,endCall);
				}
			}
		}else{
			delete npc.chkAotoMove;
			if(npc.endCall!=undefined){
				npc.endCall();
				delete npc.endCall;
			}
		}		
	};
	//下一格 每個requestAnimFrame須執行
	npc.nextFrame = function(){
		npc.texture.play();
		if(npc.chkAotoMove!=undefined){
			npc.chkAotoMove();
		}
	}
	return npc;
};
//角色Sprite
CainPixi.NpcSprite = function (image){
		var texture = new PIXI.Texture(PIXI.Texture.fromImage(image).baseTexture);
		var sp = new PIXI.Sprite(texture);
		texture._dx = texture.width/4;
		texture._dy = texture.height/4;
		texture._yy = 0;
		texture._direction = 0;
		npcTexture = function(texture_){
			texture.playRun = texture.textureV;
			texture.play = function(){
				texture.playRun--;
				if(texture.playRun>0){
					return;
				}
				texture.playRun = texture.textureV;
				var _id = texture.frame.x / texture._dx;
				_id++;
				if(_id>=4){
					_id=0;
				};
				texture.setFrame({
					x : _id*texture._dx,
					y : texture._direction * texture._dy,
					width : texture._dx,
					height : texture._dy
				});
			}
			texture.setType = function(type){
				texture._direction = type;
				texture._yy = type * texture._dy;
			};
		}
		npcTexture(texture);
		//角色方向  type_方向編號 0下1左2上3右
		sp.setDirection = function(type_){
			_direction =type_%4;
			switch (_direction){
				case 0:
					texture.setType(0);
				break;
				case 1:
					texture.setType(1);
				break;
				case 2:
					texture.setType(3);
				break;
				case 3:
					texture.setType(2);
				break;
				default:
			}
		};
		sp.anchor.x = 0.5;
		sp.anchor.y = 1;
		return sp;
	};
//對話框 傳入 bgImage對話框底圖,message訊息,max_c每行最多字數,maxNum最多幾行
CainPixi.TalkBox = function(bgImage,message,max_c,maxNum){
	//字串處理
	var talkMessage = "";
	var j=0;
	var messageNum = message.length;
	var _max = max_c*maxNum-1;
	if(messageNum>_max){
		message = message.substr(0,_max);
	}
	var n_messageNum = message.length;
	messageNum = Math.floor(n_messageNum/max_c);
	for (j;j<messageNum;j++){
		talkMessage += message.substr(j*max_c,max_c)+"\n"; //換行
	}
	if(n_messageNum-j*max_c>0){
		talkMessage += message.substr(j*max_c,n_messageNum-j*max_c);
	}
	//框
	var talkBox = new PIXI.DisplayObjectContainer();
	var textSample = new PIXI.Text(talkMessage, {font: "12px 新細明體", fill: "#0", align: "left"});
	textSample.position.x = 8;
	textSample.position.y = 8;
	var talkbg = new PIXI.Sprite(PIXI.Texture.fromImage(bgImage));
	talkbg.width = textSample.width+20;
	talkbg.height = textSample.height+25;
	talkBox.addChild(talkbg);
	talkBox.addChild(textSample);
	talkBox.pivot.x = talkbg.width>>1;
	talkBox.pivot.y = talkbg.height;
	return talkBox;
};