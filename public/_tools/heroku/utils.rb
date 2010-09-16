module CDN

  def self.wrap(inner, left, right)
    return "#{left}#{inner}#{right}"
  end

  def self.process(root_dir, content_dirs, cdn_root)
    section_pattern = '\\w+'
    file_pattern = "#{section_pattern}(\\.#{section_pattern})*"
    path_pattern = "(#{content_dirs.join('|')})\/(#{section_pattern}/)*"
    dot_pattern = "(\.\.\/)*"

    value = "#{dot_pattern}(#{path_pattern}#{file_pattern})"
    options = [wrap(value,"'","'"), wrap(value,'"','"')]
    options = options.join('|')
    options = "(#{options})"

    file_matcher = Regexp.new(options)

    host_file = 'index.html'
    static_files = Dir.glob('*/*.{js,css}')

    Dir.chdir root_dir

    (static_files + [host_file]).each do |file|

      puts file
      content = File.read(file)

      matches = []
      content.scan(file_matcher) do |match|
        puts match.inspect
        matches << {:from => match[0], :to => match[7]}
      end
  
      matches.each do |match|
        replace = "'#{cdn_root}#{match[:to]}'"
        content.gsub!(match[:from], replace)
      end
  
      File.open(file, 'w') do |stream|
        stream.write(content)
      end
  
  
    end
  end
end
