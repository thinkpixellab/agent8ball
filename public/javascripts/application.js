goog.provide('eightball.Application');

goog.require('eightball.Game');
goog.require('eightball.Game.EventType');
goog.require('eightball.Game.GameState');
goog.require('eightball.Music');
goog.require('eightball.PoolTable');
goog.require('eightball.SoundEffectManager');
goog.require('eightball.Stats');

goog.require('goog.array');
goog.require('goog.debug.LogManager');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.i18n.NumberFormat');
goog.require('goog.string');
goog.require('goog.userAgent');

goog.require('pixelLab.DebugDiv');
goog.require('pixelLab.KeyBinding');

var _game;

/**
 @constructor
 @param {boolean=} opt_skipGraphics
 */
eightball.Application = function(opt_skipGraphics) {
  eightball.Stats.load();

  // instance fields
  this.m_lastTickSeconds = 0;
  this.m_lastBars = 29;

  if (eightball.Application._isMac()) {
    $('#timers .digit').css('line-height', '62px');
  }

  // show debug
  // pixelLab.DebugDiv.enable();
  // show the content, hide the loading element
  $('#vignette').delay(500).fadeIn(1000);
  $('#game').delay(500).fadeIn(1000);
  $('#gamecontrolsdisplay').delay(500).fadeIn(1000, function() {
    updateMusicButton();
    updateSoundButton();
  });
  $('#gamecontrolsclick').show();
  $('#cue_canvas').show();

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

  // global elements
  var overlay = $('#overlay');
  var start = $('#start');
  var startmessage = $('#startmessage');
  var resume = $('#resume');
  var gameover = $('#gameover');

  // other globals
  var isExplosionActive = false;
  var lastMusicOnPause = false;
  var skipTyping = false;
  var missionMessage = 'Mission #1146<br/>To: Agent 008<br/>From: Cue<br/><br/><br/>The International Billiards Tournament is being infil- trated by the terrorist organization CHALK.<br/><br/>Do not let them win! Sink as  many balls as possible before the timer runs out.';
  var typingSound = null;

  // event handlers
  gameover.click(function() {
    gameover.fadeOut(400);
    game.reset();
  });

  $('#startoverclick').click(function() {
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

  $('#pauseclick').click(function() {
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

  var poolTable = new eightball.PoolTable($('canvas#demo_canvas')[0], $('canvas#cue_canvas')[0], $('canvas#shadow_canvas')[0], preloadAssets.images);

  // create a game object
  var game = new eightball.Game(poolTable);
  // *DEBUG*
  _game = game;

  goog.events.listen(game, eightball.Game.EventType.TICK, function() {
    if (isExplosionActive) return;
    this._updateTimerVisuals(game.secondsLeft);

    pixelLab.DebugDiv.clear();
    var fmt = new goog.i18n.NumberFormat('#,###.##');
    var str = fmt.format(poolTable.stepsPerSecond());
    goog.debug.LogManager.getRoot().info('FPS: ' + str);
  },
  false, this);

  goog.events.listen(game, eightball.Game.EventType.SCORE, function() {
    var s = game.score;
    if (s == 0) s = '00';
    $('#score').html(s);
    $('#gameoverscore').html(s);
  });

  goog.events.listen(game, eightball.Game.EventType.HIGHSCORE, function() {
    $('#bestscore').html(game.highScore);
  });

  if (opt_skipGraphics) {
    goog.events.listen(game, eightball.Game.EventType.READY, function() {
      game.start();
    });
  } else {
    goog.events.listen(game, eightball.Game.EventType.READY, function() {
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
    });
  }

  goog.events.listen(game, eightball.Game.EventType.END, function() {
    overlay.fadeIn(500);
    gameover.fadeIn(400);
  });

  // timebomb events
  goog.events.listen(game, eightball.Game.EventType.BOMBACTIVATED, function(e) {
    $('#bombicon').fadeIn(200);
    $('#bombsecondstens').fadeIn(200);
    $('#bombsecondsones').fadeIn(200);
    soundManager.play('activate');
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

    var lastTime = this.m_lastTickSeconds;

    // count up the timer
    var timerInterval = setInterval(goog.bind(function() {

      if (lastTime >= game.secondsLeft) {
        clearInterval(timerInterval);
        isExplosionActive = false;
      } else {
        lastTime++;
        this._updateTimerVisuals(lastTime);
      }
    },
    this), 50);
  },
  false, this);

  goog.events.listen(game, eightball.Game.EventType.BOMBEXPLODED, function(e) {
    soundManager.play('explode');
    poolTable.igniteBomb();
    $('#bombicon').fadeOut(1200);
    $('#bombsecondstens').fadeOut(1200);
    $('#bombsecondsones').fadeOut(1200);
    setTimeout(function() {
      // get the location of the ball that exploded
      var bombLocation = poolTable.getBombLocation();
      if (bombLocation) {
        poolTable.explodeBomb();

        // TODO: magic values here. Boo! Make this better
        var left = Math.min(Math.max((bombLocation.x + 300), -60), 660);
        var top = Math.min(Math.max((bombLocation.y + 88), -60), 250);

        $('#boom').css('left', left).css('top', top).show();
      }
    },
    1500);

    isExplosionActive = true;

    var lastTime = this.m_lastTickSeconds;

    // countdown the timer
    var timerInterval = setInterval(function() {

      if (lastTime < game.secondsLeft) {
        clearInterval(timerInterval);
        isExplosionActive = false;
      } else {
        lastTime--;
      }

    },
    50);

  },
  false, this);

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

  //
  // Keyboard shortcuts
  //
  var keyBinding = new pixelLab.KeyBinding();
  goog.events.listen(keyBinding, pixelLab.KeyBinding.TYPE, function(e) {
    $('#alert-div-holder').stop(true, true).show();
    if (e.keybinding == 'h') {
      var map = keyBinding.getMap();

      var table = $('<table>');
      goog.array.forEach(map, function(item, index, array) {
        var row = $('<tr>');
        row.append($('<td>' + item['keybinding'] + '</td>'));
        row.append($('<td>' + item['description'] + '</td>'));
        table.append(row);
      });

      $('#alert-div').html('').append(table);
      $('#alert-div-holder').delay(4000).fadeOut(500);
    } else {
      $('#alert-div').text(e['description']);
      $('#alert-div-holder').delay(2000).fadeOut(500);
    }
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

  keyBinding.add('a', 'Activate bomb', function() {
    var activated = game.activateBomb();
    return activated ? 'Bomb activated' : 'No-op';
  });

  keyBinding.add('d', 'Deactivate bomb', function() {
    var deactivated = game.deactivateBomb();
    return deactivated ? 'Bomb deactivated' : 'No-op';
  });

  keyBinding.add('x', 'Detonate bomb', function() {
    var detonated = game.detonateBomb();
    return detonated ? 'Bomb detonated' : 'No-op';
  });

  keyBinding.add('p', 'Play random sound effect', function() {
    var soundName = soundManager.playRandom();
    return 'Playing ' + soundName;
  });

  keyBinding.add('h', 'Help', goog.nullFunction);

  //
  // Click handlers
  //
  $('#instructionsclick').click(function() {
    game.pause();
    overlay.fadeIn(500);
    $('#howtoplay').fadeIn(200);
    $('#cue_canvas').hide();
  });

  $('#howtoplay').click(function() {
    game.resume();
    overlay.fadeOut(200);
    $('#howtoplay').fadeOut(200);
    $('#cue_canvas').show();
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

/**
 @private
 @param {number} s
 */
eightball.Application.prototype._updateTimerVisuals = function(s) {
  this.m_lastTickSeconds = s;

  var min = Math.floor(s / 60);
  var sec = s % 60;
  var sec_tens = Math.floor(sec / 10);
  var sec_ones = sec % 10;

  $('#minutesremaining').html(min.toString());
  $('#secondsremainingtens').html(sec_tens.toString());
  $('#secondsremainingones').html(sec_ones.toString());

  var bars = 1 + Math.floor((s - 1) / 4);

  if (bars != this.m_lastBars) {
    this.m_lastBars = bars;
    $('#progress').width(Math.min((7 * bars), (7 * 30)));
  }
};

/**
 @private
 */
eightball.Application._isMac = function() {
  var agent = goog.userAgent.getUserAgentString();
  return agent && goog.string.contains(agent, 'Mac');
};
