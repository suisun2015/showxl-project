showxlApp.controller('showxl_main', function($scope,$http,$routeParams,$timeout,cfpLoadingBar,showxlGlobal) {
    $scope.searchString = showxlGlobal.getSearchKey();
    //-------------------------------------------------//
    if( showxlGlobal.isRefresh() == 1 ) {
        window.location.href = '#login';
        showxlGlobal.resetRefresh();
        return;
    }
    $scope.onSearch = function() {
        showxlGlobal.setSearchKey($scope.searchString);
    }
    
    //-------------------------------------------------//
    //-------------------------------------------------//
    //-------------------------------------------------//
    // save default tab.
    var tabs = [
        {
            title: 'Broadcasts',
            url: 'showxl_chatroom_tab_broadcast.html',
            type: 'fa-users',
            close: false,
            active: true,
            index:0,
            room:''
        }
    ];

    showxlGlobal.setTabs( tabs );
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    // define scope variable.
	$scope.owner = showxlGlobal.getOwner();
	$scope.rooms = showxlGlobal.getRooms();
    //------------------------------------------------------------//
    // initialize main page
    $scope.onload = function() {
        // connect socket
        showxlGlobal.open();
        showxlGlobal.ioConnect();
        // syncronize page using timer
    	setTimeout(function() {
            LoadPage();
            showxlGlobal.GetAllRoom();

        }, 100);
    }
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
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

    $scope.$on('event_modify_room', function(event, message) {
        // get all room from global space
        $scope.rooms = showxlGlobal.getRooms();
        // display to main page
        $timeout(function(){ $scope.$apply(function() {}); });            
    });        
    //------------------------------------------------------------//
    $scope.enterRoom = function ( room ) {
        if( $scope.owner.noenterroom == undefined )
            $scope.owner.noenterroom = [];
        if( $scope.owner.noenterroom.indexOf(room.nickname) != -1 ) {
            alert('Cannot enter this room,because you are banned out.' );
            return;
        }
        var tabMaxIndex = showxlGlobal.getMaxTabIndex();
        showxlGlobal.setMaxTabIndex(tabMaxIndex+1);
        var tab = {
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
    var flag = 0;
    //-- responsive size control
    $(window).resize(function() {
        LoadPage();
    });
    
    function LoadPage() {
        var parentWidth = $(window).width();
        var parentHeight = $(window).height();
        $('#sidebar').height(parentHeight - 160);
        $('#channelArea').height(parentHeight - 160);
        var sw = $('#sidebar').width();
        if(flag == 1) {
            if(parentWidth < 768) {
                $('#channelArea').width(parentWidth - 200);
            } 
            else {
                $('#channelArea').width(parentWidth - sw - 36);
            }
        } 
        else {
            if(parentWidth < 768) {
                $('#channelArea').width(parentWidth - 20);
            } 
            else {
                $('#channelArea').width(parentWidth - sw - 36);
            }
        }
    };
    //------------------------------------------------------------//
    //-- sidebar toggle effect
    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
        flag++;
        if(flag > 1) flag = 0;
        var parentWidth = $(window).width();
        //console.log(parentWidth + '***********' + flag);
        var w = parentWidth - 200;
        if(flag == 1) {
            $('#channelArea').width(w);
        } else {
            $('#channelArea').width(parentWidth - 20);
        }
    });
    //------------------------------------------------------------//
});
