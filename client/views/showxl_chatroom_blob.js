showxlApp.controller('showxl_chatroom_blob', function($scope, $http,$timeout, $modal,$routeParams,showxlGlobal) {
    $scope.owner = showxlGlobal.getOwner();
    $scope.room = {};
    var roomname = '';
    var tabs = showxlGlobal.getTabs()
    var tabIndex = 0;
    $scope.photos = [];
    $scope.videos = [];
    $scope.creator = false;
    var timer;
    //-----------------------------------------------//
    $scope.onload = function(idx) {
        tabIndex = idx;
        roomname = tabs[tabIndex].room;
        $scope.room = showxlGlobal.getRoom(roomname);
        if( $scope.room == null )
            $scope.room = showxlGlobal.getOwnerRoom();
        $scope.creator = tabs[tabIndex].owner;
        GetAllPhotos();
        GetAllVideos();
    	timer = setTimeout(InitializePage, 100);
    }
    InitializePage = function(){
   　　　clearTimeout(timer);
        LoadPage();
    }
    //-----------------------------------------------//
    function GetAllPhotos() {
        var url = '/api/user/detail/'+$scope.room.nickname+'/0';
        $http.get(url).success(function(data) {
            // save all room to global space
            $scope.photos = data;
            $timeout(function(){ $scope.$apply(function() {}); });            
//            $scope.$apply(function() {});
        }).error(function(data, status) {
        });
    }
    function GetAllVideos() {
        var url = '/api/user/detail/video/'+$scope.room.nickname+'/1';
        $http.get(url).success(function(data) {
            // save all room to global space
            $scope.videos = data;
            $timeout(function(){ $scope.$apply(function() {}); });            
            // $scope.$apply(function() {});
        }).error(function(data, status) {
        });
    }
    function GetText() {
        $http.get('api/room/'+$scope.room._id).success(function(data) {
            $scope.room.roomtitle = data[0].roomtitle;
            $timeout(function(){ $scope.$apply(function() {}); });            
            
        }).error(function(data, status) {
        });
    }
    $scope.DeletePhoto = function(id) {
        //-------------------------------------------//
        $http({
            method : 'DELETE',
            url : '/api/user/detail/remove/'+id,
        }).success(function(data) {
            for( i = 0; i < $scope.photos.length; i++ ) {
                if( $scope.photos[i]._id == id ) {
                    $scope.photos.splice(i, 1);
                    break;
                }
            }
            $timeout(function(){ $scope.$apply(function() {}); });            
            var message = { msg:'update_blob_photo_room',room:$scope.owner.nickname,user:$scope.owner.nickname };
            showxlGlobal.ioNotify_All(message);
            // $scope.$apply(function() {});
        }).error(function(data) {
        });
       
    }
    $scope.DeleteVideo = function(id) {
        //-------------------------------------------//
        $http({
            method : 'DELETE',
            url : '/api/user/detail/remove/'+id,
        }).success(function(data) {
            for( i = 0; i < $scope.videos.length; i++ ) {
                if( $scope.videos[i]._id == id ) {
                    $scope.videos.splice(i, 1);
                    break;
                }
            }
            $timeout(function(){ $scope.$apply(function() {}); });            
            var message = { msg:'update_blob_animation_room',room:$scope.owner.nickname,user:$scope.owner.nickname };
            showxlGlobal.ioNotify_All(message);
            // $scope.$apply(function() {});
        }).error(function(data) {
        });
    }
    
    function AddPhoto(url) {
        var photo = 
        {
            "userid":       $scope.room.nickname,
            "type":         0,
            "url":          url
        };
        // sign up owner's room         
        var params = JSON.stringify(photo);

        $http({
            method : 'POST',
            url : '/api/user/detail/add/',
            data: params
        }).success(function(data, status, headers, config) {
            //success
            if( data.result == 1 ) {
                photo._id = data.id;
                $scope.photos.push(photo);
                $timeout(function(){ $scope.$apply(function() {}); });            
                var message = { msg:'update_blob_photo_room',room:$scope.owner.nickname,user:$scope.owner.nickname };
                showxlGlobal.ioNotify_All(message);
                // $scope.$apply(function() {});
            }
        }).error(function(data, status, headers, config) {
        });
    }
    function AddVideo(url) {
        var video = 
        {
            "userid":       $scope.room.nickname,
            "type":         1,
            "url":          url
        };
        // sign up owner's room         
        var params = JSON.stringify(video);

        $http({
            method : 'POST',
            url : '/api/user/detail/add/',
            data: params
        }).success(function(data, status, headers, config) {
            //success
            if( data.result == 1 ) {
                video._id = data.id;
                $scope.videos.push(video);
                $timeout(function(){ $scope.$apply(function() {}); });            
                var message = { msg:'update_blob_animation_room',room:$scope.owner.nickname,user:$scope.owner.nickname };
                showxlGlobal.ioNotify_All(message);
                // $scope.$apply(function() {});
            }

        }).error(function(data, status, headers, config) {
        });
    }
    //-----------------------------------------------//
    $scope.getPhoto = function(url) {
        if( url != "" )
            return "uploads/" + url;
        else  
            return "images/avatar.jpg";
    }
    $scope.getAnimation = function(url) {
        if( url != "" )
            return "uploads/" + url;
        else  
            return "";
    }
    $scope.UploadPhoto = function() {
        $('#upload-photo-'+tabIndex).click();
    }

    //-- file input handler
    $(document).on('change', ':file', function() {
        var files;
        if( this.id == "upload-photo-"+tabIndex ) {
            files = $(this).get(0).files;
            if (files.length > 0) {
                file = files[0];
                readImageFile(file);
            }
        } else if( this.id == "upload-video-"+tabIndex ) {
            files = $(this).get(0).files;
            if (files.length > 0) {
                file = files[0];
                readVideoFile(file);
            }
        } else {
            return;
        }
    })
    //---------------------//
    
    var photoData;
    function readImageFile(file) {
        photoData = new FormData();
        photoData.append('uploads[]', file, file.name);
        $('#upload_photo_progress_'+tabIndex).show();
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: photoData,
            processData: false,
            contentType: false,
            success: function(data){
                if( data == '' )
                    return;

                $('#upload_photo_progress_'+tabIndex+' .progress-bar').text('0%');
                $('#upload_photo_progress_'+tabIndex+' .progress-bar').width('0%');
                $('#upload_photo_progress_'+tabIndex).hide();

                console.log('upload successful!\n' + data);

                AddPhoto(data);
            },
            xhr: function() {
                // create an XMLHttpRequest
                var xhr = new XMLHttpRequest();
                // listen to the 'progress' event
                xhr.upload.addEventListener('progress', function(evt) {
                    if (evt.lengthComputable) {
                        // calculate the percentage of upload completed
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);

                        // update the Bootstrap progress bar with the new percentage
                        $('#upload_photo_progress_'+tabIndex+' .progress-bar').text(percentComplete + '%');
                        $('#upload_photo_progress_'+tabIndex+' .progress-bar').width(percentComplete + '%');

                        // once the upload reaches 100%, set the progress bar text to done
                        if (percentComplete === 100) {
                            $('.progress-bar').html('Done');
                            $('#upload_photo_progress_'+tabIndex).hide();
                        }

                    }
                }, false);

                return xhr;
            }
        });
           
    }
    
    $scope.UploadVideo = function() {
        $('#upload-video-'+tabIndex).click();
    }
    var videoData;
    function readVideoFile(file) {

        videoData = new FormData();
        videoData.append('uploads[]', file, file.name);

        $('#upload_video_progress_'+tabIndex).show();
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: videoData,
            processData: false,
            contentType: false,
            success: function(data){

                if( data == '' )
                    return;
                $('#upload_video_progress_'+tabIndex+' .progress-bar').text('0%');
                $('#upload_video_progress_'+tabIndex+' .progress-bar').width('0%');
                $('#upload_video_progress_'+tabIndex).hide();

                console.log('upload successful!\n' + data);

                AddVideo(data);
            },
            xhr: function() {
                // create an XMLHttpRequest
                var xhr = new XMLHttpRequest();
                // listen to the 'progress' event
                xhr.upload.addEventListener('progress', function(evt) {
                    if (evt.lengthComputable) {
                        // calculate the percentage of upload completed
                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100);

                        // update the Bootstrap progress bar with the new percentage
                        $('#upload_video_progress_'+tabIndex+' .progress-bar').text(percentComplete + '%');
                        $('#upload_video_progress_'+tabIndex+' .progress-bar').width(percentComplete + '%');

                        // once the upload reaches 100%, set the progress bar text to done
                        if (percentComplete === 100) {
                            $('#upload_video_progress_'+tabIndex+' .progress-bar').html('Done');
                            $('#upload_video_progress_'+tabIndex).hide();
                        }

                    }
                }, false);

                return xhr;
            }
        });
        
    }
    //-----------------------------------------------//
    //-----------------------------------------------//
    //-----------------------------------------------//
    $scope.$on('notify_room', function(event, message) {
        if( message.msg == '' ) {
        }
        else if( message.msg == 'text_chat' ) {
        }
        else if( message.msg == 'enter_room' ) {
        }
        else if( message.msg == 'exit_room' ) {
        }
    });
    $scope.$on('notify_all', function (event,message) {
        if( message.msg == 'create_room' ) {
        }
        else if( message.msg == 'remove_room' ) {
        }
        else if( message.msg == 'update_blob_animation_room' ) {
            if( roomname == message.room ) {
                GetAllVideos();
            }
        }
        else if( message.msg == 'update_blob_photo_room' ) {
            if( roomname == message.room ) {
                GetAllPhotos();
            }
        }
        else if( message.msg == 'update_title_room' ) {
            if( roomname == message.room ) {
                GetText();
            }
        }
        else if( message.msg == 'golive' ) {
        }
        else if( message.msg == 'stoplive' ) {
        }
    });
    //-----------------------------------------------//
    $scope.$on('event_modify_users', function(event, message) {
    });
    //------------------------------------------------------------//
    $scope.$on('event_modify_room', function(event, message) {
        $scope.room = showxlGlobal.getRoom(roomname);
        if( $scope.room == null )
            $scope.room = showxlGlobal.getOwnerRoom();
        $timeout(function(){ $scope.$apply(function() {}); });            
    });        
    
    
    //-----------------------------------------------//
    //-----------------------------------------------//
    //-----------------------------------------------//
    $(window).resize(function() {
        LoadPage();
    });

    function LoadPage() {
        //--
    };

    $scope.getdistance = function() {
        var dis = showxlGlobal.calculateDistance($scope.owner.latitude,$scope.owner.longitude,$scope.room.latitude,$scope.room.longitude);
        if(dis == "NaN")
            dis = "0"; 
        return dis;
    }

    //-----------------------------------------------//
    $scope.getRoomCountryFlag = function() {
        var country = $scope.room.country;
        if( country == undefined )
            return '';
        
        country = country.toLowerCase();
        return country;
    }
    //-----------------------------------------------//
    $scope.editHostComment = function() {
        var ex_comment = $('#hostComment').html();
        $('#hostComment').hide();
        $('#editCommentLink').hide();
        $('#editDescriptionForm').show();
        $('#editDescriptionForm textarea').val(ex_comment);
        $('#editDescriptionForm textarea').focus();
        $('#editDescriptionForm textarea').select();
    }
    $scope.updateHostComment = function() {
        var comment = $('#editDescriptionForm textarea').val();
        if(comment.trim() == "") {
            $('#editDescriptionForm textarea').val('');
            $('#editDescriptionForm textarea').focus();
            return;
        }

        $scope.room.roomtitle = comment;
        UpdateTitle(comment);

        $('#editDescriptionForm').hide();
        $('#hostComment').show();
        $('#editCommentLink').show();
    }

    UpdateTitle = function(title) {
        var room = 
        {
            nickname:   $scope.owner.nickname,
            roomtitle:  title,
        };
        // sign up owner's room         
        var params = JSON.stringify(room);
        $http({
            method : 'POST',
            url : '/api/room/update/title',
            data: params
        }).success(function(data, status, headers, config) {
            //success
            if( data.result == 1 ) {
                var message = { msg:'update_title_room',room:$scope.owner.nickname,user:$scope.owner.nickname };
                showxlGlobal.ioNotify_All(message);
                ;
            }
            else {
                return;
            }
        }).error(function(data, status, headers, config) {
        });
    }

    //-- show/hide video controls for [MyVideos]
    // $scope.showControls = function($event) {
    //     var myVideo = angular.element($event.currentTarget).children("video")[0];
    //     myVideo.controls = true;
    //     return;
    // }
    // $scope.hideControls = function($event) {
    //     var myVideo = angular.element($event.currentTarget).children("video")[0];
    //     myVideo.controls = false;
    //     return;
    // }
    $scope.videoFullscreen = function($event) {
        var myVideo = angular.element($event.currentTarget).parent().children("video")[0];
        myVideo.webkitEnterFullScreen();
        myVideo.play();
    }
    $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', function() {
        var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        if(state == false) {
            //alert("Full Screen Closed");
            var videos = $('#creator_profile_'+tabIndex+' .host-video-wrap video');
            var vnum = videos.length;
            for(var i = 0; i < vnum; i++) {
                videos[i].pause();
            }
        }
    });

});
