function ColorLoad(color)
    color = color or "catppuccin"
    vim.cmd.colorscheme(color)
end

ColorLoad()
