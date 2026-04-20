// ==============================
// T3 - 音高走向识别训练
// 核心功能：识别两个音之间的音高走向
// 音高范围：C4-B4，从大音程开始训练
// ==============================

// 音高数据配置（C4-B4范围）- 使用本地音频文件
const PITCHES_C4_B4 = [
    { note: 'C4', name: 'C4', vexflow: 'c/4', audio: '../../shared/audio/piano-C4.mp3', midi: 60 },
    { note: 'D4', name: 'D4', vexflow: 'd/4', audio: '../../shared/audio/piano-D4.mp3', midi: 62 },
    { note: 'E4', name: 'E4', vexflow: 'e/4', audio: '../../shared/audio/piano-E4.mp3', midi: 64 },
    { note: 'F4', name: 'F4', vexflow: 'f/4', audio: '../../shared/audio/piano-F4.mp3', midi: 65 },
    { note: 'G4', name: 'G4', vexflow: 'g/4', audio: '../../shared/audio/piano-G4.mp3', midi: 67 },
    { note: 'A4', name: 'A4', vexflow: 'a/4', audio: '../../shared/audio/piano-A4.mp3', midi: 69 },
    { note: 'B4', name: 'B4', vexflow: 'b/4', audio: '../../shared/audio/piano-B4.mp3', midi: 71 }
];

// 音程类型 definition (level based)
const INTERVAL_TYPES = [
    {
        name: '纯五度',
        level: 1,
        semitones: 7,
        examples: [
            { first: 'C4', second: 'G4' },
            { first: 'D4', second: 'A4' },
            { first: 'E4', second: 'B4' },
            { first: 'G4', second: 'C4' },
            { first: 'A4', second: 'D4' },
            { first: 'B4', second: 'E4' }
        ]
    },
    {
        name: '纯四度',
        level: 2,
        semitones: 5,
        examples: [
            { first: 'C4', second: 'F4' },
            { first: 'D4', second: 'G4' },
            { first: 'E4', second: 'A4' },
            { first: 'F4', second: 'B4' },
            { first: 'F4', second: 'C4' },
            { first: 'G4', second: 'D4' },
            { first: 'A4', second: 'E4' },
            { first: 'B4', second: 'F4' }
        ]
    },
    {
        name: '大三度',
        level: 3,
        semitones: 4,
        examples: [
            { first: 'C4', second: 'E4' },
            { first: 'F4', second: 'A4' },
            { first: 'G4', second: 'B4' },
            { first: 'E4', second: 'C4' },
            { first: 'A4', second: 'F4' },
            { first: 'B4', second: 'G4' }
        ]
    },
    {
        name: '小三度',
        level: 4,
        semitones: 3,
        examples: [
            { first: 'D4', second: 'F4' },
            { first: 'E4', second: 'G4' },
            { first: 'A4', second: 'C5' },
            { first: 'F4', second: 'D4' },
            { first: 'G4', second: 'E4' },
            { first: 'C5', second: 'A4' }
        ]
    },
    {
        name: '大二度（全音）',
        level: 5,
        semitones: 2,
        examples: [
            { first: 'C4', second: 'D4' },
            { first: 'D4', second: 'E4' },
            { first: 'F4', second: 'G4' },
            { first: 'G4', second: 'A4' },
            { first: 'A4', second: 'B4' },
            { first: 'D4', second: 'C4' },
            { first: 'E4', second: 'D4' },
            { first: 'G4', second: 'F4' },
            { first: 'A4', second: 'G4' },
            { first: 'B4', second: 'A4' }
        ]
    },
    {
        name: '小二度（半音）',
        level: 6,
        semitones: 1,
        examples: [
            { first: 'C4', second: 'C#4' },
            { first: 'E4', second: 'F4' },
            { first: 'F4', second: 'E4' },
            { first: 'B4', second: 'C5' }
        ]
    }
];

// 游戏状态
let gameState = {
    currentFirstPitch: null,
    currentSecondPitch: null,
    correctDirection: null,
    score: 0,
    total: 0,
    currentLevel: 1,
    consecutiveErrors: 0,
    maxConsecutiveErrors: 3,
    audioInterval: 800,
    audioContexts: {},
    lastLevelUpTime: 0,
    lastLevelDownTime: 0
};

function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getPitchByNote(note) {
    return PITCHES_C4_B4.find(p => p.note === note);
}

function getCurrentIntervalType() {
    return INTERVAL_TYPES.find(t => t.level === gameState.currentLevel);
}

function getDirection(firstPitch, secondPitch) {
    if (firstPitch.midi < secondPitch.midi) return 'higher';
    if (firstPitch.midi > secondPitch.midi) return 'lower';
    return 'same';
}

function initAudioContexts() {
    gameState.audioContexts = {};
    PITCHES_C4_B4.forEach(pitch => {
        const audio = new Audio(pitch.audio);
        gameState.audioContexts[pitch.note] = audio;
    });
}

function playAudio(pitch, delay = 0) {
    const audio = gameState.audioContexts[pitch.note];
    if (!audio) return;
    
    if (delay > 0) {
        setTimeout(() => {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('音频播放失败:', e));
        }, delay);
    } else {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('音频播放失败:', e));
    }
}

function playBothPitches() {
    if (!gameState.currentFirstPitch || !gameState.currentSecondPitch) return;
    playAudio(gameState.currentFirstPitch);
    playAudio(gameState.currentSecondPitch, gameState.audioInterval);
}

function renderPitches(firstPitch, secondPitch) {
    const container = document.getElementById('stave');
    container.innerHTML = '';
    const renderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(400, 120);
    const context = renderer.getContext();
    const stave = new Vex.Flow.Stave(50, 0, 300, { spacing_between_lines_px: 12 });
    stave.addClef('treble');
    const note1 = new Vex.Flow.StaveNote({ clef: 'treble', keys: [firstPitch.vexflow], duration: 'q' });
    const note2 = new Vex.Flow.StaveNote({ clef: 'treble', keys: [secondPitch.vexflow], duration: 'q' });
    const voice = new Vex.Flow.Voice({ num_beats: 2, beat_value: 4 }).setStrict(false);
    voice.addTickables([note1, note2]);
    const formatter = new Vex.Flow.Formatter();
    formatter.joinVoices([voice]).format([voice], 250);
    stave.setContext(context).draw();
    voice.draw(context, stave);
    const direction = getDirection(firstPitch, secondPitch);
    drawNoteConnection(context, note1, note2, direction);
}

function drawNoteConnection(context, note1, note2, direction) {
    const note1Bounds = note1.getBoundingBox();
    const note2Bounds = note2.getBoundingBox();
    const x1 = note1Bounds.x + note1Bounds.w;
    const y1 = note1Bounds.y + note1Bounds.h / 2;
    const x2 = note2Bounds.x;
    const y2 = note2Bounds.y + note2Bounds.h / 2;
    context.beginPath();
    context.moveTo(x1, y1);
    const controlX = (x1 + x2) / 2;
    const curveHeight = 20;
    if (direction === 'higher') {
        context.bezierCurveTo(controlX, y1 - curveHeight, controlX, y2 - curveHeight, x2, y2);
    } else if (direction === 'lower') {
        context.bezierCurveTo(controlX, y1 + curveHeight, controlX, y2 + curveHeight, x2, y2);
    } else {
        context.lineTo(x2, y1);
    }
    context.strokeStyle = direction === 'higher' ? '#28a745' : direction === 'lower' ? '#dc3545' : '#6c757d';
    context.lineWidth = 2;
    if (direction === 'same') context.setLineDash([5, 5]);
    context.stroke();
    context.setLineDash([]);
    drawArrow(context, x2, y2, direction);
}

function drawArrow(context, x, y, direction) {
    const arrowSize = 8;
    context.save();
    if (direction === 'higher') {
        context.beginPath();
        context.moveTo(x - arrowSize, y - arrowSize);
        context.lineTo(x, y);
        context.lineTo(x + arrowSize, y - arrowSize);
        context.strokeStyle = '#28a745';
        context.lineWidth = 2;
        context.stroke();
    } else if (direction === 'lower') {
        context.beginPath();
        context.moveTo(x - arrowSize, y + arrowSize);
        context.lineTo(x, y);
        context.lineTo(x + arrowSize, y + arrowSize);
        context.strokeStyle = '#dc3545';
        context.lineWidth = 2;
        context.stroke();
    }
    context.restore();
}

function generateIntervalPair() {
    const intervalType = getCurrentIntervalType();
    if (!intervalType) return null;
    const example = randomFrom(intervalType.examples);
    const firstPitch = getPitchByNote(example.first);
    const secondPitch = getPitchByNote(example.second);
    if (!firstPitch || !secondPitch) return null;
    return {
        firstPitch,
        secondPitch,
        correctDirection: getDirection(firstPitch, secondPitch),
        intervalName: intervalType.name
    };
}

function checkLevelDown() {
    const accuracy = gameState.total > 0 ? Math.round((gameState.score / gameState.total) * 100) : 0;
    const condition1 = gameState.total >= 5 && accuracy < 60;
    const condition2 = gameState.consecutiveErrors >= gameState.maxConsecutiveErrors;
    const currentTime = Date.now();
    const condition3 = currentTime - (gameState.lastLevelDownTime || 0) > 30000;
    return (condition1 || condition2) && condition3;
}

function levelUp() {
    if (gameState.currentLevel < INTERVAL_TYPES.length) {
        gameState.lastLevelUpTime = Date.now();
        gameState.currentLevel++;
        gameState.consecutiveErrors = 0;
        updateLevelDisplay();
        loadNextQuestion();
        const intervalType = getCurrentIntervalType();
        document.getElementById('feedback').textContent = `恭喜升级！开始学习${intervalType.name}`;
        document.getElementById('feedback').className = 'feedback correct';
    }
}

function levelDown() {
    if (gameState.currentLevel > 1) {
        gameState.lastLevelDownTime = Date.now();
        gameState.currentLevel--;
        gameState.score = 0;
        gameState.total = 0;
        gameState.consecutiveErrors = 0;
        updateLevelDisplay();
        loadNextQuestion();
        const intervalType = getCurrentIntervalType();
        document.getElementById('feedback').textContent = `需要巩固基础，已降低到${intervalType.name}`;
        document.getElementById('feedback').className = 'feedback wrong';
    }
}

function updateLevelDisplay() {
    document.getElementById('current-level').textContent = gameState.currentLevel;
    const intervalType = getCurrentIntervalType();
    document.getElementById('interval-type').textContent = `(${intervalType.name})`;
    const levelSelect = document.getElementById('level-select');
    if (levelSelect) levelSelect.value = gameState.currentLevel;
}

function checkAnswer(selectedDirection) {
    const options = document.querySelectorAll('.option-btn');
    if (selectedDirection === gameState.correctDirection) {
        options.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.direction === gameState.correctDirection) {
                btn.classList.add('correct-highlight');
            }
        });
        gameState.score++;
        gameState.total++;
        gameState.consecutiveErrors = 0;
        document.getElementById('feedback').textContent = '正确！';
        document.getElementById('feedback').className = 'feedback correct';
        
        // 答对显示反馈
        document.querySelector('.display-area').classList.add('correct-state');
        document.getElementById('stave-container').classList.remove('hidden-stave');
        document.getElementById('current-interval').parentElement.classList.remove('hidden-info');
        
        setTimeout(loadNextQuestion, 2500);
    } else {
        const selectedBtn = Array.from(options).find(btn => btn.dataset.direction === selectedDirection);
        selectedBtn.classList.add('error');
        setTimeout(() => { selectedBtn.classList.remove('error'); }, 500);
        gameState.total++;
        gameState.consecutiveErrors++;
        const directionText = gameState.correctDirection === 'higher' ? '更高' : gameState.correctDirection === 'lower' ? '更低' : '相同';
        document.getElementById('feedback').textContent = `错误！正确答案是：${directionText}`;
        document.getElementById('feedback').className = 'feedback wrong';
        if (checkLevelDown()) {
            setTimeout(levelDown, 1500);
        } else {
            updateScore();
        }
    }
}

function updateScore() {
    const accuracy = gameState.total > 0 ? Math.round((gameState.score / gameState.total) * 100) : 0;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    progressBar.style.width = `${accuracy}%`;
    progressText.textContent = `进度: ${gameState.score}/${gameState.total}`;
    document.getElementById('accuracy-rate').textContent = `${accuracy}%`;
    progressBar.className = 'progress-bar';
    if (accuracy <= 70) progressBar.classList.add('red');
    else if (accuracy <= 90) progressBar.classList.add('orange');
    else progressBar.classList.add('green');
    
    const canLevelUp = () => {
        return gameState.total >= 8 && accuracy > 92 && (Date.now() - (gameState.lastLevelUpTime || 0) > 45000);
    };
    if (canLevelUp()) setTimeout(levelUp, 1000);
}

function loadNextQuestion() {
    document.getElementById('feedback').textContent = '';
    document.querySelector('.display-area').classList.remove('correct-state');
    document.getElementById('stave-container').classList.add('hidden-stave');
    document.getElementById('current-interval').parentElement.classList.add('hidden-info');

    const intervalData = generateIntervalPair();
    if (!intervalData) return;
    gameState.currentFirstPitch = intervalData.firstPitch;
    gameState.currentSecondPitch = intervalData.secondPitch;
    gameState.correctDirection = intervalData.correctDirection;
    renderPitches(gameState.currentFirstPitch, gameState.currentSecondPitch);
    document.getElementById('current-interval').textContent = `${gameState.currentFirstPitch.note} → ${gameState.currentSecondPitch.note}`;
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct-highlight', 'error', 'disabled');
    });
    setTimeout(playBothPitches, 500);
    updateScore();
}

function initSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const settingsOverlay = document.getElementById('settings-overlay');
    const levelSelect = document.getElementById('level-select');

    settingsBtn.addEventListener('click', () => {
        settingsOverlay.classList.remove('hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsOverlay.classList.add('hidden');
    });

    settingsOverlay.addEventListener('click', (e) => {
        if (e.target === settingsOverlay) settingsOverlay.classList.add('hidden');
    });

    levelSelect.addEventListener('change', (e) => {
        const newLevel = parseInt(e.target.value);
        if (newLevel !== gameState.currentLevel) {
            gameState.currentLevel = newLevel;
            gameState.score = 0;
            gameState.total = 0;
            gameState.consecutiveErrors = 0;
            updateLevelDisplay();
            setTimeout(() => {
                settingsOverlay.classList.add('hidden');
                loadNextQuestion();
            }, 300);
        }
    });
}

function initGame() {
    initAudioContexts();
    initSettings();
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => { if (!btn.disabled) checkAnswer(btn.dataset.direction); });
    });
    document.getElementById('play-both').addEventListener('click', playBothPitches);
    updateLevelDisplay();
    loadNextQuestion();
}

document.addEventListener('DOMContentLoaded', initGame);
