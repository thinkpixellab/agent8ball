// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
goog.require('eightball.PoolTable');
goog.require('eightball.Sounds');
goog.require('pixelLab.ImagePreloader');
goog.require('pixelLab.Debug');

var poolTable;
var soundManager;

$(window).load(function () {
  pixelLab.Debug.enable();
  pixelLab.ImagePreloader.preload("images/bestscore.png, images/cue.png, images/progressbg.png, images/progressunit.png, images/score.png, images/table.jpg, images/tableborder.png, images/timeremaining.png, images/wood.jpg");

  // create our new sound manager
  soundManager = new eightball.Sounds($("audio#musicelement"));

  var canvasElement = $('canvas#demo_canvas');
  var cueCanvasElement = $('canvas#cue_canvas');
  if (canvasElement[0]) {
    poolTable = new eightball.PoolTable(canvasElement, cueCanvasElement);

    width = window.innerWidth;
    height = window.innerHeight;
    poolTable.updateLayout(width, height);
  }

  // music on/off
  $("#musicbutton").click(function () {
    if (soundManager.isMusicOn) {
      $("#musicbuttonon").fadeOut("fast", function () {
        soundManager.stopMusic();
        $.cookie("music", "nope");
      });
    }
    else {
      $("#musicbuttonon").fadeIn("fast", function () {
        soundManager.startMusic("sounds/theme.mp4", true);
        $.cookie("music", "yup");
      });
    }
  });

  // sound effects on/off
  $("#soundsbutton").click(function () {
    if (soundManager.isSoundEnabled) {
      $("#soundsbuttonon").fadeOut("fast", function () {
        soundManager.isSoundEnabled = false;
      });
    }
    else {
      $("#soundsbuttonon").fadeIn("fast", function () {
        soundManager.isSoundEnabled = true;
      });
    }
  });

  // start the music (but check our cookie first)
  var musicCookie = $.cookie("music");
  if (musicCookie != "off") {
    soundManager.startMusic("sounds/theme.mp4", true);
  }
  else {
    $("#musicbuttonon").fadeOut("fast", function () {
      soundManager.stopMusic();
    });
  }
});

$(window).resize(function (e) {
  width = window.innerWidth;
  height = window.innerHeight;
  poolTable.updateLayout(width, height);
});
