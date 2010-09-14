// a line to make the builder happy
goog.provide('eightball.SoundEffectManager');

goog.require('eightball.Cookies');

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
  var elements = eightball.SoundEffectManager._getElements(soundEffect);
  for(var i = elements.length; i<minNumber; i++){
    eightball.SoundEffectManager.createAudio(soundEffect);
  }
};

eightball.SoundEffectManager.prototype.play = function(name) {
  if (this.isSoundOn()) {
    return eightball.SoundEffectManager.play(this.m_sounds[name]);
  }
};

eightball.SoundEffectManager.prototype.toggleSound = function() {
  if (!this.isSoundOn()) {
    eightball.Cookies.set(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.ON);
  } else {
    eightball.Cookies.set(eightball.SoundEffectManager.s_CookieSoundOn, eightball.SoundEffectManager.s_CookieOnOffEnum.OFF);
  }
};

eightball.SoundEffectManager.createAudio = function(location){
  var audio = document.createElement("audio");
  document.body.appendChild(audio);
  eightball.SoundEffectManager.loadAudio(audio, location);
  return audio;
};

eightball.SoundEffectManager.loadAudio = function (audio, location) {
  audio.setAttribute("src", location);
  audio.load();
};

eightball.SoundEffectManager._getElements = function(location){
  return $('audio').filter(
    function(index){
      return goog.string.endsWith(this.src, location);
    });
};

eightball.SoundEffectManager.play = function (location) {
  var matches = eightball.SoundEffectManager._getElements(location).filter(
    function(index){
      return this.readyState == this.HAVE_ENOUGH_DATA;
    });

  var audio;
  if(matches.length){
    audio = matches[0];
    eightball.SoundEffectManager.loadAudio(audio, location);
  }
  else{
    audio = eightball.SoundEffectManager.createAudio(location);
  }

  audio.playbackRate = 1;
  audio.muted = false;

  audio.play();

  return audio;

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

/*
eightball.SoundEffect.watch = function(audioElement){
  if(console && console.log){
    var listener = function(event) {
      console.log(this.src, event.type);
      eightball.SoundEffect.inspect(this);
    };
    var events = ['loadstart','ended','error','waiting','play','progress','canplaythrough'];
    for(var i in events){
      audioElement.addEventListener(events[i], listener, true);
    }
  }
};

eightball.SoundEffect.inspect = function(audioElement){
  if(console && console.log){
    var attributes = ['readyState','ended','networkState','HAVE_ENOUGH_DATA'];
    for(var i in attributes){
      var attr = attributes[i];
      console.log(attr, audioElement[attr]);
    }
  }
};
*/
