"""
模块四：绘图与文字
学习目标：ImageDraw 画线、画形、写中文
"""

from PIL import Image, ImageDraw, ImageFont
import os

def run():
    print("=" * 50)
    print("模块四：绘图与文字")
    print("=" * 50)
    
    # 新建画布
    img = Image.new("RGB", (600, 400), "white")
    draw = ImageDraw.Draw(img)
    
    # 1. 画几何图形
    draw.rectangle([(50, 50), (200, 150)], outline="blue", width=3)
    draw.ellipse([(250, 50), (400, 150)], fill="green")
    draw.line([(50, 200), (550, 200)], fill="red", width=2)
    draw.polygon([(300, 250), (250, 350), (350, 350)], fill="orange")
    print("✅ 已画矩形、椭圆、线、多边形")
    
    # 2. 写文字
    # 尝试加载中文字体
    font_paths = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    
    font = None
    for fp in font_paths:
        if os.path.exists(fp):
            font = ImageFont.truetype(fp, 28)
            break
    
    if font:
        draw.text((50, 300), "你好，Pillow！", fill="black", font=font)
        draw.text((50, 340), "Drawing with Python", fill="gray", font=font)
        print(f"✅ 已写字 (字体: {os.path.basename(fp)})")
    else:
        print("⚠️ 未找到字体文件，跳过文字")
    
    img.save("../output/04_drawing.jpg")
    print("\n🎉 模块四完成！")

if __name__ == "__main__":
    run()
