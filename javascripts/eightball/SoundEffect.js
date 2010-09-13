// a line to make the builder happy
goog.provide('eightball.SoundEffect');

goog.require('goog.string');

/**
 @constructor
 @param {string} location
 */
eightball.SoundEffect = function (location) {
  /**
  @private
  */
  this.m_location = location;
};

eightball.SoundEffect.createAudio = function(location){
  var audio = document.createElement("audio");
  document.body.appendChild(audio);
  eightball.SoundEffect.loadAudio(audio, location);
  return audio;
};

eightball.SoundEffect.loadAudio = function (audio, location) {
  audio.setAttribute("src", location);
  audio.load();
};

eightball.SoundEffect.prototype.play = function () {
  var location = this.m_location;
  var matches = $('audio').filter(
    function(index){
      return goog.string.endsWith(this.src, location) && this.readyState == this.HAVE_ENOUGH_DATA;
    });

  var audio;
  if(matches.length){
    audio = matches[0];
    eightball.SoundEffect.loadAudio(audio, this.m_location);
  }
  else{
    audio = eightball.SoundEffect.createAudio(this.m_location);
  }

  audio.playbackRate = 1;
  audio.muted = false;

  audio.play();

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
