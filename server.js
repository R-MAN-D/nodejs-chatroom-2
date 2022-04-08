var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);

var xychat = require(__dirname +'/xychat');

app.use(express.static(__dirname +'/public_html'));

app.get('/', function(req, res){

    // Render this page to the Client.
    res.sendFile(__dirname +'/chat-pub.html');
});

io.on('connection', function(socket){

    xychat.socket = socket;

    console.log('A guest has been connected.');

    // User closes window / refreshed
    socket.on('disconnect', function() {

        xychat.clients = {};
        console.log('A user has been disconnected.');
    });

    // When receives "login" identifier.
    socket.on('login', function(username){

        xychat.welcome(username);

        console.log('User joined: '+ username);
    });

    // When receives "login" identifier.
    socket.on('logout', function(client){

        socket.broadcast.emit('broadcast', [
            {
                window : 'pubc',
                type : 'logout',
                content : client.username +' has left.',
                user_id : client.id
            }
        ]);

        delete xychat.clients[client.id]; // Remove from the Queue.

        console.log(client.username +' has logged out.');
    });

    // When receives "chat-pub-fc" identifier.
    socket.on('pubc', function(client){

        // Broadcast / Send to all Users.
        var content = client.username +': '+ client.message;
        socket.broadcast.emit('broadcast', [
            {
                window : 'pubc',
                type : 'chat',
                content : content
            }
        ]);

        console.log('chat-pub-fs: '+ content);
    });
});

http.listen(xychat.port, function(){

    console.log('Listening from *:'+ xychat.port);
});