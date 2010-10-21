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
    var audio = document.createElement('audio');
    this.m_audios[i] = audio;
    document.body.appendChild(audio);
    for (var index in locations) {
      var source = document.createElement('source');
      source.src = locations[index];
      audio.appendChild(source);
    }
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
