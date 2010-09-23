module ApplicationHelper
  def game_js(compiled = false)
    items = [javascript_include_tag('/assets.js')]
    if compiled
      items << javascript_include_tag('compiled')
    else
      items << content_tag('script', '', {'type' => Mime::JS, 'src' => '/javascripts/closure-library/closure/goog/base.js'})
      items << javascript_include_tag('deps', 'loader')
    end
    items.join("\n").html_safe
  end
end
