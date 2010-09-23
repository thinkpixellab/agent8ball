goog.provide('pixelLab.Preload');

goog.require('goog.object');

/**
@constructor
@param {!Array.<!string>} imageUrls
@param {!Array.<!string>} soundUrls
@param {!function(!number)} progressCallback
@param {!function()} completedCallback
*/
pixelLab.Preload = function (imageUrls, soundUrls, progressCallback, completedCallback) {
  this.imagesLoaded = 0;
  this.imagesTotal = goog.object.getCount(imageUrls);
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

    for (var key in imageUrls) {
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
      $(imgLoad).attr("src", imageUrls[key]);
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
