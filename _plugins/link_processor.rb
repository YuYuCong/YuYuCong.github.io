# Jekyll插件：自动处理相对路径链接
# 将文章内容中 [文本](文件名.md) 格式的跳转链接转换为正确的Jekyll URL

module Jekyll
  class LinkProcessor < Jekyll::Generator
    safe true
    priority :normal

    def generate(site)
      # 生成文件映射表
      file_url_map = generate_file_map(site)
      
      # 处理所有页面和文章
      site.pages.each { |page| process_content(page, file_url_map, site) }
      site.posts.docs.each { |post| process_content(post, file_url_map, site) }
    end

    private

    def generate_file_map(site)
      file_map = {}
      
      site.posts.docs.each do |post|
        # 获取文件名（不含扩展名）
        filename = File.basename(post.path, '.*')
        
        # 获取分类信息并转换为小写
        category = post.data['categories']&.first&.downcase
        
        # 解析日期和标题
        if filename =~ /^(\d{4})-(\d{2})-(\d{2})-(.+)$/
          year, month, day, title = $1, $2, $3, $4
          
          # 生成URL，如果有分类则包含分类，否则不包含
          if category
            url = "/#{category}/#{year}/#{month}/#{day}/#{title}/"
          else
            url = "/#{year}/#{month}/#{day}/#{title}/"
          end
          
          # 存储映射关系
          file_map[filename + '.md'] = url
          file_map[filename] = url
        end
      end
      
      puts "Generated file map: #{file_map}"
      file_map
    end

    def process_content(page_or_post, file_map, site)
      return unless page_or_post.content
      
      # 处理 [文本](文件名.md) 格式的链接
      page_or_post.content = page_or_post.content.gsub(/\[([^\]]+)\]\(([^)]+\.md)\)/) do |match|
        text, filepath = $1, $2
        
        # 提取文件名
        filename = File.basename(filepath)
        
        # 查找对应的URL
        if file_map[filename]
          "[#{text}](#{file_map[filename]})"
        else
          # 如果找不到映射，尝试生成URL
          generated_url = generate_url_from_filename(filename, site)
          if generated_url
            "[#{text}](#{generated_url})"
          else
            # 保持原样
            match
          end
        end
      end
    end

    def generate_url_from_filename(filename, site)
      # 移除.md扩展名
      name_without_ext = filename.sub(/\.md$/, '')
      
      # 尝试解析日期和标题
      if name_without_ext =~ /^(\d{4})-(\d{2})-(\d{2})-(.+)$/
        year, month, day, title = $1, $2, $3, $4
        
        # 查找对应的文章以获取分类信息
        category = find_category_for_filename(filename, site)
        
        # 如果有分类，包含在URL中；如果没有分类，不包含
        if category
          return "/#{category}/#{year}/#{month}/#{day}/#{title}/"
        else
          return "/#{year}/#{month}/#{day}/#{title}/"
        end
      end
      
      nil
    end

    def find_category_for_filename(filename, site)
      # 在site.posts中查找对应的文章
      site.posts.docs.each do |post|
        post_filename = File.basename(post.path)
        if post_filename == filename
          # 返回文章头部的分类信息并转换为小写，如果没有则返回nil
          return post.data['categories']&.first&.downcase
        end
      end
      
      # 如果找不到对应的文章，返回nil
      nil
    end
  end
end 