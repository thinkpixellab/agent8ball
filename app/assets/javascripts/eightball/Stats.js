goog.provide('eightball.Stats');

goog.require('pl.Stats');

eightball.Stats.load = function() {
  if (window['doStats']) {
    pl.Stats.addGoogleAnalytics('UA-18513960-1');
    pl.Stats.addStatCounter(6221324, '0296de03');
  }
};

/**
 @param {string} event_name
 */
eightball.Stats.game = function(event_name) {
  pl.Stats.gaqTrackEvent('game', event_name);
};
