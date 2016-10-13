showxlApp.controller('showxl_chatroom_send_video', ['$scope','$http','$modalInstance','$timeout','showxlGlobal', function($scope,$http,$modalInstance,$timeout,showxlGlobal) {
    $scope.owner = showxlGlobal.getOwner();
    var capture = null;
    var videoSelect;
    var selectors;
    var localVideo;

    //-----------------------------------------------//
    $timeout(function () {
        $(".modal-dialog").draggable({ handle:".modal-header" });
    }, 0);
    //-----------------------------------------------//
    $scope.onload = function() {
    	setTimeout(function() {
            $('#prvmsgVideoModal').parent('.modal-content').css("border", "0");

            videoSelect = document.getElementById('videoSource');
            audioInputSelect = document.getElementById('audioSource');
            selectors = [audioInputSelect, videoSelect];
        
            localVideo = document.getElementById('localVideo-video');
            enumerateDevice();
            capture = new Media(localVideo);
            capture.start();
        },100);
    }
    //-------------------------------------------------------------//
    $scope.onCancel = function() {
        capture.stop();
        $modalInstance.dismiss();
    }
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    // recording video from webcam
    var mediaRecorder = null;
    var recordedBlobs;
    var bRecord = false;
    //-------------------------------------------------------------//
    $scope.onSend = function() {
        if( !bRecord )
            return;
        capture.stop();
        UploadVideo();
    }
    //-------------------------------------------------------------//
    $scope.recPrvmsgVideo = function($event) {
        if( mediaRecorder ) {
            angular.element($event.currentTarget).children(".fa-circle").hide();
            angular.element($event.currentTarget).children(".fa-video-camera").show();

            bRecord = true;
            stopRecording();
            delete mediaRecorder;
            mediaRecorder = null;
            return;
        }
        angular.element($event.currentTarget).children(".fa-video-camera").hide();
        angular.element($event.currentTarget).children(".fa-circle").show();
        
        startRecording();
    }
    //-------------------------------------------------------------//
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
            var stream = capture.getStream();
            mediaRecorder = new MediaRecorder(stream, options);
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

    
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    function enumerateDevice() {
        navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
    }
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
    //-------------------------------------------------------------//
    function handleError(error) {
        console.log('navigator.getUserMedia error: ', error);
    }
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    //-------------------------------------------------------------//
    function UploadVideo() {
        if( recordedBlobs.length == 0 ) {
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
                $modalInstance.close('uploads/'+data);
            },
            xhr: function() {
                // create an XMLHttpRequest
                var xhr = new XMLHttpRequest();
                return xhr;
            }
        });
        
    }
    
}]);
