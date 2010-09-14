DIR = '/tmp/deploy20100913-173701'
SERVER_ROOT = 'http://localhost:9292/'
CONTENT_DIRS = %w(images fonts javascripts sounds stylesheets)

def wrap(inner, left, right)
  return "#{left}#{inner}#{right}"
end

section_pattern = '\\w+'
file_pattern = "#{section_pattern}(\\.#{section_pattern})*"
path_pattern = "(#{CONTENT_DIRS.join('|')})\/(#{section_pattern}/)*"
dot_pattern = "(\.\.\/)*"

Dir.chdir DIR

host_file = 'index.html'
static_files = Dir.glob('*/*.{js,css}')

value = "#{dot_pattern}(#{path_pattern}#{file_pattern})"
options = [wrap(value,"'","'"), wrap(value,'"','"')]
options = options.join('|')
options = "(#{options})"

file_matcher = Regexp.new(options)

(static_files + [host_file]).each do |file|
  
  puts file
  content = File.read(file)
  match = content.scan(file_matcher).map{ |match| match[7] }
  puts match
end