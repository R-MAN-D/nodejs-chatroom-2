//var socket = io.connect(window.location.origin +':3000'); // Linux
var socket = io(); // Windows

$(window).on('beforeunload', function(){

    if(client.username != '') {

        // No need to broadcast when Guest did not actually provided Username
        // and have joined the chat-room.
        socket.emit('logout', client);
    }
});

$(window).on('load resize', function() {

    cw.resize();
    cw.scroll();

    $('#username').val('').focus();
});

$(document).ready(function() {

    $('form#chat-pub-form').on('submit', function(e){

        e.preventDefault();

        var message = $.trim($('#m').val());
        if(message == '') {

            $('#m').focus();
            return;
        }

        $('#m').val('');

        // Send to Server.
        socket.emit('pubc',
            {
                username : client.username,
                message : message
            }
        );

        $('#window-pubc').append($('<li>').text(client.username +': '+ message));
        cw.scroll();

    });

    $('form#login-form').on('submit', function(e){

        e.preventDefault();

        var username = $.trim($('#username').val());
        if(username == '') {

            $('#username').focus();
            return;
        }

        document.title = 'XyChat | '+ username;
        client.username = username;
        socket.emit('login', username);

        $('#chat-pub').show();
        $('#entrance').hide();
        $('#m').focus();

        cw.resize();
    });
});

var client = {
    id : '',
    username : ''
};

var cw = { // Chat Window = cw

    display : {
        'notice_pub-user_joined' : 'pubc',
        'user-online' : 'ol'
    },
    scroll : function() {

        var window = document.getElementById('window-pubc');
        window.scrollTop = window.scrollHeight;
    },

    resize : function() {

        $('#window-pubc').css('height', ($(window).height() - $('#chat-pub-form').height() - 5) +'px');
    }
};

socket.on('private', function(data){

    if(client.username == '') return;

    var window = null;

    $.each(data, function(key, value){

        if(value.window) window = $('#window-'+ value.window);
        else window = null;

        // Initialize necessary info to the newly logged client.
        if(value.type == 'welcome') {

            client.id = value.user_id;

            // Display all online clients/users to the newly logged client/user's "ol window".
            $.each(value.clients, function (cKey, cValue) {

                if (cKey) window.append('<div id="'+ cKey + '">' + cValue + '</div>');
            });
        }
    });
});

socket.on('broadcast', function(data){

    if(client.username == '') return;

    var window = null;

    $.each(data, function(key, value){

        if(value.window) window = $('#window-'+ value.window);
        else window = null;

        if(value.type == 'user-online') {

            // Indicate to other clients' "ol window" the username of newly joined client.
            window.append('<div id="'+ value.user_id +'">'+ value.user_name +'</div>');

        } else if(value.type == 'chat' || value.type == 'notice' || value.type == 'logout') {

            var content = $('<li>').text(value.content);
            /*if(value.type == 'notice' || value.type == 'logout') {

                content = $('<li style="color: #FF0000; text-align: center">').text(value.content);
            }*/

            window.append(content);

            cw.scroll();

            // Remove logged-out client/user from other clients/users' "ol window".
            if(value.type == 'logout') {
                $('#'+ value.user_id).remove();
            }
        }
    });
});

// Triggered on real-time as soon as Server unavailable.
socket.on('disconnect', function() {

    if(window.location.href.indexOf('localhost') > -1) {
        window.location.replace('http://localhost/xychat');
    } else window.location.replace(window.location.origin +'/500.html');
});