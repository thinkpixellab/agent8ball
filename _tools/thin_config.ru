# A config file to server static content using Ruby Thin
# http://blog.ericwhite.ca/articles/2009/03/serving-static-content-with-ruby-thinrack/
root=Dir.pwd
puts ">>> Serving: #{root}"

module Rack
  class LongLived
    def initialize app
      @app = app
    end

    def call env
      @status, @headers, @body = @app.call env
      @headers['Expires'] = (Time.now + 60*60*24*365).to_s
      [@status, @headers, @body]
    end
  end
end

use Rack::LongLived
use Rack::CommonLogger
use Rack::ContentLength

run Rack::ShowExceptions.new(Rack::Lint.new(Rack::Directory.new("#{root}")))
