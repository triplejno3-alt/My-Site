---
layout: post_note
title: "Everything 完全指南：比 Windows 搜索快 100 倍的文件神器"
date: 2026-04-29 17:00:00 +0800
tags: [Windows, Everything, 文件搜索, 工具, 效率]
categories: [技术, 工具]
author: flash
summary: "Windows 自带的搜索慢得要命？Everything 能在一秒内搜遍你硬盘上的所有文件。这篇文章从使用到原理，带你彻底搞懂它为什么这么快。"
---

> 你搜一个文件，Windows 转圈转了 30 秒还没出来。
> Everything 已经打出结果了 —— 在你敲完关键词的那一瞬间。

## 什么是 Everything

[Everything](https://www.voidtools.com) 是 Windows 平台上的一款文件搜索工具，由澳大利亚开发者 David Carpenter 在 2008 年发布。它的核心卖点只有一句话：

**输入文件名，瞬间出结果。**

有多快？在 NTFS 格式的硬盘上，Everything 索引 100 万个文件只需要约 1 秒，搜索 100 万个文件只需要约 0.1 秒。相比之下，Windows 自带的搜索在同样条件下可能需要几十秒甚至更久。

安装包只有 1.4 MB，运行起来内存占用 20–60 MB。对于这样一个功能，简直轻得像一张纸。

---

## 基础使用

Everything 的使用简单到几乎没有学习成本：

1. 打开 Everything
2. 输入文件名的任何部分
3. 结果实时显示

### 搜索语法

| 操作 | 写法 | 示例 |
| :--- | :--- | :--- |
| 精确匹配 | `"完整文件名"` | `"project_report.pdf"` |
| 通配符 | `*.txt` | 搜索所有 txt 文件 |
| 布尔 AND | `abc 123` 或 `abc !123` | 空格表示 AND |
| 布尔 OR | `abc \| 123` | `cat \| dog` |
| 排除 | `!abc` | `!temp` 排除含 temp 的文件 |
| 路径限定 | `\\path\\` | `C:\\Windows\\` 限定在某个目录 |
| 文件大小 | `size:>10mb` | 搜索大于 10MB 的文件 |
| 日期过滤 | `dm:2026-04-01..2026-04-29` | 搜索最近修改的文件 |

### 高级搜索（Ctrl + K）

你可以通过 **搜索 → 高级搜索**（或快捷键 `Ctrl + K`）打开可视化筛选面板，按大小、日期、属性、类型等维度组合过滤。

---

## 核心功能一览

- **实时搜索**：边打字边出结果，零延迟
- **正则表达式**：支持 `regex:` 前缀进行正则搜索
- **文件操作**：直接在结果列表中右键进行复制、删除、打开路径等
- **书签**：把常用搜索保存为书签，一键调用
- **HTTP 服务器**：内置 Web 服务，在局域网内通过浏览器搜索文件
- **命令行接口**：`es.exe` 命令行工具，可在脚本中集成 Everything
- **ETP 服务器**：使用 Everything 自己的协议远程搜索

---

## Everything 为什么这么快？—— 原理剖析

这是重点。Everything 之所以快得离谱，不是因为它用了什么黑魔法，而是因为它**不走寻常路**。

### 常规搜索为什么慢

要理解 Everything 的快，先理解 Windows 搜索为什么慢。

传统文件搜索的路径是：

```
用户输入关键词
  → 遍历文件系统目录树（递归读取每个文件夹）
    → 为每个文件读取文件系统元数据
      → 检查文件名是否匹配
        → 返回结果
```

这就像在一座没有索引的图书馆里找一本书——你得一本一本地看封面。

NTFS 的目录遍历虽然是 MFT（Master File Table，主文件表）的 B+ 树结构，但每次搜索都需要实时扫描目录节点，IO 开销非常可观。如果再加上 Windows Index 服务的文件内容解析、Office 文档分析、邮件索引……那就更慢了。

### Everything 的答案：读取 USN 日志

Everything 绕过了"遍历目录"这个步骤。它直接读取 NTFS 文件系统的 **USN 日志**（Update Sequence Number Journal）。

USN 日志是 NTFS 内部维护的一份**变更记录**。每次有文件被创建、删除、重命名或修改，NTFS 都会在 USN 日志中追加一条记录，记录变化发生的时间和文件名等元信息。

Everything 做的事情很简单：

1. **首次运行**：扫描 USN 日志，读出所有文件的名称、大小、修改日期，建立内存索引
2. **持续监听**：通过 `ReadDirectoryChangesW` API 监听文件系统的变更事件，实时更新内存索引
3. **搜索时**：直接在你输入的同时，对内存中的索引表进行前缀/子串/通配符匹配

整个过程中，**Everything 从来不去读文件夹的目录结构**，也不解析文件内容，更不索引文件本体。它只读了两样东西：

- USN 日志（一次性全量扫描）
- 文件系统变更通知（增量更新）

### 这样做的代价

世界上没有免费的午餐。Everything 的这种"取巧"方式也有代价：

| 好处 | 代价 |
| :--- | :--- |
| 几乎零延迟搜索 | **只能搜文件名**，不能搜文件内容 |
| 极低内存占用 | **只支持 NTFS**，FAT32、exFAT 只能扫描目录（变慢） |
| 无需手动触发索引 | **离线文件搜不到**，需要外接存储时重新扫描 |
| 安装包极小 | 依赖 NTFS USN 日志，在非 NTFS 卷上降级为普通遍历 |

也就是说，Everything 是一个**文件名搜索器**，不是内容搜索引擎。如果你要找"包含某个段落的Word文档"，它做不到——那是 Google Desktop 或 AnyTXT Searcher 的事。

### Everything vs 其他工具

| 维度 | Everything | Windows 搜索 | Listary | WizTree |
| :--- | :--- | :--- | :--- | :--- |
| 搜索速度 | ⚡ <1ms | 🐢 3–30s | ⚡ 1–5ms | ⚡ 1ms |
| 索引方式 | USN 日志 | Windows Index | USN + 钩子 | MFT 直接读取 |
| 内容搜索 | ❌ | ✅ | ❌ | ❌ |
| 安装大小 | 1.4 MB | 系统组件 | 3 MB | 1 MB |
| 收费 | 免费 | 免费 | 免费（Pro 付费） | 免费个人 |

**WizTree** 其实和 Everything 的取径类似——它也直接读取 MFT（Master File Table），所以磁盘空间分析极快。但 WizTree 的定位是可视化空间占用，Everything 则是实时的文件搜索入口。

---

## 在实际中怎么用

### 场景一：找文件

```
你：上次那个合同在哪儿来着？文件名大概是…… 2026_contract .pdf
Every：找到了 D:\Work\Projects\客户A\2026_contract_v3_final_真的最终版.pdf
```

文件还没输完，结果已经出来了。

### 场景二：批量操作

搜索 `*.tmp`，全选，删除——一键清空所有临时文件。

搜索 `size:>500mb`，快速定位大文件，看看哪些可以清理。

### 场景三：结合其他工具

Everything 支持命令行调用 `es.exe`，你可以把它集成到脚本里：

```batch
es.exe "*.jpg" > jpg_list.txt
```

然后丢给 Python 做批量处理。配合 Total Commander、Listary、AutoHotkey 等工具，效率翻倍。

---

## 一个值得尝试的替代品：FSearch

如果你是 Linux 或 macOS 用户，Everything 不支持你。但别急，有一个开源项目叫 [FSearch](https://github.com/cboxdoerfer/fsearch)，它是 Linux 上的 Everything 翻版。

FSearch 使用 GTK3 开发，原理和 Everything 类似——在 Linux 上通过读取文件系统的 `mlocate` 数据库或 inotify 监听来实现近乎实时的搜索。速度同样令人满意：

```bash
# Ubuntu/Debian 安装
sudo apt install fsearch

# 配置索引路径后即可使用
```

macOS 用户可以用 **Alfred** 的 Workflow 或者 **HoudahSpot** 来实现类似效果。

---

## 总结

Everything 是一款"做得少所以做得好"的软件。它放弃了内容搜索、放弃了跨平台、放弃了一切花哨的功能，专注做一件事——**极速搜索文件名**——然后做到了极致。

这在软件开发中其实是一个难得的哲学：**做减法比做加法更难。**

下次有人在 Windows 上找文件转圈圈的时候，把 Everything 甩给他。不用多解释，他输完关键词的那一瞬间，就懂了。

> Everything 定律：一个文件搜索器越想做得多，就做得越慢。Everything 什么都不想多管，于是它最快。
