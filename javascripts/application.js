// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
goog.require('eightball.PoolTable');
goog.require('eightball.Sounds');
goog.require('pixelLab.ImagePreloader');
goog.require('pixelLab.Debug');

var poolTable;
var soundManager;

$(window).load(function() {
  pixelLab.Debug.enable();
  pixelLab.ImagePreloader.preload("images/bestscore.png, images/cue.png, images/progressbg.png, images/progressunit.png, images/score.png, images/table.jpg, images/tableborder.png, images/timeremaining.png, images/wood.jpg");

  // create our new sound manager
  soundManager = new eightball.Sounds("sounds/theme.mp4");

  var canvasElement = $('canvas#demo_canvas');
  var cueCanvasElement = $('canvas#cue_canvas');
  if (canvasElement[0]) {
    poolTable = new eightball.PoolTable(canvasElement, cueCanvasElement);

    width = window.innerWidth;
    height = window.innerHeight;
    poolTable.updateLayout(width, height);
  }

  var updateMusicButton = function() {
    if (soundManager.isMusicOn()) {
      $("#musicbuttonon").fadeIn("fast");
    } else {
      $("#musicbuttonon").fadeOut("fast");
    }
  };

  // music on/off
  $("#musicbutton").click(function() {
    soundManager.toggleMusic();
    updateMusicButton();
  });

  // sound effects on/off
  $("#soundsbutton").click(function() {
    if (soundManager.isSoundEnabled) {
      $("#soundsbuttonon").fadeOut("fast", function() {
        soundManager.isSoundEnabled = false;
      });
    } else {
      $("#soundsbuttonon").fadeIn("fast", function() {
        soundManager.isSoundEnabled = true;
      });
    }
  });

  updateMusicButton();

});

$(window).resize(function(e) {
  width = window.innerWidth;
  height = window.innerHeight;
  poolTable.updateLayout(width, height);
});
