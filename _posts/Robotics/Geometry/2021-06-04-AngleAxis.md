---
layout: post
title: "三维刚体运动基础系列 之 轴角!"
subtitle: "轴角姿态表达，以及轴角微分推导"
categories: [Robotics]
tags: [pose]
header-img: "img/in-post/"
header-style: text
date: 2021.06.04
author: "CongYu"
---


>  DEMO

* Kramdown table of contents
{:toc .toc}

----

Created 2021.06.04 by Cong Yu; Last modified: 2021.06.04-v1.0.2

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

----


# AngleAxis

## 基本概念


- 三维中的任一位姿，都只有两种轴角表达，两个的关系是直接取负
- 用一个单位向量描述旋转轴，外加一个角度描述旋转角度。一起共4个参数描述三维旋转。
- 也可以使用非归一化的旋转轴描述三维旋转。
- 轴角表达也不是唯一的，一个姿态可以有两种表达。


<img src="https://raw.githubusercontent.com/YuYuCong/YuYuCong.github.io/develop/img/in-post/post-geometry/post-roatet-angleaxis.png" alt="img" style="zoom:40%;" align='center' text ="test_img_github.png"/>



##### 约定

- robot坐标系  front  x, left  y, up  z
- 欧拉角顺序 zyx ypr yaw pitch roll
- $\Psi$ 方向或偏航 (heading or yaw)
- $\theta$  升降或俯仰 (elevation or pitch)
- $\phi$ 倾斜或横滚 (bank or roll)



### Rotations with axis and angle representation

构成
$$
V = (v_x, v_y, v_z) 
\\
\theta
$$

- notice: simultaneous rotation around a **normalized** vector $V$ by angle $\theta$

描述姿态



描述转动



### 特性

- one solution to gimbal lock
- no “order” of rotation, all at once around that vector

