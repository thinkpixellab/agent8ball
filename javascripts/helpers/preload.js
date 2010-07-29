// preloader
goog.provide('pixelLab.ImagePreloader');

goog.require('goog.string');
goog.require('goog.array');

pixelLab.ImagePreloader.preload = function(images) {
  if (document.images) {
    var imageArray = goog.array.map(images.split(','), goog.string.trim);

    var imageObj = new Image();
    for (var i = 0; i < imageArray.length; i++) {
      imageObj.src = imageArray[i];
    }
  }
};
