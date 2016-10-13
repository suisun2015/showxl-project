showxlApp.controller('showxl_chatroom_privatemsg', ['$scope','$modalInstance','$timeout','showxlGlobal',function($scope,$modalInstance,$timeout,showxlGlobal) {
    $scope.owner = showxlGlobal.getOwner();
    $scope.chats = [];
    //-----------------------------------------------//
    $timeout(function () {
        $(".modal-dialog").draggable();
    }, 0);
    
    //-----------------------------------------------//
    $scope.onload = function() {
    	setTimeout(function() {
            LoadPage();
            // ReadMessage();
            ReadMessageLocal();
        }, 100);
    }
    $scope.getPhoto = function(url) {
        if( url != "" )
            return "uploads/" + url;
        else  
            return "images/avatar.jpg";
    }
    
    function ReadMessageLocal() {
        var messages = showxlGlobal.getAllMessages();
        var idx = [];
        var local = [];
        var i;
        messages.forEach(function(chat) {
            if( chat.from == $scope.owner.nickname )
                return;
            i = idx.indexOf(chat.from);
            if( i == -1 ) {
                idx.push(chat.from);
                var item = {from:chat.from,to:chat.to,photo:chat.photo,message:chat.message,date:chat.date,count:1,bRead:chat.bRead};
                local.push(item);
            } 
            else {
                local[i].message = chat.message;
                local[i].date = chat.date;
                local[i].bRead = chat.bRead;
                local[i].count++;
            }
        }, this);
        $scope.chats = local; 
        $timeout(function(){ $scope.$apply(function() {
            $('#privateMsgModal .modal-body').animate({ scrollTop: $('#privateMsgModal .modal-body').prop("scrollHeight") }, 1);
        }); });            
        // $scope.$apply(function() {
        //     $('#privateMsgModal .modal-body').animate({ scrollTop: $('#privateMsgModal .modal-body').prop("scrollHeight") }, 1);
        // });

    }
    $scope.randomDate = function(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };
    
    //-------------------------------------------------------------//
    $scope.onCancel = function() {
        $modalInstance.dismiss();
    }
    //-------------------------------------------------------------//
    $scope.enterPrvChatModal = function(from) {
        $modalInstance.close(from);//-- temporary return value
    }
    //-------------------------------------------------------------//
    $(window).resize(function() {
        LoadPage();
    });

    function LoadPage() {
        //=============================================================//
    }

}]);
