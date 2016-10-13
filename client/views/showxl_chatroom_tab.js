showxlApp.controller('showxl_chatroom_tab', function($scope, $http, $routeParams,showxlGlobal) {
    //-------------------------------------------------//
    if( showxlGlobal.isRefresh() == 1 ) {
        window.location.href = '#login';
        showxlGlobal.resetRefresh();
        return;
    }
    $scope.tabs = showxlGlobal.getTabs();
    //------------------------------------------------------//
    //------------------------------------------------------//
    //------------------------------------------------------//
    $scope.currentTab = 0;

    $scope.getCloseTag = function (tab) {
        if( tab.close == true)
            return 'showxl_tag_close.html';
        else
            return '';
    }

    $scope.removeTab = function (event, index) {
        event.preventDefault();
        event.stopPropagation(); //-- important

        var room = showxlGlobal.getRoom($scope.tabs[index].room);
        var owner = showxlGlobal.getOwner();
        if( room == null ) {
            room = showxlGlobal.getOwnerRoom();
        }
        //-------------------------------------------//
        $http({
            method : 'DELETE',
            url : '/api/room/exit/'+room._id+'/'+owner._id,
        }).success(function(data) {
        }).error(function(data) {
        });
        //----------------------------------------------------//
        var message = { msg:'exit_room',room:room.roomname,user:owner.nickname };
        showxlGlobal.ioNotify_Server(message);
        showxlGlobal.ioNotify_Room(message);
        //----------------------------------------------------//
        if( $scope.tabs[index].owner == true ) {
            owner.bLive = false;
            showxlGlobal.setOwner(owner);
            $http({
                method : 'DELETE',
                url : '/api/room/remove/'+room._id,
            }).success(function(data) {
                var message = { msg:'remove_room',room:room.nickname,user:owner.nickname };
                showxlGlobal.ioNotify_All(message);
                
            }).error(function(data) {
            });

            //-- stoplive cam when tab is closed
            var message = { msg:'stoplive',room:room.nickname,user:owner.nickname };
            showxlGlobal.ioNotify_All(message);
            showxlGlobal.setLive(false);
            showxlGlobal.UpdateGolive();
        }
        //-------------------------------------------//
        $scope.tabs.splice(index, 1);
        $scope.currentTab = 0;

    };

    $scope.onClickTab = function (tab) {
        showxlGlobal.LeaveRoom($scope.tabs[$scope.currentTab].room);
        $scope.currentTab = tab;
        showxlGlobal.EnterRoom($scope.tabs[$scope.currentTab].room);
    }
    
    $scope.isActiveTab = function(tab) {
        return tab == $scope.currentTab;
    }

    $scope.getTabView = function () {
        return $scope.tabs[$scope.currentTab].url;
    }
    $scope.getTabView = function () {
        return $scope.tabs[$scope.currentTab].url;
    }
});
