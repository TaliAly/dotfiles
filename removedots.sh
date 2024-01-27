# it's pretty much the same but for deleting, if it's needed

readarray folders < stowlist
for folder in ${folders[@]}; do
  stow -D $folder
done

