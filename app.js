var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({ dest: 'www/upfile/' });
var fs = require('fs-extra'); 

//app.use(multer({ dest: 'www/'}))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('www'));

app.post('/aa', upload.array('files'),function (req, res, next) {
    console.log(req.body);
    console.log(req.files);
    res.status(200).json({});
});


//上傳影片轉檔API==================================================================================================上傳影片轉檔API
var UP_FILE_PATH = "www/upfile/"; //上傳路徑
app.post('/fileUpload_drap/:ro', function (req, res) { // 拖曳多檔存檔...
    var ro = req.params.ro;
    console.log(req.body);
    var uploadedFile = req.files.files;
    var tmpPath = uploadedFile.path;
    var filenameArr = uploadedFile.originalname.split("."),
        fileEnd = filenameArr[filenameArr.length-1], //副檔名
        fileId = Date.now() + ( ( Math.random()*20000 ) >>1 ),
        targetPath = fileId + "." + fileEnd;
    //var targetPath = './' + uploadedFile.originalname; //原檔名
    fs.rename(tmpPath, UP_FILE_PATH + targetPath, function(err) { //複製到路徑
        if (err) throw err;
            fs.unlink(tmpPath, function() {
                console.log('File Uploaded to ' + targetPath + ' - ' + uploadedFile.size + ' bytes');
            });
    });
    
    //db
    collection.insert({file:uploadedFile.originalname,keyfile:targetPath}, function(err, docs) {
        if (err) throw err;
    });

    if( fileEnd != "mp4" ){
        ffmpegToMp4.push( UP_FILE_PATH+targetPath , ro); //丟入轉檔列
        res.send( targetPath );
        res.end();
    }else{
        fs.rename(UP_FILE_PATH+targetPath, UP_FILE_PATH+fileId+".mp5", function(err) { 
            if (err) throw err;
            ffmpegToMp4.push( UP_FILE_PATH+fileId+".mp5" ,"0"); //丟入轉檔列
            res.send( fileId+".mp5" );
            res.end();
        })
    }
});

//==================================================================================================

app.use(function  (req, res, next) {
    res.status(404).send('找不到網頁!!');
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('ERRPR 500!!');
});

var server = http.listen(80, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});

//申請連線服務
io.on("connection",function(socket){
    console.log("link: " +socket.id);
    //連線
    socket.emit("connection",{
        id:socket.id
    });
    //進入房間
    socket.on("initRoom",function(data){
        socket.join(data.id);
        socket.emit("initRoom",{id:data.id});
        data = null;
        console.log(data);
    });
    //開新房間，已在房間者都斷線
    socket.on("openRoom",function(data){
        disconnectRoom(data.id);
        socket.join(data.id);
        socket.emit("openRoom",{id:data.id});
        data = null;
    });
    //房間廣播
    socket.on("data",function(data){
        socket.broadcast.to(data.id).emit('data', data);
        data = null;
    });
    //斷線
    socket.on("close",function(data){
        socket.emit("disconnect");
        socket.disconnect();
        data = null;
    });
    //關閉房間所有的連線，只有主控能關
    socket.on("closeRoom",function(data){
        disconnectRoom(data.id);
        data = null;
    });
    //斷線呼叫
    socket.on("disconnect",function(){
        console.log("close: " +socket.id);
        socket = null;
    });
    //取回房間連線數量
    socket.on("length",function  (data) {
        socket.emit("length",{id:data.id,length:Object.keys(io.sockets.adapter.rooms[data.id]).length});
        data = null;
    })
    //指定房間廣播 指定id參數
    socket.on("toRoom", function  (data) {
        io.to( data.id ).emit("data",data);
        data = null;
    })
    //房間重開，目前連線都斷線
    function disconnectRoom (roomId) {
        var res = []
        , room = io.sockets.adapter.rooms[roomId]
        , _socket;
        if (room) {
            for (var id in room) {
                _socket = io.sockets.adapter.nsp.connected[id];
                _socket.emit("disconnect");
                _socket.disconnect();
            }
        }
        _socket = null;
        delete _socket;
        res.length = 0;
        delete res;
    }
});