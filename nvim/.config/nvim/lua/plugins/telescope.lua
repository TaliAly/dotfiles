require("telescope").setup({
	-- You can put your default mappings / updates / etc. in here
	--  All the info you're looking for is in `:help telescope.setup()`
	--
	-- defaults = {
	--   mappings = {
	--     i = { ['<c-enter>'] = 'to_fuzzy_refine' },
	--   },
	-- },
	-- pickers = {}
	extensions = {
		["ui-select"] = {
			require("telescope.themes").get_dropdown(),
		},
	},
})

-- Enable telescope extensions, if they are installed
pcall(require("telescope").load_extension, "fzf")
pcall(require("telescope").load_extension, "ui-select")

-- See `:help telescope.builtin`
local builtin = require("telescope.builtin")
vim.keymap.set("n", "<leader>ff", builtin.find_files, { desc = "[F]files [F]iles" })
vim.keymap.set("n", "<leader>fg", builtin.git_files, { desc = "[F]Files [G]it" })
vim.keymap.set("n", "<leader>fs", builtin.live_grep, { desc = "[F]iles by [S]grep" })
