import os
import shutil
from xml.dom import minidom
from Shared import *
import HtmlPost

current_file_dir = os.path.relpath(os.path.dirname(__file__))

html_compressor_jar_path = os.path.join(current_file_dir, 'htmlcompressor-0.9.3.jar')
html_compressor_args = ['java', '-jar', html_compressor_jar_path]

yui_compressor_jar_path = os.path.join(current_file_dir, 'yuicompressor-2.4.2.jar')
yui_compressor_args = ['java', '-jar', yui_compressor_jar_path]

def appendAfterLast(sourceElement, targetElement, afterName = None):
  if(afterName):
    last = targetElement.getElementsByTagName(afterName).pop()
  else:
    last = None
  
  if(last):
    last = last.nextSibling
    
  if(last):
    targetElement.insertBefore(sourceElement,last)
  else:
    targetElement.appendChild(sourceElement)
  
def concat(source_files, destination_file):
  # create a tmp file
  tmp_file_path = get_tmp_file_name(destination_file)
  
  destination = open(tmp_file_path,'wb')
  
  # append, append, append
  for source_file in source_files:
    shutil.copyfileobj(open(source_file,'rb'), destination)
  
  destination.close();
  
  # move to destination file
  remove_if_exists(destination_file)
  os.rename(tmp_file_path, destination_file)

class CssCompressor:
  def __init__(self, sources, target):
    self.sources = sources
    self.target = target
  
  def compress(self):
    
    # concat
    concat(self.sources, self.target)
    
    #compress
    run_command(self.get_compress_args)
  
  def get_compress_args(self):
    args = yui_compressor_args[:]
    args += ['--verbose']
    
    tmp_file_path = get_tmp_file_name(self.target)
    args += ["-o", tmp_file_path]
    args += [self.target]
    return args, tmp_file_path, self.target

class HtmlCompressor:
  def __init__(self, source_html, target_html, target_js, target_css):
    self.source = source_html
    self.target_js = target_js
    self.target_css = target_css
    self.target = target_html
  
  def compress(self):
    dom = minidom.parse(self.source)
    
    # find css
    css_elements = HtmlPost.getCSSElementsFromDom(dom)
    css_files = map(lambda e: e.getAttribute('href'), css_elements)
    for element in css_elements:
      # remove originals
      element.parentNode.removeChild(element)
    
    # concat, compress
    CssCompressor(css_files, self.target_css).compress()
    
    #add new element back into dom
    css_element = dom.createElement('link')
    css_element.setAttribute('rel', 'stylesheet')
    css_element.setAttribute('type', 'text/css')
    css_element.setAttribute('href', self.target_css)
    
    # find js
    script_elements = HtmlPost.getScriptElementsFromDom(dom)
    # remove all script references that are compiled
    for element in script_elements:
      HtmlPost.process_script_element(element)
    
    # concat, compress
    script_elements_w_src = filter(lambda e: e.hasAttribute('src'), script_elements)
    source_files = map(lambda e: e.getAttribute('src'), script_elements_w_src)
    concat(source_files, self.target_js)
    
    compiledElement = dom.createElement('script')
    compiledElement.setAttribute('src', self.target_js)
    
    head = dom.getElementsByTagName('head')[0]
    # append compressed css
    appendAfterLast(css_element, head, 'link')
    # append compiled js
    head.appendChild(compiledElement)
    
    # write changed file to temp file
    
    self._tmp = get_tmp_file_name(self.source)
    writeXmlSansInstructions(dom, self._tmp)
    
    # compress html
    run_command(self.get_compress_args)
    HtmlPost.ensureHtmlElementsFromFile(self.target)
    remove_if_exists(self._tmp)
  
  
  def get_compress_args(self):
    args = html_compressor_args[:]
    args += ['--remove-intertag-spaces']
    
    tmp = get_tmp_file_name(self.source)
    args += ["-o", tmp]
    args += [self._tmp]
    return args, tmp, self.target
