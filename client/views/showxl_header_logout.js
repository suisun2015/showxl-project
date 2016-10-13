showxlApp.controller('showxl_header_logout', ['$scope','$http','$modalInstance','$timeout','showxlGlobal','cfpLoadingBar', function($scope,$http,$modalInstance,$timeout,showxlGlobal,cfpLoadingBar) {

    //-------------------------------------------------------------//
    $timeout(function () {
        $(".modal-dialog").draggable({ handle:".modal-header" });
    }, 0);
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    var timer;// = setTimeout(InitializePage, 100);

    InitializePage = function(){
   　　　clearTimeout(timer);
        LoadPage();
    }
    
    $scope.onload = function() {
        var top = $(window).height();
        top = top/3;
        $('#logoutModal').parent('.modal-content').parent('.modal-dialog').css("top", top+"px");

        timer = setTimeout(InitializePage, 100);
    }
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//

    $scope.onCancel = function()  {
        $modalInstance.dismiss();
    }

    $scope.confirmLogout = function() {
        $modalInstance.dismiss();

        window.location.reload(true);
    }
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //-- responsive size control
    $(window).resize(function() {
        LoadPage();
    });

    //-------------------------------------------------------------//
    function LoadPage() {
    };

    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//

}]);

