Agent8ballRails::Application.routes.draw do
  root :to => 'main#index'
  match "namita" => 'main#redirects'
  match "*path" => 'main#handle404'
end
