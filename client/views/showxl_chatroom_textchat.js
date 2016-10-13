showxlApp.controller('showxl_chatroom_textchat', function($scope, $http,$timeout, $modal,$routeParams,showxlGlobal) {
    $scope.GlobalIndex = -1;
    $scope.owner = showxlGlobal.getOwner();
    $scope.tchats = [];
    var roomname = '';
    var tabs = showxlGlobal.getTabs()
    $scope.tabIndex = -1;
    $scope.isowner = true; 
    //-----------------------------------------------//
    $scope.onload = function(idx) {
        $scope.tabIndex = idx;
        $scope.GlobalIndex = tabs[$scope.tabIndex].index;
        roomname = tabs[$scope.tabIndex].room;
        $scope.isowner = $scope.owner.nickname == roomname ? true:false; 
        
    	setTimeout(function() {
            LoadPage();

            var chat = {nickname:'system'};
            chat.message = $scope.owner.nickname + ' has joined room.';
            chat.date = new Date();
            $scope.tchats.push(chat);
            console.log('chat-text-chat');
            $timeout(function(){ $scope.$apply(function() {
                $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
            }); });            
        },100);
    }

    $scope.getChatContents = function(chat) {
        if( chat.nickname == 'system' )
            return 'showxl_tag_chat_system.html';
        else if( chat.nickname == roomname )
            return 'showxl_tag_chat_right.html';
        else 
            return 'showxl_tag_chat_left.html';
    }

    $scope.getPhoto = function(chat) {
        if( chat.photo != "" ) {
            if( chat.photo == undefined )
                return "images/avatar.jpg";
            else
                return "uploads/" + chat.photo;
        }
        else  
            return "images/avatar.jpg";
    }
    $scope.doPost = function() {
        var chat = {nickname:$scope.owner.nickname,photo:$scope.owner.photo};
        chat.message = $('#textChat-'+$scope.GlobalIndex+' .emoji-wysiwyg-editor').html();
        $('#textChat-'+$scope.GlobalIndex+' .emoji-wysiwyg-editor').html('');
        $('#textChat-'+$scope.GlobalIndex+' .emoji-wysiwyg-editor').get(0).focus();//-- TRICK | set focus to contenteditable div
        if(chat.message.trim() == '') {
            return;
        }
        chat.room = roomname; 
        chat.age = $scope.owner.age;
        chat.date = new Date();

        $scope.tchats.push(chat);
        $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
        //-----------------------------------------------//
        var message = chat;
        message.msg = 'text_chat';
        // send text message
        showxlGlobal.ioNotify_Room(message);
        //-----------------------------------------------//

    }

    //-----------------------------------------------//
    //-----------------------------------------------//
    //-----------------------------------------------//
    $scope.isMyRoom=function(room) {
        tabs = showxlGlobal.getTabs()
        for( i = 0; i < tabs.length; i++ ) {
            if( tabs[i].active == true ) {
                if( tabs[i].room == room ) 
                    return true;
            }
        }
        return false;
    }

    $scope.$on('notify_room', function(event, message) {
        if( message.room != roomname )
            return;
        if( message.msg == '' ) {
        }
        else if( message.msg == 'text_chat' ) {
            var chat = message;
            $scope.tchats.push(chat);
            console.log('chat-text-chat');
            $timeout(function(){ $scope.$apply(function() {
                $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
            }); });            

            // notify 
            if( $scope.isMyRoom(message.room) == false ) {
                // alert('texct');
                var xpos = $('#chattabs ul li:nth-child(2)').position().left;
                var xmove = $('#chattabs ul li:nth-child(2)').width();
                xmove = xmove*2/5;
                xpos = xpos + xmove;
                $('#newMyRoomEventArrow').css("display", "block");
                $('#newMyRoomEventArrow').css("left", xpos+"px");
                try {
                    $('#newMyRoomEventAlarm')[0].play();
                }
                catch(e) {}
            }
        }
        else if( message.msg == 'pre_notify_chat' ) {
            // notify 
            if( $scope.isMyRoom(message.room) == false ) {
                // alert('video');
                var xpos = $('#chattabs ul li:nth-child(2)').position().left;
                var xmove = $('#chattabs ul li:nth-child(2)').width();
                xmove = xmove*2/5;
                xpos = xpos + xmove;
                $('#newMyRoomEventArrow').css("display", "block");
                $('#newMyRoomEventArrow').css("left", xpos+"px");
                try {
                    $('#newMyRoomEventAlarm')[0].play();
                }
                catch(e) {}
            }
        }
        else if( message.msg == 'enter_room' ) {
            var chat = {nickname:'system'};
            chat.message = message.user + ' has joined room.';
            chat.date = new Date();
            $scope.tchats.push(chat);
            console.log('chat-text-chat');
            $timeout(function(){ $scope.$apply(function() {
                $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
            }); });            
            // $scope.$apply(function() {
            //     $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
            // });
        }
        else if( message.msg == 'exit_room' ) {
            var chat = {nickname:'system'};
            chat.message = message.user + ' has left room.';
            chat.date = new Date();
            $scope.tchats.push(chat);
            console.log('chat-text-chat');
            $timeout(function(){ $scope.$apply(function() {
                $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
            }); });            
            // $scope.$apply(function() {
            //     $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
            // });
        }
        else if( message.msg == 'remove_user_room' ) {
            var chat = {nickname:'system'};
            if( message.user == $scope.owner.nickname ) {
                if( $scope.owner.noenterroom == undefined )
                    $scope.owner.noenterroom = [];
                $scope.owner.noenterroom.push(roomname);

                setTimeout(function() {
                    //-------------------------------------------//
                    var room = showxlGlobal.getRoom(roomname);
                    if( room ) {
                        $http({
                            method : 'DELETE',
                            url : '/api/room/exit/'+room._id+'/'+$scope.owner._id,
                        }).success(function(data) {
                        }).error(function(data) {
                        });
                    }
                    var message = { msg:'exit_room',room:roomname,user:$scope.owner.nickname };
                    showxlGlobal.ioNotify_Room(message);
                    //-------------------------------------------//
                    tabs.splice($scope.tabIndex, 1);
                    showxlGlobal.setTabs( tabs );
                }, 1000*5);
                chat.message = 'You are banned out in 5 sec by room host.';
                chat.date = new Date();
            }
            else {
                chat.message = message.user + ' has been banned out.';
                chat.date = new Date();

            }
            $scope.tchats.push(chat);
            console.log('chat-text-chat');
            $timeout(function(){ $scope.$apply(function() {
                $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
            }); });            
        }
        else if( message.msg == 'remove_camera_room' ) {
            var chat = {nickname:'system'};
            if( message.user == $scope.owner.nickname ) {
                chat.message = 'You are kicked out by room host.';
                chat.date = new Date();
                $scope.tchats.push(chat);
                $timeout(function(){ $scope.$apply(function() {
                    $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
                }); });            
            }
        }
        
    });
    //-----------------------------------------------//
    $scope.$on('event_modify_users', function(event, message) {
    });

    //-----------------------------------------------//
    $scope.$on('notify_close_server', function(event, message) {
        if( message != roomname )
            return;
        var chat = {nickname:'system'};
        chat.message = 'Host('+message + ') has left room. You are leaving in 5 sec.';
        chat.date = new Date();
        setTimeout(function() {
            //-------------------------------------------//
            tabs.splice($scope.tabIndex, 1);
            showxlGlobal.setTabs( tabs );
            showxlGlobal.GetAllRoom();
            //-------------------------------------------//
        }, 1000*5);
        $scope.tchats.push(chat);
        console.log('chat-text-chat');
        $timeout(function(){ $scope.$apply(function() {
            $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
        }); });            
    });
    //------------------------------------------------------------//
    enterRoom = function ( room ) {
        var title = room.nickname + ' ' + room.age + 'y';
        var bExist = false; 
        tabs.forEach(function(element) {
            if( element.title == title ) {
                element.active = true;
                bExist = true;
                return;
            }
        }, this);
        if( bExist == true )
            return;
        ;
        //-------------------------------------------//
        // exit in our room
        // var r = showxlGlobal.getRoom(roomname);
        // if( r ) {
        //     $http({
        //         method : 'DELETE',
        //         url : '/api/room/exit/'+r._id+'/'+$scope.owner._id,
        //     }).success(function(data) {
        //     }).error(function(data) {
        //     });
        //     var message = { msg:'exit_room',room:r.roomname,user:$scope.owner.nickname };
        //     showxlGlobal.ioNotify_Room(message);
        //     //-------------------------------------------//
        //     tabs.splice($scope.tabIndex, 1);
        //     showxlGlobal.setTabs( tabs );
        // }
        //-------------------------------------------//
        var tabMaxIndex = showxlGlobal.getMaxTabIndex();
        showxlGlobal.setMaxTabIndex(tabMaxIndex+1);
        var tag = {
            title: room.nickname + ' ' + room.age + 'y',
            url: 'showxl_chatroom_tab_room.html',
            type: 'fa-user',
            owner:false,
            close: true,
            active: true,
            index:tabMaxIndex,
            room: room.nickname
        };
        tabs.push( tag );
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

    //-----------------------------------------------//
    $scope.onClickPhoto = function(chat,tab,idx) {
        var pwidth = $('#chat-'+tab+'-'+idx+" > img").width();
        var pheight = $('#chat-'+tab+'-'+idx+" > img").height();
        var parentWidth = $(window).width();
        var parentHeight = $(window).height();
        var position = $('#chat-'+tab+'-'+idx+" > img").offset();
        var mposx = (parentWidth-230)/2;
        var mposy = 30;
        var menux;
        var menuy;
        url = '';
        if( chat.nickname == $scope.owner.nickname ) 
            return;
        if( chat.nickname == roomname ) {
            menux = position.left - mposx + pwidth + 10;
            menuy = position.top - mposy - 50;
            url = "showxl_chatroom_textchat_leftmenu_owner.html";
        }
        else {
            menux = position.left - mposx - 230 - 20;
            menuy = position.top - mposy - 50;
            url = "showxl_chatroom_textchat_leftmenu.html";
            var room = showxlGlobal.getRoom(chat.nickname);
            if( !room ) {
                url = "showxl_chatroom_textchat_leftmenu_owner.html";
            }
        }
        var modalInstance = $modal.open({
            templateUrl: url,
            controller: 'showxl_chatroom_textchat_leftmenu',
            backdrop:true,
            resolve: { menuvalues: function() { return { data: chat,left:menux,top:menuy }; } }
        }); 
  
        modalInstance.result.then(function(result) {
            if( result == 0 ) {
                var modalInstance = $modal.open({
                    templateUrl: "showxl_chatroom_privatechat.html",
                    controller: 'showxl_chatroom_privatechat',
                    backdrop: false,
                    resolve: { modalparams: function() { return { data: chat }; } }
                });
            }
            else if( result == 1 ) {
                var room = showxlGlobal.getRoom(chat.nickname);
                if( room ) {
                    enterRoom(room);
                }
            }
            else if( result == 2 ) {
                alert( "Working..." );
            }
        }, function(result) {
        });
    }
    //-----------------------------------------------//
    //-----------------------------------------------//
    //-----------------------------------------------//
    $(window).resize(function() {
        LoadPage();
    });

    function LoadPage() {
        if( $scope.tabIndex == -1 )
            return;
        console.log('text-chat-onload');
        //-- Initialization
        var parentWidth = $(window).width();
        var parentHeight = $(window).height();

        $('#textChat-'+$scope.GlobalIndex+' #chat_list').height(parentHeight - 320);
        $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);

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
        
        if( btnPosX !== undefined && btnPosY != undefined ) {
            $('.emoji-menu').offset({ top:btnPosY-162, left:btnPosX-202 }).css("position","fixed");
        }//-- preserve position

        if($scope.isowner == false) {
            $('#textChat-'+$scope.GlobalIndex+' .emoji-picker-icon').css("right", "72px");
        }//-- position adjustment for emoji icon

    };

    //-----------------------------------------------------//
    //-----------------------------------------------------//
    var btnPosX, btnPosY;
    $(document).on('click', '.emoji-picker-icon', function(event) {
        var $btn = $(event.target);
        btnPosX = $btn.offset().left;
        btnPosY = $btn.offset().top;
        $('.emoji-menu').offset({ top:btnPosY-162, left:btnPosX-202 }).css("position","fixed");
    });//-- this affects global setting...

    $(document).on('keydown', function(e) {
        var inputParentID = $(e.target).parent().parent().parent().parent().attr("id");
        if( e.which == 13 && inputParentID == 'textChat-'+$scope.GlobalIndex ) {
            var $sendbtn = $('#textChat-'+$scope.GlobalIndex+' #sendMsgBtn');
            angular.element($sendbtn).scope().doPost();
            angular.element($sendbtn).scope().$apply();
            //-- input refresh trick
            setTimeout(function() {
                $('#textChat-'+$scope.GlobalIndex+' .emoji-wysiwyg-editor').html('');
            }, 100);
        }
    });
    //-----------------------------------------------------//
    //-----------------------------------------------------//

    $scope.randomDate = function(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    var photoData;
    // $(document).on('change', ':file', function() {
    //     var files = $(this).get(0).files;
    //     if (files.length > 0) {
    //         file = files[0];
    //         if( file.type.indexOf('image') != -1 )
    //             fileType = 1; // image
    //         else if( file.type.indexOf('video') != -1 )
    //             fileType = 2; // video
    //         else
    //             fileType = 3;
    //         photoData = new FormData();
    //         photoData.append('uploads[]', file, file.name);
    //         uploadFile(fileType,file.name);
    //     }
    // })
    $scope.onFileUpload = function() {
        $('#upload-input-room-'+$scope.GlobalIndex).click();
    }
    
    $(document).on('change', ':file', function() {
        if( this.id != "upload-input-room-"+$scope.GlobalIndex )
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
            $scope.uploadFile(fileType,file.name);
        }
    })
        
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    $scope.doPostPhoto = function(url) {
        var chat = {nickname:$scope.owner.nickname,photo:$scope.owner.photo};
        chat.message = '<img src="'+url+'" class="img-thumbnail" />';
        $('#textChat-'+$scope.GlobalIndex+' .emoji-wysiwyg-editor').get(0).focus();//-- TRICK | set focus to contenteditable div

        if(chat.message.trim() == '') {
            return;
        }
        chat.room = roomname; 
        chat.age = $scope.owner.age;
        chat.date = new Date();

        $scope.tchats.push(chat);
        $timeout(function(){ $scope.$apply(function() {
            $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
        }); });            
        //-----------------------------------------------//
        var message = chat;
        message.msg = 'text_chat';
        // send text message
        showxlGlobal.ioNotify_Room(message);
        //-----------------------------------------------//
    }
    //-------------------------------------------------------------//
    $scope.doPostVideo = function(url) {
        var chat = {nickname:$scope.owner.nickname,photo:$scope.owner.photo};
        chat.message = '<video preload="auto" width="100%" height="auto" controls><source src="'+url+'"/></video>';
        $('#textChat-'+$scope.GlobalIndex+' .emoji-wysiwyg-editor').get(0).focus();//-- TRICK | set focus to contenteditable div

        if(chat.message.trim() == '') {
            return;
        }
        chat.room = roomname; 
        chat.age = $scope.owner.age;
        chat.date = new Date();

        $scope.tchats.push(chat);
        $timeout(function(){ $scope.$apply(function() {
            $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
        }); });            
        //-----------------------------------------------//
        var message = chat;
        message.msg = 'text_chat';
        // send text message
        showxlGlobal.ioNotify_Room(message);
        //-----------------------------------------------//
    }
    //-------------------------------------------------------------//
    $scope.doPostFile = function(url,filename) {
        var chat = {nickname:$scope.owner.nickname,photo:$scope.owner.photo};
        chat.message = '<u><a href="'+url+'" download>'+filename+'</a></u> Click to download.';
        $('#textChat-'+$scope.GlobalIndex+' .emoji-wysiwyg-editor').get(0).focus();//-- TRICK | set focus to contenteditable div

        if(chat.message.trim() == '') {
            return;
        }
        chat.room = roomname; 
        chat.age = $scope.owner.age;
        chat.date = new Date();

        $scope.tchats.push(chat);
        $timeout(function(){ $scope.$apply(function() {
            $('#textChat-'+$scope.GlobalIndex+' #chat_list').animate({ scrollTop: $('#textChat-'+$scope.GlobalIndex+' #chat_list').prop("scrollHeight") }, 1);
        }); });            
        //-----------------------------------------------//
        var message = chat;
        message.msg = 'text_chat';
        // send text message
        showxlGlobal.ioNotify_Room(message);
        //-----------------------------------------------//
    }

    $scope.uploadFile = function(fileType,filename) {
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
                    $scope.doPostPhoto(url);
                else if( fileType == 2 )
                    $scope.doPostVideo(url);
                else
                    $scope.doPostFile(url,filename);
            },
            xhr: function() {
                var xhr = new XMLHttpRequest();

                return xhr;
            }
        });
    }
});
//============================================================//
//::::: trustAsHtml filters custom style in ng-bind-html ::::://
//-- this affects global setting...
showxlApp.filter('trustAsHtml', function($sce) { return $sce.trustAsHtml; });
