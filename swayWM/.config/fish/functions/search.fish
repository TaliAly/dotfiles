function search --wraps='xbps-query -Rs' --description 'alias search xbps-query -Rs'
  xbps-query -Rs $argv; 
end
