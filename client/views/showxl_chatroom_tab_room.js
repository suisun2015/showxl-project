showxlApp.controller('showxl_chatroom_tab_room', function($scope, $http,$timeout, $modal,$routeParams,showxlGlobal,cfpLoadingBar,toastr) {
    $scope.GlobalIndex = -1;
    $scope.active = [{active:'display:block'}, {active:'display:none'}];
    $scope.users = [];
    $scope.privateMessages = showxlGlobal.getPrivateMessages();
    $scope.roomname = '';
    $scope.localStream = null;
    $scope.localVideo;
    $scope.bCapture = false;
    $scope.ownerIndex = -1;
    
    $scope.isCreator = 0;  // Creator
    $scope.isShowLive = 0; // Creator

    $scope.videos = [
        {nickname:'',photo:'',show: 2,owner:2,view:null},
        {nickname:'',photo:'',show: 0,owner:1,view:null},
        {nickname:'',photo:'',show:-1,owner:0,view:null},
        {nickname:'',photo:'',show:-1,owner:0,view:null},
        {nickname:'',photo:'',show:-1,owner:0,view:null},
        {nickname:'',photo:'',show:-1,owner:0,view:null}
    ]
    $scope.userviews = [{view:null},{view:null},{view:null},{view:null},{view:null},{view:null}]
    //images/noCamLive.png
    // /images/avatar.jpg
    $scope.peers = {};     // peer's video
    $scope.broadcast = {}; // owner video broad cast

    $scope.owner = showxlGlobal.getOwner();
    $scope.capture = null;
	$scope.curSelect = 0;

    var tabs;
    var tabIndex = -1;
    var rate;

    cfpLoadingBar.start();
    $scope.$on('$destroy', function() {
        $scope.stopCapture();
        for( var p in $scope.broadcast ) {
            $scope.broadcast[p].Close();
            delete $scope.broadcast[p];
        }
        for( var p in $scope.peers ) {
            $scope.peers[p].Close();
            delete $scope.peers[p];
        }
        if( $scope.capture )
            delete $scope.capture;
    })
    angular.element(document).ready(function () {
        var a = 0;
    });
    
    //-------------------------------------//
    //-------------------------------------//
    window.onbeforeunload = function(e) {
        //-- custom text won't work for browser security
        var dialogText = 'Dialog text here';
        e.returnValue = dialogText;
        return dialogText;
    };
    //-------------------------------------//
    $scope.UpdateVideos = function() {
        var i = 0;
        if( $scope.isShowLive == 1 ) {
            $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex).css("opacity", "1");
            $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' i').hide();
            $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' .glyphicon').hide();
            if( $scope.videos[i].show == 1 ) {
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' img').css("opacity", "0");
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' video').css("opacity", "1");
                view = document.querySelector('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' video');
                if( view != $scope.userviews[i].view ) {
                    $scope.userviews[i].view = view;
                    if( $scope.isCreator == 1 )
                        $scope.capture.changeView(view);
                    else 
                        if( $scope.peers[$scope.videos[i].nickname] != undefined )
                            $scope.peers[$scope.videos[i].nickname].changeRemoteView(view);
                }
            }
            else if( $scope.videos[i].show == 2 ) {
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' img').css("opacity", "1");
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' video').css("opacity", "0");
                $('#localvideo-frame-large-'+$scope.GlobalIndex+' img').css("opacity", "0");
                $('#localvideo-frame-large-'+$scope.GlobalIndex+' video').css("opacity", "1");
                view = document.querySelector('#localvideo-frame-large-'+$scope.GlobalIndex+' video');
                if( view != $scope.userviews[i].view ) {
                    $scope.userviews[i].view = view;
                    if( $scope.isCreator == 1 )
                        $scope.capture.changeView(view);
                    else 
                        if( $scope.peers[$scope.videos[i].nickname] != undefined )
                            $scope.peers[$scope.videos[i].nickname].changeRemoteView(view);
                }
            }
        } 
        else {
            $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex).css("opacity", "1");
            $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' img').css("opacity", "1");
            $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' video').css("opacity", "0");
            $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' i').hide();
            $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' .glyphicon').hide();
            if( $scope.videos[i].show == 1 ) {
            }
            else if( $scope.videos[i].show == 2 ) {
                $('#localvideo-frame-large-'+$scope.GlobalIndex+' img').css("opacity", "1");
                $('#localvideo-frame-large-'+$scope.GlobalIndex+' video').css("opacity", "0");
            }
        }

        for( i = 1; i < 6; i++ ) {
            if( $scope.videos[i].show == -1 ) {
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex).css("opacity", "0");
            }
            else if( $scope.videos[i].show == 1 ){
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex).css("opacity", "1");
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' img').css("opacity", "0");
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' video').css("opacity", "1");
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' i').hide();

                if( $scope.videos[i].owner == 1 ) {
                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' .glyphicon').show();

                    view = document.querySelector('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' video');
                    if( view != $scope.userviews[i].view ) {
                        $scope.userviews[i].view = view;
                        $scope.capture.changeView(view);
                    }
                }
                else {
                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' .glyphicon').hide();
                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' i').show();

                    if( $scope.peers[$scope.videos[i].nickname] != undefined ) {
                        view = document.querySelector('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' video');
                        if( view != $scope.userviews[i].view ) {
                            $scope.userviews[i].view = view;
                            $scope.peers[$scope.videos[i].nickname].changeRemoteView(view);
                        }
                    }
                }
            }
            else if( $scope.videos[i].show == 2 ){
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex).css("opacity", "1");
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' img').css("opacity", "1");
                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' video').css("opacity", "0");


                $('#localvideo-frame-large-'+$scope.GlobalIndex+' img').css("opacity", "0");
                $('#localvideo-frame-large-'+$scope.GlobalIndex+' video').css("opacity", "1");

                $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' i').hide();

                if( $scope.videos[i].owner == 1 ) {
                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' .glyphicon').show();
                    view = document.querySelector('#localvideo-frame-large-'+$scope.GlobalIndex+' video');
                    if( view != $scope.userviews[i].view ) {
                        $scope.userviews[i].view = view;
                        $scope.capture.changeView(view);
                    }
                }
                else {
                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' .glyphicon').hide();
                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' i').show();

                    if( $scope.peers[$scope.videos[i].nickname] != undefined ) {
                        view = document.querySelector('#localvideo-frame-large-'+$scope.GlobalIndex+' video');
                        if( view != $scope.userviews[i].view ) {
                            $scope.userviews[i].view = view;
                            $scope.peers[$scope.videos[i].nickname].changeRemoteView(view);
                        }
                    }
                }
            }
            else {
                if( $scope.isCreator == 0 ) {
                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex).css("opacity", "1");
                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' img').css("opacity", "1");
                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' video').css("opacity", "0");

                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' i').hide();
                    $('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex+' .glyphicon').hide();
                }
            }
        }
        count = $scope.getPeers();
        $timeout(function(){ $scope.$apply(function() {}); });            
        // $scope.$apply(function() {});
    }
    //--------------------------------------------------------------------//
    $scope.volumeOnOff = function($event, camNo) {
        $event.stopPropagation();//-- prevent sequential click upon overlapped elements

        var elm = angular.element($event.currentTarget);
        var volumeStatus = elm.attr("class");

        if(volumeStatus == "fa fa-volume-up") {
            elm.removeClass("fa-volume-up").addClass("fa fa-volume-off");
            elm.parent().children("video").prop('muted', true);

            //-- check if clicked cam is activated to synchronize big canvas
            if( $('#livecam-thumbnail-'+camNo+'-'+$scope.GlobalIndex+' video').css("opacity") == 0 ) {
                $('#localvideo-large-'+$scope.GlobalIndex).prop('muted', true);
            }
        } else {
            elm.removeClass("fa-volume-off").addClass("fa fa-volume-up");
            elm.parent().children("video").prop('muted', false);

            //-- check if clicked cam is activated to synchronize big canvas
            if( $('#livecam-thumbnail-'+camNo+'-'+$scope.GlobalIndex+' video').css("opacity") == 0 ) {
                $('#localvideo-large-'+$scope.GlobalIndex).prop('muted', false);
            }
        }
    }

    $scope.stopLiveCam = function(camNo) {
        $scope.ownerIndex = -1;
        $scope.curSelect = 0;
        $scope.videos[0].show = 2;
        $scope.bCapture = false;
        $scope.stopCapture();
        for( var p in $scope.broadcast ) {
            $scope.broadcast[p].Close();
            delete $scope.broadcast[p];
        }
        //-- if not creator
        if( $scope.isCreator == 0 ) {
            $scope.userviews[camNo].view = null;
            for( i = camNo; i < 5; i++ ) {
                $scope.userviews[i].view = null;
                $scope.videos[i].nickname = $scope.videos[i+1].nickname;
                $scope.videos[i].show = $scope.videos[i+1].show;
                $scope.videos[i].photo = $scope.videos[i+1].photo;
                $scope.videos[i].owner = $scope.videos[i+1].owner;
                $scope.videos[i+1].show = -1;
                $scope.videos[i+1].photo = '';
                $scope.videos[i+1].nickname = '';
            }                               
            count = $scope.getPeers();
            if( count == 0 )
                count = 1;
            // full 
            if( count < 6 ) {
                $scope.videos[count].owner = 1;
                $scope.videos[count].show = 0;
                $scope.videos[count].nickname = $scope.owner.nickname;
                $scope.videos[count].photo = $scope.owner.photo;
            }
        }

        initCanvasVolume(camNo);
        
        $scope.UpdateVideos();
    }

    $scope.shutMyCam = function($event, camNo) {

        $event.stopPropagation();

        $scope.ownerIndex = -1;
        $scope.curSelect = 0;
        $scope.videos[0].show = 2;

        $scope.bCapture = false;
        $scope.stopCapture();
        $scope.videos[camNo].show = 0;
        for( var p in $scope.broadcast ) {
            $scope.broadcast[p].Close();
            delete $scope.broadcast[p];
        }
        //-- if not creator
        if( $scope.isCreator == 0 ) {
            $scope.userviews[camNo].view = null;
            for( i = camNo; i < 5; i++ ) {
                $scope.userviews[i].view = null;
                $scope.videos[i].nickname = $scope.videos[i+1].nickname;
                $scope.videos[i].show = $scope.videos[i+1].show;
                $scope.videos[i].photo = $scope.videos[i+1].photo;
                $scope.videos[i].owner = $scope.videos[i+1].owner;
                $scope.videos[i+1].show = -1;
                $scope.videos[i+1].photo = '';
                $scope.videos[i+1].nickname = '';
            }                               
            count = $scope.getPeers();
            if( count == 0 )
                count++;
            // full 
            if( count < 6 ) {
                $scope.videos[count].owner = 1;
                $scope.videos[count].show = 0;
                $scope.videos[count].nickname = $scope.owner.nickname;
                $scope.videos[count].photo = $scope.owner.photo;
            }
        }
        
        initCanvasVolume(camNo);
        
        $scope.UpdateVideos();
    }

    $scope.showCamCtrl = function($event, camNo) {
        var elm1 = angular.element($event.currentTarget).children("i");//-- volume btn
        var elm2 = angular.element($event.currentTarget).children("span");//-- closecam btn
        elm1.css("opacity", "1");
        if($scope.videos[camNo].owner == 1) {
            elm2.css("opacity", "1");
        }
        
        //-- set cursor style
        var elm = angular.element($event.currentTarget);
        if(elm.css("opacity") == 1) {
            elm.css("cursor", "pointer");
        } else {
            elm.css("cursor", "auto");
        }
    }
    $scope.hideCamCtrl = function($event, camNo) {
        var elm1 = angular.element($event.currentTarget).children("i");//-- volume btn
        var elm2 = angular.element($event.currentTarget).children("span");//-- closecam btn
        elm1.css("opacity", "0");
        if($scope.videos[camNo].owner == 1) {
            elm2.css("opacity", "0");
        }

        //-- set cursor style
        var elm = angular.element($event.currentTarget);
        elm.css("cursor", "auto");
    }
    //--------------------------------------------------------------------//

    $scope.getCreatorPhoto = function() {
        if( $scope.videos[0].photo != '' )
            return "uploads/"+$scope.videos[0].photo;
        else  
            return "images/avatarBig.jpg";
    }
    $scope.getOwnerPhoto = function() {
        if( $scope.owner.photo != '' )
            return "uploads/"+$scope.owner.photo;
        else  
            return "images/avatarBig.jpg";
    }
    $scope.getPhoto = function(idx) {
        if( idx == 0 ) {
            if( $scope.videos[idx].photo != '' )
                return "uploads/"+$scope.videos[idx].photo;
            else  
                return "images/avatar.jpg";
        }
        if( $scope.videos[idx].owner == 1 ) {
            if( $scope.videos[idx].show == 0 ) {
                return "images/noCamLive.png";
            }
            else {
                if( $scope.videos[idx].photo != '' )
                    return "uploads/"+$scope.videos[idx].photo;
                else  
                    return "images/avatar.jpg";
            }
        }
        else {
            if( $scope.videos[idx].photo != '' )
                return "uploads/"+$scope.videos[idx].photo;
            else  
                return "images/avatar.jpg";
        }
    }


    $scope.sendPreMessage = function() {
        //-----------------------------------------------//
        var message={};
        message.room = $scope.roomname; 
        message.msg = 'pre_notify_chat';
        // send text message
        showxlGlobal.ioNotify_Room(message);
    }

    $scope.onVideo = function(idx) {
        if( $scope.videos[idx].show == -1 )
            return;
        if( idx == 0 ) {
            if( $scope.curSelect != -1 ) {
                if( $scope.videos[$scope.curSelect].nickname != "" ) {
                    $scope.videos[$scope.curSelect].show = 1;
                }
            }
            $scope.curSelect = idx;
            if( $scope.videos[idx].show == 1 ) {
                $scope.videos[idx].show = 2;
            }
            $scope.UpdateVideos();
            return;
        }

        if( $scope.videos[idx].owner == 1 ) {
            if( $scope.curSelect != -1 ) {
                if( $scope.videos[$scope.curSelect].nickname != "" ) {
                    $scope.videos[$scope.curSelect].show = 1;
                }
            }
            if( !$scope.bCapture ) {
                if( $scope.startCapture() == false ) {
                    $scope.ownerIndex = -1;
                    $scope.curSelect = -1;
                    $scope.videos[idx].show = 0;
                    $scope.videos[idx].nickname = $scope.owner.nickname;
                    $scope.videos[idx].photo = $scope.owner.photo;
                    $('#localvideo-frame-large-'+$scope.GlobalIndex+' img').css("opacity", "1");
                    $('#localvideo-frame-large-'+$scope.GlobalIndex+' video').css("opacity", "0");
                }
                else {
                    $scope.ownerIndex = idx;
                    $scope.curSelect = idx;
                    $scope.bCapture = true;
                    $scope.videos[idx].show = 2;
                    $scope.videos[idx].nickname = $scope.owner.nickname;
                    $scope.videos[idx].photo = $scope.owner.photo;

                    $scope.sendPreMessage();
                }
            }
            else {
                //--------------------------------------------------------------------//
                if( $scope.videos[idx].show == 1 ) {
                    $scope.videos[idx].show = 2;
                }
                $scope.ownerIndex = idx;
                $scope.curSelect = idx;
            }
            $scope.UpdateVideos();
        }
        else {
            if( $scope.curSelect != -1 ) {
                if( $scope.videos[$scope.curSelect].nickname != "" ) {
                    $scope.videos[$scope.curSelect].show = 1;
                }
            }
            $scope.curSelect = idx;
            if( $scope.videos[idx].show == 1 ) {
                $scope.videos[idx].show = 2;
            }
            $scope.UpdateVideos();

            $scope.showMenu($scope.curSelect);
        }

    }
    //-------------------------------------------------------//
    initCanvasVolume = function(idx) {
        var elm_i = $('#livecam-thumbnail-'+idx+'-'+$scope.GlobalIndex+' > i');
        var status = elm_i.attr("class");
        var elm_v = $('#livecam-thumbnail-'+idx+'-'+$scope.GlobalIndex+' > video');

        if(status == "fa fa-volume-up") {
            $('#localvideo-large-'+$scope.GlobalIndex).prop('muted', false);
        } else {
            $('#localvideo-large-'+$scope.GlobalIndex).prop('muted', true);
        }

        //-- restore init setting | case of [+]cam
        if( $scope.videos[idx].owner == 1 ) {
            elm_v.prop('muted', false);
            if( elm_i.hasClass("fa-volume-up") ) {
                ;
            } else {
                elm_i.removeClass("fa-volume-off").addClass("fa-volume-up");
            }
        }

    }
    //-------------------------------------------------------//
    
    $scope.showMenu = function(idx) {
        if( $scope.roomname != $scope.owner.nickname )
            return;
        var pwidth = $('#livecam-thumbnail-'+idx+'-'+$scope.GlobalIndex+" > img").width();
        var pheight = $('#livecam-thumbnail-'+idx+'-'+$scope.GlobalIndex+" > img").height();
        var parentWidth = $(window).width();
        var parentHeight = $(window).height();
        var position = $('#livecam-thumbnail-'+idx+'-'+$scope.GlobalIndex+" > img").offset();
        var mposx = (parentWidth-190)/2;
        var mposy = 30;
        var menux;
        var menuy;
        menux = position.left - mposx + pwidth;
        menuy = position.top - mposy - 30 + 60;
        var modalInstance = $modal.open({
            templateUrl: "showxl_chatroom_tab_room_popmenu.html",
            controller: 'showxl_chatroom_tab_room_popmenu',
            backdrop:true,
            resolve: { menuvalues: function() { return { nickname:$scope.videos[idx].nickname,age:getUserAge($scope.videos[idx].nickname),left:menux,top:menuy }; } }
        });
        modalInstance.result.then(function(result) {
            if( result == 0 ) {
                var chat = {nickname:$scope.videos[idx].nickname,photo:$scope.videos[idx].photo};
                var modalInstance = $modal.open({
                    templateUrl: "showxl_chatroom_privatechat.html",
                    controller: 'showxl_chatroom_privatechat',
                    backdrop: false,
                    resolve: { modalparams: function() { return { data: chat }; } }
                });
            }
            else if( result == 1 ) {
                //----------------------------------------------------//
                var message = { msg:'remove_user_room',room:$scope.roomname,user:$scope.videos[idx].nickname };
                showxlGlobal.ioNotify_Room(message);
            }
            else if( result == 2 ) {
                var message = { msg:'remove_camera_room',room:$scope.roomname,user:$scope.videos[idx].nickname };
                showxlGlobal.ioNotify_Room(message);
            }
        }, function(result) {
        });
    }
    $scope.onload = function(tab,idx) {
        tabIndex = idx;
        tabs = showxlGlobal.getTabs();
        $scope.GlobalIndex = tabs[tabIndex].index;
        $scope.roomname = tabs[tabIndex].room;
        
        if( $scope.roomname == $scope.owner.nickname )
            $scope.isCreator = 1;
        var room = showxlGlobal.getRoom($scope.roomname);
        var owner = showxlGlobal.getOwner();
        if( room == null ) {
            room = showxlGlobal.getOwnerRoom();
        }
        $scope.videos[0].photo = room.photo;
        $scope.videos[0].nickname =  room.nickname;
        if( $scope.isCreator == 1 ) {
            $scope.videos[1].show = -1;
            $scope.videos[1].owner = 0;
        }
    	setTimeout(function() {

            $scope.loadPage();

            for( i = 0; i < 6; i++ ) {
                $scope.videos[i].view = document.querySelector('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex +' video');
            }
            $scope.localVideo = document.querySelector('#localvideo-large-'+$scope.GlobalIndex);
            $scope.capture = new Media($scope.localVideo);
//            capture.start();

            $scope.UpdateVideos();

            var message = { msg:'get_status',room:$scope.roomname,user:$scope.owner.nickname,broadcast:0 };
            showxlGlobal.ioNotify_Room(message);

            showxlGlobal.GetUsers( $scope.roomname );

            cfpLoadingBar.complete();

        }, 10);//-- ?
        if( $scope.roomname == $scope.owner.nickname )
            return;
        //-- trigger toastr at initial moment
        toastr.info('<i class="fa fa-info-circle" aria-hidden="true" style="position:absolute; left:10px; top:26px"></i>'+
                    '<h4>'+
                    'If you like to see my bio'+
                    '<i class="fa fa-arrow-down fa-2x" aria-hidden="true" style="margin:0 30px"></i>'+
                    'Then you need to scroll down.'+
                    '</h4>', {
            allowHtml: true,
            iconClass: 'toast-pink'
        });
    }

    $scope.GetTitle = function() {
        if( $scope.curSelect == -1 )
            return $scope.videos[0].nickname + ' ' + getUserAge($scope.videos[0].nickname) + 'y';
        else {
            if( $scope.videos[$scope.curSelect].nickname == '' )
                return '';
            else
                return $scope.videos[$scope.curSelect].nickname + ' ' + getUserAge($scope.videos[$scope.curSelect].nickname) + 'y';
        } 

    }
    $scope.getUserCounts = function(users) {
        if( users == undefined )
            return 0;
        if( users.length )
            return users.length+1;
        else
            return 1;
    }

    $scope.onExitRoom = function() {
        var room = showxlGlobal.getRoom($scope.roomname);
        var owner = showxlGlobal.getOwner();
        if( room == null ) {
            room = showxlGlobal.getOwnerRoom();
        }
        //-------------------------------------------//
        if(room.roomname == owner.nickname) {
            toastr.error('You are responsible to host your room', {
                progressBar: false,
                closeButton: false,
                extendedTimeOut: 1000,
                timeOut: 3000
            });
            return;
        }
        //-------------------------------------------//
        $http({
            method : 'DELETE',
            url : '/api/room/exit/'+room._id+'/'+owner._id,
        }).success(function(data) {
        }).error(function(data) {
        });
        //----------------------------------------------------//
        if( $scope.isCreator == 1 ) {
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
        }
        //----------------------------------------------------//
        var message = { msg:'exit_room',room:room.roomname,user:owner.nickname };
        showxlGlobal.ioNotify_Server(message);
        showxlGlobal.ioNotify_Room(message);
        //-------------------------------------------//
        var i;
        tabs = showxlGlobal.getTabs();
        for( i = 0; i < tabs.length; i++ ) {
            if( $scope.roomname == tabs[i].room )
                break;
        }
        if( i < tabs.length ) {
            tabIndex = i;
            tabs.splice(tabIndex, 1);
            showxlGlobal.setTabs( tabs );

        }

        //-- stoplive cam when room owner leaves its room
        if( $scope.roomname == $scope.owner.nickname ) {
            var message = { msg:'stoplive',room:room.nickname,user:owner.nickname };
            showxlGlobal.ioNotify_All(message);
            showxlGlobal.setLive(false);
            showxlGlobal.UpdateGolive();
        }
    }

    //------------------------------------------------------------//
    $scope.enterUserRoom = function(room) {
        var params = JSON.stringify({
            "roomid":       room._id,
            "userid":       $scope.owner._id,
            "nickname":     $scope.owner.nickname,
            "introduce":    $scope.owner.introduce,
            "age":          $scope.owner.age,
            "photo":        $scope.owner.photo,
            "latitude":     $scope.owner.latitude,
            "longitude":    $scope.owner.longitude,
            "country":      $scope.owner.country,
            "city":         $scope.owner.city,
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
    
    $scope.$on('event_enter_room', function(event, message) {
        if( $scope.roomname != message )
            return;
        $scope.userviews = [{view:null},{view:null},{view:null},{view:null},{view:null},{view:null}]
        $scope.videos = [
            {nickname:'',photo:'',show: 2,owner:2,view:null},
            {nickname:'',photo:'',show: 0,owner:1,view:null},
            {nickname:'',photo:'',show:-1,owner:0,view:null},
            {nickname:'',photo:'',show:-1,owner:0,view:null},
            {nickname:'',photo:'',show:-1,owner:0,view:null},
            {nickname:'',photo:'',show:-1,owner:0,view:null}
        ]
        $scope.ownerIndex = -1;
        var room = showxlGlobal.getRoom($scope.roomname);
        var owner = showxlGlobal.getOwner();
        if( room == null ) {
            room = showxlGlobal.getOwnerRoom();
        }
        $scope.videos[0].photo = room.photo;
        $scope.videos[0].nickname =  room.nickname;

        for( i = 0; i < 6; i++ ) {
            $scope.videos[i].view = document.querySelector('#livecam-thumbnail-'+i+'-'+$scope.GlobalIndex +' video');
        }

        $scope.bCapture = false;
    	$scope.curSelect = 0;
        if( $scope.isCreator == 1 ) {

            $scope.videos[1].show = -1;
            $scope.videos[1].owner = 0;
            //----------------------------------------------------//
            var message = { msg:'enter_room',room:room.nickname,user:$scope.owner.nickname };
            showxlGlobal.ioNotify_Room(message);
            //----------------------------------------------------//

            $scope.UpdateVideos();
            var message = { msg:'get_status',room:$scope.roomname,user:$scope.owner.nickname,broadcast:0 };
            setTimeout(function() {
                showxlGlobal.ioNotify_Room(message);
            },1000);
            showxlGlobal.GetUsers( $scope.roomname );

            //-- remove hint arrow
            $('#newMyRoomEventArrow').css("display", "none");
            return;
        }

        $scope.enterUserRoom(room);
        var message = { msg:'enter_room',room:room.nickname,user:$scope.owner.nickname };
        showxlGlobal.ioNotify_Server(message);
        showxlGlobal.ioNotify_Room(message);
        //----------------------------------------------------//
        $scope.UpdateVideos();
        var message = { msg:'get_status',room:$scope.roomname,user:$scope.owner.nickname,broadcast:0 };
        setTimeout(function() {
            showxlGlobal.ioNotify_Room(message);
        },1000);
        showxlGlobal.GetUsers( $scope.roomname );
    })
    
    $scope.$on('event_leave_room', function(event, message) {
        if( $scope.roomname != message ) {
            return;
        }
        //-------------------------------------------//
        var message = { msg:'stoplive',room:$scope.owner.nickname,user:$scope.owner.nickname };
        showxlGlobal.ioNotify_All(message);
        //-------------------------------------------//
        if( $scope.isCreator == 1 ) {
            showxlGlobal.setLive(false);
            showxlGlobal.UpdateGolive();
            //----------------------------------------------------//
            var message = { msg:'exit_room',room:$scope.roomname,user:$scope.owner.nickname };
            showxlGlobal.ioNotify_Room(message);
            //----------------------------------------------------//
            $scope.stopCapture();
            for( var p in $scope.broadcast ) {
                $scope.broadcast[p].Close();
                delete $scope.broadcast[p];
            }
            for( var p in $scope.peers ) {
                $scope.peers[p].Close();
                delete $scope.peers[p];
            }
            //-------------------------------------------//
            $scope.UpdateVideos();
            return;
        }
        //-------------------------------------------//
        var room = showxlGlobal.getRoom($scope.roomname);
        if( room == null ) {
            room = showxlGlobal.getOwnerRoom();
        }
        //-------------------------------------------//
        $http({
            method : 'DELETE',
            url : '/api/room/exit/'+room._id+'/'+$scope.owner._id,
        }).success(function(data) {
        }).error(function(data) {
        });
        //----------------------------------------------------//
        var message = { msg:'exit_room',room:$scope.roomname,user:$scope.owner.nickname };
        showxlGlobal.ioNotify_Server(message);
        showxlGlobal.ioNotify_Room(message);
        //-------------------------------------------//
        $scope.stopCapture();
        for( var p in $scope.broadcast ) {
            $scope.broadcast[p].Close();
            delete $scope.broadcast[p];
        }
        for( var p in $scope.peers ) {
            $scope.peers[p].Close();
            delete $scope.peers[p];
        }
        //-------------------------------------------//
        $scope.UpdateVideos();
    })

    //------------------------------------------------------------//
    $scope.$on('event_update_golive', function(event, message) {
        if( $scope.isCreator == 0 )
            return;
        // get all room from global space
        var isLive = showxlGlobal.getLive()?1:0;
        $scope.isShowLive = isLive;
        if( isLive == 1 ) {
            if( !$scope.bCapture ) {
                if( $scope.startCapture() == false ) {
                    $scope.ownerIndex = -1;
                    $scope.curSelect = 0;
                    $scope.videos[0].show = 2;
                }
                else {
                    $scope.ownerIndex = 0;
                    $scope.curSelect = 0;
                    $scope.bCapture = true;
                    $scope.videos[0].show = 2;
                }
            }
            $scope.UpdateVideos();
        }
        else {
            if( $scope.bCapture ) {
                $scope.bCapture = 0;
                $scope.stopLiveCam(0);
            }
        }
        // display to main page
        $timeout(function(){ $scope.$apply(function() {}); });            
    });       
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
    //-----------------------------------------------//
    $scope.$on('notify_close_server', function(event, message) {
        if( $scope.owner.nickname != $scope.roomname )
            return;
        $scope.privateMessages = showxlGlobal.getPrivateMessages();
        $timeout(function(){ $scope.$apply(function() {}); });            
    })
    //-----------------------------------------------//
    $scope.$on('notify_room', function(event, message) {
        if( message.room != $scope.roomname )
            return;
        if( message.msg == 'enter_room' ) {
            showxlGlobal.GetUsers(message.room);
        }
        else if( message.msg == 'exit_room' ) {
            showxlGlobal.GetUsers(message.room);
        }
        else if( message.msg == 'get_status' ) {
            // notify broadcast status to all user
            var status = $scope.bCapture;
            var message = { msg:'my_status',room:$scope.roomname,user:$scope.owner.nickname,broadcast:status };
            showxlGlobal.ioNotify_Room(message);
        }
        else if( message.msg == 'my_status' ) {
            if( $scope.isMyRoom(message.room) == false )
                return;
            $scope.CallPeer(message);
        }
        else if( message.msg == 'remove_camera_room' ) {
            if( message.user == $scope.owner.nickname ) {
                for( i = 0; i < 6; i++ ) {
                    if( $scope.videos[i].show != -1 && $scope.videos[i].nickname == message.user) {
                        // $scope.shutMyCam(i);
                        $scope.stopLiveCam(i);
                        break;
                    }
                }
            }
        }
        
    });
    $scope.$on('notify_user', function(event, message) {
        if( message.msg == '' ) {
        }
        else if( message.msg == 'private_chat' ) {
            $scope.privateMessages = showxlGlobal.getPrivateMessages();
            $timeout(function(){ $scope.$apply(function() {}); });            
            // $scope.$apply(function() {});

            //-- alarm trigger
            if ($('#privateChatModal').length == 1) {
                console.log('PrvChatModal Opened!');
            } else {
                try {
                    $('#newPrvmsgAlarm')[0].play();
                }
                catch(e) {}
            }
        }
        // for webrtc
        else if( message.msg == 'webrtc' ) {
            if( message.room != $scope.roomname )
                return;
            var msg = message.contents;
            if (msg.type === 'offer') {
                //-----------------------------------------//
                if( $scope.broadcast[message.from] != undefined ) {
                    $scope.broadcast[message.from].Close();
                    delete $scope.broadcast[message.from];
                }
                //-----------------------------------------//
                var connector;
                $scope.localStream = $scope.capture.getStream();
                var remoteVideo = null;
                connector = new Connector($scope.localStream,remoteVideo);
                connector.socket = showxlGlobal.getSocket();
                connector.me_id = $scope.owner.nickname;
                connector.other_id = message.from;
                connector.room_id = $scope.roomname;
                connector.direct = message.direct;
                connector.remoteDescription = msg;
                connector.doAnswer();
                $scope.broadcast[message.from] = connector;
                //-----------------------------------------//
            } else if (msg.type === 'answer' ) {
                $scope.peers[message.from].setRemoteDescription(msg);
            } else if (msg.type === 'candidate' ) {
                if( message.caller == 1)
                    $scope.broadcast[message.from].setRemoteCandidate(msg);
                else if( message.caller == 2)
                    $scope.peers[message.from].setRemoteCandidate(msg);
            }
        }
    });
    //-----------------------------------------------//
    $scope.$on('event_modify_users', function(event, roomname) {
        if( $scope.roomname != roomname )
            return;
        var room = showxlGlobal.getRoom( $scope.roomname );
        if( !room )
            room = showxlGlobal.getOwnerRoom();
        $scope.users = room.users;
        $timeout(function(){ $scope.$apply(function() {}); });            
        // $scope.$apply(function() {});
    });
    //-----------------------------------------------//
    $scope.$on('event_modify_private', function(event, roomname) {
        $scope.privateMessages = showxlGlobal.getPrivateMessages();
        $timeout(function(){ $scope.$apply(function() {}); });            
        // $scope.$apply(function() {});
    });
    //-----------------------------------------------//
    $scope.getPeers = function() {
        count = 0;
        for( var p in $scope.peers )
            count++;
        return count;
    }

    $scope.CallPeer = function(message) {
        if( message.broadcast == true ) { // broadcast
            if( $scope.peers[message.user] != undefined ) // already exist
                return;
            if( $scope.isCreator == 1 ) { // if create owner.
                $scope.CallFromCreator(message);
            }
            else {
                $scope.CallFromPeer(message);
            }
        } 
        else if( message.broadcast == false ) { // broadcast
            if( $scope.peers[message.user] != undefined ) {
                $scope.peers[message.user].Close();
                delete $scope.peers[message.user];
            }

            if( message.user == $scope.roomname ) { // creator
                $scope.isShowLive = 0;
                $scope.UpdateVideos();
                return;
            } 
            for( i = 0; i < 6; i++ ) {
                if( $scope.videos[i].nickname == message.user ) {
                    $scope.videos[i].show = -1;
                    $scope.videos[i].nickname = '';
                    break;
                }
            }
            if( i == $scope.curSelect ) {
                $scope.curSelect = 0;
                $scope.videos[0].show = 2;
            }
            if( i != 6 ) {
                for( ; i < 5; i++ ) {
                    $scope.videos[i].nickname = $scope.videos[i+1].nickname;
                    $scope.videos[i].show = $scope.videos[i+1].show;
                    $scope.videos[i].photo = $scope.videos[i+1].photo;
                    $scope.videos[i].owner = $scope.videos[i+1].owner;
                    $scope.videos[i+1].show = -1;
                    $scope.videos[i+1].nickname = '';
                }                               
            }
            $scope.UpdateVideos();
        }
    }
    //-----------------------------------------------//
    getUserAge = function(nickname) {
        for( i = 0; i < $scope.users.length; i++ ) {
            if( nickname == $scope.users[i].nickname )
                return $scope.users[i].age;
        }
        room = showxlGlobal.getRoom( $scope.roomname );
        if( room && nickname == room.nickname )
            return room.age;
        room = showxlGlobal.getOwnerRoom( $scope.roomname );
        if( room && nickname == room.nickname )
            return room.age;
        return '';
    }
    getUserPhoto = function(nickname) {
        for( i = 0; i < $scope.users.length; i++ ) {
            if( nickname == $scope.users[i].nickname )
                return $scope.users[i].photo;
        }
        room = showxlGlobal.getRoom( $scope.roomname );
        if( room && nickname == room.nickname )
            return room.photo;
        return '';
    }
    //-----------------------------------------------//
    $scope.CallFromCreator = function(message) {
        idx = $scope.getPeers();
        // full 
        if( idx >= 6 )
            return;
        // already exist
        var peer = $scope.peers[message.user];
        if( peer != undefined ) {
            return;
        }
        // get position
        var connector;
        $scope.localStream = $scope.capture.getStream();
        var remoteVideo = null;
        for( i = 1; i < 6; i++ ) {
            if( $scope.videos[i].show == -1 ) {
                remoteVideo = $scope.videos[i].view;
                $scope.videos[i].owner = 0;
                $scope.videos[i].show = 1;
                $scope.videos[i].nickname = message.user;
                $scope.videos[i].photo = getUserPhoto(message.user);

                $scope.userviews[i].view = null;
                
                break;
            }
        }
        if( !remoteVideo )
            return;
        connector = new Connector($scope.localStream,remoteVideo);
        connector.socket = showxlGlobal.getSocket();
        connector.me_id = $scope.owner.nickname;
        connector.other_id = message.user;
        connector.room_id = $scope.roomname;
        connector.type = 1; // receive only
        connector.doCall();

        $scope.peers[message.user] = connector;

        $scope.UpdateVideos();
    }

    $scope.CallFromPeer = function(message) {
        idx = $scope.getPeers();
        // full 
        if( idx >= 6 )
            return;
        // already exist
        var peer = $scope.peers[message.user];
        if( peer != undefined ) {
            return;
        }
        $scope.localStream = $scope.capture.getStream();
        var remoteVideo = null;
        // if creator
        if( message.user == $scope.roomname ) {
            $scope.isShowLive = 1;
            remoteVideo = $scope.videos[0].view;
            $scope.userviews[0].view = null;
        } 
        else {
            // get position
            if( $scope.isShowLive == 0 )
                idx++; 
            if( $scope.ownerIndex != -1 )
                idx++;
            if( idx >= 6 )
                return;
            remoteVideo = $scope.videos[idx].view;
            $scope.videos[idx].owner = 0;
            $scope.videos[idx].show = 1;
            $scope.videos[idx].nickname = message.user;
            $scope.videos[idx].photo = getUserPhoto(message.user);
            $scope.userviews[idx].view = null;
        }

        if( $scope.ownerIndex == -1 && idx < 5 ) {
            idx++;
            $scope.videos[idx].owner = 1;
            $scope.videos[idx].show = 0;
            $scope.videos[idx].nickname = $scope.owner.nickname;
            $scope.videos[idx].photo = $scope.owner.photo;
            $scope.userviews[idx].view = null;
        }

        var connector;
        connector = new Connector($scope.localStream,remoteVideo);
        connector.socket = showxlGlobal.getSocket();
        connector.me_id = $scope.owner.nickname;
        connector.other_id = message.user;
        connector.room_id = $scope.roomname;
        connector.type = 1; // receive only
        connector.doCall();

        $scope.peers[message.user] = connector;

        $scope.UpdateVideos();
    }
    
    //-----------------------------------------------//

    $(window).resize(function() {
        $scope.loadPage();
    });

    $scope.loadPage = function() {
        if( tabIndex == -1 )
            return ;
        
        //-- Initialization
        var parentWidth = $(window).width();
        var parentHeight = $(window).height();

        $('#open-room-wrapper-'+$scope.GlobalIndex).height(parentHeight - 190);
        $('#col-livecams-wrap-'+$scope.GlobalIndex).height(parentHeight - 190);
        $('#localvideo-frame-large-'+$scope.GlobalIndex).height(parentHeight - 190);
        $('#col-chatmsgs-wrap-'+$scope.GlobalIndex).height(parentHeight - 190);

        var bigCanvasWidth = parentWidth*0.45;///100*45;
        $('#localvideo-frame-large-'+$scope.GlobalIndex).width(bigCanvasWidth);
        $('#col-chatmsgs-wrap-'+$scope.GlobalIndex).width(parentWidth - 120 - bigCanvasWidth - 40);

        var videoWidth = $('#localvideo-frame-large-'+$scope.GlobalIndex+' > img').width();
        var videoHeight = $('#localvideo-frame-large-'+$scope.GlobalIndex+' > img').height();
        if(videoWidth == 0 || videoHeight == 0)
            rate = 0;
        else
            rate = videoWidth/videoHeight;
        
        bigCanvasWidth = $('#localvideo-frame-large-'+$scope.GlobalIndex+' > img').width();
        var gapTop;
        if(rate != 0) {
            var vH = bigCanvasWidth/rate;
            gapTop = (vH < parentHeight - 190) ? (parentHeight - 190 - vH)/2 : 0;
        } else {
            gapTop = 0;
        }
        $('#localvideo-frame-large-'+$scope.GlobalIndex+' > img').css("margin-top", gapTop);

    }


    //--------------------------------------------------------------//
    //--------------------------------------------------------------//
    $scope.onClickPubChatTab = function () {
        $scope.active[0].active = 'display:block';
        $scope.active[1].active = 'display:none';
    }
    $scope.onClickJoinedUserTab = function () {
        $scope.active[0].active = 'display:none';
        $scope.active[1].active = 'display:block';
    }

    $scope.onClickPrvMsgModalTab = function () {
        var modalInstance = $modal.open({
            templateUrl: "showxl_chatroom_privatemsg.html",
            controller: "showxl_chatroom_privatemsg",
            backdrop: false
        });
        // continuous modal trigger
        modalInstance.result.then(function(result) {
            var chat = {nickname:result.from,photo:result.photo};
            var modalInstance2 = $modal.open({
                templateUrl: "showxl_chatroom_privatechat.html",
                controller: "showxl_chatroom_privatechat",
                backdrop: false,
                resolve: { modalparams: function() { return { data: chat }; } }
            });
            modalInstance2.result.then(function(result) {
                $scope.onClickPrvMsgModalTab();
            }, function(result) {});
        }, function(result) { });
    }

    //------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------//
    //------------------------------------------------------------------------------//
    // Capture WebCam & Mic
    //------------------------------------------------------------------------------//
    $scope.startCapture = function() {
        if( !$scope.capture )
            return false;
        $scope.capture.stop();
        $scope.capture.start();
    	setTimeout(function() {
            // notify broadcast status to all user
            var message = { msg:'my_status',room:$scope.roomname,user:$scope.owner.nickname,broadcast:true };
            showxlGlobal.ioNotify_Room(message);
        },1000);
        return true;
    }
    $scope.stopCapture = function() {
        if( !$scope.capture )
            return;
        $scope.capture.stop();

        // notify broadcast status to all user
        var message = { msg:'my_status',room:$scope.roomname,user:$scope.owner.nickname,broadcast:false };
        showxlGlobal.ioNotify_Room(message);
    }
    
});

//------------------------------------------------------------------------------//
//-------------------------- Toastr customization ------------------------------//
showxlApp.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
        autoDismiss: false,
        containerId: 'toast-container',
        maxOpened: 0,
        newestOnTop: true,
        positionClass: 'toast-bottom-full-width',
        preventDuplicates: false,
        preventOpenDuplicates: false,
        target: 'body'
    });
});

showxlApp.config(function(toastrConfig) {
    angular.extend(toastrConfig, {
        allowHtml: false,
        closeButton: true,
        closeHtml: '<button>&times;</button>',
        extendedTimeOut: 1000,
        iconClasses: {
            error: 'toast-error',
            info: 'toast-info',
            success: 'toast-success',
            warning: 'toast-warning'
        },
        messageClass: 'toast-message',
        onHidden: null,
        onShown: null,
        onTap: null,
        progressBar: true,
        tapToDismiss: true,
        templates: {
            toast: 'directives/toast/toast.html',
            progressbar: 'directives/progressbar/progressbar.html'
        },
        timeOut: 2000,
        titleClass: 'toast-title',
        toastClass: 'toast'
    });
});
