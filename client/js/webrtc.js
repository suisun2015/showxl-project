'use strict';

var sendChannel;

var isChannelReady;
var isInitiator = false;
var isStarted;
var localStream = null;
var turnReady;
////////////////////////////////////////////////////
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');
var local = null;
var peer;

var localVideoState = false;
var remoteVideoState = false;

var localSessionDescription;
// local network
var localIceState = false;
var localIceList = [];
var callingUser = "";

var callBtn = document.getElementById('Call');
var receiveBtn = document.getElementById('Receive');
var hangupBtn = document.getElementById('HangUp');
var userBox = document.getElementById('userBox');
var chatBox = document.getElementById('chatBox');

callBtn.addEventListener('click', callUser);
receiveBtn.addEventListener('click', receiveCall);
hangupBtn.addEventListener('click', hangupCall);

dataChannelSend.disabled = false;
var sendButton = document.getElementById("sendButton");
sendButton.disabled = false;
sendButton.onclick = sendData;
receiveBtn.disabled = false;
hangupBtn.disabled = false;


var restButton = document.getElementById("REST");
restButton.onclick = restData;


/////////////////////////////////////////////
var userName = prompt("Enter user name:");
var socket = io.connect();

if (userName !== '') {
    console.log('Create or join room', userName);
    socket.emit('create or join', userName);
}
/////////////////////////////////////////////
socket.on('joined', function (users) {
    console.log('This peer has joined room ' + users);
    updateUserList(users);
    isChannelReady = true;
});

socket.on('enter', function (user) {
    console.log('enter user ' + user);
    addUser(user);
});

socket.on('left', function (user) {
    console.log('left user ' + user);
    removeUser(user);
});

socket.on('calling', function (user) {
    isInitiator = false;
    callingUser = user.from;
    displayStatus("Calling from " + callingUser);
    callBtn.disabled = true;
    receiveBtn.disabled = false;
    hangupBtn.disabled = false;
});

socket.on('receive', function (user) {
    displayStatus("Chating with" + callingUser);
    callBtn.disabled = true;
    receiveBtn.disabled = true;
    hangupBtn.disabled = false;
    //-----------------------------------------//
    local = new Connector(localStream,remoteVideo);
    local.socket = socket;
    local.me_id = userName;
    local.other_id = callingUser;
    local.doCall();
    //-----------------------------------------//
});

socket.on('hangup', function (user) {
    displayStatus("Hang Up" + callingUser);
    callBtn.disabled = false;
    receiveBtn.disabled = true;
    hangupBtn.disabled = true;
    handleRemoteHangup();
});

function handleRemoteHangup() {
    console.log('Session terminated.');
    stop();
    isInitiator = false;
}

function stop() {
    if( local )
        local.close();
    local = null;
}
////////////////////////////////////////////////
function sendMessage(message) {
    console.log('Sending message: ', message);
    socket.emit('message', message);
}
function sendNotify(message) {
    console.log('Sending notify: ', message);
    socket.emit('notify', { from:userName,to: callingUser,msg:message});
}

socket.on('system_notify', function (message) {
    addChatList(message);
});

socket.on('message', function (message) {
    console.log('Received message:', message);
    if (message.type === 'offer') {
        //-----------------------------------------//
        local = new Connector(localStream,remoteVideo);
        local.socket = socket;
        local.me_id = userName;
        local.other_id = callingUser;
        local.remoteDescription = message;
        local.doAnswer();
        //-----------------------------------------//
    } else if (message.type === 'answer' ) {
        local.setRemoteDescription(message);
    } else if (message.type === 'candidate' ) {
        local.setRemoteCandidate(candidate);
    } else if (message === 'bye' && isStarted) {
        //handleRemoteHangup();
    } else if (message.type === 'chat') {
        addChatList(message.text);
    }
});

socket.on('notify', function (notify) {
    var message = notify.msg;
    console.log('Received nodify:', message.type);
    if (message.type === 'offer') {
        //-----------------------------------------//
        local = new Connector(localStream,remoteVideo);
        local.socket = socket;
        local.me_id = userName;
        local.other_id = callingUser;
        local.remoteDescription = message;
        local.doAnswer();
        //-----------------------------------------//
    } else if (message.type === 'answer' ) {
        local.setRemoteDescription(message);
    } else if (message.type === 'candidate' ) {
        local.setRemoteCandidate(message);
    } else if (message === 'bye' ) {
        //handleRemoteHangup();
    } else if (message.type === 'chat') {
        addChatList(message.text);
    }
});
var constraints = { video: true, audio: true };

// Connect Media
getUserMedia(constraints, handleUserMedia, handleUserMediaError);
console.log('Getting user media with constraints', constraints);

function handleUserMedia(stream) {
    localVideoState = true;
    localStream = stream;
    attachMediaStream(localVideo, stream);
    console.log('Adding local stream.');
}

function handleUserMediaError(error) {
    localVideoState = false;
    console.log('getUserMedia error: ', error);
}

window.onbeforeunload = function (e) {
    sendNotify('bye');
}

function displayStatus(msg) {
    document.getElementById("status").text = msg;
}

function callUser() {
    var idx = userBox.selectedIndex;
    if (idx === -1)
        return;
    isInitiator = true;

    callBtn.disabled = true;
    receiveBtn.disabled = true;
    hangupBtn.disabled = false;

    callingUser = userBox.options[idx].text;
    
    console.log('Calling: ', callingUser);
    socket.emit('calling', {from:userName,to:callingUser});

    displayStatus("Calling to " + callingUser);
}

function receiveCall() {
    callBtn.disabled = true;
    receiveBtn.disabled = true;
    hangupBtn.disabled = false;
    displayStatus("Chating Video");
    
    console.log('receive: ', callingUser);
    socket.emit('receive', {from:userName,to:callingUser});
}

function hangupCall() {
    callBtn.disabled = false;
    receiveBtn.disabled = true;
    hangupBtn.disabled = true;
    displayStatus("Hang Up");
    
    console.log('Hang Up: ', callingUser);
    socket.emit('hangup', { from: userName, to: callingUser });
}

$('#dataChannelSend').keypress(function (e) {
    if (e.keyCode == 13 && !e.shiftKey) {
        sendData();
    }
});

function addChatList(data) {
    var newOption = document.createElement('option');
    newOption.textContent = data;
    chatBox.add(newOption);
 }

function sendData() {
    var data = userName + ":" + document.getElementById("dataChannelSend").value;
    addChatList( data );
    
    var count = chatBox.length;
    chatBox.selectedIndex = count - 1;
    dataChannelSend.value = "";

    sendMessage({
        type: 'chat',
        text: ">>>"+data
    });

    trace('Sent data: ' + data);
}

function restData() {
    //onRoomGetAllRooms();
    onUserLogin();
    onUserLogout();

}

function updateUserList(users) {
    var count = userBox.length;
    var i = 0;
    for (i = 0; i < count; i++) {
        userBox.remove(0);
    }
    for (i = 0; i < users.length; i++) {
        if (userName === users[i])
            continue;
        addUser(users[i]);
    };
}

function addUser(user) {
    var data = userBox.value;
    var newOption = document.createElement('option');
    newOption.textContent = user;
    userBox.add(newOption);
}

function removeUser(user) {
    var count = userBox.length;
    var i = 0;
    for (i = 0; i < count; i++) {
        if (user === userBox.options[i].text) {
            userBox.remove(i);
            break;
        }
    }
}

function connectUser() {
}

