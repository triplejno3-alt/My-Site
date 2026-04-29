---
layout: post_note
title: "Pillow 完全入门：Python 图像处理就该这么玩"
date: 2026-04-28 13:20:00 +0000
tags: [Python, Pillow, 图像处理, 教程]
categories: [技术, Python]
summary: "Pillow 是 Python 最流行的图像处理库，从打开图片到批量处理，这篇让你快速上手。"
---

> 你打开一张图片，想改个尺寸、加个水印、转个格式 —— 用 Photoshop 太重，用代码正合适。
> Pillow 就是干这个的。

## 什么是 Pillow

Pillow 是 Python 的第三方图像处理库，是 PIL（Python Imaging Library）的现代分支。PIL 停在 2009 年不更新了，Pillow 接过来继续活，现在是 Python 生态里图片处理的**默认选择**。

安装：

```bash
pip install Pillow
```

引入时写的是：

```python
from PIL import Image
```

没错，包名叫 `Pillow`，但 import 的时候还是用 `PIL`。历史原因，记住就行。

---

## 基础操作：打开、查看、保存

```python
from PIL import Image

# 打开图片
img = Image.open("photo.jpg")

# 查看基本信息
print(img.size)       # (宽度, 高度) 如 (1920, 1080)
print(img.format)     # JPEG, PNG, GIF...
print(img.mode)       # RGB, RGBA, L(灰度)...

# 显示图片（会调用系统图片查看器）
img.show()

# 保存为其他格式
img.save("photo.png")
```

就这几行，你已经能批量转图片格式了。

---

## 图像缩放与裁剪

### 缩放

```python
# 按指定尺寸
img_resized = img.resize((800, 600))

# 按比例缩放（推荐用 thumbnail，不会变形）
img.thumbnail((800, 600))  # 会原地修改原图
```

`resize` 和 `thumbnail` 的区别：
- `resize`：强制到指定尺寸，会拉伸变形
- `thumbnail`：保持比例，取宽高中符合条件的最大的那个

### 裁剪

```python
# (左, 上, 右, 下) 坐标
cropped = img.crop((100, 100, 500, 500))
cropped.save("cropped.jpg")
```

坐标从图片左上角 (0, 0) 开始算。

### 旋转

```python
rotated = img.rotate(90)                     # 逆时针 90°
rotated_expand = img.rotate(45, expand=True) # expand 避免裁边
```

---

## 滤镜与图像增强

Pillow 内置了一套滤镜，不需要装 OpenCV：

```python
from PIL import ImageFilter

# 模糊
img.filter(ImageFilter.BLUR)

# 轮廓提取
img.filter(ImageFilter.CONTOUR)

# 浮雕
img.filter(ImageFilter.EMBOSS)

# 边缘增强
img.filter(ImageFilter.EDGE_ENHANCE)

# 锐化
img.filter(ImageFilter.SHARPEN)

# 高斯模糊（可调半径）
img.filter(ImageFilter.GaussianBlur(radius=5))
```

还有 `ImageEnhance` 模块可以调亮度、对比度、饱和度：

```python
from PIL import ImageEnhance

enhancer = ImageEnhance.Brightness(img)
img_bright = enhancer.enhance(1.5)  # 1.0 是原样

enhancer = ImageEnhance.Contrast(img)
img_contrast = enhancer.enhance(2.0)

enhancer = ImageEnhance.Color(img)  # 饱和度
img_saturated = enhancer.enhance(1.5)
```

---

## 粘贴与合成

### 粘贴一张图到另一张上（加水印）

```python
from PIL import Image

# 底图
background = Image.open("bg.jpg")

# 水印图（建议带透明通道的 PNG）
watermark = Image.open("logo.png")

# 粘贴到底图右下角
pos = (background.width - watermark.width - 20, 
       background.height - watermark.height - 20)
background.paste(watermark, pos, watermark)  # 第三个参数是 mask，保持透明
background.save("with_watermark.jpg")
```

### 创建纯色图片

```python
from PIL import Image

# 创建 500x500 的红色图片
red = Image.new("RGB", (500, 500), (255, 0, 0))
red.save("red.jpg")
```

### 两张图片混合

```python
from PIL import Image

# 要求两张图尺寸相同
img1 = Image.open("a.jpg")
img2 = Image.open("b.jpg")

blended = Image.blend(img1, img2, alpha=0.5)  # 各占一半
blended.save("blended.jpg")
```

---

## 画图：在图片上写字、画形状

```python
from PIL import Image, ImageDraw, ImageFont

img = Image.new("RGB", (800, 200), "white")
draw = ImageDraw.Draw(img)

# 画矩形
draw.rectangle([(50, 50), (200, 100)], outline="blue", width=3)

# 画椭圆
draw.ellipse([(300, 50), (450, 150)], fill="green")

# 画线
draw.line([(500, 50), (700, 150)], fill="red", width=5)

# 写文字
# 需要指定字体文件，否则中文可能乱码
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
draw.text((50, 30), "Hello Pillow", fill="black", font=font)

img.save("drawing.png")
```

> **注意中文字体：** Linux 上默认没有中文字体。你可以装 `fonts-noto-cjk` 或者指定一个中文字体文件路径。

```bash
# 安装中文字体
sudo apt install fonts-noto-cjk
```

```python
font = ImageFont.truetype("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", 36)
draw.text((50, 30), "你好，Pillow", fill="black", font=font)
```

---

## 批量处理实战

### 批量缩小图片并添加水印

```python
import os
from PIL import Image, ImageDraw, ImageFont

def batch_process(input_dir, output_dir, watermark_text):
    os.makedirs(output_dir, exist_ok=True)
    font = ImageFont.truetype("arial.ttf", 48)
    
    for filename in os.listdir(input_dir):
        if not filename.lower().endswith(('.jpg', '.png', '.jpeg')):
            continue
        
        img = Image.open(os.path.join(input_dir, filename))
        
        # 缩放到最长边 1200px
        img.thumbnail((1200, 1200))
        
        # 添加文字水印
        draw = ImageDraw.Draw(img)
        # 获取文字尺寸
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        pos = (img.width - tw - 20, img.height - th - 20)
        draw.text(pos, watermark_text, fill=(255, 255, 255, 128), font=font)
        
        img.save(os.path.join(output_dir, filename))
        print(f"处理完成: {filename}")

batch_process("photos", "photos_processed", "© 2026")
```

### 制作缩略图网格

```python
from PIL import Image
import os

def make_grid(image_dir, cols=4, thumb_size=(200, 200)):
    files = [f for f in os.listdir(image_dir) 
             if f.lower().endswith(('.jpg', '.png'))]
    rows = (len(files) + cols - 1) // cols
    
    grid_img = Image.new("RGB", 
                         (cols * thumb_size[0], rows * thumb_size[1]))
    
    for i, filename in enumerate(files):
        img = Image.open(os.path.join(image_dir, filename))
        img.thumbnail(thumb_size)
        # 居中放置
        x = (i % cols) * thumb_size[0] + (thumb_size[0] - img.width) // 2
        y = (i // cols) * thumb_size[1] + (thumb_size[1] - img.height) // 2
        grid_img.paste(img, (x, y))
    
    grid_img.save("grid.jpg")
    print(f"网格图已生成: {len(files)} 张图片")

make_grid("photos")
```

---

## GIF 处理

### 读取 GIF 帧

```python
from PIL import Image

gif = Image.open("animation.gif")

# 遍历每一帧
frames = []
for frame in range(gif.n_frames):
    gif.seek(frame)
    frames.append(gif.copy())  # 必须 copy()

print(f"共 {len(frames)} 帧")
```

### 制作 GIF

```python
from PIL import Image

frames = []
for i in range(10):
    # 生成 10 帧小动画
    img = Image.new("RGB", (200, 200), (i * 25, 100, 200))
    frames.append(img)

# 保存为 GIF
frames[0].save("output.gif",
               save_all=True,
               append_images=frames[1:],
               duration=100,    # 每帧 100ms
               loop=0)          # 0 = 无限循环
```

---

## 图像格式与模式

Pillow 支持 30+ 种图像格式，常用的：

| 格式 | 特点 |
|------|------|
| JPEG | 有损压缩，不支持透明，适合照片 |
| PNG | 无损，支持透明，适合图标/截图 |
| GIF | 支持动画，最多 256 色 |
| BMP | 不压缩，文件巨大 |
| WebP | Google 格式，压缩率好，支持透明和动画 |

### 模式转换

```python
# RGB → 灰度
gray = img.convert("L")

# RGB → RGBA（加透明通道）
rgba = img.convert("RGBA")

# 二值化（处理文档扫描件等）
threshold = 128
binary = img.point(lambda x: 255 if x > threshold else 0, mode="1")
```

---

## Pillow vs OpenCV

| | Pillow | OpenCV |
|------|--------|--------|
| **定位** | 简单图像处理 | 计算机视觉 |
| **安装** | 轻量，`pip install Pillow` | 较大，可能有编译依赖 |
| **学习曲线** | 平缓 | 陡峭 |
| **读写格式** | 30+ 种 | 少一些 |
| **高级功能** | 有限 | 人脸识别、特征匹配等 |
| **适用场景** | 加水印、改尺寸、格式转换、简单滤镜 | 图像识别、视频处理、复杂分析 |

> **选哪个？** 如果你只是"处理图片"而不是"分析图片"，Pillow 就够了。如果要做人脸检测、物体识别，上 OpenCV。

---

## 总结

Pillow 能做的事比你想象的多。开箱即用的功能包括：

- ✅ 格式转换（JPEG ↔ PNG ↔ WebP）
- ✅ 批量缩放 + 水印
- ✅ 裁剪 / 旋转 / 翻转
- ✅ 滤镜（模糊、锐化、边缘检测）
- ✅ 画线、画框、写字
- ✅ GIF 读取和生成
- ✅ 制作缩略图网格

大部分任务十几行代码就能搞定。记住一句话：**Pillow 是 Python 图像处理的瑞士军刀，不是战场坦克——但它覆盖了 80% 的日常需求。**
