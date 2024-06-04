#!/bin/bash
# for installing the dotfiles inside every folder 

readarray folders < stowlist
for folder in ${folders[@]}; do
    stow $folder
done

echo "Done. Happy Coding!"
echo "Check out the README for more information"
