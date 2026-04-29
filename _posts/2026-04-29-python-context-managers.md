---
layout: post_code
title: "Python 上下文管理器完全指南：从 with 语句到高级实战"
date: 2026-04-29 18:00:00 +0800
categories: [技术, Python, 教程]
tags: [Python, Context Manager, with语句, 设计模式, 进阶]
difficulty: "#0366d6"
level: "进阶"
toc: true
author: way
tech_tags: [Python, contextlib, contextmanager, ExitStack, async context manager, decorator, with statement, resource management]
---

## 引言：每天都在用，但你真的懂吗？

```python
with open("data.txt", "r") as f:
    content = f.read()
```

这行代码大概是每个 Python 开发者都写过无数次的。但你有没有想过——`with` 语句到底做了什么？如果 `open()` 返回的文件对象没有写对，这个 `with` 还能正常关闭文件吗？

上下文管理器（Context Manager）是 Python 最优雅的设计之一。这篇文章不从基础语法讲起，而是从**原理**到**实战**，带你彻底搞懂它。

<!-- more -->

---

## 一、什么是上下文管理器？

上下文管理器是一个定义了 `__enter__` 和 `__exit__` 方法的对象。当 `with` 语句执行时：

1. 调用 `__enter__` 方法，返回值赋给 `as` 后面的变量
2. 执行 `with` 代码块中的语句
3. **无论是否发生异常**，都调用 `__exit__` 方法

```python
class MyContext:
    def __enter__(self):
        print("进入上下文")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("退出上下文")
        # 返回 False 表示不处理异常，让异常继续传播
        # 返回 True 表示异常已被处理，不再传播
        return False

with MyContext() as ctx:
    print("正在执行")
    # 即使这里抛出异常，__exit__ 也会被调用
```

核心价值就一句话：**保证资源的正确释放，无论代码块是正常结束还是抛出异常。**

这看起来像 `try...finally` 的语法糖，但上下文管理器能做的事情远超 `finally`。

---

## 二、两种实现方式

### 2.1 基于类的上下文管理器

这是最原生的方式——实现 `__enter__` 和 `__exit__` 两个魔法方法。

```python
class DatabaseConnection:
    def __init__(self, conn_string: str):
        self.conn_string = conn_string
        self.connection = None
    
    def __enter__(self):
        print(f"连接数据库: {self.conn_string}")
        self.connection = self._connect()
        return self.connection
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            print(f"发生异常: {exc_val}")
            self.connection.rollback()
        else:
            self.connection.commit()
        self.connection.close()
        print("数据库连接已关闭")
        return False  # 不吞掉异常
    
    def _connect(self):
        # 模拟数据库连接
        return {"conn": self.conn_string, "status": "connected"}
```

使用：

```python
with DatabaseConnection("postgresql://localhost/mydb") as conn:
    # 执行数据库操作
    # 如果抛出异常，自动回滚
    # 如果正常结束，自动提交
    pass  # 无论怎样，连接都会关闭
```

### 2.2 基于生成器的上下文管理器（@contextmanager）

这是更简洁的方式——用 `contextlib.contextmanager` 装饰器把一个生成器函数变成上下文管理器。

```python
from contextlib import contextmanager

@contextmanager
def database_connection(conn_string: str):
    print(f"连接数据库: {conn_string}")
    conn = {"conn": conn_string, "status": "connected"}
    try:
        yield conn  # __enter__ 的返回值
    except Exception as e:
        print(f"回滚事务: {e}")
        conn["rollback"] = True
        raise  # 重新抛出异常
    else:
        conn["commit"] = True
        print("提交事务")
    finally:
        conn["status"] = "closed"
        print("数据库连接已关闭")
```

使用起来一模一样：

```python
with database_connection("postgresql://localhost/mydb") as conn:
    # 业务逻辑
    pass
```

**关键点**：`yield` 之前的代码相当于 `__enter__`，之后的代码相当于 `__exit__`。`try...finally` 确保即使 `yield` 后的代码块抛异常，finally 中的清理代码也会执行。

### 两种方式怎么选？

| 维度 | 类方式 | @contextmanager |
|------|--------|-----------------|
| 复杂度 | 适合有状态、需要可复用实例的场景 | 适合封装简单的资源管理逻辑 |
| 可读性 | 结构清晰，但代码量较大 | 一行装饰器，函数式风格 |
| 灵活性 | 可以被子类继承、扩展 | 无法继承，但可以组合 |
| 异常处理 | `__exit__` 可以获取全部异常信息 | 需要手动 try/except/raise |
| 异步支持 | 实现 `__aenter__`/`__aexit__` | 使用 `@asynccontextmanager` |

**建议**：简单的资源管理（文件、锁、临时目录）用 `@contextmanager`；复杂的、需要继承或状态的场景用类方式。

---

## 三、标准库中的上下文管理器（你可能不知道的）

Python 标准库提供了大量实用的上下文管理器，很多你可能还没用过。

### 3.1 contextlib.suppress — 安静地忽略异常

```python
from contextlib import suppress
import os

# 传统写法
try:
    os.remove("temp.txt")
except FileNotFoundError:
    pass

# 上下文管理器写法
with suppress(FileNotFoundError):
    os.remove("temp.txt")
```

干净、明确、少一层缩进。支持多个异常类型：

```python
with suppress(FileNotFoundError, PermissionError):
    os.remove("/etc/protected/config")
```

### 3.2 contextlib.redirect_stdout / redirect_stderr

临时重定向标准输出，对测试和日志记录非常有用：

```python
from contextlib import redirect_stdout
import io

buf = io.StringIO()
with redirect_stdout(buf):
    print("这条信息不会打印到终端")
    print("而是被收集到 buf 中")

output = buf.getvalue()
print(f"捕获的内容: {output}")
```

测试场景经常用到：

```python
def test_verbose_function():
    buf = io.StringIO()
    with redirect_stdout(buf):
        my_function(verbose=True)
    assert "已完成" in buf.getvalue()
```

### 3.3 contextlib.chdir — 临时切换目录

Python 3.11 新增，再也不用 `os.chdir` + 手动切回来了：

```python
from contextlib import chdir
import os

cwd = os.getcwd()
print(f"当前目录: {cwd}")

with chdir("/tmp"):
    print(f"临时在: {os.getcwd()}")
    # 做一些文件操作

print(f"回到: {os.getcwd()}")
```

以前你得这么写：

```python
old_cwd = os.getcwd()
try:
    os.chdir("/tmp")
    # 业务逻辑
finally:
    os.chdir(old_cwd)
```

### 3.4 contextlib.closing — 确保关闭

对没有实现上下文管理器但有 `close()` 方法的对象：

```python
from contextlib import closing
from urllib.request import urlopen

with closing(urlopen("https://python.org")) as page:
    for line in page:
        if b"Python" in line:
            print(line)
```

`closing` 做的事情很简单——在 `__exit__` 中调用对象的 `close()` 方法。

### 3.5 decimal.localcontext — 临时修改精度

```python
from decimal import Decimal, localcontext

d = Decimal("1") / Decimal("7")
print(d)  # 默认精度: 0.1428571428571428571428571429

with localcontext() as ctx:
    ctx.prec = 3
    d2 = Decimal("1") / Decimal("7")
    print(d2)  # 0.143

print(Decimal("1") / Decimal("7"))  # 恢复默认精度
```

### 3.6 threading.Lock — 线程锁

```python
import threading

lock = threading.Lock()
shared_resource = []

def worker():
    with lock:
        # 只有拿到锁的线程能进入这个代码块
        shared_resource.append(threading.current_thread().name)
```

这是 `with` 语句最经典的应用场景之一——获取锁、执行、释放锁，三步合一，绝对不会忘记释放。

---

## 四、高级模式与实战技巧

### 4.1 嵌套上下文管理器

一个数据库事务的例子——多个操作共享一个数据库连接：

```python
from contextlib import contextmanager

@contextmanager
def transaction(connection):
    """数据库事务上下文管理器"""
    try:
        print("开始事务")
        yield connection
        print("提交事务")
        connection.commit()
    except Exception:
        print("回滚事务")
        connection.rollback()
        raise

@contextmanager
def db_cursor(connection):
    """数据库游标上下文管理器"""
    cursor = connection.cursor()
    try:
        yield cursor
    finally:
        cursor.close()

# 嵌套使用
with DatabaseConnection("postgresql://localhost/mydb") as conn:
    with transaction(conn):
        with db_cursor(conn) as cursor:
            cursor.execute("UPDATE users SET name = ? WHERE id = ?", ("Alice", 1))
            cursor.execute("UPDATE users SET name = ? WHERE id = ?", ("Bob", 2))
```

多个 `with` 可以写在一行：

```python
# Python 3.10+ 可以用括号分组
with (
    DatabaseConnection("postgresql://localhost/mydb") as conn,
    db_cursor(conn) as cursor,
    transaction(conn),
):
    cursor.execute("UPDATE users SET name = ? WHERE id = ?", ("Alice", 1))
```

### 4.2 contextlib.ExitStack — 动态上下文管理

这是上下文管理器领域最强大但最被低估的工具。`ExitStack` 让你**在运行时动态管理任意数量的上下文管理器**。

#### 场景一：不确定数量的资源

```python
from contextlib import ExitStack

def process_files(file_names: list[str]):
    """同时打开多个文件"""
    with ExitStack() as stack:
        files = [
            stack.enter_context(open(fname, "r"))
            for fname in file_names
        ]
        # 所有文件在退出 with 块时自动关闭
        return [f.read() for f in files]
```

#### 场景二：条件性注册资源

```python
from contextlib import ExitStack, contextmanager

@contextmanager
def measure_time(label: str):
    import time
    start = time.time()
    try:
        yield
    finally:
        elapsed = time.time() - start
        print(f"{label}: {elapsed:.3f}s")

def complex_operation(debug: bool = False):
    with ExitStack() as stack:
        if debug:
            stack.enter_context(measure_time("复杂操作"))
            stack.enter_context(redirect_stdout(open("debug.log", "w")))
        
        # 核心逻辑
        result = do_heavy_computation()
        return result
```

#### 场景三：推迟回调（类似 try/finally 的注册表）

```python
def deploy_app():
    """部署应用的流程，任何一步失败都要回滚"""
    with ExitStack() as stack:
        # 注册回滚回调
        def rollback_nginx():
            print("回滚: 恢复 nginx 配置")
        
        def rollback_db():
            print("回滚: 恢复数据库版本")
        
        # 每个操作成功后，注册对应的回滚函数
        print("步骤1: 更新数据库")
        migrate_database()
        stack.callback(rollback_db)
        
        print("步骤2: 部署新代码")
        deploy_code()
        stack.callback(lambda: print("回滚: 恢复代码版本"))
        
        print("步骤3: 更新 nginx 配置")
        update_nginx()
        stack.callback(rollback_nginx)
        
        # 如果所有步骤成功，弹出所有回滚（不执行）
        stack.pop_all()
        print("部署成功!")
    
    # 如果任何一步抛出异常，ExitStack 会按注册的逆序执行回调
```

`ExitStack.callback()` 注册的函数会在退出 `with` 块时按**后进先出**（LIFO）顺序执行。如果一切顺利，`stack.pop_all()` 把它们全部弹出，不做回滚——这是经典的"乐观执行，悲观回滚"模式。

### 4.3 用上下文管理器做计时

```python
import time
from contextlib import contextmanager
from collections.abc import Generator

@contextmanager
def timer(label: str = "耗时") -> Generator[None, None, None]:
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        print(f"{label}: {elapsed:.4f}秒")

# 使用
with timer("数据处理"):
    result = [i ** 2 for i in range(10_000_000)]
```

更高级的版本——支持嵌套计时：

```python
import contextvars

_depth = contextvars.ContextVar("timer_depth", default=0)

@contextmanager
def timer(label: str = "耗时"):
    depth = _depth.get()
    _depth.set(depth + 1)
    prefix = "  " * depth
    start = time.perf_counter()
    try:
        yield
    finally:
        _depth.set(depth)
        elapsed = time.perf_counter() - start
        print(f"{prefix}{label}: {elapsed:.4f}秒")

# 嵌套使用
with timer("外部"):
    with timer("内部A"):
        time.sleep(0.1)
    with timer("内部B"):
        time.sleep(0.2)
# 输出：
#   内部A: 0.1001秒
#   内部B: 0.2001秒
# 外部: 0.3010秒
```

### 4.4 资源池模式

从连接池中借还连接：

```python
import queue
from contextlib import contextmanager

class ConnectionPool:
    def __init__(self, size: int = 5):
        self._pool = queue.Queue(maxsize=size)
        for i in range(size):
            self._pool.put(self._create_connection(i))
    
    def _create_connection(self, idx: int):
        return {"id": idx, "active": False}
    
    @contextmanager
    def get_connection(self):
        conn = self._pool.get()
        conn["active"] = True
        try:
            yield conn
        finally:
            conn["active"] = False
            self._pool.put(conn)

pool = ConnectionPool(3)

with pool.get_connection() as conn:
    print(f"使用连接: {conn['id']}")
# 连接自动归还到池中
```

### 4.5 临时环境变量

```python
import os
from contextlib import contextmanager

@contextmanager
def set_env(**environ: str):
    """临时设置环境变量"""
    old_environ = dict(os.environ)
    os.environ.update(environ)
    try:
        yield
    finally:
        os.environ.clear()
        os.environ.update(old_environ)

# 使用
with set_env(DATABASE_URL="sqlite:///test.db", DEBUG="1"):
    assert os.environ["DATABASE_URL"] == "sqlite:///test.db"
    assert os.environ["DEBUG"] == "1"
# 退出后自动恢复
```

### 4.6 临时修改配置

```python
from dataclasses import dataclass, field
from contextlib import contextmanager

@dataclass
class AppConfig:
    debug: bool = False
    db_url: str = "postgresql://localhost/prod"
    
    @contextmanager
    def override(self, **kwargs):
        """临时覆盖配置"""
        old_values = {}
        for key, value in kwargs.items():
            if hasattr(self, key):
                old_values[key] = getattr(self, key)
                setattr(self, key, value)
        try:
            yield self
        finally:
            for key, value in old_values.items():
                setattr(self, key, value)

config = AppConfig()
print(config.db_url)  # postgresql://localhost/prod

with config.override(db_url="sqlite:///test.db", debug=True):
    print(config.db_url)  # sqlite:///test.db
    print(config.debug)   # True

print(config.db_url)  # postgresql://localhost/prod（恢复）
```

---

## 五、常见陷阱

### 5.1 误以为 with 能捕获异常

```python
# 错误理解
with open("nonexistent.txt", "r") as f:
    content = f.read()
# FileNotFoundError 会直接传播出去

# 正确理解：with 只能保证资源释放，不能保证异常不传播
```

上下文管理器不会捕获异常，它只是给了你一个机会——如果发生了异常，你可以在 `__exit__` 中做清理然后选择是否重新抛出。

### 5.2 yield 之后抛异常时的复杂情况

```python
@contextmanager
def bad_context():
    yield "resource"
    # 如果 yield 之后的代码块抛了异常，这里永远执行不到！
    print("清理资源")  # ❌ 不会执行

# 正确写法
@contextmanager
def good_context():
    print("获取资源")
    try:
        yield "resource"
    finally:
        print("清理资源")  # ✅ 无论是否异常都会执行
```

### 5.3 在 __exit__ 中忽略了异常信息

```python
class SilentContext:
    def __exit__(self, exc_type, exc_val, exc_tb):
        return True  # 🚨 返回 True 会吞掉异常！

with SilentContext():
    raise ValueError("程序崩溃了！")
# 这个异常被静默吃掉了——你不会知道它发生了
```

如果你不想异常传播，明确返回 `True`；否则返回 `None` 或 `False`。

### 5.4 contextmanager + 异步混用

```python
# ❌ 错误：普通 contextmanager 不能用在异步函数中
@contextmanager
async def async_context():  # 这样不行！
    yield

# ✅ 正确：使用 asynccontextmanager
from contextlib import asynccontextmanager

@asynccontextmanager
async def async_context():
    print("异步获取资源")
    try:
        yield "资源"
    finally:
        print("异步释放资源")

# 使用
async def main():
    async with async_context() as resource:
        print(f"使用: {resource}")
```

---

## 六、综合实战：构建一个重试上下文管理器

把前面学到的知识整合起来，实现一个实用的重试机制：

```python
import time
import logging
from contextlib import contextmanager
from typing import Type, Callable, Optional

logger = logging.getLogger(__name__)

class RetryExhaustedError(Exception):
    """所有重试均失败的异常"""
    pass

@contextmanager
def retry_context(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple[Type[Exception], ...] = (Exception,),
    on_retry: Optional[Callable[[int, Exception], None]] = None,
):
    """
    可重试的上下文管理器。
    
    用法:
        with retry_context(max_attempts=3) as attempt:
            with attempt():
                # 可能会失败的操作
                fetch_data_from_api()
    """
    
    class RetryAttempt:
        def __enter__(self):
            return self
        
        def __exit__(self, exc_type, exc_val, exc_tb):
            if exc_type is None or not issubclass(exc_type, exceptions):
                # 没有异常，或者是不需要重试的异常类型
                return False
            
            nonlocal max_attempts, delay
            
            attempt_number = max_attempts  # 从当前剩余次数倒推
            max_attempts -= 1
            
            if max_attempts > 0:
                if on_retry:
                    on_retry(attempt_number, exc_val)
                
                logger.warning(
                    "操作失败（剩余 %d 次重试）: %s",
                    max_attempts, exc_val
                )
                time.sleep(delay)
                delay *= backoff  # 指数退避
                return True  # 抑制异常，让循环继续
            else:
                raise RetryExhaustedError(
                    f"重试 {attempt_number} 次后仍然失败"
                ) from exc_val
    
    attempts = [RetryAttempt() for _ in range(max_attempts)]
    
    class RetryController:
        def __init__(self):
            self._attempts = iter(attempts)
        
        def __call__(self) -> RetryAttempt:
            return next(self._attempts)
    
    yield RetryController()


# ===== 使用示例 =====

import random

def unstable_api_call():
    """模拟一个偶尔失败的外部 API 调用"""
    if random.random() < 0.7:  # 70% 概率失败
        raise ConnectionError("网络超时")
    return {"status": "ok", "data": [1, 2, 3]}

# 使用重试上下文
with retry_context(
    max_attempts=5,
    delay=0.5,
    backoff=1.5,
    on_retry=lambda attempt, e: print(f"第 {attempt} 次重试，原因: {e}"),
) as attempt:
    for _ in range(5):  # 最多 5 次
        with attempt():
            result = unstable_api_call()
            print(f"成功: {result}")
            break
```

这个例子展示了上下文管理器的一个高级用法——**用外层 with 管理重试状态，用内层 with 控制单次尝试的生命周期**。这种双层嵌套模式在实际系统中非常有用。

---

## 七、async 上下文管理器

Python 3.5+ 引入了异步上下文管理器，用于管理异步资源（数据库连接池、HTTP 会话、aiofiles 文件句柄等）。

### 基于类

```python
class AsyncDatabase:
    async def __aenter__(self):
        print("异步连接数据库")
        self.conn = await create_async_connection()
        return self.conn
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.conn.close()
        print("异步关闭连接")

# 使用
async def main():
    async with AsyncDatabase() as db:
        await db.query("SELECT * FROM users")
```

### 基于 @asynccontextmanager

```python
from contextlib import asynccontextmanager
import aiohttp

@asynccontextmanager
async def http_session(base_url: str):
    session = aiohttp.ClientSession(base_url)
    try:
        yield session
    finally:
        await session.close()

async def main():
    async with http_session("https://api.example.com") as session:
        async with session.get("/users") as resp:
            data = await resp.json()
            print(data)
```

### AsyncExitStack

同步有 `ExitStack`，异步有 `AsyncExitStack`：

```python
from contextlib import AsyncExitStack

async def complex_async_workflow():
    async with AsyncExitStack() as stack:
        # 动态注册异步资源
        db = await stack.enter_async_context(
            AsyncDatabase()
        )
        session = await stack.enter_async_context(
            http_session("https://api.example.com")
        )
        # 也支持同步资源
        f = stack.enter_context(open("log.txt", "w"))
        
        # 所有资源会在退出 async with 时
        # 按注册逆序自动清理
        return await process(db, session, f)
```

---

## 八、设计哲学：为什么上下文管理器是 Python 的亮点

上下文管理器的设计反映了 Python 的核心哲学——**显式优于隐式，简洁胜于复杂**。

在其他语言中，资源管理往往通过 `try...finally` 或 RAII（C++ 的 Resource Acquisition Is Initialization）来实现。Python 的 `with` 语句则提供了一种**声明式**的写法：

> "在这个代码块中，我**声明**我需要的资源，你（Python 运行时）负责帮我获取和释放。"

这种声明式的写法带来了几个好处：

1. **减少样板代码**：没有重复的 try/finally
2. **防止遗漏**：不会忘记释放资源
3. **关注点分离**：资源管理代码集中在上下文管理器内部，业务逻辑代码只需关注业务
4. **可组合性**：通过 ExitStack 可以动态组合任意数量的资源

如果你来自其他语言，可以这样对应：

| 语言 | 资源管理方式 | Python 对应 |
|------|-------------|-------------|
| Java | try-with-resources | `with` 语句 |
| C++ | RAII（析构函数） | `__exit__` |
| Go | defer | `ExitStack.callback()` |
| JavaScript | try/finally | `with` + `__exit__` |
| Rust | Drop trait | `__exit__` |

---

## 总结

| 知识点 | 一句话 |
|--------|--------|
| 核心机制 | `__enter__` 获取资源，`__exit__` 释放资源 |
| 类方式 | 实现两个魔术方法，适合复杂场景 |
| @contextmanager | 生成器 + 装饰器，适合简单场景 |
| ExitStack | 动态管理任意数量的上下文管理器 |
| async 上下文 | `__aenter__` + `__aexit__` 或 `@asynccontextmanager` |
| 常见用途 | 文件操作、数据库事务、锁、计时器、临时配置、重试机制 |
| 最大陷阱 | `__exit__` 返回 True 会吞掉异常 |

写出好的上下文管理器，本质上是在做一件事：**把"用前准备"和"用完收拾"封装进一个可复用的模块中，让你的调用方只需关心"用它"。**

这样，你的代码会变得更干净、更安全、更像"Pythonic"。

> **一句话总结：上下文管理器是 Python 赋予你的"自动化管家"——你只管做事，它帮你善后。**
