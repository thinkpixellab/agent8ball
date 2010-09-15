// Handles pre-loading the app
goog.require('pixelLab.Preload');
goog.require('eightball.application');

/** @define {boolean} */
var SKIP_PRELOAD = false;
var USE_CDN = true;

$(document).ready(function () {
  // disable selection
  // from http://aleembawany.com/2009/01/20/disable-selction-on-menu-items-with-this-jquery-extension/
  $('body').each(function () {
    this['onselectstart'] = function () {
      return false;
    };
    this.unselectable = "on";
    jQuery(this).css('-moz-user-select', 'none');
    jQuery(this).css('-webkit-user-select', 'none');
  });

  if (SKIP_PRELOAD) {
    loadApp(true);
  } else {

    var imageLocation = USE_CDN ? 'http://static.agent8ball.com/images' : 'images';
    var soundLocation = USE_CDN ? 'http://sounds.agent8ball.com/sounds' : 'sounds';

    var images = [
    imageLocation + '/ballvignette.png',
    imageLocation + '/bestscore.png',
    imageLocation + '/bombicon.png',
    imageLocation + '/bombstamp.png',
    imageLocation + '/boom.png',
    imageLocation + '/cue.png',
    imageLocation + '/gamefacebook.png',
    imageLocation + '/gamefacebookover.png',
    imageLocation + '/gameover.png',
    imageLocation + '/gametwitter.png',
    imageLocation + '/gametwitterover.png',
    imageLocation + '/howtoplay.png',
    imageLocation + '/instructions.png',
    imageLocation + '/letter.png',
    imageLocation + '/lightoff.png',
    imageLocation + '/lighton.png',
    imageLocation + '/loading.jpg',
    imageLocation + '/loadingbg.png',
    imageLocation + '/num1.png',
    imageLocation + '/num10.png',
    imageLocation + '/num11.png',
    imageLocation + '/num12.png',
    imageLocation + '/num13.png',
    imageLocation + '/num14.png',
    imageLocation + '/num15.png',
    imageLocation + '/num2.png',
    imageLocation + '/num3.png',
    imageLocation + '/num4.png',
    imageLocation + '/num5.png',
    imageLocation + '/num6.png',
    imageLocation + '/num7.png',
    imageLocation + '/num8.png',
    imageLocation + '/num9.png',
    imageLocation + '/pause.png',
    imageLocation + '/pixellab.png',
    imageLocation + '/pixellabover.png',
    imageLocation + '/progressbg.png',
    imageLocation + '/progressunit.png',
    imageLocation + '/score.png',
    imageLocation + '/smalllogo.png',
    imageLocation + '/speaker.png',
    imageLocation + '/start.png',
    imageLocation + '/startover.png',
    imageLocation + '/startoverlay.png',
    imageLocation + '/suspended.png',
    imageLocation + '/table.jpg',
    imageLocation + '/tableborder.png',
    imageLocation + '/timerbg.png',
    imageLocation + '/timeremaining.png',
    imageLocation + '/transparent.png',
    imageLocation + '/triangle.png',
    imageLocation + '/vignette.png',
    imageLocation + '/wood.jpg'
    ];

    var sounds = [
    soundLocation + '/theme.mp4',
    soundLocation + '/typing.mp3'
    ];

    var done = function () {
      $("#loadingbg").delay(500).fadeOut(700, loadApp);
    };

    var progress = function (percent) {
      $('#loadingpg').width((237.0 * percent));
    }

    // show the preload ui
    $('#loadingbg').delay(500).fadeIn(700);


    // load the ui (on a timer so that we start after fading in -- it looks weird otherwise)
    setTimeout(function () { new pixelLab.Preload(images, sounds, progress, done); }, 1500);
  }
});
