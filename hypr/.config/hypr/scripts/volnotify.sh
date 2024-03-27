#!/bin/bash

if [ "$1" = "inc" ]; then
  pactl set-sink-volume @DEFAULT_SINK@ +2%
fi

pactl get-sink-volume >> dunst

