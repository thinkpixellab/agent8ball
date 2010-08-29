//
goog.provide('eightball.CollisionEvent');

goog.require('goog.events.Event');

/**
* Object representing a collision between balls or a ball and a wall
*
* @extends {goog.events.Event}
* @constructor
* @param {number} avgVelocity
* @param {number} ballCount
* @param {number} wallCount
* @param {Object=} opt_target Reference to the object that is the target of
*     this event. It has to implement the {@code EventTarget} interface
*     declared at {@link http://developer.mozilla.org/en/DOM/EventTarget}.
*/
eightball.CollisionEvent = function (avgVelocity, ballCount, wallCount, opt_target) {

  goog.events.Event.call(this, eightball.CollisionEvent.TYPE, opt_target);

  /**
  @type {number}
  */
  this.avgVelocity = avgVelocity;

  /**
  @type {number}
  */
  this.ballCount = ballCount;

  /**
  @type {number}
  */
  this.wallCount = wallCount;

};
goog.inherits(eightball.CollisionEvent, goog.events.Event);

/**
@const
@type {string}
*/
eightball.CollisionEvent.TYPE = 'eightball.CollisionEvent.TYPE';
