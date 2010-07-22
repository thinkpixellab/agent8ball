Site::Application.routes.draw do |map|
  match 'design', :to => 'main#design'
  root :to => "main#index"
end
