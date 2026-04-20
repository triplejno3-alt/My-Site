// 音高数据配置
const PITCH_TYPES = [
    { note: 'C', name: 'C', vexflow: 'c/4', audio: '../../shared/audio/piano-C4.mp3' },
    { note: 'D', name: 'D', vexflow: 'd/4', audio: '../../shared/audio/piano-D4.mp3' },
    { note: 'E', name: 'E', vexflow: 'e/4', audio: '../../shared/audio/piano-E4.mp3' },
    { note: 'F', name: 'F', vexflow: 'f/4', audio: '../../shared/audio/piano-F4.mp3' },
    { note: 'G', name: 'G', vexflow: 'g/4', audio: '../../shared/audio/piano-G4.mp3' },
    { note: 'A', name: 'A', vexflow: 'a/4', audio: '../../shared/audio/piano-A4.mp3' },
    { note: 'B', name: 'B', vexflow: 'b/4', audio: '../../shared/audio/piano-B4.mp3' }
];

// 音符持续时间类型配置
const DURATION_TYPES = [
    { value: 'q', name: '四分音符', beats: 1 },
    { value: 'h', name: '二分音符', beats: 2 },
    { value: 'w', name: '全音符', beats: 4 },
    { value: '8', name: '八分音符', beats: 0.5 },
    { value: '16', name: '十六分音符', beats: 0.25 }
];

// 游戏状态
let gameState = {
    currentPitch: null,
    score: 0,
    total: 0,
    currentLevel: 1,  // 当前等级，从1开始
    unlockedNotes: ['C', 'G'],  // 已解锁的音符（等级1固定为C和G）
    allNotes: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],  // 所有音符
    noteFrequency: {  // 音符出现频率统计（不清零）
        'C': 0,
        'D': 0,
        'E': 0,
        'F': 0,
        'G': 0,
        'A': 0,
        'B': 0
    },
    recentNotes: [],  // 最近出现的音符序列，用于防止连续重复
    maxConsecutive: 3,  // 最大连续出现次数
    consecutiveErrors: 0,  // 连续错误次数
    maxConsecutiveErrors: 3,  // 最大允许连续错误次数
    lastLevelDownTime: 0,  // 上次降级时间，用于冷却
    currentDuration: 'q',  // 当前音符的持续时间类型
    availableDurations: ['q', 'h', 'w', '8', '16']  // 可用的持续时间类型（所有类型：四分、二分、全音符、八分、十六分音符）
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadNextQuestion();
});

// 随机选择音符持续时间
function getRandomDuration() {
    const randomIndex = Math.floor(Math.random() * gameState.availableDurations.length);
    return gameState.availableDurations[randomIndex];
}

// 核心功能：渲染音符
function renderPitch(pitchData) {
    const container = document.getElementById('stave');
    
    // 清除之前的渲染
    container.innerHTML = '';
    
    // 随机选择音符持续时间
    gameState.currentDuration = getRandomDuration();
    
    // 初始化 VexFlow 原生 API
    const renderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(300, 200);
    
    const context = renderer.getContext();
    context.scale(2, 2); // 放大 2 倍

    // 创建五线谱，设置行间距
    const stave = new Vex.Flow.Stave(1, -30, 280, {
        spacing_between_lines_px: 12, // 增大行间距以便显示音符
    });

    // 添加高音谱号
    stave.addClef('treble');
    
    // 创建音符
    const note = new Vex.Flow.StaveNote({
        clef: 'treble',
        keys: [pitchData.vexflow],
        duration: gameState.currentDuration
    });
    
    // 创建音符组
    const voice = new Vex.Flow.Voice({
        num_beats: 1,
        beat_value: 4
    }).setStrict(false);  // 取消严格时间检查，允许不同时值的音符
    voice.addTickables([note]);
    
    // 创建格式化器
    const formatter = new Vex.Flow.Formatter();
    formatter.joinVoices([voice]).format([voice], 280);
    
    // 渲染
    stave.setContext(context).draw();
    voice.draw(context, stave);
}

// 生成选择题选项
function generateOptions(correctPitch) {
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    // 创建所有7个音符的按钮
    PITCH_TYPES.forEach(pitch => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = pitch.name;
        
        // 检查是否已解锁
        if (gameState.unlockedNotes.includes(pitch.note)) {
            // 已解锁：正常交互
            btn.onclick = () => checkAnswer(pitch);
            btn.disabled = false;
            btn.classList.remove('locked');
        } else {
            // 未解锁：灰色禁用状态
            btn.disabled = true;
            btn.classList.add('locked');
        }
        
        optionsContainer.appendChild(btn);
    });
}

// 播放音频
function playAudio(audioPath) {
    const audio = new Audio(audioPath);
    audio.play().catch(e => console.log('音频播放失败:', e));
}

// 检查音符是否会导致连续出现超过限制
function isNoteAllowed(note) {
    // 计算最近出现的相同音符数量
    let consecutiveCount = 0;
    for (let i = gameState.recentNotes.length - 1; i >= 0; i--) {
        if (gameState.recentNotes[i] === note) {
            consecutiveCount++;
        } else {
            break; // 遇到不同音符就停止计数
        }
    }
    
    // 如果连续出现次数已达到限制，则不允许
    return consecutiveCount < gameState.maxConsecutive;
}

// 智能选择算法：加权随机选择（带连续限制）
function getNextPitchWeighted() {
    const availablePitches = PITCH_TYPES.filter(p => 
        gameState.unlockedNotes.includes(p.note)
    );
    
    if (availablePitches.length === 0) return null;
    
    // 过滤掉会导致连续出现超过限制的音符
    const allowedPitches = availablePitches.filter(pitch => 
        isNoteAllowed(pitch.note)
    );
    
    // 如果所有音符都被排除（极端情况），则重置recentNotes并使用所有音符
    let candidates = allowedPitches;
    if (candidates.length === 0) {
        console.log('所有音符都被连续限制排除，重置最近记录');
        gameState.recentNotes = []; // 重置最近记录
        candidates = availablePitches;
    }
    
    // 计算权重：出现次数越少，权重越高
    const weights = candidates.map(pitch => {
        const freq = gameState.noteFrequency[pitch.note];
        return 1 / (freq + 1);  // +1避免除以0，新音符（freq=0）权重为1
    });
    
    // 加权随机选择
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < candidates.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return candidates[i];
        }
    }
    
    return candidates[candidates.length - 1];
}

// 降级函数
function levelDown() {
    if (gameState.currentLevel > 1) {  // 不能降到等级1以下
        gameState.currentLevel--;
        
        // 锁定最近解锁的音符（但保留频率统计）
        if (gameState.unlockedNotes.length > 2) {  // 等级1有2个音符
            // 移除最近解锁的音符（最后一个）
            const lockedNote = gameState.unlockedNotes.pop();
            console.log(`降级：锁定音符 ${lockedNote}`);
        }
        
        // 降级时清零进度
        gameState.score = 0;
        gameState.total = 0;
        gameState.consecutiveErrors = 0;  // 重置连续错误计数
        
        // 记录降级时间，用于冷却
        gameState.lastLevelDownTime = Date.now();
        
        updateLevelDisplay();
        loadNextQuestion();
        
        // 显示降级提示
        document.getElementById('feedback').textContent = '需要巩固基础，已降低难度';
        document.getElementById('feedback').style.color = '#dc3545';
    }
}

// 检查是否需要降级
function checkLevelDown() {
    const accuracy = gameState.total > 0 ? Math.round((gameState.score / gameState.total) * 100) : 0;
    
    // 条件1：正确率低于60%且答题数量≥5
    const condition1 = gameState.total >= 5 && accuracy < 60;
    
    // 条件2：连续错误次数≥3
    const condition2 = gameState.consecutiveErrors >= gameState.maxConsecutiveErrors;
    
    // 条件3：避免频繁降级（冷却时间30秒）
    const lastLevelDownTime = gameState.lastLevelDownTime || 0;
    const currentTime = Date.now();
    const condition3 = currentTime - lastLevelDownTime > 30000; // 30秒冷却
    
    return (condition1 || condition2) && condition3;
}

// 等级升级（随机解锁音符）
function levelUp() {
    if (gameState.currentLevel < 6) {  // 最多6个等级
        gameState.currentLevel++;
        
        // 从尚未解锁的音符中随机选择一个
        const lockedNotes = gameState.allNotes.filter(note => 
            !gameState.unlockedNotes.includes(note)
        );
        
        if (lockedNotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * lockedNotes.length);
            const newNote = lockedNotes[randomIndex];
            gameState.unlockedNotes.push(newNote);
            gameState.unlockedNotes.sort(); // 保持排序
            
            // 新解锁的音符初始频率为0（已经默认是0）
            // 这样在加权随机选择中会有很高的权重
        }
        
        // 升级时只清零进度，不清零频率统计
        gameState.score = 0;
        gameState.total = 0;
        gameState.consecutiveErrors = 0;  // 重置连续错误计数
        // 注意：noteFrequency不清零！
        
        updateLevelDisplay();
        loadNextQuestion();
    }
}

// 更新等级显示
function updateLevelDisplay() {
    const levelElement = document.getElementById('current-level');
    if (levelElement) {
        levelElement.textContent = gameState.currentLevel;
    }
}

// 检查答案
function checkAnswer(selectedOption) {
    const options = document.querySelectorAll('.option-btn');
    
    // 判断对错
    if (selectedOption.note === gameState.currentPitch.note) {
        // 播放正确音频
        playAudio(gameState.currentPitch.audio);
        
        // 正确反馈：按钮变绿色并应用高亮动画
        const selectedBtn = Array.from(options).find(btn => btn.textContent === selectedOption.name);
        selectedBtn.classList.add('correct-highlight');
        
        // 禁用所有选项
        options.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === gameState.currentPitch.name) {
                btn.classList.add('correct-highlight');
            }
        });
        
        gameState.score++;
        gameState.total++;
        
        // 正确：重置连续错误计数
        gameState.consecutiveErrors = 0;
        
        // 正确后直接进入下一题
        setTimeout(() => {
            loadNextQuestion();
        }, 500);
    } else {
        // 错误反馈：应用抖动动画和红色背景
        const selectedBtn = Array.from(options).find(btn => btn.textContent === selectedOption.name);
        selectedBtn.classList.add('error');
        
        // 0.2秒后变为灰色禁用状态
        setTimeout(() => {
            selectedBtn.classList.remove('error');
            selectedBtn.classList.add('disabled');
        }, 200);
        
        gameState.total++;
        
        // 错误：增加连续错误计数
        gameState.consecutiveErrors++;
        
        // 检查是否需要降级
        if (checkLevelDown()) {
            levelDown();
        } else {
            updateScore();
        }
    }
}

// 加载下一题
function loadNextQuestion() {
    // 重置界面
    document.getElementById('feedback').textContent = '';
    
    // 使用智能调度算法选择下一个音符
    gameState.currentPitch = getNextPitchWeighted();
    
    if (gameState.currentPitch) {
        // 更新音符出现频率
        gameState.noteFrequency[gameState.currentPitch.note]++;
        
        // 更新最近出现的音符序列
        gameState.recentNotes.push(gameState.currentPitch.note);
        
        // 保持recentNotes数组大小合理（保留最近20个记录足够判断连续性）
        if (gameState.recentNotes.length > 20) {
            gameState.recentNotes.shift();
        }
        
        // 渲染音符
        renderPitch(gameState.currentPitch);
        
        // 生成选项（所有7个按钮，未解锁的灰色禁用）
        generateOptions(gameState.currentPitch);
        
        // 更新分数显示
        updateScore();
    }
}

// 更新分数显示
function updateScore() {
    const accuracy = gameState.total > 0 ? Math.round((gameState.score / gameState.total) * 100) : 0;
    
    // 控制进度条显示/隐藏
    // const progressContainer = document.querySelector('.progress-container');
    // if (gameState.total <= 5) {
    //     progressContainer.classList.add('hidden');
    // } else {
    //     progressContainer.classList.remove('hidden');
    // }
    
    // 更新进度条
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    progressBar.style.width = `${accuracy}%`;
    progressText.textContent = `进度: ${gameState.score}/${gameState.total}`;
    
    // 根据正确率设置进度条颜色
    progressBar.className = 'progress-bar'; // 重置类名
    
    if (accuracy <= 70) {
        progressBar.classList.add('red');
    } else if (accuracy <= 90) {
        progressBar.classList.add('orange');
    } else {
        progressBar.classList.add('green');
    }
    
    // 检查是否需要降级（在升级检查之前）
    if (checkLevelDown()) {
        levelDown();
    }
    // 只有答题超过5题后才检查是否通过
    else if (gameState.total > 5 && accuracy > 90) {
        // 检查是否满足升级条件（正确率>90%且答题数量≥5）
        if (gameState.total >= 5) {
            levelUp();
        } else {
            document.getElementById('feedback').textContent = '恭喜！正确率超过90%，已通过！';
            document.getElementById('feedback').style.color = '#28a745';
        }
    }
}
