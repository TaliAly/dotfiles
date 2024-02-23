#!/bin/bash

# it's pretty much the same but for deleting, if it's needed

readarray folders < stowlist
for folder in ${folders[@]}; do
  stow -D $folder
done

#################################
#
# Remove ~/.config
#
#################################

# echo "Now, this will delete all the files inside the ~/.config folder."
# echo "Do you want to continue?"
#
# read -p "Continue? [y/n]" -n 1 -r
# echo
#
# if [[ ! $REPLY =~ ^[Yy]$ ]]
# then
#     [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1
# fi
#
# readarray folders < stowlist
# for folder in ${folders[@]}; do
#     echo "Removing ~/.config/$folder"
#   rm -rf ~/.config/$folder
# done
