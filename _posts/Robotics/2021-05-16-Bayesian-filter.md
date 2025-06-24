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

贝叶斯滤波算法的核心思想是通过递归的方式，利用运动模型和观测模型来估计系统的状态。算法包含两个主要步骤：预测步和更新步。

### 1. 初始化

- 设定初始状态的先验分布 $p(x_0)$
- 确定运动模型 $p(x_k|x_{k-1})$ 和观测模型 $p(y_k|x_k)$

### 2. 预测步 (Prediction Step)

**目标**：利用前k-1个观测 $y_{1:k-1}$ 来预测第k个时刻的状态分布

**方法**：使用全概率公式（Chapman-Kolmogorov方程）

**公式**：
$$
p(x_k | y_{1:k-1}) = \int p(x_k| x_{k-1}) p (x_{k-1}|y_{1:k-1})dx_{k-1} \tag{1}
$$

**解释**：
- $p(x_k|x_{k-1})$：运动模型，描述状态从 $x_{k-1}$ 到 $x_k$ 的转移概率
- $p(x_{k-1}|y_{1:k-1})$：前一时刻的后验分布（已知信息）
- $p(x_k|y_{1:k-1})$：当前时刻的先验分布（预测结果）

### 3. 更新步 (Update Step)

**目标**：结合新的观测 $y_k$ 来修正预测结果

**方法**：使用贝叶斯公式

**公式**：
$$
p(x_k|y_{1:k}) = \frac{1}{Z_k} p(y_k|x_k) p(x_k|y_{1:k-1}) \tag{2}
$$

其中归一化常数：
$$
Z_k = \int p(y_k| x_k) p(x_k|y_{1:k-1}) dx_k
$$

**解释**：
- $p(y_k|x_k)$：观测模型，描述在状态 $x_k$ 下观测到 $y_k$ 的概率（似然函数）
- $p(x_k|y_{1:k-1})$：预测步得到的先验分布
- $p(x_k|y_{1:k})$：融合观测后的后验分布（最终估计结果）
- $Z_k$：归一化常数，确保概率分布的积分为1

### 算法流程

1. **初始化**：设定 $p(x_0)$
2. **循环执行**：
   - **预测步**：根据运动模型预测下一时刻状态分布
   - **更新步**：根据新观测修正预测结果
3. **输出**：每个时刻的最优状态估计 $p(x_k|y_{1:k})$

## Summary

贝叶斯滤波是一种递归估计算法，通过预测-更新循环来实现最优状态估计：

### 核心步骤

**1. 初始化**
- 先验分布：$p(x_0)$
- 模型定义：运动模型 $p(x_k|x_{k-1})$，观测模型 $p(y_k|x_k)$

**2. 预测步**
- **输入**：$p(x_{k-1}|y_{1:k-1})$ （前一时刻后验分布）
- **方法**：Chapman-Kolmogorov方程
  $$
  p(x_k | y_{1:k-1}) = \int p(x_k| x_{k-1}) p (x_{k-1}|y_{1:k-1})dx_{k-1} \tag{1}
  $$
- **输出**：$p(x_k|y_{1:k-1})$ （当前时刻先验分布）

**3. 更新步**
- **输入**：
  - $p(x_k|y_{1:k-1})$ （预测步结果）
  - $y_k$ （当前观测）
- **方法**：贝叶斯公式
  $$
  p(x_k|y_{1:k}) = \frac{1}{Z_k} p(y_k|x_k) p(x_k|y_{1:k-1}) \tag{2}
  $$
- **输出**：$p(x_k|y_{1:k})$ （当前时刻后验分布）

### 算法特点

- **递归性**：每个时刻的估计都基于前一时刻的结果
- **最优性**：在给定模型下提供最小均方误差估计
- **通用性**：适用于各种线性/非线性、高斯/非高斯系统

### 实际应用

常见的贝叶斯滤波器实现包括：
- **卡尔曼滤波器**：线性高斯系统
- **扩展卡尔曼滤波器**：非线性系统的线性化近似
- **无迹卡尔曼滤波器**：非线性系统的无迹变换
- **粒子滤波器**：非线性非高斯系统的蒙特卡洛近似

![](img/Screenshot%20from%202021-09-07%2011-32-03.png)





