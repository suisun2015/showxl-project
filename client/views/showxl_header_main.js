showxlApp.controller('showxl_header_main', function($scope, $http, $timeout,$modal,$routeParams,showxlGlobal) {
    $scope.owner = showxlGlobal.getOwner();
    $scope.bGoLive = showxlGlobal.getLive();
    $scope.getOwnerPhoto = function() {
        if( $scope.owner.photo != "" )
            return "uploads/" + $scope.owner.photo;
        else  
            return "images/avatar.jpg";
    }
    $scope.getOwnerLiveTag = function () {
//        $scope.owner = showxlGlobal.getOwner();
        if( $scope.owner.bLive == true)
            return 'showxl_tag_live.html';
        else
            return '';
    }
    
    $scope.showDialog4CreateRoom = function(){
        if( window.location.href.indexOf('main') != -1 )
            return;
        // get all room from global space
        $scope.bGoLive = showxlGlobal.getLive();
        if( $scope.bGoLive == true ) {
            var message = { msg:'stoplive',room:$scope.owner.nickname,user:$scope.owner.nickname };
            showxlGlobal.ioNotify_All(message);
            showxlGlobal.setLive(false);
            showxlGlobal.UpdateGolive();
            return;
        }

        var tabs = showxlGlobal.getTabs();
        var i;
        for( i = 0 ; i < tabs.length; i++ ) {
            if( tabs[i].room == $scope.owner.nickname )
                break;
        }
        if( i >= tabs.length )
            return;
        var modalInstance = $modal.open({
            templateUrl: "showxl_chatroom_create.html",
            controller: 'showxl_chatroom_create',
            backdrop: false
        });
        modalInstance.result.then(function(result) {
            $scope.owner = showxlGlobal.getOwner();
            var message = { msg:'update_animation_room',room:$scope.owner.nickname,user:$scope.owner.nickname };
            showxlGlobal.ioNotify_All(message);
           
            var message = { msg:'golive',room:$scope.owner.nickname,user:$scope.owner.nickname };
            showxlGlobal.ioNotify_All(message);
            showxlGlobal.setLive(true);
            showxlGlobal.UpdateGolive();
            
        }, function() {
        });
        
    }
    $scope.getGoLive = function() {
        return $scope.bGoLive == false?'images/golive.png':'images/stoplive.png';
    }
    //------------------------------------------------------------//
    $scope.$on('event_update_golive', function(event, message) {
        // get all room from global space
        $scope.bGoLive = showxlGlobal.getLive();
        // display to main page
        $timeout(function(){ $scope.$apply(function() {}); });            
    });        
    
    $scope.gotoMainPage = function() {
        // window.location.href = '#main';

        //-- there are some problems to be dealt with...
    }

    $scope.logout = function() {
        var modalInstance = $modal.open({
            templateUrl: "showxl_header_logout.html",
            controller: 'showxl_header_logout',
            backdrop: false,
            size: 'sm'
        });
    }

});

