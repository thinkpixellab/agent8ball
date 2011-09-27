goog.provide('eightball.loader');

goog.require('eightball.Application');
goog.require('goog.object');
goog.require('pl.images');

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
    new eightball.Application(true);
  } else {

    var images = new pl.images(preloadAssets.images);

    var done = function() {
      $('#loadingbg').delay(500).fadeOut(700, function() {
        new eightball.Application();
      });
    };

    var progress = function(percent) {
      $('#loadingpg').width((237.0 * percent));
    };

    // show the preload ui
    $('#loadingbg').delay(500).fadeIn(700);

    goog.object.forEach(preloadAssets.audios, function(element, key, hash) {
      pl.SoundEffect.create(key, element);
    });

    images.load(progress, done);
  }
});
