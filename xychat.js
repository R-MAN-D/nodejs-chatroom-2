/**
 * @author   Armande Bayanes
 **/

module.exports = {

    port : 3000,

    socket : null,

    // Clients queue.
    clients : {}, // Handler to clients / users joining, sending messages, or leaving, etc ...

    welcome : function(username) {

        var uuid = require('uuid');
        var id = uuid.v1({
            node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
            clockseq: 0x1234,
            msecs: (new Date).getTime(),
            nsecs: 5678
        });

        var data = [
            {
                window : 'pubc',
                type : 'notice',
                content : username +' has joined.'
            },
            {
                window : 'ol',
                type : 'user-online',
                user_name : username,
                user_id : id
            }
        ];

        this.socket.broadcast.emit('broadcast', data);

        this.clients[id] = username;

        this.socket.emit('private', [
            {
                type : 'welcome',
                window : 'ol',
                clients : this.clients,
                user_id : id
            }
        ]);
    }
}
