// a line to make the builder happy
goog.provide('eightball.SoundEffectManager');

goog.require('eightball.Cookies');
goog.require('pixelLab.Audio');

/**
 @constructor
 */
eightball.SoundEffectManager = function() {
  /**
   @private
   */
  this.m_sounds = {};
};

eightball.SoundEffectManager.prototype.isSoundOn = function(){
  return goog.net.cookies.get(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.ON) == eightball.SoundEffectManager.s_CookieOnOffEnum.ON;
};

/**
 @param {!string} name
 @param {!string} soundEffect
 @param {number=} opt_minNumber
*/
eightball.SoundEffectManager.prototype.add = function(name, soundEffect, opt_minNumber) {
  var minNumber = 2;
  if(opt_minNumber) minNumber = opt_minNumber;
  this.m_sounds[name] = soundEffect;
  var elements = pixelLab.Audio.getElements(soundEffect);
  for(var i = elements.length; i<minNumber; i++){
    pixelLab.Audio.create(soundEffect);
  }
};

eightball.SoundEffectManager.prototype.play = function(name) {
  if (this.isSoundOn()) {
    return pixelLab.Audio.play(this.m_sounds[name]);
  }
};

eightball.SoundEffectManager.prototype.toggleSound = function() {
  if (!this.isSoundOn()) {
    eightball.Cookies.set(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.ON);
  } else {
    eightball.Cookies.set(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.OFF);
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
