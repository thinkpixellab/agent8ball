goog.provide('eightball.SoundEffectManager');

goog.require('eightball.SoundEffect');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.net.cookies');

/**
 @constructor
 @extends {goog.events.EventTarget}
 @param {!Object.<string,string>} audioMap
 */
eightball.SoundEffectManager = function(audioMap) {
  goog.events.EventTarget.call(this);

  /**
   @private
   */
  this.m_sounds = new Array();

  /**
   @private
   @type {!Object.<string,string>}
   */
  this.m_audioMap = audioMap;

  var cookieValue = goog.net.cookies.get(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.ON) == eightball.SoundEffectManager.s_CookieOnOffEnum.ON;
  this.m_isSoundOn = cookieValue;
};
goog.inherits(eightball.SoundEffectManager, goog.events.EventTarget);

eightball.SoundEffectManager.prototype.add = function(name, count) {
  this.m_sounds[name] = new eightball.SoundEffect(this.m_audioMap[name], count);
};

eightball.SoundEffectManager.prototype.play = function(name) {
  if (this.m_isSoundOn) {
    return this.m_sounds[name].play();
  }
};

eightball.SoundEffectManager.prototype.isSoundOn = function() {
  return this.m_isSoundOn;
};

eightball.SoundEffectManager.prototype.toggleSound = function() {
  this.m_isSoundOn = !this.m_isSoundOn;
  if (this.m_isSoundOn) {
    goog.net.cookies.set(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.ON);
  } else {
    goog.net.cookies.set(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.OFF);
  }
  this.dispatchEvent(new goog.events.Event(eightball.SoundEffectManager.STATE_CHANGE_EVENT_TYPE));
};

/**
 @const
 @type {string}
*/
eightball.SoundEffectManager.STATE_CHANGE_EVENT_TYPE = 'eightball.SoundEffectManager.STATE_CHANGE_EVENT_TYPE';

/**
 @const
 @private
 @type {string}
 */
eightball.SoundEffectManager.s_CookieSoundOn = 'eightball.SoundEffectManager.soundOn';

/**
 @private
 @enum {string}
 */
eightball.SoundEffectManager.s_CookieOnOffEnum = {
  ON: 'on',
  OFF: 'off'
};
