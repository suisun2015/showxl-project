showxlApp.controller('showxl_chatroom_privatechat', ['$scope','$http','$modalInstance','$timeout','$modal','$routeParams','showxlGlobal','modalparams','cfpLoadingBar', function($scope,$http,$modalInstance,$timeout,$modal,$routeParams,showxlGlobal,modalparams,cfpLoadingBar) {
    $scope.owner = showxlGlobal.getOwner();
    $scope.username = modalparams.data.nickname;
    $scope.userphoto = modalparams.data.photo;
    if( $scope.userphoto == undefined )
        $scope.userphoto = '';
    $scope.chats = [];
    //-------------------------------------------------------------//
    $timeout(function () {
        $(".modal-dialog").draggable({ handle:".modal-header" });
    }, 0);
    //-----------------------------------------------//
    $scope.onload = function() {
    	setTimeout(function() {
            LoadPage();
            // read messsage receieved from users
            // ReadMessage();
            ReadMessageFromLocal();
        }, 100);
    }
    //-------------------------------------------------------------//
    $scope.onCancel = function() {
        $modalInstance.dismiss();
    }
    $scope.onNext = function() {
        $modalInstance.close();
    }
    //-------------------------------------------------------------//
    $scope.getChatContents = function(chat) {
        if( chat.from == 'system' )
            return 'showxl_tag_chat_system.html';
        else if( chat.from == $scope.owner.nickname )
            return 'showxl_tag_chat_private_owner.html';
        else 
            return 'showxl_tag_chat_private_user.html';
    }
    $scope.getPhoto = function(url) {
        if( url != "" )
            return "uploads/" + url;
        else  
            return "images/avatar.jpg";
    }
    //-----------------------------------------------//
    //-----------------------------------------------//
    //-----------------------------------------------//
    $scope.$on('notify_user', function(event, message) {
        if( message.from != $scope.username )
            return;
        if( message.msg == '' ) {
        }
        else if( message.msg == 'private_chat' ) {
            var count = showxlGlobal.getPrivateMessages()-1;
            showxlGlobal.setPrivateMessages(count);
            var chat = message;
            message.bRead = 1;
            $scope.chats.push(chat);
            
            $timeout(function(){ $scope.$apply(function() {
                $('#privateChatModal .modal-body').animate({ scrollTop: $('#privateChatModal .modal-body').prop("scrollHeight") }, 1);
            }); });            
            // $scope.$apply(function() {
            //     $('#privateChatModal .modal-body').animate({ scrollTop: $('#privateChatModal .modal-body').prop("scrollHeight") }, 1);
            // });

        }
    });
    //-----------------------------------------------//
    //-----------------------------------------------//
    //-----------------------------------------------//

    //-------------------------------------------------------------//
    $scope.doPost = function() {
        var chat = {to:$scope.username,from:$scope.owner.nickname,photo:$scope.owner.photo};
        chat.message = $('#privateChatModal .modal-footer .emoji-wysiwyg-editor').html();
        $('#privateChatModal .modal-footer .emoji-wysiwyg-editor').html('');
        $('#privateChatModal .modal-footer .emoji-wysiwyg-editor').get(0).focus();//-- TRICK | set focus to contenteditable div
        if(chat.message.trim() == '') {
            return;
        }
        chat.date = new Date();
        $scope.chats.push(chat);
        $('#privateChatModal .modal-body').animate({ scrollTop: $('#privateChatModal .modal-body').prop("scrollHeight") }, 1);
        //-----------------------------------------------//
        // save to server
        SendMessage(chat)
        //-----------------------------------------------//
        var message = chat;
        message.msg = 'private_chat';
        // send text message
        showxlGlobal.ioNotify_User(message);
        //-----------------------------------------------//
        // save owner message to global space.
        message.bRead = 1;
        showxlGlobal.pushMessage(message);
        //-----------------------------------------------//

    }
    //-------------------------------------------------------------//
    function ReadMessage() {
        var url = 'api/user/readmessage/'+$scope.owner.nickname+'/'+$scope.username;
        $http.get(url).success(function(data) {
            // remove owner room
            $scope.chats = data; 
            $timeout(function(){ $scope.$apply(function() {
                $('#privateChatModal .modal-body').animate({ scrollTop: $('#privateChatModal .modal-body').prop("scrollHeight") }, 1);
            }); });            
            // $scope.$apply(function() {
            //     $('#privateChatModal .modal-body').animate({ scrollTop: $('#privateChatModal .modal-body').prop("scrollHeight") }, 1);
            // });
            
        }).error(function(data, status) {
        });
    }
    function ReadMessageFromLocal() {
        var messages = showxlGlobal.getAllMessages();
        var local = [];
        var unread = 0;
        messages.forEach(function(chat) {
            if( chat.to == $scope.owner.nickname && chat.from == $scope.username ||
                chat.to == $scope.username && chat.from == $scope.owner.nickname ) {
                    if( chat.bRead == 0 ) {
                        unread ++;
                        chat.bRead = 1;
                    }
                    local.push(chat); 
                }
        }, this);
        $scope.chats = local; 
        $timeout(function(){ $scope.$apply(function() {
            $('#privateChatModal .modal-body').animate({ scrollTop: $('#privateChatModal .modal-body').prop("scrollHeight") }, 1);
        }); });            
        // $scope.$apply(function() {
        //     $('#privateChatModal .modal-body').animate({ scrollTop: $('#privateChatModal .modal-body').prop("scrollHeight") }, 1);
        // });
        var count = showxlGlobal.getPrivateMessages()-unread;
        showxlGlobal.setPrivateMessages(count);

    }
    //-------------------------------------------------------------//
    function SendMessage(chat) {
        var params = JSON.stringify({
            "userid":   chat.to,
            "fromid":   chat.from,
            "message":  chat.message,
            "photo":    chat.photo,
            "bRead":    0
        });

        $http({
            method : 'POST',
            url : '/api/user/message/add/',
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
    //-------------------------------------------------------------//
    $scope.randomDate = function(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };
    //-------------------------------------------------------------//
    $(window).resize(function() {
        LoadPage();
    });

    function LoadPage() {
        //-----------------------------------------------------//
        // Initializes and creates emoji set from sprite sheet
        window.emojiPicker = new EmojiPicker({
            emojiable_selector: '[data-emojiable=true]',
            assetsPath: 'js/lib/emoji-picker/img',
            popupButtonClasses: 'fa fa-smile-o'
        });
        // Finds all elements with `emojiable_selector` and converts them to rich emoji input fields
        // You may want to delay this step if you have dynamically created input fields that appear later in the loading process
        // It can be called as many times as necessary; previously converted input fields will not be converted again
        window.emojiPicker.discover();
        //-----------------------------------------------------//
    }

    $(document).on('keydown', function(e) {
        var inputParentID = $(e.target).parent().parent().parent().parent().attr("id");
        if( e.which == 13 && inputParentID == 'privateChatModal' ) {
            var $sendbtn = $('#privateChatModal #sendPrvMsgBtn');
            angular.element($sendbtn).scope().doPost();
            angular.element($sendbtn).scope().$apply();
            //-- input refresh trick
            setTimeout(function() {
                $('#privateChatModal .modal-footer .emoji-wysiwyg-editor').html('');
            }, 100);
        }
    });

    //-------------------------------------------------------------//
    doPostPhoto = function(url) {
        var chat = {to:$scope.username,from:$scope.owner.nickname,photo:$scope.owner.photo};
        chat.message = '<img src="'+url+'" class="img-thumbnail" />';
        $('#privateChatModal .modal-footer .emoji-wysiwyg-editor').get(0).focus();//-- TRICK | set focus to contenteditable div

        if(chat.message.trim() == '') {
            return;
        }
        chat.date = new Date();
        $scope.chats.push(chat);
        $('#privateChatModal .modal-body').animate({ scrollTop: $('#privateChatModal .modal-body').prop("scrollHeight") }, 1);
        //-----------------------------------------------//
        // save to server
        SendMessage(chat)
        //-----------------------------------------------//
        var message = chat;
        message.msg = 'private_chat';
        // send text message
        showxlGlobal.ioNotify_User(message);
        //-----------------------------------------------//
        // save owner message to global space.
        message.bRead = 1;
        showxlGlobal.pushMessage(message);
        //-----------------------------------------------//
        
    }
    doPostVideo = function(url) {
        var chat = {to:$scope.username,from:$scope.owner.nickname,photo:$scope.owner.photo};
        chat.message = '<video preload="auto" width="100%" height="auto" controls><source src="'+url+'"/></video>'+
                        '<img src="images/video_prvmsg.png" class="hidden-poster" style="display:none"/>';
        $('#privateChatModal .modal-footer .emoji-wysiwyg-editor').get(0).focus();//-- TRICK | set focus to contenteditable div

        if(chat.message.trim() == '') {
            return;
        }
        chat.date = new Date();
        $scope.chats.push(chat);
        $('#privateChatModal .modal-body').animate({ scrollTop: $('#privateChatModal .modal-body').prop("scrollHeight") }, 1);
        //-----------------------------------------------//
        // save to server
        SendMessage(chat)
        //-----------------------------------------------//
        var message = chat;
        message.msg = 'private_chat';
        // send text message
        showxlGlobal.ioNotify_User(message);
        //-----------------------------------------------//
        // save owner message to global space.
        message.bRead = 1;
        showxlGlobal.pushMessage(message);
        //-----------------------------------------------//
        
    }
    $scope.loadPrvMsgPhotoModal = function() {
        var modalInstance = $modal.open({
            templateUrl: "showxl_chatroom_send_photo.html",
            controller: "showxl_chatroom_send_photo",
            backdrop: false
        });
        // continuous modal trigger
        modalInstance.result.then(function(result) {
            doPostPhoto(result);
        }, function(result) { });

    }
    $scope.loadPrvMsgVideoModal = function() {
        var modalInstance = $modal.open({
            templateUrl: "showxl_chatroom_send_video.html",
            controller: "showxl_chatroom_send_video",
            backdrop: false
        });
        // continuous modal trigger
        modalInstance.result.then(function(result) {
            doPostVideo(result);
        }, function(result) { });
    }
    var photoData;
    $(document).on('change', ':file', function() {
        if( this.id != "upload-input-private" )
            return;
        
        var files = $(this).get(0).files;
        if (files.length > 0) {
            file = files[0];
            if( file.type.indexOf('image') != -1 )
                fileType = 1; // image
            else if( file.type.indexOf('video') != -1 )
                fileType = 2; // video
            else
                fileType = 3;
            photoData = new FormData();
            photoData.append('uploads[]', file, file.name);
            uploadFile(fileType,file.name);
        }
    })
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    doPostFile = function(url,filename) {
        var chat = {to:$scope.username,from:$scope.owner.nickname,photo:$scope.owner.photo};
        chat.message = '<u><a href="'+url+'" download>'+filename+'</a></u> Click to download.';
        $('#privateChatModal .modal-footer .emoji-wysiwyg-editor').get(0).focus();//-- TRICK | set focus to contenteditable div

        if(chat.message.trim() == '') {
            return;
        }
        chat.date = new Date();
        $scope.chats.push(chat);
        $('#privateChatModal .modal-body').animate({ scrollTop: $('#privateChatModal .modal-body').prop("scrollHeight") }, 1);
        //-----------------------------------------------//
        // save to server
        SendMessage(chat)
        //-----------------------------------------------//
        var message = chat;
        message.msg = 'private_chat';
        // send text message
        showxlGlobal.ioNotify_User(message);
        //-----------------------------------------------//
        // save owner message to global space.
        message.bRead = 1;
        showxlGlobal.pushMessage(message);
        //-----------------------------------------------//
    }

    uploadFile = function(fileType,filename) {
        cfpLoadingBar.start();
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: photoData,
            processData: false,
            contentType: false,
            success: function(data){
                if( data == '' )
                    return;
                url = 'uploads/'+data;
                if( fileType == 1 )
                    doPostPhoto(url);
                else if( fileType == 2 )
                    doPostVideo(url);
                else
                    doPostFile(url,filename);
                cfpLoadingBar.complete();
            },
            xhr: function() {
                var xhr = new XMLHttpRequest();

                return xhr;
            }
        });
    }
        
}]);
