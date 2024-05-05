#!/bin/bash

dir=$HOME/Wallpapers/themes/rose-pine/
entries=$(ls $dir)


selected=$(ls $dir | while read A ; do  echo -en "$A\x00icon\x1f$dir/$A\n"; done | rofi -dmenu -show-icons -p "Select wallpaper: " -config "~/.config/rofi/themes/wallselect.rasi")

if [[ selected != "" ]]; then
  swww img $dir/$selected --transition-fps 60 --transition-type center --transition-duration 1

  echo "$dir/$selected" >> ~/Wallpapers/current_wallpaper.set.set
fi

