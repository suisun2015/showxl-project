var showxlApp = angular.module("showxlApp", ["ngRoute",'ui.bootstrap','chieffancypants.loadingBar','ngAnimate','toastr','ngSanitize']);

showxlApp.config(function($routeProvider,cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
    $routeProvider
    .when("/", {
        templateUrl : "showxl_login.html"
    })
    .when("/login", {
        templateUrl : "showxl_login.html"
    })
    .when("/main", {
        templateUrl : "showxl_main.html"
    })
    .when("/chatroom", {
        templateUrl : "showxl_chatroom.html"
    })
});

//---------------------------------------//
//---------------------------------------//
//---------------------------------------//
// define global variable
showxlApp.factory('serverRequest', function($q, $http){
});
//---------------------------------------//
//---------------------------------------//
//---------------------------------------//
showxlApp.service('showxlGlobal', function($http,$rootScope) {
    //---------------------------------------//
    // Check Refresh
    var bRefresh = 0;
    var url = window.location.href;
    if( url.indexOf('main') != -1 || url.indexOf('chatroom') != -1 )
        bRefresh = 1;
    this.isRefresh = function() {
        return bRefresh;
    }
    this.resetRefresh = function() {
        bRefresh = 0;
    }
    //---------------------------------------//
    var m_bOpen = false;
    //---------------------------------------//
    var m_Owner={};     // owner information
    var m_OwnerRoom= { // owner room information
        nickname:     '',
        roomname:     '',
        roomtitle:    '',
        age:          '',
        photo:        '',
        animation:    '',
        bLive:        0,
        nVisit:       0,
        latitude:     0,
        longitude:    0,
        incoming:     0
    };
    
    var m_OwnerChat={}; // owner chat infoormation(private chat)
    var m_Rooms=[];     // all room information
    var m_Tabs=[];      // tab menu information
    var m_nMaxTabIndex = 1;
    var m_bShowTabs = false;
    var m_nPrivateMessages = 0;
    var m_PrivateMessages = [];
    var m_bGoLive = false;
    var m_SearchKey = '';
    // signal server
    var socket = null;  // real time socket
    //---------------------------------------//
    this.getSearchKey = function() {
        return m_SearchKey;
    }
    this.setSearchKey = function(key) {
        m_SearchKey = key;
    }
    this.getMaxTabIndex = function() {
        return m_nMaxTabIndex;
    }
    this.setMaxTabIndex = function(index) {
        m_nMaxTabIndex = index;
    }
    //---------------------------------------//
    this.open = function() {
        m_bOpen = true;
    }
    this.close = function() {
        m_bOpen = false;
    }
    this.isOpen = function() {
        return m_bOpen;
    }
    //---------------------------------------//
    this.getLive = function() {
        return m_bGoLive;
    }
    this.setLive = function( bLive ) {
        m_bGoLive = bLive;
    }
    //---------------------------------------//
    this.setShowTabs = function() {
        m_bShowTabs = true;
    }
    this.getShowTabs = function() {
        return m_bShowTabs;
    }
    
    this.getSocket = function() {
        return socket;
    }
    
    //---------------------------------------//
    // owner information
    this.setOwner = function(data){
        m_Owner = data;
    }
    this.getOwner = function(){
        return m_Owner;
    }
    //---------------------------------------//
    // owner room information
    this.setOwnerRoom = function(data) {
        m_OwnerRoom = data;
    }
    this.getOwnerRoom = function() {
        return m_OwnerRoom;
    }
    //---------------------------------------//
    // owner chat infoormation(private chat)
    this.setOwnerChat = function(data) {
        m_OwnerChat = data;
    }
    this.getOwnerChat = function() {
        return m_OwnerChat;
    }
    //---------------------------------------//
    // all room information
    this.setRooms = function(data){
        m_Rooms = data;
    }
    this.getRooms = function(){
        return m_Rooms;
    }
    this.getRoom = function(roomname){
        for( i = 0; i < m_Rooms.length; i++ ) {
            if( m_Rooms[i].roomname == roomname )
                return m_Rooms[i];
        }
        return null;
    }
    //---------------------------------------//
    this.getPrivateMessages = function(){
        return m_nPrivateMessages;
    }
    this.setPrivateMessages = function(count){
        m_nPrivateMessages = count;
        $rootScope.$broadcast('event_modify_private',"");
    }
    //---------------------------------------//
    this.getAllMessages = function(){
        return m_PrivateMessages;
    }
    //---------------------------------------//
    this.pushMessage = function(message){
        m_PrivateMessages.push(message);
    }
    //---------------------------------------//
    // tab menu information
    this.setTabs = function(data) {
        m_Tabs = data;
    }
    this.getTabs = function() {
        return m_Tabs;
    }
    
    this.calculateDistance = function(lat1, lon1, lat2, lon2) {
      var R = 6371; // km
      var dLat = (lat2-lat1)*Math.PI / 180;
      var dLon = (lon2-lon1)*Math.PI / 180; 
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1*Math.PI / 180) * Math.cos(lat2*Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      d = d.toFixed(0);
      return d;
    }

    function RemoveUserMessage(username) {
        var messages = m_PrivateMessages;
        var i,count = 0;;
        for( i = m_PrivateMessages.length-1; i >= 0; i-- ) {
            if( m_PrivateMessages[i].from != username ) {
                if( m_PrivateMessages[i].bRead == 0 )
                    count++;
                continue;
            }
            m_PrivateMessages.splice(i,1);
        }
        m_nPrivateMessages = count;
    }
    
    //---------------------------------------//
    //---------------------------------------//
    //---------------------------------------//
    // real time communication part //
    this.ioConnect = function() {
        if( socket )
            ioDisconnect();
        // connect to server        
        socket = io.connect();
        var thisRoot = this;
        //---------------------------------------//
        // login to server
        this.ioNotify_Server( { msg:'login',nickname:m_Owner.nickname } );
        //---------------------------------------//
        //---------------------------------------//
        //---------------------------------------//
        // message received to server 
        socket.on('notify_close_system', function (message) {
            RemoveUserMessage(message);
            $rootScope.$broadcast('notify_close_server',message);
        });
        socket.on('notify_server', function (message) {
            $rootScope.$broadcast('notify_server',message);
        });
        //---------------------------------------//
        // message received to room 
        socket.on('notify_room', function (message) {
            if( message.msg == 'enter_room' ) {
                var room = thisRoot.getRoom(message.room);
                if( room ) {
                    room.nVisit++;
                    $rootScope.$broadcast('event_modify_room',message);
                }
                else if( m_Owner.nickname == message.room ) { // owner room
                    m_OwnerRoom.nVisit++;
                    $rootScope.$broadcast('event_modify_room',message);
                }
            }
            else if( message.msg == 'exit_room' ) {
                ;
            }
            else if( message.msg == 'remove_user_room' ) {
                ;
            }
            
            
            $rootScope.$broadcast('notify_room',message);
        });
        //---------------------------------------//
        // message received to all 
        socket.on('notify_all', function (message) {
            if( message.msg == 'create_room' ) {
                thisRoot.GetAllRoom();
            }
            else if( message.msg == 'remove_room' ) {
                thisRoot.GetAllRoom();
            }
            else if( message.msg == 'update_animation_room' ) {
                $rootScope.$broadcast('notify_all',message);
                thisRoot.GetAllRoom();
            }
            else if( message.msg == 'update_blob_photo_room' ) {
                $rootScope.$broadcast('notify_all',message);
            }
            else if( message.msg == 'update_blob_animation_room' ) {
                $rootScope.$broadcast('notify_all',message);
            }
            else if( message.msg == 'update_title_room' ) {
                //thisRoot.GetAllRoom();
                $rootScope.$broadcast('notify_all',message);
            }
            else if( message.msg == 'golive' ) {
                $rootScope.$broadcast('notify_all',message);
            }
            else if( message.msg == 'stoplive' ) {
                $rootScope.$broadcast('notify_all',message);
            }
            
        });
        //---------------------------------------//
        // message received to user 
        socket.on('notify_user', function (message) {
            if( message.msg == 'private_chat' ) {
                m_nPrivateMessages = m_nPrivateMessages+1;
                message.bRead = 0; 
                m_PrivateMessages.push(message);
            }
            $rootScope.$broadcast('notify_user',message);
        });
        //---------------------------------------//
        //---------------------------------------//
        //---------------------------------------//
    }
    this.ioDisconnect = function() {
        // logout and disconnect to server
        if( socket ) {
            this.ioNotify_Server( { msg:'logout',nickname:m_Owner.nickname } );
            io.disconnect();
        }
        socket = null;
    }
    // get socket.
    this.ioGetSocket = function() {
        return socket;
    }
    //---------------------------------------//
    //---------------------------------------//
    //---------------------------------------//
    // notify message to server
    this.ioNotify_Server = function(message) {
        socket.emit( 'notify_server',message );
    }
    // notify message to client in room
    this.ioNotify_Room = function(message) {
        socket.emit( 'notify_room',message );
    }
    //---------------------------------------//
    // notify message to all client
    this.ioNotify_All = function(message) {
        socket.emit( 'notify_all', message );
    }
    //---------------------------------------//
    // notify message to a client
    this.ioNotify_User = function(message) {
        socket.emit( 'notify_user', message );
    }
    //---------------------------------------//
    //---------------------------------------//
    //---------------------------------------//
    this.GetAllRoom = function() {
        $http.get('api/room/').success(function(data) {
            // remove owner room
            for( i = 0; i < data.length; i++ ) {
                if( data[i].roomname == m_Owner.nickname ) {
                    data.splice(i, 1);
                    break;
                }
            }
            // save all room to global space
            m_Rooms = data;
            $rootScope.$broadcast('event_modify_room',m_Rooms);
            
        }).error(function(data, status) {
        });
    }
    this.GetUsers = function(roomname) {
        var room = this.getRoom(roomname);
        if( !room ) {
            if( roomname == m_OwnerRoom.roomname )
                room = m_OwnerRoom;
            else
                return;
        }
        var url = 'api/room/users/'+room._id;
        $http.get(url).success(function(data) {
            room.users = data;
	        $rootScope.$broadcast( 'event_modify_users',roomname );
        }).error(function(data, status) {
        });
    }
    this.UpdateGolive = function() {
        $rootScope.$broadcast('event_update_golive','');
    }
    this.LeaveRoom = function(roomname) {
        $rootScope.$broadcast('event_leave_room',roomname);
    }
    this.EnterRoom = function(roomname) {
        $rootScope.$broadcast('event_enter_room',roomname);
    }
    
});


