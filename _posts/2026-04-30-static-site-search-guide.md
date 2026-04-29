---
layout: post_note
title: "站内搜索实现指南：给静态网站装上'搜索'"
date: 2026-04-30 10:00:00 +0800
tags: [搜索, JavaScript, 前端, Jekyll, 教程]
categories: [技术, 前端, 教程]
author: flash
summary: "静态网站没有后端，搜索怎么做？别急着上 Algolia，几行代码就能搭一个够用的全文搜索。"
---

> 你的网站没有数据库、没有后端服务。
> 用户想找一篇文章，只能翻目录。
> —— 是时候给网站装个搜索了。

## 静态站点的搜索困境

动态网站（WordPress、Ghost 之类）搜索很简单——一条 SQL 搞定。但静态网站（Jekyll、Hugo、Astro）没有运行中的后端，也没数据库可以查。

常见的解法有几个：

| 方案 | 原理 | 成本 |
| :--- | :--- | :--- |
| **Algolia / Meilisearch** | 第三方搜索服务 | 免费版有限额，自建要服务器 |
| **Google 站内搜索** | 嵌入 Google 搜索结果 | 有广告，样式受限 |
| **Pagefind** | 构建时生成搜索索引 | 需要插件，生态不统一 |
| **自建前端搜索** | 预生成 JSON 数据源，前端 JS 匹配 | **零成本，完全可控** |

本站在用的就是第四种——自建前端搜索。这个方案的核心理念只有一句话：

**构建时生成数据，运行时只做匹配。**

---

## 第一步：准备数据源

静态网站在构建时（`jekyll build`），已经知道你所有文章的信息了——标题、链接、日期、标签、摘要。

把这些数据输出为一个 JSON 文件就行。

在 Jekyll 中，创建一个 `api/posts.json` 文件：

```liquid
---
layout: null
permalink: /api/posts.json
---
{
  "posts": [
    {% for post in site.posts %}
    {
      "title": {{ post.title | jsonify }},
      "url": {{ post.url | relative_url | jsonify }},
      "date": {{ post.date | date: "%Y-%m-%d" | jsonify }},
      "tags": {{ post.tags | jsonify }},
      "excerpt": {{ post.excerpt | strip_html | truncate: 200 | jsonify }}
    }{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]
}
```

构建后访问 `/api/posts.json`，就能得到一个包含所有文章的 JSON 数组。

```
[
  {
    "title": "Everything 完全指南",
    "url": "/My-Site/技术/工具/...",
    "date": "2026-04-29",
    "tags": ["Windows", "Everything", "文件搜索"],
    "excerpt": "Windows 自带的搜索慢得要命..."
  },
  ...
]
```

**这就是你的"数据库"。没有服务器，没有 SQL，一个 JSON 文件搞定。**

---

## 第二步：加载索引

页面加载时，把 JSON 拉下来：

```javascript
let searchIndex = [];

async function loadSearchIndex() {
  const resp = await fetch('/api/posts.json');
  const data = await resp.json();
  searchIndex = data.posts;
  console.log(`🔍 搜索索引加载完成，共 ${searchIndex.length} 篇文章`);
}
```

走 HTTP 请求，但因为 JSON 是静态文件，配合 CDN 缓存速度很快。索引大小通常只有几十 KB。

**容错降级**：如果 JSON 加载失败，还可以从 DOM 中提取文章列表作为后备：

```javascript
function buildIndexFromDOM() {
  const links = document.querySelectorAll('.post-link, .post-title a');
  const map = new Map();
  links.forEach(a => {
    const title = a.textContent.trim();
    const url = a.getAttribute('href');
    if (title && url && !map.has(url)) {
      map.set(url, { title, url });
    }
  });
  return Array.from(map.values());
}
```

---

## 第三步：匹配逻辑

搜索不需要复杂——**简单的子串匹配**对于个人站来说完全够用：

```javascript
function searchPosts(query) {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return searchIndex.filter(post => {
    return post.title.toLowerCase().includes(q) ||
           (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
           (post.tags && post.tags.some(t => t.toLowerCase().includes(q)));
  }).slice(0, 30);
}
```

它干了三件事：
1. 搜索**标题**有没有匹配
2. 搜索**摘要**有没有匹配
3. 搜索**标签**有没有匹配

三个条件满足一个就算命中。前 30 条结果，再多用户也看不过来。

> 为什么不加模糊搜索、拼音匹配、纠错？
> 因为对个人博客来说，用户搜"everything"就知道要找什么，不需要百度级别的搜索引擎。
> **做得少，所以做得好**——这个道理在 Everything 那篇文章里聊过了。

---

## 第四步：渲染结果

有了匹配结果，展示到界面上：

```javascript
function renderResults(results, query) {
  const container = document.getElementById('search-results');
  const stats = document.getElementById('search-stats');

  if (results.length === 0) {
    container.innerHTML = `未找到包含 "${query}" 的文章`;
    stats.textContent = '共 0 条结果';
    return;
  }

  stats.textContent = `共 ${results.length} 条结果`;

  container.innerHTML = results.map(post => {
    return `
      <a href="${post.url}" class="search-result-item">
        <div class="result-title">${highlight(post.title, query)}</div>
        <div class="result-meta">${post.date} · ${post.url}</div>
      </a>
    `;
  }).join('');
}
```

**关键词高亮**是搜索体验的关键——用户想看到自己搜的词在结果里出现了：

```javascript
function highlightText(text, query) {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
```

把匹配部分包在 `<mark>` 标签里，然后加一点 CSS：

```css
.search-result-item mark {
  background: #fff3cd;
  color: #856404;
  border-radius: 2px;
  padding: 0 2px;
}
```

---

## 第五步：键盘导航

搜索框体验有个不成文的标准——**不能只靠鼠标**。

```javascript
input.addEventListener('keydown', function(e) {
  const items = document.querySelectorAll('.search-result-item');
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectNext(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectPrev(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    openSelected();
  } else if (e.key === 'Escape') {
    closeSearch();
  }
});
```

快捷键也得安排上：

```javascript
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
    e.preventDefault();
    openSearch();
  }
});
```

`Ctrl+K` 唤醒搜索——这条快捷键从 VS Code 开始，已经成为"搜索"的事实标准。

---

## 完整架构

把所有这些拼起来，你的站内搜索架构图是这样的：

```
构建时                    运行时
jekyll build
     │
     ▼
api/posts.json ──HTTP──▶  loadSearchIndex()
                              │
                              ▼
                          searchIndex[]  ← 内存中的"数据库"
                              │
                   用户输入 ──▶  searchPosts(query)
                              │
                              ▼
                          renderResults() → 展示匹配结果
```

全程没有后端服务器，没有数据库连接，没有第三方 API 调用。一个 JSON 文件 + 一段 JS 脚本。

**数据是构建时生成的，搜索是运行时在浏览器里做的——这是静态搜索的核心思想。**

---

## 一些进阶优化点

如果你想让搜索更好用，可以按需添加：

- **URL 分享**：把 `?q=关键词` 写入地址栏，用户可分享搜索结果页
- **防抖**：`input` 事件触发太频繁，加 150ms 防抖减少计算
- **中文分词**：简单方案是把文章按字符切分，但代价是索引膨胀
- **离线缓存**：配合 Service Worker 把 posts.json 缓存起来，断网也能搜
- **搜索历史**：localStorage 记录最近搜索的关键词

---

## 总结

自建前端搜索的思路很简单：

1. **构建时**：把所有文章输出成一个 JSON 文件
2. **加载时**：把 JSON 拉到浏览器内存里
3. **搜索时**：用 JavaScript 做子串匹配
4. **展示时**：高亮关键词，支持键盘导航

没有后端，没有付费服务，没有复杂配置。对于一个个人博客来说，这套方案够了。

> 如果你有几千篇文章，可以考虑换 Pagefind 或 Lunr.js。
> 但如果只是几十篇到几百篇——**自建搜索就是最好的搜索。**
