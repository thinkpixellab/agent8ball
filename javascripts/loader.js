// Handles pre-loading the app
goog.require('pixelLab.Preload');
goog.require('eightball.application');

/** @define {boolean} */
var SKIP_PRELOAD = false;

$(document).ready(function() {
  // disable selection
  // from http://aleembawany.com/2009/01/20/disable-selction-on-menu-items-with-this-jquery-extension/
  $('body').each(function() {
    this['onselectstart'] = function() {
      return false;
    };
    this.unselectable = "on";
    jQuery(this).css('-moz-user-select', 'none');
    jQuery(this).css('-webkit-user-select', 'none');
  });

  if (SKIP_PRELOAD) {
    loadApp(true);
  } else {

    var files = [
    'images/ballvignette.png',
    'images/bestscore.png',
    'images/bombicon.png',
    'images/bombstamp.png',
    'images/boom.png',
    'images/cue.png',
    'images/gamefacebook.png',
    'images/gamefacebookover.png',
    'images/gameover.png',
    'images/gametwitter.png',
    'images/gametwitterover.png',
    'images/howtoplay.png',
    'images/instructions.png',
    'images/letter.png',
    'images/lightoff.png',
    'images/lighton.png',
    'images/loading.jpg',
    'images/loadingbg.png',
    'images/loadingpg.png',
    'images/num1.png',
    'images/num10.png',
    'images/num11.png',
    'images/num12.png',
    'images/num13.png',
    'images/num14.png',
    'images/num15.png',
    'images/num2.png',
    'images/num3.png',
    'images/num4.png',
    'images/num5.png',
    'images/num6.png',
    'images/num7.png',
    'images/num8.png',
    'images/num9.png',
    'images/pause.png',
    'images/pixellab.png',
    'images/pixellabover.png',
    'images/progressbg.png',
    'images/progressunit.png',
    'images/score.png',
    'images/smalllogo.png',
    'images/speaker.png',
    'images/start.png',
    'images/startover.png',
    'images/startoverlay.png',
    'images/suspended.png',
    'images/table.jpg',
    'images/tableborder.png',
    'images/timerbg.png',
    'images/timeremaining.png',
    'images/transparent.png',
    'images/triangle.png',
    'images/vignette.png',
    'images/wood.jpg',
    'sounds/activate.mp3',
    'sounds/bombtick.mp3',
    'sounds/bombtickfast.mp3',
    'sounds/bombtickslow.mp3',
    'sounds/break.mp3',
    'sounds/clack.mp3',
    'sounds/clackquiet.mp3',
    'sounds/cuehit.mp3',
    'sounds/cuestick.mp3',
    'sounds/deactivate.mp3',
    'sounds/explode.mp3',
    'sounds/explodeloud.mp3',
    'sounds/pocket.mp3',
    'sounds/typing.mp3',
    'sounds/wall.mp3',
    'sounds/wallquiet.mp3'
    ];

    var done = function() {
      $("#loadingbg").delay(500).fadeOut(700, loadApp);
    };

    // show the preload ui
    $('#loadingbg').delay(500).fadeIn(700);

    // load the ui (on a timer so that we start after fading in -- it looks weird otherwise
    setTimeout(function() {
      new pixelLab.Preload(files, done);
    },
    1500);
  }
});
