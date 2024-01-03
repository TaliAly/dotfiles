function ins --wraps='sudo xbps-install' --description 'alias ins sudo xbps-install'
  sudo xbps-install $argv; 
end
