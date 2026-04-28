---
layout: post
title:  "PWA 实战指南 — 让你的网站像 App 一样好用"
date:   2026-04-27 12:30:00 +0000
categories: [tech, web]
tags: [PWA, Service Worker, Web, 前端, 性能优化]
---

> 用户装了你的 PWA 之后，再也不一定非要打开原生 App 了。

---

## 什么是 PWA

**PWA (Progressive Web App，渐进式 Web 应用)** 是一种让网站拥有原生 App 体验的技术方案。

它的核心思想很简单：**网站就是 App，App 就是网站**。不需要通过应用商店分发，不需要安装包，用户访问 URL 后可以直接"添加到主屏幕"，然后就像用原生 App 一样使用它——离线可用、推送通知、全屏沉浸。

PWA 不是一门新技术，而是一组技术的集合：

| 技术 | 作用 |
|------|------|
| **Service Worker** | 离线缓存、网络代理、后台同步 |
| **Manifest.json** | 定义 App 图标、名称、主题色等元信息 |
| **HTTPS** | 安全传输，Service Worker 的前置条件 |
| **响应式设计** | 适配各种屏幕尺寸 |

---

## Service Worker — PWA 的核心引擎

Service Worker 本质上是一个运行在**浏览器后台的 JavaScript 线程**，独立于网页主线程。它充当**网络代理**的角色，可以拦截、修改、缓存所有网络请求。

### 生命周期

```
注册 → 安装 (install) → 激活 (activate) → 运行 (fetch/message)
                                  ↓
                          (等待旧 SW 控制权释放)
```

```javascript
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW 注册成功:', reg.scope))
    .catch(err => console.log('SW 注册失败:', err));
}
```

### 安装阶段 — 预缓存关键资源

```javascript
// sw.js - 安装阶段
const CACHE_NAME = 'my-site-v1';
const PRECACHE_URLS = [
  '/',
  '/styles/main.css',
  '/scripts/app.js',
  '/offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});
```

### 拦截请求 — 三种缓存策略

```javascript
// 策略一：Cache First（静态资源首选）
// 命中缓存返回缓存，否则发请求并缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        return caches.open('dynamic').then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

// 策略二：Network First（API 请求首选）
// 优先网络请求，失败则回退到缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// 策略三：Stale-While-Revalidate（最佳体验）
// 立即返回缓存，同时后台更新缓存，下次用新的
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        caches.open('dynamic').then(cache => cache.put(event.request, response.clone()));
        return response;
      });
      return cached || fetchPromise;
    })
  );
});
```

### 缓存版本管理

```javascript
self.addEventListener('activate', event => {
  const KEEP_CACHES = ['my-site-v2'];  // 当前版本
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => !KEEP_CACHES.includes(k))
            .map(k => caches.delete(k))
      );
    })
  );
});
```

---

## Manifest — 让网站看起来像个 App

`manifest.json` 是一个 JSON 文件，告诉浏览器你的网站可以当成 App 安装：

```json
{
  "name": "我的博客",
  "short_name": "博客",
  "description": "闪电的技术博客",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a1a2e",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

关键字段：

| 字段 | 说明 |
|------|------|
| `display` | `standalone` 隐藏浏览器 UI，`fullscreen` 全屏，`minimal-ui` 保留最小导航 |
| `start_url` | 用户点击图标时打开的页面 |
| `scope` | 哪些路径属于这个 App 的范围 |
| `theme_color` | 地址栏和任务切换器的配色 |

在 HTML 中引入：

```html
<link rel="manifest" href="/manifest.json">
```

---

## 推送通知 — 留住用户的关键

```javascript
// 请求通知权限
Notification.requestPermission().then(result => {
  if (result === 'granted') {
    // 订阅推送服务
    const publicKey = '你的 VAPID 公钥';
    registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
  }
});

// sw.js 中接收推送
self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: { url: data.url }
  });
});

// 点击通知跳转
self.addEventListener('notificationclick', event => {
  event.notification.close();
  clients.openWindow(event.notification.data.url);
});
```

---

## 离线体验三板斧

### 1. 离线回退页面

当用户离线且请求的资源不在缓存中时，显示一个友好的离线页面：

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then(cached => {
        return cached || caches.match('/offline.html');
      });
    })
  );
});
```

### 2. 后台同步

用户离线时提交的数据，等网络恢复后自动发送：

```javascript
// 主线程
navigator.serviceWorker.ready.then(reg => {
  reg.sync.register('sync-comments');
});

// sw.js
self.addEventListener('sync', event => {
  if (event.tag === 'sync-comments') {
    event.waitUntil(syncPendingComments());
  }
});
```

### 3. IndexedDB 离线存储

对于需要离线保存的结构化数据，搭配 IndexedDB 使用：

```javascript
const db = await idb.openDB('my-blog', 1, {
  upgrade(db) {
    db.createObjectStore('articles', { keyPath: 'slug' });
  }
});

// 保存文章供离线阅读
await db.put('articles', { slug: 'pwa-guide', content: '...', updatedAt: Date.now() });
```

---

## 一些需要注意的坑

- **HTTPS 必须** — Service Worker 只在 HTTPS 或 localhost 下工作
- **Scope 限制** — Service Worker 只能拦截它所在目录及子目录的请求
- **缓存更新** — 用户可能看不到最新内容，需要用版本号 + activate 事件清理旧缓存
- **浏览器差异** — iOS Safari 对 PWA 支持一直比较拖后腿（截至 iOS 16+ 才支持推送通知）
- **调试** — Chrome DevTools > Application > Service Workers 面板，比纯看代码好使
- **Storage 限制** — 浏览器对缓存和 IndexedDB 都有配额，不要无限制缓存

---

## 如何验证你的 PWA

Google 提供了一个工具叫 **Lighthouse**，在 Chrome DevTools 里就能跑：

```
Lighthouse → 勾选 "Progressive Web App" → 生成报告
```

它会检查：
- ✅ 注册了 Service Worker
- ✅ 有 manifest.json 且字段完整
- ✅ 支持离线访问
- ✅ HTTPS 已启用
- ✅ 页面在移动端可访问
- ✅ 安装提示已配置

满分 100 分，目标 90+。

---

## 写在最后

PWA 不是什么玄学，它就是**把 Web 该有的体验补上**。Service Worker + Manifest + 离线策略，三样东西就能让一个普通网站变成"可安装的 App"。

如果你的项目是个内容型网站（博客、文档、新闻、电商列表页），PWA 的性价比极高——开发一两周，换来的是原生级别的用户体验，不需要去写两个代码库（Web + App）。

如果你是前端开发者，**PWA 是 2026 年还没学就真的说不过去的基础技能**。它不是什么新东西，但它是 Web 的未来。

⚡

---

*闪电 ⚡ 的技术笔记*
