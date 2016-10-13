showxlApp.controller('showxl_chatroom_profile', function($scope, $http, $modal,$routeParams,showxlGlobal) {
    $scope.owner = showxlGlobal.getOwner();
    $scope.photos = [];
    $scope.videos = [];
    var timer;
    //-----------------------------------------------//
    $scope.onload = function() {
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
        var url = '/api/user/detail/'+$scope.owner.nickname+'/0';
        $http.get(url).success(function(data) {
            // save all room to global space
            $scope.photos = data;
            $timeout(function(){ $scope.$apply(function() {}); });            
            // $scope.$apply(function() {});
        }).error(function(data, status) {
        });
    }
    function GetAllVideos() {
        var url = '/api/user/detail/video/'+$scope.owner.nickname+'/1';
        $http.get(url).success(function(data) {
            // save all room to global space
            $scope.videos = data;
            $timeout(function(){ $scope.$apply(function() {}); });            
            // $scope.$apply(function() {});
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
            for( i = 0; i < $scope.photos.length; i++ ) {
                if( $scope.videos[i]._id == id ) {
                    $scope.videos.splice(i, 1);
                    break;
                }
            }
            $timeout(function(){ $scope.$apply(function() {}); });            
            // $scope.$apply(function() {});
        }).error(function(data) {
        });
    }
    
    function AddPhoto(url) {
        var photo = 
        {
            "userid":       $scope.owner.nickname,
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
                // $scope.$apply(function() {});
            }
        }).error(function(data, status, headers, config) {
        });
    }
    function AddVideo(url) {
        var video = 
        {
            "userid":       $scope.owner.nickname,
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
        $('#upload-photo').click();
    }
    var photoData;
    $('#upload-photo').on('change', function() {
        var files = $(this).get(0).files;
        if (files.length > 0) {
            file = files[0];
            readImageFile(file);
        }
    })
    function readImageFile(file) {
        photoData = new FormData();
        photoData.append('uploads[]', file, file.name);
        $('#upload_photo_progress').show();
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: photoData,
            processData: false,
            contentType: false,
            success: function(data){
                if( data == '' )
                    return;

                $('#upload_photo_progress.progress-bar').text('0%');
                $('#upload_photo_progress .progress-bar').width('0%');
                $('#upload_photo_progress').hide();

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
                        $('#upload_photo_progress .progress-bar').text(percentComplete + '%');
                        $('#upload_photo_progress .progress-bar').width(percentComplete + '%');

                        // once the upload reaches 100%, set the progress bar text to done
                        if (percentComplete === 100) {
                            $('.progress-bar').html('Done');
                            $('#upload_photo_progress').hide();
                        }

                    }
                }, false);

                return xhr;
            }
        });
           
    }
    
    $scope.UploadVideo = function() {
        $('#upload-video').click();
    }
    var videoData;
    $('#upload-video').on('change', function() {
        var files = $(this).get(0).files;
        if (files.length > 0) {
            file = files[0];
            readVideoFile(file);
        }
    })
    function readVideoFile(file) {

        videoData = new FormData();
        videoData.append('uploads[]', file, file.name);

        $('#upload_video_progress').show();
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: videoData,
            processData: false,
            contentType: false,
            success: function(data){
                if( data == '' )
                    return;

                $('#upload_video_progress .progress-bar').text('0%');
                $('#upload_video_progress .progress-bar').width('0%');
                $('#upload_video_progress').hide();

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
                        $('#upload_video_progress .progress-bar').text(percentComplete + '%');
                        $('#upload_video_progress .progress-bar').width(percentComplete + '%');

                        // once the upload reaches 100%, set the progress bar text to done
                        if (percentComplete === 100) {
                            $('#upload_video_progress .progress-bar').html('Done');
                            $('#upload_video_progress').hide();
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
    //-----------------------------------------------//
    $scope.$on('event_modify_users', function(event, message) {
    });
    //-----------------------------------------------//
    //-----------------------------------------------//
    //-----------------------------------------------//
    $(window).resize(function() {
        LoadPage();
    });

    function LoadPage() {
    };
});
