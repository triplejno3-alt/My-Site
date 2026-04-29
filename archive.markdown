---
layout: default
title: 文章

permalink: /archive/
---

<div class="archive-wrapper wrapper">
  <h1 class="page-heading">文章归档</h1>

  <!-- 标签筛选栏（可折叠） -->
  <div class="archive-toolbar">
    <div class="tag-filter-header" onclick="toggleTagFilter()">
      <span class="tag-filter-label">🏷️ 标签筛选</span>
      <span class="tag-filter-toggle" id="filter-toggle">展开 ▾</span>
    </div>
    <div class="tag-filter-bar" id="tag-filter-bar" style="display:none;">
      <a href="{{ page.url | relative_url }}" class="tag-filter-btn {% unless page.tags or page.categories %}active{% endunless %}">全部</a>
      {% assign all_tags = site.posts | map: "tags" | flatten | uniq | sort %}
      {% for tag in all_tags %}
      <a href="?tag={{ tag | url_encode }}" class="tag-filter-btn" data-tag="{{ tag }}">{{ tag }}</a>
      {% endfor %}
    </div>
    <div class="archive-filter-info" id="filter-info"></div>
  </div>

  <div class="archive-list" id="archive-list">
    {% assign postsByYear = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
    {% for year in postsByYear %}
      <div class="archive-year-group" data-year="{{ year.name }}">
        <h2 class="archive-year">{{ year.name }}</h2>
        <ul class="post-list">
          {% for post in year.items %}
            <li class="post-item" data-tags="{{ post.tags | join: ',' }}" data-title="{{ post.title | escape }}">
              <span class="post-date">{{ post.date | date: "%m-%d" }}</span>
              <a class="post-link" href="{{ post.url | relative_url }}">
                {{ post.title | escape }}
              </a>
              {% if post.tags.size > 0 %}
              <span class="post-tags-mini">
                {% for tag in post.tags %}
                <a href="?tag={{ tag | url_encode }}" class="post-tag-link">{{ tag }}</a>
                {% endfor %}
              </span>
              {% endif %}
            </li>
          {% endfor %}
        </ul>
      </div>
    {% endfor %}
  </div>
</div>

<script>
(function() {
  'use strict';

  // 折叠切换
  window.toggleTagFilter = function() {
    const bar = document.getElementById('tag-filter-bar');
    const toggle = document.getElementById('filter-toggle');
    const isHidden = bar.style.display === 'none';
    bar.style.display = isHidden ? 'flex' : 'none';
    toggle.textContent = isHidden ? '收起 ▴' : '展开 ▾';
    localStorage.setItem('tagFilterCollapsed', isHidden ? '0' : '1');
  };

  // 从 URL 读取 tag 参数
  const params = new URLSearchParams(window.location.search);
  const activeTag = params.get('tag');

  // 如果有激活的标签，自动展开筛选栏
  if (activeTag) {
    const bar = document.getElementById('tag-filter-bar');
    const toggle = document.getElementById('filter-toggle');
    bar.style.display = 'flex';
    toggle.textContent = '收起 ▴';
  } else {
    // 记住上次的折叠状态
    const collapsed = localStorage.getItem('tagFilterCollapsed');
    if (collapsed === '0') {
      document.getElementById('tag-filter-bar').style.display = 'flex';
      document.getElementById('filter-toggle').textContent = '收起 ▴';
    }
  }

  if (!activeTag) return;

  // 高亮标签按钮
  document.querySelectorAll('.tag-filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tag === activeTag) {
      btn.classList.add('active');
    }
  });

  // 更新标题和统计
  const heading = document.querySelector('.page-heading');
  const filterInfo = document.getElementById('filter-info');
  if (filterInfo) {
    filterInfo.textContent = `🏷️ 标签：${activeTag}`;
  }
  if (heading) {
    heading.textContent = `🏷️ ${activeTag}`;
  }

  // 过滤文章列表
  const yearGroups = document.querySelectorAll('.archive-year-group');
  let totalVisible = 0;

  yearGroups.forEach(group => {
    const items = group.querySelectorAll('.post-item');
    let visibleCount = 0;

    items.forEach(item => {
      const tags = (item.dataset.tags || '').split(',').map(t => t.trim());
      if (tags.includes(activeTag)) {
        item.style.display = '';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    if (visibleCount > 0) {
      group.style.display = '';
      totalVisible += visibleCount;
    } else {
      group.style.display = 'none';
    }
  });

  // 更新统计
  if (filterInfo) {
    filterInfo.textContent = `🏷️ 标签：${activeTag}（共 ${totalVisible} 篇文章）`;
  }
})();
</script>

<style>
  .archive-wrapper {
    padding: 4rem 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  .page-heading {
    font-size: 2.5rem;
    color: var(--primary);
    margin-bottom: 1.5rem;
    text-align: center;
  }

  /* 标签筛选栏（可折叠） */
  .archive-toolbar {
    margin-bottom: 2rem;
  }

  .tag-filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.7rem 1rem;
    background: var(--bg-light);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;
  }

  .tag-filter-header:hover {
    background: var(--border-color);
  }

  .tag-filter-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .tag-filter-toggle {
    font-size: 0.8rem;
    color: var(--text-light);
    transition: transform 0.2s;
  }

  .tag-filter-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 1rem;
    background: var(--bg-light);
    border-radius: 0 0 12px 12px;
    border: 1px solid var(--border-color);
    border-top: none;
    margin-top: 0;
  }

  .tag-filter-btn {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    text-decoration: none;
    color: var(--text-main);
    background: #fff;
    border: 1px solid var(--border-color);
    transition: all 0.2s;
  }

  .tag-filter-btn:hover {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .tag-filter-btn.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .archive-filter-info {
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-light);
    margin-top: 0.75rem;
  }

  .archive-year {
    font-size: 1.8rem;
    color: var(--accent);
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
    margin: 2rem 0 1rem;
  }
  .post-list {
    list-style: none;
    padding: 0;
  }
  .post-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--bg-light);
    flex-wrap: wrap;
  }
  .post-date {
    font-family: monospace;
    color: var(--text-light);
    font-size: 1rem;
    flex-shrink: 0;
    width: 60px;
  }
  .post-link {
    font-size: 1.1rem;
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s;
    flex: 1;
  }
  .post-link:hover {
    color: var(--accent);
  }

  .post-tags-mini {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .post-tag-link {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    border-radius: 12px;
    color: var(--accent);
    background: var(--bg-light);
    border: 1px solid var(--border-color);
    text-decoration: none;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .post-tag-link:hover {
    background: var(--accent);
    color: #fff;
  }

  /* ========== 响应式设计 ========== */

  @media (max-width: 768px) {
    .archive-wrapper {
      padding: 1.5rem 1rem;
    }
    .page-heading {
      font-size: 1.6rem;
      margin-bottom: 1rem;
    }
    .tag-filter-bar {
      padding: 0.75rem;
      gap: 0.3rem;
    }
    .tag-filter-btn {
      font-size: 0.7rem;
      padding: 0.25rem 0.6rem;
    }
    .tag-filter-label {
      font-size: 0.8rem;
      width: 100%;
      margin-bottom: 0.2rem;
    }
    .archive-year {
      font-size: 1.3rem;
    }
    .post-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.3rem;
    }
    .post-date {
      width: auto;
      font-size: 0.8rem;
    }
    .post-link {
      font-size: 1rem;
    }
    .post-tags-mini {
      margin-left: 0;
    }
  }

  @media (max-width: 480px) {
    .archive-wrapper {
      padding: 1rem 0.75rem;
    }
    .page-heading {
      font-size: 1.3rem;
    }
    .tag-filter-bar {
      padding: 0.5rem;
      border-radius: 8px;
    }
    .tag-filter-btn {
      font-size: 0.65rem;
      padding: 0.2rem 0.5rem;
    }
    .archive-year {
      font-size: 1.1rem;
      margin: 1.5rem 0 0.75rem;
    }
    .post-link {
      font-size: 0.9rem;
    }
    .post-tag-link {
      font-size: 0.65rem;
      padding: 0.1rem 0.4rem;
    }
  }
</style>
