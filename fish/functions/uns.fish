function uns --wraps='sudo xbps-remove -o' --wraps='sudo xbps-remove -O' --wraps='sudo xbps-remove' --description 'alias uns sudo xbps-remove'
  sudo xbps-remove $argv; 
end
