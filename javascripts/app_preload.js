// Handles pre-loading the app
goog.require('pixelLab.Preload');

/** @define {boolean} */
var SKIP_PRELOAD = true;

$(document).ready(function() {
  if (SKIP_PRELOAD) {
    loadApp(true);
  } else {

    var files = ['images/ballvignette.png', 'images/bestscore.png', 'images/cue.png', 'images/howtoplay.png', 'images/instructions.png', 'images/lightoff.png', 'images/lighton.png', 'images/loading.jpg', 'images/loadingbg.png', 'images/loadingpg.png', 'images/num1.png', 'images/num10.png', 'images/num11.png', 'images/num12.png', 'images/num13.png', 'images/num14.png', 'images/num15.png', 'images/num2.png', 'images/num3.png', 'images/num4.png', 'images/num5.png', 'images/num6.png', 'images/num7.png', 'images/num8.png', 'images/num9.png', 'images/pause.png', 'images/progressbg.png', 'images/progressunit.png', 'images/score.png', 'images/smalllogo.png', 'images/speaker.png', 'images/startover.png', 'images/table.jpg', 'images/tableborder.png', 'images/timeremaining.png', 'images/transparent.png', 'images/triangle.png', 'images/vignette.png', 'images/wood.jpg', 'sounds/theme.mp4'];

    var prog = function(perc) {
      $('#loadingpg').width(237 * perc);
    };

    var done = function() {
      $("#loadingbg").delay(500).fadeOut(700, loadApp);
    };

    // show the preload ui
    $('#loadingbg').delay(500).fadeIn(700);

    // load the ui (on a timer so that we start after fading in -- it looks weird otherwise
    setTimeout(function() {
      new pixelLab.Preload(files, prog, done);
    },
    1500);
  }
});
