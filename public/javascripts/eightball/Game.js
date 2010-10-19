goog.provide('eightball.Game');
goog.provide('eightball.Game.EventType');
goog.provide('eightball.Game.GameState');

goog.require('eightball.Cookies');
goog.require('eightball.PoolTable');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug.LogManager');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.object');

/**
 @constructor
 @extends {goog.events.EventTarget}
 @param {!eightball.PoolTable} poolTable
 */
eightball.Game = function(poolTable) {
  goog.events.EventTarget.call(this);

  /**
   @private
   */
  this.m_timer = null;

  /**
   @private
   @type {number}
  */
  this.m_bombNumber = -1;

  /**
   @private
   @type {!eightball.PoolTable}
   */
  this.m_poolTable = poolTable;

  /**
   @private
   @type {boolean}
   */
  this.m_bombDemoMode = false;

  goog.events.listen(poolTable, eightball.PocketDropEvent.TYPE, this._pooltable_pocketDrop, undefined, this);
  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.BALL, this._pooltable_ballHit, undefined, this);
  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.CUEBALL, this._pooltable_ballHit, undefined, this);
  goog.events.listen(poolTable, eightball.CollisionEvent.EventType.BREAK, this._pooltable_ballHit, undefined, this);

  this.reset();

};
goog.inherits(eightball.Game, goog.events.EventTarget);

eightball.Game.prototype.reset = function() {

  // reset the timer and our clock
  if (this.m_timer) {
    this.m_timer.dispose();
    this.secondsLeft = eightball.Game.s_gameSeconds;
  }

  this._resetTable();

  this.secondsLeft = eightball.Game.s_gameSeconds;
  this._dispatchGameEvent(eightball.Game.EventType.TICK);

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
    this._dispatchGameEvent(eightball.Game.EventType.TICK);
  }

  // create a new timer
  this.m_timer = new goog.Timer(eightball.Game._inMs(1));

  // start the timer
  this.m_timer.start();
  goog.events.listen(this.m_timer, goog.Timer.TICK, this._tickAction, undefined, this);

  // set the game state
  this.gameState = eightball.Game.States.STARTED;

};

eightball.Game.prototype.pause = function() {
  if (this.gameState == eightball.Game.States.STARTED) {
    this.m_poolTable.pause();
    this.gameState = eightball.Game.States.PAUSED;
    this._dispatchGameEvent(eightball.Game.EventType.PAUSE);
  }
};

eightball.Game.prototype.resume = function() {
  if (this.gameState == eightball.Game.States.PAUSED) {
    this.m_poolTable.resume();
    this.gameState = eightball.Game.States.STARTED;
    this._dispatchGameEvent(eightball.Game.EventType.RESUME);
  }
};

// TODO: make this a toggle bomb demo mode
eightball.Game.prototype.setBombDemoMode = function() {
  this.m_bombDemoMode = true;
};

/**
 @return {boolean}
 */
eightball.Game.prototype.activateBomb = function() {
  if (!this._isBombFound && this.m_poolTable.hasBall(this.m_bombNumber)) {
    goog.asserts.assert(this.gameState == eightball.Game.States.STARTED);
    this._isBombFound = true;
    this._isBombActive = true;
    this.m_poolTable.setBombNumber(this.m_bombNumber);
    this._dispatchGameEvent(eightball.Game.EventType.BOMBACTIVATED);
    return true;
  } else {
    return false;
  }
};

/**
 @return {boolean}
 */
eightball.Game.prototype.deactivateBomb = function() {
  if (this._isBombActive) {
    goog.asserts.assert(this.gameState == eightball.Game.States.STARTED);
    this._isBombActive = false;
    this.m_bombNumber = -1;
    this.secondsLeft += 30;
    // only needed if deactivation happens via code, not sinking the ball
    this.m_poolTable.clearBombNumber();
    this._dispatchGameEvent(eightball.Game.EventType.BOMBDEACTIVATED);
    return true;
  }
  else {
    return false;
  }
};

/**
 @return {boolean}
 */
eightball.Game.prototype.detonateBomb = function() {
  if (this._isBombActive) {
    goog.asserts.assert(this.gameState == eightball.Game.States.STARTED);
    this.bombSecondsLeft = Math.min(2, this.bombSecondsLeft);
    return true;
  }
  else {
    return false;
  }
};
/**
 @param {number} points
 */
eightball.Game.prototype.addPoints = function(points) {
  this.score += points;
  this._dispatchGameEvent(eightball.Game.EventType.SCORE);

  if (this.score > this.highScore) {
    this.highScore = this.score;
    this._saveHighScore(this.highScore);
    this._dispatchGameEvent(eightball.Game.EventType.HIGHSCORE);
  }
};

/**
 @private
*/
eightball.Game.prototype._resetTable = function() {
  this.bombSecondsLeft = eightball.Game.s_bombSeconds + 2;
  if (this.m_bombDemoMode) {
    this.m_bombNumber = 1;
  } else {
    this.m_bombNumber = goog.math.randomInt(15) + 1;
  }
  this._isBombFound = false;
  this._isBombActive = false;
  this.m_poolTable.rackEm();
  this.m_poolTable.resume();
  this.m_poolTable.clearBombNumber();
};

/**
 @private
 @param {number} highScore
 */
eightball.Game.prototype._saveHighScore = function(highScore) {
  eightball.Cookies.set(eightball.Game.s_CookieGameHighScore, highScore);
};

/**
 @private
 */
eightball.Game.prototype._loadHighScore = function() {
  var highScoreValue = goog.net.cookies.get(eightball.Game.s_CookieGameHighScore, '500');
  return highScoreValue;
};

/**
 @private
 */
eightball.Game.prototype._tickAction = function() {
  if (this.gameState == eightball.Game.States.STARTED) {

    this.secondsLeft--;

    if (this._isBombActive) {

      this.bombSecondsLeft--;
      this._dispatchGameEvent(eightball.Game.EventType.BOMBTICK);

      if (this.bombSecondsLeft <= 0) {

        // update the game clock by removing 30 seconds but making sure we have at least
        // 10 seconds left on the clock (even if that theoretically would increase the
        // the game time--because we count on this to clean up after the explosion)
        this.secondsLeft -= 30;
        if (this.secondsLeft < 10) this.secondsLeft = 10;

        this._dispatchGameEvent(eightball.Game.EventType.BOMBEXPLODED);
        this._isBombActive = false;
      }
    }

    if (this.secondsLeft <= 0) {
      this.secondsLeft = 0;
      this._dispatchGameEvent(eightball.Game.EventType.TICK);
      this.m_timer.stop();
      this.m_poolTable.pause();
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
 @param {!eightball.PocketDropEvent} e
 */
eightball.Game.prototype._pooltable_pocketDrop = function(e) {
  if (e.ballNumber != 0) {
    goog.debug.LogManager.getRoot().info('Pocket drop: ' + e.ballNumber);
    this.addPoints(100);
  }

  if (this._isBombFound && e.ballNumber == this.m_bombNumber) {
    var deactivated = this.deactivateBomb();
    goog.asserts.assert(deactivated);
  }
};

/**
 @private
 */
eightball.Game.prototype._pooltable_ballHit = function(e) {
  if (!this._isBombFound) {
    if ((e.ballNumber1 == 0 && e.ballNumber2 == this.m_bombNumber) || (e.ballNumber2 == 0 && e.ballNumber1 == this.m_bombNumber)) {
      var activated = this.activateBomb();
      goog.asserts.assert(activated, 'should always activate bomb in this context');
    }
  }
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
  HIGHSCORE: 'highscore',

  /**
   * Dispatched when the bomb has been activated.
   */
  BOMBACTIVATED: 'bombactivated',

  /**
   * Dispatched when the bomb timer ticks.
   */
  BOMBTICK: 'bombtick',

  /**
   * Dispatched when the bomb is deactivated by the user.
   */
  BOMBDEACTIVATED: 'bombdeactivated',

  /**
   * Dispatched when the bomb explodes.
   */
  BOMBEXPLODED: 'bombexploded'

};

/**
 @private
 @const
 @type {number}
 */
eightball.Game.s_gameSeconds = 120;

/**
 @private
 @const
 @type {number}
 */
eightball.Game.s_bombSeconds = 30;

/**
 @const
 @private
 @type {string}
 */
eightball.Game.s_CookieGameHighScore = 'eightball.Game.highScore';
