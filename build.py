#!/usr/bin/env python

import os
from _tools.Closure import Closure
from _tools import HtmlPost
from _tools.HtmlCompressor import HtmlCompressor, CssCompressor

js_path = "javascripts"
closure_path = os.path.join(js_path, 'closure-library','closure')

app_extern = os.path.join(js_path, 'externs', 'application_extern.js')
jquery_extern = os.path.join(js_path, 'externs', 'jquery_extern.js')

preload_js_path = os.path.join(js_path, 'app_preload.js')
preload_deps_path = os.path.join(js_path, "preload_deps.js")
preload_compiled_path = os.path.join(js_path, "preload_compiled.js")

application_js_path = os.path.join(js_path, 'application.js')
app_deps_path = os.path.join(js_path, "deps.js")
app_compiled_path = os.path.join(js_path, "compiled.js")

js_dirs = map(lambda dir: os.path.join(js_path, dir), ['box2d','eightball','helpers'])

debug = False
skip_build = False

preload_closure = Closure(
  application_js_path = preload_js_path,
  closure_dependencies = js_dirs + [preload_js_path],
  deps_js_path = preload_deps_path,
  compiled_js_path = preload_compiled_path,
  extern_files = [app_extern, jquery_extern],
  debug = debug
).build_and_process('index_source.html', 'tmp/index_compiled_pre.html', skip_build)

Closure(
  application_js_path = application_js_path,
  closure_dependencies = js_dirs + [application_js_path],
  deps_js_path = app_deps_path,
  compiled_js_path = app_compiled_path,
  extern_files = [jquery_extern],
  debug = debug
).build_and_process('tmp/index_compiled_pre.html', 'index_compiled.html', skip_build)

HtmlCompressor('index_compiled.html', 'javascripts/compressed.js', 'index.html').compress()
