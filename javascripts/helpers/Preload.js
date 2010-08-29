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
    timeout: 1200000,
    error: function(event, request, settings) {
      // even though there was an error, we want to update our count
      _this._incrementDownloadCount();
    },
    success: function(data, textStatus, XMLHttpRequest) {
      _this._incrementDownloadCount();
    }
  };

  this.itemsLoaded = 0;
  this.itemsTotal = urls.length;
  this._complete = completedCallback;
  this._progress = progressCallback;

  this._timer = null;
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
  @param {function()=} fn
  @param {Object=} context
  @param {Object=} time
*/
pixelLab.Preload.prototype._add = function(fn, context, time) {
  var _this = this;
  var setTimer = function(time) {
    _this._timer = setTimeout(function() {
      time = _this._add();
      if (_this._queue.length) {
        setTimer(time);
      }
    },
    time || 2);
  };

  if (fn) {
    _this._queue.push([fn, context, time]);
    if (_this._queue.length == 1) {
      setTimer(time);
    }
    return;
  }

  var next = this._queue.shift();
  if (!next) {
    return 0;
  };
  next[0].call(next[1] || window);
  return next[2];
};

pixelLab.Preload.prototype._clear = function() {
  clearTimeout(this._timer);
  this._queue = [];
};
