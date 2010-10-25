goog.provide('eightball.SoundEffectManager');

goog.require('eightball.Cookies');
goog.require('eightball.SoundEffect');

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
   @type {!Object.<string, eightball.SoundEffect>}
   */
  this.m_sounds = {};

  /**
   @private
   @type {!Object.<string,!Array.<string>>}
   */
  this.m_audioMap = audioMap;

  var cookieValue = goog.net.cookies.get(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.ON) == eightball.SoundEffectManager.s_CookieOnOffEnum.ON;
  this.m_isSoundOn = cookieValue;
};
goog.inherits(eightball.SoundEffectManager, goog.events.EventTarget);

eightball.SoundEffectManager.prototype.add = function(name, count) {
  this.m_sounds[name] = new eightball.SoundEffect(name, this.m_audioMap[name], count);
};

eightball.SoundEffectManager.prototype.play = function(name) {
  if (this.m_isSoundOn) {
    return this.m_sounds[name].play();
  }
};

eightball.SoundEffectManager.prototype.playRandom = function() {
  var keys = goog.object.getKeys(this.m_sounds);
  var index = Math.floor(Math.random() * keys.length);
  this.play(keys[index]);
  return keys[index];
};

eightball.SoundEffectManager.prototype.isSoundOn = function() {
  return this.m_isSoundOn;
};

eightball.SoundEffectManager.prototype.toggleSound = function() {
  this.m_isSoundOn = !this.m_isSoundOn;
  if (this.m_isSoundOn) {
    eightball.Cookies.set(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.ON);
  } else {
    eightball.Cookies.set(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.OFF);
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
eightball.SoundEffectManager.s_CookieSoundOn = 's';

/**
 @const
 @private
 @enum {string}
 */
eightball.SoundEffectManager.s_CookieOnOffEnum = {
  ON: 'on',
  OFF: 'off'
};
