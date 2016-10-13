//-- define global variables for locale
var lat=0, lng=0;
var myCenter;
var map;
var myMapInfo = {};
//-- Check if the browser has support for the Geolocation API
if (!navigator.geolocation) {
    alert('Sorry, the Geolocation API is not supported in your browser!');
} else {
    navigator.geolocation.getCurrentPosition(function(position) {
        //-- Get the coordinates of the current position
        lat = position.coords.latitude;
        lng  = position.coords.longitude;
        console.log('Your locale - lat:' + lat + ', lng:' + lng);
    });
}

showxlApp.controller('showxl_login', function($scope,$http,$routeParams,showxlGlobal,$timeout,cfpLoadingBar) {

    $scope.user = { 
        nickname:   '',
        introduce:  '',
        age:        20,
        photo:      'face.jpeg',
        latitude:   0,
        longitude:  0,
        incoming:   0
    };
    $scope.photofilename = "";
    //-------------------------------------------------//
    cfpLoadingBar.start();
    setTimeout(function() {
        cfpLoadingBar.complete();
    }, 1000);
    //-------------------------------------------------//
    //-------------------------------------------------//
    //-------------------------------------------------//
    $scope.showLoginView = function() {
        $('#loginStep1').hide();
        $('#loginStep2').show();
        $('#loginStep2 form input:first').focus();
    }
    //-------------------------------------------------//
    //-------------------------------------------------//
    //-------------------------------------------------//
    $scope.loginNext = function() {
        //-------------------------------------------------//
        if( $scope.user.nickname == "" ||
            $scope.user.introduce == "" || 
            $scope.user.photo == "" ) {
            return;
        }
        //-------------------------------------------------//
        // Check NickName
        $http.get('api/user/' + $scope.user.nickname).success(function(data) {
            if( data.result == 0 )  {
                alert('That username already exists.');
                return;
            }
            // next page
            $('#loginStep2').hide();
            $('#loginStep3').show();

            $scope.user.latitude = lat;
            $scope.user.longitude = lng;
            //-- refer to [location_gmap.js]
            myCenter = new google.maps.LatLng(lat, lng);
            initialize();
            //-- Google Map resize trigger
            google.maps.event.trigger(map, "resize");
            map.setCenter(myCenter);


        }).error(function(data, status) {
            return;
        });
    }
    //-------------------------------------------------//
    //-------------------------------------------------//
    //-------------------------------------------------//
    $scope.loginConfirm = function() {
        $('#loginStep3').hide();
        var country = '';
        var city = '';
        if( myMapInfo.country != undefined )
            country = myMapInfo.country.short_name;
        if( myMapInfo.city != undefined )
            city = myMapInfo.city.short_name;
        
        var params = JSON.stringify({
            "nickname":     $scope.user.nickname,
            "introduce":    $scope.user.introduce,
            "age":          $scope.user.age,
            "photo":        $scope.photofilename,
            "latitude":     $scope.user.latitude,
            "longitude":    $scope.user.longitude,
            "country":      country,
            "city":         city,
            "incoming":     $scope.user.incoming
        });
        var dis = showxlGlobal.calculateDistance(lat,lng,lat-100,lng+100);
        $http({
            method : 'POST',
            url : '/api/user/login/',
            data: params
        }).success(function(data, status, headers, config) {
            //success
            if( data.result == 1 ) {
                $scope.user._id = data.userid;
                $scope.user.photo = $scope.photofilename;
                $scope.user.animation = "";
                $scope.bLive = false;
                
                $scope.user.country = country;
                $scope.user.city = city;

                // save owner to global space
                showxlGlobal.setOwner($scope.user);

                window.location.href = '#main';
            }
            else if( data.result == 2 ) {
                $('#loginStep2').show();
            }
            else {
                $('#loginStep1').show();
            }

        }).error(function(data, status, headers, config) {
            //fail
            $('#loginStep1').show();
        });

    }
    //-------------------------------------------------//
    //-------------------------------------------------//
    //-------------------------------------------------//
    var photoData;

    var localVideo = document.querySelector('video');
    var videoSelect = document.querySelector('select#videoSource');
    // Get image
    var canvas = window.canvas = document.querySelector('canvas');
    canvas.width = 320;
    canvas.height = 240;
    var selectors = [videoSelect];

    //-------------------------------------------------//
    $scope.openCamera = function() {
        $('#photoCanvas > img').css("opacity", "0");
        $('#photoCanvas > video').css("opacity", "1");
        startCapture();
    }
    $('#photoTypeWrap > label.btn').on('click', function(event) {
        $('#photoCanvas > video').css("opacity", "0");
        $('#photoCanvas > img').css("opacity", "1");
    });
    //-------------------------------------------------//
    $scope.shotPhoto = function() {
        canvas.getContext('2d').drawImage(localVideo, 0, 0, canvas.width, canvas.height);
//        var img_png_src = canvas.toDataURL();
        var img_jpeg_src = canvas.toDataURL("image/jpeg");
        $('#myPhoto').attr('src', img_jpeg_src);

        if (window.stream) {
            window.stream.getTracks().forEach(function(track) {
                track.stop();
            });
        }

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
    videoSelect.onchange = startCapture;
    //-------------------------------------------------------------//
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
        var videoSource = videoSelect.value;
        var constraints = {
            video: {deviceId: videoSource ? {exact: videoSource} : undefined,
                    width: {exact: 320}, height: {exact: 240}}
        };

        var device_video = {deviceId: videoSource ? {exact: videoSource} : undefined};
        // Connect Media
        getUserMedia(constraints, gotStream, handleError);
    }
    //-------------------------------------------------------------//
    function gotStream(stream) {
        window.stream = stream; // make stream available to console
        localStream = stream;
        attachMediaStream(localVideo, stream);
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
            if (deviceInfo.kind === 'videoinput') {
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
    }
    // Get Devices
    enumerateDevice();


    //-------------------------------------------------//
    //-------------------------------------------------//
    //-------------------------------------------------//
    $('#upload-input').on('change', function() {
        var files = $(this).get(0).files;
        if (files.length > 0) {
            file = files[0];
            readImageFile(file);
        }
    })
    
    function readImageFile(file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#myPhoto').attr('src', e.target.result);
        }
        reader.readAsDataURL(file);
        
        photoData = new FormData();
        photoData.append('uploads[]', file, file.name);
    }

    //-------------------------------------------------//
    //-------------------------------------------------//
    //-------------------------------------------------//

    $scope.uploadPhoto = function() {
        $('#addPhotoModal .modal-body .progress').show();
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: photoData,
            processData: false,
            contentType: false,
            success: function(data){
                if( data == '' )
                    return;

                $('.progress-bar').text('0%');
                $('.progress-bar').width('0%');
                $('#addPhotoModal .modal-body .progress').hide();
                $('.modal-backdrop').remove();

                console.log('upload successful!\n' + data);

                $scope.photofilename = data;

                $scope.loginNext();

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
                        $('.progress-bar').text(percentComplete + '%');
                        $('.progress-bar').width(percentComplete + '%');

                        // once the upload reaches 100%, set the progress bar text to done
                        if (percentComplete === 100) {
                            $('.progress-bar').html('Done');
                        }

                    }
                }, false);

                return xhr;
            }
        });
    }

});
