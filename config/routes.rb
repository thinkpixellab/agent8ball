Site::Application.routes.draw do |map|
  match 'demo' => 'main#demo'
  root :to => "main#index"
end
