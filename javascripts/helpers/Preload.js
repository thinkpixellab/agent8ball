goog.provide('pixelLab.Preload');

goog.require('goog.string');
goog.require('goog.array');

/**
 @constructor
 */
pixelLab.Preload = function(urls, progressCallback, completedCallback) {

  var _this = this;
  // config jquery ajax
  this._ajaxSettings = {
    'timeout': 1200000,
    'error': function(event, request, settings) {
      // even though there was an error, we want to update our count
      _this._incrementDownloadCount();
    },
    'success': function(data, textStatus, XMLHttpRequest) {
      _this._incrementDownloadCount();
    }
  };

  this.itemsLoaded = 0;
  this.itemsTotal = urls.length;
  this._complete = completedCallback;
  this._progress = progressCallback;

  this._queued = false;
  this._queue = [];

  for (var i = 0; i < urls.length; i++) {
    this._downloadFile(urls[i]);
  }
};

pixelLab.Preload.prototype._downloadFile = function(url) {
  if(pixelLab.Preload._isAudio(url)){
    this._downloadAudio(url);
  }
  else{
    this._downloadAjax(url);
  }
};

pixelLab.Preload.prototype._downloadAudio = function(url) {
  var _this = this;
  this._add(function() {
    var audio = document.createElement('audio');
    audio.setAttribute("src", url);
    audio.addEventListener('ended', function(){
      _this._incrementDownloadCount();
    }, false);
    audio.muted = true;
    audio.load();
    audio.play();
    audio.playbackRate = 10.0;

    document.body.appendChild(audio);
  });
};

pixelLab.Preload.prototype._downloadAjax = function(url) {
  var settings = {
    url: url
  };
  $.extend(settings, this._ajaxSettings);
  this._add(function() {
    $.ajax(settings);
  });
};

// update our counts and call the appropriate events
pixelLab.Preload.prototype._incrementDownloadCount = function() {
  this.itemsLoaded++;
  this._percentComplete = this.itemsLoaded / this.itemsTotal;

  this._progress.call(this, this._percentComplete);
  if (this._percentComplete == 1.0) {
    this._complete.call();
  }
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

pixelLab.Preload._audioExtensions = ['mp3','mp4'];
