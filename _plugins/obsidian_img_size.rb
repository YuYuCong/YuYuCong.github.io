# Converts Obsidian image size syntax to HTML before Kramdown parses it.
# Handles: ![alt|300](path)  and  ![alt|300x200](path)  and  ![|300](path)
Jekyll::Hooks.register [:posts, :pages], :pre_render do |doc|
  doc.content = doc.content.gsub(/!\[([^\]]*)\|(\d+)(?:x(\d+))?\]\(([^)]+)\)/) do
    alt    = $1
    width  = $2
    height = $3
    src    = $4
    src    = "/#{src}" unless src.start_with?('/', 'http://', 'https://')
    style  = height ? "width:#{width}px;height:#{height}px;" : "width:#{width}px;"
    "<img src=\"#{src}\" style=\"#{style}\" alt=\"#{alt}\">"
  end
end
