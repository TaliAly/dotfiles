if status is-interactive
    # Commands to run in interactive sessions can go here
    #
    set fish_greeting "" # no greeting
    set fish_function_path (path resolve $__fish_config_dir/functions/*/) $fish_function_path
    set  PATH /home/takis/anaconda3/bin $PATH

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

# bun
set --export BUN_INSTALL "$HOME/.bun"
set --export PATH $BUN_INSTALL/bin $PATH
