var path = require('path');
var formidable = require('formidable');

module.exports = function(app,fs)
{
    var db = global.db;
//	var io = global.io; 

    app.get('/', function(req, res) {
        res.render('showxl.html');
    });
    app.get('/:page', function(req, res) {
        console.log('--- loading page-' + req.params.page );
        // check file exist.

    });
    //----------------------------------------------------------------------//
    // check nickname 
    app.get('/api/user/:nickname/', function(req, res) {
        console.log('check nickname:' + req.params.nickname);

    });
    //----------------------------------------------------------------------//
    // login. because to enter other user room 
    app.post('/api/user/login/', function(req, res) {
        var result = {  };
	    var nickname = req.body.nickname;
        console.log('adduser:' + nickname);
        db.User.find( {nickname:nickname}, function (err, user) {

        });
    });
    //----------------------------------------------------------------------//
    // logout. 
    app.delete('/api/user/logout/:userid', function(req, res){
        db.User.remove({ _id: req.params.userid }, function(err, user) {

        })
    });
    //----------------------------------------------------------------------//
    // get user. 
    app.get('/api/user/get/:userid', function(req, res){
        db.User.find( {_id:req.params.userid},function (err,user) {

        });
    });
    //----------------------------------------------------------------------//
    // get users. 
    app.get('/api/user/all/', function(req, res){
        db.User.find( function (err,users) {

        });
    });
    //----------------------------------------------------------------------//
    // get all rooms 
    app.get('/api/room/', function(req, res){

    });
    //----------------------------------------------------------------------//
    // get any room 
    app.get('/api/room/:roomid', function(req, res){

    });
    //----------------------------------------------------------------------//
    // enter in user's room 
    app.post('/api/room/enter/', function(req, res){

    });
    //----------------------------------------------------------------------//
    // exit in user's room 
    app.delete('/api/room/exit/:roomid/:userid', function(req, res){

    });
    //----------------------------------------------------------------------//
    // add room POST
    app.post('/api/room/add/', function(req, res){
        var result = {  };
	    var nickname = req.body.nickname;
        console.log('add room:' + nickname);

    });
    //----------------------------------------------------------------------//
    // add room POST
    app.post('/api/room/update/animation', function(req, res){

    });

    app.post('/api/room/update/title', function(req, res){

    });
    //----------------------------------------------------------------------//
    // get user in room
    app.get('/api/room/users/:roomid', function(req, res){

    });
    //----------------------------------------------------------------------//
    // delete room
    app.delete('/api/room/remove/:roomid', function(req, res){
        console.log('remove room');

    });
    //----------------------------------------------------------------------//
    // put user's message
    //----------------------------------------------------------------------//
    // get all message(private) 
    app.get('/api/user/readmessage/:userid/:fromid', function(req, res){

    });

    // get all message(private) 
    app.get('/api/user/countmessage/:userid', function(req, res){

    });

    app.get('/api/user/countmessageunread/:userid', function(req, res){

    });

    app.post('/api/user/message/add', function(req, res){

    });
    //----------------------------------------------------------------------//
    // get all user's message(private) 
    app.get('/api/user/message/:userid/:count', function(req, res){

    });
    //----------------------------------------------------------------------//
    // get unread message(private) 
    app.get('/api/user/unreadmessage/:userid', function(req, res){

    });
    //----------------------------------------------------------------------//
    // get unread message(private) 
    app.get('/api/user/unreadmessagecount/:userid', function(req, res){

    });
    //----------------------------------------------------------------------//
    // get all room's message(public) 
    app.get('/api/room/message/:roomid/:count', function(req, res){
        count = parseInt(req.params.count,10);

    });
    //----------------------------------------------------------------------//
    // put room's message(public) 
    app.post('/api/room/message/add', function(req, res){
        console.log('add detail:');

    });

    //----------------------------------------------------------------------//
    // get user detail in room
    app.get('/api/user/detail/:userid/:type', function(req, res){

    });
    app.get('/api/user/detail/video/:userid/:type', function(req, res){
        db.UserDetail.find( {userID:req.params.userid,type:req.params.type},function (err,userdetail) {
            res.json(userdetail);
        });
    });
    //----------------------------------------------------------------------//
    // delete detail
    app.delete('/api/user/detail/remove/:id', function(req, res){
        console.log('remove detail');
        db.UserDetail.remove({ _id: req.params.id }, function(err, room) {
            if( err ) 
                return res.status(500).json({ error: "database failure" });
            res.json({result: 1});
        })
    });
    //----------------------------------------------------------------------//
    // add detail POST
    app.post('/api/user/detail/add/', function(req, res){
        console.log('add detail:');

    });
    //----------------------------------------------------------------------//
    // upload
    app.post('/upload', function(req, res) {

    });
}
