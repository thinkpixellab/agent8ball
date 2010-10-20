goog.provide('pixelLab.Stats');

goog.require('goog.dom');
/**
 @param {!string} account_key
 */
pixelLab.Stats.addGoogleAnalytics = function(account_key) {
  // TODO: support SSH
  pixelLab.Stats._addScript('http://www.google-analytics.com/ga.js');
  pixelLab.Stats.gaqPush(['_setAccount', account_key]);
  pixelLab.Stats.gaqPush(['_trackPageview']);
};

/**
 * @param {Array.<Object>|function()} commandArray
 * @return {number}
 */
pixelLab.Stats.gaqPush = function(commandArray) {
  if (window['_gaq'] === undefined) {
    window['_gaq'] = [];
  }
  window['_gaq'].push(commandArray);
};

/**
 @param {number} projectId
 @param {!string} securityId
 */
pixelLab.Stats.addStatCounter = function(projectId, securityId) {
  goog.global['sc_project'] = projectId;
  goog.global['sc_security'] = securityId;
  goog.global['sc_invisible'] = 1;

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

  var heads = document.getElementsByTagName('head');
  if (heads.length != 1) {
    throw Error("Couldn't find a single head tag.");
  }

  var head = heads[0];

  var headScripts = head.getElementsByTagName('script');
  if (headScripts.length == 0) {
    goog.dom.appendChild(head, script);
  } else {
    goog.dom.insertSiblingBefore(script, headScripts[0]);
  }
};
