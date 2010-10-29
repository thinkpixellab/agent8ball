// TODO -> make this 8-ball. Makes assumptions about the preloadDiv, etc
// WARNING: this uses jQuery implicitly. Not a pure closure library

goog.provide('pixelLab.Preload');

goog.require('goog.object');

/**
@param {!Array.<!string>} imageUrls
@param {!function(!number)} progressCallback
@param {!function()} completedCallback
*/
pixelLab.Preload = function(imageUrls, progressCallback, completedCallback) {
  var imagesLoaded = 0;
  var imagesTotal = goog.object.getCount(imageUrls);
  var hasLoaded = false;

  $(document).ready(function() {
    // handle images
    var preloadDiv = document.createElement('div');
    $(preloadDiv).css({
      height: '0px',
      width: '0px',
      overflow: 'hidden'
    });

    for (var key in imageUrls) {
      var imgLoad = $('<img></img>');
      $(imgLoad).unbind('load');
      $(imgLoad).bind('load', function() {
        imagesLoaded++;
        var progress = imagesLoaded / imagesTotal;
        progressCallback(progress);
        if (imagesLoaded == imagesTotal) {
          completedCallback();
          hasLoaded = true;
        }
      });
      $(imgLoad).attr('src', imageUrls[key]);
      $(preloadDiv).append(imgLoad);
    }


    // create a failsafe of 30 seconds
    setTimeout(function() {
      if (!hasLoaded) {
        completedCallback();
      }
    }, 30000);

  });
};
