---
layout: code
title: "代码布局示例：Jekyll-TOC 插件使用指南"
date: 2026-04-27 10:00:00 +0800
categories: [技术, Jekyll]
tags: [Jekyll, TOC, Markdown, 插件]
difficulty: "#3498db"
level: "高级"
toc: true
---

# Jekyll-TOC 插件使用指南

## 介绍

Jekyll-TOC 是一个 Jekyll 插件，它能自动根据文章的 Markdown 标题生成目录。这对于长篇文章尤其有用，可以大大提升用户阅读体验。

### 为什么需要 TOC？

*   **提升导航性**：用户可以快速跳转到感兴趣的部分。
*   **概览文章结构**：提供文章的整体结构，帮助读者快速了解内容。
*   **优化 SEO**：搜索引擎可能会利用目录来更好地理解文章内容。

## 安装与配置

jekyll-toc 插件已经在 Gemfile 中引入并配置。

### Gemfile 配置

在 `Gemfile` 中，确保插件已添加。

### _config.yml 配置

在 `_config.yml` 中，确保 `jekyll-toc` 包含在 `plugins` 列表中。

## 在布局中使用

为了在页面中显示目录，您需要在布局文件中使用相应的 Liquid 过滤器。

### 布局示例

在布局文件中，我们可以在侧边栏中放置目录。

### 样式美化

通过简单的 CSS 样式，可以美化生成的目录。

## 文章配置

在需要生成目录的文章的 Front Matter 中，您需要添加 `toc: true`。

## 总结

通过插件，您可以轻松为 Jekyll 博客文章添加自动生成的目录，提升用户体验和内容结构化。
