function update --wraps='sudo xbps-install -Su && sudo xbps-remove -Oo' --description 'alias update sudo xbps-install -Su && sudo xbps-remove -Oo'
  sudo xbps-install -Su && sudo xbps-remove -Oo $argv; 
end
