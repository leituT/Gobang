
//express  node.js中管理路由响应请求的模块，根据请求的URL返回相应的HTML页面

var express = require("express"),
    app = express(),
    httpserver = require("http").createServer(app),
    io = require("socket.io")(httpserver);

app.use("/", express.static(__dirname));

httpserver.listen(3000, "192.168.1.30");

console.log("服务已开启");


var auserlist = [];
var nw = 0;
//io.on('connection', function (socket) {
io.sockets.on('connection', function (socket) {
    
    console.log('有人通过socket连接进来了');
    
    //socket.emit('hello', "欢迎你");
    
    //用户登录
    socket.on('login', function (data) {
        if (auserlist.length > 1) {
            socket.emit('loginerr', "房间已经有两个人了");
            return false;
        }
        var j = 0;
        for (var i = 0; i < auserlist.length; i++) {
            if (data.name == auserlist[i].name) {
                j++;
                break;
            }
        }
        if (j > 0) {
            socket.emit('loginerr', "用户名称重复");
        }
        else {
            if (nw > 0) {
                nw = 2;
            } else {
                nw = 1;
            }
            socket.username = data.name;
            socket.userid = data.userid;
            socket.userobj = data;
            socket.emit('loginsuess', nw == 1 ? 1 : 2);
            socket.broadcast.emit('loginopen', nw == 1 ? 2 : 1);
            auserlist.push(data);
        }
    });
    
    //接收用户消息 通知除自己以外的所有人  
    socket.on('msg', function (user, top,left) {
        
        socket.broadcast.emit('msg', user, top, left);
    });

    socket.on('msg2', function (msg) {

        socket.broadcast.emit('msg2', '您输了');
    });

    //断开连接的事件  
    socket.on('disconnect', function () {
        for (var i = 0; i < auserlist.length; i++) {
            if (socket.userid == auserlist[i].userid) {
                auserlist.splice(i, 1);
                break;
            }
        }
        //通知除自己以外的所有人  
        socket.broadcast.emit('loginout', socket.username);
    });
    

    //io.sockets.emit('system', nickname);  向所有用户发送请求

});