showxlApp.controller('showxl_chatroom_tab_broadcast', function($scope, $http, $modal,$routeParams,$timeout,cfpLoadingBar,showxlGlobal) {
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    $scope.searchKey = showxlGlobal.getSearchKey();
    // define scope variable.
    $scope.owner = showxlGlobal.getOwner();
	$scope.rooms = showxlGlobal.getRooms();
	$scope.ownerroom = showxlGlobal.getOwnerRoom();
    var tabs = showxlGlobal.getTabs();
    $scope.main = 1;
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    var timer;
    var height;
    $scope.searchString = function() {
        $scope.searchKey = showxlGlobal.getSearchKey();
        if( $scope.main == 0 )
            return '';
        return $scope.searchKey ;
    }
    $scope.onload = function(tab) {
        
        cfpLoadingBar.start();
        
        if( tab == undefined ) {
            height =160;
            $scope.main = 1;
        }
        else {
            $scope.main = 0;
            height =190;
        }
    	timer = setTimeout(InitializePage, 100);
    }
    InitializePage = function() {
   　　　clearTimeout(timer);
        LoadPage();

        cfpLoadingBar.complete();
    }

    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    $scope.$on('notify_all', function(event, message) {
        if( message.msg == "" ) {
            ;
        }
        else if( message.msg == "create_room" ) {
        }
    });        

    $scope.$on('notify_room', function(event, message) {
        if( message.msg == "" ) {
            ;
        }
        else if( message.msg == "enter_room" ) {
            ;
        }
        else if( message.msg == "exit_room" ) {
            ;
        }
    });        
    //------------------------------------------------------------//
    $scope.$on('event_modify_room', function(event, message) {
        // get all room from global space
        $scope.rooms = showxlGlobal.getRooms();
        // display to main page
        $timeout(function(){ $scope.$apply(function() {}); });            
    });        
    
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    $scope.getDistance = function(room) {
        var dis = showxlGlobal.calculateDistance($scope.owner.latitude,$scope.owner.longitude,room.latitude,room.longitude);
        if(dis == "NaN")
            dis = "- -"; 
        return dis;
    }

    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    $scope.gotoLive = function(){
        $scope.bGoLive = showxlGlobal.getLive();
        if( $scope.bGoLive == true ) {
            if( tabs.length > 1 ) {
                tabs[1].active = true;
                    return;
            }
        }
            
        var modalInstance = $modal.open({
            templateUrl: "showxl_chatroom_create.html",
            controller: 'showxl_chatroom_create',
            backdrop:false
        });
         
        modalInstance.result.then(function(result) {
            $scope.owner = showxlGlobal.getOwner();
            var message = { msg:'update_animation_room',room:$scope.owner.nickname,user:$scope.owner.nickname };
            showxlGlobal.ioNotify_All(message);
            $timeout(function(){ $scope.$apply(function() {},100); });            
           
            var message = { msg:'golive',room:$scope.owner.nickname,user:$scope.owner.nickname };
            showxlGlobal.ioNotify_All(message);
            showxlGlobal.setLive(true);
            
            $scope.showDialog4CreateRoom();

            showxlGlobal.UpdateGolive();
        }, function() {
        });
    }

    $scope.showDialog4CreateRoom = function(){
        var title = $scope.owner.nickname + ' ' + $scope.owner.age + 'y';
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
        $scope.Register('');        
    }

    $scope.Register = function(url) {
        owner = $scope.owner;
        var room = 
        {
            nickname:     owner.nickname,
            roomname:     owner.nickname,
            roomtitle:    owner.introduce,
            age:          owner.age,
            photo:        owner.photo,
            animation:    url,
            bLive:        0,
            nVisit:       0,
            latitude:     owner.latitude,
            longitude:    owner.longitude,
            country:      owner.country,
            city:         owner.city,
            incoming:     owner.incoming
        };
        var tabMaxIndex = showxlGlobal.getMaxTabIndex();
        showxlGlobal.setMaxTabIndex(tabMaxIndex+1);
        var tab = {
            title: owner.nickname + ' ' + owner.age + 'y',
            url: 'showxl_chatroom_tab_room.html',
            type: 'fa-home',
            owner: true,
            close: false,
            active: true,
            index:tabMaxIndex,
            room: owner.nickname
        };
        var tabs = showxlGlobal.getTabs();
        // sign up owner's room         
        var params = JSON.stringify(room);
        $http({
            method : 'POST',
            url : '/api/room/add/',
            data: params
        }).success(function(data, status, headers, config) {
            //success
            if( data.result == 1 ) {
                console.log("created yours room.");
                room._id = data.roomid
                showxlGlobal.setOwner(owner);
                if( tabs.length > 1) {
                    swap = tabs[1];
                    tabs[1] = tab;
                    tabs.push(swap);
                }
                else
                    tabs.push(tab);

                showxlGlobal.setTabs(tabs);
                //----------------------------------------------------//
                showxlGlobal.setOwnerRoom(room);
                //----------------------------------------------------//
                enterRoomCreator(room);
                var message = { msg:'enter_room',room:room.nickname,user:owner.nickname };
                showxlGlobal.ioNotify_Server(message);
                showxlGlobal.ioNotify_Room(message);

                message.msg = 'create_room';
                showxlGlobal.ioNotify_All(message);
                //----------------------------------------------------//
                if( !showxlGlobal.getShowTabs() ) {
                    window.location.href = '#chatroom';
                    showxlGlobal.setShowTabs();
                }
            }
            else {
                console.log("Can't create your room.");
                return;
            }

        }).error(function(data, status, headers, config) {
        });
    }
    function enterRoomCreator(room) {
        var params = JSON.stringify({
            "roomid":       room._id,
            "userid":       owner._id,
            "nickname":     owner.nickname,
            "introduce":    owner.introduce,
            "age":          owner.age,
            "photo":        owner.photo,
            "latitude":     owner.latitude,
            "longitude":    owner.longitude,
            "country":      owner.country,
            "city":         owner.city,
            "incoming":     owner.incoming
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
    $scope.enterRoom = function ( room ) {
        if( $scope.owner.noenterroom == undefined )
            $scope.owner.noenterroom = [];
        if( $scope.owner.noenterroom.indexOf(room.nickname) != -1 ) {
            alert('Cannot enter this room,because you are banned out.' );
            return;
        }
        if( tabs.length == 1 ) {
            $scope.showDialog4CreateRoom();
            $timeout(function() { 
                $scope.enterRealRoom(room);
            },500);            

        }
        else
            $scope.enterRealRoom(room);
    }
    $scope.enterRealRoom = function ( room ) {
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
            //title: "hellos 20y",
            title: room.nickname + ' ' + room.age + 'y',
            url: 'showxl_chatroom_tab_room.html',
            type: 'fa-user',
            owner: false,
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

    $scope.showChatRoom = function() {
        $('.modal-backdrop').remove();
	    window.location.href = '#chatroom';
    }

    $scope.getLiveTag = function (room) {
        if( room.bLive == true)
            return 'showxl_tag_live.html';
        else
            return '';
    }

    $scope.getOwnerPhoto = function() {
        if( $scope.owner.photo != "" )
            return "uploads/" + $scope.owner.photo;
        else  
            return "images/avatar.jpg";
    }

    $scope.getOwnerAnimation = function() {
        var ownerroom = showxlGlobal.getOwnerRoom();
        if( ownerroom.animation != "" )
            return "uploads/" + ownerroom.animation;
        else  
            return "";
    }
    $scope.getOwnerLiveTag = function () {
        $scope.owner = showxlGlobal.getOwner();
        if( $scope.owner.bLive == true)
            return 'showxl_tag_live.html';
        else
            return '';
    }
    
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //-- responsive size control
    $(window).resize(function() {
        LoadPage();
    });
    
    function LoadPage() {
        var parentWidth = $(window).width();
        var parentHeight = $(window).height();
        $('#channelArea').height(parentHeight - height);
    };
    //-------------------------------------//
    $scope.playOwnerVClip = function($event) {
        // angular.element($event.currentTarget).children("video").get(0).play();
        //-- this doesn't work dynamic loading so that...
        if( showxlGlobal.getOwnerRoom().animation == "")
            return;
        var myVideo = angular.element($event.currentTarget).children("video")[0];
        myVideo.src = "uploads/" + showxlGlobal.getOwnerRoom().animation;
        myVideo.load();
        myVideo.play();
    }
    $scope.pauseOwnerVClip = function($event) {
        angular.element($event.currentTarget).children("video").get(0).pause();
    }

    //-------------------------------------//
    //-------------------------------------//
    window.onbeforeunload = function(e) {
        //-- custom text won't work for browser security
        var dialogText = 'Dialog text here';
        e.returnValue = dialogText;
        return dialogText;
    };

});

//------------------------------------------------//
//-- custom directive [pre-play] for video preview
showxlApp.directive("prePlay", function () {
    return {
        link: function (scope, element, attrs) {
            $(element).on("mouseover", function () {
                $(element).children('.thevideo').get(0).play();
            });
            $(element).on("mouseleave", function () {
                $(element).children('.thevideo').get(0).pause();
            });
        }
    };
});
