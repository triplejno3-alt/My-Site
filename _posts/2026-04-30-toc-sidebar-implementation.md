---
layout: post_note
title: "给博客加一个知乎同款的侧边目录：原理与实现"
date: 2026-04-30 23:00:00 +0800
tags: [Jekyll, CSS, JavaScript, 前端, 教程, 博客]
categories: [技术, 前端, 教程]
author: flash
summary: "知乎的文章目录固定在右侧，随滚动高亮当前章节——既直观又不打扰阅读。这篇文章拆解这个交互是怎么实现的，从 Liquid filter 到 CSS sticky 到 Intersection Observer，看完你也能自己做一个。"
---

逛知乎的时候，你有没有注意到右边那个不起眼的小目录？

它安安静静地贴着右侧，你往下翻，它跟着高亮当前章节。点击一下，页面平滑滚动过去。

这个交互看似简单，拆开来看，其实横跨了三个技术层：**服务端模板（Liquid）**、**布局（CSS）**、**交互（JavaScript）**。

我这篇博客用的就是同样的方案，写一篇文章把它说清楚。

---

## 整体架构

```
┌─────────────────────────────────────────────┐
│  文章 header（标题、作者、时间、标签）         │
├────────────────────────────────────┬────────┤
│                                    │  📑 目录│
│   文章正文                          │        │
│                                    │  · 起步 │
│   ## 起步                          │  · 原理 │
│                                    │    · 第1步│
│   ### 第一步                       │    · 第2步│
│                                    │  · 总结 │
│                                    │        │
├────────────────────────────────────┴────────┤
│  相关笔记 / 页脚                            │
└─────────────────────────────────────────────┘
```

一共三步：

1. **Liquid 把文章的标题提取出来，生成纯目录 HTML**
2. **CSS 把目录固定在右侧，做成「粘性侧边栏」**
3. **JavaScript 监听滚动，自动高亮当前阅读的章节**

每一步都不复杂，但组合起来效果很不错。

---

## 第一步：提取目录（Liquid）

Jekyll 是静态站点生成器，它在构建阶段就把 Markdown 转成了 HTML。这时候文章的 `##` 和 `###` 标题已经变成 `<h2>`、`<h3>` 标签了。

问题来了：我们需要在生成 HTML 之后、把 HTML 写入文件之前，把标题抓出来额外做成一份目录。

这就是 **jekyll-toc** 这个插件做的事。

### jekyll-toc 做了什么

Jekyll 在渲染文章时，Liquid 变量 `content` 里存的是**完整的文章 HTML**。jekyll-toc 提供了两个 Liquid filter：

- **`inject_anchors`**：扫描 `content` 里的 `<h2>`～`<h6>`，给每个标题加上 `id` 属性（如果还没有的话），方便锚点跳转。
- **`toc_only`**：同样扫描标题，但只提取它们的层级结构，生成一个嵌套的 `<ul>` 列表。

用法很简单：

```liquid
{% assign toc_html = content | toc_only %}
<nav>
  {{ toc_html }}
</nav>
```

生成出来的 HTML 长这样：

```html
<ul id="toc" class="toc-list">
  <li class="toc-item toc-h2"><a href="#整体架构">整体架构</a></li>
  <li class="toc-item toc-h2"><a href="#第一步提取目录liquid">第一步：提取目录</a>
    <ul>
      <li class="toc-item toc-h3"><a href="#jekyll-toc-做了什么">jekyll-toc 做了什么</a></li>
    </ul>
  </li>
  ...
</ul>
```

这里 `toc-h2` 和 `toc-h3` 是自动添加的 CSS 类名，告诉我们这是几级标题。

文章正文部分，用 `inject_anchors` 替换原始的 `content`：

```liquid
<div class="post-content">
  {{ content | inject_anchors }}
</div>
```

这样每个 `<h2>` 就有了一个稳定的 `id`，目录里的 `<a href="#...">` 才能跳转过去。

### 配置项

在 `_config.yml` 里可以控制目录深度：

```yaml
toc:
  min_level: 2      # 从 h2 开始
  max_level: 3      # 只到 h3，不要 h4/h5
```

如果某篇文章不想显示目录，frontmatter 里写 `toc: false` 就行。

---

## 第二步：粘性侧边栏（CSS）

目录 HTML 已经生成好了，接下来要把它放到右侧并固定住。

### 双栏布局

最外层用一个 Flexbox 容器：

```css
.post-layout-dual {
  display: flex;
  gap: 2rem;
  justify-content: center;
}
```

左栏（正文）宽度固定 800px：

```css
.post-main {
  flex: 0 1 800px;
}
```

右栏（目录）宽度固定 240px：

```css
.post-toc-sidebar {
  flex: 0 0 240px;
}
```

### 粘性定位

关键在这里——`position: sticky`。

```css
.toc-sticky {
  position: sticky;
  top: 2rem;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;
}
```

`position: sticky` 的行为很巧妙：

- 当页面还没往下滚到目录位置时，目录随着页面**正常流动**
- 一旦 `top: 2rem` 的条件被触发（即目录距视口顶部 <2rem），目录就**固定在原地不动**
- 页面继续往下，目录始终保持距视口顶部 2rem 的位置

这样你在读文章底部时，目录仍然在右侧可视范围内，不会滚走。

`max-height: calc(100vh - 4rem)` 保证目录不会超出屏幕高度，太长的话用 `overflow-y: auto` 内部滚动。

### 目录项的样式

每一行目录项的左侧有一条 2px 的灰色竖线：

```css
.toc-nav a {
  border-left: 2px solid transparent;
  padding-left: 0.75rem;
  color: #6b7280;
  transition: all 0.15s ease;
}

.toc-nav a:hover {
  color: #667eea;
  border-left-color: #667eea;
}
```

悬停时变紫，点击后高亮也是紫色。这个设计和知乎的竖线指示器异曲同工。

### 移动端适配

小屏没有空间放侧边栏，直接隐藏：

```css
@media (max-width: 1100px) {
  .post-toc-sidebar {
    display: none;
  }
}
```

宽度小于 1100px 时目录消失，文章回归单栏阅读，不受干扰。

---

## 第三步：滚动高亮（JavaScript）

硬骨头在这里——滚动时自动高亮当前章节。

### 原理

我们要做的是：

1. 收集目录中所有链接对应的页面标题元素（`<h2>`、`<h3>`）
2. 监听 `scroll` 事件
3. 每次滚动时，判断**当前视口位置对应哪个标题**
4. 给对应的目录项加上 `active` 类

就这么简单。但细节里有几个坑。

### 匹配标题元素

从目录链接的 `href` 里提取 `#id`，然后用 `document.getElementById()` 找到页面里的标题元素：

```javascript
var headings = [];

links.forEach(function(link) {
  var href = link.getAttribute('href');
  if (href && href.startsWith('#')) {
    var el = document.getElementById(href.substring(1));
    if (el) headings.push({ el: el, link: link });
  }
});
```

中文 URL 编码是个坑。`#什么是-Everything` 在页面里实际是 `id="什么是-Everything"`（Jekyll 生成了中文 ID），但链接的 `href` 值里中文可能被编码了。所以需要降级策略：

```javascript
// 第一次匹配失败时，用 decodeURI 再试一次
if (headings.length === 0) {
  links.forEach(function(link) {
    var href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      var decodedId = decodeURIComponent(href.substring(1));
      var el = document.getElementById(decodedId);
      if (el) headings.push({ el: el, link: link });
    }
  });
}
```

### 判断当前章节

有了标题元素列表，怎么知道用户正在读哪个？

最简单的办法——**从后往前遍历**，找到第一个 `offsetTop` 小于当前滚动位置的标题：

```javascript
function updateActiveLink() {
  var scrollY = window.scrollY + 80;  // +80 偏移让高亮提前一点

  var current = null;
  for (var i = headings.length - 1; i >= 0; i--) {
    if (headings[i].el.offsetTop <= scrollY) {
      current = headings[i];
      break;
    }
  }

  // 还没滚到任何标题时，默认高亮第一个
  if (!current && headings.length > 0) {
    current = headings[0];
  }

  // 移除所有 active，给当前加上
  links.forEach(function(l) { l.classList.remove('active'); });
  if (current) {
    current.link.classList.add('active');
  }
}
```

这里的 +80 是个「手感参数」——加上一个小偏移，让高亮比实际到达标题位置**稍微提前一点点**，体验更自然。

滚动事件绑定用 `{ passive: true }` 告诉浏览器不需要阻止默认行为，浏览器可以优化滚动性能：

```javascript
window.addEventListener('scroll', updateActiveLink, { passive: true });
```

### 为什么不建议用 Intersection Observer

很多文章会说「用 Intersection Observer 代替 scroll 事件」。但这里有一个尴尬的点：

Intersection Observer 监听的是**元素是否进入视口**。但一篇文章的标题通常只有 `<h2>` 加一点 padding，当它进入视口底部时**用户还没读到那里**。等它进入视口顶部时，又**已经开始看下一节了**。

用 scroll + offsetTop 来做，反而更容易控制「手感」——加个偏移量，在用户刚进入新章节时就切换高亮，体验更顺滑。

---

## 从实现到阅读体验的闭环

现在我们回头看整个流程：

```
用户写 Markdown（## 标题）
      ↓
Jekyll 构建（Liquid + jekyll-toc）
  → inject_anchors 给标题加 id
  → toc_only 生成目录 HTML
      ↓
CSS sticky 定位（右侧侧边栏）
      ↓
JS scroll 监听（高亮当前章节）
      ↓
用户滚动阅读时自动跟踪位置
```

每一步都简单，但连起来就是一个不少人在用的、觉得「挺舒服」的功能。

---

## 完整的 Liquid 代码

这两个 layout 文件的完整实现：

```html
---
layout: default
---
<div class="post-layout-dual">
  <div class="post-main">
    <article><!-- 文章正文 --></article>
  </div>

  {% if page.toc != false %}
  <aside class="post-toc-sidebar">
    <div class="toc-sticky">
      <div class="toc-header">📑 目录</div>
      {% assign toc_html = content | toc_only %}
      {% if toc_html != "" %}
      <nav class="toc-nav" id="tocNav">
        {{ toc_html }}
      </nav>
      {% endif %}
    </div>
  </aside>
  {% endif %}
</div>
```

注意这里的 `toc: false` 判断——不想显示目录的文章，在 frontmatter 写 `toc: false` 即可关闭。

---

## 一个小技巧：为什么用 `sticky` 而不是 `fixed`

`position: fixed` 也可以把目录固定在右侧。但有一个问题：**它会脱离文档流**。

如果目录比文章长（极少出现，一篇文章通常比目录长得多），`fixed` 的目录会盖住页脚。而 `sticky` 就不会——它只是在父容器范围内粘性定位，当父容器（`<aside>`）被页脚推出屏幕时，目录也跟着滚走，不会遮住东西。

这是 `sticky` 比 `fixed` 更优雅的根本原因。

---

## 总结

这个侧边目录的实现，说是前端技术，其实更像一个**编辑器思维**——把文章拆成「骨架」和「血肉」，骨架（标题）单独提取出来，放在顺手的位置，让读者随时知道自己看到哪了，想去哪里点一下就到。

所有代码加起来不到 80 行（Liquid + CSS + JS 三部分总合），但对阅读体验的提升是实打实的。下次你写博客时，不妨也加上这么一个侧边目录——**有时候，一个小改进比一个大功能更让人喜欢。**

---

> 本文的 TOC 就是它自己。你右手边看到的那个目录，就是你正在读的这篇文章的实现本身。
