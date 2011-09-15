//
goog.provide('eightball.PocketDropEvent');

goog.require('goog.events.Event');

/**
 * Object representing pool ball dropping into a pocket
 *
 * @extends {goog.events.Event}
 * @constructor
 * @param {number} ballNumber
 * @param {Object=} opt_target Reference to the object that is the target of
 *     this event. It has to implement the {@code EventTarget} interface
 *     declared at {@link http://developer.mozilla.org/en/DOM/EventTarget}.
 */
eightball.PocketDropEvent = function(ballNumber, opt_target) {
  goog.events.Event.call(this, eightball.PocketDropEvent.TYPE, opt_target);

  /**
   @type {number}
   */
  this.ballNumber = ballNumber;

};
goog.inherits(eightball.PocketDropEvent, goog.events.Event);

/**
 @const
 @type {string}
 */
eightball.PocketDropEvent.TYPE = 'eightball.PocketDropEvent.TYPE';
