goog.provide('pixelLab.Stats');

/**
 @param {!string} account_key
*/
pixelLab.Stats.addGoogleAnalytics = function(account_key) {
  window['_gaq'] = [['_setAccount', account_key], ['_trackPageview']];
  pixelLab.Stats._addScript('http://www.google-analytics.com/ga.js');
};

/**
 @param {number} projectId
 @param {!string} securityId
*/
pixelLab.Stats.addStatCounter = function(projectId, securityId) {
  window['sc_project'] = projectId;
  window['sc_security'] = securityId;
  window['sc_invisible'] = 1;

  pixelLab.Stats._addScript('http://www.statcounter.com/counter/counter_xhtml.js');
};

/**
 @private
 @param {!string} script_uri
*/
pixelLab.Stats._addScript = function(script_uri) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = script_uri;
  // TODO: scope this to the head element
  // TODO: handle case where there are no script elements
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(script, s);
};
