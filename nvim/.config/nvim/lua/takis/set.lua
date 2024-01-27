vim.opt.nu = true
vim.opt.relativenumber = true

-- indentation
vim.opt.tabstop = 4
vim.opt.softtabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true
vim.wo.wrap = true
vim.wo.linebreak = true
vim.wo.list = false

vim.opt.swapfile = false
vim.opt.backup = false
vim.opt.undodir = os.getenv('HOME') .. "/.vim/undodir"
vim.opt.undofile = true

-- searching
vim.opt.hlsearch = false
vim.opt.incsearch = true

vim.opt.termguicolors = true
-- 
vim.opt.scrolloff = 8
vim.opt.signcolumn = 'yes'
vim.opt.isfname:append('@-@')

vim.opt.updatetime = 50

vim.opt.colorcolumn = "80"

vim.g.mapleader = " "
-- Start NERDTree and put the cursor back in the other window.
-- autocmd('VimEnter', { command = 'NERDTree | wincmd p' })

vim.opt.encoding="utf-8"
vim.cmd [[autocmd BufWritePre * lua vim.lsp.buf.format()]]
