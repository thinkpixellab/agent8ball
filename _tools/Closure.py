import os
import string
from Shared import *
import HtmlPost

current_file_dir = os.path.relpath(os.path.dirname(__file__))
jar_path = os.path.join(current_file_dir, 'compiler.jar')
closure_path = calcdeps_py_path = os.path.join(current_file_dir, 'closure-library', 'closure')
calcdeps_py_path = os.path.join(closure_path, 'bin', 'calcdeps.py')

def make_deps_core(deps_js_path, js_dirs):
  
  command = ['python']
  command += [calcdeps_py_path]
  
  command += ["--d", closure_path]
  command += ["-o", "deps"]
  
  for js_dir in js_dirs:
    command += ["-p", js_dir]
  
  tmp_file_path = get_tmp_file_name(deps_js_path)
  command += ["--output_file", tmp_file_path]
  return command, tmp_file_path, deps_js_path

class Closure:
  def __init__(self, application_js_path, closure_dependencies, deps_js_path, compiled_js_path, extern_dir, debug = False):
    self.deps_js_path = deps_js_path
    self.closure_dependencies = closure_dependencies
    self.application_js_path = application_js_path
    self.extern_dir = extern_dir
    self.compiled_js_path = compiled_js_path
    self.debug = debug
  
  def build(self):
    run_command(self.make_deps)
    run_command(self.compile)
  
  def build_and_process(self, source_html, target_html):
    self.build()
    
    source_js_files = [os.path.join(closure_path, 'goog', 'base.js')]
    source_js_files += [self.application_js_path, self.deps_js_path]
    HtmlPost.replaceJsFiles(source_html, target_html, self.compiled_js_path, source_js_files)
  
  def make_deps(self):
    return make_deps_core(self.deps_js_path, self.closure_dependencies)
  
  def get_compile_files(self):
    js_files = get_js_files_for_compile(self.application_js_path, self.deps_js_path)
    
    extern_files = []
    for file in find_files(self.extern_dir, '*.js'):
      extern_files.append(file)
    
    return js_files, extern_files
  
  def compile(self):
    js_files, extern_files = self.get_compile_files()
    return compile_core(js_files, extern_files, self.compiled_js_path, self.debug)
  
  # def print_tree(self):
  #   js_files, extern_files = self.get_compile_files()
  #   return print_tree_core(js_files, extern_files)

def get_closure_base():
  return ["java", "-jar", jar_path]

def get_closure_inputs(js_files, extern_files):
  command_inputs = []
  
  command_inputs += ["--js", os.path.join(closure_path, 'goog', 'base.js')]
  
  for file in js_files:
    command_inputs += ["--js", file]
  
  for file in extern_files:
    command_inputs += ["--externs", file]
  
  command_inputs += ["--manage_closure_dependencies", "true"]
  return command_inputs

def get_js_files_for_compile(app_file, app_dep_file):
  dep_files = [app_dep_file]
  dep_files.append(os.path.join(closure_path, 'goog', 'deps.js'))
  
  provide_to_file_hash = {}
  file_to_require_hash = {}
  
  for dep_file in dep_files:
    process_deps(dep_file, provide_to_file_hash, file_to_require_hash)
  
  files = []
  populate_files(app_file, files, provide_to_file_hash, file_to_require_hash)
  
  # ugly exception ->
  exception_files = [os.path.join(closure_path, 'goog', 'events', 'eventhandler.js'), os.path.join(closure_path, 'goog', 'events', 'eventtarget.js'), os.path.join(closure_path, 'goog', 'debug', 'errorhandler.js')]
  for exception in exception_files:
    if(not exception in files):
      files.append(exception)
  
  return files

def get_goog_js_files():
  files = []
  # add js files in goog dir, without files in demos
  for file in find_files(closure_path, '*.js'):
    if(file.find('demos') == -1):
      files.append(file)
  return files

def get_command_with_inputs(js_files, extern_files):
  return get_closure_base() + get_closure_inputs(js_files, extern_files)

def compile_core(js_files, extern_files, compiled_js_path, debug=False):
  command = get_command_with_inputs(js_files, extern_files)
  
  command += ["--compilation_level", "ADVANCED_OPTIMIZATIONS"] # SIMPLE_OPTIMIZATIONS
  command += ["--summary_detail_level", "3"]
  command += ["--warning_level", "VERBOSE"]
  # make sure everything is in a good order
  command += ["--jscomp_dev_mode", "EVERY_PASS"]
  
  if(debug):
    # debug makes var names readable, but was causing weirdness..
    command += ["--debug", "true"]
    command += ["--formatting", "PRETTY_PRINT"]
    command += ["--formatting", "PRINT_INPUT_DELIMITER"]
  
  tmp_file_path = get_tmp_file_name(compiled_js_path)
  command += ["--js_output_file", tmp_file_path]
  return command, tmp_file_path, compiled_js_path

def run_addDependency(file_path, provided, required, provide_to_file_hash, file_to_require_hash):
  file_path = os.path.join(closure_path, 'goog', file_path)
  file_path = os.path.normpath(file_path)
  if(file_path in file_to_require_hash):
    raise Exception("I've already seen '%s'" % file_path)
  file_to_require_hash[file_path] = required
  for symbol in provided:
    if(symbol in provide_to_file_hash):
      raise Exception("I've already seen '%s'" % symbol)
    provide_to_file_hash[symbol] = file_path

def process_line(line, provide_to_file_hash, file_to_require_hash):
  locals = {'addDependency': lambda x, y, z: run_addDependency(x, y, z, provide_to_file_hash, file_to_require_hash) }
  line = line.strip()
  if(line.startswith('goog.addDependency')):
    line = string.replace(line, 'goog.addDependency', 'addDependency')
    line = string.replace(line, ';', '')
    eval(line, {}, locals)

def process_deps(dep_file, provide_to_file_hash, file_to_require_hash):
  for line in open(dep_file,"r").readlines():
    process_line(line, provide_to_file_hash, file_to_require_hash)

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

# def print_help():
#   command = get_closure_base()
#   command.append("--help")
#   return command, None, None
#
# def print_tree_core(js_files, extern_files):
#   command = get_command_with_inputs(js_files, extern_files)
#   command.append("--print_tree")
#   command.append("true")
#   return command, None, None
