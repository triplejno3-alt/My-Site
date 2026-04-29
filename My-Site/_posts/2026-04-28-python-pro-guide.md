---
layout: post_code
title: "Python PRO 使用指南"
date: 2026-04-28 11:00:00 +0800
categories: 技术 Python
tags: Python PRO 工具链 效率 编程
toc: true
author: way
difficulty: "#0366d6"
level: 进阶
tech_tags: [Python, venv, pip, pytest, debugpy, pyproject.toml]
---

Python 人人都会写，但"会用"和"用得好"之间隔着一条鸿沟。

这篇不是 Python 基础教程，而是一份 **PRO 使用指南**——从项目管理到调试、测试、性能分析，覆盖实际开发中最实用的进阶技巧。

<!-- more -->

---

## 一、项目管理：抛弃 requirements.txt

### 使用 pyproject.toml

从 Python 3.11+ 开始，`pyproject.toml` 已经成为 Python 项目的标准配置文件。它能统一管理依赖、构建配置、工具设置。

```toml
[build-system]
requires = ["setuptools>=68.0"]
build-backend = "setuptools.backends._legacy:_Backend"

[project]
name = "my-project"
version = "0.1.0"
description = "一个专业的 Python 项目"
requires-python = ">=3.11"
dependencies = [
    "requests>=2.31",
    "click>=8.1",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "pytest-cov>=5.0",
    "debugpy>=1.8",
    "ruff>=0.3",
]
```

### 锁文件 + 虚拟环境

```bash
# 创建虚拟环境
python3 -m venv .venv

# 激活（bash/zsh）
source .venv/bin/activate

# 安装项目（开发模式）
pip install -e ".[dev]"

# 生成锁文件（pip tools 方案）
pip install pip-tools
pip-compile pyproject.toml -o requirements.lock
```

> **为什么不用 poetry？** Python 官方推荐的 `venv + pip-tools` 方案更轻量、更通用，不绑定特定工具。

---

## 二、调试：不止是 print

### pdb — 标准库的瑞士军刀

```python
import pdb

def complex_function(x, y):
    result = x * y + x / y
    pdb.set_trace()  # 设置断点，运行到这里会自动进入交互式调试
    # 在 pdb 中可以：查阅变量(n)，单步执行(s)，查看调用栈(w)
    return result
```

常用 pdb 命令速查：

| 命令 | 作用 |
|------|------|
| `n` (next) | 执行下一行 |
| `s` (step) | 进入函数内部 |
| `c` (continue) | 继续执行到下一个断点 |
| `l` (list) | 查看当前代码上下文 |
| `p var` | 打印变量值 |
| `w` (where) | 查看调用栈 |
| `q` (quit) | 退出调试器 |

### debugpy — 远程调试

在容器或远程服务器上调试时，debugpy 是利器：

```python
import debugpy

# 在代码入口处启动调试服务器
debugpy.listen(("0.0.0.0", 5678))
debugpy.wait_for_client()  # 等待 IDE 连接
```

然后在 VS Code 中配置 `launch.json` 附加到远程调试端口，即可像本地一样打断点、看变量。

---

## 三、测试：从 assert 到专业测试套件

### pytest 最佳实践

不要用 `unittest` 了，`pytest` 是事实标准。

```python
# test_calculator.py
import pytest
from my_project import calculator

def test_add_basic():
    assert calculator.add(1, 2) == 3

def test_add_negative():
    assert calculator.add(-1, 1) == 0

@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (-1, 1, 0),
    (0, 0, 0),
    (100, -100, 0),
])
def test_add_parametrized(a, b, expected):
    """参数化测试 — 一条测试测多种情况"""
    assert calculator.add(a, b) == expected

@pytest.fixture
def temp_dir(tmp_path):
    """临时目录 fixture — 测试结束自动清理"""
    d = tmp_path / "test_data"
    d.mkdir()
    yield d
    # 清理代码（可选，tmp_path 自动清理）

def test_file_creation(temp_dir):
    test_file = temp_dir / "test.txt"
    test_file.write_text("hello")
    assert test_file.exists()
```

### 运行测试

```bash
# 基本运行
pytest

# 带覆盖率
pytest --cov=my_project --cov-report=term-missing

# 并行运行
pytest -n auto

# 只运行失败的（先跑全量，然后重跑失败用例）
pytest --lf

# 只看失败详情
pytest -v --tb=short
```

### 测试目录结构

```
my-project/
├── src/
│   └── my_project/
│       ├── __init__.py
│       └── calculator.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py      # 共享 fixtures
│   ├── test_calculator.py
│   └── test_integration.py
├── pyproject.toml
└── pytest.ini
```

---

## 四、代码质量：格式化 + 检查

### Ruff — 统一的 linter + formatter

Ruff 比 flake8 + isort + black 快 10-100 倍，而且完全兼容。

```bash
# 安装
pip install ruff

# 检查
ruff check src/

# 自动修复
ruff check --fix src/

# 格式化
ruff format src/
```

在 `pyproject.toml` 中配置：

```toml
[tool.ruff]
target-version = "py311"
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "W", "N", "UP", "SIM"]
ignore = ["E501"]  # 行长度我们已经有配置了

[tool.ruff.format]
quote-style = "double"
```

### Type Hints — 类型注解

```python
from typing import Optional

def process_data(
    name: str,
    value: int | float,        # Python 3.10+ 联合类型
    options: Optional[dict] = None,
) -> dict[str, int]:
    """带类型注解的函数签名，一目了然"""
    result = {"name": name, "value": value}
    if options:
        result.update(options)
    return result
```

运行类型检查：

```bash
pip install mypy
mypy src/
```

---

## 五、性能分析：找到真正的瓶颈

### cProfile + snakeviz

```bash
# 分析脚本执行
python3 -m cProfile -o profile.prof my_script.py

# 可视化分析
pip install snakeviz
snakeviz profile.prof
```

### timeit 精准计时

```python
import timeit

# 对比两种写法
time1 = timeit.timeit(
    '"-".join(str(n) for n in range(100))',
    number=10000
)

time2 = timeit.timeit(
    '"-".join([str(n) for n in range(100)])',
    number=10000
)

print(f"生成器: {time1:.4f}s")
print(f"列表推导: {time2:.4f}s")
```

> **经验法则：** 先写对的，再写快的。90% 的性能问题来自 I/O 和算法选择，而不是微优化。

---

## 六、实用小技巧

### 1. 用 `rich` 让输出变好看

```bash
pip install rich
```

```python
from rich.console import Console
from rich.table import Table
from rich.progress import track

console = Console()

# 彩色打印
console.print("[bold green]成功![/bold green]")
console.print("[red]错误:[/red] 文件未找到")

# 表格输出
table = Table(title="项目状态")
table.add_column("项目", style="cyan")
table.add_column("状态", style="green")
table.add_row("API 服务", "✅ 运行中")
table.add_row("数据库", "✅ 已连接")
console.print(table)

# 进度条
for i in track(range(100), description="处理中..."):
    do_something()
```

### 2. `__main__` 的正确写法

```python
# 不要这样
if __name__ == "__main__":
    main()

# 而是这样 — 用 click 或 argparse
import click

@click.command()
@click.option("--verbose", "-v", is_flag=True, help="详细输出")
@click.argument("input_file")
def main(verbose: bool, input_file: str):
    """处理输入文件"""
    if verbose:
        print(f"处理文件: {input_file}")
    # 逻辑代码

if __name__ == "__main__":
    main()
```

### 3. 日志代替 print

```python
import logging

# 配置一次，到处使用
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

logger.info("任务开始")
logger.debug("详细调试信息")  # 只在 DEBUG 级别显示
logger.warning("注意: 配置未找到，使用默认值")
logger.error("发生错误: %s", str(e))
```

---

## 总结

| 方面 | 入门用法 | PRO 用法 |
|------|---------|----------|
| 项目管理 | `requirements.txt` | `pyproject.toml` + 锁文件 |
| 调试 | `print()` | `pdb` / `debugpy` |
| 测试 | 手动测试 | `pytest` + 参数化 + fixture |
| 代码质量 | 无 | `ruff` + `mypy` |
| 性能 | 凭感觉优化 | `cProfile` + `snakeviz` |
| 输出 | `print` | `rich` / `logging` |

用好这些工具，你的 Python 开发体验会上一个台阶。

> **一句话：** 写 Python 不是会语法就行，工具链和工程习惯才是区分"会用"和"PRO"的分水岭。
