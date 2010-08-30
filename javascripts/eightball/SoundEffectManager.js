// a line to make the builder happy
goog.provide('eightball.SoundEffectManager');

goog.require('eightball.SoundEffect');
goog.require('goog.net.cookies');

/**
 @constructor
 */
eightball.SoundEffectManager = function() {

  /**
   @private
   */
  this.m_sounds = new Array();

  /**
   @private
   */
  var cookieValue = goog.net.cookies.get(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.ON) == eightball.SoundEffectManager.s_CookieOnOffEnum.ON;
  this.m_isSoundOn = cookieValue;
};

eightball.SoundEffectManager.prototype.add = function(name, soundEffect) {
  this.m_sounds[name] = soundEffect;
};

eightball.SoundEffectManager.prototype.play = function(name) {
  if (this.m_isSoundOn) {
    return this.m_sounds[name].play();
  }
};

eightball.SoundEffectManager.prototype.isSoundOn = function () {
  return this.m_isSoundOn;
};

eightball.SoundEffectManager.prototype.toggleSound = function() {
  this.m_isSoundOn = !this.m_isSoundOn;
  if (this.m_isSoundOn) {
    goog.net.cookies.set(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.ON);
  } else {
    goog.net.cookies.set(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.OFF);
  }
};

/** 
 @const
 @private
 @type {string}
 */
eightball.SoundEffectManager.s_CookieSoundOn = "eightball.SoundEffectManager.soundOn";

/** 
 @private
 @enum {string}
 */
eightball.SoundEffectManager.s_CookieOnOffEnum = {
  ON: 'on',
  OFF: 'off'
};
