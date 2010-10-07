Agent8ballRails::Application.routes.draw do
  root :to => 'main#index'
  match "*path" => 'main#handle404'
end
