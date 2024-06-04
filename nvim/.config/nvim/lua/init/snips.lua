local map = function(keys, func, desc)
	vim.keymap.set("n", keys, func, { noremap = true, silent = true, desc = desc })
end

map("<leader>ee", "iif err != nil {<CR> log.Fatal(err)<CR>}<esc>", "[e]rr golang")
