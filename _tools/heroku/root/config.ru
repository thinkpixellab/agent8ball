require 'rubygems'
require 'rack-rewrite'
require 'rack/contrib'

#use Rack::Deflater
use Rack::Static
use Rack::StaticCache, :urls => ['/images', '/stylesheets', '/javascripts'], :duration => 2
use Rack::ETag
use Rack::Rewrite do
  rewrite '/', '/index.html'
end
run Rack::Directory.new(Dir.pwd)