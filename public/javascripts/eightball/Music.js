goog.provide('eightball.Music');

goog.require('eightball.Cookies');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('pl.SoundEffect');

/**
 @constructor
 @extends {goog.events.EventTarget}
 @param {!Array.<Array.<string>>} locations
 */
eightball.Music = function(name, locations) {
  goog.events.EventTarget.call(this);

  /**
   @private
   @type {Element}
   */
  this.m_music = null;

  /**
   @private
   @type {string}
   */
  this.m_name = name;

  /**
   @private
   @type {!Array.<Array.<string>>}
   */
  this.m_locations = locations;

  /**
   @type {boolean}
   */
  var cookieValue = goog.net.cookies.get(eightball.Cookies.Keys.MUSIC, eightball.Cookies.CookieOnOffEnum.ON) == eightball.Cookies.CookieOnOffEnum.ON;
  if (cookieValue) {
    this.startMusic();
  }
};
goog.inherits(eightball.Music, goog.events.EventTarget);

eightball.Music.prototype.startMusic = function() {

  this._clearMusic();

  this.m_music = pl.SoundEffect.create(this.m_name, this.m_locations);
  this.m_music.setAttribute('loop', 'loop');

  this.m_music.load();
  this.m_music.play();

  eightball.Cookies.set(eightball.Cookies.Keys.MUSIC, eightball.Cookies.CookieOnOffEnum.ON);
  this.dispatchEvent(new goog.events.Event(eightball.Music.STATE_CHANGE_EVENT_TYPE));
};

eightball.Music.prototype.stopMusic = function() {
  this._clearMusic();
  eightball.Cookies.set(eightball.Cookies.Keys.MUSIC, eightball.Cookies.CookieOnOffEnum.OFF);
  this.dispatchEvent(new goog.events.Event(eightball.Music.STATE_CHANGE_EVENT_TYPE));
};

/**
 @return {boolean}
 */
eightball.Music.prototype.isMusicOn = function() {
  return Boolean(this.m_music);
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
  var audios = document.getElementsByClassName('audio_' + this.m_name);
  goog.array.forEach(audios, function(element, index, array) {
    element.parentNode.removeChild(element);
  });
};
