---
layout: goals

title: 个人
permalink: /goals/
---

<div class="goals-page-wrapper wrapper">
  <h1 class="page-heading">🎯 个人目标</h1>
  <p class="page-subtitle">记录我的梦想与进度，每一份支持都让它们更近一步</p>

  <div class="goals-list">
    <!-- Goal 1 -->
    <div class="goal-card">
      <div class="goal-header">
        <div class="goal-icon">💻</div>
        <div class="goal-info">
          <h2>升级开发设备</h2>
          <p class="goal-desc">购买一台高性能 M4 MacBook Pro，提升开发效率和创作体验。</p>
        </div>
        <div class="goal-amount">
          <span class="amount-raised">¥0</span>
          <span class="amount-separator">/</span>
          <span class="amount-target">¥25,000</span>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 0%;"></div>
      </div>
      <div class="progress-info">
        <span class="progress-percent">0%</span>
        <span class="progress-donors">0 人支持</span>
      </div>
    </div>

    <!-- Goal 2 -->
    <div class="goal-card">
      <div class="goal-header">
        <div class="goal-icon">📚</div>
        <div class="goal-info">
          <h2>在线课程学习</h2>
          <p class="goal-desc">报名高级算法与系统设计课程，持续提升技术深度。</p>
        </div>
        <div class="goal-amount">
          <span class="amount-raised">¥0</span>
          <span class="amount-separator">/</span>
          <span class="amount-target">¥8,000</span>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 0%;"></div>
      </div>
      <div class="progress-info">
        <span class="progress-percent">0%</span>
        <span class="progress-donors">0 人支持</span>
      </div>
    </div>

    <!-- Goal 3 -->
    <div class="goal-card">
      <div class="goal-header">
        <div class="goal-icon">✈️</div>
        <div class="goal-info">
          <h2>技术大会之旅</h2>
          <p class="goal-desc">参加一场海外技术大会（如 JSConf、React Conf），开阔视野、结识同行。</p>
        </div>
        <div class="goal-amount">
          <span class="amount-raised">¥0</span>
          <span class="amount-separator">/</span>
          <span class="amount-target">¥15,000</span>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 0%;"></div>
      </div>
      <div class="progress-info">
        <span class="progress-percent">0%</span>
        <span class="progress-donors">0 人支持</span>
      </div>
    </div>

    <!-- Goal 4 -->
    <div class="goal-card">
      <div class="goal-header">
        <div class="goal-icon">🎵</div>
        <div class="goal-info">
          <h2>音乐设备升级</h2>
          <p class="goal-desc">购买一台数码钢琴（如 Roland FP-30X），用于音乐创作和练习。</p>
        </div>
        <div class="goal-amount">
          <span class="amount-raised">¥0</span>
          <span class="amount-separator">/</span>
          <span class="amount-target">¥5,000</span>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 0%;"></div>
      </div>
      <div class="progress-info">
        <span class="progress-percent">0%</span>
        <span class="progress-donors">0 人支持</span>
      </div>
    </div>

    <!-- Goal 5 -->
    <div class="goal-card">
      <div class="goal-header">
        <div class="goal-icon">🏠</div>
        <div class="goal-info">
          <h2>独立工作室</h2>
          <p class="goal-desc">租用一间小型工作室，打造专属的创作与开发空间。</p>
        </div>
        <div class="goal-amount">
          <span class="amount-raised">¥0</span>
          <span class="amount-separator">/</span>
          <span class="amount-target">¥30,000</span>
        </div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 0%;"></div>
      </div>
      <div class="progress-info">
        <span class="progress-percent">0%</span>
        <span class="progress-donors">0 人支持</span>
      </div>
    </div>
  </div>

  <div class="support-section">
    <h2>☕ 支持我</h2>
    <p>如果你觉得我的内容或工具有帮助，欢迎通过以下方式支持我：</p>
    <div class="support-methods">
      <a href="https://www.buymeacoffee.com/{{ site.buymeacoffee_username }}" target="_blank" class="support-btn coffee-btn">
        ☕ Buy Me a Coffee
      </a>
      <a href="mailto:{{ site.email }}" class="support-btn email-btn">
        📧 联系合作
      </a>
    </div>
  </div>
</div>

<style>
  .goals-page-wrapper {
    padding: 4rem 2rem;
    max-width: 900px;
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

  .goals-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 4rem;
  }

  .goal-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 1.5rem 2rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    border: 1px solid var(--border-color);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .goal-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }

  .goal-header {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .goal-icon {
    font-size: 2rem;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-light);
    border-radius: 12px;
  }

  .goal-info {
    flex: 1;
  }

  .goal-info h2 {
    font-size: 1.2rem;
    color: var(--primary);
    margin-bottom: 0.4rem;
  }

  .goal-desc {
    color: var(--text-light);
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
  }

  .goal-amount {
    text-align: right;
    flex-shrink: 0;
    min-width: 120px;
  }

  .amount-raised {
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--accent);
  }

  .amount-separator {
    color: var(--text-light);
    margin: 0 0.25rem;
  }

  .amount-target {
    font-size: 0.95rem;
    color: var(--text-light);
  }

  .progress-bar-container {
    width: 100%;
    height: 8px;
    background: var(--bg-light);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), #5dade2);
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-light);
  }

  .progress-percent {
    font-weight: 600;
    color: var(--accent);
  }

  .support-section {
    text-align: center;
    padding: 3rem;
    background: var(--bg-light);
    border-radius: 16px;
    border: 1px solid var(--border-color);
  }

  .support-section h2 {
    font-size: 1.8rem;
    color: var(--primary);
    margin-bottom: 1rem;
  }

  .support-section p {
    color: var(--text-light);
    margin-bottom: 2rem;
  }

  .support-methods {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .support-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 2rem;
    border-radius: 30px;
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .coffee-btn {
    background: #FFDD00;
    color: #000000;
  }

  .coffee-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 221, 0, 0.4);
  }

  .email-btn {
    background: var(--accent);
    color: #ffffff;
  }

  .email-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  }

  @media (max-width: 768px) {
    .goal-header {
      flex-direction: column;
      gap: 0.75rem;
    }
    .goal-amount {
      text-align: left;
    }
  }
</style>
