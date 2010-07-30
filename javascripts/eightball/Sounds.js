goog.provide('eightball.Sounds');
goog.provide('eightball.SoundEffect');

/**
@constructor
*/
eightball.Sounds = function () {
    this.isMusicOn = false;
    this.isSoundEnabled = false;
    this.music = null;
};

eightball.Sounds.prototype.startMusic = function (location, loop) {

    this.stopMusic();

    // stop the current music and remove the audio element
    if (this.music) {
        this.music.pause();
        this.music.parentNode.removeChild(this.music);
        this.music = null;
    }

    // check our inputs
    if (location == undefined || location == null) return;
    if (loop == undefined || loop == null) loop = false;

    // create the audio element
    this.music = document.createElement("audio");
    this.music.setAttribute("src", location);
    this.music.play();
    this.isMusicOn = true;

    // set option parameters
    if (loop) this.music.setAttribute("loop", "loop")

    // add it to the document
    document.body.appendChild(this.music);

}

eightball.Sounds.prototype.stopMusic = function () {

    // stop the current music and remove the audio element
    if (this.music) {
        this.music.pause();
        this.music.parentNode.removeChild(this.music);
        this.music = null;
    }

    this.isMusicOn = false;
}


eightball.SoundEffect = function () {


}