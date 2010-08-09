// a line to make the builder happy
goog.provide('eightball.Game');
goog.provide('eightball.Game.EventType');
goog.provide('eightball.Game.GameState');

goog.require('eightball.PoolTable');

goog.require('goog.debug.LogManager');
goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.object');
goog.require('goog.net.cookies');

/**
 @constructor
 @extends {goog.events.EventTarget}
 @param {!eightball.PoolTable} poolTable
 */
eightball.Game = function(poolTable) {

  /**
   @private
   */
  this.m_timer = null;

  /**
   @private
   @type {!eightball.PoolTable}
   */
  this.m_poolTable = poolTable;

  goog.events.listen(this.m_poolTable, eightball.PocketDropEvent.TYPE, this._pooltable_pocketDrop, undefined, this);

  this.reset();
};
goog.inherits(eightball.Game, goog.events.EventTarget);

eightball.Game.prototype.reset = function() {

  // reset the timer and our clock
  if (this.m_timer) {
    this.m_timer.dispose();
    this.secondsLeft = eightball.Game.s_gameSeconds;
  }

  this.secondsLeft = eightball.Game.s_gameSeconds;
  this._dispatchGameEvent(eightball.Game.EventType.TICK);

  this.m_poolTable.rackEm();

  this.score = 0;
  this._dispatchGameEvent(eightball.Game.EventType.SCORE);

  this.highScore = this._loadHighScore();
  this._dispatchGameEvent(eightball.Game.EventType.HIGHSCORE);

  this.gameState = eightball.Game.States.READY;
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
  this.gameState = eightball.Game.States.STARTED;

};

eightball.Game.prototype.togglePaused = function() {

  if (this.gameState == eightball.Game.States.STARTED) {
    this.gameState = eightball.Game.States.PAUSED;
    this._dispatchGameEvent(eightball.Game.EventType.PAUSE);
  } else if (this.gameState == eightball.Game.States.PAUSED) {
    this.gameState = eightball.Game.States.STARTED;
    this._dispatchGameEvent(eightball.Game.EventType.RESUME);
  }
  // TODO: else?
};

eightball.Game.prototype.addPoints = function(points) {

  this.score += points;
  this._dispatchGameEvent(eightball.Game.EventType.SCORE);

  if (this.score > this.highScore) {
    this.highScore = this.score;
    this._saveHighScore(this.highScore);
    this._dispatchGameEvent(eightball.Game.EventType.HIGHSCORE);
  }

};

eightball.Game.prototype._saveHighScore = function(highScore) {
  goog.net.cookies.set(eightball.Game.s_CookieGameHighScore, highScore, 7776000);
};

eightball.Game.prototype._loadHighScore = function() {
  var highScoreValue = goog.net.cookies.get(eightball.Game.s_CookieGameHighScore, '1000');
  return highScoreValue;
};

eightball.Game.prototype._tickAction = function() {
  if (this.gameState == eightball.Game.States.STARTED) {

    this.secondsLeft--;

    if (this.secondsLeft <= 0) {
      this.m_timer.stop();
      this.gameState = eightball.Game.States.ENDED;
      this._dispatchGameEvent(eightball.Game.EventType.END);
    } else {
      this._dispatchGameEvent(eightball.Game.EventType.TICK);
    }

  }
};

/**
 @private
 @param {!eightball.Game.EventType} type
 */
eightball.Game.prototype._dispatchGameEvent = function(type) {
  this.dispatchEvent(new goog.events.Event(type, this));
};

/**
 @private
 */
eightball.Game.prototype._pooltable_pocketDrop = function(e) {
  goog.debug.LogManager.getRoot().info("Pocket drop: " + e.ballNumber);
  this.addPoints(100);
};

/**
 @private
 @param {number} seconds
 @return {number}
 */
eightball.Game._inMs = function(seconds) {
  return seconds * 1000;
};

/** 
 * Possible game states
 * @enum {string}
 */
eightball.Game.States = {
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
