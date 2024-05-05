# A mic controler so that you don't have to learn every app
# There is a script in waybar to send notifications about the mic btw

toggle_mic() {
  amixer set Capture toggle
}

case $1 in
  toggle) toggle_mic;;
esac

