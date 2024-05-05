# This is a script for managing your appimages.
# I don't want to use anything other than the terminal. Sorry ¯\_(ツ)_/¯

function ailcli --argument-name opt file -d "a simple way to manage app images"

    if test "$file" = "" || not test -f $file
        echo "You didn't pass a correct file!"
        return 0
    end

    switch $opt
    case i install
        installApp $file
    case rm remove
        removeApp $file
    case list 
        echo some weird list
    case shark trout stingray
        echo fish
    case '*'
        echo I have no idea what a $animal is
    end


end


function installApp --argument-name file
    set filePath $(basename $file)
    set name $(basename -s .AppImage $file)
    set filename $(echo $filePath | sed 's/ /\\\\ /g')
    echo "installing... $name"

    cp $file ~/.local/bin/ 
    chmod +x ~/.local/bin/$filename
    echo """[Desktop Entry]
    Type=Application
    Name=$name
    Comment=$name
    Icon=/home/bram/Applications/Minecraft/icon.png
    Exec=/home/takis/.local/bin/$filename
    Terminal=false
    Categories=Application""" >> ~/.local/share/applications/$filename.desktop
end


function removeApp --argument-name file
    set filePath $(basename $file)
    set name $(basename -s .AppImage $file)
    set filename $(echo $filePath | sed 's/ /\\\ /g')
    echo $filename
    echo "removing $name"

    rm ~/.local/bin/$filePath
    rm ~/.local/share/applications/$filename.desktop
end

function listApps
    
end
