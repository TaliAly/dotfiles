

vim.g.mapleader = " "

vim.keymap.set("v", "J", ":m '>+1<CR>gv=gv")
vim.keymap.set("v", "K", ":m '<-2<CR>gv=gv")

-- replace word
vim.keymap.set("n", "<leader>ph", [[:%s/\<<C-r><C-w>\>/<C-r><C-w>/gI<Left><Left><Left>]])

vim.keymap.set("n", "<leader>gd", '<cmd>lua vim.lsp.buf.definition()<CR>')

-- vim.api.nvim_buf_set_keymap(bufnr, 'n', 'gd', '<cmd>lua vim.lsp.buf.definition()<CR>', opts)


-- Undotree
vim.keymap.set('n', '<leader>u', vim.cmd.UndotreeToggle)

-- latex dom
function zathura()
    vim.cmd("silent !zathura main.pdf &")
end
vim.keymap.set('n', '<leader>pw', zathura, {})


