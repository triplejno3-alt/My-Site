---
layout: post_note
title: "给静态博客添加评论功能：方案对比与实战"
date: 2026-04-30 15:30:00 +0800
tags: [博客, Jekyll, Giscus, 评论, 前端]
categories: [技术, 博客]
author: flash
summary: "静态网站没有后端，怎么加评论？本文对比七大评论方案，从 Giscus 到 Disqus，从 Utterances 到 Twikoo，并手把手教你用 Giscus 给你的 Jekyll 博客装上评论功能。"
---

> 静态博客什么都好——快、安全、不用维护服务器——但有个致命伤：**没有评论功能**。
>
> 没有评论区，文章写完就像往大海里扔了个漂流瓶。你不知道谁读过了、谁有疑问、谁想跟你讨论。
>
> 这篇文章帮你解决这个问题。我会对比主流方案，然后手把手接入 Giscus——目前最优雅的静态博客评论方案。

---

## 一、为什么静态博客默认没有评论？

Jekyll、Hugo、Hexo 这类静态站点生成器的工作方式是把 Markdown 渲染成 HTML，然后扔到 CDN 上。**没有服务器、没有数据库、没有后端逻辑。**

评论功能本质上需要三件事：

1. **存储** — 评论数据放在哪里
2. **身份认证** — 怎么知道是谁在说话
3. **反垃圾** — 防止机器人刷屏

这三样静态站点一样都没有，所以必须借助**第三方服务**。

---

## 二、七大评论方案横评

### 2.1 Giscus ⭐ 强烈推荐

| 维度 | 评价 |
|------|------|
| 后端 | GitHub Discussions（仓库里的 Discussion 板块） |
| 登录 | GitHub 账号 |
| 免费 | ✅ 完全免费 |
| 数据自主 | ⭐⭐⭐⭐⭐ 数据在你仓库里 |
| 反垃圾 | GitHub 的审核机制 |
| 通知 | GitHub 通知 |

**优点：**
- 基于 GitHub Discussions（比 Issues 更适合评论）
- 支持 Markdown、回复、表情反应（👍🚀）
- 无需自建服务器，零运维
- 可自定义主题

**缺点：**
- 评论者必须有 GitHub 账号（技术博客问题不大）

### 2.2 Utterances

| 维度 | 评价 |
|------|------|
| 后端 | GitHub Issues |
| 登录 | GitHub 账号 |
| 数据自主 | ⭐⭐⭐⭐⭐ |

和 Giscus 类似，但用 Issues 存储评论，**不如 Discussion 干净**（Issues 会混入真正的 Issue）。Giscus 就是 Utterances 的升级版，建议直接上 Giscus。

### 2.3 Gitalk

同样是 GitHub Issues 方案，但 UI 更精致一些。不过项目维护不如 Giscus 活跃。**备选。**

### 2.4 Twikoo

| 维度 | 评价 |
|------|------|
| 后端 | Vercel / 自建服务器 |
| 登录 | 邮箱、微信、QQ |
| 免费 | ✅ 免费额度足够 |
| 数据自主 | ⭐⭐⭐⭐ |

**优点：**
- 不需要 GitHub 账号，普通读者也能评
- 轻量，加载快
- 自带反垃圾

**缺点：**
- 需要部署到 Vercel（多一个运维点）
- 数据存在 LeanCloud 或 MongoDB

### 2.5 Waline

| 维度 | 评价 |
|------|------|
| 后端 | Vercel + LeanCloud |
| 登录 | 多种方式 |
| 免费 | ✅ |

Twikoo 的竞品，功能类似，支持更多登录方式。**如果你需要更丰富的登录选项，可以考虑。**

### 2.6 Disqus

| 维度 | 评价 |
|------|------|
| 免费版 | ✅ 有广告 |
| 登录 | Disqus / 社交账号 |
| 数据自主 | ❌ 数据归 Disqus |
| 隐私 | ❌ 追踪用户 |

曾经是业界标准，但现在**不太推荐**——免费版有广告、加载慢、追踪用户、数据不在你手上。

### 2.7 Cusdis

后起之秀，轻量、开源自托管，支持邮件通知。如果你喜欢 DIY 一切，可以试试，但比 Giscus 多几步配置。

---

## 三、方案选择建议

```
你的读者主要是 ─┬─ 技术圈朋友 → Giscus（首选，有 GitHub 账号）
               ├─ 普通用户   → Twikoo（免登录也可评）
               └─ 两者都有   → Giscus + 在文章末尾说明无需账号可发邮件
```

对于我的博客（读者以技术爱好者为主），**Giscus 是最优解**——零运维、数据自主、体验好。

---

## 四、实战：给你的 Jekyll 站点接入 Giscus

### 4.1 安装 Giscus GitHub App

打开 [github.com/apps/giscus](https://github.com/apps/giscus)，点击 **Install**，选择你的仓库（比如 `triplejno3-alt/triplejno3-alt.github.io`），授权它访问 Discussions。

### 4.2 开启仓库的 Discussions

在你的 GitHub 仓库页面：
- 点击 **Settings**
- 往下翻到 **Features**
- 勾选 **Discussions**
- （可选）设置 Discussion 分类，Giscus 默认用 `General` 就可以

### 4.3 获取配置

访问 [giscus.app](https://giscus.app)：
1. 在 **Repository** 输入你的仓库名（如 `triplejno3-alt/triplejno3-alt.github.io`）
2. 页面会自动校验并生成配置
3. 选择你喜欢的主题
4. 复制生成的 `<script>` 代码

生成的代码长这样：

```html
<script src="https://giscus.app/client.js"
        data-repo="你的用户名/你的仓库名"
        data-repo-id="R_kgDO..."
        data-category="General"
        data-category-id="DIC_kwDO..."
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="bottom"
        data-theme="preferred_color_scheme"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
```

### 4.4 嵌入到文章布局

把这段脚本放到 `_layouts/post.html`（或你用的自定义布局）的文章内容后面：

```html
<!-- 评论区 -->
<div class="post-comments">
  <h3>💬 评论</h3>
  <script src="https://giscus.app/client.js"
          data-repo="你的用户名/你的仓库名"
          data-repo-id="R_kgDO..."
          data-category="General"
          data-category-id="DIC_kwDO..."
          data-mapping="pathname"
          data-strict="0"
          data-reactions-enabled="1"
          data-emit-metadata="0"
          data-input-position="bottom"
          data-theme="preferred_color_scheme"
          data-lang="zh-CN"
          crossorigin="anonymous"
          async>
  </script>
</div>
```

### 4.5 添加 CSS 美化

```css
.post-comments {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}
.post-comments h3 {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
}
```

### 4.6 新文章自动关联

Giscus 使用 **`data-mapping="pathname"`**，它会自动根据当前页面的 URL 路径来匹配对应的 Discussion。所以每篇新文章发布后，第一次有人加载页面时，Giscus 会自动在该文章的路径下创建一个 Discussion。

**无需手动操作**，一劳永逸。

---

## 五、写在最后

```
Giscus + Jekyll = 💚
```

给你的静态博客加上评论功能，就像给一栋漂亮的房子装上了门铃——

以前：文章写完了，没人知道你在这。
现在：读者路过可以敲敲门，说一句"写得好！"或者"这里有问题"。

这种感觉，挺棒的。

如果你用了其他方案，或者遇到了配置问题，欢迎在评论区留言——当然，前提是你得先装上评论功能。😄
