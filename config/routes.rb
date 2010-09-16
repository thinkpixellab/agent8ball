Agent8ballRails::Application.routes.draw do
  match '/raw' => 'main#raw'
  match '/compiled' => 'main#compiled'
  root :to => redirect('http://www.agent8ball.com')
  match "*path" => 'main#handle404'
end
