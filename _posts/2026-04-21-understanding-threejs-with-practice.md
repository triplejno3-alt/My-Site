---
layout: post
title: "开启 Web 3D 之门：Three.js 深度解析与实战指南"
date: 2026-04-21 11:16:00 +0800
categories: 技术 前端
tags: Three.js WebGL 3D 可视化
---

在当今的网页设计中，3D 效果已经不再是奢侈品。无论是炫酷的产品展示、交互式地图，还是沉浸式游戏，**Three.js** 都是实现这些效果的首选工具。

今天，我们将深入探讨 Three.js 的核心概念，并通过一个实际的练习，带你亲手创建一个 3D 世界。

---

### 什么是 Three.js？

简单来说，**Three.js 是一个基于原生 WebGL 的 JavaScript 库**。

WebGL 是一项非常底层且强大的技术，它允许 JavaScript 直接调用显卡（GPU）的计算能力。但原生 WebGL 的开发门槛极高，即使画一个简单的三角形也需要编写数十行复杂的着色器代码。

Three.js 的出现，将这些复杂的底层操作封装成了直观的 API。你不再需要关心复杂的数学矩阵，只需要关注“场景中有哪些物体”、“灯光在哪里”以及“摄像机怎么看”。

### 核心三大要素：场景、摄像机、渲染器

理解 Three.js，只需要掌握这三个核心概念：

1.  **场景 (Scene)**：这是你的 3D 世界。你可以把它想象成一个舞台，所有的物体（模型、灯光、背景）都放在这里。
2.  **摄像机 (Camera)**：这是观察者的眼睛。不同的摄像机参数（如视角、焦距）决定了用户在屏幕上看到的内容。最常用的是**透视摄像机 (PerspectiveCamera)**，它模拟了人眼的视觉：近大远小。
3.  **渲染器 (Renderer)**：这是背后的“画师”。它负责接收场景和摄像机的信息，并将 3D 画面渲染到网页的 HTML `<canvas>` 元素上。

---

### 动手实践：创建你的第一个 3D 立方体

我们将创建一个在空间中旋转的绿色立方体。

#### 实时演示 (Live Demo)

<div id="threejs-container" style="width: 100%; height: 400px; background: #111; border-radius: 8px; overflow: hidden; margin: 2rem 0;"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js"></script>
<script>
(function() {
    const container = document.getElementById('threejs-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. 场景
    const scene = new THREE.Scene();

    // 2. 摄像机
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2;

    // 3. 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 4. 物体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        specular: 0x555555,
        shininess: 30
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 5. 灯光 (Phong 材质需要灯光)
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 2).normalize();
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // 6. 动画
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    // 响应式处理
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });

    animate();
})();
</script>

你可以将以下代码直接保存为 `.html` 文件并在浏览器中运行。

#### 1. 基础结构
首先引入 Three.js 库（通过 CDN）：
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.min.js"></script>
```

#### 2. 初始化核心组件
```javascript
// 1. 创建场景
const scene = new THREE.Scene();

// 2. 创建摄像机 (视野角度, 长宽比, 近裁剪面, 远裁剪面)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // 将相机向后移动 5 个单位

// 3. 创建渲染器并添加到 DOM
const renderer = new THREE.WebGLRenderer({ antialias: true }); // 开启抗锯齿
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

#### 3. 添加物体
一个物体由**几何体 (Geometry)**和**材质 (Material)**组成：
```javascript
// 创建立方体几何体
const geometry = new THREE.BoxGeometry(1, 1, 1);
// 创建绿色基础材质
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// 将几何体和材质组合成网格 (Mesh)
const cube = new THREE.Mesh(geometry, material);
// 添加到场景中
scene.add(cube);
```

#### 4. 动画循环
为了让立方体动起来，我们需要一个循环函数：
```javascript
function animate() {
    requestAnimationFrame(animate);

    // 让立方体旋转起来
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // 渲染场景
    renderer.render(scene, camera);
}
animate();
```

---

### 为什么 Three.js 如此流行？

-   **生态丰富**：拥有数不清的插件、示例和活跃的社区。
-   **跨平台**：只要有浏览器，就能运行，无需安装任何插件。
-   **性能优异**：充分利用 GPU 加速。
-   **易于上手**：对比原生 WebGL，Three.js 的学习曲线非常友好。

### 结语

Three.js 的世界远比这更广阔。你可以添加**光影效果 (Lights & Shadows)**、**物理引擎 (Physics)**、**粒子系统 (Particles)**，甚至导入复杂的 **3D 模型 (GLTF)**。

如果你想在这个领域深耕，建议先从掌握基础的坐标系和变换开始。在这个 3D 网页时代，掌握 Three.js 将为你打开一扇通往无限可能的大门。
