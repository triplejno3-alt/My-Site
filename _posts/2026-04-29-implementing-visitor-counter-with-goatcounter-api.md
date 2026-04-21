---
layout: post
title: "使用 GoatCounter 实现个性化访客计数器：三种方法详解"
date: 2026-04-29 10:00:00 +0800
categories: 技术 编程
---

在构建个人静态网站时，了解访客数据是一项基础需求。虽然 Google Analytics 功能强大，但对于追求隐私保护、轻量化和极简主义的开发者来说，[GoatCounter](https://www.goatcounter.com/) 是一个更完美的选择。

GoatCounter 不仅提供了详尽的后台统计，还允许我们以多种方式将访问量显示在页面上。本文将详细介绍三种实现个性化访客计数的方法，从零代码到深度自定义。

## 方法一：最简单快捷的 SVG 图像法

如果你不想编写任何 JavaScript，或者希望在 Markdown 文件中直接显示访问量，SVG 图像法是最佳选择。GoatCounter 提供了一个动态生成的图片链接。

### 实现方式

你只需要在 HTML 或 Markdown 中插入一个 `<img>` 标签：

```html
<!-- 替换 [your-code] 为你的 GoatCounter 站点代码 -->
<img src="https://[your-code].goatcounter.com/counter/TOTAL.svg" alt="Total Views">
```

### 实际效果演示

下面是本站真实的 SVG 计数器预览（实时拉取）：

<p align="center">
  <img src="https://{{ site.goatcounter_code }}.goatcounter.com/counter/TOTAL.svg" alt="Realtime Total Views">
</p>

### 特点
- **优点**：零代码实现，支持缓存。
- **缺点**：样式固定（虽然支持一些参数调整，但不够灵活），无法完全融入文本。

---

## 方法二：轻量灵活的 JavaScript 钩子法

如果你已经在页面中引入了 GoatCounter 的统计脚本 `count.js`，可以利用它内置的 `visit_count` 选项。

### 实现方式

在你的 `count.js` 脚本配置中添加 `on_load` 钩子：

```html
<script data-goatcounter="https://[your-code].goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>

<script>
    window.goatcounter = {
        on_load: function() {
            // 当脚本加载完成后，会自动调用此函数
            // 你可以在这里处理显示逻辑
        }
    }
</script>

<!-- 在你希望显示数字的地方 -->
本站总访问量：<span id="demo-hook-count" style="color: #38bdf8; font-weight: bold;">0</span>
```

### 实际效果演示

这种方法能够让数字完美融入你的 UI 逻辑。例如，你可以配合 CSS 动画让数字在加载时跳动，或者将其放置在任何复杂的组件内部。

> **全站总访问量：<span id="demo-hook-count" style="color: #38bdf8; font-weight: bold;">正在加载...</span> 次**

<script>
    // 演示脚本：模拟 on_load 触发后的数据填充
    window.addEventListener('load', function() {
        var r = new XMLHttpRequest();
        r.addEventListener('load', function() {
            if (this.status === 200) {
                try {
                    var data = JSON.parse(this.responseText);
                    document.querySelector('#demo-hook-count').innerText = data.count || "0";
                } catch (e) {
                    document.querySelector('#demo-hook-count').innerText = "0";
                }
            }
        });
        r.open('GET', 'https://{{ site.goatcounter_code }}.goatcounter.com/counter/TOTAL.json');
        r.send();
    });
</script>

> **提示**：本站页脚（Footer）中的“全站总访问量”即采用了类似逻辑。

---

## 方法三：完全自定义的 JSON API 法

如果你希望计数器的数字就像站点原生的文字一样，没有任何外部样式干扰，且希望完全控制加载逻辑，那么直接调用 JSON API 是最佳方案。

1.  **完全掌控 UI**：计数器的数字就像站点原生的文字一样，没有任何外部样式干扰。
2.  **无品牌植入**：不显示“by GoatCounter”字样，保持极致简约。
3.  **零依赖**：不需要引入额外的库，仅使用原生 JavaScript。

那么，直接调用 JSON API 是最佳方案。

## JSON API 核心实现步骤

### 1. 准确获取页面路径

这是最关键的一步。由于静态站点的 URL 可能带有 `.html` 后缀，也可能省略，或者末尾带有斜杠。为了确保 API 请求的路径与后台记录的一致，我们利用 GoatCounter 脚本内置的方法。

同时，为了应对子目录部署（如 GitHub Pages）和字符编码问题，我们需要对路径进行适当的清洗：

```javascript
// 1. 获取规范化路径 'p'
// 2. decodeURIComponent 避免二次编码问题
// 3. 移除可能的项目名称前缀
var path = decodeURIComponent(window.goatcounter.get_data()['p'])
           .replace(/^\/My-Site/, '');
```

### 2. 获取单篇文章访问量

在 `_layouts/post.html` 中，我们添加一段轻量的脚本：

```javascript
window.addEventListener('load', function() {
    if (!window.goatcounter || !window.goatcounter.get_data) return;
    
    var path = decodeURIComponent(window.goatcounter.get_data()['p'])
               .replace(/^\/My-Site/, '');
    var r = new XMLHttpRequest();
    
    r.addEventListener('load', function() {
        if (this.status === 200) {
            try {
                var data = JSON.parse(this.responseText);
                document.querySelector('#stats-view-count').innerText = data.count || "0";
            } catch (e) {
                document.querySelector('#stats-view-count').innerText = "0";
            }
        } else {
            // 处理 404 等情况（如新页面尚未产生数据）
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

### 实际效果演示（本文实时数据）

通过 JSON API，我们可以直接在正文中插入当前的阅读量。这种方式不需要 `count.js` 脚本运行，而是直接通过前端请求拉取数据。

> **本文阅读次数：<span id="demo-api-count" style="color: #f472b6; background: rgba(244, 114, 182, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: bold;">正在加载...</span> 次**

<script>
    (function() {
        var updateAPIView = function() {
            var el = document.querySelector('#demo-api-count');
            if (!el) return;
            
            // 路径获取：优先使用 goatcounter 规范路径，否则降级使用当前 URL 路径
            var path = "";
            if (window.goatcounter && window.goatcounter.get_data) {
                path = decodeURIComponent(window.goatcounter.get_data()['p']);
            } else {
                // 降级方案：从 URL 获取 slug
                path = window.location.pathname.replace(/\/$/, "");
            }
            
            // 尝试几种常见的路径匹配格式以应对 404
            var pathsToTry = [
                path.replace(/^\/My-Site/, ''),             // 相对路径
                path.replace(/^\/My-Site/, '') + '.html',   // 带 .html
                path.split('/').pop()                       // 仅 slug
            ];

            var tryNextPath = function(idx) {
                if (idx >= pathsToTry.length) {
                    el.innerText = "0";
                    return;
                }
                var p = pathsToTry[idx];
                var r = new XMLHttpRequest();
                r.addEventListener('load', function() {
                    if (this.status === 200) {
                        try {
                            var data = JSON.parse(this.responseText);
                            el.innerText = data.count || "0";
                        } catch (e) { el.innerText = "0"; }
                    } else if (this.status === 404) {
                        tryNextPath(idx + 1); // 404 时尝试下一个候选路径
                    } else {
                        el.innerText = "0";
                    }
                });
                r.open('GET', 'https://{{ site.goatcounter_code }}.goatcounter.com/counter/' + encodeURIComponent(p) + '.json');
                r.send();
            };

            tryNextPath(0);
        };

        if (document.readyState === 'complete') { updateAPIView(); }
        else { window.addEventListener('load', updateAPIView); }
    })();
</script>

## 样式处理

由于我们只是将获取到的数字填充到 HTML 的 `<span>` 标签中，因此它会自动继承该位置的 CSS 样式（字体、颜色、字号等）。

```css
#stats-total-count {
  color: #38bdf8; /* 站点主题蓝 */
  font-weight: 600;
}
```

## 方法四：服务端 API 计数法 (GoatCounter API v0)

如果你需要在后端服务（如 Node.js, Go, Python）中记录事件，或者希望在命令行工具中集成统计，GoatCounter 的 API v0 提供了直接提交点击数据的功能。

### 实现方式

API v0 不仅支持记录访问，还支持查询、导出和管理。以下是核心接口参考：

| 动作 | 端点 | 说明 |
| :--- | :--- | :--- |
| **POST** | `/api/v0/count` | 统计页面浏览量（支持批量） |
| **GET** | `/api/v0/stats/total` | 获取站点全站浏览总数 |
| **GET** | `/api/v0/me` | 获取当前 Token 所属用户信息 |
| **GET** | `/api/v0/paths` | 获取所有已记录的路径列表 |
| **POST** | `/api/v0/export` | 创建一个新的 CSV 导出文件 |

**Bash 示例：**

```bash
# 使用你的 API Token 进行身份验证
token="1lf3lupfunccb7awges6d8v96pgprwubf38je1zgle0yw67w6c"
api="https://way.goatcounter.com/api/v0"

# 发送点击数据
curl -X POST "$api/count" \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $token" \
    --data '{"no_sessions": true, "hits": [{"path": "/one"}]}'

# 导出 CSV 数据
id=$(curl -X POST "$api/export" -H "Authorization: Bearer $token" | jq .id)
```

> **速率限制**: API 限制为每秒 4 个请求。错误信息会通过 `error` 或 `errors` 字段返回。

### 实际效果演示 (API 实验室)

点击下方按钮，我们将执行一系列 API 调用：首先为本文路径提交一个统计点击（这有助于修复方法三的 404 状态），然后实时拉取您的账户信息和全站统计指标。

<div style="padding: 20px; border: 2px dashed #38bdf8; border-radius: 12px; background: rgba(56, 189, 248, 0.05);">
    <div style="text-align: center; margin-bottom: 20px;">
        <button id="demo-api-lab-btn" style="background: #38bdf8; color: white; border: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.2s;">
            运行 API 链式请求测试
        </button>
        <p id="demo-api-lab-status" style="margin-top: 12px; font-size: 0.9rem; color: #64748b;">等待启动...</p>
    </div>
    
    <div id="demo-api-results" style="display: none; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left;">
        <!-- 用户信息卡片 -->
        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h4 style="margin-top:0; color: #0f172a; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 1.1rem;">👤</span> 账户信息
            </h4>
            <div style="font-size: 0.85rem; color: #475569; line-height: 1.6;">
                <p style="margin: 4px 0;"><strong>邮箱:</strong> <span id="res-me-email">...</span></p>
                <p style="margin: 4px 0;"><strong>创建于:</strong> <span id="res-me-date">...</span></p>
                <p style="margin: 4px 0;"><strong>Token 状态:</strong> <span style="color: #10b981; font-weight: 600;">有效 (v0)</span></p>
            </div>
        </div>
        <!-- 统计信息卡片 -->
        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h4 style="margin-top:0; color: #0f172a; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 1.1rem;">📈</span> 全站实时概览
            </h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="background: #f8fafc; padding: 8px 12px; border-radius: 6px;">
                    <span style="display: block; font-size: 0.7rem; color: #64748b; text-transform: uppercase;">总点击数 (Hits)</span>
                    <span id="res-total-hits" style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">0</span>
                </div>
                <div style="background: #f8fafc; padding: 8px 12px; border-radius: 6px;">
                    <span style="display: block; font-size: 0.7rem; color: #64748b; text-transform: uppercase;">独立访客 (Visitors)</span>
                    <span id="res-total-visitors" style="font-size: 1.25rem; font-weight: 800; color: #f472b6;">0</span>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    document.getElementById('demo-api-lab-btn').addEventListener('click', function() {
        var btn = this;
        var status = document.getElementById('demo-api-lab-status');
        var resultsDiv = document.getElementById('demo-api-results');
        
        var token = '1lf3lupfunccb7awges6d8v96pgprwubf38je1zgle0yw67w6c';
        var headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        };

        btn.disabled = true;
        btn.innerText = '执行中...';
        status.innerText = '第一步：正在提交测试点击 (/count)...';
        resultsDiv.style.display = 'grid';

        // 自动探测路径以辅助方法三
        var currentPath = window.location.pathname.replace(/^\/My-Site/, '');

        // 1. POST Count
        fetch('https://way.goatcounter.com/api/v0/count', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                no_sessions: true,
                hits: [
                    {path: '/test-api-v0', title: 'API Lab Test'},
                    {path: currentPath, title: document.title} // 同时为本文路径提交点击
                ]
            })
        })
        .then(function(response) {
            if (!response.ok) {
                return response.json().then(function(errData) {
                    throw new Error(errData.error || errData.errors || 'API 错误 ' + response.status);
                });
            }
            status.innerText = '第二步：正在拉取实时统计结果...';
            // 自动推断正确的 API 基础域名
            var apiBase = 'https://{{ site.goatcounter_code }}.goatcounter.com/api/v0';
            
            return Promise.all([
                fetch(apiBase + '/me', { headers: headers }).then(r => r.ok ? r.json() : { _err: r.status }),
                fetch(apiBase + '/stats/total', { headers: headers }).then(r => r.ok ? r.json() : { _err: r.status }),
                fetch(apiBase + '/sites', { headers: headers }).then(r => r.ok ? r.json() : { _err: r.status })
            ]);
        })
        .then(function(datas) {
            var userData = datas[0];
            var statsData = datas[1];
            var sitesData = datas[2];

            status.style.color = '#10b981';
            status.innerText = '✅ API 链式请求成功，正在解析有效指标...';

            // 填充用户信息 - 尝试从不同接口获取 Email
            var email = userData.email || (sitesData.sites && sitesData.sites[0] && sitesData.sites[0].plan);
            document.getElementById('res-me-email').innerText = email || '未公开 (Token 受限)';
            
            var date = userData.created_at || (sitesData.sites && sitesData.sites[0] && sitesData.sites[0].created_at);
            document.getElementById('res-me-date').innerText = date ? new Date(date).toLocaleDateString() : '未知';

            // 填充统计信息 - 兼容不同返回格式
            var hits = statsData.total_hits || statsData.total || (statsData.hits && statsData.hits.total) || 0;
            var visitors = statsData.total_visitors || statsData.visitors || (statsData.hits && statsData.hits.unique) || 0;
            
            document.getElementById('res-total-hits').innerText = hits.toLocaleString();
            document.getElementById('res-total-visitors').innerText = visitors.toLocaleString();
            
            if (hits === 0 && !statsData._err) {
                status.style.color = '#64748b';
                status.innerText = '⚠️ 请求成功但当前站点数据为空（可能是新站点或过滤了测试数据）。';
            }
        })
        .catch(function(err) {
            status.style.color = '#ef4444';
            status.innerText = '❌ ' + err.message;
        })
        .finally(function() {
            btn.disabled = false;
            btn.innerText = '重新运行测试';
        });
    });
</script>

---

## 四种方法对比

| 特性 | SVG 图像法 | JS 钩子法 | JSON API 法 | API v0 (后端) |
| :--- | :--- | :--- | :--- | :--- |
| **实现难度** | 极低 | 中等 | 高 | 进阶 |
| **自定义程度** | 低 | 中等 | 极高 | 深度定制 |
| **依赖项** | 无 | `count.js` | 原生 JS | API Token |
| **适用场景** | Markdown 预览 | 快速集成 | 主题深度定制 | 后端、命令行 |

## 总结

无论你是追求极致简便还是完美定制，GoatCounter 都能满足需求。通过 JSON API，我们不仅保护了访客隐私，还保持了网站的加载性能。整个计数逻辑在页面加载完成后异步执行，不会阻塞页面渲染，同时也为站点增添了一份动态的生命力。
