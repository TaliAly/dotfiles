if status is-interactive
    # Commands to run in interactive sessions can go here
    alias pls 'sudo'
    alias session "~/.bin/scripts/tmux-sessionizer"
    alias clr "clear"
    alias zyp "zypper"
    alias plszyp "sudo zypper"
    alias ls "eza"
    alias trees "eza --tree --color always | less -R"
    alias pfetch "sh $HOME/.bin/scripts/pfetch/pfetch"

end

# Generated for envman. Do not edit.
test -s ~/.config/envman/load.fish; and source ~/.config/envman/load.fish
