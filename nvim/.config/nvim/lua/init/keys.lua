local opt = function(name)
	return { noremap = true, silent = true, desc = name }
end

-- Move line while in visual mode with shift
vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv")
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv")

-- Move back n forth between buffers (useful if you use telescope.nvim)
vim.keymap.set("n", "<leader>bp", ":bp<CR>", opt("[P]revious Buffer"))
vim.keymap.set("n", "<leader>bn", ":bn<CR>", opt("[N]ext buffer"))

-- indent shortcut to not have to reach all the way to =ap
vim.keymap.set("n", "<leader>cf", ":vim.lsp.buf.format()<CR>", opt("Code [F]ormat"))
vim.keymap.set("n", "<leader>gh", ":vim.lsp.buf.hover()<CR>", opt("Code [H]over"))

-- replace word
vim.keymap.set("n", "<leader>ph", [[:%s/\<<C-r><C-w>\>/<C-r><C-w>/gI<Left><Left><Left>]], opt("replace word"))

-- If new me read this, you should search for something to list the current
-- buffers and search with fzf

-- new new me, please do that, I'm beggin you

-- new new new me, I do not want that now.
-- I would prefer to have some kind of list
-- for buffers that I can jump into instead of next and back
