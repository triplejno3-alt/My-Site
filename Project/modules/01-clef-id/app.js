// 谱号数据配置
const CLEF_TYPES = [
    { type: 'treble', name: '高音谱号', symbol: 'G' },
    { type: 'bass', name: '低音谱号', symbol: 'F' },
    { type: 'alto', name: '中音谱号', symbol: 'C' },

];

// 游戏状态
let gameState = {
    currentClef: null,
    score: 0,
    total: 0
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadNextQuestion();
});

// 核心功能：渲染谱号
function renderClef(clefType) {
    const container = document.getElementById('stave');
    
    // 清除之前的渲染
    container.innerHTML = '';
    
    // 初始化 VexFlow 原生 API
    const renderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(200, 200);
    
    const context = renderer.getContext();
    context.scale(4, 3); // 放大 2 倍

    // 创建五线谱，设置行间距
    const stave = new Vex.Flow.Stave(1, -30, 50, {
    spacing_between_lines_px: 10, // 默认大约 10px，调整为20px以增大行间距
});
    
    // 添加谱号
    const clef = stave.addClef(clefType);
    
    // 渲染
    stave.setContext(context).draw();
}

// 生成选择题选项
function generateOptions(correctClef) {
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    // 创建选项数组（包含正确答案和干扰项）
    let allOptions = [correctClef];
    
    // 添加干扰项
    const wrongOptions = CLEF_TYPES.filter(c => c.type !== correctClef.type);
    const selectedWrong = wrongOptions
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    allOptions = allOptions.concat(selectedWrong);
    
    // 按自定义顺序排序：低音谱号、中音谱号、高音谱号
    const orderMap = {
        '低音谱号': 1,
        '中音谱号': 2,
        '高音谱号': 3
    };
    
    allOptions.sort((a, b) => orderMap[a.name] - orderMap[b.name]);
    
    // 创建按钮
    allOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option.name;
        btn.onclick = () => checkAnswer(option);
        optionsContainer.appendChild(btn);
    });
}

// 检查答案
function checkAnswer(selectedOption) {
    const options = document.querySelectorAll('.option-btn');
    
    // 判断对错
    if (selectedOption.type === gameState.currentClef.type) {
        // 正确反馈：按钮变绿色
        const selectedBtn = Array.from(options).find(btn => btn.textContent === selectedOption.name);
        selectedBtn.style.background = '#d4edda';
        selectedBtn.style.color = '#155724';
        
        // 禁用所有选项
        options.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === gameState.currentClef.name) {
                btn.style.background = '#d4edda';
                btn.style.color = '#155724';
            }
        });
        
        gameState.score++;
        gameState.total++;
        
        // 正确后直接进入下一题
        setTimeout(() => {
            loadNextQuestion();
        }, 500);
    } else {
        // 错误反馈：按钮变红色，0.2秒后变灰色
        const selectedBtn = Array.from(options).find(btn => btn.textContent === selectedOption.name);
        selectedBtn.style.background = '#f8d7da';
        selectedBtn.style.color = '#721c24';
        
        // 0.2秒后变为灰色禁用状态
        setTimeout(() => {
            selectedBtn.style.background = '#e9ecef';
            selectedBtn.style.color = '#6c757d';
            selectedBtn.disabled = true; // 禁用错误选项
        }, 200);
        
        gameState.total++;
        updateScore();
    }
}

// 加载下一题
function loadNextQuestion() {
    // 重置界面
    document.getElementById('feedback').textContent = '';
    
    // 随机选择谱号
    const randomIndex = Math.floor(Math.random() * CLEF_TYPES.length);
    gameState.currentClef = CLEF_TYPES[randomIndex];
    
    // 渲染谱号
    renderClef(gameState.currentClef.type);
    
    // 生成选项
    generateOptions(gameState.currentClef);
    
    // 更新分数显示
    updateScore();
}

// 更新分数显示
function updateScore() {
    const accuracy = gameState.total > 0 ? Math.round((gameState.score / gameState.total) * 100) : 0;
    
    // 控制进度条显示/隐藏
    const progressContainer = document.querySelector('.progress-container');
    if (gameState.total <= 5) {
        progressContainer.classList.add('hidden');
    } else {
        progressContainer.classList.remove('hidden');
    }
    
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
    
    // 只有答题超过5题后才检查是否通过
    if (gameState.total > 5 && accuracy > 90) {
        document.getElementById('feedback').textContent = '恭喜！正确率超过90%，已通过！';
        document.getElementById('feedback').style.color = '#28a745';
    }
}

