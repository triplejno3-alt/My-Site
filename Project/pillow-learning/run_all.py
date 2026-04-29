"""
运行所有学习模块
按顺序执行，每个模块独立运行
"""
import os
import subprocess

modules = [
    "01-image-basics",
    "02-crop-resize",
    "03-filters",
    "04-drawing",
    "05-watermark",
    "06-gif",
]

print("🖼️  Pillow 学习项目 - 运行全部模块\n")

for m in modules:
    script = f"modules/{m}.py"
    if os.path.exists(script):
        print(f"\n{'='*50}")
        print(f"运行: {script}")
        print(f"{'='*50}")
        result = subprocess.run(["python3", script], capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print(f"错误: {result.stderr}")
    else:
        print(f"⚠️  {script} 不存在，跳过")

print("\n🎉 全部模块运行完成！输出文件在 output/ 目录下。")
