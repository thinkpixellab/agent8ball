goog.provide('pixelLab.fpsLogger');

/**
 @constructor
 */
pixelLab.fpsLogger = function() {
  this.m_count = 0;
  this.m_values = new Array();
  this.m_sum = 0;
  this.fps = 0;
};

/**
  @param {number} secondsPerFrame The seconds for the frame being added
*/
pixelLab.fpsLogger.prototype.AddInterval = function(secondsPerFrame){
  this.m_count++;
  if(this.m_values.length < pixelLab.fpsLogger.s_size){
    this.m_values.push(secondsPerFrame);
    this.m_sum += secondsPerFrame;
    this.fps = this.m_count / this.m_sum;
  }
  else{
    var index = this.m_count % this.m_values.length;
    this.m_sum -= this.m_values[index];
    this.m_values[index] = secondsPerFrame;
    this.m_sum += this.m_values[index];
    this.fps = this.m_values.length / this.m_sum;
  }
  
  return this.fps;
};

/**
 @const
 @type {number}
 */
pixelLab.fpsLogger.s_size = 10;
