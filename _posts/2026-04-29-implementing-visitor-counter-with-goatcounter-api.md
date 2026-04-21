---
layout: post
title: "使用 GoatCounter JSON API 实现个性化访客计数器"
date: 2026-04-29 10:00:00 +0800
categories: 技术 编程
---

在构建个人静态网站时，了解访客数据是一项基础需求。虽然 Google Analytics 功能强大，但对于追求隐私保护、轻量化和极简主义的开发者来说，[GoatCounter](https://www.goatcounter.com/) 是一个更完美的选择。

本文将详细介绍如何利用 GoatCounter 提供的 JSON API，在 Jekyll 站点中实现一个完全自定义、无缝嵌入的访客计数器。

## 为什么选择 JSON API？

GoatCounter 官方提供了一些快速集成的方案，如通过 `visit_count()` 函数生成的 HTML 或 SVG。但如果你希望：

1.  **完全掌控 UI**：计数器的数字就像站点原生的文字一样，没有任何外部样式干扰。
2.  **无品牌植入**：不显示“by GoatCounter”字样，保持极致简约。
3.  **零依赖**：不需要引入额外的库，仅使用原生 JavaScript。

那么，直接调用 JSON API 是最佳方案。

## 核心实现步骤

### 1. 准确获取页面路径

这是最关键的一步。由于静态站点的 URL 可能带有 `.html` 后缀，也可能省略，或者末尾带有斜杠。为了确保 API 请求的路径与后台记录的一致，我们利用 GoatCounter 脚本内置的方法：

```javascript
// 使用 count.js 提供的 get_data 方法获取规范化的路径 'p'
var path = window.goatcounter.get_data()['p'];
```

### 2. 获取单篇文章访问量

在 `_layouts/post.html` 中，我们添加一段轻量的脚本：

```javascript
window.addEventListener('load', function() {
    if (!window.goatcounter || !window.goatcounter.get_data) return;
    
    var path = window.goatcounter.get_data()['p'];
    var r = new XMLHttpRequest();
    
    r.addEventListener('load', function() {
        try {
            var data = JSON.parse(this.responseText);
            // 填充到指定的容器中
            document.querySelector('#stats-view-count').innerText = data.count || "0";
        } catch (e) {
            document.querySelector('#stats-view-count').innerText = "0";
        }
    });
    
    r.open('GET', 'https://[your-code].goatcounter.com/counter/' + encodeURIComponent(path) + '.json');
    r.send();
});
```

### 3. 获取全站总访问量

全站总计可以通过一个特殊的路径 `TOTAL` 来获取。我们通常将其放在 `_includes/footer.html` 中：

```javascript
r.open('GET', 'https://[your-code].goatcounter.com/counter/TOTAL.json');
r.send();
```

## 样式处理

由于我们只是将获取到的数字填充到 HTML 的 `<span>` 标签中，因此它会自动继承该位置的 CSS 样式（字体、颜色、字号等）。

```css
#stats-total-count {
  color: #38bdf8; /* 站点主题蓝 */
  font-weight: 600;
}
```

## 总结

通过这种方式，我们不仅保护了访客隐私（GoatCounter 不跟踪个人信息），还保持了网站的加载性能。整个计数逻辑在页面加载完成后异步执行，不会阻塞页面渲染，同时也为站点增添了一份动态的生命力。
