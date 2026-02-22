/**
 * 将文章内相对路径的 .md 链接重写为 Jekyll 的绝对 URL，
 * 避免在子路径页面下点击时解析成错误路径（如 .../最小二乘优化/Math/xxx.md）。
 * 规则：路径如 Math/2022-01-03-凸优化.md -> /math/2022/01/03/凸优化/
 */
(function () {
  var BASE = (window.Jekyll && window.Jekyll.baseurl) || '';

  function rewriteHref(path) {
    if (!path || path.indexOf('.md') === -1) return null;
    path = path.replace(/#.*$/, '').trim();
    if (!path || path.charAt(0) === '/' || /^https?:\/\//i.test(path)) return null;
    var parts = path.split('/');
    var last = parts[parts.length - 1];
    var match = last.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
    if (!match) return null;
    var year = match[1], month = match[2], day = match[3], title = match[4];
    var categories = parts.slice(0, -1).map(function (p) { return p.toLowerCase(); });
    var pathSegs = categories.length ? categories.concat([year, month, day, title]) : [year, month, day, title];
    var url = (BASE + '/' + pathSegs.join('/') + '/').replace(/\/+/g, '/');
    return url;
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
