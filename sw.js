---
layout: null
permalink: /sw.js
---

const CACHE_VERSION = 'v1';
const STATIC_CACHE = 'way-blog-static-' + CACHE_VERSION;
const PAGE_CACHE = 'way-blog-pages-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'way-blog-dynamic-' + CACHE_VERSION;

// 预缓存的静态资源
const PRECACHE_URLS = [
  '/My-Site/',
  '/My-Site/assets/main.css',
  '/My-Site/assets/icons/icon-192.png',
  '/My-Site/assets/icons/icon-512.png',
  '/My-Site/offline.html'
];

// 安装阶段：预缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', event => {
  const KEEP_CACHES = [STATIC_CACHE, PAGE_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => !KEEP_CACHES.includes(key)).map(key => caches.delete(key))
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// 判断请求类型
function isPageRequest(request) {
  const accept = request.headers.get('Accept') || '';
  return accept.includes('text/html');
}

function isStaticAsset(url) {
  const staticPatterns = [
    '/assets/', '/My-Site/assets/',
    '.css', '.js', '.png', '.jpg', '.svg', '.ico', '.woff', '.woff2'
  ];
  return staticPatterns.some(p => url.includes(p));
}

// 拦截请求
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求
  if (url.origin !== location.origin) return;

  // manifest.json 每次都从网络获取（确保最新）
  if (url.pathname.includes('manifest.json')) {
    event.respondWith(fetch(request));
    return;
  }

  // 静态资源：Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(response => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // 页面请求：Network First，离线回退
  if (isPageRequest(request)) {
    event.respondWith(
      fetch(request).then(response => {
        return caches.open(PAGE_CACHE).then(cache => {
          cache.put(request, response.clone());
          return response;
        });
      }).catch(() => {
        return caches.match(request).then(cached => {
          return cached || caches.match('/My-Site/offline.html');
        });
      })
    );
    return;
  }

  // 其他请求：Network First
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
