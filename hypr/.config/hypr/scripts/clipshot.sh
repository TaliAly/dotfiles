#!/usr/bin/bash

# Just take me a photo!
notify() {
  dunstify -a "Clipboard" -h string:x-dunst-stack-tag:clipboard -u normal "copied screenshot to clipboard"
}

case $1 in
  eyedropper) grim -g "$(slurp -p; swaymsg -q seat seat0 cursor move 1 2)" -t ppm - | convert - -format "%[pixel:p{0,0}]" txt:- | awk 'NR==2{print$3}' | wl-copy && notify;;
  print-copy) grim -g "$(slurp)" - | wl-copy --type image/png && notify;;
  print-screen) grim - | wl-copy && notify;;
esac

