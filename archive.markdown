---
layout: default
title: 文章

permalink: /archive/
---

<div class="archive-wrapper wrapper">
  <h1 class="page-heading">文章归档</h1>

  <!-- 多维筛选栏（可折叠） -->
  <div class="archive-toolbar">
    <div class="filter-header" onclick="toggleFilter()">
      <span class="filter-header-label">🔍 筛选</span>
      <span class="filter-header-toggle" id="filter-toggle">展开 ▾</span>
    </div>
    <div class="filter-panel" id="filter-panel" style="display:none;">

      <!-- 第一维：作者筛选 -->
      <div class="filter-dimension">
        <span class="filter-dim-label">✍️ 作者</span>
        <div class="filter-options" id="filter-author">
          <a href="#" class="filter-btn active" data-dim="author" data-val="">全部</a>
          {%- comment -%}从 author 单值字段收集{%- endcomment -%}
          {%- assign author_from_field = site.posts | map: "author" | compact | uniq -%}
          {%- comment -%}从 authors 数组字段收集：取每个数组的第一个值避免 nil{%- endcomment -%}
          {%- assign author_from_array = "" | split: "" -%}
          {%- for post in site.posts -%}
            {%- if post.authors -%}
              {%- for a in post.authors -%}
                {%- assign author_from_array = author_from_array | push: a -%}
              {%- endfor -%}
            {%- endif -%}
          {%- endfor -%}
          {%- assign author_from_array = author_from_array | uniq -%}
          {%- assign all_authors = author_from_field | concat: author_from_array | uniq | sort -%}
          {%- for author_key in all_authors -%}
            {%- unless author_key == "" or author_key == nil -%}
              {%- assign author_data = site.data.authors[author_key] -%}
          <a href="#" class="filter-btn" data-dim="author" data-val="{{ author_key }}">{{ author_data.name | default: author_key }}</a>
            {%- endunless -%}
          {%- endfor -%}
        </div>
      </div>

      <!-- 第二维：时间筛选 -->
      <div class="filter-dimension">
        <span class="filter-dim-label">📅 时间</span>
        <div class="filter-options" id="filter-time">
          <a href="#" class="filter-btn active" data-dim="time" data-val="">全部</a>
          {% comment %}Build year list manually to avoid Date/String sort issues{% endcomment %}
          {% assign year_names = "x" | split: "x" %}
          {% for p in site.posts %}
            {% capture y %}{{ p.date | date: "%Y" }}{% endcapture %}
            {% assign year_names = year_names | push: y %}
          {% endfor %}
          {% comment %} Get first 4 chars as year string {% endcomment %}
          {% assign year_list = "x" | split: "x" %}
          {% for y in year_names %}
            {% if y.size >= 4 %}
              {% assign y4 = y | slice: 0, 4 %}
              {% assign year_list = year_list | push: y4 %}
            {% endif %}
          {% endfor %}
          {% assign year_list = year_list | uniq | sort | reverse %}
          {% for year_name in year_list %}
          <a href="#" class="filter-btn" data-dim="time" data-val="{{ year_name }}">{{ year_name }}年</a>
          {% endfor %}
        </div>
      </div>

      <!-- 第三维：关键词筛选 -->
      <div class="filter-dimension">
        <span class="filter-dim-label">🏷️ 关键词</span>
        <div class="filter-options" id="filter-tag">
          <a href="#" class="filter-btn active" data-dim="tag" data-val="">全部</a>
          {% assign all_tags = site.posts | map: "tags" | flatten | uniq | sort %}
          {% for tag in all_tags %}
          <a href="#" class="filter-btn" data-dim="tag" data-val="{{ tag }}">{{ tag }}</a>
          {% endfor %}
        </div>
      </div>

      <div class="filter-info" id="filter-info"></div>
    </div>
  </div>

  <div class="archive-list" id="archive-list">
    {% comment %}Manually group posts by year to avoid Liquid sort issues{% endcomment %}
    {% assign year_keys = "x" | split: "x" %}
    {% for p in site.posts %}
      {% capture y %}{{ p.date | date: "%Y" }}{% endcapture %}
      {% assign year_keys = year_keys | push: y %}
    {% endfor %}
    {% assign year_keys = year_keys | uniq | sort | reverse %}
    {% for year_name in year_keys %}
      <div class="archive-year-group" data-year="{{ year_name }}">
        <h2 class="archive-year">{{ year_name }}</h2>
        <ul class="post-list">
          {% comment %}Filter posts by matching year{% endcomment %}
          {% for post in site.posts %}
            {% capture post_year %}{{ post.date | date: "%Y" }}{% endcapture %}
            {% if post_year == year_name %}
            {%- assign post_author = post.author | default: "" -%}
            {%- if post_author == "" and post.authors -%}
              {%- assign post_author = post.authors | join: "," -%}
            {%- endif -%}
            <li class="post-item"
                data-tags="{{ post.tags | join: ',' }}"
                data-title="{{ post.title | escape }}"
                data-author="{{ post_author }}"
                data-year="{{ post.date | date: '%Y' }}"
                data-month="{{ post.date | date: '%Y-%m' }}">
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
            {% endif %}
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
  window.toggleFilter = function() {
    const panel = document.getElementById('filter-panel');
    const toggle = document.getElementById('filter-toggle');
    const isHidden = panel.style.display === 'none';
    panel.style.display = isHidden ? 'block' : 'none';
    toggle.textContent = isHidden ? '收起 ▴' : '展开 ▾';
    localStorage.setItem('filterCollapsed', isHidden ? '0' : '1');
  };

  // 初始化折叠状态
  (function initCollapse() {
    const collapsed = localStorage.getItem('filterCollapsed');
    if (collapsed === '0') {
      document.getElementById('filter-panel').style.display = 'block';
      document.getElementById('filter-toggle').textContent = '收起 ▴';
    }
  })();

  // 当前激活的筛选条件
  const filters = { author: '', time: '', tag: '' };

  // 执行筛选
  function applyFilters() {
    const items = document.querySelectorAll('.post-item');
    const yearGroups = document.querySelectorAll('.archive-year-group');
    let totalVisible = 0;

    items.forEach(item => {
      let show = true;

      // 作者筛选（支持单个 author 或多个 authors 含逗号的情况）
      if (filters.author) {
        const authors = item.dataset.author || '';
        if (!authors.split(',').map(a => a.trim()).includes(filters.author)) show = false;
      }

      // 时间筛选
      if (filters.time) {
        // 匹配年或年月
        if (!item.dataset.year.includes(filters.time) && !item.dataset.month.includes(filters.time)) show = false;
      }

      // 关键词筛选
      if (filters.tag) {
        const tags = (item.dataset.tags || '').split(',').map(t => t.trim());
        if (!tags.includes(filters.tag)) show = false;
      }

      item.style.display = show ? '' : 'none';
      if (show) totalVisible++;
    });

    // 隐藏空的年份组
    yearGroups.forEach(group => {
      const visibleItems = group.querySelectorAll('.post-item[style*="display: none"]');
      const totalItems = group.querySelectorAll('.post-item');
      if (visibleItems.length === totalItems.length) {
        group.style.display = 'none';
      } else {
        group.style.display = '';
      }
    });

    // 更新信息栏
    const info = document.getElementById('filter-info');
    const activeFilters = Object.entries(filters).filter(([, v]) => v);
    if (activeFilters.length > 0) {
      const labels = activeFilters.map(([k, v]) => {
        const names = { author: '作者', time: '时间', tag: '关键词' };
        return `${names[k]}: ${v}`;
      }).join(' · ');
      info.textContent = `🔍 ${labels}（共 ${totalVisible} 篇）`;
      info.style.display = 'block';
    } else {
      info.style.display = 'none';
    }

    // 更新页面标题
    const heading = document.querySelector('.page-heading');
    if (filters.tag) {
      heading.textContent = `🏷️ ${filters.tag}`;
    } else if (filters.author || filters.time) {
      heading.textContent = '📂 筛选结果';
    } else {
      heading.textContent = '文章归档';
    }
  }

  // 绑定筛选按钮点击
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const dim = this.dataset.dim;
      const val = this.dataset.val;

      // 更新该维度的 active 状态
      const siblings = this.closest('.filter-options').querySelectorAll('.filter-btn');
      siblings.forEach(s => s.classList.remove('active'));
      this.classList.add('active');

      // 更新筛选条件
      filters[dim] = val;

      // 如果选了具体的值，更新信息栏对应维度的文字
      applyFilters();
    });
  });
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

  /* 筛选栏 */
  .archive-toolbar {
    margin-bottom: 2rem;
  }

  .filter-header {
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

  .filter-header:hover {
    background: var(--border-color);
  }

  .filter-header-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-main);
  }

  .filter-header-toggle {
    font-size: 0.8rem;
    color: var(--text-light);
  }

  .filter-panel {
    background: var(--bg-light);
    border-radius: 0 0 12px 12px;
    border: 1px solid var(--border-color);
    border-top: none;
    padding: 0.75rem 1rem;
  }

  .filter-dimension {
    margin-bottom: 0.75rem;
  }

  .filter-dimension:last-child {
    margin-bottom: 0;
  }

  .filter-dim-label {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-light);
    min-width: 60px;
    margin-right: 0.5rem;
  }

  .filter-options {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .filter-btn {
    display: inline-block;
    padding: 0.25rem 0.7rem;
    border-radius: 20px;
    font-size: 0.8rem;
    text-decoration: none;
    color: var(--text-main);
    background: #fff;
    border: 1px solid var(--border-color);
    transition: all 0.15s;
    cursor: pointer;
  }

  .filter-btn:hover {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .filter-btn.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }

  .filter-info {
    text-align: center;
    font-size: 0.85rem;
    color: var(--accent);
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px dashed var(--border-color);
    display: none;
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

  /* ========== 响应式 ========== */

  @media (max-width: 768px) {
    .archive-wrapper {
      padding: 1.5rem 1rem;
    }
    .page-heading {
      font-size: 1.6rem;
      margin-bottom: 1rem;
    }
    .filter-panel {
      padding: 0.5rem 0.75rem;
    }
    .filter-dim-label {
      display: block;
      margin-bottom: 0.3rem;
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
