#!/usr/bin/env python

import os
from _tools.Closure import Closure
from _tools import HtmlPost
from _tools.HtmlCompressor import HtmlCompressor, CssCompressor

js_path = "javascripts"
closure_path = os.path.join(js_path, 'closure-library','closure')
application_js_path = os.path.join(js_path, 'application.js')
js_dirs = map(lambda dir: os.path.join(js_path, dir), ['box2d','eightball','helpers'])
deps_js_path = os.path.join(js_path, "deps.js")
compiled_js_path = os.path.join(js_path, "compiled.js")

closure = Closure(
  application_js_path = application_js_path,
  closure_dependencies = js_dirs + [application_js_path],
  deps_js_path = deps_js_path,
  compiled_js_path = compiled_js_path,
  extern_dir = os.path.join(js_path, 'externs')
)

closure.build()

source_js_files = ['_tools/closure-library/closure/goog/base.js', deps_js_path, application_js_path]

HtmlPost.postProcess('index.html', 'index_compiled.html', source_js_files, compiled_js_path)

compressor = HtmlCompressor('index_compiled.html', 'index_compressed.html')
compressor.compress()

css_compressor = CssCompressor(['stylesheets/reset.css','stylesheets/style.css'], 'stylesheets/css.css')
css_compressor.compress()
