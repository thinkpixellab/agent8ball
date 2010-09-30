goog.provide('eightball.DroppingBall');

/**
 @constructor
 @param {number} number
 @param {!box2d.Vec2} ballLocation
 @param {!box2d.Vec2} pocketLocation
 */
eightball.DroppingBall = function(number, ballLocation, pocketLocation) {
  /**
   @private
   @type {number}
   */
  this.number = number;

  /**
   @private
   @type {!box2d.Vec2}
   */
  this.m_ballLocation = ballLocation;

  /**
   @private
   @type {!box2d.Vec2}
   */
  this.m_pocketLocation = pocketLocation;

  /**
   @private
   @type {number}
   */
  this.m_stepCount = 0;
};

/**
 @return {number}
 */
eightball.DroppingBall.prototype.step = function() {
  this.m_stepCount++;
  return this.m_stepCount;
};

/**
 @return {boolean}
 */
eightball.DroppingBall.prototype.GetIsDropped = function() {
  return this.m_stepCount >= eightball.DroppingBall.c_stepsToDrop;
};

/*
 @return {!box2d.Vec2}
*/
eightball.DroppingBall.prototype.GetCurrentLocation = function() {
  var delta = this.m_pocketLocation.Copy();
  delta.subtract(this.m_ballLocation);
  delta.scale(this.GetPercentDropped());
  delta.add(this.m_ballLocation);
  return delta;
};

/*
 @return {number}
*/
eightball.DroppingBall.prototype.GetPercentDropped = function() {
  return this.m_stepCount / eightball.DroppingBall.c_stepsToDrop;
};

/**
 @const
 @type {number}
 @private
 */
eightball.DroppingBall.c_stepsToDrop = 5;
