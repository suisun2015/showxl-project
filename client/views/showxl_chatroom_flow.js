showxlApp.controller('showxl_chatroom_flow', function($scope, $http, $timeout,$modal,$routeParams,showxlGlobal) {
    $scope.rooms = showxlGlobal.getRooms();
    $scope.owner = showxlGlobal.getOwner();
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    $scope.getPhoto = function(room) {
        if( room.photo != "" )
            return "uploads/" + room.photo;
        else  
            return "images/avatar.jpg";
    }
    $scope.getAnimation = function(room) {
        if( room.animation != "" )
            return "uploads/" + room.animation;
        else  
            return "";
    }
    $scope.getCity = function(room) {
        return room.city;
    }
    $scope.getCountryFlag = function(room) {
        var country = room.country;
        if( country == undefined )
            return '';
        country = country.toLowerCase();
        return country;
    }
    $scope.getMessage = function(room) {
        if( room.message == undefined ) {
            if( room.bLive )
                room.message = 'Live Now';
            else
                room.message = 'New Entry';
        }
        return room.message;
    }
    $scope.getColor = function(room) {
        if( room.message == undefined )
            return true;
        if( room.message =='New Photo' )
            return false;
        if( room.message =='New Video' )
            return false;
        return true;
    }
    //------------------------------------------------------------//
    $scope.enterRoom = function ( room ) {
        var tabs = showxlGlobal.getTabs();
        var title = room.nickname + ' ' + room.age + 'y';
        var bExist = false; 
        tabs.forEach(function(element) {
            if( element.title == title ) {
                element.active = true;
                bExist = true;
                return;
            }
        }, this);
        if( bExist == true )
            return;
        //-------------------------------------------//
        // exit in cur room
        // bExist = false;
        // var i;
        // for( i = 1; i < tabs.length; i++ ) {
        //     if( tabs[i].room == $scope.owner.nickname )
        //         continue;
        //     bExist = true;
        //     break;
        // }
        // if( bExist == true ) {
        //     var r = showxlGlobal.getRoom(tabs[i].room);
        //     if( r ) {
        //         $http({
        //             method : 'DELETE',
        //             url : '/api/room/exit/'+r._id+'/'+$scope.owner._id,
        //         }).success(function(data) {
        //         }).error(function(data) {
        //         });
        //         var message = { msg:'exit_room',room:r.roomname,user:$scope.owner.nickname };
        //         showxlGlobal.ioNotify_Room(message);
        //         //-------------------------------------------//
        //         tabs.splice(i, 1);
        //         showxlGlobal.setTabs( tabs );
        //     }
        // }
        //-------------------------------------------//
        var tabMaxIndex = showxlGlobal.getMaxTabIndex();
        showxlGlobal.setMaxTabIndex(tabMaxIndex+1);
        var tab = {
            title: room.nickname + ' ' + room.age + 'y',
            url: 'showxl_chatroom_tab_room.html',
            type: 'fa-user',
            owner:false,
            close: true,
            active: true,
            index:tabMaxIndex,
            room: room.nickname
        };
        tabs.push( tab );
        showxlGlobal.setTabs(tabs);
        //----------------------------------------------------//
        // Enter to other room
        enterUserRoom(room);
        var message = { msg:'enter_room',room:room.nickname,user:$scope.owner.nickname };
        showxlGlobal.ioNotify_Server(message);
        showxlGlobal.ioNotify_Room(message);
        //----------------------------------------------------//
        if( !showxlGlobal.getShowTabs() ) {
            window.location.href = '#chatroom';
            showxlGlobal.setShowTabs();
        }
    }
    //------------------------------------------------------------//
    function enterUserRoom(room) {
        var params = JSON.stringify({
            "roomid":       room._id,
            "userid":       $scope.owner._id,
            "nickname":     $scope.owner.nickname,
            "introduce":    $scope.owner.introduce,
            "age":          $scope.owner.age,
            "photo":        $scope.owner.photo,
            "latitude":     $scope.owner.latitude,
            "longitude":    $scope.owner.longitude,
            "country":      $scope.owner.country,
            "city":         $scope.owner.city,
            "incoming":     $scope.owner.incoming
        });
        $http({
            method : 'POST',
            url : '/api/room/enter/',
            data: params
        }).success(function(data, status, headers, config) {
            //success
            if( data.result == 1 ) {
            }
            else if( data.result == 2 ) {
            }
            else {
            }

        }).error(function(data, status, headers, config) {
        });
    }
    
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    $scope.$on('event_modify_room', function(event, message) {
        // get all room from global space
        $scope.rooms = showxlGlobal.getRooms();
        // display to main page
        $timeout(function(){ $scope.$apply(function() {}); });            
    });        

    $scope.$on('notify_all', function (event,message) {
        if( message.msg == 'create_room' ) {
        }
        else if( message.msg == 'remove_room' ) {
        }
        else if( message.msg == 'update_animation_room' ) {
            for( i = 0; i < $scope.rooms.length; i++ ) {
                if( $scope.rooms[i].roomname == message.room ) {
                    $scope.rooms[i].bLive = 1;
                    $timeout(function(){ $scope.$apply(function() {}); });            
                    break;
                }
            }
        }
        else if( message.msg == 'update_blob_photo_room' ) {
            for( i = 0; i < $scope.rooms.length; i++ ) {
                if( $scope.rooms[i].roomname == message.room ) {
                    $scope.rooms[i].message = 'New Photo';
                    $timeout(function(){ $scope.$apply(function() {}); });            
                    break;
                }
            }
        }
        else if( message.msg == 'update_blob_animation_room' ) {
            for( i = 0; i < $scope.rooms.length; i++ ) {
                if( $scope.rooms[i].roomname == message.room ) {
                    $scope.rooms[i].message = 'New Video';
                    $timeout(function(){ $scope.$apply(function() {}); });            
                    break;
                }
            }
        }
        else if( message.msg == 'update_title_room' ) {
            for( i = 0; i < $scope.rooms.length; i++ ) {
                if( $scope.rooms[i].roomname == message.room ) {
                    $scope.rooms[i].message = 'New Text';
                    $timeout(function(){ $scope.$apply(function() {}); });            
                    break;
                }
            }
        }
        else if( message.msg == 'golive' ) {
            for( i = 0; i < $scope.rooms.length; i++ ) {
                if( $scope.rooms[i].roomname == message.room ) {
                    $scope.rooms[i].bLive = 1;
                    $timeout(function(){ $scope.$apply(function() {}); });            
                    break;
                }
            }
        }
        else if( message.msg == 'stoplive' ) {
            for( i = 0; i < $scope.rooms.length; i++ ) {
                if( $scope.rooms[i].roomname == message.room ) {
                    $scope.rooms[i].bLive = 0;
                    $timeout(function(){ $scope.$apply(function() {}); });            
                    break;
                }
            }
        }
    });
});

