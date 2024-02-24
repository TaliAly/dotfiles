#!/bin/bash
#

entries=$(ls $HOME/Wallpapers/)

selected=$(printf '%s\n' $entries | wofi --show dmenu --conf=$HOME/.config/wofi/config.power --style=$HOME/.config/wofi/style.widgets.css | awk '{print tolower($1)}')


swww img $HOME/Wallpapers/$selected --transition-fps 60 --transition-type wipe --transition-duration 1

