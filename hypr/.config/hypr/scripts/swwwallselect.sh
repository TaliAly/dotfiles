#!/bin/bash

dir=$HOME/Wallpapers/swww
entries=$(ls $dir)


selected=$(ls $dir | while read A ; do  echo -en "$A\x00icon\x1f$dir/$A\n"; done | rofi -dmenu -show-icons -p "Select wallpaper: " -config "~/.config/rofi/wallpaper.rasi")
#
swww img $dir/$selected --transition-fps 60 --transition-type center --transition-duration 1


