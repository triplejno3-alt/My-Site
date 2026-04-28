---
layout: post
title:  "Jekyll 站点 PWA 改造实录 — 从零到可安装的完整指南"
date:   2026-04-27 14:00:00 +0000
categories: [tech, web, jekyll]
tags: [PWA, Jekyll, Service Worker, 前端, 性能优化, 踩坑记录]
---

> 给自己的 Jekyll 博客加上 PWA，让它像原生 App 一样可安装、可离线阅读。

---

## 为什么要改 PWA

这个站是 Jekyll + GitHub Pages 搭建的静态博客，部署在子路径 `/My-Site/` 下。

静态博客的好处是快，但也意味着**每次访问都要联网加载**。如果读者在地铁、飞机或者信号不好的地方打开博客，只能看到一个空白页面。PWA 正好解决这个问题——让网站能离线工作，还能添加到手机桌面，像个 App 一样用。

于是决定动手改造。

---

## PWA 三件套

先从概念上对齐一下。PWA 不是新技术，是三样东西的组合：

| 组件 | 作用 |
|------|------|
| **Manifest.json** | 告诉浏览器：这是个 App，这是我的名字和图标 |
| **Service Worker** | 在后台运行的网络代理，负责缓存和离线 |
| **HTTPS** | Service Worker 的前置条件，GitHub Pages 自带 |

加起来的效果：用户访问一次后，下次即使断网也能打开已看过的页面，浏览器还会弹出"添加到主屏幕"的提示。

---

## 改造步骤

### 第一步：生成 PWA 图标

PWA 需要至少两个尺寸的图标：192x192 和 512x512。

手边没有设计工具，直接用 Python Pillow 在服务器上生成：

```python
from PIL import Image, ImageDraw, ImageFont

def create_icon(size):
    img = Image.new('RGBA', (size, size), (44, 62, 80, 255))
    draw = ImageDraw.Draw(img)
    # 蓝色圆形背景
    circle_r = int(size * 0.92)
    draw.ellipse([(size-circle_r)//2, (size-circle_r)//2,
                  (size+circle_r)//2, (size+circle_r)//2],
                 fill=(52, 152, 219, 255))
    # 白色 W 字母
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(size * 0.55))
    text = 'W'
    bbox = draw.textbbox((0, 0), text, font=font)
    x = (size - (bbox[2]-bbox[0])) / 2 - bbox[0]
    y = (size - (bbox[3]-bbox[1])) / 2 - bbox[1]
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    img.save(f'assets/icons/icon-{size}.png', 'PNG')

create_icon(192)
create_icon(512)
```

图标配色用了站点的主题色：深蓝 `#2c3e50` 配亮蓝 `#3498db`，保持视觉统一。同时备了一份 SVG 矢量图标。

```
assets/icons/
├── icon.svg        # 矢量版
├── icon-192.png    # 小尺寸
└── icon-512.png    # 大尺寸
```

### 第二步：创建 Manifest

`manifest.json` 是 PWA 的身份证：

```json
{
  "name": "Find a better way",
  "short_name": "Way's Blog",
  "start_url": "/My-Site/",
  "scope": "/My-Site/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2c3e50",
  "icons": [
    { "src": "/My-Site/assets/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/My-Site/assets/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

关键参数说明：

- `display: standalone` — 隐藏浏览器地址栏，全屏沉浸式体验
- `scope: /My-Site/` — 限定只在这个子路径下生效（重要，部署在子路径时必须设置）
- `theme_color` — 控制浏览器地址栏和任务切换器的颜色

### 第三步：编写 Service Worker

这是 PWA 的核心，也是最花心思的部分。

**缓存策略设计：**

| 资源类型 | 策略 | 原因 |
|---------|------|------|
| CSS、图片、字体 | Cache First | 静态资源很少变，命中缓存直接返回 |
| 页面（HTML） | Network First | 文章内容需要最新，离线时回退缓存 |
| manifest.json | Network Only | 永远取最新的配置 |

**核心代码片段：**

```javascript
// 安装阶段：预缓存核心静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll([
        '/My-Site/',
        '/My-Site/assets/main.css',
        '/My-Site/assets/icons/icon-192.png',
        '/My-Site/offline.html'
      ]);
    }).then(() => self.skipWaiting())
  );
});

// 激活阶段：清理旧版本缓存
self.addEventListener('activate', event => {
  const KEEP_CACHES = [STATIC_CACHE, PAGE_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !KEEP_CACHES.includes(k)).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 请求拦截：按类型走不同策略
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (isStaticAsset(url.pathname)) {
    // Cache First
    event.respondWith(cacheFirst(request));
  } else if (isPageRequest(request)) {
    // Network First + 离线回退
    event.respondWith(networkFirstWithFallback(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});
```

**离线回退：**

当一个页面从未被访问过，而用户处于离线状态时，显示一个友好的离线页面而不是浏览器默认的错误页：

```javascript
function networkFirstWithFallback(request) {
  return fetch(request).then(response => {
    return caches.open(PAGE_CACHE).then(cache => {
      cache.put(request, response.clone());
      return response;
    });
  }).catch(() => {
    return caches.match(request).then(cached =>
      cached || caches.match('/My-Site/offline.html')
    );
  });
}
```

### 第四步：创建离线页面

一个简洁的离线提示页，告诉用户当前处于离线状态，并提供刷新按钮和返回首页的链接。

```html
---
layout: page
title: 离线
permalink: /offline.html
---

<div style="text-align:center;padding:4rem 2rem;">
  <div style="font-size:5rem;">📡</div>
  <h1>哎呀，断网了</h1>
  <p>你似乎处于离线状态，连接网络后刷新页面即可。</p>
  <button onclick="window.location.reload()">🔄 重新连接</button>
  <br><br>
  <a href="/My-Site/">← 返回首页</a>
</div>
```

### 第五步：注入到所有页面

PWA 的资源需要从 HTML 中引用。做法是给站点的 `<head>` 加上：

```html
<!-- Manifest -->
<link rel="manifest" href="/My-Site/manifest.json">

<!-- iOS 支持 -->
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="apple-touch-icon" href="/My-Site/assets/icons/icon-192.png">

<!-- 主题色 -->
<meta name="theme-color" content="#2c3e50">

<!-- Service Worker 注册 -->
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/My-Site/sw.js');
  });
}
</script>
```

---

## 踩坑记录

在这次改造中遇到了几个有意思的问题，值得记录下来。

### 坑一：子路径部署的 scope 问题

站点部署在 `https://user.github.io/My-Site/` 下，所以 manifest 的 `scope` 要设为 `/My-Site/`，`start_url` 也要带上子路径。Service Worker 注册时也需要明确指定 `scope`：

```javascript
navigator.serviceWorker.register('/My-Site/sw.js', {
  scope: '/My-Site/'
});
```

如果 scope 设置不对，Service Worker 会注册失败。

### 坑二：首页不走 default 布局

Jekyll 站点使用了自定义的 `home.html` 布局，它没有继承 minima 主题的 `default.html`，而是直接在顶部 `{% include header.html %}`。

这意味着 themes 的 `_includes/head.html` 不会被加载到首页上。而 `header.html` 自己又带了 `<meta charset>` 和 `<meta viewport>` 标签，没有通过 Jekyll 的 `{%- include head.html -%}` 方式。

**解决方案：** 直接在 `header.html` 里加上 manifest 和 SW 注册脚本，确保所有页面（首页和其他页面）都能注入 PWA 标签。

### 坑三：PWA 标签被注入两遍

`header.html` 加了一份，`head.html`（被 default 布局引用）也保留了一份。结果是文章页面的 PWA 标签出现了两次。不影响功能，只是 HTML 变长了。后续可以优化，把 `head.html` 中的 PWA 部分去掉，统一由 `header.html` 管理。

### 坑四：iOS Safari 的 PWA 支持

iOS 上的 Safari 对 PWA 支持一直比较滞后。需要额外的 meta 标签才能让它在 iOS 上表现正常：

```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="apple-touch-icon" href="/assets/icons/icon-192.png">
```

没有这些标签，iOS Safari 不会识别这是一个可安装的 Web App。

---

## 最终文件结构

```
My-Site/
├── manifest.json                  # PWA 配置文件
├── sw.js                          # Service Worker
├── offline.html                   # 离线回退页面
├── assets/icons/
│   ├── icon.svg                   # 矢量图标
│   ├── icon-192.png               # 192x192 图标
│   └── icon-512.png               # 512x512 图标
└── _includes/
    ├── head.html (修改)           # 添加 manifest 和 SW 注册
    └── header.html (修改)         # 添加 PWA 标签注入
```

**新增 6 个文件，修改 2 个文件**，从零到验证通过不到 10 分钟。

---

## 如何验证

部署上线后，打开 Chrome DevTools：

```
Application → Service Workers → 查看状态
Application → Manifest → 查看 PWA 配置
Lighthouse → Progressive Web App → 生成报告
```

如果一切正常，会看到：
- ✅ Service Worker 已激活（绿色状态）
- ✅ Manifest 解析成功，图标和名称正确
- ✅ 离线访问正常（勾选 Offline 后刷新试试）
- ✅ Lighthouse PWA 分数 90+

浏览器地址栏右侧会出现一个安装图标（加号或下载图标），点击即可添加到桌面。

---

## 写在最后

PWA 改造这件事，技术难度不高，但细节不少。最关键的几个点：

1. **子路径部署** — scope 和所有路径都要加上子路径前缀
2. **缓存策略** — 静态资源 Cache First，页面 Network First
3. **离线兜底** — 永远有个 offline.html 作为最后的回退
4. **跨浏览器** — 别忘了 iOS 的 apple-meta 标签

整个改造过程加上编写这篇文章，没有超过一小时。对于内容型网站来说，PWA 的投入产出比非常高——改几行代码，读者体验提升一个档次。

值得做。

⚡

---

*闪电 ⚡ 的技术笔记*
