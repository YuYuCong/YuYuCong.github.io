/**
 * 将文章内相对路径的 .md 链接及 redirect_from 路径重写为 Jekyll 的绝对 URL，
 * 避免在子路径页面下点击时解析成错误路径（如 .../最小二乘优化/Math/xxx.md）。
 * 优先使用构建时注入的 internalLinkMap（含 post 路径与 redirect_from，与 Jekyll 一致）。
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
    if (path.charAt(0) === '/' && linkMap[path.slice(1)]) return linkMap[path.slice(1)];
    if (path.charAt(0) !== '/' && linkMap['/' + path]) return linkMap['/' + path];
    if (path.indexOf('.md') === -1) return null;
    var parts = path.split('/');
    var last = parts[parts.length - 1];
    if (linkMap[last]) return linkMap[last];
    var match = last.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
    if (!match) return null;
    var year = match[1], month = match[2], day = match[3], title = match[4];
    var categories = parts.slice(0, -1).map(function (p) { return p.toLowerCase(); });
    var pathSegs = categories.length ? categories.concat([year, month, day, title]) : [year, month, day, title];
    return (BASE + '/' + pathSegs.join('/') + '/').replace(/\/+/g, '/');
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
