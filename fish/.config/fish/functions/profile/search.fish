function search
find . -maxdepth 3 -iname "*" | grep -i --color=always "$argv"
end
