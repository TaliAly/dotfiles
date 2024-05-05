if status is-interactive
    # Commands to run in interactive sessions can go here
    #
    set fish_greeting "" # no greeting
    set fish_function_path (path resolve $__fish_config_dir/functions/*/) $fish_function_path


    alias pls 'sudo'
    alias session "~/.bin/scripts/tmux-sessionizer"
    alias clr "clear"
    alias zyp "zypper"
    alias plszyp "sudo zypper"
    alias ls "eza"
    alias trees "eza --tree --color always | less -R"
    alias untar "tar -xvzf"
end

# Generated for envman. Do not edit.
test -s ~/.config/envman/load.fish; and source ~/.config/envman/load.fish
fish_add_path /home/takis/.spicetify
