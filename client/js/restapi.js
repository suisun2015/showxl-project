'use strict';

var owner_id = "";
var room_id = "";
function onRoomGetAllRooms() {
    $.ajax( {
        type: 'GET',
        url: '/api/room/',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data:'',
        async: true,
        processData: false,
        cache: false,
        success: function (json,status) {
            json.forEach(function(element) {
                alert(element.nickname + element.roomtitle);                
            }, this);
        },
        error: function(result, status, err) {
		}
    });
}
function isRegisterUser() {
    $.ajax( {
        type: 'GET',
        url: 'https://192.168.104:400/api/user/kkkkk',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data:'',
        async: true,
        processData: false,
        cache: false,
        success: function (json,status) {
            json.forEach(function(element) {
                alert(element.nickname + element.roomtitle);                
            }, this);
        },
        error: function(result, status, err) {
		}
    });
}

function onUserLogin() {
    var params = JSON.stringify({
        "nickname": "jinstar220",
        "introduce": "I am a teacher.",
        "age": "30",
        "photo": "myface.png",
        "location": 1000,
        "email": "jinstar210@163.com"
    });
    $.ajax( {
        type: 'POST',
        url: '/api/user/login/',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: params,
        async: true,
        processData: false,
        cache: false,
        success: function (json,status) {
            alert(json.userid);
            if( json.result == "0" ) // fail
                owner_id = json.userid;
            if( json.result == "1" ) // ok
                owner_id = json.userid;
            if( json.result == "2" ) // already login
                owner_id = json.userid;
        },
        error: function(result, status, err) {
		}
    });
}

function onUserLogout() {
    $.ajax( {
        type: 'DELETE',
        url: '/api/user/logout/' + owner_id,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: "",
        async: true,
        processData: false,
        cache: false,
        success: function (json,status) {
            owner_id = "";
        },
        error: function(result, status, err) {
            owner_id = "";
		}
    });
}
