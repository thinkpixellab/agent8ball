goog.provide('eightball.CollisionEvent');

goog.require('goog.events.Event');

/**
 * Object representing a collision between balls or a ball and a wall
 *
 * @extends {goog.events.Event}
 * @constructor
 * @param {number} velocity
 * @param {string} eventType
 * @param {number} ballNumber1
 * @param {number} ballNumber2
 * @param {!eightball.PoolTable} poolTable
 */
eightball.CollisionEvent = function(velocity, eventType, ballNumber1, ballNumber2, poolTable) {
  goog.events.Event.call(this, eventType, poolTable);

  /**
   @type {number}
   */
  this.velocity = velocity;

  /**
  @type {number}
  */
  this.ballNumber1 = ballNumber1;

  /**
  @type {number}
  */
  this.ballNumber2 = ballNumber2;

};
goog.inherits(eightball.CollisionEvent, goog.events.Event);

/**
 * Events fired by the game.
 * @enum {string}
 */
eightball.CollisionEvent.EventType = {
  /**
   * Dispatched when the cue hits the cue ball
   */
  CUESTICK: 'CUESTICK',

  /**
   * Dispatched when the cue ball first hits another ball after the ball has been put in play in a turn
   */
  CUEBALL: 'CUEBALL',

  /**
   * Dispatched on the first "break" of a game
   */
  BREAK: 'BREAK',

  /**
   * Dispatched when two balls collide
   */
  BALL: 'BALL',

  /**
   * Dispatched when a ball collides with a wall
   */
  WALL: 'WALL'
};
