showxlApp.controller('showxl_chatroom_send_photo', ['$scope','$http','$modalInstance','$timeout','showxlGlobal', function($scope,$http,$modalInstance,$timeout,showxlGlobal) {
    $scope.owner = showxlGlobal.getOwner();
    var capture = null;
    var videoSelect;
    var selectors;
    var localVideo;
    var canvas;
    var photoData = null;

    //-----------------------------------------------//
    $timeout(function () {
        $(".modal-dialog").draggable({ handle:".modal-header" });
    }, 0);
    //-----------------------------------------------//
    $scope.onload = function() {
    	setTimeout(function() {
            $('#prvmsgPhotoModal').parent('.modal-content').css("border", "0");

            videoSelect = document.getElementById('videoSource');
        
            localVideo = document.getElementById('localVideo-photo');
            canvas = document.getElementById('localVideo-canvas');
            canvas.width = 320;
            canvas.height = 240;

            selectors = [videoSelect];
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
    $scope.onSend = function() {
        if( !photoData )
            return;
        capture.stop();
        uploadPhoto();    
    }
    //-------------------------------------------------------------//
    $scope.shootPrvmsgPhoto = function() {
        if( photoData ) {
            delete photoData;
            photoData = null;
            $('#photoCanvas > video').css("opacity", "1");
            $('#photoCanvas > img').css("opacity", "0");
            capture.start();
            return;
        }
        canvas.getContext('2d').drawImage(localVideo, 0, 0, canvas.width, canvas.height);
//        var img_png_src = canvas.toDataURL();
        var img_jpeg_src = canvas.toDataURL("image/jpeg");
        $('#myPhoto').attr('src', img_jpeg_src);

        capture.stop();

        $('#photoCanvas > video').css("opacity", "0");
        $('#photoCanvas > img').css("opacity", "1");

        var blob = dataURLtoBlob(img_jpeg_src);
        photoData = new FormData();
        photoData.append("uploads[]", blob, "photo.jpeg");
    }

    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
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
                // option.text = deviceInfo.label ||
                //     'microphone ' + (audioInputSelect.length + 1);
                // audioInputSelect.appendChild(option);
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
    uploadPhoto = function() {
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: photoData,
            processData: false,
            contentType: false,
            success: function(data){
                if( data == '' )
                    return;
                console.log('upload successful!\n' + data);
                $modalInstance.close('uploads/'+data);
            },
            xhr: function() {
                var xhr = new XMLHttpRequest();

                return xhr;
            }
        });
    }
    
}]);
