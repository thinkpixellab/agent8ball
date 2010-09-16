goog.provide('eightball.DroppingBall');

/**
 @constructor
 @param {number} number
 @param {!b2Vec2} ballLocation
 @param {!b2Vec2} pocketLocation
 */
eightball.DroppingBall = function(number, ballLocation, pocketLocation) {
  /**
   @private
   @type {number}
   */
  this.number = number;

  /**
   @private
   @type {!b2Vec2}
   */
  this.m_ballLocation = ballLocation;

  /**
   @private
   @type {!b2Vec2}
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
 @return {!b2Vec2}
*/
eightball.DroppingBall.prototype.GetCurrentLocation = function() {
  var delta = this.m_pocketLocation.Copy();
  delta.Subtract(this.m_ballLocation);
  delta.Multiply(this.GetPercentDropped());
  delta.Add(this.m_ballLocation);
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
