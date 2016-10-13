module.exports = function(server)
{
    var io = require('socket.io').listen(server);
	global.io = io;
    var db = global.db;

    var userList = [];
    var clientList = [];

    io.sockets.on('connection', function (socket) {
        var joinedUser = false;
        var nickname;
        // disconnect 
        socket.on('disconnect', function () {
            // no connect
            if (!joinedUser) {

            }
            console.log('--- user disconnected' + nickname );
            if( nickname == undefined )
                return;
            // remove temp data from roomuser table
            db.User.find( {nickname:nickname},function (err,user) {

            });
            // remove temp data from room table
            db.Room.remove({ nickname: nickname }, function(err, room) {
                if( err ) return;
                // notify to all users for update list.
            })
            db.UserDetail.remove({ userID: nickname }, function(err, detail) {
                if( err ) return;
                // notify to all users for update list.
            })
            // remove in list
            var id = userList.indexOf(nickname);
            if( id != -1 ) {
                userList.splice(id, 1);
                clientList.splice(id,1);
            }
            
        });
        //---------------------------------------------------------------//
        //---------------------------------------------------------------//
        //---------------------------------------------------------------//
        // notify message to server
        socket.on('notify_server', function (message) {
            if( message.msg == 'login' ) {

            }
            else if( message.msg == 'logout' ) {

            }
            else if( message.msg == 'enter_room' ) {
                socket.join(message.room);
            }
            else if( message.msg == 'exit_room' ) {
                socket.leave(message.room);
            }
        });
        //---------------------------------------------------------------//
        // notify message to room
        socket.on('notify_room', function (message) {

        });
        //---------------------------------------------------------------//
        // notify message to all
        socket.on('notify_all', function (message) {

        });
        //---------------------------------------------------------------//
        // notify message to user
        socket.on('notify_user', function (message) {

        });
        //---------------------------------------------------------------//
        //---------------------------------------------------------------//
        //---------------------------------------------------------------//
    });
}
