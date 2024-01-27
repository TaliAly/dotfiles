require('Comment').setup(
    {
        padding = true,
        sticky = true,
        ignore = nil,
        toggler = { line = 'cc', block = 'gbc' },
        opleader = { line = 'cc', block = 'gb' },
        extra = { above = 'gcO', below = 'gco', eol = 'gcA' },
        mappings = { basic = true, extra = true },
        pre_hook = nil,
        post_hook = nil,
    }

)
