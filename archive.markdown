---
layout: default
title: 归档
permalink: /archive/
---

<div class="archive-wrapper wrapper">
  <h1 class="page-heading">文章归档</h1>

  <div class="archive-list">
    {% assign postsByYear = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
    {% for year in postsByYear %}
      <div class="archive-year-group">
        <h2 class="archive-year">{{ year.name }}</h2>
        <ul class="post-list">
          {% for post in year.items %}
            <li class="post-item">
              <span class="post-date">{{ post.date | date: "%m-%d" }}</span>
              <a class="post-link" href="{{ post.url | relative_url }}">
                {{ post.title | escape }}
              </a>
            </li>
          {% endfor %}
        </ul>
      </div>
    {% endfor %}
  </div>
</div>

<style>
  .archive-wrapper {
    padding: 4rem 2rem;
    max-width: 800px;
    margin: 0 auto;
  }
  .page-heading {
    font-size: 2.5rem;
    color: var(--primary);
    margin-bottom: 3rem;
    text-align: center;
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
    align-items: baseline;
    gap: 1.5rem;
    padding: 0.8rem 0;
    border-bottom: 1px solid var(--bg-light);
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
  }
  .post-link:hover {
    color: var(--accent);
  }
</style>
