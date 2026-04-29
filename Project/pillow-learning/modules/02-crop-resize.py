"""
模块二：裁剪与缩放
学习目标：resize、thumbnail、crop、rotate
"""

from PIL import Image

def run():
    print("=" * 50)
    print("模块二：裁剪与缩放")
    print("=" * 50)
    
    img = Image.open("../images/sample.jpg")
    w, h = img.size
    print(f"原图尺寸: {w} x {h}")
    
    # 1. resize - 强制拉伸
    resized = img.resize((400, 300))
    resized.save("../output/01_resized.jpg")
    print(f"\n✅ resize 到 400x300")
    
    # 2. thumbnail - 保持比例
    thumb = img.copy()
    thumb.thumbnail((400, 400))
    thumb.save("../output/02_thumbnail.jpg")
    print(f"✅ thumbnail 到最长边400: {thumb.size[0]}x{thumb.size[1]}")
    
    # 3. crop - 裁剪
    cropped = img.crop((w//4, h//4, w*3//4, h*3//4))
    cropped.save("../output/03_cropped.jpg")
    print(f"✅ 裁剪中心区域: {cropped.size[0]}x{cropped.size[1]}")
    
    # 4. rotate - 旋转
    rotated = img.rotate(45, expand=True)
    rotated.save("../output/04_rotated.jpg")
    print(f"✅ 旋转 45° (expand=True)")
    
    # 5. flip - 翻转
    flipped = img.transpose(Image.FLIP_LEFT_RIGHT)
    flipped.save("../output/05_flipped.jpg")
    print(f"✅ 水平翻转")
    
    print("\n🎉 模块二完成！")

if __name__ == "__main__":
    run()
