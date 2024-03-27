local opt = { noremap = true, silent = true }

-- Move line while in visual mode with shift
vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv")
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv")

-- replace word
vim.keymap.set("n", "<leader>ph", [[:%s/\<<C-r><C-w>\>/<C-r><C-w>/gI<Left><Left><Left>]])

-- Move back n forth between buffers (useful if you use telescope.nvim)

vim.keymap.set("n", "<leader>bp", ":bp<CR>", opt)
vim.keymap.set("n", "<leader>bn", ":bn<CR>", opt)

-- If new me read this, you should search for something to list the current
-- buffers and search with fzf
