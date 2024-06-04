#!/bin/bash

EMOJIS_PATH="$HOME/.config/rofi/scripts/emoji-list"

line=`cat $EMOJIS_PATH | rofi -dmenu -theme emoji-selector-theme -i -markup-rows -p "" -columns 6`
[[ -z $line ]] && exit
a="${line#*>}"
b="${a%<*}"
echo -n $b | xsel -ipb

xdotool key Ctrl+Shift+v
