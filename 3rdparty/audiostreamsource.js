// @license audiosteamsource.js Copyright (c) 2015, Gregg Tavares All Rights Reserved.
// Available via the MIT license.
// see: http://github.com/greggman/audiostreamsource.js for details

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.audioStreamSource = factory();
    }
}(this, function () {

  // There's really no good way to tell which browsers fail.
  // Right now Safari doesn't expose AudioContext (it's still webkitAudioContext)
  // so my hope is whenever they get around to actually supporting the 3+ year old
  // standard that things will actually work.
  var shittyBrowser = window.AudioContext === undefined && /iPhone|iPad|iPod/.test(navigator.userAgent);

  function createOnetimeCallback(callback) {
    return function() {
      var cb = callback;
      if (cb) {
         callback = undefined;
         cb.apply(null, arguments);
      }
    };
  }

  function StreamedAudioSource(options, callback) {
    var self = this;
    var context = options.context;
    var autoPlay = options.autoPlay;

    audio = new Audio();
    audio.addEventListener('error', function(e) {
      callback(e);
    });
    audio.addEventListener('canplay', function() {
      self.source = context.createMediaElementSource(audio);
      callback(null, self);
    });
    audio.src = options.src;
    audio.loop = options.loop;
    audio.autoPlay = options.autoPlay;
    audio.load();

    this.play = function() {
      audio.play();
    };
    this.stop = function() {
      audio.pause();
    };

  }

  function NonStreamedAudioSource(options, callback) {
    var self = this;
    var context = options.context;
    var loop = options.loop;
    var autoPlay = options.autoPlay;
    var source;
    // shitty browsers (eg, Safari) can't stream into the WebAudio API
    var req = new XMLHttpRequest();
    req.open("GET", options.lofiSrc || options.src, true);
    req.responseType = "arraybuffer";
    req.addEventListener('error', function(e) {
      callback(e);
    });
    req.addEventListener('load', function() {
      context.decodeAudioData(req.response, function (decodedBuffer) {
        source = context.createBufferSource();
        source.buffer = decodedBuffer;
        source.loop = loop;
        if (autoPlay) {
          source.start(0);
        }
        self.source = source;
        callback(null, self);
      });
    });
    req.send();

    this.play = function() {
      source.start(0);
    };
    this.stop = function() {
      source.stop(0);
    };
  }

  function createAudioStreamSource(options, callback) {
    callback = createOnetimeCallback(callback);
    return new (shittyBrowser ? NonStreamedAudioSource : StreamedAudioSource)(options, callback);
  }

  return {
    create: createAudioStreamSource,
  };

}));
