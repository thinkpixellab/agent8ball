goog.require('eightball.application');
goog.require('pixelLab.Preload');

/** @define {boolean} */
var SKIP_PRELOAD = false;

$(document).ready(function() {
  // disable selection
  // from http://aleembawany.com/2009/01/20/disable-selction-on-menu-items-with-this-jquery-extension/
  $('body').each(function() {
    this['onselectstart'] = function() {
      return false;
    };
    this.unselectable = 'on';
  });

  if (SKIP_PRELOAD) {
    loadApp(true);
  } else {

    var images = preloadAssets.images;
    var preloadAudios = [preloadAssets.audios['theme'], preloadAssets.audios['typing']];

    var done = function() {
      $('#loadingbg').delay(500).fadeOut(700, loadApp);
    };

    var progress = function(percent) {
      $('#loadingpg').width((237.0 * percent));
    };

    // show the preload ui
    $('#loadingbg').delay(500).fadeIn(700);


    // load the ui (on a timer so that we start after fading in -- it looks weird otherwise)
    setTimeout(function() { new pixelLab.Preload(images, preloadAudios, progress, done); }, 1500);
  }
});
