---
layout: default
title: 服务
permalink: /services/
---

<div class="services-page-wrapper wrapper">
  <h1 class="page-heading">💼 我的服务</h1>
  <p class="page-subtitle">我可以为你提供以下帮助</p>

  <div class="services-grid">
    <div class="service-card">
      <div class="service-icon">🌐</div>
      <h2>网站开发</h2>
      <p>从零搭建个人网站、企业官网、博客系统，支持响应式设计，适配移动端和桌面端。</p>
      <div class="service-tags">
        <span>HTML/CSS</span>
        <span>JavaScript</span>
        <span>Jekyll</span>
        <span>React</span>
      </div>
    </div>

    <div class="service-card">
      <div class="service-icon">🎨</div>
      <h2>UI/UX 设计</h2>
      <p>提供界面设计与用户体验优化服务，让你的产品更美观、易用。</p>
      <div class="service-tags">
        <span>Figma</span>
        <span>原型设计</span>
        <span>交互设计</span>
      </div>
    </div>

    <div class="service-card">
      <div class="service-icon">📊</div>
      <h2>数据可视化</h2>
      <p>将复杂数据转化为直观的可视化图表，帮助理解和决策。</p>
      <div class="service-tags">
        <span>D3.js</span>
        <span>ECharts</span>
        <span>Chart.js</span>
      </div>
    </div>

    <div class="service-card">
      <div class="service-icon">🔧</div>
      <h2>技术咨询</h2>
      <p>提供前端开发、架构设计、性能优化等方面的技术咨询服务。</p>
      <div class="service-tags">
        <span>架构设计</span>
        <span>性能优化</span>
        <span>代码审查</span>
      </div>
    </div>

    <div class="service-card">
      <div class="service-icon">📝</div>
      <h2>技术写作</h2>
      <p>撰写技术文档、教程文章、API 文档，帮助团队和社区更好地理解技术。</p>
      <div class="service-tags">
        <span>技术文档</span>
        <span>教程</span>
        <span>API 文档</span>
      </div>
    </div>

    <div class="service-card">
      <div class="service-icon">🎵</div>
      <h2>音乐教育工具</h2>
      <p>开发音乐理论教学工具，如谱号识别、音高训练、练耳等交互式学习应用。</p>
      <div class="service-tags">
        <span>Web Audio</span>
        <span>VexFlow</span>
        <span>互动教学</span>
      </div>
    </div>
  </div>

  <!-- 📞 联系我 -->
  <div class="contact-section">
    <h2 class="section-heading">📞 联系我</h2>
    <p class="section-subtitle">有任何问题或合作意向？欢迎随时联系我</p>

    <div class="contact-card">
      <div class="contact-methods">
        <a href="mailto:{{ site.email }}" class="contact-method-btn email-btn">
          <span class="contact-icon">📧</span>
          <span class="contact-label">发送邮件</span>
          <span class="contact-value">{{ site.email }}</span>
        </a>
        {% if site.github_username %}
        <a href="https://github.com/{{ site.github_username }}" target="_blank" class="contact-method-btn github-btn">
          <span class="contact-icon">🐙</span>
          <span class="contact-label">GitHub</span>
          <span class="contact-value">@{{ site.github_username }}</span>
        </a>
        {% endif %}
        <a href="mailto:{{ site.email }}?subject=合作咨询&body=您好，我对您的服务感兴趣，想了解更多详情。" class="contact-method-btn consult-btn">
          <span class="contact-icon">💬</span>
          <span class="contact-label">快速咨询</span>
          <span class="contact-value">点击发送合作邮件</span>
        </a>
      </div>
    </div>
  </div>

  <!-- 📅 预约会议 -->
  <div class="booking-section">
    <h2 class="section-heading">📅 预约会议</h2>
    <p class="section-subtitle">选择适合的时间，我们在线聊聊</p>

    <div class="booking-options">
      <div class="booking-card">
        <div class="booking-time">15 min</div>
        <p class="booking-desc">快速沟通，适合简单咨询</p>
        <a href="https://cal.com/j-triple-nh6try/15min" target="_blank" class="booking-btn">预约 15 分钟</a>
      </div>
      <div class="booking-card">
        <div class="booking-time">30 min</div>
        <p class="booking-desc">深入交流，适合详细讨论项目</p>
        <a href="https://cal.com/j-triple-nh6try/30min" target="_blank" class="booking-btn">预约 30 分钟</a>
      </div>
    </div>

    <div class="booking-embed">
      <div class="embed-label">或直接在下方选择时间预约：</div>
      <div class="cal-embed-container">
        <iframe 
          src="https://cal.com/j-triple-nh6try/30min?embed=true" 
          width="100%" 
          height="600" 
          frameborder="0" 
          style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        </iframe>
      </div>
    </div>
  </div>
</div>

<style>
  .services-page-wrapper {
    padding: 4rem 2rem;
    max-width: 1100px;
    margin: 0 auto;
  }


  .page-heading {
    font-size: 2.5rem;
    color: var(--primary);
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    text-align: center;
    color: var(--text-light);
    font-size: 1.1rem;
    margin-bottom: 3rem;
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .service-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    transition: transform 0.3s, box-shadow 0.3s;
    border: 1px solid var(--border-color);
  }

  .service-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.1);
  }

  .service-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .service-card h2 {
    font-size: 1.3rem;
    color: var(--primary);
    margin-bottom: 0.75rem;
  }

  .service-card p {
    color: var(--text-light);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .service-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .service-tags span {
    background: var(--bg-light);
    color: var(--text-main);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    border: 1px solid var(--border-color);
  }

  /* ===== 联系我 ===== */
  .contact-section {
    margin-top: 5rem;
    text-align: center;
  }

  .section-heading {
    font-size: 2rem;
    color: var(--primary);
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .section-subtitle {
    text-align: center;
    color: var(--text-light);
    font-size: 1.05rem;
    margin-bottom: 2.5rem;
  }

  .contact-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    border: 1px solid var(--border-color);
    max-width: 700px;
    margin: 0 auto;
  }

  .contact-methods {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .contact-method-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.2rem 1.5rem;
    border-radius: 12px;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid var(--border-color);
  }

  .contact-method-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  }

  .contact-icon {
    font-size: 1.8rem;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-light);
    border-radius: 12px;
  }

  .contact-label {
    font-weight: 700;
    font-size: 1rem;
    min-width: 80px;
    text-align: left;
  }

  .contact-value {
    color: var(--text-light);
    font-size: 0.9rem;
    margin-left: auto;
  }

  .email-btn { color: var(--primary); }
  .email-btn:hover { border-color: #3498db; }
  .github-btn { color: var(--primary); }
  .github-btn:hover { border-color: #6e5494; }
  .consult-btn { color: var(--primary); }
  .consult-btn:hover { border-color: #2ecc71; }

  /* ===== 预约会议 ===== */
  .booking-section {
    margin-top: 5rem;
    text-align: center;
  }

  .booking-options {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }

  .booking-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    border: 1px solid var(--border-color);
    min-width: 240px;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .booking-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }

  .booking-time {
    font-size: 2rem;
    font-weight: 800;
    color: var(--accent);
    margin-bottom: 0.5rem;
  }

  .booking-desc {
    color: var(--text-light);
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .booking-btn {
    display: inline-block;
    padding: 0.7rem 1.8rem;
    background: var(--accent);
    color: #ffffff;
    border-radius: 30px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .booking-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  }

  .booking-embed {
    max-width: 800px;
    margin: 0 auto;
  }

  .embed-label {
    color: var(--text-light);
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }

  .cal-embed-container {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    border: 1px solid var(--border-color);
  }

  .cal-embed-container iframe {
    display: block;
  }

  @media (max-width: 768px) {
    .services-grid {
      grid-template-columns: 1fr;
    }
    .booking-options {
      flex-direction: column;
      align-items: center;
    }
    .contact-method-btn {
      flex-wrap: wrap;
    }
    .contact-value {
      margin-left: 0;
      width: 100%;
      text-align: left;
      padding-left: 4rem;
    }
  }
</style>

