// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.debug.LogManager');
goog.require('goog.i18n.NumberFormat');

goog.require('pixelLab.DebugDiv');

goog.require('eightball.PoolTable');
goog.require('eightball.Music');
goog.require('eightball.SoundEffect');
goog.require('eightball.SoundEffectManager');
goog.require('eightball.Game');
goog.require('eightball.Game.EventType');
goog.require('eightball.Game.GameState');

var _game;

// *******************************************************************************
// APP LOGIC
// *******************************************************************************
/*
@param {boolean=} skip_graphics
*/
var loadApp = function (skip_graphics) {

  // show debug
  //pixelLab.DebugDiv.enable();
  // show the content, hide the loading element
  $('#vignette').delay(500).fadeIn(1000);
  $('#game').delay(500).fadeIn(1000);
  $('#gamecontrolsdisplay').delay(500).fadeIn(1000);
  $('#gamecontrolsclick').delay(500).fadeIn(1000);
  $('#cue_canvas').delay(500).fadeIn(1000);

  // music
  var musicManager = new eightball.Music("sounds/theme.mp4");

  // sound
  var soundManager = new eightball.SoundEffectManager();
  soundManager.add("break", new eightball.SoundEffect("sounds/break.mp3", 1));
  soundManager.add("cuestick", new eightball.SoundEffect("sounds/cuestick.mp3", 1));
  soundManager.add("ball", new eightball.SoundEffect("sounds/clack.mp3", 8));
  soundManager.add("quietball", new eightball.SoundEffect("sounds/clackquiet.mp3", 8));
  soundManager.add("wall", new eightball.SoundEffect("sounds/wall.mp3", 5));
  soundManager.add("quietwall", new eightball.SoundEffect("sounds/wallquiet.mp3", 5));
  soundManager.add("cuehit", new eightball.SoundEffect("sounds/cuehit.mp3", 1));
  soundManager.add("pocket", new eightball.SoundEffect("sounds/pocket.mp3", 3));
  soundManager.add("typing", new eightball.SoundEffect("sounds/typing.mp3", 1));
  soundManager.add("activate", new eightball.SoundEffect("sounds/activate.mp3", 1));
  soundManager.add("deactivate", new eightball.SoundEffect("sounds/deactivate.mp3", 1));
  soundManager.add("bombtickslow", new eightball.SoundEffect("sounds/bombtickslow.mp3", 2));
  soundManager.add("bombtick", new eightball.SoundEffect("sounds/bombtick.mp3", 2));
  soundManager.add("bombtickfast", new eightball.SoundEffect("sounds/bombtickfast.mp3", 2));
  soundManager.add("explode", new eightball.SoundEffect("sounds/explode.mp3", 1));

  // global elements
  var minutesremaining = $('#minutesremaining');
  var secondsremainingtens = $('#secondsremainingtens');
  var secondsremainingones = $('#secondsremainingones');
  var progress = $('#progress');
  var overlay = $('#overlay');
  var start = $('#start');
  var startmessage = $('#startmessage');
  var pause = $('#pauseclick');
  var resume = $('#resume');
  var gameover = $('#gameover');
  var startover = $('#startoverclick');
  var canvasElement = $('canvas#demo_canvas')[0];
  var cueCanvasElement = $('canvas#cue_canvas')[0];
  var shadowCanvasElement = $('canvas#shadow_canvas')[0];

  // other globals 
  var lastBars = 29;
  var isExplosionActive = false;
  var lastTickSeconds = 0;
  var lastMusicOnPause = false;
  var skipTyping = false;
  var missionMessage = "Mission #1146<br/>To: Agent 008<br/>From: Cue<br/><br/><br/>The International Billiards Tournament is being infil- trated by the terrorist organization CHALK.<br/><br/>Do not let them win! Sink as  many balls as possible before the timer runs out.";
  var typingSound = null;

  // event handlers
  var _tickAction = function () {

    if (isExplosionActive) return;
    _updateTimerVisuals(game.secondsLeft);

    pixelLab.DebugDiv.clear();
    var fmt = new goog.i18n.NumberFormat('#,###.##');
    var str = fmt.format(poolTable.stepsPerSecond());
    goog.debug.LogManager.getRoot().info("FPS: " + str);
  };

  var _updateTimerVisuals = function (s) {

    lastTickSeconds = s;

    var min = Math.floor(s / 60);
    var sec = s % 60;
    var sec_tens = Math.floor(sec / 10);
    var sec_ones = sec % 10;

    minutesremaining.html(min);
    secondsremainingtens.html(sec_tens);
    secondsremainingones.html(sec_ones);

    var bars = 1 + Math.floor((s - 1) / 4);

    if (bars != lastBars) {
      lastBars = bars;
      progress.width(Math.min((7 * bars), (7 * 30)));
    }


  };

  var highScoreAction = function () {
    $('#bestscore').html(game.highScore);
  };

  var _scoreAction = function () {
    var s = game.score;
    if (s == 0) s = "00";
    $('#score').html(s);
    $('#gameoverscore').html(s);
  };

  var readyAction = function () {
    overlay.fadeIn(1000);

    $("#bombicon").hide();
    $("#bombsecondstens").hide();
    $("#bombsecondsones").hide();
    $('#boom').hide();

    var msg = missionMessage;
    var index = 0;

    start.delay(800).fadeIn(400, function () {

      if (!skipTyping) {
        typingSound = soundManager.play("typing");
        var interval = setInterval(function () {

          startmessage.html(msg.substr(0, index));
          index++;

          if (index > msg.length) {
            clearInterval(interval);
            if (typingSound) typingSound.pause();
          }
        },
      10);
      }
    });
  };

  if (skip_graphics) {
    readyAction = function () {
      game.start();
    };
  }

  var endAction = function () {
    overlay.fadeIn(500);
    gameover.fadeIn(400);
    poolTable.pause();
  };

  gameover.click(function () {
    gameover.fadeOut(400);
    game.reset();
  });

  startover.click(function () {
    game.reset();
  });

  start.click(function () {
    start.fadeOut(100);
    overlay.fadeOut(400);
    game.start();

    // clean up the typing
    skipTyping = true;
    if (typingSound) typingSound.pause();
    startmessage.html(missionMessage);

  });

  pause.click(function () {
    game.togglePaused();
    poolTable.pause();
    overlay.fadeIn(400);
    resume.fadeIn(400);

    lastMusicOnPause = musicManager.isMusicOn();
    if (lastMusicOnPause) {
      musicManager.stopMusic();
    }
  });

  resume.click(function () {
    overlay.fadeOut(400);
    resume.fadeOut(400, function () {
      game.togglePaused()
      poolTable.resume();
    });

    if (lastMusicOnPause) {
      musicManager.startMusic();
    }

  });

  $('#gameoverfacebook').click(function (e) {
    //http://www.facebook.com/sharer.php?u=<url to share>&t=<title of content>
    e.stopPropagation();
    window.open('http://www.facebook.com/sharer.php?u=http://agent8ball.com&t=I%20just%20scored%20' + game.score + '%20points%20on%20Agent%20008%20Ball!');
  });

  $('#gameovertwitter').click(function (e) {
    e.stopPropagation();
    window.open('http://twitter.com/home?status=I%20just%20scored%20' + game.score + '%20points%20on%20Agent%20008%20Ball! http://agent8ball.com #html5');
  });

  var poolTable = new eightball.PoolTable(canvasElement, cueCanvasElement, shadowCanvasElement);

  // create a game object
  var game = new eightball.Game(poolTable);
  // *DEBUG*
  _game = game;

  // game events (TODO: make these inline)
  goog.events.listen(game, eightball.Game.EventType.TICK, _tickAction);
  goog.events.listen(game, eightball.Game.EventType.SCORE, _scoreAction);
  goog.events.listen(game, eightball.Game.EventType.HIGHSCORE, highScoreAction);
  goog.events.listen(game, eightball.Game.EventType.READY, readyAction);
  goog.events.listen(game, eightball.Game.EventType.END, endAction);

  // timebomb events
  goog.events.listen(game, eightball.Game.EventType.BOMBACTIVATED, function (e) {

    $("#bombicon").fadeIn(200);
    $("#bombsecondstens").fadeIn(200);
    $("#bombsecondsones").fadeIn(200);
    soundManager.play("activate");

    poolTable.setBombNumber(game.bombNumber);

  },
  undefined, this);

  goog.events.listen(game, eightball.Game.EventType.BOMBTICK, function (e) {



    var sec = game.bombSecondsLeft % 60;
    if (sec > 30) sec = 30;
    var sec_tens = Math.floor(sec / 10);
    var sec_ones = sec % 10;

    $("#bombsecondstens").html(String(sec_tens));
    $("#bombsecondsones").html(String(sec_ones));

    if (sec > 19) soundManager.play("bombtickslow");
    else if (sec <= 10) soundManager.play("bombtickfast");
    else if (sec >= 1) soundManager.play("bombtick");

    if (sec == 19 || sec == 10) poolTable.increaseBombPulse();


  }, undefined, this);

  goog.events.listen(game, eightball.Game.EventType.BOMBDEACTIVATED, function (e) {
    // hide the timer
    soundManager.play("deactivate");

    $("#bombicon").fadeOut(1200);
    $("#bombsecondstens").fadeOut(1200);
    $("#bombsecondsones").fadeOut(1200);


    var lastTime = lastTickSeconds;

    // count up the timer
    var timerInterval = setInterval(function () {

      if (lastTime >= game.secondsLeft) {
        clearInterval(timerInterval);
        isExplosionActive = false;
      }
      else {
        lastTime++;
        _updateTimerVisuals(lastTime);
      }

    }, 50);

  },
  undefined, this);

  goog.events.listen(game, eightball.Game.EventType.BOMBEXPLODED, function (e) {
    soundManager.play("explode");
    poolTable.igniteBomb();
    $("#bombicon").fadeOut(1200);
    $("#bombsecondstens").fadeOut(1200);
    $("#bombsecondsones").fadeOut(1200);
    setTimeout(function () {
      // get the location of the ball that exploded
      var bombLocation = poolTable.getBallLocation(game.bombNumber);
      if (bombLocation) {

        var left = Math.min(Math.max((bombLocation.x + 300), -60), 660);
        var top = Math.min(Math.max((bombLocation.y + 88), -60), 250);

        poolTable.removeBomb();

        $('#boom').css({ "left": left + "px", "top": top + "px" });
        $('#boom').show();

      }
    }, 1500);

    isExplosionActive = true;

    var lastTime = lastTickSeconds;

    // countdown the timer
    var timerInterval = setInterval(function () {

      if (lastTime < game.secondsLeft) {
        clearInterval(timerInterval);
        isExplosionActive = false;
      }
      else {
        lastTime--;
        _updateTimerVisuals(lastTime);
      }

    }, 50);


  },
  undefined, this);


  // cuestick events
  goog.events.listen(poolTable, eightball.PoolTable.EventType.CUESTICK_HIT_START, function () {
    $("#gamecontrolsclick").hide();
  },
  undefined, this);


  goog.events.listen(poolTable, eightball.PoolTable.EventType.CUESTICK_HIT_STOP, function () {
    $("#gamecontrolsclick").show();
  },
  undefined, this);


  // sound events
  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.CUESTICK, function (e) {
    soundManager.play("cuestick");
  },
  undefined, this);

  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.BREAK, function (e) {
    soundManager.play("break");
  },
  undefined, this);

  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.CUEBALL, function (e) {
    soundManager.play("cuehit");
  },
  undefined, this);

  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.BALL, function (e) {
    goog.debug.LogManager.getRoot().info("velocity: " + e.velocity);

    if (e.velocity > 80) {
      soundManager.play("ball");
    } else if (e.velocity > 20) {
      soundManager.play("quietball");
    }
  },
  undefined, this);

  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.WALL, function (e) {
    if (e.velocity > 120) {
      soundManager.play("wall");
    } else if (e.velocity > 40) {
      soundManager.play("quietwall");
    }
  },
  undefined, this);

  goog.events.listen(poolTable, eightball.PocketDropEvent.TYPE, function (e) {
    soundManager.play("pocket");
  },
  undefined, this);

  // calling reset after the game has been loaded fires the events we 
  // need to initialize everything for game play
  game.reset();

  var updatePoolTableLayout = function () {
    var width = $(window).width();
    var height = $(window).height();
    poolTable.updateLayout(width, height);
  };

  $(window).resize(updatePoolTableLayout);
  updatePoolTableLayout();

  $(window).keypress(function (e) {
    // 114 -> 'r'
    if (e.which == 114) {
      game.reset();
    }
  });

  var updateMusicButton = function () {
    if (musicManager.isMusicOn()) {
      $("#musicbuttonon").fadeIn("fast");
    } else {
      $("#musicbuttonon").fadeOut("fast");
    }
  };

  var updateSoundButton = function () {
    if (soundManager.isSoundOn()) {
      $("#soundsbuttonon").fadeIn("fast");
    } else {
      $("#soundsbuttonon").fadeOut("fast");
    }
  };

  $("#instructionsclick").click(function () {
    game.togglePaused();
    $("#howtoplay").fadeIn(200);
    $("#cue_canvas").fadeOut(200);
  });

  // music on/off
  $("#musicbuttonclick").click(function () {
    musicManager.toggleMusic();
    updateMusicButton();
  });

  // sound effects on/off
  $("#soundsbuttonclick").click(function () {
    soundManager.toggleSound();
    updateSoundButton();
  });

  updateMusicButton();
  updateSoundButton();

  // sound effects test code
  $(".soundtest").click(function () {
    soundManager.play(this.id);
  });
};

goog.exportSymbol('loadApp', loadApp);
