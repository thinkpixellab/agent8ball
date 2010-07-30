#!/usr/bin/env python

import logging
import os
from subprocess import call

js_path = "javascripts"
closure_path = os.path.join(js_path, 'closure-library','closure')
calcdeps_js_path = os.path.join(closure_path, "bin/calcdeps.py")
application_js_path = os.path.join(js_path, 'application.js')
deps_js_path = os.path.join(js_path, "deps.js")
js_dirs = ['box2d','eightball','helpers']

def make_deps():
  logging.basicConfig(format='make_deps.py: %(message)s', level=logging.INFO)
  
  command = 'python'
  command += " %s" % calcdeps_js_path
  
  command += " --output_file %s" % deps_js_path
  command += " --d %s " % closure_path
  command += " -o deps"
  
  command += " -i %s " % application_js_path
  
  for js_dir in js_dirs:
    command += " -p %s" % os.path.join(js_path, js_dir)
  
  print command
  call(command, shell=True)

if __name__ == '__main__':
  make_deps()
