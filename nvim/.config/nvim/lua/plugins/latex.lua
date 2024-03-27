vim.api.nvim_create_autocmd("BufWritePost", {
	group = vim.api.nvim_create_augroup("latexDom", { clear = true }),
	pattern = "*.tex",
	callback = function()
		vim.cmd("silent !pdflatex main.tex")
		print("pdflatex done")
	end,
})

function Zathura()
	vim.cmd("silent !zathura main.pdf &")
end
vim.keymap.set("n", "<leader>pw", Zathura, {})
