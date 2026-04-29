"""
模块五：合成与水印
学习目标：图片粘贴、透明叠加、批量水印
"""

from PIL import Image, ImageDraw, ImageFont
import os

def run():
    print("=" * 50)
    print("模块五：合成与水印")
    print("=" * 50)
    
    bg = Image.open("../images/sample.jpg").resize((600, 400))
    w, h = bg.size
    
    # 1. 创建水印图层
    watermark = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(watermark)
    
    # 加载字体
    font = None
    font_paths = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            font = ImageFont.truetype(fp, 40)
            break
    
    if font:
        draw.text((20, h - 60), "© 2026 Pillow", fill=(255, 255, 255, 100), font=font)
    
    # 2. 合成
    result = Image.alpha_composite(bg.convert("RGBA"), watermark)
    result.save("../output/05_watermarked.png")
    print("✅ 已添加文字水印")
    
    # 3. 混合两张图片
    # 生成一个纯蓝渐变图
    overlay = Image.new("RGBA", (w, h))
    for x in range(w):
        for y in range(h):
            overlay.putpixel((x, y), (0, 100, 255, int(50 * (1 - y/h))))
    
    blended = Image.alpha_composite(bg.convert("RGBA"), overlay)
    blended.save("../output/05_blended.png")
    print("✅ 已叠加渐变效果")
    
    print("\n🎉 模块五完成！")

if __name__ == "__main__":
    run()
