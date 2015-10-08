// v1.02
var CainImage =  CainImage || {};



//判斷瀏覽器
CainImage.Sys = (function() {
	var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
    (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
    /*if (Sys.ie) document.write('IE: ' + Sys.ie);
    if (Sys.firefox) document.write('Firefox: ' + Sys.firefox);
    if (Sys.chrome) document.write('Chrome: ' + Sys.chrome);
    if (Sys.opera) document.write('Opera: ' + Sys.opera);
    if (Sys.safari) document.write('Safari: ' + Sys.safari);*/
    return Sys;
})();

//是否支援Html5
CainImage.IsHtml5 = (function() {
	var sys = CainImage.Sys;
	if(CainImage.Sys.ie){
		if(sys.ie >= 11){
			return sys;
		}
		return undefined;
	}else{
		return sys;
	} 
})();

//載入
CainImage.loadImage = function(imageArray,callBack){
	var _num = imageArray.length;
	var _num2 = imageArray.length;
	var _image;
	for (var i = _num - 1; i >= 0; i--) {
		loadAnImage(imageArray[i],loadAn);
	};
	function loadAn(){
		_num2--;
		if(_num2==0){
			callBack();
		}
	}
	function loadAnImage(imagePath,callBack2){
		_image = new Image();
		_image.onload = callBack2;
		_image.src = imagePath;
	}
}

//動畫元件
CainImage.ImageGif = function(imagePath,setpNum) {
	var timerId,div,img = new Image();
	img.src = imagePath;
	img.style.position = "relative";
	img.style.left = 0;
	var stepId = 0;
	var stepD = img.width / setpNum;
	this.div = document.createElement("div"); //div
	div = this.div;
	this.div.style.width = stepD+"px";
	this.div.style.height = img.height+"px";
	this.div.style.overflow = "hidden";
	this.div.style.backgroundPosition="0px 0px";
	this.div.style.backgroundImage="url("+imagePath+")";
	//play
	this.play = function(stepTime_){
		clearInterval(timerId);
		stepTime_ = stepTime_==undefined?300:stepTime_;
		timerId = setInterval(function() {
		stepId = stepId==setpNum-1?0:stepId+1;
			div.style.backgroundPosition=(-stepD*stepId)+"px 0px";
		}, stepTime_);
	}

	//gotoAndStop
	this.gotoAndStop = function(key_){
		clearInterval(timerId);
		stepId = key_%stepD;
		div.style.backgroundPosition=(-stepD*stepId)+"px 0px";
	}

	//stop
	this.stop = function(){
		clearInterval(timerId);
	}

	return this;
}

//狀態機
CainImage.WheelState = function(){
	this.delta = 0; //delta
    this.old_delta = 0; //old_delta
	//目前數值delta
	this.setDelta = function(delta_){
		this.delta = delta_;
		var ob;
		for(id in this.state){
			ob = this.state[id];
			if(ob.oneFun!=undefined){
				ob.oneFun();
				delete ob.oneFun;
			}
			if(delta_<ob.min){
				if(ob.flags!=-1 && ob.runMin!=undefined){
					ob.flags = -1;
					ob.runMin();
				}
			}else if(delta_>ob.max){
				if(ob.flags!=1 && ob.runMax!=undefined){
					ob.flags = 1;
					ob.runMax();
				}
			}else{
				ob.flags = 0;
				if(ob.runFun!=undefined){
					ob.runFun(delta_);
				}
			}
		}
        this.old_delta = delta_;
	}
	//狀態
	this.state = {
		/*def:{
			flags:-1,
			min:0,
			max:100,
			oneFun:function(){
				console.log("執行一次");
			},
			runFun:function(delta_){
				console.log(delta_);
			},
			runMax:function(){
				console.log("超過");
			},
			runMin:function(){
				console.log("滾回");
			}
		}*/
	};
	return this;
}

