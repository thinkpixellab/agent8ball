#!/usr/bin/env python

import sys
import os
import fnmatch
import string
import logging
import subprocess

def make_deps(calcdeps_py_path, deps_js_path, closure_path, js_dirs):
  
  command = ['python']
  command += [calcdeps_py_path]
  
  command += ["--output_file", deps_js_path]
  command += ["--d", closure_path]
  command += ["-o", "deps"]
  
  for js_dir in js_dirs:
    command += ["-p", js_dir]
  
  return command

def get_closure_base(jar_path):
  return ["java", "-jar", jar_path]

def get_closure_inputs(closure_path, js_files, extern_files):
  command_inputs = []
  
  command_inputs += ["--js", os.path.join(closure_path, 'goog', 'base.js')]
  
  for file in js_files:
    command_inputs += ["--js", file]
  
  for file in extern_files:
    command_inputs += ["--externs", file]
  
  command_inputs += ["--manage_closure_dependencies", "true"]
  return command_inputs

def get_js_files_for_compile(app_file, app_dep_file, closure_path):
  dep_files = [app_dep_file]
  dep_files.append(os.path.join(closure_path, 'goog', 'deps.js'))
  
  provide_to_file_hash = {}
  file_to_require_hash = {}
  
  for dep_file in dep_files:
    process_deps(dep_file, provide_to_file_hash, file_to_require_hash, closure_path)
  
  files = []
  populate_files(app_file, files, provide_to_file_hash, file_to_require_hash)
  
  # ugly exception ->
  exception_files = [os.path.join(closure_path, 'goog', 'events', 'eventhandler.js'), os.path.join(closure_path, 'goog', 'events', 'eventtarget.js'), os.path.join(closure_path, 'goog', 'debug', 'errorhandler.js')]
  for exception in exception_files:
    if(not exception in files):
      files.append(exception)
  
  return files

def get_goog_js_files(closure_path):
  files = []
  # add js files in goog dir, without files in demos
  for file in find_files(closure_path, '*.js'):
    if(file.find('demos') == -1):
      files.append(file)
  return files

def get_command_with_inputs(jar_path, closure_path, js_files, extern_files):
  return get_closure_base(jar_path) + get_closure_inputs(closure_path, js_files, extern_files)

def compile(jar_path, closure_path, js_files, extern_files, compiled_js_path, debug=False):
  command = get_command_with_inputs(jar_path, closure_path, js_files, extern_files)
  
  command += ["--compilation_level", "ADVANCED_OPTIMIZATIONS"] # SIMPLE_OPTIMIZATIONS
  command += ["--summary_detail_level", "3"]
  command += ["--warning_level", "VERBOSE"]
  # make sure everything is in a good order
  command += ["--jscomp_dev_mode", "EVERY_PASS"]
  command += ["--js_output_file", compiled_js_path]
  
  if(debug):
    # debug makes var names readable, but was causing weirdness..
    command += ["--debug", "true"]
    command += ["--formatting", "PRETTY_PRINT"]
    command += ["--formatting", "PRINT_INPUT_DELIMITER"]
  
  return command

def find_files(directory, pattern):
    for root, dirs, files in os.walk(directory):
        for basename in files:
            if fnmatch.fnmatch(basename, pattern):
                filename = os.path.join(root, basename)
                yield filename

def run_addDependency(file_path, provided, required, provide_to_file_hash, file_to_require_hash, closure_path):
  file_path = os.path.join(closure_path, 'goog', file_path)
  file_path = os.path.normpath(file_path)
  if(file_path in file_to_require_hash):
    raise Exception("I've already seen '%s'" % file_path)
  file_to_require_hash[file_path] = required
  for symbol in provided:
    if(symbol in provide_to_file_hash):
      raise Exception("I've already seen '%s'" % symbol)
    provide_to_file_hash[symbol] = file_path

def process_line(line, provide_to_file_hash, file_to_require_hash, closure_path):
  locals = {'addDependency': lambda x, y, z: run_addDependency(x, y, z, provide_to_file_hash, file_to_require_hash, closure_path) }
  line = line.strip()
  if(line.startswith('goog.addDependency')):
    line = string.replace(line, 'goog.addDependency', 'addDependency')
    line = string.replace(line, ';', '')
    eval(line, {}, locals)

def process_deps(dep_file, provide_to_file_hash, file_to_require_hash, closure_path):
  for line in open(dep_file,"r").readlines():
    process_line(line, provide_to_file_hash, file_to_require_hash, closure_path)

def populate_files(js_file, files_array, provide_to_file_hash, file_to_require_hash):
  if(not js_file in files_array):
    # append the provided file, since we don't have it
    files_array.append(js_file)
    # figure out which 'symbols' are required by this file
    if(not js_file in file_to_require_hash):
      raise Exception("Don't know where the file '%s' is!" % js_file)
    required_symbols = file_to_require_hash[js_file]
    # figure out which files provide these symbols
    for symbol in required_symbols:
      if(not symbol in provide_to_file_hash):
        raise Exception("Don't know where the symbol '%s' is!" % symbol)
      next_file = provide_to_file_hash[symbol]
      populate_files(next_file, files_array, provide_to_file_hash, file_to_require_hash)

def print_help(jar_path):
  command = get_closure_base(jar_path)
  command.append("--help")
  return command

def run_command(command):
  logging.basicConfig(format='%(message)s', level=logging.INFO)
  args = command
  logging.info('Running the following command: %s', ' '.join(args))
  proc = subprocess.Popen(args, stdout=subprocess.PIPE)
  (stdoutdata, stderrdata) = proc.communicate()
  if proc.returncode != 0:
    logging.error('JavaScript compilation failed.')
    sys.exit(1)
  else:
    sys.stdout.write(stdoutdata)
