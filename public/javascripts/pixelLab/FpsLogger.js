goog.provide('pixelLab.FpsLogger');

/**
 @constructor
 */
pixelLab.FpsLogger = function() {
  /**
   @private
   @type {number}
   */
  this.m_count = 0;

  /**
   @type {!Array.<number>}
   */
  this.m_values = new Array();
  /**
   @private
   @type {number}
   */
  this.m_sum = 0;
  /**
   @private
   @type {number}
   */
  this.m_lastTick = 0;

  /**
   @private
   @type {number}
   */
  this.m_fps = 0;
};

/**
 @return {number}
 */
pixelLab.FpsLogger.prototype.AddInterval = function() {
  var currentTick = goog.now();
  if (this.m_lastTick > 0) {
    var secondsPerFrame = currentTick - this.m_lastTick;
    secondsPerFrame /= 1000;
    this.m_count++;
    if (this.m_values.length < pixelLab.FpsLogger.s_size) {
      this.m_values.push(secondsPerFrame);
      this.m_sum += secondsPerFrame;
      this.m_fps = this.m_count / this.m_sum;
    } else {
      var index = this.m_count % this.m_values.length;
      this.m_sum -= this.m_values[index];
      this.m_values[index] = secondsPerFrame;
      this.m_sum += this.m_values[index];
      this.m_fps = this.m_values.length / this.m_sum;
    }
  }
  this.m_lastTick = currentTick;

  return this.m_fps;
};

/**
 @return {number}
 */
pixelLab.FpsLogger.prototype.getFps = function() {
  return this.m_fps;
};

/**
 @const
 @type {number}
 */
pixelLab.FpsLogger.s_size = 10;
