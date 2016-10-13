//showxlApp.controller('showxl_chatroom_create', function($scope,$http,$modalInstance,showxlGlobal) {
showxlApp.controller('showxl_chatroom_textchat_leftmenu', ['$scope','$http','$modalInstance','$timeout','showxlGlobal','menuvalues', function($scope,$http,$modalInstance,$timeout,showxlGlobal,menuvalues) {
    $scope.chat = menuvalues.data;
    //-------------------------------------------------------------//
    $timeout(function () {
        x = menuvalues.left;
        y = menuvalues.top;

        $('.modal-backdrop').hide();
        $(".modal-dialog").css({"left":x+"px", "top":y+"px","width":"212px"});
//        $(".modal-dialog").css({"left":"300px", "top":"200px","width":"230px"});

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

