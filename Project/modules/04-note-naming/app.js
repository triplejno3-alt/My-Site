// ==============================
// T4 - 音名唱名转换训练
// 核心功能：音名 (CDEFGAB) 与数字 (1234567) 及唱名 (Do Re Mi) 的转换
// ==============================

// 数据模型
const NOTE_MAPPINGS = [
    { note: 'C', number: '1', solfege: 'Do', vexflow: 'c/4', audio: '../../shared/audio/piano-C4.mp3' },
    { note: 'D', number: '2', solfege: 'Re', vexflow: 'd/4', audio: '../../shared/audio/piano-D4.mp3' },
    { note: 'E', number: '3', solfege: 'Mi', vexflow: 'e/4', audio: '../../shared/audio/piano-E4.mp3' },
    { note: 'F', number: '4', solfege: 'Fa', vexflow: 'f/4', audio: '../../shared/audio/piano-F4.mp3' },
    { note: 'G', number: '5', solfege: 'Sol', vexflow: 'g/4', audio: '../../shared/audio/piano-G4.mp3' },
    { note: 'A', number: '6', solfege: 'La', vexflow: 'a/4', audio: '../../shared/audio/piano-A4.mp3' },
    { note: 'B', number: '7', solfege: 'Si', vexflow: 'b/4', audio: '../../shared/audio/piano-B4.mp3' }
];

// 难度等级定义
const LEVELS = [
    { name: '基础训练', notes: ['C', 'D', 'E'] },
    { name: '扩展训练', notes: ['C', 'D', 'E', 'F', 'G'] },
    { name: '完整训练', notes: NOTE_MAPPINGS.map(n => n.note) },
    { name: '综合测试', notes: NOTE_MAPPINGS.map(n => n.note) }
];

// 游戏状态
let gameState = {
    currentQuestion: null,
    correctAnswer: null,
    score: 0,
    total: 0,
    currentLevel: 1,
    currentMode: 'noteToNumber', // noteToNumber, noteToSolfege, numberToNote, mixed
    consecutiveErrors: 0,
    maxConsecutiveErrors: 3,
    noteFrequency: {},
    audioContexts: {},
    lastLevelUpTime: 0,
    lastLevelDownTime: 0,
    startTime: 0 // 本次题目开始时间
};

// 工具函数
function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getMappingByNote(note) {
    return NOTE_MAPPINGS.find(m => m.note === note);
}

function getMappingByNumber(number) {
    return NOTE_MAPPINGS.find(m => m.number === number);
}

function getCurrentLevelConfig() {
    return LEVELS[gameState.currentLevel - 1];
}

// 初始化音频上下文
function initAudioContexts() {
    gameState.audioContexts = {};
    NOTE_MAPPINGS.forEach(mapping => {
        const audio = new Audio(mapping.audio);
        gameState.audioContexts[mapping.note] = audio;
    });
}

// 播放音频
function playAudio(note) {
    const audio = gameState.audioContexts[note];
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error('音频播放失败:', e));
    }
}

// 渲染五线谱
function renderStave(note) {
    const container = document.getElementById('stave');
    container.innerHTML = '';
    
    // 动态获取容器宽度，确保居中适配
    // 如果容器隐藏导致宽度为0，则使用默认宽度 450
    const containerWidth = container.clientWidth || 450;
    const width = containerWidth;
    const height = 200;
    
    const renderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(width, height);
    const context = renderer.getContext();
    
    // 放大谱表
    context.scale(1.5, 1.5);
    
    // 计算居中位置
    // 画布宽度被缩放了 1.5 倍，所以逻辑宽度是 width / 1.5
    // 谱表宽度设为 240
    // 居中 x = (逻辑宽度 - 谱表宽度) / 2
    const scaledWidth = width / 1.5;
    const staveWidth = 240;
    const staveX = (scaledWidth - staveWidth) / 2;
    
    const stave = new Vex.Flow.Stave(staveX, -20, staveWidth);
    stave.addClef('treble');
    
    const vexNote = new Vex.Flow.StaveNote({
        clef: 'treble',
        keys: [getMappingByNote(note).vexflow],
        duration: 'q'
    });
    
    // 增加音符样式，使其更粗
    vexNote.setStyle({fillStyle: "black", strokeStyle: "black"});
    
    const voice = new Vex.Flow.Voice({ num_beats: 1, beat_value: 4 }).setStrict(false);
    voice.addTickables([vexNote]);
    
    new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 180);
    
    stave.setContext(context).draw();
    voice.draw(context, stave);
}

// 生成问题
function generateQuestion() {
    const levelConfig = getCurrentLevelConfig();
    const availableNotes = levelConfig.notes;
    
    let questionNote = randomFrom(availableNotes);
    let questionMapping = getMappingByNote(questionNote);
    
    let mode = gameState.currentMode;
    if (mode === 'mixed') {
        mode = randomFrom(['noteToNumber', 'noteToSolfege', 'numberToNote']);
    }
    
    let questionText, correctAnswer, options;
    
    switch (mode) {
        case 'noteToSolfege':
            questionText = questionMapping.note;
            correctAnswer = questionMapping.solfege;
            options = NOTE_MAPPINGS.map(m => m.solfege).filter(solfege => availableNotes.includes(getMappingByNote(NOTE_MAPPINGS.find(m => m.solfege === solfege).note).note));
            break;
        case 'numberToNote':
            questionText = questionMapping.number;
            correctAnswer = questionMapping.note;
            options = availableNotes;
            break;
        case 'noteToNumber':
        default:
            questionText = questionMapping.note;
            correctAnswer = questionMapping.number;
            options = NOTE_MAPPINGS.map(m => m.number).filter(num => availableNotes.includes(getMappingByNumber(num).note));
            break;
    }

    gameState.currentQuestion = questionMapping;
    gameState.correctAnswer = correctAnswer;
    gameState.startTime = Date.now(); // 记录开始时间
    
    document.getElementById('question-main').textContent = questionText;
    document.getElementById('question-sub').textContent = `${questionMapping.note} = ${questionMapping.number} = ${questionMapping.solfege}`;
    
    // 隐藏映射提示和五线谱
    document.getElementById('question-sub').classList.add('hidden-sub');
    const staveContainer = document.getElementById('stave').parentElement;
    staveContainer.classList.add('hidden-stave');
    
    renderStave(questionMapping.note);
    renderOptions(options, correctAnswer);
}

// 渲染选项
function renderOptions(options, correctAnswer) {
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    // Ensure correct answer is always an option
    if (!options.includes(correctAnswer)) {
        options.push(correctAnswer);
    }
    
    // Sort options based on NOTE_MAPPINGS order to ensure consistent layout
    options.sort((a, b) => {
        const indexA = NOTE_MAPPINGS.findIndex(m => m.note === a || m.number === a || m.solfege === a);
        const indexB = NOTE_MAPPINGS.findIndex(m => m.note === b || m.number === b || m.solfege === b);
        return indexA - indexB;
    });
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.dataset.answer = option;
        btn.addEventListener('click', () => checkAnswer(option));
        optionsContainer.appendChild(btn);
    });
}

// 检查答案
function checkAnswer(selectedAnswer) {
    const isCorrect = selectedAnswer == gameState.correctAnswer;
    const responseTime = (Date.now() - gameState.startTime) / 1000;
    
    // 记录数据
    saveAnswerData({
        timestamp: new Date().toISOString(),
        mode: gameState.currentMode,
        level: gameState.currentLevel,
        note: gameState.currentQuestion.note,
        isCorrect: isCorrect,
        responseTime: responseTime
    });

    if (isCorrect) {
        // 答对时才禁用所有按钮并高亮正确答案
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.answer == gameState.correctAnswer) {
                btn.classList.add('correct-highlight');
            }
        });

        gameState.score++;
        gameState.total++;
        gameState.consecutiveErrors = 0;
        document.getElementById('feedback').textContent = '正确!';
        document.getElementById('feedback').className = 'feedback correct';
        
        // 添加答对后的状态类，触发平滑过渡
        document.querySelector('.display-area').classList.add('correct-state');
        
        // 显示映射提示和五线谱
        document.getElementById('question-sub').classList.remove('hidden-sub');
        const staveContainer = document.getElementById('stave').parentElement;
        staveContainer.classList.remove('hidden-stave');
        
        playAudio(gameState.currentQuestion.note);
        
        // 延长展示时间到 2.5 秒，让用户有足够时间看清五线谱
        setTimeout(loadNextQuestion, 2500);
    } else {
        // 答错时只禁用选错的按钮
        const selectedBtn = document.querySelector(`.option-btn[data-answer="${selectedAnswer}"]`);
        if(selectedBtn) {
            selectedBtn.classList.add('error');
            selectedBtn.disabled = true; // 仅禁用此错误选项
        }

        gameState.total++;
        gameState.consecutiveErrors++;
        
        document.getElementById('feedback').textContent = `错误!`;
        document.getElementById('feedback').className = 'feedback wrong';
        
        if (checkLevelDown()) {
            setTimeout(levelDown, 1500);
        }

        // 检查是否只剩一个选项可选
        checkAutoSelectLastOption();
    }
    
    updateScore();
}

// 检查是否需要自动选择最后一个选项
function checkAutoSelectLastOption() {
    const enabledBtns = document.querySelectorAll('.option-btn:not(:disabled)');
    if (enabledBtns.length === 1) {
        // 延迟一点时间自动点击，让用户看到上一次错误的反馈
        setTimeout(() => {
            enabledBtns[0].click();
        }, 500);
    }
}

// 更新分数和进度
function updateScore() {
    const accuracy = gameState.total > 0 ? Math.round((gameState.score / gameState.total) * 100) : 0;
    const progressContainer = document.querySelector('.progress-container');
    
    if (gameState.total > 5) {
        progressContainer.classList.remove('hidden');
    }
    
    const progressBar = document.getElementById('progress-bar');
    document.getElementById('progress-text').textContent = `进度: ${gameState.score}/${gameState.total}`;
    progressBar.style.width = `${accuracy}%`;
    
    progressBar.className = 'progress-bar';
    if (accuracy <= 70) progressBar.classList.add('red');
    else if (accuracy <= 90) progressBar.classList.add('orange');
    else progressBar.classList.add('green');
    
    if (checkLevelUp()) {
        setTimeout(levelUp, 1000);
    }
}

// 检查是否升级
function checkLevelUp() {
    const accuracy = gameState.total > 0 ? (gameState.score / gameState.total) * 100 : 0;
    const currentTime = Date.now();
    return gameState.total >= 8 && accuracy > 92 && (currentTime - gameState.lastLevelUpTime > 30000);
}

// 检查是否降级
function checkLevelDown() {
    const accuracy = gameState.total > 0 ? (gameState.score / gameState.total) * 100 : 0;
    const currentTime = Date.now();
    return (gameState.total >= 5 && accuracy < 60 || gameState.consecutiveErrors >= gameState.maxConsecutiveErrors) && (currentTime - gameState.lastLevelDownTime > 30000);
}

// 升级
function levelUp() {
    if (gameState.currentLevel < LEVELS.length) {
        gameState.currentLevel++;
        gameState.lastLevelUpTime = Date.now();
        gameState.consecutiveErrors = 0;
        updateLevelDisplay();
        loadNextQuestion();
        document.getElementById('feedback').textContent = `恭喜升级! 进入${getCurrentLevelConfig().name}`;
        document.getElementById('feedback').className = 'feedback correct';
    }
}

// 降级
function levelDown() {
    if (gameState.currentLevel > 1) {
        gameState.currentLevel--;
        gameState.lastLevelDownTime = Date.now();
        gameState.score = 0;
        gameState.total = 0;
        gameState.consecutiveErrors = 0;
        updateLevelDisplay();
        loadNextQuestion();
        document.getElementById('feedback').textContent = `需要巩固, 已降至${getCurrentLevelConfig().name}`;
        document.getElementById('feedback').className = 'feedback wrong';
    }
}

// 更新等级显示
function updateLevelDisplay() {
    document.getElementById('current-level').textContent = gameState.currentLevel;
    document.getElementById('level-type').textContent = `(${getCurrentLevelConfig().name})`;
    
    // 同步设置中的下拉框
    const levelSelect = document.getElementById('level-select');
    if (levelSelect) {
        levelSelect.value = gameState.currentLevel;
    }
}

// 加载下一题
function loadNextQuestion() {
    document.getElementById('feedback').textContent = '';
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = false;
        btn.className = 'option-btn';
    });
    
    // 移除答对后的状态类
    document.querySelector('.display-area').classList.remove('correct-state');
    
    generateQuestion();
    updateScore();
}

// ========== 数据分析功能 ==========

// 保存数据
function saveAnswerData(data) {
    try {
        const storedData = localStorage.getItem('t4_analytics');
        const analytics = storedData ? JSON.parse(storedData) : { answers: [] };
        
        analytics.answers.push(data);
        
        // 只保留最近200条记录 (比T5稍多因为单次答题数据量小)
        if (analytics.answers.length > 200) {
            analytics.answers = analytics.answers.slice(-200);
        }
        
        localStorage.setItem('t4_analytics', JSON.stringify(analytics));
    } catch (e) {
        console.error('Failed to save analytics data', e);
    }
}

// 读取数据
function loadAnalyticsData() {
    try {
        const storedData = localStorage.getItem('t4_analytics');
        return storedData ? JSON.parse(storedData) : { answers: [] };
    } catch (e) {
        console.error('Failed to load analytics data', e);
        return { answers: [] };
    }
}

// 渲染分析面板
function renderAnalytics() {
    const data = loadAnalyticsData();
    const answers = data.answers;
    
    // 更新统计卡片
    document.getElementById('total-answers').textContent = answers.length;
    document.getElementById('current-level-stat').textContent = gameState.currentLevel;
    
    if (answers.length > 0) {
        const avgAcc = (answers.filter(a => a.isCorrect).length / answers.length) * 100;
        document.getElementById('avg-accuracy').textContent = Math.round(avgAcc) + '%';
    } else {
        document.getElementById('avg-accuracy').textContent = '-';
    }
    
    // 渲染图表
    renderModeChart(answers);
    renderNoteChart(answers);
    renderTrendChart(answers);
    
    // 渲染统计表格 (新增)
    renderNoteStatsTable(answers);
    
    // 渲染历史记录
    renderHistoryList(answers);
}

function renderModeChart(answers) {
    const container = document.getElementById('mode-chart');
    container.innerHTML = '';
    
    if (answers.length === 0) {
        container.innerHTML = '<div class="no-data">暂无数据</div>';
        return;
    }
    
    // 按模式统计准确率
    const modes = {
        'noteToNumber': { correct: 0, total: 0, name: '音→数' },
        'noteToSolfege': { correct: 0, total: 0, name: '音→唱' },
        'numberToNote': { correct: 0, total: 0, name: '数→音' }
    };
    
    answers.forEach(a => {
        if (modes[a.mode]) {
            modes[a.mode].total++;
            if (a.isCorrect) modes[a.mode].correct++;
        }
    });
    
    // 创建SVG
    const width = 100;
    const height = 100;
    const padding = 10;
    const barWidth = 20;
    const spacing = 10;
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "bar-chart-svg");
    
    let x = padding;
    const modeKeys = Object.keys(modes);
    
    modeKeys.forEach(key => {
        const stats = modes[key];
        const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
        const barHeight = accuracy * (height - 2 * padding);
        
        if (stats.total > 0) {
            // 柱子
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", x);
            rect.setAttribute("y", height - padding - barHeight);
            rect.setAttribute("width", barWidth);
            rect.setAttribute("height", barHeight);
            rect.setAttribute("class", "chart-bar-rect");
            
            // 提示
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `${stats.name}: ${Math.round(accuracy * 100)}% (${stats.correct}/${stats.total})`;
            rect.appendChild(title);
            
            svg.appendChild(rect);
            
            // 标签
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x + barWidth / 2);
            text.setAttribute("y", height - 2);
            text.setAttribute("class", "chart-label");
            text.textContent = stats.name;
            svg.appendChild(text);
        }
        
        x += barWidth + spacing;
    });
    
    container.appendChild(svg);
}

// 增强版音符图表：包含反应时间
function renderNoteChart(answers) {
    const container = document.getElementById('note-chart');
    container.innerHTML = '';
    
    if (answers.length === 0) {
        container.innerHTML = '<div class="no-data">暂无数据</div>';
        return;
    }
    
    // 统计每个音符的准确率和平均反应时间
    const notes = {};
    NOTE_MAPPINGS.forEach(m => notes[m.note] = { correct: 0, total: 0, totalTime: 0 });
    
    answers.forEach(a => {
        if (notes[a.note]) {
            notes[a.note].total++;
            notes[a.note].totalTime += (a.responseTime || 0);
            if (a.isCorrect) notes[a.note].correct++;
        }
    });
    
    // 创建SVG
    const width = 100;
    const height = 100;
    const padding = 5;
    const barWidth = 10;
    const spacing = 2;
    const maxTime = 3; // 3秒作为反应时间的最大刻度
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "bar-chart-svg");
    
    let x = padding;
    const noteKeys = Object.keys(notes);
    
    noteKeys.forEach(key => {
        const stats = notes[key];
        // 只有当有数据时才显示
        if (stats.total > 0) {
            const accuracy = stats.correct / stats.total;
            const avgTime = stats.totalTime / stats.total;
            
            // 1. 绘制准确率条形 (主条形, 宽)
            const accBarHeight = Math.max(2, accuracy * (height - 20)); 
            
            const rectAcc = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rectAcc.setAttribute("x", x);
            rectAcc.setAttribute("y", height - 15 - accBarHeight);
            rectAcc.setAttribute("width", barWidth);
            rectAcc.setAttribute("height", accBarHeight);
            rectAcc.setAttribute("class", "chart-bar-rect");
            
            // 颜色根据准确率变化 (绿 -> 红)
            if (accuracy >= 0.8) rectAcc.style.fill = "#a8edea"; // 蓝绿
            else if (accuracy >= 0.6) rectAcc.style.fill = "#fbc2eb"; // 粉
            else rectAcc.style.fill = "#ff9a9e"; // 红
            
            svg.appendChild(rectAcc);
            
            // 2. 绘制反应时间条形 (细条形, 叠加)
            // 时间越长条越高，最高到maxTime
            const timeRatio = Math.min(avgTime / maxTime, 1);
            const timeBarHeight = Math.max(2, timeRatio * (height - 20));
            
            const rectTime = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rectTime.setAttribute("x", x + barWidth/2 - 1.5); // 居中细条
            rectTime.setAttribute("y", height - 15 - timeBarHeight);
            rectTime.setAttribute("width", 3);
            rectTime.setAttribute("height", timeBarHeight);
            rectTime.style.fill = "rgba(0,0,0,0.2)"; // 半透明黑
            
            svg.appendChild(rectTime);
            
            // 提示信息 (包含准确率和时间)
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `${key}\n准确率: ${Math.round(accuracy * 100)}%\n平均用时: ${avgTime.toFixed(2)}s\n(细条越高代表越慢)`;
            
            // 加一个隐形的覆盖层来响应hover，以便显示title
            const hoverRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            hoverRect.setAttribute("x", x);
            hoverRect.setAttribute("y", 0);
            hoverRect.setAttribute("width", barWidth);
            hoverRect.setAttribute("height", height);
            hoverRect.style.fill = "transparent";
            hoverRect.appendChild(title);
            svg.appendChild(hoverRect);
            
            // X轴标签
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x + barWidth / 2);
            text.setAttribute("y", height - 5);
            text.setAttribute("class", "chart-label");
            text.textContent = key;
            svg.appendChild(text);
        } else {
             // 没数据的音符显示灰色占位
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x + barWidth / 2);
            text.setAttribute("y", height - 5);
            text.setAttribute("class", "chart-label");
            text.style.fill = "#dee2e6";
            text.textContent = key;
            svg.appendChild(text);
        }
        
        x += barWidth + spacing;
    });
    
    container.appendChild(svg);
}

function renderTrendChart(answers) {
    const container = document.getElementById('trend-chart');
    container.innerHTML = '';
    
    if (answers.length < 5) {
        container.innerHTML = '<div class="no-data">数据不足</div>';
        return;
    }
    
    const recentAnswers = answers.slice(-50); // 最近50次
    // 计算移动平均准确率 (每5次)
    const points = [];
    for (let i = 0; i < recentAnswers.length; i += 5) {
        const slice = recentAnswers.slice(i, i + 5);
        const acc = slice.filter(a => a.isCorrect).length / slice.length;
        points.push(acc);
    }
    
    const width = 100;
    const height = 100;
    const padding = 10;
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("class", "line-chart-svg");
    
    // 绘制折线
    if (points.length > 1) {
        const pathData = points.map((p, i) => {
            const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
            const y = height - padding - (p * (height - 2 * padding));
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("class", "line-path");
        svg.appendChild(path);
        
        // 绘制点
        points.forEach((p, i) => {
            const x = padding + (i / (points.length - 1)) * (width - 2 * padding);
            const y = height - padding - (p * (height - 2 * padding));
            
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("class", "data-point");
            
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `准确率: ${Math.round(p * 100)}%`;
            circle.appendChild(title);
            
            svg.appendChild(circle);
        });
    }
    
    container.appendChild(svg);
}

// 新增：渲染音符详细统计表格
function renderNoteStatsTable(answers) {
    // 查找或创建表格容器
    let tableContainer = document.getElementById('note-stats-table-container');
    if (!tableContainer) {
        tableContainer = document.createElement('div');
        tableContainer.id = 'note-stats-table-container';
        tableContainer.className = 'stats-table-container chart-view'; // 复用 chart-view 样式使其受 tab 控制
        // 添加到 note-chart 的容器中，或者作为独立的 tab 内容
        // 这里为了简单，我们把它放在 note-chart 视图的下方，但由于 chart-view 是互斥的，
        // 最好是把表格直接追加到 note-chart div 里面。
        // 修正：我们不创建新的 chart-view，而是把表格内容注入到 note-chart div 的底部
    }
    
    const noteChartContainer = document.getElementById('note-chart');
    // 清除旧表格（保留SVG图表）
    const existingTable = noteChartContainer.querySelector('.stats-table-container');
    if (existingTable) {
        existingTable.remove();
    }
    
    if (answers.length === 0) return;
    
    // 统计数据
    const stats = {};
    NOTE_MAPPINGS.forEach(m => {
        stats[m.note] = { 
            total: 0, 
            correct: 0, 
            totalTime: 0,
            recentCorrect: 0,
            recentTotal: 0
        };
    });
    
    // 全量统计
    answers.forEach(a => {
        if (stats[a.note]) {
            stats[a.note].total++;
            stats[a.note].totalTime += (a.responseTime || 0);
            if (a.isCorrect) stats[a.note].correct++;
        }
    });
    
    // 最近10次统计
    const recentAnswers = answers.slice(-50); // 取最近50条来计算每个音符的近期表现
    recentAnswers.forEach(a => {
        if (stats[a.note]) {
            stats[a.note].recentTotal++;
            if (a.isCorrect) stats[a.note].recentCorrect++;
        }
    });
    
    // 生成HTML
    const containerDiv = document.createElement('div');
    containerDiv.className = 'stats-table-container';
    
    let html = `
        <table class="stats-table">
            <thead>
                <tr>
                    <th>音符</th>
                    <th>次数</th>
                    <th>准确率</th>
                    <th>反应(s)</th>
                    <th>近期</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    NOTE_MAPPINGS.forEach(m => {
        const s = stats[m.note];
        if (s.total > 0) {
            const acc = Math.round((s.correct / s.total) * 100);
            const avgTime = (s.totalTime / s.total).toFixed(2);
            const recentAcc = s.recentTotal > 0 ? Math.round((s.recentCorrect / s.recentTotal) * 100) : '-';
            
            // 识别薄弱环节：准确率 < 70% 或 反应时间 > 2.5s
            const isWeak = acc < 70 || avgTime > 2.5;
            const rowClass = isWeak ? 'weak-note' : '';
            
            // 准确率颜色
            let accClass = 'score-high';
            if (acc < 70) accClass = 'score-low';
            else if (acc < 90) accClass = 'score-medium';
            
            html += `
                <tr class="${rowClass}">
                    <td class="note-name">${m.note}</td>
                    <td>${s.total}</td>
                    <td class="${accClass}">${acc}%</td>
                    <td>${avgTime}</td>
                    <td>${recentAcc}%</td>
                </tr>
            `;
        }
    });
    
    html += `</tbody></table>`;
    containerDiv.innerHTML = html;
    
    noteChartContainer.appendChild(containerDiv);
}

function renderHistoryList(answers) {
    const container = document.getElementById('history-items');
    container.innerHTML = '';
    
    // 显示最近10条，倒序
    const recentHistory = [...answers].reverse().slice(0, 10);
    
    recentHistory.forEach(a => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const date = new Date(a.timestamp);
        const timeStr = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        let modeLabel = '音→数';
        if (a.mode === 'noteToSolfege') modeLabel = '音→唱';
        if (a.mode === 'numberToNote') modeLabel = '数→音';
        
        item.innerHTML = `
            <div class="history-time">${timeStr}</div>
            <div class="history-detail">
                <span>${modeLabel}</span>
                <span>${a.note}</span>
                <span class="history-result ${a.isCorrect ? 'result-correct' : 'result-wrong'}">
                    ${a.isCorrect ? '✓' : '✗'}
                </span>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// 设置相关功能
function initSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const settingsOverlay = document.getElementById('settings-overlay');
    
    const analyticsBtn = document.getElementById('analytics-btn');
    const closeAnalyticsBtn = document.getElementById('close-analytics');
    const analyticsOverlay = document.getElementById('analytics-overlay');
    
    // 打开设置
    settingsBtn.addEventListener('click', () => {
        settingsOverlay.classList.remove('hidden');
    });
    
    // 关闭设置
    closeSettingsBtn.addEventListener('click', () => {
        settingsOverlay.classList.add('hidden');
    });
    
    // 打开分析
    analyticsBtn.addEventListener('click', () => {
        renderAnalytics();
        analyticsOverlay.classList.remove('hidden');
    });
    
    // 关闭分析
    closeAnalyticsBtn.addEventListener('click', () => {
        analyticsOverlay.classList.add('hidden');
    });
    
    // 图表切换
    const tabs = document.querySelectorAll('.chart-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const targetId = tab.dataset.target;
            document.querySelectorAll('.chart-view').forEach(view => {
                view.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // 点击背景关闭
    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) {
            settingsOverlay.classList.add('hidden');
        }
    });
    analyticsOverlay.addEventListener('click', (e) => {
        if (e.target === analyticsOverlay) {
            analyticsOverlay.classList.add('hidden');
        }
    });
    
    // 模式切换
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.mode-btn.active').classList.remove('active');
            btn.classList.add('active');
            gameState.currentMode = btn.dataset.mode;
            gameState.score = 0;
            gameState.total = 0;
            
            // 切换模式后自动关闭设置并刷新题目
            setTimeout(() => {
                settingsOverlay.classList.add('hidden');
                loadNextQuestion();
            }, 300);
        });
    });

    // 等级选择
    const levelSelect = document.getElementById('level-select');
    if (levelSelect) {
        levelSelect.addEventListener('change', (e) => {
            const newLevel = parseInt(e.target.value);
            if (newLevel !== gameState.currentLevel) {
                gameState.currentLevel = newLevel;
                gameState.score = 0;
                gameState.total = 0;
                gameState.consecutiveErrors = 0;
                
                updateLevelDisplay();
                
                // 切换等级后自动关闭设置并刷新题目
                setTimeout(() => {
                    settingsOverlay.classList.add('hidden');
                    loadNextQuestion();
                }, 300);
            }
        });
    }
}

// 初始化游戏
function initGame() {
    initAudioContexts();
    initSettings();
    
    updateLevelDisplay();
    loadNextQuestion();
}

document.addEventListener('DOMContentLoaded', initGame);

