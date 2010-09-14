goog.provide('pixelLab.Preload');

goog.require('goog.string');
goog.require('goog.array');
goog.require('pixelLab.Audio');
goog.require('goog.events');

/**
 @constructor
 @param {!Array.<!string>} urls
 @param {!function()} completedCallback
 */
pixelLab.Preload = function(urls, completedCallback) {
  this.itemsLoaded = 0;
  this.itemsTotal = urls.length;

  this._queued = false;
  this._queue = [];

  for (var i = 0; i < urls.length; i++) {
    this._downloadFile(urls[i]);
  }
  $(document).ready(function(){
    completedCallback();
  });
};

pixelLab.Preload.prototype._downloadFile = function(url) {
  if(pixelLab.Preload._isAudio(url)){
    this._downloadAudio(url);
  }
  else if(pixelLab.Preload._isImage(url)){
    this._downloadImage(url);
  }
};

pixelLab.Preload.prototype._downloadAudio = function(url) {
  var _this = this;
  this._add(function() {
    pixelLab.Audio.create(url);
  });
};

pixelLab.Preload.prototype._downloadImage = function(url) {
  var _this = this;
  this._add(function() {
    var img = document.createElement('img');
    img.src = url;
    document.body.appendChild(img);
  });
};

/**
 @param {function()} fn
 */
pixelLab.Preload.prototype._add = function(fn) {
  this._queue.push(fn);
  this._processQueue();
};

pixelLab.Preload.prototype._processQueue = function() {
  var _this = this;
  if (this._queue.length && !this._queued) {
    setTimeout(function() {
      _this._doQueue();
    },
    0);
    this._queued = true;
  }
};

pixelLab.Preload.prototype._doQueue = function() {
  var fn = this._queue.pop();
  if (fn) {
    fn();
  }
  this._queued = false;
  this._processQueue();
};

pixelLab.Preload._isAudio = function(url){
  return pixelLab.Preload._hasExtension(url, pixelLab.Preload._audioExtensions);
};

pixelLab.Preload._isImage = function(url){
  return pixelLab.Preload._hasExtension(url, pixelLab.Preload._imageExtensions);
};

pixelLab.Preload._hasExtension = function(url, extensions){
  var value = false;
  goog.array.forEach(extensions, function(ext){
    ext = "." + ext;
    if(goog.string.endsWith(url, ext)){
      value = true;
    }
  });
  return value;
};

pixelLab.Preload._imageExtensions = ['png', 'jpg'];
pixelLab.Preload._audioExtensions = ['mp3','mp4'];
