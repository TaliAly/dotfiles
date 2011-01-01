function ins --wraps='sudo xbps-install -S' --description 'alias ins sudo xbps-install -S'
  sudo xbps-install -S $argv; 
end
