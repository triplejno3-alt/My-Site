"""
模块三：滤镜与增强
学习目标：模糊、锐化、轮廓、亮度/对比度调节
"""

from PIL import Image, ImageFilter, ImageEnhance

def run():
    print("=" * 50)
    print("模块三：滤镜与增强")
    print("=" * 50)
    
    img = Image.open("../images/sample.jpg")
    
    # 1. 各种滤镜
    filters = [
        ("GaussianBlur(5)", ImageFilter.GaussianBlur(5)),
        ("CONTOUR 轮廓", ImageFilter.CONTOUR),
        ("EMBOSS 浮雕", ImageFilter.EMBOSS),
        ("SHARPEN 锐化", ImageFilter.SHARPEN),
        ("EDGE_ENHANCE 边缘增强", ImageFilter.EDGE_ENHANCE),
    ]
    
    for name, f in filters:
        result = img.filter(f)
        safe_name = name.split()[0].lower()
        result.save(f"../output/03_{safe_name}.jpg")
        print(f"✅ {name}")
    
    # 2. 亮度调节
    enhancer = ImageEnhance.Brightness(img)
    enhancer.enhance(1.5).save("../output/03_brightness_150.jpg")
    enhancer.enhance(0.5).save("../output/03_brightness_50.jpg")
    print(f"✅ 亮度 150% / 50%")
    
    # 3. 对比度调节
    enhancer = ImageEnhance.Contrast(img)
    enhancer.enhance(2.0).save("../output/03_contrast_200.jpg")
    print(f"✅ 对比度 200%")
    
    # 4. 饱和度调节
    enhancer = ImageEnhance.Color(img)
    enhancer.enhance(0.0).save("../output/03_desaturated.jpg")
    print(f"✅ 去饱和度 (黑白)")
    
    print("\n🎉 模块三完成！")

if __name__ == "__main__":
    run()
