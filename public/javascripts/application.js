// *******************************************************************************
// APP LOGIC
// *******************************************************************************
goog.provide('eightball.application');

goog.require('eightball.Game');
goog.require('eightball.Game.EventType');
goog.require('eightball.Game.GameState');
goog.require('eightball.Music');
goog.require('eightball.PoolTable');
goog.require('eightball.SoundEffectManager');

goog.require('goog.debug.LogManager');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.i18n.NumberFormat');
goog.require('goog.string');
goog.require('goog.userAgent');

goog.require('pixelLab.DebugDiv');
goog.require('pixelLab.KeyBinding');

var _game;

/*
@param {boolean=} skip_graphics
*/
eightball.application.loadApp = function(skip_graphics) {

  if (eightball.application._isMac()) {
    $('#timers .digit').css('line-height', '62px');
  }

  // show debug
  //pixelLab.DebugDiv.enable();
  // show the content, hide the loading element
  $('#vignette').delay(500).fadeIn(1000);
  $('#game').delay(500).fadeIn(1000);
  $('#gamecontrolsdisplay').delay(500).fadeIn(1000, function() {
    updateMusicButton();
    updateSoundButton();
  });
  $('#gamecontrolsclick').delay(500).fadeIn(1000);
  $('#cue_canvas').delay(500).fadeIn(1000);

  //
  // MUSIC
  //
  var musicManager = new eightball.Music(preloadAssets.audios['theme']);

  var updateMusicButton = function() {
    if (musicManager.isMusicOn()) {
      $('#musicbutton .on').fadeIn(200);
    } else {
      $('#musicbutton .on').fadeOut(200);
    }
  };

  goog.events.listen(musicManager, eightball.Music.STATE_CHANGE_EVENT_TYPE, updateMusicButton);

  // Sound
  var soundManager = new eightball.SoundEffectManager(preloadAssets.audios);

  var updateSoundButton = function() {
    if (soundManager.isSoundOn()) {
      $('#soundsbutton .on').fadeIn(200);
    } else {
      $('#soundsbutton .on').fadeOut(200);
    }
  };

  goog.events.listen(soundManager, eightball.SoundEffectManager.STATE_CHANGE_EVENT_TYPE, updateSoundButton);

  soundManager.add('activate', 1);
  soundManager.add('ball', 5);
  soundManager.add('bombtick', 1);
  soundManager.add('bombtickfast', 1);
  soundManager.add('bombtickslow', 1);
  soundManager.add('break', 1);
  soundManager.add('cuehit', 1);
  soundManager.add('cuestick', 1);
  soundManager.add('deactivate', 1);
  soundManager.add('explode', 1);
  soundManager.add('pocket', 2);
  soundManager.add('quietball', 2);
  soundManager.add('quietwall', 2);
  soundManager.add('typing', 1);
  soundManager.add('wall', 3);

  window.soundManager = soundManager;

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
  var missionMessage = 'Mission #1146<br/>To: Agent 008<br/>From: Cue<br/><br/><br/>The International Billiards Tournament is being infil- trated by the terrorist organization CHALK.<br/><br/>Do not let them win! Sink as  many balls as possible before the timer runs out.';
  var typingSound = null;

  // event handlers
  var tickAction = function() {

    if (isExplosionActive) return;
    _updateTimerVisuals(game.secondsLeft);

    pixelLab.DebugDiv.clear();
    var fmt = new goog.i18n.NumberFormat('#,###.##');
    var str = fmt.format(poolTable.stepsPerSecond());
    goog.debug.LogManager.getRoot().info('FPS: ' + str);
  };

  var _updateTimerVisuals = function(s) {

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

  var highScoreAction = function() {
    $('#bestscore').html(game.highScore);
  };

  var scoreAction = function() {
    var s = game.score;
    if (s == 0) s = '00';
    $('#score').html(s);
    $('#gameoverscore').html(s);
  };

  var readyAction = function() {
    overlay.fadeIn(1000);

    $('#bombicon').hide();
    $('#bombsecondstens').hide();
    $('#bombsecondsones').hide();
    $('#boom').hide();

    var msg = missionMessage;
    var index = 0;

    start.delay(800).fadeIn(400, function() {

      if (!skipTyping) {
        typingSound = soundManager.play('typing');
        var interval = setInterval(function() {

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
    readyAction = function() {
      game.start();
    };
  }

  var endAction = function() {
    overlay.fadeIn(500);
    gameover.fadeIn(400);
  };

  gameover.click(function() {
    gameover.fadeOut(400);
    game.reset();
  });

  startover.click(function() {
    game.reset();
  });

  start.click(function() {
    start.fadeOut(100);
    overlay.fadeOut(400);
    game.start();

    // clean up the typing
    skipTyping = true;
    if (typingSound) typingSound.pause();
    startmessage.html(missionMessage);

  });

  pause.click(function() {
    game.pause();
    overlay.fadeIn(400);
    resume.fadeIn(400);

    lastMusicOnPause = musicManager.isMusicOn();
    if (lastMusicOnPause) {
      musicManager.stopMusic();
    }
  });

  resume.click(function() {
    overlay.fadeOut(400);
    resume.fadeOut(400, function() {
      game.resume();
    });

    if (lastMusicOnPause) {
      musicManager.startMusic();
    }

  });

  $('#gameoverfacebook').click(function(e) {
    e.stopPropagation();
    window.open('http://www.facebook.com/sharer.php?u=http%3A%2F%2Fagent8ball.com&t=I%20just%20scored%20' + game.score + '%20points%20on%20Agent%20008%20Ball!');
  });

  $('#gameovertwitter').click(function(e) {
    e.stopPropagation();
    window.open('http://twitter.com/home?status=Hey%2C%20%40agent8ball!%20I%20just%20scored%20' + game.score + '%20points%20on%20http%3A%2F%2Fagent8ball.com.%20Beat%20that!');
  });

  var poolTable = new eightball.PoolTable(canvasElement, cueCanvasElement, shadowCanvasElement, preloadAssets.images);

  // create a game object
  var game = new eightball.Game(poolTable);
  // *DEBUG*
  _game = game;

  // game events (TODO: make these inline)
  goog.events.listen(game, eightball.Game.EventType.TICK, tickAction);
  goog.events.listen(game, eightball.Game.EventType.SCORE, scoreAction);
  goog.events.listen(game, eightball.Game.EventType.HIGHSCORE, highScoreAction);
  goog.events.listen(game, eightball.Game.EventType.READY, readyAction);
  goog.events.listen(game, eightball.Game.EventType.END, endAction);

  // timebomb events
  goog.events.listen(game, eightball.Game.EventType.BOMBACTIVATED, function(e) {

    $('#bombicon').fadeIn(200);
    $('#bombsecondstens').fadeIn(200);
    $('#bombsecondsones').fadeIn(200);
    soundManager.play('activate');

    poolTable.setBombNumber(game.bombNumber);

  });

  goog.events.listen(game, eightball.Game.EventType.BOMBTICK, function(e) {

    var sec = game.bombSecondsLeft % 60;
    if (sec > 30) sec = 30;
    var sec_tens = Math.floor(sec / 10);
    var sec_ones = sec % 10;

    $('#bombsecondstens').html(String(sec_tens));
    $('#bombsecondsones').html(String(sec_ones));

    if (sec > 19) soundManager.play('bombtickslow');
    else if (sec <= 10) soundManager.play('bombtickfast');
    else if (sec >= 1) soundManager.play('bombtick');

    if (sec == 19 || sec == 10) poolTable.increaseBombPulse();


  });

  goog.events.listen(game, eightball.Game.EventType.BOMBDEACTIVATED, function(e) {
    // hide the timer
    soundManager.play('deactivate');

    $('#bombicon').fadeOut(1200);
    $('#bombsecondstens').fadeOut(1200);
    $('#bombsecondsones').fadeOut(1200);


    var lastTime = lastTickSeconds;

    // count up the timer
    var timerInterval = setInterval(function() {

      if (lastTime >= game.secondsLeft) {
        clearInterval(timerInterval);
        isExplosionActive = false;
      }
      else {
        lastTime++;
        _updateTimerVisuals(lastTime);
      }

    }, 50);

  });

  goog.events.listen(game, eightball.Game.EventType.BOMBEXPLODED, function(e) {
    soundManager.play('explode');
    poolTable.igniteBomb();
    $('#bombicon').fadeOut(1200);
    $('#bombsecondstens').fadeOut(1200);
    $('#bombsecondsones').fadeOut(1200);
    setTimeout(function() {
      // get the location of the ball that exploded
      var bombLocation = poolTable.getBallLocation(game.bombNumber);
      if (bombLocation) {

        var left = Math.min(Math.max((bombLocation.x + 300), -60), 660);
        var top = Math.min(Math.max((bombLocation.y + 88), -60), 250);

        poolTable.removeBomb();

        document.getElementById('boom').style.left = left + 'px';
        document.getElementById('boom').style.top = top + 'px';
        //boom.css("left", left + "px");
        //boom.css("top", top + "px");
        $('#boom').show();
      }
    }, 1500);

    isExplosionActive = true;

    var lastTime = lastTickSeconds;

    // countdown the timer
    var timerInterval = setInterval(function() {

      if (lastTime < game.secondsLeft) {
        clearInterval(timerInterval);
        isExplosionActive = false;
      }
      else {
        lastTime--;
        _updateTimerVisuals(lastTime);
      }

    }, 50);


  });


  // cuestick events
  goog.events.listen(poolTable, eightball.PoolTable.EventType.CUESTICK_HIT_START, function() {
    $('#gamecontrolsclick').hide();
  });


  goog.events.listen(poolTable, eightball.PoolTable.EventType.CUESTICK_HIT_STOP, function() {
    $('#gamecontrolsclick').show();
  });


  // sound events
  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.CUESTICK, function(e) {
    soundManager.play('cuestick');
  });

  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.BREAK, function(e) {
    soundManager.play('break');
  });

  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.CUEBALL, function(e) {
    soundManager.play('cuehit');
  });

  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.BALL, function(e) {
    goog.debug.LogManager.getRoot().info('velocity: ' + e.velocity);

    if (e.velocity > 80) {
      soundManager.play('ball');
    } else if (e.velocity > 20) {
      soundManager.play('quietball');
    }
  });

  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.WALL, function(e) {
    if (e.velocity > 120) {
      soundManager.play('wall');
    } else if (e.velocity > 40) {
      soundManager.play('quietwall');
    }
  });

  goog.events.listen(poolTable, eightball.PocketDropEvent.TYPE, function(e) {
    soundManager.play('pocket');
  });

  // calling reset after the game has been loaded fires the events we
  // need to initialize everything for game play
  game.reset();

  var updatePoolTableLayout = function() {
    var width = $(window).width();
    var height = $(window).height();
    poolTable.updateLayout(width, height);
  };

  $(window).resize(updatePoolTableLayout);
  updatePoolTableLayout();

  var keyBinding = new pixelLab.KeyBinding();
  goog.events.listen(keyBinding, pixelLab.KeyBinding.TYPE, function(e) {
    var div = jQuery('#KeyBindingAlertDiv');
    div.stop(true, true).show();
    div.text(e['description']);
    div.delay(2000).fadeOut(500);
  });

  keyBinding.add('r', 'Restart game', function() {
    game.reset();
  });

  keyBinding.add('b', 'Bomb demo mode', function() {
    game.setBombDemoMode();
    game.reset();
  });

  keyBinding.add('e', 'End game early', function() {
    if (game.gameState == eightball.Game.States.STARTED) {
      game.secondsLeft = 5;
    }
  });

  keyBinding.add('m', 'Toggle music', function() {
    musicManager.toggleMusic();
    var state = musicManager.isMusicOn() ? 'on' : 'off';
    return 'Game music is now ' + state;
  });

  keyBinding.add('s', 'Toggle sound', function() {
    soundManager.toggleSound();
    var state = soundManager.isSoundOn() ? 'on' : 'off';
    return 'Game sounds are now ' + state;
  });

  $('#instructionsclick').click(function() {
    game.pause();
    overlay.fadeIn(500);
    $('#howtoplay').fadeIn(200);
    $('#cue_canvas').fadeOut(200);
  });

  $('#howtoplay').click(function() {
    game.resume();
    overlay.fadeOut(200);
    $('#howtoplay').fadeOut(200);
    $('#cue_canvas').fadeIn(200);
  });

  // music on/off
  $('#musicbuttonclick').click(function() {
    musicManager.toggleMusic();
  });

  // sound effects on/off
  $('#soundsbuttonclick').click(function() {
    soundManager.toggleSound();
  });
};

eightball.application._isMac = function() {
  var agent = goog.userAgent.getUserAgentString();
  return agent && goog.string.contains(agent, 'Mac');
};

goog.exportSymbol('loadApp', eightball.application.loadApp);
