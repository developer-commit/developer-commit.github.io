---
title: Python 간단 튜토리얼
date: 2025-05-23
category: python
slug: simple-tutorial
tags: [튜토리얼, 기초, 입문]
description: Python을 처음 배우는 사람을 위한 입문 가이드. 출력, 변수, 조건문, 반복문, 리스트, 함수, 클래스, 파일 입출력.
---

이 튜토리얼은 Python을 처음 배우는 사람들을 위한 입문 가이드입니다.  
Python 3.x 기준으로 설명하며, 기본적인 문법을 간단한 예제와 함께 다룹니다.

---

## ✅ 1. 출력하기 - `print()`

```python
print("Hello, Python!")
```

**출력 결과:**

```
Hello, Python!
```

---

## ✅ 2. 변수와 자료형

```python
name = "Alice"        # 문자열
age = 20              # 정수
height = 162.5        # 실수
is_student = True     # 불리언
```

Python은 **동적 타이핑** 언어로, 변수 선언 시 타입을 명시할 필요가 없습니다.

---

## ✅ 3. 조건문 - `if`, `elif`, `else`

```python
age = 20

if age >= 18:
    print("성인입니다.")
elif age >= 13:
    print("청소년입니다.")
else:
    print("어린이입니다.")
```

---

## ✅ 4. 반복문 - `for`, `while`

### ▶️ for문 예시

```python
for i in range(5):
    print(i)
```

**결과:**

```
0
1
2
3
4
```

### ▶️ while문 예시

```python
count = 0
while count < 5:
    print(count)
    count += 1
```

---

## ✅ 5. 리스트 (List)

```python
fruits = ["apple", "banana", "cherry"]
print(fruits[1])  # banana 출력
```

리스트는 수정이 가능하며 여러 자료형을 함께 가질 수 있습니다.

---

## ✅ 6. 함수 정의 - `def`

```python
def greet(name):
    print(f"안녕하세요, {name}님!")

greet("철수")
```

---

## ✅ 7. 클래스 - `class`

```python
class Person:
    def __init__(self, name):
        self.name = name

    def say_hello(self):
        print(f"안녕하세요, 저는 {self.name}입니다.")

p = Person("영희")
p.say_hello()
```

---

## ✅ 8. 파일 입출력

```python
# 파일에 쓰기
with open("hello.txt", "w") as f:
    f.write("Hello, file!")

# 파일에서 읽기
with open("hello.txt", "r") as f:
    content = f.read()
    print(content)
```

---

## ✅ 마무리

이 튜토리얼에서는 Python의 가장 기본적인 문법을 살펴보았습니다.  
더 깊은 주제로는 자료구조, 예외 처리, 모듈, 웹 개발 등으로 확장될 수 있습니다.

---

✨ *더 많은 예제나 주제가 필요하시면 댓글이나 이슈로 남겨주세요!*

