---
layout: post_note
title: "RSS 技术全解析：原理、演进与标准之战"
author: flash
tags:
  - 技术
  - RSS
  - 互联网
  - 标准化
  - 信息获取
description: "从 XML 语法到 Google Reader 之死，一篇文章搞懂 RSS 的来龙去脉。"
---

> 在算法推荐把你关进信息茧房的今天，RSS 是你手里最后一把钥匙——它不猜你喜欢什么，它只给你订阅的东西。

---

## 一、RSS 是什么？—— 主动阅读的基石

RSS 的全称是 **Really Simple Syndication**（真正简单的聚合），一种基于 XML 的数据格式规范，实现了信息的标准化「分发」与「聚合」。

一个 RSS 系统有三个角色：

| 角色 | 做什么 | 例子 |
|------|--------|------|
| **发布者** | 提供内容源的网站 | 博客、新闻站、播客 |
| **聚合器** | 帮用户抓取和展示内容 | Feedly、Inoreader、NetNewsWire |
| **订阅者** | 选择信源、阅读内容 | 你 |

RSS 的核心价值在于 **用户主导信息获取**——你选信源，你控制频率，没有算法干预，没有隐私追踪。

### 做一个简单的 SWOT

**优势**
- 去中心化：不依赖任何平台
- 隐私友好：不追踪点击、不建立画像
- 无广告干扰：纯内容消费
- 自主选择信源：不会被算法「优化」视野

**劣势**
- 技术门槛：需要找 RSS 链接、配置阅读器
- 无推送机制：依赖轮询
- 交互性差：不能点赞评论
- 平台支持度下降：微信、头条等封闭生态不支持

---

## 二、深入原理 —— 它是如何工作的？

### 工作流程三步骤

```
发布者                聚合器               订阅者
  │                     │                     │
  ├── 生成 XML Feed ──→ │                     │
  │                     ├── 轮询拉取 ────────→ │
  │                     │   (每N分钟一次)      │
  │                     │                     ├── 解析 XML
  │                     │                     ├── 对比 <guid>
  │                     │                     └── 展示新内容
  │                     │                     │
  └─────────────────────┴─────────────────────┘
```

1. **生成**：网站每发布新文章，自动更新一个 XML 文件（Feed）。这个文件里的每条内容都有固定字段：标题、链接、摘要、发布时间、唯一 ID。
2. **订阅**：用户在阅读器里输入该 Feed 的 URL。阅读器记住它，开始定期检查。
3. **拉取与解析**：阅读器每隔一段时间（一般 15~60 分钟）请求一次这个 URL。拿到 XML 后，解析出文章列表，和本地已有的记录对比 `<guid>`，看到新的就展示给你。

### 拉取 vs 推送

RSS 是**拉取模型**（Pull）——你主动去问「有新内容吗？」。这和社交媒体的**推送模型**（Push）相反——平台主动把内容塞到你面前。

拉取模型的优势：**你控制节奏**。你不会因为打开阅读器而被无关信息分散注意力。
拉取模型的代价：**不是实时**。如果阅读器每小时检查一次，你看到文章时可能已经发布一小时了。

### 增量更新检测

阅读器怎么知道哪些是新的？靠 `<guid>`。

每条 RSS 条目都有一个 `<guid>`（全局唯一标识符），通常是文章链接。阅读器会记录已读的 guid 列表，每次抓取新 Feed 时对比，只看那些没出现过的。这就是「标为已读」「标记未读」的技术基础。

---

## 三、历史的硝烟 —— 版本演进与标准之战

RSS 的历史是一部**标准分裂史**。同一个缩写，在不同时期代表不同的意思。

### 1997 — 史前时代

Dave Winer 在他的博客 `Scripting News` 里做了一个简单的 XML 格式来同步内容。这是 RSS 的雏形——一个只有标题和链接的简陋列表。

### 1999 — 网景入场（RSS 0.90 / 0.91）

网景（Netscape）为了推广 My.Netscape 门户，推出了 **RSS 0.90**。这里的 RSS 代表 **RDF Site Summary**，基于当时很时髦的 RDF（资源描述框架）语法，结构复杂得令人头大。

网景自己也嫌麻烦，很快推出了简化版 **RSS 0.91**，去掉了 RDF，改成了简单的 XML。这次 RSS 的含义变成了 **Rich Site Summary**。

### 2000 — 第一次分裂（RSS 1.0）

网景退出了这个项目。Dave Winer 接手了 0.91 的维护权。

但有一群人觉得 Dave 太「独裁」，而且 RSS 0.91 丢掉了 RDF 的语义网潜力。于是他们成立了 RSS-DEV 工作组，基于 RDF 推出了 **RSS 1.0**。这次 RSS 的含义又改回了 **RDF Site Summary**。

结果是：**两个互不兼容的 RSS** 并存在市场上。RSS 1.0 语法严谨但复杂，RSS 0.9x 简单粗暴但好用。

### 2002 — 一锤定音（RSS 2.0）

Dave Winer 发布了 **RSS 2.0**。这次 RSS 正式代表 **Really Simple Syndication**。2.0 与 0.91 向后兼容，新增了 `<enclosure>`（附件，催生了播客）、`<guid>` 等关键元素。它成为事实标准，至今仍是使用最广泛的版本。

### 2005 — 新挑战者（Atom 1.0）

RSS 2.0 有一个致命问题：**它是 Dave Winer 一个人的标准**。没有标准化组织背书，规范模糊的地方全靠作者一句话解释。

Google 等大厂坐不住了。他们联合在 IETF 起草了 **Atom 1.0**（RFC 4287），一个：
- 经过标准化组织背书的正式标准
- 语法更严谨、扩展性更强
- 完美支持国际化（UTF-8 原生支持）
- 区分了摘要（summary）和全文（content）

Atom 1.0 在语法严谨性上全面碾压 RSS 2.0，但 RSS 2.0 的生态已经太大了。

### 2005~2013 — 黄金时代

2005 年，Google 上线了 **Google Reader**。它成为最受欢迎的 RSS 阅读器，把 RSS 推向了普通用户。同时，Podcasting 的爆发也靠 RSS——`<enclosure>` 标签是播客分发的技术基础。

2013 年，Google 关闭了 Google Reader。理由是「使用量下降」，但更直接的原因是：**Google 的商业利益已经从「开放网络」转向了「封闭平台」**。RSS 让用户可以不看 Google 的广告就消费内容，这不符合商业逻辑。

Reader 关闭的那天，整个 RSS 生态受到重创。普通用户大量流失，很多阅读器随之倒闭。这一天被认为是 RSS 的「落日时刻」。

---

## 四、标准之争与技术详情 —— 语法的对决

### RSS 2.0：简单即正义

```xml
<rss version="2.0">
  <channel>
    <title>我的博客</title>
    <link>https://example.com</link>
    <description>记录技术思考</description>

    <item>
      <title>文章标题</title>
      <link>https://example.com/post/1</link>
      <description>这是摘要</description>
      <guid>https://example.com/post/1</guid>
      <pubDate>Mon, 17 May 2026 10:00:00 GMT</pubDate>
      <enclosure url="https://example.com/audio.mp3"
                 length="12345"
                 type="audio/mpeg"/>
    </item>
  </channel>
</rss>
```

**核心结构：** `<rss>` → `<channel>` → `<item>`

**关键元素：**

| 元素 | 含义 | 备注 |
|------|------|------|
| `<title>` | 文章/频道标题 | 必填 |
| `<link>` | 文章/频道链接 | 必填 |
| `<description>` | 文章/频道描述 | 必填（但很多人用来放全文） |
| `<guid>` | 唯一标识符 | **增量更新的核心**，通常 = 链接 |
| `<pubDate>` | 发布时间 | 格式：RFC 822（`Mon, 17 May 2026 10:00:00 GMT`）|
| `<enclosure>` | 附件 | **播客的基石**，包含 url/length/type |

**局限：**
- 时间格式是 RFC 822，不够直观
- 没有明确区分摘要和全文（很多人把全文塞进 description）
- 扩展性依赖自定义命名空间，规范模糊
- 实质上没有标准化组织维护

### RSS 1.0：语义网的理想

```xml
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
         xmlns="http://purl.org/rss/1.0/">
  <channel rdf:about="https://example.com">
    <title>我的博客</title>
    <link>https://example.com</link>
    <description>记录技术思考</description>
    <items>
      <rdf:Seq>
        <rdf:li resource="https://example.com/post/1"/>
      </rdf:Seq>
    </items>
  </channel>

  <item rdf:about="https://example.com/post/1">
    <title>文章标题</title>
    <link>https://example.com/post/1</link>
    <description>这是摘要</description>
  </item>
</rdf:RDF>
```

RSS 1.0 把 RDF（资源描述框架）引入了 Feed 格式。它的野心不只是分发内容，而是构建**语义网**——让机器理解内容之间的关系。

但理想丰满，现实骨感。RSS 1.0 语法更复杂，与 2.0 完全不兼容，普及度始终很低。现在的读者几乎不需要关心它。

### Atom 1.0：严谨的官方标准

```xml
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>我的博客</title>
  <link href="https://example.com"/>
  <updated>2026-05-17T10:00:00Z</updated>
  <author>
    <name>闪电</name>
  </author>

  <entry>
    <id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>
    <title>文章标题</title>
    <link href="https://example.com/post/1"/>
    <summary>这是摘要</summary>
    <content type="html">这是全文内容</content>
    <published>2026-05-17T10:00:00Z</published>
    <updated>2026-05-17T10:30:00Z</updated>
  </entry>
</feed>
```

Atom 1.0 被称为「RSS 2.0 的一切都做对了的版本」。它是 **IETF 标准（RFC 4287）**，由 Google、IBM 等大厂联合制定。

**相比 RSS 2.0 的关键改进：**

| 维度 | RSS 2.0 | Atom 1.0 |
|------|---------|----------|
| 标准化程度 | 个人标准（Dave Winer） | IETF 标准（RFC 4287） |
| 根元素 | `<rss>` → `<channel>` | `<feed>` |
| 时间格式 | RFC 822（`Mon, 17 May 2026 10:00:00 GMT`）| RFC 3339（`2026-05-17T10:00:00Z`）|
| 内容类型 | 一个 `<description>` 包揽所有 | 区分 `<summary>` 和 `<content>` |
| ID | `<guid>` 不强制要求是链接 | `<id>` 必须永久有效（如 UUID）|
| 作者信息 | 无结构化字段 | `<author>` 包含 name/email/uri |
| 扩展性 | 依赖自定义命名空间 | 标准化的扩展机制 |
| 国际化 | 隐式编码 | 显式 UTF-8 原生支持 |

**总结：** 如果你现在要开发新系统，应该用 Atom 1.0。但现实中，RSS 2.0 仍然是最广泛使用的格式——生态惯性太强了。

### 现状：一个阅读器需要支持所有格式

实际的 Feed 生态中，三种格式并存。好的阅读器必须：
1. 能解析 RSS 0.9x / RSS 2.0
2. 能解析 RSS 1.0（虽然很少见）
3. 能解析 Atom 1.0
4. 能优雅处理格式不规范的 Feed（很多网站生成的 XML 不标准）

以 NetNewsWire 为例，它的 Feed 解析器核心代码有数千行，专门用于处理各种边角情况——这就是「简单聚合」背后的不简单。

---

## 五、结语 —— RSS 在当下的意义

Google Reader 关闭 13 年后，RSS 没有死。它活在一个更低调的位置。

**谁在用 RSS ？**

- 开发者和技术写作者 — 博客圈从未离开过 RSS
- 研究人员 — 监控学术期刊、ArXiv 更新
- 信息收集者 — 用 RSS 搭建个人的情报管道
- 播客 — 整个播客生态建立在 RSS `<enclosure>` 之上

**谁在复兴 RSS ？**

- **RSSHub**（[rsshub.app](https://rsshub.app)）——「万物皆可 RSS」。你给它一个不支持 RSS 的网站，它帮你生成 RSS Feed。微博、B站、知乎、小红书……都能变成 Feed。
- **Follow 等现代阅读器**——用 AI 辅助筛选、用社区驱动发现，让 RSS 的使用体验现代化。
- **个人博客复兴**——越来越多技术人重新开始写独立博客，并且提供 RSS。

**RSS 代表的精神**

RSS 不只是一个技术格式。它代表的互联网价值观是：

> **用户拥有选择信源的权利。**

在算法推荐的时代，你把「看什么」的权利交给了平台。平台用 CTR、停留时长、广告收入来优化你的信息流——最终你的视野被限制在平台的利益边界之内。

RSS 把选择权还给你。你决定看什么，你决定不看什么，没有算法替你「优化」。

在信息过载的时代，它未必是效率最高的方式。但它可能是唯一一个让你**保持清醒**的方式。

---

### 延伸阅读

- RFC 4287 — Atom Syndication Format
- RSS 2.0 Specification by Dave Winer
- RSSHub 文档 — 万物皆可 RSS
- 《信息乌托邦》— 凯斯·桑斯坦（关于信息茧房的经典著作）
