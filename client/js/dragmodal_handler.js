
var myApp = angular.module("myApp", ['ui.bootstrap']);
myApp.controller('modal-a', function($scope, $http, $modal) {
        $scope.showModalDialog = function(){
        var modalInstance = $modal.open({
            templateUrl: "modal-b.html",
            controller: 'modal-a'
        });
    }

$(window).load(function() {
    $("#privateMsgModal").draggable({
        handle: ".modal-header"
    });
});
});
