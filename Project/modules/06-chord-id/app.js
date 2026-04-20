/**
 * T6 - 节奏同步练习核心逻辑
 */

// --- 节奏型定义 ---
const RHYTHM_PATTERNS = {
    1: [ // Level 1: 基础时值
        ['w'], ['h', 'h'], ['q', 'q', 'q', 'q'], ['h', 'q', 'q']
    ],
    2: [ // Level 2: 八分音符
        ['q', '8', '8', 'q', 'q'], ['8', '8', 'q', '8', '8', 'q'], ['q', 'q', 'q', '8', '8']
    ],
    3: [ // Level 3: 附点与切分
        ['q.','8', 'q', 'q'], ['q', '8', 'q', '8'], ['8', 'q', '8', 'q']
    ],
    4: [ // Level 4: 十六分音符
        ['q', '16', '16', '16', '16', 'q'], ['16', '16', '16', '16', 'q', 'q']
    ]
};

// --- 游戏状态 ---
let state = {
    bpm: 80,
    level: 1,
    isPlaying: false,
    isCountingIn: true,
    currentPattern: [],
    targetTimes: [], // 理论点击时间戳 (ms)
    userTaps: [],    // 实际点击时间戳 (ms)
    startTime: 0,
    nextBeatTime: 0,
    beatCount: 0,
    timerId: null,
    audioCtx: null,
    stats: {
        perfect: 0,
        great: 0,
        good: 0,
        miss: 0,
        total: 0
    }
};

// --- 音频初始化 ---
function initAudio() {
    if (!state.audioCtx) {
        state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playClick(frequency, volume = 0.5, duration = 0.1) {
    const osc = state.audioCtx.createOscillator();
    const gain = state.audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, state.audioCtx.currentTime);
    
    gain.gain.setValueAtTime(volume, state.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, state.audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(state.audioCtx.destination);
    
    osc.start();
    osc.stop(state.audioCtx.currentTime + duration);
}

// --- 节奏引擎 ---
function generateRhythm() {
    const patterns = RHYTHM_PATTERNS[state.level];
    state.currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
    renderStave();
}

function renderStave() {
    const container = document.getElementById('stave');
    container.innerHTML = '';
    const renderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(600, 120);
    const context = renderer.getContext();
    const stave = new Vex.Flow.Stave(10, 10, 580);
    stave.addClef('percussion').addTimeSignature('4/4');
    stave.setContext(context).draw();

    const notes = state.currentPattern.map(d => {
        return new Vex.Flow.StaveNote({ clef: 'percussion', keys: ['b/4'], duration: d, stroke_style: '#2c3e50' });
    });

    const voice = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4 });
    voice.setStrict(false);
    voice.addTickables(notes);
    new Vex.Flow.Formatter().joinVoices([voice]).format([voice], 500);
    voice.draw(context, stave);

    // 计算理论时间点
    calculateTargetTimes();
}

function calculateTargetTimes() {
    const beatDuration = 60000 / state.bpm; // ms per beat
    let currentTime = 0;
    state.targetTimes = [];

    const durationMap = { 'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25, 'q.': 1.5, '8.': 0.75 };

    state.currentPattern.forEach(d => {
        state.targetTimes.push(currentTime);
        currentTime += (durationMap[d] || 1) * beatDuration;
    });
}

// --- 游戏循环 ---
function startChallenge() {
    initAudio();
    if (state.isPlaying) return;

    state.isPlaying = true;
    state.userTaps = [];
    state.beatCount = 0;
    state.stats = { perfect: 0, great: 0, good: 0, miss: 0, total: state.targetTimes.length };
    
    updateUIForStart();
    
    const beatInterval = 60000 / state.bpm;
    state.nextBeatTime = performance.now() + 100; // 给一点缓冲
    
    // 预备拍逻辑
    state.isCountingIn = document.getElementById('count-in-toggle').checked;
    const preBeats = state.isCountingIn ? 4 : 0;
    const totalBeats = preBeats + 4; // 预备 + 演奏

    function tick() {
        const now = performance.now();
        if (now >= state.nextBeatTime) {
            const currentBeat = state.beatCount % 4;
            
            // 播放节拍器
            const freq = currentBeat === 0 ? 880 : 440;
            playClick(freq, 0.3);
            
            // 更新 UI
            updateBeatDots(currentBeat);
            
            // 演奏开始点
            if (state.beatCount === preBeats) {
                state.startTime = state.nextBeatTime;
                showPlayhead();
            }

            state.beatCount++;
            state.nextBeatTime += beatInterval;

            if (state.beatCount > totalBeats) {
                endChallenge();
                return;
            }
        }
        state.timerId = requestAnimationFrame(tick);
        updatePlayhead();
    }
    tick();
}

function updateBeatDots(beat) {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((d, i) => {
        d.classList.toggle('active', i === beat);
        d.classList.toggle('accent', i === 0 && i === beat);
    });
}

function showPlayhead() {
    const ph = document.getElementById('playhead');
    ph.classList.remove('hidden');
    document.getElementById('feedback-text').textContent = "GO!";
}

function updatePlayhead() {
    if (!state.startTime || state.beatCount <= (state.isCountingIn ? 4 : 0)) return;
    const elapsed = performance.now() - state.startTime;
    const totalDuration = (60000 / state.bpm) * 4;
    const progress = (elapsed / totalDuration) * 100;
    const ph = document.getElementById('playhead');
    if (ph) ph.style.left = `${Math.min(progress, 100)}%`;
}

// --- 输入检测 ---
function handleTap() {
    if (!state.isPlaying || state.beatCount <= (state.isCountingIn ? 4 : 0)) {
        playClick(600, 0.1); // 随便响一下
        return;
    }

    const tapTime = performance.now() - state.startTime;
    state.userTaps.push(tapTime);
    playClick(1200, 0.6, 0.05); // 打击感音效

    // 寻找最近的目标点
    let minDiff = Infinity;
    let targetIdx = -1;

    state.targetTimes.forEach((t, i) => {
        const diff = Math.abs(tapTime - t);
        if (diff < minDiff) {
            minDiff = diff;
            targetIdx = i;
        }
    });

    // 判定逻辑 (ms)
    let rating = "";
    if (minDiff < 50) { rating = "PERFECT"; state.stats.perfect++; }
    else if (minDiff < 100) { rating = "GREAT"; state.stats.great++; }
    else if (minDiff < 200) { rating = "GOOD"; state.stats.good++; }
    else { rating = "MISS"; state.stats.miss++; }

    showFeedback(rating);
    addMarker(tapTime, rating);
}

function showFeedback(text) {
    const fb = document.getElementById('feedback-text');
    fb.textContent = text;
    fb.style.color = text === "PERFECT" ? "var(--perfect-color)" : 
                     text === "MISS" ? "var(--wrong-color)" : "var(--correct-color)";
}

function addMarker(time, rating) {
    const container = document.getElementById('user-markers');
    const totalDuration = (60000 / state.bpm) * 4;
    const pos = (time / totalDuration) * 100;
    
    const m = document.createElement('div');
    m.className = `marker user-marker marker-${rating.toLowerCase()}`;
    m.style.left = `${pos}%`;
    container.appendChild(m);
}

// --- 结算 ---
function endChallenge() {
    state.isPlaying = false;
    cancelAnimationFrame(state.timerId);
    
    const accuracy = Math.round((state.stats.perfect + state.stats.great * 0.8 + state.stats.good * 0.5) / state.stats.total * 100);
    
    document.getElementById('accuracy-display').textContent = `${accuracy}%`;
    document.getElementById('result-accuracy').textContent = `${accuracy}%`;
    document.getElementById('result-overlay').classList.remove('hidden');
    
    document.getElementById('playhead').classList.add('hidden');
}

// --- UI 交互 ---
function updateUIForStart() {
    document.getElementById('start-btn').classList.add('hidden');
    document.getElementById('tap-btn').classList.remove('hidden');
    document.getElementById('user-markers').innerHTML = '';
    document.getElementById('playhead').style.left = '0%';
    document.getElementById('feedback-text').textContent = state.isCountingIn ? "准备..." : "GO!";
}

function init() {
    generateRhythm();
    
    document.getElementById('start-btn').onclick = startChallenge;
    document.getElementById('tap-btn').onmousedown = (e) => { e.preventDefault(); handleTap(); };
    
    window.onkeydown = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!state.isPlaying) startChallenge();
            else handleTap();
        }
    };

    document.getElementById('retry-btn').onclick = () => {
        document.getElementById('result-overlay').classList.add('hidden');
        document.getElementById('start-btn').classList.remove('hidden');
        document.getElementById('tap-btn').classList.add('hidden');
        generateRhythm();
    };

    // 设置项
    document.getElementById('bpm-range').oninput = (e) => {
        state.bpm = e.target.value;
        document.getElementById('bpm-value').textContent = state.bpm;
        document.getElementById('bpm-display').textContent = `${state.bpm} BPM`;
        calculateTargetTimes();
    };

    document.getElementById('settings-btn').onclick = () => document.getElementById('settings-overlay').classList.remove('hidden');
    document.getElementById('close-settings').onclick = () => document.getElementById('settings-overlay').classList.add('hidden');
    
    document.getElementById('level-select').onchange = (e) => {
        state.level = parseInt(e.target.value);
        generateRhythm();
    };
}

document.addEventListener('DOMContentLoaded', init);
