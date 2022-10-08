---
layout: post
title: "Bayesian Filter"
description: "Bayesian Filter"
categories: [Math, filter]
tags: [Math, filter]
redirect_from:
  - /2021/05/16/
---

>  Bayesian Filter

* Kramdown table of contents
{:toc .toc}

----

Created 2021.05.16 by William Yu; Last modified: 2022.07.12-V1.2.2

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 William Yu. Some rights reserved.

----


# Bayesian Filter

- blog: https://zhuanlan.zhihu.com/p/139215491
- book: Bayesian Filtering and Smoothing. Simo Sarkka.

## Background

### 时移系统

- 数据
  - 隐状态 ${x_k}$ 
  - 观测数据 ${y_k}$ ，带有噪声
- 操作：用$y_{1:d}$估计第k个状态 $x_k \| y_{1:d}$
  - 若 k > d，称为 预测(prediction)
  - k = d，滤波 (filter)
  - k < d，平滑 (smoothing)

## Bayesian Filter

- 数据
  - $x_k$ ：k时刻的状态
  - $y_k$：k时刻的观测
  - $p(x_k\|x_{k-1})$：运动模型、状态转移模型
  - $p(y_k\|x_k)$：观测模型
- 过程
  - 已知：
    - $p(x_0)$ ：初始状态
    - $p(x_k\|x_{k-1})$ ：运动模型
    - $p(y_k\|x_k)$：观测模型
  - 手段：
    - 贝叶斯滤波
  - 目的：
    - $p(x_k\|y_{1:k})$：k时刻的最优估计

## Algorithm Implementation

### 1. 初始化

- 初始化状态的先验分布$p(x_0)$

### 2. 预测

- 利用前k-1个观测$y_{1:k-1}$ 估计第k个隐状态$x_{k}$

- 全概率公式，或者C-K方程

- 得
  $$
  p(x_k | y_{1:k-1}) = \int p(x_k| x_{k-1}) p (x_{k-1}|y_{1:k-1})dx_{k-1}
  $$

- 其中 $p(x_k \| x_{k-1})$ 表示 运动模型

- 其中 $p (x_{k-1}\|y_{1:k-1})$ 表示 观测模型

### 3. 更新

利用预测以及新加入的第k个观测结合贝叶斯公式，可得：
$$
p(x_k|y_{1:k}) = \frac 1{Z_k} p(y_k|x_k) p(x_k|y_{1:k-1}) \tag 2
\\
where,\ \ \ \ Z_k = \int p(y_k| x_k) p(x_k|y_{1:k-1}) dx_k
$$



// todo(congyu) 上面的内容还需要整理，比较混乱








## Summary

##### 1. 初始化

$p(x_0)$ ,   $x_{k-1}$

##### 2. 预测

- 输入： $x_{k-1}\|y_{1:k-1}$   当前状态

- 方法：运动模型 $p(x_k\|x_{k-1})$       e.g.动力学方程等
  $$
  p(x_k | y_{1:k-1}) = \int p(x_k| x_{k-1}) p (x_{k-1}|y_{1:k-1})dx_{k-1} \tag 1
  $$

- 输出： $x_k\|y_{1:k-1}$  预测的下一时刻状态

##### 3. 更新

- 输入 ：
  - $x_k\|y_{1:k-1}$ ： 预测步给出的预测结果
  - $y_k$：当前观测值
  
- 方法：使用贝叶斯公式
  $$
  p(x_k|y_{1:k}) = \frac 1{Z_k} p(y_k|x_k) p(x_k|y_{1:k-1}) \tag 2
  \\
  where,\ \ \ \ Z_k = \int p(y_k| x_k) p(x_k|y_{1:k-1}) dx_k
  $$
  
- 输出：$x_k\|y_{1:k}$ 

##### Process

1. <u>-> 2. -> 3.</u>   <u>-> 2. -> 3.</u>  <u>-> 2. -> 3.</u>  <u>-> 2. -> 3.</u>  不断进行下去

<img src="/home/trifo/code/sync/DevelopmentNotes/img/Screenshot from 2021-09-07 11-32-03.png" alt="Screenshot from 2021-09-07 11-32-03" style="zoom:33%;" />







