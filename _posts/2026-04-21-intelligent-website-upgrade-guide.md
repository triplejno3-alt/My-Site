---
layout: post
title: "给个人网站装上“眼睛”：实现天气感应主题与 3D 地球联动"
date: 2026-04-21 23:40:00 +0800
categories: [技术, 前端]
tags: [Jekyll, JavaScript, CSS, 交互设计, API]
---

静态网站，如基于 Jekyll 构建的博客，通常以其简洁、高效而著称。但“静态”不应等同于“呆板”。在本次升级中，我们为个人网站添加了一系列智能化功能，让它能够感知访客、变换色彩，甚至在 3D 地球上与访客“打招呼”。

这篇教程将详细记录我们是如何一步步实现以下功能的：

1.  **访客感知**：通过 Web API 获取访客的地理位置和实时天气。
2.  **天气感应主题**：网站的配色方案能根据天气（晴、雨、阴）自动切换。
3.  **手动+自动主题切换**：在自动匹配的基础上，增加手动切换及本地持久化。
4.  **Cobe 地球联动**：在页脚的 3D 地球上高亮显示访客所在的城市。
5.  **性能优化**：利用 `localStorage` 缓存 API 数据，实现主题和位置的瞬间加载。

## 第一步：获取访客的地理位置与天气

要让网站“感知”访客，第一步是获取其地理位置。出于对用户隐私的尊重和体验的考虑，我们选择了基于 IP 的定位方案，这无需用户授权。

### 应对 CORS 和 HTTPS 挑战

在开发过程中，我们发现直接从前端（无论是本地 `localhost` 还是 `https://` 域名）请求许多地理位置 API 都会遇到浏览器的**混合内容（Mixed Content）**或**跨域资源共享（CORS）**策略拦截。

为了解决这个问题，我们实现了一个健壮的**多级回退（Fallback）**方案：

```javascript
async function fetchGeoLocation() {
  // 首选：尝试支持 HTTPS 且对 CORS 友好的 ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      // 注意字段名差异
      return { city: data.city, lat: data.latitude, lon: data.longitude };
    }
  } catch(e) {
    console.warn("ipapi.co failed, trying fallback...");
  }
  
  // 终极备选：JSONP，能绕过所有 CORS 限制
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.head.removeChild(script);
      resolve({ city: data.city, lat: data.lat, lon: data.lon });
    };
    
    script.src = `https://ip-api.com/json/?callback=${callbackName}`;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

获取到城市后，我们再通过 `https://wttr.in/${city}?format=j1` 获取详细的 JSON 格式天气数据。

## 第二步：天气感应的动态主题系统

我们利用 CSS 变量（Custom Properties）来构建主题系统，这是实现动态换肤的现代、高效方式。

### 1. 定义主题变量

在公共的 CSS 区域（例如 `header.html` 的 `<style>` 标签内），我们定义了多套主题的配色方案：

```css
/* 默认主题 */
:root {
  --primary: #2c3e50;
  --accent: #3498db;
  --bg-main: #ffffff;
  /* ...其他颜色 */
}

/* 晴天主题 */
html[data-theme='sunny'] {
  --primary: #d35400;
  --accent: #f39c12;
  --bg-main: #fffaf0;
}

/* 雨天主题 */
html[data-theme='rainy'] {
  --primary: #2c3e50;
  --accent: #3498db;
  --bg-main: #f4f6f7;
}
```

### 2. JavaScript 驱动切换

根据获取到的天气描述（如 `Sunny`, `Rainy`），我们动态地为 `<html>` 根元素设置 `data-theme` 属性：

```javascript
function getWeatherTheme(desc) {
  const d = desc.toLowerCase();
  if (d.includes('sunny') || d.includes('clear')) return 'sunny';
  if (d.includes('rain') || d.includes('shower')) return 'rainy';
  // ...
  return 'default';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
```

我们还添加了手动切换和 `localStorage` 持久化逻辑，确保用户偏好优先。

## 第三步：在 Cobe 地球上点亮访客城市

为了让互动体验升级，我们将访客的经纬度与页脚的 Cobe 3D 地球进行了联动。

### 使用自定义事件进行组件通信

由于天气获取和地球渲染是两个独立的组件，我们使用**自定义事件**来解耦：

**发布事件 (在 `header.html` 中):**

```javascript
const { city, lat, lon } = await fetchGeoLocation();
window.dispatchEvent(new CustomEvent('visitorLocationFound', { detail: { city, lat, lon } }));
```

**监听事件 (在 `cobe.html` 中):**

```javascript
let currentMarkers = [...initialMarkers];

window.addEventListener('visitorLocationFound', (e) => {
  const { lat, lon } = e.detail;
  if (lat && lon) {
    // 移除旧的访客标记，添加新的
    currentMarkers = currentMarkers.filter(m => m.color.join(',') !== '1,0,0');
    currentMarkers.push({ location: [lat, lon], size: 0.1, color: [1, 0, 0] });
    globe.update({ markers: currentMarkers });
  }
});
```

## 第四步：利用缓存实现瞬间加载

为了避免每次刷新都重新请求 API 导致的延迟和布局抖动，我们为天气信息和主题都加入了 `localStorage` 缓存。

*   **主题缓存**：在页面加载的最开始就读取本地存储的主题并应用，避免了主题色从默认到切换的闪烁。
*   **天气信息缓存**：同样，优先从缓存中读取并显示天气，同时在后台静默请求新数据并更新缓存。我们还为缓存设置了 30 分钟的有效期。

## 总结

通过这一系列升级，我们的静态网站仿佛拥有了“生命”和“智慧”。它不仅能为不同地域、不同天气下的访客展现独特的外观，还能通过 3D 地球实现有趣的互动。这些看似复杂的动态功能，实际上都可以通过巧妙的前端技术和免费 API 来实现，极大地提升了用户体验。