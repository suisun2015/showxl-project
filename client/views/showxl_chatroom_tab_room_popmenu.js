showxlApp.controller('showxl_chatroom_tab_room_popmenu', ['$scope','$http','$modalInstance','$timeout','showxlGlobal','menuvalues', function($scope,$http,$modalInstance,$timeout,showxlGlobal,menuvalues) {
    $scope.nickname = menuvalues.nickname;
    $scope.age = menuvalues.age;
    //-------------------------------------------------------------//
    $timeout(function () {
        x = menuvalues.left;
        y = menuvalues.top;

        $('.modal-backdrop').hide();
        $(".modal-dialog").css({"left":x+"px", "top":y+"px","width":"172px"});

    }, 0);
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    $scope.onload = function() {
        owner = showxlGlobal.getOwner();
        setTimeout(function() {
            LoadPage();
        },100);
    }
    $scope.onClick = function( idx ) {
        $modalInstance.close(idx);
    }
    
    //-------------------------------------------------------------//
    function LoadPage() {
    };
}]);

