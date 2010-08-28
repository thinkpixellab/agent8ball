$.ajaxSetup({ cache: true, async: true, timeout: 1200000, type: "GET",  });

// globals for tracking progress
var itemsTotal = 0;
var itemsLoaded = 0;
var progress = null;
var complete = null;

var preload = function (urls, progressCallback, completedCallback) {
  itemsTotal = urls.length;
  complete = completedCallback;
  progress = progressCallback;
  
  for (i = 0; i < urls.length; i++) {
    downloadFile(urls[i]);
  }
};

// download an individual file
var downloadFile = function (url) {
  var g = function() {
     $.get(url, function (data) { incrementDownloadCount() })
  };
  $.async.add(g);
};

// even though there was an error, we want to update our count
$(document).ajaxError(function (event, request, settings) {
  incrementDownloadCount();
});

// update our counts and call the appropriate events
var incrementDownloadCount = function () {
  itemsLoaded++;
  percentComplete = itemsLoaded / itemsTotal;

  if (progress != null) {
    progress.call(this, percentComplete);    
  }
  if (percentComplete == 1.0) {
    complete.call();
  }
};

// keeps our ui from freezing while we hammer the browser with ajax
$.async = {
    _timer: null,
    _queue: [],
    add: function(fn, context, time) {
        var setTimer = function(time) {
            $.queue._timer = setTimeout(function() {
                time = $.async.add();
                if ($.async._queue.length) {
                    setTimer(time);
                }
            }, time || 2);
        }

        if (fn) {
            $.async._queue.push([fn, context, time]);
            if ($.async._queue.length == 1) {
                setTimer(time);
            }
            return;
        }

        var next = $.async._queue.shift();
        if (!next) {
            return 0;
        }
        next[0].call(next[1] || window);
        return next[2];
    },
    clear: function() {
        clearTimeout($.queue._timer);
        $.async._queue = [];
    }
};