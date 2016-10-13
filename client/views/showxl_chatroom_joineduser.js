showxlApp.controller('showxl_chatroom_joineduser', function($scope, $http,$timeout, $modal,$routeParams,showxlGlobal) {
    $scope.GlobalIndex = -1;
    var tabs = showxlGlobal.getTabs()
    $scope.tab={};
    $scope.owner = showxlGlobal.getOwner();
    $scope.room={};
    $scope.users = [];
    $scope.tabIndex = 0;
    var timer;
    var roomname="";
    $scope.onload = function(idx) {
        $scope.tabIndex = idx;
        $scope.GlobalIndex = tabs[$scope.tabIndex].index;
        $scope.room = showxlGlobal.getRoom(tabs[$scope.tabIndex].room);
        if( !$scope.room )
            $scope.room = showxlGlobal.getOwnerRoom();
        roomname = tabs[$scope.tabIndex].room;
        showxlGlobal.GetUsers( roomname );

        setTimeout(function() {
            LoadPage();
        }, 100);
    }
    //-----------------------------------------------//
    //-----------------------------------------------//
    //-----------------------------------------------//
    $scope.$on('event_modify_users', function(event, rname) {
        if( roomname != rname )
            return;
        $scope.room = showxlGlobal.getRoom( roomname );
        if( !$scope.room )
            $scope.room = showxlGlobal.getOwnerRoom();
        var users = $scope.room.users;
        for( i = 0; i < users.length; i++ ) {
            if( users[i].nickname == roomname ) {
                users.splice(i, 1);
                break;
            }
        }
        $scope.users = users;
        $timeout(function(){ $scope.$apply(function() {}); });            
        // $scope.$apply(function() {});
    });
    //-----------------------------------------------//
    $scope.getPhoto = function(image) {
        if( image != "" ) {
            if(image == undefined)
                return "images/avatar.jpg";
            else
                return "uploads/" + image;
        }
        else  
            return "images/avatar.jpg";
    }
    $scope.getRoomCity = function() {
        return $scope.room.city;
    }
    $scope.getRoomCountryFlag = function() {
        var country = $scope.room.country;
        if( country == undefined )
            return '';
        
        country = country.toLowerCase();
        return country;
    }
    $scope.getCountryFlag = function(country) {
        if( country == undefined )
            return '';
        country = country.toLowerCase();
        if( country == undefined )
            return '';
        return country;
    }
    $scope.getRoomDistance = function() {
        if( $scope.room.roomname == $scope.owner.nickname )
            return;
        var dis = showxlGlobal.calculateDistance($scope.owner.latitude,$scope.owner.longitude,$scope.room.latitude,$scope.room.longitude);
        if(dis == "NaN")
            dis = "- -";
        return dis + ' km';
    }
    $scope.getDistance = function(user) {
        var dis = showxlGlobal.calculateDistance($scope.owner.latitude,$scope.owner.longitude,user.latitude,user.longitude);
        if(dis == "NaN")
            dis = "- -";
        return dis;
    }
    //-----------------------------------------------//
    $scope.onPrivate = function(user) {
        var chat = {nickname:user.nickname,photo:user.photo};
        var modalInstance = $modal.open({
            templateUrl: "showxl_chatroom_privatechat.html",
            controller: 'showxl_chatroom_privatechat',
            backdrop: false,
            resolve: { modalparams: function() { return { data: chat }; } }
        });
    }
    //-----------------------------------------------//
    $scope.getHomeStatus = function(user) {
        if( user.nickname == $scope.owner.nickname )
            return false;
        var room = showxlGlobal.getRoom(user.nickname);
        if( room )
            return true;
        return false;
    }
    $scope.onHome = function(user) {
        var room = showxlGlobal.getRoom(user.nickname);
        if( room ) {
            enterRoom(room);
        }
    }
    //-----------------------------------------------//
    $scope.onRemoveUser = function(user) {
        //----------------------------------------------------//
        var message = { msg:'remove_user_room',room:$scope.room.roomname,user:user.nickname };
        showxlGlobal.ioNotify_Room(message);
    }
    //-----------------------------------------------//
    //-----------------------------------------------//
    //-----------------------------------------------//
    $(window).resize(function() {
        LoadPage();
    });

    function LoadPage() {
        //-- Initialization
        var parentWidth = $(window).width();
        var parentHeight = $(window).height();

        $('#joinedUser-'+$scope.GlobalIndex+' #joineduser_list').height(parentHeight - 290);
        $('#joinedUser-'+$scope.GlobalIndex+' #joineduser_list').animate({ scrollTop: $('#joinedUser-'+$scope.GlobalIndex+' #joineduser_list').prop("scrollHeight") }, 1);

    };
});
