#!/bin/bash


wall=$(cat wall.set)

swww-daemon --format xrgb
swww img $wall

if [ -z $1 ]; then
    swww kill
    swww init 
    swww img $wall
fi


