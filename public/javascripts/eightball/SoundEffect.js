goog.provide('eightball.SoundEffect');

/**
 @constructor
 @param {string} location
 @param {number} simulCount
 */
eightball.SoundEffect = function(location, simulCount) {

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
    document.body.appendChild(audio);
    this.m_audios[i] = audio;
    this.m_audios[i].location = location;
    this.loadAudio(audio, location);
  }
};

eightball.SoundEffect.prototype.loadAudio = function(audio, location) {
  audio.setAttribute('src', location);
  audio.load();
};

eightball.SoundEffect.prototype.play = function() {

  // get the next audio
  this.m_currSimul++;
  if (this.m_currSimul >= this.m_maxSimul) {
    this.m_currSimul = 0;
  }
  var audio = this.m_audios[this.m_currSimul];


  // if this is a webkit browser, we need to reload the audio every time we
  // play it (otherwise webkit has a hard time with short (<1s) sounds)
  if (this.m_isWebKit) {
    var location = this.m_audios[this.m_currSimul].location;
    this.loadAudio(audio, location);
  }

  // make sure we're at the start and then play
  audio.play();

  return audio;

};
