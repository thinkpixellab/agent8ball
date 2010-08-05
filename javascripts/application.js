// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
goog.require('goog.events');
goog.require('goog.events.EventType');

goog.require('pixelLab.ImagePreloader');
goog.require('pixelLab.Debug');

goog.require('eightball.PoolTable');
goog.require('eightball.Music');
goog.require('eightball.SoundEffect');
goog.require('eightball.SoundEffectManager');
goog.require('eightball.Game');
goog.require('eightball.Game.EventType');
goog.require('eightball.Game.GameState');
goog.require('pixelLab.ImagePreloader');
goog.require('pixelLab.Debug');

var poolTable;
var musicManager;
var game;
var soundManager;

var loadApp = function() {
  pixelLab.Debug.enable();
  pixelLab.ImagePreloader.preload("images/bestscore.png, images/cue.png, images/progressbg.png, images/progressunit.png, images/score.png, images/table.jpg, images/tableborder.png, images/timeremaining.png, images/wood.jpg");

  // create our music manager
  musicManager = new eightball.Music("sounds/theme.mp4");

  // create our sounds manager
  soundManager = new eightball.SoundEffectManager();

  // add sounds
  soundManager.add("blip1", new eightball.SoundEffect("sounds/blip1.mp3", 3));
  soundManager.add("blip2", new eightball.SoundEffect("sounds/blip2.mp3", 3));
  soundManager.add("blip3", new eightball.SoundEffect("sounds/blip3.mp3", 3));
  soundManager.add("blip4", new eightball.SoundEffect("sounds/blip4.mp3", 3));
  soundManager.add("bounce01", new eightball.SoundEffect("sounds/bounce01.mp3", 3));
  soundManager.add("pocket01", new eightball.SoundEffect("sounds/pocket01.mp3", 3));
  soundManager.add("shot05", new eightball.SoundEffect("sounds/shot05.mp3", 3));
  soundManager.add("shotsingle01", new eightball.SoundEffect("sounds/shotsingle01.mp3", 3));

  // create a game object
  game = new eightball.Game();
  game.start();

  var timeRemaining = $('#timeremaining');
  var _tickAction = function() {

    var min = Math.floor(game.secondsLeft / 60);
    var sec = game.secondsLeft % 60;

    timeRemaining.html(min + ":" + (sec < 10 ? "0" + sec : sec));

    pixelLab.Debug.clearDebug();
    pixelLab.Debug.writeDebug("0" + min + ":" + (sec < 10 ? "0" + sec : sec));
  };

  // register for game events
  goog.events.listen(game, eightball.Game.EventType.TICK, _tickAction);

  var canvasElement = $('canvas#demo_canvas')[0];
  var cueCanvasElement = $('canvas#cue_canvas')[0];
  if (canvasElement) {
    poolTable = new eightball.PoolTable(canvasElement, cueCanvasElement);

    var width = window.innerWidth;
    var height = window.innerHeight;
    poolTable.updateLayout(width, height);
  }

  var updateMusicButton = function() {
    if (musicManager.isMusicOn()) {
      $("#musicbuttonon").fadeIn("fast");
    } else {
      $("#musicbuttonon").fadeOut("fast");
    }
  };

  var updateSoundButton = function() {
    if (soundManager.isSoundOn()) {
      $("#soundsbuttonon").fadeIn("fast");
    } else {
      $("#soundsbuttonon").fadeOut("fast");
    }
  };

  // music on/off
  $("#musicbutton").click(function() {
    musicManager.toggleMusic();
    updateMusicButton();
  });

  // sound effects on/off
  $("#soundsbutton").click(function() {
    soundManager.toggleSound();
    updateSoundButton();
  });

  updateMusicButton();
  updateSoundButton();

  // sound effects test code
  $(".soundtest").click(function() {
    soundManager.play(this.id);
  });
};

$(window).load(loadApp);

$(window).resize(function(e) {
  var width = window.innerWidth;
  var height = window.innerHeight;
  poolTable.updateLayout(width, height);
});

$(window).keypress(function(e){
  // 114 -> 'r'
  if(e.which == 114){
    poolTable.rackEm();
  }
});
