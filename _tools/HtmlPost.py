import sys
import os
import fnmatch
import string
import logging
import subprocess
import datetime
from xml.dom import minidom

def fixSlashes(path):
  return string.replace(path,"\\","/")

def getScriptElementsFromDom(dom, exclude_http = True):
  # TODO: should really use xpath here, eh?
  html = dom.getElementsByTagName('html')[0]
  head = html.getElementsByTagName('head')[0]
  elements = head.getElementsByTagName('script')
  if(exclude_http):
    return filter(lambda e: e.hasAttribute('src') and not(e.getAttribute('src').startswith("http://")) , elements)
  else:
    return elements

def replaceJsFiles(source_html_file, target_html_file, compiled_js_file, source_js_files = None):
  compiled_js_file = fixSlashes(compiled_js_file)
  if source_js_files != None:
    source_js_files = map(fixSlashes, source_js_files)

  dom = minidom.parse(source_html_file)
  script_elements = getScriptElementsFromDom(dom)
  
  # remove all script references that are compiled
  for element in script_elements:
    process_script_element(element, source_js_files)
  
  compiledElement = dom.createElement('script')
  compiledElement.setAttribute('src', compiled_js_file)
  # needed to ensure xml output writes both open/close tags
  compiledElement.appendChild(dom.createTextNode(''))
  
  head = dom.getElementsByTagName('head')[0]
  head.appendChild(compiledElement)
  
  ensureHtmlElementsFromDom(dom)
  
  with open(target_html_file, "w") as fp:
    dom.writexml(fp)

def process_script_element(element, source_js_files = None):
  if(element.hasAttribute('src')):
    src_attribute = element.getAttribute('src')
    if(source_js_files == None or source_js_files.count(src_attribute) > 0):
      element.parentNode.removeChild(element)

def ensureHtmlElementsFromFile(path):
  dom = minidom.parse(path)
  ensureHtmlElementsFromDom(dom)
  with open(path, "w") as f:
    dom.writexml(f)

def ensureHtmlElementsFromDom(dom):
  # now go through all 'important' tags and ensure they are not empty
  for element_name in ['canvas', 'script', 'div', 'a']:
    for element in dom.getElementsByTagName(element_name):
      element.appendChild(dom.createTextNode(''))

  