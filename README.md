# My dotfiles

Deploy them with GNU Stow https://www.gnu.org/software/stow/

```
git clone https://github.com/oscarduignan/dotfiles.git ~/dotfiles
cd ~/dotfiles
```

Then to install say vim symlinks into ~/

```
stow vim
```

Then to install emacs and fish and remove vim...

```
stow emacs fish -D vim
```

To install vim for a different user, say root...

```
stow -d /root vim
```

If you add any additional files to one of your configurations you'll have to redeploy them with the stow command