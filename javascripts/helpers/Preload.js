goog.provide('pixelLab.Preload');

/**
 @constructor
 */
pixelLab.Preload = function(urls, progressCallback, completedCallback) {

  var _this = this;
  // config jquery ajax
  this._ajaxSettings = {
    // cache: true, -> default
    // async: true, -> default
    // type: "GET", -> default
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
