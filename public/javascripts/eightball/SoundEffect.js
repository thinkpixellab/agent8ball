goog.provide('eightball.SoundEffect');

/**
 @constructor
 @param {!Array.<string>} locations
 @param {number} simulCount
 */
eightball.SoundEffect = function(locations, simulCount) {
  /**
  @private
  */
  this.m_audios = new Array();

  /**
  @private
  */
  this.m_maxSimul = simulCount;

  /**
  @private
  */
  this.m_currSimul = 0;

  /**
  @private
  */
  this.m_isWebKit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1;

  // create audio elements for each of the potential simultaneous plays; we add
  // the audio elements directly to the document for maximum browser compatibility
  for (var i = 0; i <= simulCount; i++) {
    this.m_audios[i] = eightball.SoundEffect.create(locations);
  }
};

eightball.SoundEffect.prototype.play = function() {
  // get the next audio
  this.m_currSimul++;
  if (this.m_currSimul >= this.m_maxSimul) {
    this.m_currSimul = 0;
  }
  var audio = this.m_audios[this.m_currSimul];
  audio.load();
  audio.play();
  return audio;
};

/**
 @param {!Array.<!Array.<string>>} data
*/
eightball.SoundEffect.create = function(data) {
  var audio = document.createElement('audio');
  document.body.appendChild(audio);
  for (var index in data) {
    var source = document.createElement('source');
    source.src = data[index][0];
    source.type = data[index][1];
    audio.appendChild(source);
  }
  return audio;
};
