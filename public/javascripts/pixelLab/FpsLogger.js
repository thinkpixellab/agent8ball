goog.provide('pixelLab.FpsLogger');

/**
 @constructor
 */
pixelLab.FpsLogger = function() {
  this.m_count = 0;
  this.m_values = new Array();
  this.m_sum = 0;
  this.fps = 0;
};

pixelLab.FpsLogger.prototype.AddInterval = function() {
  var currentTick = goog.now();
  if (this.m_lastTick > 0) {
    var secondsPerFrame = currentTick - this.m_lastTick;
    secondsPerFrame /= 1000;
    this.m_count++;
    if (this.m_values.length < pixelLab.FpsLogger.s_size) {
      this.m_values.push(secondsPerFrame);
      this.m_sum += secondsPerFrame;
      this.fps = this.m_count / this.m_sum;
    } else {
      var index = this.m_count % this.m_values.length;
      this.m_sum -= this.m_values[index];
      this.m_values[index] = secondsPerFrame;
      this.m_sum += this.m_values[index];
      this.fps = this.m_values.length / this.m_sum;
    }
  }
  this.m_lastTick = currentTick;

  return this.fps;
};

/**
 @private
 @type {number}
 */
pixelLab.FpsLogger.prototype.m_lastTick = 0;

/**
 @const
 @type {number}
 */
pixelLab.FpsLogger.s_size = 10;
