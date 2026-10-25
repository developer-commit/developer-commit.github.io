---
title: 달팽이 배열 (C++ 구현 및 해설)
date: 2025-05-23
category: codingtest
slug: programmars-181832
tags: [C++, 달팽이, 문제 풀이, 알고리즘, 프로그래머스]
description: N x N 배열을 시계 방향 나선형으로 채우는 달팽이 배열 문제를 두 가지 방식으로 구현한다.
---

달팽이 배열 문제는 N x N 크기의 정사각형 배열을 시계 방향으로 나선형으로 채우는 전형적인 구현 문제입니다.

예를 들어 N = 3일 경우, 배열은 다음과 같이 채워집니다:

```
1 2 3  
8 9 4  
7 6 5
```

## 🧠 문제 해결 아이디어

1. **방향 기반 순회**:
   - 오른쪽 → 아래 → 왼쪽 → 위 방향으로 회전하며 채웁니다.
   - 방향 전환 조건은 배열의 범위를 벗어나거나 이미 숫자가 있는 경우입니다.
2. **시계 방향 회전**:
   - 4개의 방향을 정의하고 현재 방향을 기준으로 이동 후, 조건에 따라 방향을 전환합니다.

---

## 🧾 코드 1: 직관적 방향 배열 방식

```cpp
#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> snail(int N) {
    vector<vector<int>> board(N, vector<int>(N, 0));
    int dx[4] = {0, 1, 0, -1}; // 우, 하, 좌, 상
    int dy[4] = {1, 0, -1, 0};
    int x = 0, y = 0, dir = 0;

    for (int num = 1; num <= N * N; ++num) {
        board[x][y] = num;
        int nx = x + dx[dir];
        int ny = y + dy[dir];

        if (nx >= 0 && nx < N && ny >= 0 && ny < N && board[nx][ny] == 0) {
            x = nx;
            y = ny;
        } else {
            dir = (dir + 1) % 4;
            x += dx[dir];
            y += dy[dir];
        }
    }

    return board;
}

int main() {
    int N = 3;
    auto result = snail(N);
    for (const auto& row : result) {
        for (int num : row) {
            cout << num << " ";
        }
        cout << endl;
    }
    return 0;
}
```

---

## 🧾 코드 2: 가로/세로 번갈아가며 채우기 (다른 해석 방식)

```cpp
#include <string>
#include <vector>
#include <iostream>

using namespace std;

vector<vector<int>> solution(int n) {
    vector<vector<int>> answer(n, vector<int>(n));

    int x = 0;
    int loc_x = -1, loc_y = 0;
    bool flag = true;

    for(int i = n ; i > 0; ) {
        for(int j = 0; j < i ; j++) {
            if (flag) answer[loc_y][++loc_x] = ++x;
            else answer[loc_y][--loc_x] = ++x;
        }
        i--;
        if (x == n*n) break;
        flag = !flag;

        for(int j = 0; j < i ; j++) {
            if (flag)  answer[--loc_y][loc_x] = ++x;
            else answer[++loc_y][loc_x] = ++x;
        }
    }

    return answer;
}
```

이 방식은 가로 → 세로 → 가로 → 세로 순으로 줄어드는 길이를 기준으로 채우는 구조이며, 배열을 달팽이 형태로 자연스럽게 채울 수 있습니다.

