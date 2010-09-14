#!/usr/bin/env python

import os
from _tools.Closure import Closure
from _tools import HtmlPost
from _tools.HtmlCompressor import HtmlCompressor, CssCompressor

js_path = "javascripts"
closure_path = os.path.join(js_path, 'closure-library','closure')

app_extern = os.path.join(js_path, 'externs', 'application_extern.js')
jquery_extern = os.path.join(js_path, 'externs', 'jquery_extern.js')

loader_js_path = os.path.join(js_path, 'loader.js')
deps_path = os.path.join(js_path, "deps.js")

application_js_path = os.path.join(js_path, 'application.js')
compiled_path = os.path.join(js_path, "compiled.js")

js_dirs = map(lambda dir: os.path.join(js_path, dir), ['box2d','eightball','helpers'])

debug = False
skip_build = False

Closure(
  application_js_path = loader_js_path,
  closure_dependencies = js_dirs + [loader_js_path, application_js_path],
  deps_js_path = deps_path,
  compiled_js_path = compiled_path,
  extern_files = [app_extern, jquery_extern],
).build_and_process('index_source.html', 'index_compiled.html', debug, skip_build)

HtmlPost.append_analytics_files('index_compiled.html', 'index_analytics.html', ['analytics/google.html','analytics/statCounter.html'])

HtmlCompressor('index_analytics.html', 'index.html', 'javascripts/compressed.js', 'stylesheets/styles03.css').compress()
