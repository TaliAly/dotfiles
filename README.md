# Allyson Rowe's Dotfiles

A simple storage for my dotfiles using stow.

*What about it?* I like it simple, so don't worry about large files (maybe)

And also, I want it to be easy to configure ;)

## Requirements

- [Stow](https://www.gnu.org/software/stow/)
- [Fish](https://fishshell.com/)
- [A nerd font (Jetbrains)](https://www.nerdfonts.com/)

And the packages that I use

## Packages
Just use your favorite package manager. Me? I use two

```
sudo dnf install neovim tmux hyprland rofi waybar dunst git
cargo install fzf eza blight ripgrep

```

## Instalation

```sh
git clone https://github.com/TaliAly/dotfiles.git ~/.dotfiles
cd ~/.dotfiles
stow . # It just because 
```
## Post Instalation

As you might tell, I use the theme of [Rose Pine]() a lot which, is great until you consider that I don't add the apps that I use with it. Why? Because I don't care about them, maybe in the future.

### Neovim
If you have trouble with Lazy, just move the config folders out and let lazy install itself into the editor, then you can add the files.

### Why cargo?
Because sometimes my package manager won't have some utils that I like, and I hate that, so I found out that cargo can install in a self contained enviroment and I'm happy with that.

### Why fish?
it's fast, good and it's less hassle to add scripts to it (but writing them can be quite challenging)

## Credits
- [Theprimeagen's dotfiles](https://github.com/ThePrimeagen/.dotfiles)
- [Rose pine theme](https://github.com/rose-pine)
