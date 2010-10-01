goog.provide('eightball.Music');

goog.require('eightball.Cookies');

/**
 @constructor
 @param {string} location
 */
eightball.Music = function(location) {

  /**
   @private
   */
  this.m_music = null;

  /**
   @private
   @type {string}
   */
  this.m_location = location;

  var cookieValue = goog.net.cookies.get(eightball.Music.s_CookieMusicOn, eightball.Music.s_CookieOnOffEnum.ON) == eightball.Music.s_CookieOnOffEnum.ON;
  if (cookieValue) {
    this.startMusic();
  }
};

eightball.Music.prototype.startMusic = function() {

  this._clearMusic();

  // create the audio element
  this.m_music = document.createElement('audio');
  this.m_music.setAttribute('src', this.m_location);
  this.m_music.setAttribute('loop', 'loop');
  this.m_music.play();

  // add it to the document
  document.body.appendChild(this.m_music);

  eightball.Cookies.set(eightball.Music.s_CookieMusicOn, eightball.Music.s_CookieOnOffEnum.ON);
};

eightball.Music.prototype.stopMusic = function() {
  this._clearMusic();
  eightball.Cookies.set(eightball.Music.s_CookieMusicOn, eightball.Music.s_CookieOnOffEnum.OFF);
};

eightball.Music.prototype.isMusicOn = function() {
  return (this.m_music != null);
};

eightball.Music.prototype.toggleMusic = function() {
  if (this.isMusicOn()) {
    this.stopMusic();
  } else {
    this.startMusic();
  }
};

/**
 @private
 */
eightball.Music.prototype._clearMusic = function() {
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
eightball.Music.s_CookieMusicOn = 'eightball.Music.musicOn';

/**
 @const
 @private
 @enum {string}
 */
eightball.Music.s_CookieOnOffEnum = {
  ON: 'on',
  OFF: 'off'
};

