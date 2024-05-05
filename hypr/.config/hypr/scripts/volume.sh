#!/usr/bin/bash

ctl=/usr/bin/pactl
iconDir="$HOME/.icon/tmp"

function get_volume {
  amixer get Master | grep '%' | head -n 1 | cut -d '[' -f 2 | cut -d '%' -f 1
}

function send_notification {
  volume=`get_volume`
  bar=$(seq --separator="─" 0 "$((volume / 6))" | sed 's/[0-9]//g')
  spaces=$(seq --separator=" " 0 "$(( 17 - (volume / 6) ))" | sed 's/[0-9]//g')
  # Send the notification
  dunstify -a "volume" -i ~/Downloads/vol.jpg -h string:x-dunst-stack-tag:vol -u normal "  ${bar}${spaces} $volume%"
  # Send the notification
}

function change_volume {
  "$ctl" set-sink-volume @DEFAULT_SINK@ "$1"

  muted=$(pactl get-sink-mute @DEFAULT_SINK@ | awk '{print $2}')
  if [[ "$muted" == "yes" ]]; then
    "$ctl" set-sink-mute @DEFAULT_SINK@ toggle
  fi
  send_notification
}


# ok, this may sound weird. But
# Amixer doesnt work for some reason I'm not searching for
# so I'll just use pactl to control volume

case $1 in
  "mute") "$ctl" set-sink-mute @DEFAULT_SINK@ toggle;;
  "mute-mic") amixer set Capture toggle;;
  *) change_volume $1;;
esac
