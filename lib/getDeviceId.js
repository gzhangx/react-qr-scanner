var _require = require('./errors'),
    NoVideoInputDevicesError = _require.NoVideoInputDevicesError;

function defaultDeviceIdChooser(filteredDevices, videoDevices) {
  return filteredDevices.length > 0 ? filteredDevices[0].deviceId // No device found with the pattern thus use another video device
  : videoDevices[0].deviceId;
}

function getDeviceId(facingMode) {
  var chooseDeviceId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultDeviceIdChooser;
  var setDebugMsg = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
  // Get manual deviceId from available devices.
  return new Promise(function (resolve, reject) {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then(function () {
      var enumerateDevices;

      try {
        enumerateDevices = navigator.mediaDevices.enumerateDevices();
      } catch (err) {
        reject(new NoVideoInputDevicesError());
      }

      enumerateDevices.then(function (devices) {
        // Filter out non-videoinputs
        var videoDevices = devices.filter(function (device) {
          return device.kind == 'videoinput';
        });

        if (videoDevices.length < 1) {
          reject(new NoVideoInputDevicesError());
          return;
        } else if (videoDevices.length == 1) {
          setDebugMsg('only have one videoDevices', videoDevices); // Only 1 video device available thus stop here

          resolve(videoDevices[0].deviceId);
          return;
        }

        setDebugMsg('has more video devices', videoDevices);
        var pattern = facingMode == 'rear' ? /rear|back|environment/ig : /front|user|face/ig; // Filter out video devices without the pattern

        var filteredDevices = videoDevices.filter(function (_ref) {
          var label = _ref.label;
          return pattern.test(label);
        });
        resolve(chooseDeviceId(filteredDevices, videoDevices));
      });
    })["catch"](function (err) {
      reject(err);
    });
  });
}

export default getDeviceId;