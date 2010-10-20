goog.provide('eightball.Stats');

goog.require('pixelLab.Stats');

eightball.Stats.load = function() {
  if (window['doStats']) {
    pixelLab.Stats.addGoogleAnalytics('UA-18601140-1');
    pixelLab.Stats.addStatCounter(6221324, '0296de03');
  }
};
