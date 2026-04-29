"""
模块一：图片基础
学习目标：打开、查看、保存图片，理解格式与模式
"""

from PIL import Image

def run():
    print("=" * 50)
    print("模块一：图片基础")
    print("=" * 50)
    
    # 1. 打开图片
    img = Image.open("../images/sample.jpg")  # 可以换成你自己的图片
    print(f"\n✅ 已打开图片")
    
    # 2. 查看基本信息
    print(f"   尺寸: {img.size[0]} x {img.size[1]}")
    print(f"   格式: {img.format}")
    print(f"   模式: {img.mode}")
    
    # 3. 格式转换
    img.save("../output/sample.png")
    print(f"\n✅ 已保存为 PNG")
    
    # 4. 模式转换
    gray = img.convert("L")
    gray.save("../output/sample_gray.png")
    print(f"✅ 已保存灰度版")
    
    # 5. 缩略图
    img.thumbnail((300, 300))
    img.save("../output/sample_thumb.jpg")
    print(f"✅ 已保存缩略图 (300x300)")
    
    print("\n🎉 模块一完成！")

if __name__ == "__main__":
    run()
