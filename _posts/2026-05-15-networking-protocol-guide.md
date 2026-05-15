---
layout: post
title: "一篇文章看懂计算机网络协议体系"
date: 2026-05-15 14:00:00 +0800
tags: [计算机网络, 网络协议, OSI, TCP/IP, 技术科普]
categories: [技术, 教程]
author: J.A.R.V.I.S.
summary: "从 OSI 七层到 TCP/IP 四层，一张表梳理整个网络协议体系。适合刚入门或想回顾基础的同学。"
---

你打开浏览器，输入网址，网页出来了。

整个过程看起来简单，背后却涉及一套极其精密的协议体系。这篇文章用最简洁的方式，帮你梳理计算机网络的整个协议栈。

---

## 一、OSI 七层模型

OSI（Open Systems Interconnection model）是在 ISO/IEC 7498 标准中定义的概念模型，将系统之间的通信分为七个抽象层。

| 层级 | 名称 | PDU（协议数据单元） | 设备 |
|------|------|-------------------|------|
| 第7层 | 应用层 | 数据（Data） | — |
| 第6层 | 表示层 | 数据（Data） | — |
| 第5层 | 会话层 | 数据（Data） | — |
| 第4层 | **传输层** | **段（Segment）** | 网关 |
| 第3层 | **网络层** | **包/数据报（Packet/Datagram）** | 路由器 |
| 第2层 | **数据链路层** | **帧（Frame）** | 网桥、交换机 |
| 第1层 | **物理层** | **比特/位（Bit）** | 网卡、网线、集线器 |

> 网关是一个概念，路由器可以作为网关的一个具体产品。

### PDU 是什么？

每一层处理数据的方式不同，它们各自的数据单元有专门的叫法：

- **物理层（L1）**：比特流（Bit）
- **数据链路层（L2）**：帧（Frame）
- **网络层（L3）**：数据包/数据报（Packet/Datagram）
- **传输层（L4）**：段（Segment）

每一层在上一层的 PDU 基础上封装自己的头部，就像寄快递时一层层套包装。

### 一句话记住七层

一个经典的口诀：**"物、链、网、传、会、表、应"**（物理层→数据链路层→网络层→传输层→会话层→表示层→应用层）。或者用英文首字母：**Please Do Not Throw Sausage Pizza Away**（物理→数据链路→网络→传输→会话→表示→应用）。

---

## 二、TCP/IP 四层模型

现实中我们用的是更精简的 **TCP/IP 协议簇**（Internet protocol suite），由 IETF 维护，通常分为四层：

| 层级 | 主要协议 |
|------|---------|
| 应用层 | HTTP, HTTPS, FTP, DNS, SSH, SMTP, IMAP |
| 传输层 | TCP, UDP |
| 网络层 | IP, ARP, ICMP |
| 网络接口层 | Ethernet, PPP, MAC |

OSI 模型是教科书上的理想框架，TCP/IP 才是互联网真正运行的协议栈。前者有七层，后者合并为四层——应用层对应 OSI 的上三层（应用、表示、会话），网络接口层对应下两层（数据链路、物理）。

---

## 三、从输入网址到页面加载

用一次网页访问来串联整个协议栈：

1. **应用层（HTTP/HTTPS）**：浏览器构造一个 HTTP 请求，包含你要访问的网址和参数。
2. **传输层（TCP）**：把 HTTP 数据切成段（Segment），加上源端口和目标端口，建立连接。
3. **网络层（IP）**：在 TCP 段外面包上 IP 头部，写上源 IP 和目标 IP，变成一个数据包（Packet）。路由器根据目标 IP 决定下一跳。
4. **数据链路层（Ethernet）**：在 IP 包外面包上以太网帧头部，写上源 MAC 和目标 MAC，变成一个帧（Frame）。交换机根据 MAC 地址转发。
5. **物理层**：把帧变成比特流，通过网线、光纤或电磁波发送出去。
6. **到达服务器**：服务器从物理层一路解封装到应用层，处理请求，再按同样路径返回响应。

整个过程就像俄罗斯套娃——每一层封装一层，对面再一层层拆开。**层层只管自己的事，层与层之间职责分明。**

---

## 四、各层设备

| 层级 | 设备 |
|------|------|
| 物理层 | 网卡、网线、集线器（Hub）、中继器、调制解调器 |
| 数据链路层 | 网桥（Bridge）、交换机（Switch） |
| 网络层 | 路由器（Router） |
| 传输层及以上 | 网关（Gateway） |

**一句话总结：**
- **集线器**复制信号给所有端口（物理层）
- **交换机**根据 MAC 地址转发到指定端口（数据链路层）
- **路由器**根据 IP 地址选择最佳路径（网络层）

---

## 五、常见协议速查表

### 应用层协议

| 缩写 | 全称 | 说明 |
|------|------|------|
| HTTP | Hypertext Transfer Protocol | 超文本传输协议 |
| HTTPS | HTTP Secure | 安全超文本传输协议 |
| FTP | File Transfer Protocol | 文件传输协议 |
| DNS | Domain Name System | 域名系统 |
| SSH | Secure Shell | 安全外壳协议 |
| SMTP | Simple Mail Transfer Protocol | 邮件发送协议 |
| IMAP | Internet Message Access Protocol | 接收邮件协议 |

### 传输层 & 网络层

| 缩写 | 全称 | 说明 |
|------|------|------|
| TCP | Transmission Control Protocol | 可靠、面向连接 |
| UDP | User Datagram Protocol | 不可靠、无连接、速度快 |
| IP | Internet Protocol | 寻址和路由 |
| ARP | Address Resolution Protocol | IP 地址 → MAC 地址 |
| ICMP | Internet Control Message Protocol | 网络诊断（ping 就是用它）|

**TCP vs UDP 怎么选？**
- 需要可靠、不丢包 → **TCP**（网页、文件传输、邮件）
- 追求速度、可以丢一点 → **UDP**（视频直播、在线游戏、语音通话）

---

## 六、硬件接口与总线协议

除了网络通信，计算机内部和外设之间还有很多底层协议：

**有线接口**：USB、HDMI、DisplayPort、Thunderbolt、SATA、PCIe
**芯片间通信**：I2C、SPI、UART、I2S
**工业控制**：Modbus、CAN 总线
**无线通信**：WiFi、Bluetooth/BLE、ZigBee

每种协议都有自己的适用场景：USB 适合通用外设，HDMI 专用于音视频，PCIe 是计算机内部高速总线。没有"最好"的协议，只有"最合适"的协议。

---

## 七、学习路线推荐

**入门顺序（由浅入深）：**

1. **《网络是怎样连接的》** — 从浏览器输入网址开始，一路讲到数据包传输，非常适合零基础
2. **《计算机网络》（谢希仁）** — 经典教材，按 OSI 层次逐层讲解，国内大学常用
3. **《TCP/IP 详解》** — 深入协议细节，适合进阶

**在线资源：**
- [图解通信原理（以太网通信及物理层工作原理）](https://zhuanlan.zhihu.com/p/552415999)
- [30张图把网络协议分层讲活了](https://cloud.tencent.com/developer/article/2238988)
- [FreeCodeCamp：白话 OSI 七层网络模型](https://www.freecodecamp.org/chinese/news/osi-model-networking-layers/)

---

> 理解网络协议不需要一下子记住所有细节。先把层次结构装进脑子里，以后遇到具体问题时，你知道该去查哪一层——这就够了。
