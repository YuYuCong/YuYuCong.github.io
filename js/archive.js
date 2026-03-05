/*
Credits: this script is shamelessly borrowed from
https://github.com/kitian616/jekyll-TeXt-theme
*/
(function() {
  function queryString() {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var i = 0, queryObj = {}, pair;
    var queryStr = window.location.search.substring(1);
    var queryArr = queryStr.split('&');
    for (i = 0; i < queryArr.length; i++) {
      pair = queryArr[i].split('=');
      // If first entry with this name
      if (typeof queryObj[pair[0]] === 'undefined') {
        queryObj[pair[0]] = pair[1];
        // If second entry with this name
      } else if (typeof queryObj[pair[0]] === 'string') {
        queryObj[pair[0]] = [queryObj[pair[0]], pair[1]];
        // If third or later entry with this name
      } else {
        queryObj[pair[0]].push(pair[1]);
      }
    }
    return queryObj;
  }

  var setUrlQuery = (function() {
    var baseUrl =  window.location.href.split('?')[0];
    return function(query) {
      if (typeof query === 'string') {
        window.history.replaceState(null, '', baseUrl + query);
      } else {
        window.history.replaceState(null, '', baseUrl);
      }
    };
  })();

  $(document).ready(function() {
    var $categories = $('.js-categories');
    var $categoryButtons = $categories.find('.category-button');
    var $categoryShowAll = $categories.find('.category-button--all');
    var $tags = $('.js-tags');
    var $articleTags = $tags.find('.tag-button');
    var $tagShowAll = $tags.find('.tag-button--all');
    var $result = $('.js-result');
    var $sections = $result.find('section');
    var sectionArticles = []
    var $lastFocusCategoryButton = null;
    var $lastFocusTagButton = null;
    var sectionTopArticleIndex = [];
    var hasInit = false;
    var currentCategory = '';
    var currentTag = '';

    $sections.each(function() {
      sectionArticles.push($(this).find('.item'));
    });

    function init() {
      var i, index = 0;
      for (i = 0; i < $sections.length; i++) {
        sectionTopArticleIndex.push(index);
        index += $sections.eq(i).find('.item').length;
      }
      sectionTopArticleIndex.push(index);
    }

    function searchButtonsByTag(_tag/*raw tag*/) {
      if (!_tag) {
        return $tagShowAll;
      }
      var _buttons = $articleTags.filter('[data-encode="' + _tag + '"]');
      if (_buttons.length === 0) {
        return $tagShowAll;
      }
      return _buttons;
    }

    function searchButtonsByCategory(_category/*raw category*/) {
      if (!_category) {
        return $categoryShowAll;
      }
      var _buttons = $categoryButtons.filter('[data-encode="' + _category + '"]');
      if (_buttons.length === 0) {
        return $categoryShowAll;
      }
      return _buttons;
    }

    function buttonFocusCategory(target) {
      if (target) {
        target.addClass('focus');
        $lastFocusCategoryButton && !$lastFocusCategoryButton.is(target) && $lastFocusCategoryButton.removeClass('focus');
        $lastFocusCategoryButton = target;
      }
    }

    function buttonFocusTag(target) {
      if (target) {
        target.addClass('focus');
        $lastFocusTagButton && !$lastFocusTagButton.is(target) && $lastFocusTagButton.removeClass('focus');
        $lastFocusTagButton = target;
      }
    }

    function updateTagVisibility(category) {
      // Collect all tags from articles matching the category
      var availableTags = {};
      var matchedArticlesCount = 0; // Count unique articles
      var i, j, k;
      
      for (i = 0; i < sectionArticles.length; i++) {
        var $articles = sectionArticles[i];
        for (j = 0; j < $articles.length; j++) {
          var matchCategory = false;
          
          // Check if article matches category
          if (category === '' || category === undefined) {
            matchCategory = true;
          } else {
            var categories = $articles.eq(j).data('categories');
            if (categories) {
              var categoryArray = categories.toString().split(',');
              for (k = 0; k < categoryArray.length; k++) {
                if (categoryArray[k] === category) {
                  matchCategory = true;
                  break;
                }
              }
            }
          }
          
          // If article matches category, collect its tags and count the article
          if (matchCategory) {
            matchedArticlesCount++; // Count this article
            
            var tags = $articles.eq(j).data('tags');
            if (tags) {
              var tagArray = tags.toString().split(',');
              for (k = 0; k < tagArray.length; k++) {
                var tagEncode = tagArray[k];
                if (tagEncode) {
                  availableTags[tagEncode] = (availableTags[tagEncode] || 0) + 1;
                }
              }
            }
          }
        }
      }
      
      // Show/hide tag buttons and update counts
      $articleTags.each(function() {
        var $btn = $(this);
        var tagEncode = $btn.attr('data-encode');
        
        if (availableTags[tagEncode]) {
          $btn.removeClass('d-none');
          // Update the count display
          var $sup = $btn.find('sup');
          if ($sup.length > 0) {
            $sup.text(availableTags[tagEncode]);
          }
        } else {
          $btn.addClass('d-none');
        }
      });
      
      // Always show "Show All" button
      $tagShowAll.removeClass('d-none');
      
      // Update Show All count to matched articles count
      var $showAllSup = $tagShowAll.find('sup');
      if ($showAllSup.length > 0) {
        $showAllSup.text(matchedArticlesCount);
      }
      
      // Reapply tagcloud colors after visibility change
      setTimeout(function() {
        if (typeof $.fn.tagcloud !== 'undefined') {
          // Reset background color for all tags
          $('#tag_cloud a').css('backgroundColor', '');
          // Reapply tagcloud to visible tags
          $('#tag_cloud a:not(.d-none)').tagcloud();
          // Reapply Show All button color (1.5x max)
          if (typeof window.setShowAllColor === 'function') {
            window.setShowAllColor();
          }
        }
      }, 50);
    }

    function filterArticles(category/*raw category*/, tag/*raw tag*/, categoryTarget, tagTarget) {
      var result = {}, $articles;
      var i, j, k, _tag, _category;

      for (i = 0; i < sectionArticles.length; i++) {
        $articles = sectionArticles[i];
        for (j = 0; j < $articles.length; j++) {
          var matchCategory = false;
          var matchTag = false;

          // Check category
          if (category === '' || category === undefined) {
            matchCategory = true;
          } else {
            var categories = $articles.eq(j).data('categories');
            if (categories) {
              var categoryArray = categories.toString().split(',');
              for (k = 0; k < categoryArray.length; k++) {
                if (categoryArray[k] === category) {
                  matchCategory = true;
                  break;
                }
              }
            }
          }

          // Check tag
          if (tag === '' || tag === undefined) {
            matchTag = true;
          } else {
            var tags = $articles.eq(j).data('tags');
            if (tags) {
              var tagArray = tags.toString().split(',');
              for (k = 0; k < tagArray.length; k++) {
                if (tagArray[k] === tag) {
                  matchTag = true;
                  break;
                }
              }
            }
          }

          // Both conditions must match
          if (matchCategory && matchTag) {
            result[i] || (result[i] = {});
            result[i][j] = true;
          }
        }
      }

      for (i = 0; i < sectionArticles.length; i++) {
        result[i] && $sections.eq(i).removeClass('d-none');
        result[i] || $sections.eq(i).addClass('d-none');
        for (j = 0; j < sectionArticles[i].length; j++) {
          if (result[i] && result[i][j]) {
            sectionArticles[i].eq(j).removeClass('d-none');
          } else {
            sectionArticles[i].eq(j).addClass('d-none');
          }
        }
      }

      hasInit || ($result.removeClass('d-none'), hasInit = true);

      if (categoryTarget) {
        buttonFocusCategory(categoryTarget);
        _category = categoryTarget.attr('data-encode');
        currentCategory = _category || '';
        // Update tag visibility based on selected category
        updateTagVisibility(currentCategory);
      } else {
        buttonFocusCategory(searchButtonsByCategory(category));
        // Update tag visibility based on current category
        updateTagVisibility(category);
      }

      if (tagTarget) {
        buttonFocusTag(tagTarget);
        _tag = tagTarget.attr('data-encode');
        currentTag = _tag || '';
      } else {
        buttonFocusTag(searchButtonsByTag(tag));
      }

      // Update URL
      var queryParts = [];
      if (currentCategory && currentCategory !== '') {
        queryParts.push('category=' + currentCategory);
      }
      if (currentTag && currentTag !== '') {
        queryParts.push('tag=' + currentTag);
      }
      if (queryParts.length > 0) {
        setUrlQuery('?' + queryParts.join('&'));
      } else {
        setUrlQuery();
      }
    }

    var query = queryString(), 
        _category = query.category,
        _tag = query.tag;

    init(); 
    currentCategory = _category || '';
    currentTag = _tag || '';
    filterArticles(_category, _tag);
    // Update tag visibility on initial load
    updateTagVisibility(currentCategory);

    $categories.on('click', 'a', function() {
      // Reset tag selection when category changes (unless it's "Show All")
      var newCategory = $(this).data('encode');
      var newTag = currentTag;
      
      // If switching to a different category (not Show All), reset tag
      if (newCategory && newCategory !== currentCategory) {
        newTag = '';
        currentTag = '';
      }
      
      filterArticles(newCategory, newTag, $(this), null);
    });

    $tags.on('click', 'a', function() {
      filterArticles(currentCategory, $(this).data('encode'), null, $(this));
    });

  });
})();
