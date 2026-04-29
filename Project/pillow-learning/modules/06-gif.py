"""
模块六：GIF 动画
学习目标：读取帧、制作动图、导出 GIF
"""

from PIL import Image, ImageDraw, ImageFont

def run():
    print("=" * 50)
    print("模块六：GIF 动画")
    print("=" * 50)
    
    # 制作一个旋转色块的 GIF
    frames = []
    size = 200
    
    colors = [(255,0,0), (255,165,0), (255,255,0), (0,255,0),
              (0,0,255), (75,0,130), (238,130,238)]
    
    for i, color in enumerate(colors):
        frame = Image.new("RGB", (size, size), "white")
        draw = ImageDraw.Draw(frame)
        draw.ellipse([(20, 20), (180, 180)], fill=color, outline="black")
        
        # 画文字说明
        draw.text((60, 185), f"Frame {i+1}", fill="black")
        
        frames.append(frame)
    
    frames[0].save("../output/06_animation.gif",
                   save_all=True,
                   append_images=frames[1:],
                   duration=500,
                   loop=0)
    print("✅ 已生成 GIF 动画 (7帧，500ms/帧)")
    
    # 读取并验证
    gif = Image.open("../output/06_animation.gif")
    print(f"   帧数: {gif.n_frames}")
    print(f"   尺寸: {gif.size[0]}x{gif.size[1]}")
    
    print("\n🎉 模块六完成！")

if __name__ == "__main__":
    run()
