goog.provide('eightball.SoundEffectManager');

goog.require('eightball.Cookies');
goog.require('pl.SoundEffect');

goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');

/**
 @constructor
 @extends {goog.events.EventTarget}
 @param {!Object.<string,!Array.<string>>} audioMap
 */
eightball.SoundEffectManager = function(audioMap) {
  goog.events.EventTarget.call(this);

  /**
   @private
   @type {!Object.<string, pl.SoundEffect>}
   */
  this.m_sounds = {};

  /**
   @private
   @type {!Object.<string,!Array.<string>>}
   */
  this.m_audioMap = audioMap;
};
goog.inherits(eightball.SoundEffectManager, goog.events.EventTarget);

eightball.SoundEffectManager.prototype.add = function(name, count) {
  this.m_sounds[name] = new pl.SoundEffect(name, this.m_audioMap[name], count);
};

eightball.SoundEffectManager.prototype.play = function(name) {
  if (this.isSoundOn()) {
    return this.m_sounds[name].play();
  }
};

eightball.SoundEffectManager.prototype.playRandom = function() {
  var keys = goog.object.getKeys(this.m_sounds);
  var index = Math.floor(Math.random() * keys.length);
  this.play(keys[index]);
  return keys[index];
};

/**
 @return {boolean}
 */
eightball.SoundEffectManager.prototype.isSoundOn = function() {
  return goog.net.cookies.get(eightball.Cookies.Keys.SOUND_EFFECTS, eightball.Cookies.CookieOnOffEnum.ON) == eightball.Cookies.CookieOnOffEnum.ON;
};

eightball.SoundEffectManager.prototype.toggleSound = function() {
  var newValue = this.isSoundOn() ? eightball.Cookies.CookieOnOffEnum.OFF : eightball.Cookies.CookieOnOffEnum.ON;
  eightball.Cookies.set(eightball.Cookies.Keys.SOUND_EFFECTS, newValue);
  this.dispatchEvent(new goog.events.Event(eightball.SoundEffectManager.STATE_CHANGE_EVENT_TYPE));
};

/**
 @const
 @type {string}
*/
eightball.SoundEffectManager.STATE_CHANGE_EVENT_TYPE = 'eightball.SoundEffectManager.STATE_CHANGE_EVENT_TYPE';
