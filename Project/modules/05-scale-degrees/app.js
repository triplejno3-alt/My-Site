// ==============================
// T5 - 视奏练习
// ==============================

// 配置常量
const CONFIG = {
    lengths: [4, 6, 8, 12],
    ranges: {
        'C4-G4': { start: 'C4', end: 'G4', notes: ['C4', 'D4', 'E4', 'F4', 'G4'] },
        'C4-C5': { start: 'C4', end: 'C5', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
        'A3-E5': { start: 'A3', end: 'E5', notes: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'] }
    }
};

// 音频上下文
let audioContext = null;
const audioBuffers = {};

// 游戏状态
let gameState = {
    isPlaying: false,
    currentNotes: [], // { note: 'C4', key: 'C', vfKey: 'c/4' }
    currentIndex: 0, // 当前待输入的音符索引
    userInputs: [], // ['C', 'D', ...]
    startTime: 0,
    stats: {
        correct: 0,
        wrong: 0,
        totalAttempts: 0
    },
    settings: {
        length: 8,
        range: 'C4-C5'
    },
    // 连续正确乐句计数，用于难度自适应
    consecutivePerfect: 0
};

// 初始化音频系统
async function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // 预加载当前范围的所有音频
    const range = CONFIG.ranges[gameState.settings.range];
    for (const note of range.notes) {
        await loadAudio(note);
    }
}

// 加载单个音频文件
async function loadAudio(note) {
    if (audioBuffers[note]) return;

    try {
        // 构建音频文件路径
        const response = await fetch(`../../shared/audio/piano-${note}.mp3`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers[note] = audioBuffer;
    } catch (error) {
        console.error(`Failed to load audio for ${note}:`, error);
    }
}

// 播放音符
function playNote(note) {
    if (!audioContext || !audioBuffers[note]) return;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers[note];
    source.connect(audioContext.destination);
    source.start(0);
}

// 播放完整乐句
async function playMelody() {
    if (!audioContext) await initAudio();
    if (audioContext.state === 'suspended') await audioContext.resume();

    const btn = document.getElementById('play-audio-btn');
    btn.disabled = true;
    btn.classList.add('playing');

    let delay = 0;
    const noteDuration = 0.5; // 每个音符间隔0.5秒

    gameState.currentNotes.forEach((noteData, index) => {
        const startTime = audioContext.currentTime + delay;
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffers[noteData.note];
        source.connect(audioContext.destination);
        source.start(startTime);
        delay += noteDuration;
    });

    // 恢复按钮状态
    setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('playing');
    }, delay * 1000);
}

// 工具函数：生成随机音符（优化版）
function generateRandomNotes(length, rangeKey) {
    const range = CONFIG.ranges[rangeKey];
    const notes = [];
    let lastNoteIndex = -1;
    
    // 简单的旋律模式生成
    const patterns = ['random', 'step', 'step', 'random']; // 增加级进的概率
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    for (let i = 0; i < length; i++) {
        let noteIndex;
        
        if (i === 0 || pattern === 'random') {
            noteIndex = Math.floor(Math.random() * range.notes.length);
        } else {
            // 级进：上行或下行
            const direction = Math.random() > 0.5 ? 1 : -1;
            noteIndex = lastNoteIndex + direction;
            
            // 边界检查
            if (noteIndex < 0) noteIndex = 1;
            if (noteIndex >= range.notes.length) noteIndex = range.notes.length - 2;
        }

        // 避免连续3个相同的音
        if (i >= 2 && notes[i-1].note === notes[i-2].note && range.notes[noteIndex] === notes[i-1].note) {
            noteIndex = (noteIndex + 1) % range.notes.length;
        }

        const randomNote = range.notes[noteIndex];
        lastNoteIndex = noteIndex;

        // VexFlow format: c/4, d/4
        const vfKey = randomNote.toLowerCase().replace(/(\w)(\d)/, '$1/$2');
        // Key for checking: C, D, E...
        const checkKey = randomNote.charAt(0);
        
        notes.push({
            note: randomNote,
            vfKey: vfKey,
            key: checkKey
        });
    }
    return notes;
}

// 渲染五线谱
function renderStave(notes) {
    const container = document.getElementById('stave');
    container.innerHTML = '';
    
    const width = container.clientWidth || 600;
    const height = 140;
    
    const renderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    
    // 自适应缩放
    let scale = 1.3;
    if (width < 400) scale = 1.0;
    context.scale(scale, scale);
    
    const scaledWidth = width / scale;
    
    // 创建谱表
    const stave = new Vex.Flow.Stave(10, 10, scaledWidth - 20);
    stave.addClef('treble');
    stave.setContext(context).draw();
    
    // 创建音符
    const staveNotes = notes.map((n, index) => {
        const note = new Vex.Flow.StaveNote({
            clef: 'treble',
            keys: [n.vfKey],
            duration: 'q' // 四分音符
        });
        
        // 如果该音符已经输入正确，改变颜色
        if (index < gameState.currentIndex) {
            note.setStyle({ fillStyle: "#28a745", strokeStyle: "#28a745" });
        }
        // 当前正在输入的音符高亮
        else if (index === gameState.currentIndex && gameState.isPlaying) {
             note.setStyle({ fillStyle: "#a18cd1", strokeStyle: "#a18cd1" });
        }
        
        return note;
    });
    
    // 创建 Voice
    const numBeats = notes.length;
    const voice = new Vex.Flow.Voice({ num_beats: numBeats, beat_value: 4 });
    voice.setStrict(false);
    voice.addTickables(staveNotes);
    
    // 格式化并绘制
    new Vex.Flow.Formatter().joinVoices([voice]).format([voice], scaledWidth - 50);
    voice.draw(context, stave);
}

// 更新输入状态显示
function updateInputStatus() {
    const container = document.getElementById('input-sequence');
    container.innerHTML = '';
    
    // 生成槽位
    for (let i = 0; i < gameState.currentNotes.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'note-slot';
        
        // 填充用户输入
        if (i < gameState.userInputs.length) {
            slot.textContent = gameState.userInputs[i];
            slot.classList.add('filled');
            slot.classList.add('correct'); // 在新逻辑中，填入的必定是正确的
        }
        
        // 标记当前激活槽位
        if (i === gameState.currentIndex) {
            slot.classList.add('active');
        }
        
        container.appendChild(slot);
    }
    
    // 滚动到当前位置
    if (gameState.currentIndex > 3) {
        const activeSlot = container.children[gameState.currentIndex];
        if (activeSlot) {
            activeSlot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
    
    // 重新渲染五线谱以更新音符颜色
    renderStave(gameState.currentNotes);
}

// 更新进度条
function updateProgress() {
    const total = gameState.stats.correct + gameState.stats.wrong;
    let accuracy = 0;
    if (total > 0) {
        accuracy = Math.round((gameState.stats.correct / total) * 100);
    }
    
    document.getElementById('accuracy-text').textContent = `${accuracy}%`;
    document.getElementById('progress-bar-fill').style.width = `${accuracy}%`;
    
    // 颜色变化
    const fill = document.getElementById('progress-bar-fill');
    if (accuracy <= 70) {
        fill.style.background = 'linear-gradient(90deg, #ff9a9e 0%, #fecfef 100%)';
    } else if (accuracy <= 90) {
        fill.style.background = 'linear-gradient(90deg, #f6d365 0%, #fda085 100%)';
    } else {
        fill.style.background = 'linear-gradient(90deg, #84fab0 0%, #8fd3f4 100%)';
    }
}

// 开始游戏
async function startGame() {
    // 确保音频上下文已初始化
    if (!audioContext) {
        await initAudio();
    }
    if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    gameState.isPlaying = true;
    gameState.userInputs = [];
    gameState.currentIndex = 0;
    gameState.currentNotes = generateRandomNotes(gameState.settings.length, gameState.settings.range);
    gameState.startTime = Date.now();
    
    renderStave(gameState.currentNotes);
    updateInputStatus();
    updateProgress();
    
    // UI 状态
    document.getElementById('start-btn').classList.add('hidden');
    document.getElementById('progress-container').classList.remove('hidden');
    document.getElementById('play-audio-btn').classList.remove('hidden');
    document.getElementById('pass-message').classList.add('hidden');
}

// 结束游戏
function endGame() {
    gameState.isPlaying = false;
    
    const resultOverlay = document.getElementById('result-overlay');
    const resultTitle = document.getElementById('result-title');
    const scoreText = document.getElementById('score-text');
    const resultTime = document.getElementById('result-time');
    
    const timeSpent = (Date.now() - gameState.startTime) / 1000;
    const accuracy = calculateAccuracy();
    const avgTime = timeSpent / gameState.currentNotes.length;
    
    resultTitle.textContent = '挑战成功!';
    scoreText.textContent = `准确率: ${accuracy}%`;
    resultTime.innerHTML = `总耗时: ${Math.floor(timeSpent)}秒<br><span style="font-size: 0.8em; color: #e0e0e0;">平均每音: ${avgTime.toFixed(2)}秒</span>`;
    
    // 保存数据
    const sessionData = {
        timestamp: new Date().toISOString(),
        settings: { ...gameState.settings },
        stats: {
            accuracy: accuracy,
            totalTime: timeSpent,
            avgTimePerNote: avgTime,
            correct: gameState.stats.correct,
            wrong: gameState.stats.wrong
        }
    };
    saveSessionData(sessionData);
    
    // 难度自适应
    checkDifficultyAdjustment(timeSpent);
    
    resultOverlay.classList.remove('hidden');
}

function calculateAccuracy() {
    const total = gameState.stats.correct + gameState.stats.wrong;
    if (total === 0) return 0;
    return Math.round((gameState.stats.correct / total) * 100);
}

// 难度自适应逻辑
function checkDifficultyAdjustment(timeSpent) {
    const accuracy = calculateAccuracy();
    
    if (accuracy >= 95 && timeSpent < gameState.settings.length * 2) {
        gameState.consecutivePerfect++;
        if (gameState.consecutivePerfect >= 2) {
            if (gameState.settings.length < 12) {
                // 暂时不自动更改设置
            }
            document.getElementById('pass-message').classList.remove('hidden');
        }
    } else {
        gameState.consecutivePerfect = 0;
    }
}

// 处理输入
function handleInput(key) {
    if (!gameState.isPlaying) return;
    
    const currentNote = gameState.currentNotes[gameState.currentIndex];
    const btn = document.querySelector(`.piano-key[data-note="${key}"]`);
    
    if (key === currentNote.key) {
        // 正确
        gameState.userInputs.push(key);
        gameState.stats.correct++;
        gameState.currentIndex++;
        
        // 视觉反馈
        if (btn) {
            btn.classList.add('correct');
            setTimeout(() => btn.classList.remove('correct'), 200);
        }
        
        // 播放音符
        playNote(currentNote.note);
        
        updateInputStatus();
        updateProgress();
        
        // 检查是否完成
        if (gameState.currentIndex >= gameState.currentNotes.length) {
            setTimeout(() => endGame(), 500);
        }
    } else {
        // 错误
        gameState.stats.wrong++;
        
        // 视觉反馈
        if (btn) {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 200);
        }
        
        updateProgress();
    }
}

// ========== 数据分析功能 ==========

// 保存数据
function saveSessionData(data) {
    try {
        const storedData = localStorage.getItem('t5_analytics');
        const analytics = storedData ? JSON.parse(storedData) : { sessions: [] };
        
        analytics.sessions.push(data);
        
        // 只保留最近100次
        if (analytics.sessions.length > 100) {
            analytics.sessions = analytics.sessions.slice(-100);
        }
        
        localStorage.setItem('t5_analytics', JSON.stringify(analytics));
    } catch (e) {
        console.error('Failed to save analytics data', e);
    }
}

// 读取数据
function loadSessionData() {
    try {
        const storedData = localStorage.getItem('t5_analytics');
        return storedData ? JSON.parse(storedData) : { sessions: [] };
    } catch (e) {
        console.error('Failed to load analytics data', e);
        return { sessions: [] };
    }
}

// 渲染分析面板
function renderAnalytics() {
    const data = loadSessionData();
    const sessions = data.sessions;
    
    // 更新统计卡片
    document.getElementById('total-sessions').textContent = sessions.length;
    
    if (sessions.length > 0) {
        const bestTime = Math.min(...sessions.map(s => s.stats.avgTimePerNote));
        const avgAcc = sessions.reduce((sum, s) => sum + s.stats.accuracy, 0) / sessions.length;
        
        document.getElementById('best-avg-time').textContent = bestTime.toFixed(2) + 's';
        document.getElementById('avg-accuracy').textContent = Math.round(avgAcc) + '%';
    } else {
        document.getElementById('best-avg-time').textContent = '-';
        document.getElementById('avg-accuracy').textContent = '-';
    }
    
    // 渲染所有图表
    renderTrendChart(sessions);
    renderAccuracyChart(sessions);
    renderScatterChart(sessions);
    
    // 渲染历史记录
    renderHistoryList(sessions);
}

function renderTrendChart(sessions) {
    const container = document.getElementById('trend-chart');
    container.innerHTML = '';
    
    if (sessions.length === 0) {
        container.innerHTML = '<div class="no-data">暂无数据</div>';
        return;
    }
    
    const recentSessions = sessions.slice(-20); // 显示最近20次
    const maxTime = Math.max(...recentSessions.map(s => s.stats.avgTimePerNote), 5); // 最小刻度5s
    
    recentSessions.forEach(session => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        
        // 计算高度百分比
        const heightPercent = (session.stats.avgTimePerNote / maxTime) * 100;
        bar.style.height = `${Math.min(100, Math.max(10, heightPercent))}%`;
        
        // 提示信息
        bar.title = `日期: ${new Date(session.timestamp).toLocaleDateString()}\n平均用时: ${session.stats.avgTimePerNote.toFixed(2)}s\n准确率: ${session.stats.accuracy}%`;
        
        // 颜色根据速度快慢变化 (越快越绿)
        if (session.stats.avgTimePerNote < 1.0) bar.style.background = '#4cd137';
        else if (session.stats.avgTimePerNote < 2.0) bar.style.background = '#fbc531';
        else bar.style.background = '#e84118';
        
        container.appendChild(bar);
    });
}

function renderAccuracyChart(sessions) {
    const container = document.getElementById('accuracy-chart');
    container.innerHTML = '';
    
    if (sessions.length === 0) {
        container.innerHTML = '<div class="no-data">暂无数据</div>';
        return;
    }
    
    const recentSessions = sessions.slice(-20);
    const count = recentSessions.length;
    const width = 100; // SVG viewBox宽度
    const height = 100; // SVG viewBox高度
    
    // 生成SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "line-chart-svg");
    svg.setAttribute("preserveAspectRatio", "none");
    
    // 构建路径点
    const points = recentSessions.map((s, i) => {
        const x = (i / (count - 1 || 1)) * width;
        const y = height - (s.stats.accuracy / 100 * height);
        return [x, y];
    });
    
    // 绘制折线
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = points.map((p, i) => (i === 0 ? "M" : "L") + `${p[0]},${p[1]}`).join(" ");
    path.setAttribute("d", d);
    path.setAttribute("class", "line-path");
    svg.appendChild(path);
    
    // 绘制数据点
    points.forEach((p, i) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", p[0]);
        circle.setAttribute("cy", p[1]);
        circle.setAttribute("class", "data-point");
        // 提示信息
        const session = recentSessions[i];
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = `准确率: ${session.stats.accuracy}%`;
        circle.appendChild(title);
        
        svg.appendChild(circle);
    });
    
    container.appendChild(svg);
}

function renderScatterChart(sessions) {
    const container = document.getElementById('scatter-chart');
    container.innerHTML = '';
    
    if (sessions.length === 0) {
        container.innerHTML = '<div class="no-data">暂无数据</div>';
        return;
    }
    
    const recentSessions = sessions.slice(-50); // 显示最近50次
    
    // 计算坐标范围
    const maxTime = Math.max(...recentSessions.map(s => s.stats.avgTimePerNote), 5);
    
    recentSessions.forEach(session => {
        const point = document.createElement('div');
        point.className = 'scatter-point';
        
        // X轴: 用时 (0-maxTime)
        // Y轴: 准确率 (0-100)
        const left = (session.stats.avgTimePerNote / maxTime) * 100;
        const bottom = session.stats.accuracy;
        
        point.style.left = `${Math.min(100, Math.max(0, left))}%`;
        point.style.bottom = `${bottom}%`;
        point.title = `平均用时: ${session.stats.avgTimePerNote.toFixed(2)}s\n准确率: ${session.stats.accuracy}%`;
        
        container.appendChild(point);
    });
}

function renderHistoryList(sessions) {
    const container = document.getElementById('history-items');
    container.innerHTML = '';
    
    // 显示最近10条，倒序
    const recentHistory = [...sessions].reverse().slice(0, 10);
    
    recentHistory.forEach(session => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const date = new Date(session.timestamp);
        const dateStr = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        item.innerHTML = `
            <div class="history-date">${dateStr}</div>
            <div class="history-detail">
                <span>${session.settings.length}音</span>
                <span>${session.stats.avgTimePerNote.toFixed(2)}s/音</span>
                <span class="${session.stats.accuracy >= 90 ? 'acc-high' : 'acc-low'}">${session.stats.accuracy}%</span>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// 初始化设置和分析
function initSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const analyticsBtn = document.getElementById('analytics-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const closeAnalyticsBtn = document.getElementById('close-analytics');
    const settingsOverlay = document.getElementById('settings-overlay');
    const analyticsOverlay = document.getElementById('analytics-overlay');
    
    settingsBtn.addEventListener('click', () => settingsOverlay.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsOverlay.classList.add('hidden'));
    
    analyticsBtn.addEventListener('click', () => {
        renderAnalytics();
        analyticsOverlay.classList.remove('hidden');
    });
    closeAnalyticsBtn.addEventListener('click', () => analyticsOverlay.classList.add('hidden'));
    
    // 图表切换
    const tabs = document.querySelectorAll('.chart-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 更新Tab状态
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 更新图表显示
            const targetId = tab.dataset.target;
            document.querySelectorAll('.chart-view').forEach(view => {
                view.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // 设置变更监听
    document.getElementById('length-select').addEventListener('change', (e) => {
        gameState.settings.length = parseInt(e.target.value);
    });
    
    document.getElementById('range-select').addEventListener('change', (e) => {
        gameState.settings.range = e.target.value;
        initAudio(); // 重新加载音频
    });
}

// 初始化事件绑定
function initEvents() {
    // 键盘按钮
    document.querySelectorAll('.piano-key:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', () => handleInput(btn.dataset.note));
    });
    
    // 控制按钮
    document.getElementById('start-btn').addEventListener('click', startGame);
    
    // 隐藏回退按钮
    document.getElementById('backspace-btn').style.visibility = 'hidden'; 
    
    document.getElementById('retry-btn').addEventListener('click', () => {
        document.getElementById('result-overlay').classList.add('hidden');
        document.getElementById('start-btn').classList.remove('hidden');
        startGame();
    });
    
    // 播放按钮
    document.getElementById('play-audio-btn').addEventListener('click', playMelody);
    
    // 物理键盘支持
    document.addEventListener('keydown', (e) => {
        if (!gameState.isPlaying) return;
        
        const key = e.key.toUpperCase();
        if (['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(key)) {
            handleInput(key);
        }
    });
}

// 初始化
function init() {
    initSettings();
    initEvents();
    
    // 初始显示
    gameState.currentNotes = generateRandomNotes(gameState.settings.length, gameState.settings.range);
    renderStave(gameState.currentNotes);
    
    // 生成空槽位预览
    const container = document.getElementById('input-sequence');
    container.innerHTML = '';
    for (let i = 0; i < gameState.settings.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'note-slot';
        container.appendChild(slot);
    }
}

document.addEventListener('DOMContentLoaded', init);
