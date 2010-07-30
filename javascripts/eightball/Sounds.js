// a line to make the builder happy
goog.provide('eightball.Sounds');
goog.provide('eightball.SoundEffect');

goog.require('goog.net.cookies');

/**
 @constructor
 @param {string} location
 */
eightball.Sounds = function(location) {
  this.isSoundEnabled = false;

  /**
   @private
   */
  this.m_music = null;

  /**
   @private
   @type {string}
   */
  this.m_location = location;

  var cookieValue = goog.net.cookies.get(eightball.Sounds.s_CookieMusicOn, eightball.Sounds.s_CookieOnOffEnum.ON) == eightball.Sounds.s_CookieOnOffEnum.ON;
  if (cookieValue) {
    this.startMusic();
  }
};

eightball.Sounds.prototype.startMusic = function() {

  this._clearMusic();

  // create the audio element
  this.m_music = document.createElement("audio");
  this.m_music.setAttribute("src", this.m_location);
  this.m_music.setAttribute("loop", "loop");
  this.m_music.play();

  // add it to the document
  document.body.appendChild(this.m_music);

  goog.net.cookies.set(eightball.Sounds.s_CookieMusicOn, eightball.Sounds.s_CookieOnOffEnum.ON);
};

eightball.Sounds.prototype.stopMusic = function() {
  this._clearMusic();
  goog.net.cookies.set(eightball.Sounds.s_CookieMusicOn, eightball.Sounds.s_CookieOnOffEnum.OFF);
};

eightball.Sounds.prototype.isMusicOn = function() {
  return (this.m_music != null);
};
eightball.Sounds.prototype.toggleMusic = function() {
  if (this.isMusicOn()) {
    this.stopMusic();
  } else {
    this.startMusic();
  }
};

/**
 @private
 */
eightball.Sounds.prototype._clearMusic = function() {
  // stop the current music and remove the audio element
  if (this.m_music) {
    this.m_music.pause();
    this.m_music.parentNode.removeChild(this.m_music);
    this.m_music = null;
  }
};

/** 
 @const
 @private
 @type {string}
 */
eightball.Sounds.s_CookieMusicOn = "eightball.Sounds.musicOn";

/** 
 @const
 @private
 @enum {string}
 */
eightball.Sounds.s_CookieOnOffEnum = {
  ON: 'on',
  OFF: 'off'
};

eightball.SoundEffect = function() {

};
