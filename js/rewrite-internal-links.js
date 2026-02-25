/**
 * 将文章内相对路径的 .md 链接重写为 Jekyll 的绝对 URL，
 * 避免在子路径页面下点击时解析成错误路径（如 .../最小二乘优化/Math/xxx.md）。
 * 优先使用构建时注入的 internalLinkMap（与 Jekyll 一致）。
 */
(function () {
  var BASE = (window.Jekyll && window.Jekyll.baseurl) || '';
  var linkMap = {};
  (window.Jekyll && window.Jekyll.internalLinkMap || []).forEach(function (e) {
    linkMap[e.path] = e.url;
  });

  function rewriteHref(path) {
    if (!path) return null;
    path = path.replace(/#.*$/, '').trim();
    if (!path || /^https?:\/\//i.test(path)) return null;
    if (linkMap[path]) return linkMap[path];
    if (path.indexOf('.md') === -1) return null;
    var parts = path.split('/');
    var last = parts[parts.length - 1];
    if (linkMap[last]) return linkMap[last];
    // 不再从路径/文件名推测 URL：front matter 的 date 可能和文件名日期不同，
    // 推测会生成错误链接（如 lock总结.md 实际 URL 用 date:2021-02-06 而非文件名 2021-03-08）
    return null;
  }

  function run() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      var hash = '';
      var path = href;
      var i = href.indexOf('#');
      if (i !== -1) {
        hash = href.slice(i);
        path = href.slice(0, i);
      }
      var newPath = rewriteHref(path);
      if (newPath) a.setAttribute('href', newPath + hash);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
