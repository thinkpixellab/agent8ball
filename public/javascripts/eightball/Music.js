goog.provide('eightball.Music');

goog.require('eightball.Cookies');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

/**
 @constructor
 @extends {goog.events.EventTarget}
 @param {!Array.<string>} locations
 */
eightball.Music = function(locations) {
  goog.events.EventTarget.call(this);

  /**
   @private
   */
  this.m_music = null;

  /**
   @private
   @type {!Array.<string>}
   */
  this.m_locations = locations;

  var cookieValue = goog.net.cookies.get(eightball.Music.s_CookieMusicOn, eightball.Music.s_CookieOnOffEnum.ON) == eightball.Music.s_CookieOnOffEnum.ON;
  if (cookieValue) {
    this.startMusic();
  }
};
goog.inherits(eightball.Music, goog.events.EventTarget);

eightball.Music.prototype.startMusic = function() {

  this._clearMusic();

  this.m_music = eightball.SoundEffect.create(this.m_locations);
  this.m_music.loop = 'loop';
  document.body.appendChild(this.m_music);

  this.m_music.play();

  eightball.Cookies.set(eightball.Music.s_CookieMusicOn, eightball.Music.s_CookieOnOffEnum.ON);
  this.dispatchEvent(new goog.events.Event(eightball.Music.STATE_CHANGE_EVENT_TYPE));
};

eightball.Music.prototype.stopMusic = function() {
  this._clearMusic();
  eightball.Cookies.set(eightball.Music.s_CookieMusicOn, eightball.Music.s_CookieOnOffEnum.OFF);
  this.dispatchEvent(new goog.events.Event(eightball.Music.STATE_CHANGE_EVENT_TYPE));
};

/**
 @return {boolean}
 */
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
  @const
  @type {string}
*/
eightball.Music.STATE_CHANGE_EVENT_TYPE = 'eightball.Music.STATE_CHANGE_EVENT_TYPE';

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

