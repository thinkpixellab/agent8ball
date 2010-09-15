goog.provide('pixelLab.Preload');

goog.require('goog.string');
goog.require('goog.array');
goog.require('pixelLab.Audio');
goog.require('goog.events');

/**
@constructor
@param {!Array.<!string>} imageUrls
@param {!Array.<!string>} soundUrls
@param {!function(!number)} progressCallback
@param {!function()} completedCallback
*/
pixelLab.Preload = function (imageUrls, soundUrls, progressCallback, completedCallback) {
  this.imagesLoaded = 0;
  this.imagesTotal = imageUrls.length;
  this.hasLoaded = false;

  var _this = this;

  $(document).ready(function () {

    // handle sounds

    for (var i = 0; i < soundUrls.length; i++) {
      var audio = document.createElement("audio");
      document.body.appendChild(audio);
      audio.setAttribute("src", soundUrls[i]);
      audio.volume = 0;
      audio.load();
    }


    // handle images

    _this.preloadDiv = document.createElement("div");
    $(_this.preloadDiv).css({
      height: "0px",
      width: "0px",
      overflow: "hidden"
    });

    for (var i = 0; i < _this.imagesTotal; i++) {
      var imgLoad = $("<img></img>");
      $(imgLoad).unbind("load");
      $(imgLoad).bind("load", function () {
        _this.imagesLoaded++;
        var progress = _this.imagesLoaded / _this.imagesTotal;
        progressCallback(progress);
        if (_this.imagesLoaded == _this.imagesTotal) {
          completedCallback();
          _this.hasLoaded = true;
        }
      });
      $(imgLoad).attr("src", imageUrls[i]);
      $(imgLoad).appendTo(this.preloadDiv);
    }


    // create a failsafe of 30 seconds 
    setTimeout(function () {
      if (!_this.hasLoaded) {
        completedCallback();
      }
    }, 30000);

  });
};
