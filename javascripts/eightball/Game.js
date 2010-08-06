// a line to make the builder happy
goog.provide('eightball.Game');
goog.provide('eightball.Game.EventType');
goog.provide('eightball.Game.GameState');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.net.cookies');

/**
 @constructor
 @extends {goog.events.EventTarget}
 */
eightball.Game = function () {

  /**
  @private
  */
  this.m_timer = null;
  this.reset();

};
goog.inherits(eightball.Game, goog.events.EventTarget);

eightball.Game.prototype.reset = function () {

  // reset the timer and our clock
  if (this.m_timer) {
    this.m_timer.dispose();
    this.secondsLeft = eightball.Game.s_gameSeconds;
  }

  this.secondsLeft = eightball.Game.s_gameSeconds;
  this.score = 0;

  this.highScore = this._loadHighScore();
  this._dispatchGameEvent(eightball.Game.EventType.HIGHSCORE);

  this.gameState = eightball.Music.GameState.READY;
  this._dispatchGameEvent(eightball.Game.EventType.READY);

};

eightball.Game.prototype.start = function() {

  // reset the timer and our clock
  if (this.m_timer) {
    this.m_timer.dispose();
    this.secondsLeft = eightball.Game.s_gameSeconds;
  }

  // create a new timer
  this.m_timer = new goog.Timer(eightball.Game._inMs(1));

  // start the timer
  this.m_timer.start();
  goog.events.listen(this.m_timer, goog.Timer.TICK, this._tickAction, undefined, this);

  // set the game state
  this.gameState = eightball.Music.GameState.STARTED;

};

eightball.Game.prototype.togglePaused = function() {

  if (this.gameState == eightball.Music.GameState.STARTED) {
    this.gameState = eightball.Music.GameState.PAUSED;
    this._dispatchGameEvent(eightball.Game.EventType.PAUSE);
  } else if (this.gameState == eightball.Music.GameState.PAUSED) {
    this.gameState = eightball.Music.GameState.STARTED;
    this._dispatchGameEvent(eightball.Game.EventType.RESUME);
  }
  // TODO: else?
};

eightball.Game.prototype._loadHighScore = function () {
  var highScoreValue = goog.net.cookies.get(eightball.Game.s_CookieGameHighScore, '1000');
  return highScoreValue;
};

eightball.Game.prototype._tickAction = function() {
  if (this.gameState == eightball.Music.GameState.STARTED) {

    this.secondsLeft--;

    if (this.secondsLeft <= 0) {
      this.m_timer.stop();
      this.gameState = eightball.Music.GameState.ENDED;
      this._dispatchGameEvent(eightball.Game.EventType.END);
    } else {
      this._dispatchGameEvent(eightball.Game.EventType.TICK);
    }

  }
};

/**
  @private
*/
eightball.Game.prototype._dispatchGameEvent = function(type) {
  this.dispatchEvent(new goog.events.Event(type, this));
};

/**
  @private
  @param {number} seconds
  @returns {number}
*/
eightball.Game._inMs = function(seconds) {
  return seconds * 1000;
};

/** 
 * Possible game states
 * @enum {string}
 */
eightball.Music.GameState = {
  /**
   * The game is ready to be played.
   */
  READY: 'ready',

  /**
   * The game has been started and is in play.
   */
  STARTED: 'started',

  /**
   * The game has been started and is in play.
   */
  PAUSED: 'paused',

  /**
   * The game has ended.
   */
  ENDED: 'ended'

};

/**
 * Events fired by the game.
 * @enum {string}
 */
eightball.Game.EventType = {
  /**
  * Dispatched when the game is ready to be started.
  */
  READY: 'ready',

  /**
   * Dispatched when the game is started.
   */
  START: 'start',

  /**
   * Dispatched when the game is paused.
   */
  PAUSE: 'pause',

  /**
   * Dispatched when the game is resumed aftering being paused.
   */
  RESUME: 'resume',

  /**
   * Dispatched when the game comes to an end (because the timer has reached a value of 0).
   */
  END: 'end',

  /**
   * Dispatched when the game timer is updated. Occurs once per second.
   */
  TICK: 'tick',

  /**
   * Dispatched when the score changes.
   */
  SCORE: 'score',

  /**
   * Dispatched when the score changes.
   */
  HIGHSCORE: 'highscore'
};

/**
 @private
 @const
 @type {number}
 */
eightball.Game.s_gameSeconds = 120;

/** 
 @const
 @private
 @type {string}
 */
eightball.Game.s_CookieGameHighScore = "eightball.Game.highScore";