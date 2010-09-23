module ApplicationHelper
  def application_js(compiled = false)
    items = ''
    items << javascript_include_tag('/assets.js')
    items << content_tag('script', '', {'type' => Mime::JS, 'src' => '/javascripts/closure-library/closure/goog/base.js'})
    items << javascript_include_tag('deps', 'loader')
    items.html_safe
  end
end
