//showxlApp.controller('showxl_chatroom_create', function($scope,$http,$modalInstance,showxlGlobal) {
showxlApp.controller('showxl_chatroom_create', ['$scope','$http','$modalInstance','$timeout','showxlGlobal','cfpLoadingBar', function($scope,$http,$modalInstance,$timeout,showxlGlobal,cfpLoadingBar) {

    //-------------------------------------------------------------//
    $timeout(function () {
        $(".modal-dialog").draggable({ handle:".modal-header" });
    }, 0);
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    // recording video from webcam
    var mediaRecorder;
    var recordedBlobs;
    var sourceBuffer;
    var bRecording = false;
    var timer_record = null;    
    function handleDataAvailable(event) {
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    }

    function handleStop(event) {
        console.log('Recorder stopped: ', event);
    }
    
    function startRecording() {
        recordedBlobs = [];
        var options = {mimeType: 'video/webm;codecs=vp9'};
        // check codec
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log(options.mimeType + ' is not Supported');
            options = {mimeType: 'video/webm;codecs=vp8'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.log(options.mimeType + ' is not Supported');
                options = {mimeType: 'video/webm'};
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.log(options.mimeType + ' is not Supported');
                    options = {mimeType: ''};
                }
            }
        }
        // create recorder 
        try {
            mediaRecorder = new MediaRecorder(window.stream, options);
        } catch (e) {
            console.error('Exception while creating MediaRecorder: ' + e);
            alert('Exception while creating MediaRecorder: '
                + e + '. mimeType: ' + options.mimeType);
            return;
        }
        // set ui control
        console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
        // set media recorder
        mediaRecorder.onstop = handleStop;
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start(10); // collect 10ms of data
        console.log('MediaRecorder started', mediaRecorder);
    }

    function stopRecording() {
        mediaRecorder.stop();
        console.log('Recorded Blobs: ', recordedBlobs);
    }

    function UploadVideoFile() {
        if( recordedBlobs == undefined || recordedBlobs.length == 0 ) {
            $scope.Register("");
            return;
        } 
        var blob = new Blob(recordedBlobs, {type: 'video/webm'});
        videoData = new FormData();
        videoData.append("recording",blob);
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: videoData,
            processData: false,
            contentType: false,
            success: function(data){
                if( data == '' )
                    return;
                console.log('upload successful!\n' + data);
                $scope.Register(data);

            },
            xhr: function() {
                // create an XMLHttpRequest
                var xhr = new XMLHttpRequest();
                // listen to the 'progress' event
                // xhr.upload.addEventListener('progress', function(evt) {
                //     if (evt.lengthComputable) {
                //         // calculate the percentage of upload completed
                //         var percentComplete = evt.loaded / evt.total;
                //         percentComplete = parseInt(percentComplete * 100);

                //         // update the Bootstrap progress bar with the new percentage
                //         $('#upload_video_progress_'+tabIndex+' .progress-bar').text(percentComplete + '%');
                //         $('#upload_video_progress_'+tabIndex+' .progress-bar').width(percentComplete + '%');

                //         // once the upload reaches 100%, set the progress bar text to done
                //         if (percentComplete === 100) {
                //             $('#upload_video_progress_'+tabIndex+' .progress-bar').html('Done');
                //             $('#upload_video_progress_'+tabIndex).hide();
                //         }

                //     }
                // }, false);

                return xhr;
            }
        });
        
    }
    
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    var timer;// = setTimeout(InitializePage, 100);
    var owner;// = showxlGlobal.getOwner();
    InitializePage = function(){
   　　　clearTimeout(timer);
        LoadPage();
    }
    
    $scope.onload = function() {
        timer = setTimeout(InitializePage, 100);
        owner = showxlGlobal.getOwner();
    }
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    $scope.CreateOwnerRoom = function() {
        if( bRecording == true )
            stopRecording();
        if( !UploadVideoFile() ) {
            // if (window.stream) {
            //     window.stream.getTracks().forEach(function(track) {
            //         track.stop();
            //     });
            // }
            //$modalInstance.dismiss();
        }

    }
    $scope.Register = function(url) {
        var room = 
        {
            nickname:   owner.nickname,
            animation:  url,
            bLive:      1
        };
        // sign up owner's room         
        var params = JSON.stringify(room);
        $http({
            method : 'POST',
            url : '/api/room/update/animation',
            data: params
        }).success(function(data, status, headers, config) {
            //success
            if( data.result == 1 ) {
                owner.bLive = true;
                var ownerroom = showxlGlobal.getOwnerRoom();
                ownerroom.animation = url;
                showxlGlobal.setOwner(owner);
            }
            else {
                console.log("Can't create your room.");
                if (window.stream) {
                    window.stream.getTracks().forEach(function(track) {
                        track.stop();
                    });
                }
                if( timer_record )
                    clearTimeout(timer_record);
                $modalInstance.dismiss();
                return;
            }

            if( timer_record )
                clearTimeout(timer_record);
            if (window.stream) {
                window.stream.getTracks().forEach(function(track) {
                    track.stop();
                });
            }
            $modalInstance.close(url);
        }).error(function(data, status, headers, config) {
            //fail
            if( timer_record )
                clearTimeout(timer_record);
            if (window.stream) {
                window.stream.getTracks().forEach(function(track) {
                    track.stop();
                });
            }
            $modalInstance.dismiss();
        });
    }

    $scope.onCancel = function()  {
        if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        $modalInstance.dismiss();
    }
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //------------------------------------------------------------//
    //-- responsive size control
    $(window).resize(function() {
//        LoadPage();
    });
    
    var localVideo;
    var videoSelect;
    var audioInputSelect;
    var selectors;

    //-------------------------------------------------------------//
    function LoadPage() {
        localVideo = document.getElementById('localVideo');
        audioInputSelect = document.getElementById('audioSource');
        videoSelect = document.getElementById('videoSource');
        selectors = [audioInputSelect, videoSelect];
        enumerateDevice();
    };

    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    function enumerateDevice() {
        navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
    }
    //-------------------------------------------------------------//
    // Capture WebCam & Mic
    function startCapture() {
        if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        var audioSource = audioInputSelect.value;
        var videoSource = videoSelect.value;
        // var constraints = { video: true, audio: false };
        var constraints = {
            audio: false,
            video: {deviceId: videoSource ? {exact: videoSource} : undefined,
                    width: {exact: 320}, height: {exact: 240}}
        };

        // Connect Media
        getUserMedia(constraints, gotStream, handleError);
    }
    //-------------------------------------------------------------//
    function gotStream(stream) {
        $('#photoCanvas > img').css("opacity", "0");
        $('#photoCanvas > video').css("opacity", "1");

        window.stream = stream; // make stream available to console
        localStream = stream;
        attachMediaStream(localVideo, stream);
        bRecording = true;
        startRecording();
        timer_record = setTimeout( RecordingTimer, 1000*60);
    }
    function RecordingTimer() {
        clearTimeout(timer_record);
        timer_record = null;
    }
    function handleError(error) {
        console.log('navigator.getUserMedia error: ', error);
    }
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    function gotDevices(deviceInfos) {
        // Handles being called several times to update labels. Preserve values.
        var values = selectors.map(function(select) {
            return select.value;
        });
        selectors.forEach(function(select) {1
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
        });
        for (var i = 0; i !== deviceInfos.length; ++i) {
            var deviceInfo = deviceInfos[i];
            var option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'audioinput') {
                option.text = deviceInfo.label ||
                    'microphone ' + (audioInputSelect.length + 1);
                audioInputSelect.appendChild(option);
            } else if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
                videoSelect.appendChild(option);
            } else {
                console.log('Some other kind of source/device: ', deviceInfo);
            }
        }
        selectors.forEach(function(select, selectorIndex) {
            if (Array.prototype.slice.call(select.childNodes).some(function(n) {
                return n.value === values[selectorIndex];
            })) {
                select.value = values[selectorIndex];
            }
        });

        startCapture();
    }

}]);

