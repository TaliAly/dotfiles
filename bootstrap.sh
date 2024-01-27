# for installing the dotfiles inside every folder 

readarray folders < stowlist
for folder in ${folders[@]}; do
  stow $folder
  

  # in case someone is lazy to read
  if [ $? -ne 1]; then
      echo "$folder had an error. Save the old files and then try again"
  fi
done

