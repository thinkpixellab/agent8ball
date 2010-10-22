goog.provide('eightball.SoundEffect');

/**
 @constructor
 @param {!Array.<string>} locations
 @param {number} simulCount
 */
eightball.SoundEffect = function(locations, simulCount) {
  /**
  @private
  @type {!Array.<!Element>}
  */
  this.m_audios = new Array();

  /**
  @private
  @type {number}
  */
  this.m_maxSimul = simulCount;

  /**
  @private
  @type {number}
  */
  this.m_currSimul = 0;

  /**
  @private
  @type {boolean}
  */
  this.m_isWebKit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1;

  // create audio elements for each of the potential simultaneous plays; we add
  // the audio elements directly to the document for maximum browser compatibility
  for (var i = 0; i <= simulCount; i++) {
    this.m_audios.push(eightball.SoundEffect.create(locations));
  }
};

/**
 @return {Element}
 */
eightball.SoundEffect.prototype.play = function() {
  // get the next audio
  this.m_currSimul++;
  this.m_currSimul %= this.m_maxSimul;
  var audio = this.m_audios[this.m_currSimul];
  audio.load();
  audio.play();
  return audio;
};

/**
 @param {!Array.<!Array.<string>>} data
 @return {Element}
*/
eightball.SoundEffect.create = function(data) {
  var holder = document.getElementById(eightball.SoundEffect.s_audioHolderId);
  if (holder === undefined || holder == null) {
    holder = document.createElement('div');
    holder.id = eightball.SoundEffect.s_audioHolderId;
    holder.style['display'] = 'none';
    document.body.appendChild(holder);
  }
  var audio = document.createElement('audio');
  holder.appendChild(audio);
  for (var index in data) {
    var source = document.createElement('source');
    source.src = data[index][0];
    source.type = data[index][1];
    audio.appendChild(source);
  }
  return audio;
};

/**
 @private
 @type {string}
 @const
*/
eightball.SoundEffect.s_audioHolderId = '_audios';
