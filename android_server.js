var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io').listen(http);
var port = 2305;
app.use(express.static(__dirname +'/public_html'));

app.get('/', function(req, res){

    // Render this page to the Client.
    res.sendFile(__dirname +'/chat-pub.html');
});

io.on('connection', function(socket){

    console.log('A guest has been connected.');

    // User closes window / refreshed
    socket.on('disconnect', function() {

        console.log('A user has been disconnected.');
    });

});

http.listen(port, function(){

    console.log('Listening from *:'+ port);
});