---
layout: post
title:  "Python编程快速入门"
date:   2026-04-22 14:30:00 +0800
categories: [技术, 编程]
tags: [Python, 教程, 编程语言]
---

## 什么是Python？

Python是一种高级编程语言，以其简洁性和可读性著称。它是一种解释型语言，支持多种编程范式，包括面向对象、函数式和过程式编程。

## 安装Python

### Windows系统
```bash
# 下载安装包
# 运行安装程序
# 勾选"Add Python to PATH"
```

### macOS系统
```bash
brew install python
```

### Linux系统
```bash
sudo apt-get install python3
```

## 第一个Python程序

```python
# hello.py
print("Hello, World!")
```

运行程序：
```bash
python hello.py
```

## Python基础语法

### 变量和数据类型
```python
# 字符串
name = "张三"
age = 25

# 列表
fruits = ["apple", "banana", "orange"]

# 字典
person = {
    "name": "张三",
    "age": 25,
    "city": "北京"
}
```

### 控制流
```python
# if语句
if age >= 18:
    print("成年人")
else:
    print("未成年人")

# for循环
for fruit in fruits:
    print(fruit)

# while循环
i = 0
while i < 5:
    print(i)
    i += 1
```

## 函数定义
```python
def greet(name):
    """打招呼函数"""
    return f"你好, {name}!"

print(greet("张三"))
```

## 面向对象编程
```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def introduce(self):
        return f"我叫{self.name}，今年{self.age}岁。"

person = Person("张三", 25)
print(person.introduce())
```

## 常用库

- **NumPy**：科学计算
- **Pandas**：数据处理
- **Matplotlib**：数据可视化
- **Requests**：HTTP请求
- **Flask/Django**：Web框架

## 学习资源

- [Python官方文档](https://docs.python.org/)
- [廖雪峰Python教程](https://www.liaoxuefeng.com/wiki/1016959663602400)
- [莫烦Python](https://morvanzhou.github.io/)

---

**提示**：Python使用缩进来表示代码块，这是与其他语言不同的地方。请确保你的代码缩进正确！