//
goog.provide('pixelLab.Audio');

goog.require('goog.string');

pixelLab.Audio.create = function(location) {
  var audio = document.createElement('audio');
  document.body.appendChild(audio);
  pixelLab.Audio.load(audio, location);
  return audio;
};

pixelLab.Audio.load = function(audio, location) {
  audio.setAttribute('src', location);
  audio.load();
};

pixelLab.Audio.getElements = function(location) {
  return $('audio').filter(
    function(index) {
      return goog.string.endsWith(this.src, location);
    });
};

/**
 @param {!string} location
 @param {boolean=} opt_muted
 @param {number=} opt_playbackRate
*/
pixelLab.Audio.play = function(location, opt_muted, opt_playbackRate) {
  var matches = pixelLab.Audio.getElements(location).filter(
    function(index) {
      return this.readyState == this.HAVE_ENOUGH_DATA;
    });

  var audio;
  if (matches.length) {
    audio = matches[0];
    pixelLab.Audio.load(audio, location);
  }
  else {
    audio = pixelLab.Audio.create(location);
  }

  if (opt_muted) audio.muted = opt_muted;

  audio.play();
  var rate = 1;
  if (opt_playbackRate) rate = opt_playbackRate;
  audio.playbackRate = rate;

  return audio;
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
