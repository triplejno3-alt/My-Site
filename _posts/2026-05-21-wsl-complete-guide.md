---
layout: post_note
title: "WSL 完全指南：从概念到原理，一篇文章吃透"
author: flash
tags:
  - WSL
  - Linux
  - Windows
  - 开发工具
  - 技术科普
categories: [技术, 教程]
summary: "Windows 上原生运行 Linux——WSL 是什么、怎么来的、怎么装、怎么用、原理是什么，一篇全部讲清楚。"
---

> 你有一台 Windows 电脑，想写代码、跑脚本、用 Docker。
> 但你发现自己卡在了"要不要装个虚拟机"这个问题上。

如果你也有过这个纠结，那你应该了解一下 **WSL**——Windows Subsystem for Linux。

这篇文章会从头到尾把 WSL 讲清楚：**概念 → 历史 → 原理 → 安装 → 使用**，一篇文章全链路吃透。

---

## 一、WSL 是什么？—— 核心概念

### 1.1 定义

**WSL（Windows Subsystem for Linux）** 是微软开发的一个兼容层/虚拟机方案，让你可以在 Windows 上**原生运行 Linux 环境**——不需要双系统，不需要虚拟机，不需要折腾驱动。

一句话总结：**WSL 让 Windows 和 Linux 的"边界"消失了。**

### 1.2 四大特点

| 特点 | 说明 |
|------|------|
| **无缝集成** | Linux 文件与 Windows 文件系统互通，共享网络与端口 |
| **性能较好** | WSL 2 包含完整的 Linux 内核，系统调用 100% 兼容 |
| **文件互通** | Windows 访问 Linux 文件路径 `\\wsl$\`，Linux 访问 Windows 路径 `/mnt/c/` |
| **命令行强大** | bash、zsh、python、gcc、git、ssh——Linux 生态全部可用 |

### 1.3 核心应用场景

- **开发者**：在 Windows 上编写和运行 Linux 环境的代码和脚本
- **学习 Linux**：零成本的 Linux 实操环境，无需安装双系统
- **使用 Linux 工具**：Docker（WSL 2 后端）、Git、SSH、GCC、Python、Node.js 等
- **运行 GUI 应用**：WSLg 让 Linux 图形界面程序直接在 Windows 桌面运行

### 1.4 WSL 1 vs WSL 2

| 维度 | WSL 1 | WSL 2 |
|------|-------|-------|
| **架构本质** | 系统调用翻译层 | 轻量级虚拟机 + 完整 Linux 内核 |
| **系统调用兼容性** | 部分兼容（约 90%）| **100% 兼容** |
| **文件 I/O 性能** | 较慢（跨文件系统时尤甚）| **极快**（在 Linux 文件系统内）|
| **Docker 支持** | ❌ 不支持 | ✅ 原生支持（Docker Desktop 可切换 WSL 2 后端）|
| **启动速度** | 极快 | 快（毫秒级）|
| **内存占用** | 低 | 稍高（有回收机制）|
| **推荐度** | 兼容场景 | ⭐ **推荐使用** |

**结论**：除非你因为特定的兼容性原因需要 WSL 1，否则直接选 **WSL 2**。

---

## 二、WSL 发展史

### 2.1 WSL 1：开创性的"翻译层"（2016 年）

WSL 的起源有点意外——它脱胎于微软一个被搁置的项目叫 **"Project Astoria"**，原本是为了让 Android 应用在 Windows 上运行。

**核心理念**：将 Linux 系统调用实时翻译为 Windows NT 系统调用。

与其说 WSL 1 是在"运行 Linux"，不如说它是在**假装自己是 Linux 内核**——当 Linux 程序发出一个 `open()` 或 `fork()` 调用时，WSL 1 的翻译层把它转成 NT 内核能理解的 `NtCreateFile` 或 `NtCreateProcess`。

**优势**：轻量、启动快、集成好。  
**局限**：文件 I/O 性能有瓶颈、部分系统调用不支持（如 `ptrace`、`cgroups`）、无法运行 Docker。

### 2.2 WSL 2：颠覆性的"完整内核"（2019 年）

2019 年微软 Build 大会上，WSL 2 的发布让所有人吃了一惊——微软放弃了自己写了三年的翻译层，转而使用**轻量级虚拟机内的完整 Linux 内核**。

**核心理念**：在轻量 VM 中运行微软定制的 Linux 内核。

关键突破：
- **100% 系统调用兼容**——因为是真正的 Linux 内核在处理调用
- **文件 I/O 性能提升数倍**——Linux 原生文件系统操作在 VM 内完成
- **Docker 可原生运行**——Docker Desktop 可以直接使用 WSL 2 作为后端
- **启动极快**——虽然用了虚拟机，但 WSL 2 的 VM 是极度精简的，毫秒级启动

### 2.3 WSL 的独立与现代化（2021–2023 年）

最初 WSL 是作为 Windows 操作系统的内置组件发布的。从 2021 年起，微软开始把 WSL **"解耦"**——从 Win 10 的一部分变成 **Microsoft Store 独立应用**。

这个转变的意义：
- **更新更快**：不需要等 Windows 大版本更新，WSL 可以在 Store 里独立迭代
- **更多用户能用**：旧版本 Windows 也能安装新版 WSL
- **功能大幅增强**：
  - ✅ `systemd` 支持（终于能用 `systemctl` 了）
  - ✅ 内存回收机制
  - ✅ 网络镜像模式（避免 IP 地址混乱）
  - ✅ WSLg（GUI 应用支持）

### 2.4 WSL 正式开源（2025 年）

2025 年，微软做出了一个标志性的决定：**将 WSL 的大部分核心代码开源**。开源仓库迅速在 GitHub 上公开，包含：

- `wsl.exe` —— Windows 端的命令行工具
- `wslservice.exe` —— 后台服务进程
- Linux 端的 init 守护进程
- Plan9 文件共享服务器

**闭源保留部分**：
- `lxcore.sys` —— Windows 内核驱动
- `p9rdr.sys` —— Plan9 重定向器驱动

这是 WSL 历史上最重大的里程碑之一——从微软内部的工具，变成了真正属于社区的开源项目。

---

## 三、WSL 的维护现状

### 3.1 核心主导：微软

虽然开源了，但微软仍然是 WSL 的核心维护者。WSL 最初由 Windows Kernel 团队开发，现在归属于 **Containers 和 Hyper-V 团队**。

核心职责：路线图规划、核心功能开发、缺陷修复。

### 3.2 开源协作：GitHub 社区

2025 年开源后的新模式：
- **官方 Bug 追踪**：通过 GitHub Issues 提交
- **代码审查**：社区可以查看所有源码变更
- **PR 贡献**：任何人都可以提交 Pull Request

### 3.3 生态伙伴：发行版厂商

各 Linux 发行版提供 WSL 镜像并适配 WSL 特性。Ubuntu、Debian、Alpine、Fedora 等主流发行版都有专门的 WSL 版本。

### 3.4 维护角色总结

| 角色 | 负责内容 | 类比 |
|------|---------|------|
| **微软** | 核心框架、内核、工具链 | 骨架 |
| **GitHub 社区** | Bug 报告、代码贡献、讨论 | 协作平台 |
| **发行版厂商** | 发行版镜像、软件包维护 | 血肉 |

---

## 四、官方信息源

### 🏢 Microsoft Learn

- **定位**：权威文档的第一站
- **用途**：学习基础知识、查阅命令参考、获取最佳实践
- **地址**：`learn.microsoft.com/en-us/windows/wsl/`

### 🐙 GitHub 仓库

- **定位**：源代码、社区互动中心
- **用途**：下载预览版、报告 Bug、查看更新日志、贡献代码
- **地址**：`github.com/microsoft/WSL`

### 💻 系统内置工具

- **命令行查询**：`wsl --help` / `wsl --status`
- **企业部署**：Intune / 组策略管理模板

### 📋 选择建议

| 需求 | 渠道 |
|------|------|
| 了解基础知识 | Microsoft Learn |
| 报告 Bug / 查看源码 | GitHub |
| 检查本地配置 | `wsl --status` |
| 企业批量部署 | Intune / 组策略 |
| 安装稳定版 | Microsoft Store |

---

## 五、WSL 安装指南

### 5.1 系统要求

| 条件 | 要求 |
|------|------|
| **操作系统** | Windows 10 版本 2004+ / Windows 11 |
| **架构** | x64（推荐）或 arm64 |
| **虚拟化** | BIOS/UEFI 中启用虚拟化（Intel VT-x 或 AMD-V） |

### 5.2 一键安装（推荐）

```bash
# 以管理员身份打开 PowerShell 或 Windows Terminal，运行：
wsl --install
```

就是这么简单。这条命令会：
1. 启用 WSL 功能
2. 启用虚拟机平台
3. 下载并安装默认 Linux 发行版（通常是 Ubuntu）
4. 重启后首次启动会自动完成配置

### 5.3 安装其他发行版

先看看有哪些可选：

```bash
wsl --list --online
```

安装指定发行版：

```bash
wsl --install -d Debian
wsl --install -d kali-linux
wsl --install -d Ubuntu-24.04
```

### 5.4 安装方式对比

| 方式 | 适用场景 | 命令/操作 |
|------|---------|----------|
| **一键安装** | 绝大多数用户 | `wsl --install` |
| **Microsoft Store** | 偏好图形界面 | 搜索"WSL"安装 |
| **手动安装** | 系统版本较旧 | 启用功能 + 下载内核包 |
| **离线安装** | 无网络/批量部署 | 下载 .appxbundle + 离线安装 |

### 5.5 验证安装

```bash
wsl --list --verbose
```

输出示例：
```
  NAME            STATE           VERSION
* Ubuntu-24.04    Running         2
```

### 5.6 WSL 1 ↔ WSL 2 切换

```bash
# 将指定发行版切换到 WSL 2
wsl --set-version Ubuntu-24.04 2

# 设置默认版本（新安装的发行版默认使用 WSL 2）
wsl --set-default-version 2
```

### 5.7 常见问题

| 问题 | 解决方案 |
|------|---------|
| `wsl --install` 只显示帮助文本 | 系统版本过低，需要手动安装 |
| 安装卡在 0.0% | 检查网络和代理设置，或手动下载 WSL 内核 |
| 虚拟化未启用 | 进入 BIOS/UEFI 开启 Intel VT-x 或 AMD-V |
| 忘记 Linux 密码 | 通过 PowerShell 执行 `wsl -u root passwd <用户名>` |
| 卸载发行版 | `wsl --unregister Ubuntu-24.04` |

### 5.8 安装后的推荐步骤

```bash
# 1. 更新软件包
sudo apt update && sudo apt upgrade -y

# 2. 安装开发工具
sudo apt install build-essential git curl wget

# 3. 配置 VS Code 远程开发
# 安装 Remote - WSL 扩展，然后在 WSL 里运行 code .

# 4. 安装 Windows Terminal（强烈推荐）
# Microsoft Store 搜索 "Windows Terminal" 安装即可
```

---

## 六、WSL 使用指南

### 6.1 核心管理命令

```bash
# 进入默认 WSL 发行版
wsl

# 进入指定发行版
wsl -d Ubuntu-24.04

# 以指定用户进入
wsl -d Ubuntu-24.04 -u root

# 直接执行命令（不进入交互式 shell）
wsl -- ls -la /home

# 列出所有发行版及状态
wsl --list --verbose

# 终止指定发行版
wsl --terminate Ubuntu-24.04

# 终止所有 WSL 实例（关闭 WSL 2 虚拟机）
wsl --shutdown

# 查看 WSL 版本信息
wsl --version

# 更新 WSL
wsl --update
```

### 6.2 文件系统互通

WSL 和 Windows 之间的文件互通非常方便：

| 方向 | 路径 | 示例 |
|------|------|------|
| **Windows → WSL** | `\\wsl$\Ubuntu-24.04\home\flash\project` | 在文件资源管理器里直接访问 |
| **WSL → Windows** | `/mnt/c/Users/Way/Documents` | 通过 `/mnt/` 挂载点访问 |

> ⚡ **性能提示**：如果你在处理大量文件读写，把项目代码**放在 WSL 内部**（如 `/home/flash/project/`），而不是放在 Windows 侧通过 `/mnt/c/...` 访问。Linux 原生文件系统比跨文件系统访问快很多。

### 6.3 开发环境配置

**VS Code 远程开发**：
1. 在 Windows 上安装 VS Code
2. 安装 **Remote - WSL** 扩展
3. 在 WSL 终端中运行 `code .`（会自动启动并连接到 WSL 环境）

**安装开发工具**（在 WSL 内）：

```bash
# Node.js
sudo apt install nodejs npm

# Python（通常已预装）
python3 --version

# Git（通常已预装）
git --version

# GCC/Clang
sudo apt install build-essential
```

**运行 GUI 应用（WSLg）**：
WSL 2 内置了 WSLg，Linux GUI 程序可以直接在 Windows 桌面上打开。试试：

```bash
sudo apt install gedit
gedit &
```

不需要额外配置，图形界面就会像原生 Windows 程序一样弹出。

### 6.4 高级管理

**备份与迁移**：

```bash
# 导出发行版为 tar 文件
wsl --export Ubuntu-24.04 D:\backups\ubuntu.tar

# 从 tar 文件导入新发行版
wsl --import Ubuntu-Backup D:\wsl\backup\ D:\backups\ubuntu.tar

# 移动发行版到其他目录
wsl --move Ubuntu-24.04 D:\wsl\ubuntu\
```

**配置资源限制（`.wslconfig`）**：

在 `%UserProfile%\.wslconfig` 中写入：

```ini
[wsl2]
memory=4GB
processors=4
swap=2GB
localhostForwarding=true
```

### 6.5 使用速查表

| 操作 | 命令 |
|------|------|
| 进入 WSL | `wsl` |
| 退出 WSL | `exit` |
| 查看发行版列表 | `wsl -l -v` |
| 终止发行版 | `wsl -t <发行版>` |
| 关闭所有 WSL | `wsl --shutdown` |
| 设置默认版本 | `wsl --set-default-version 2` |
| 更新 WSL | `wsl --update` |
| 备份发行版 | `wsl --export <发行版> <路径>` |
| 导入发行版 | `wsl --import <名> <路径> <tar文件>` |

---

## 七、WSL 工作原理

### 7.1 WSL 1 原理：系统调用翻译层

**关键组件**：
- `lxss.sys` / `lxcore.sys` —— 内核模式的系统调用翻译驱动
- **LXSS Manager 服务** —— 用户态的管理进程
- **Pico 进程** —— 一种特殊的 Windows 进程，拦截所有 Linux 系统调用

**工作流程**：

```
Linux ELF 二进制 → Pico 进程加载 → 发出 Linux 系统调用
                                        ↓
                    lxcore.sys 捕获系统调用
                                        ↓
                    翻译为 NT 系统调用（NtCreateFile, NtCreateProcess 等）
                                        ↓
                    Windows NT 内核执行
```

**特点**：
- ✅ 极轻量级（无需额外内核）
- ✅ 启动极快（毫秒级）
- ❌ 系统调用兼容性约 90%（部分调用不支持）
- ❌ 跨文件系统 I/O 性能有瓶颈

### 7.2 WSL 2 原理：轻量级 VM + 完整 Linux 内核

**关键组件**：
- **轻量级虚拟机**：基于 Hyper-V 的精简 VM（不是完整的 Hyper-V 虚拟机）
- **真实 Linux 内核**：微软定制的 Linux 内核，运行在 VM 内
- **WSL 服务**：用户态的管理和集成服务
- **init 守护进程**：WSL 特有的 init 进程（不是 systemd）
- **Plan9 文件共享**：用于 VM 和宿主机之间的文件互通

**工作流程**：

```
启动 WSL → Hyper-V 创建轻量级 VM
                ↓
        Linux 内核启动（毫秒级）
                ↓
        发行版容器初始化
                ↓
        系统调用由 Linux 内核直接处理
                ↓
        WSL 服务与宿主机通信同步
```

**为什么 WSL 2 的 VM 比传统虚拟机快这么多？**

传统虚拟机（VirtualBox、VMware）要模拟完整硬件（BIOS、磁盘控制器、网络适配器），然后完整启动一个操作系统。WSL 2 的 VM 使用了 **Hyper-V 的轻量级分区**：

- 没有模拟硬件——直接与 Windows 内核共享资源
- Linux 内核在编译时就为 WSL 做了特殊的瘦身配置
- 不启动完整的 GRUB/UEFI 引导过程
- 内存和 CPU 采用动态分配

结果是：**WSL 2 的 VM 在毫秒级完成启动**，同时拥有完整的内核兼容性。

**特点**：
- ✅ **100% 系统调用兼容**（真正的 Linux 内核）
- ✅ **文件 I/O 性能提升**（Linux 原生文件系统）
- ✅ **可运行 Docker**（`/var/run/docker.sock` 直接可用）
- ✅ **启动速度快**（毫秒级 VM 启动）
- ⚠️ 资源占用略高（VM 需要分配内存，但支持自动回收）

### 7.3 文件系统互通原理

WSL 使用了两种不同的文件系统：

| 文件系统 | 作用 | 路径 |
|---------|------|------|
| **VolFs** | Linux 原生文件系统（ext4） | `/`（`/home`, `/etc` 等） |
| **DriveFs** | Windows 文件系统兼容层 | `/mnt/c/`、`/mnt/d/` |

**Plan9 协议**：实现 VM ↔ 宿主机文件共享的底层协议。WSL 2 的 VM 内运行一个 Plan9 服务器，Windows 端通过 `p9rdr.sys` 驱动连接到这个服务器，实现**双向**文件访问。

### 7.4 开源现状

2025 年开源后的组件拆分：

| 组件 | 状态 | 说明 |
|------|------|------|
| `wsl.exe` | ✅ 开源 | Windows 端命令行工具 |
| `wslservice.exe` | ✅ 开源 | Windows 端后台服务 |
| Linux init | ✅ 开源 | VM 内的 init 守护进程 |
| Plan9 服务器 | ✅ 开源 | 文件共享协议实现 |
| `lxcore.sys` | 🔒 闭源 | Windows 内核级翻译驱动 |
| `p9rdr.sys` | 🔒 闭源 | Plan9 重定向器驱动 |

### 7.5 WSL 1 vs WSL 2 完整对比

| 维度 | WSL 1 | WSL 2 |
|------|-------|-------|
| **架构** | 系统调用翻译层 | 轻量 VM + 完整 Linux 内核 |
| **系统调用兼容** | ~90% | 100% |
| **文件 I/O 性能** | 跨系统有瓶颈 | Linux 侧极快 |
| **Docker 支持** | ❌ | ✅ |
| **磁盘占用** | 极小 | 略大（内核文件） |
| **内存占用** | 低 | 中等（可回收） |
| **启动速度** | 极快 | 极快（毫秒级）|
| **GUI 应用** | ❌（需额外配置） | ✅（WSLg 内置）|
| **systemd** | ❌ | ✅ |
| **跨 OS 文件访问** | 快（直接与 NTFS 交互） | 需通过 Plan9 协议 |

---

## 总结

从 2016 年的 WSL 1 到 2019 年的 WSL 2，再到 2025 年的正式开源，WSL 走过了近十年的发展历程。

回头看，这条路径很有意思：

1. **WSL 1** 用巧妙的系统调用翻译打破了"Linux 只能在 VM 里跑"的认知
2. **WSL 2** 则更进一步，直接拥抱了完整的 Linux 内核
3. **2025 年开源**，让它成为了社区共同维护的项目

WSL 对微软来说也是一个文化转变的信号——从一个"通吃一切"的 Windows 世界观，到真正接纳 Linux 作为一等公民。

现在，WSL 由**微软、开源社区和发行版厂商**三方共同维护，生态健康，更新活跃。对于在 Windows 上做开发的你来说，如果还没试过 WSL，那今天就可以开始——`wsl --install`，四步搞定。

---

## 附录：快速参考卡片

### 常用命令速查

| 命令 | 作用 |
|------|------|
| `wsl` | 进入默认发行版 |
| `wsl -d <发行版>` | 进入指定发行版 |
| `wsl -l -v` | 查看发行版列表 |
| `wsl -t <发行版>` | 终止发行版 |
| `wsl --shutdown` | 关闭所有 WSL |
| `wsl --set-default-version 2` | 设置默认 WSL 2 |
| `wsl --update` | 更新 WSL |
| `wsl --export <发行版> <路径>` | 备份发行版 |
| `wsl --import <名> <路径> <tar文件>` | 导入发行版 |
| `wsl --install` | 一键安装 |
| `wsl --install -d <发行版>` | 安装指定发行版 |

### 常见问题速查

| 问题 | 解决办法 |
|------|---------|
| 安装失败 | 检查 Win 10 版本 ≥ 2004，启用虚拟化 |
| 虚拟化未开启 | BIOS 开启 VT-x/AMD-V |
| 忘记密码 | `wsl -u root passwd <用户名>` |
| WSL 占用内存太高 | 配置 `.wslconfig` 限制内存 |
| 卸载发行版 | `wsl --unregister <发行版>` |

### 官方资源链接

| 资源 | 地址 |
|------|------|
| Microsoft Learn 文档 | `learn.microsoft.com/en-us/windows/wsl/` |
| GitHub 主仓库 | `github.com/microsoft/WSL` |
| WSL 内核仓库 | `github.com/microsoft/WSL2-Linux-Kernel` |
| Microsoft Store | 搜索 "WSL" |
