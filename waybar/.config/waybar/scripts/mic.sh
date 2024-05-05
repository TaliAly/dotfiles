
show() {

check_muted="$(pactl get-source-mute @DEFAULT_SOURCE@ | awk -F': ' '{print $2}')"
  if [ $check_muted == "yes" ]; then
    echo ""
  else
    echo ""
  fi
}
notification() {
  check_muted="$(pactl get-source-mute @DEFAULT_SOURCE@ | awk -F': ' '{print $2}')"
  if [ $check_muted == "yes" ]; then
    dunstify -a "mic" -i ~/Downloads/vol.jpg -h string:x-dunst-stack-tag:vol -u normal "OFF"  
  else
    dunstify -a "mic" -i ~/Downloads/vol.jpg -h string:x-dunst-stack-tag:vol -u normal "ON"  
  fi

}
monitor() {
  # Monitors for changes in microphone state.

  pactl subscribe | /usr/bin/grep --line-buffered "'change' on source" |
    while read -r _; do
      show
      notification
    done
  exit

}

show
monitor
