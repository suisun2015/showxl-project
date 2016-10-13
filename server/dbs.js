var mongoose = require('mongoose');         // use mongodb
//----------------------------------------------------------//
mongoose.connect('mongodb://localhost/live-chat', function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to MongoDB');
    }
});
//----------------------------------------------------------//
// Table Name: User
var UserSchema = mongoose.Schema({
    nickname:   String,
    introduce:  String,
    age:        Number,
    photo:      String,
    latitude:   Number,
    longitude:  Number,
    country:    String,
    city:       String,
    incoming:   Number,
    date:       Date
});
// Table Name: Room
var RoomSchema = mongoose.Schema({
    nickname:   String,
    roomname:   String,
    roomtitle:  String,
    age:        Number,
    photo:      String,
    animation:  String,
    bLive:      Number,
    nVisit:     Number,
    latitude:   Number,
    longitude:  Number,
    country:    String,
    city:       String,
    incoming:   Number,
    date:       Date
});
// Table Name: UserMessage
var UserMessageSchema = mongoose.Schema({
    userid:     String,
    fromid:     String,
    message:    String,
    photo:      String,
    bRead:      Number,
    date:       Date
});
// Table Name: RoomMessage
var RoomMessageSchema = mongoose.Schema({
    roomID:     String,
    message:    String,
    date:       Date
});

// Table Name: RoomUser
var RoomUserSchema = mongoose.Schema({
    roomID:     String,
    userID:     String,
    nickname:   String,
    introduce:  String,
    age:        Number,
    photo:      String,
    latitude:   Number,
    longitude:  Number,
    country:    String,
    city:       String,
    incoming:   Number,
    date:       Date
    
});

var UserDetailSchema = mongoose.Schema({
    userID:     String,
    type:       Number, // 0-photo,1-animation
    url:        String,
    date:       Date
    
});

//----------------------------------------------------------//
// Create Table,if there is no Table
mongoose.model('User', UserSchema);
mongoose.model('Room', RoomSchema);
mongoose.model('UserMessage', UserMessageSchema);
mongoose.model('RoomMessage', RoomMessageSchema);
mongoose.model('RoomUser', RoomUserSchema);
mongoose.model('UserDetail', UserDetailSchema);
//----------------------------------------------------------//

/*
	Make database models publicly accessible
*/

var db = {
	User:           mongoose.model('User'),
	Room:           mongoose.model('Room'),	
	UserMessage:    mongoose.model('UserMessage'),	
	RoomMessage:    mongoose.model('RoomMessage'),	
	RoomUser:       mongoose.model('RoomUser'),
	UserDetail:     mongoose.model('UserDetail')
};
//----------------------------------------------------------//
// All Remove 
db.User.remove(function(err, item) {});
db.Room.remove(function(err, item) {});
db.RoomUser.remove(function(err, item) {});
db.UserDetail.remove(function(err, item) {});
db.UserMessage.remove(function(err, item) {});

global.db = db;
