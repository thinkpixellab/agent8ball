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

eightball.SoundEffectManager.prototype.add = function(name, soundEffect) {
  this.m_sounds[name] = soundEffect;
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

eightball.SoundEffectManager.play = function (location) {
  var matches = $('audio').filter(
    function(index){
      return goog.string.endsWith(this.src, location) && this.readyState == this.HAVE_ENOUGH_DATA;
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
