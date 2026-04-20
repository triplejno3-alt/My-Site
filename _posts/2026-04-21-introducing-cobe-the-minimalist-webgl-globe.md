---
layout: post
title: "Introducing Cobe: A Minimalist WebGL Globe for Your Site"
date: 2026-04-21 10:00:00 +0800
categories: web-development javascript
---

在为个人网站添加装饰元素时，一个旋转的 3D 地球往往能瞬间提升网站的质感。然而，传统的 3D 库（如 Three.js）虽然功能强大，但体积庞大。如果你正在寻找一个极其轻量、专注且美观的解决方案，那么 **Cobe** 绝对是最佳选择。

## 什么是 Cobe？

[Cobe](https://github.com/shuding/cobe) 是一个极简的 WebGL 地球库。它的核心优势在于：

1.  **极小体积**：压缩后仅约 5KB。
2.  **高性能**：基于原生 WebGL，即使在低端设备上也能保持流畅。
3.  **高度可定制**：可以轻松添加标记点（Markers）、光晕、以及自定义的 HTML 标签。

## 如何在 HTML 中布局？

要在页面上展示地球，我们需要一个合理的 HTML 结构。由于 Cobe 是在 Canvas 上渲染的，建议使用一个相对定位的容器来包裹它，这样方便我们后续添加浮动的 HTML 标签。

```html
<!-- 地球容器 -->
<div id="cobe-container" style="width: 100%; max-width: 300px; aspect-ratio: 1; position: relative;">
  <!-- 用于渲染地球的 Canvas -->
  <canvas id="cobe" style="width: 100%; height: 100%; cursor: grab;"></canvas>
  
  <!-- 用于存放自定义 HTML 标签的容器 -->
  <div id="cobe-labels" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></div>
</div>
```

**关键点说明：**
- `aspect-ratio: 1`: 确保容器是正方形，适配圆形的地球。
- `position: relative`: 为内部的 `cobe-labels` 提供定位基准。
- `pointer-events: none`: 确保标签容器不会干扰到 Canvas 的鼠标拖拽交互。

## 核心配置与交互

Cobe 的强大之处在于其 `onRender` 回调。我们可以通过它来实现自动旋转、交互反馈以及 2D/3D 坐标转换。

### 1. 基础配置

```javascript
import createGlobe from 'https://esm.sh/cobe'

const globe = createGlobe(document.getElementById("cobe"), {
  devicePixelRatio: 2,
  width: 600,
  height: 600,
  phi: 0,
  theta: 0,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 12000,
  mapBrightness: 6,
  baseColor: [1, 1, 1],
  markerColor: [1, 0.5, 0],
  glowColor: [1, 1, 1],
  markers: [
    { location: [23.1291, 113.2644], size: 0.05 }, // 广州经纬度
  ],
  onRender: (state) => {
    // 自动旋转逻辑
    if (!pointerInteracting) {
      state.phi += 0.005;
    }
  }
})
```

### 2. 坐标转换与 HTML 标签

Cobe 最酷的功能之一是在 3D 地球上显示 HTML 标签。这需要将经纬度转换为 Canvas 上的 2D 坐标。

在 `onRender` 回调中，`state` 会提供当前的旋转角度。你可以使用球面坐标公式计算出每个标记点的位置，并动态更新对应 HTML 元素的 `left` 和 `top` 属性。

## 在 Jekyll 中的最佳实践

在 Jekyll 项目中，建议将上述代码提取到 `_includes/cobe.html`。这样你就可以在任何博文或页面中通过一行代码引用它：

```markdown
{% include cobe.html %}
```

这种组件化的方式不仅保持了代码的整洁，也让样式的统一修改变得轻而易举。

## 结语

Cobe 完美地平衡了美观与性能。它不是一个复杂的 3D 游戏引擎，而是一个优雅的视觉组件。如果你的网站需要一点点“全球化”的氛围，Cobe 就是那最后一块拼图。
