function uns --wraps='sudo xbps-remove -o' --description 'alias uns sudo xbps-remove -o'
  sudo xbps-remove -o $argv; 
end
