---
layout: post
title: "三维刚体运动基础系列 之 四元数!"
subtitle: "四元数姿态表达，以及四元数微分推导"
categories: [Robotics]
tags: [pose]
header-img: "img/in-post/"
header-style: text
date: 2021.06.05
author: "CongYu"
---


>  DEMO

* Kramdown table of contents
{:toc .toc}

----

Created 2021.06.05 by Cong Yu; Last modified: 2021.06.05-v1.0.2

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

----

# Quaternion

refitem: https://stanford.edu/class/ee267/lectures/lecture10.pdf

##### 约定

- robot坐标系  front  x, left  y, up  z
- 欧拉角顺序 zyx ypr yaw pitch roll
- $\Psi$ 方向或偏航 (heading or yaw)
- $\theta$  升降或俯仰 (elevation or pitch)
- $\phi$ 倾斜或横滚 (bank or roll)
- n系 导航坐标系
- b系 机体坐标系

## 1. 基本概念

##### 基本形式

$$
q = q_w + i q_x + j q_y + k q_z
$$

where:
- $q_w$是实部
- $q_x,q_y,q_z$是虚部
- i,j,k有如下特性：

$$
\begin{gather}
\\
i ≠ j ≠ k
\\
i^2 = j^1 = k^2 = ijk = -1
\\
ij = -ji = k
\\
ki = -ik = j
\\
jk = -kj = i
\end{gather}
$$

##### 单位四元数

用于三维刚体运动时，必须使用单位四元数，约束其模长为1

$$
\|q\| = \sqrt {q_w^2 + q_x^2+ q_y^2+ q_z^2} = 1
$$
##### 纯四元数

纯四元数 , 有 $q_w = 0$

## 2. 基本运算

Quaternion Algebra

四元数代数 (sync/0.books/Robotics/Course on SLAM-excerpt-Quaternion algebra.pdf)



refitem: https://stanford.edu/class/ee267/lectures/lecture10.pdf p20


##### 1. 四元数乘法

四元数乘法是四元数运算中最基本的运算之一。对于两个四元数 $q_1 = [w_1, \mathbf{v}_1]$ 和 $q_2 = [w_2, \mathbf{v}_2]$，其乘法定义为：

$$
q_1 \otimes q_2 = [w_1w_2 - \mathbf{v}_1 \cdot \mathbf{v}_2, w_1\mathbf{v}_2 + w_2\mathbf{v}_1 + \mathbf{v}_1 \times \mathbf{v}_2]
$$

其中：
- $\cdot$ 表示向量点积
- $\times$ 表示向量叉积

###### 分量形式

对于四元数 $q_1 = w_1 + ix_1 + jy_1 + kz_1$ 和 $q_2 = w_2 + ix_2 + jy_2 + kz_2$，其乘法结果可以表示为：

$$
\begin{aligned}
q_1 \otimes q_2 = &(w_1w_2 - x_1x_2 - y_1y_2 - z_1z_2) \\
&+ i(w_1x_2 + x_1w_2 + y_1z_2 - z_1y_2) \\
&+ j(w_1y_2 - x_1z_2 + y_1w_2 + z_1x_2) \\
&+ k(w_1z_2 + x_1y_2 - y_1x_2 + z_1w_2)
\end{aligned}
$$

###### 矩阵形式

四元数乘法也可以用矩阵形式表示。对于四元数 $q = [w, x, y, z]$，定义左乘矩阵 $L(q)$ 和右乘矩阵 $R(q)$：

$$
L(q) = \begin{bmatrix}
w & -x & -y & -z \\
x & w & -z & y \\
y & z & w & -x \\
z & -y & x & w
\end{bmatrix}, \quad
R(q) = \begin{bmatrix}
w & -x & -y & -z \\
x & w & z & -y \\
y & -z & w & x \\
z & y & -x & w
\end{bmatrix}
$$

则四元数乘法可以表示为：

$$
q_1 \otimes q_2 = L(q_1)q_2 = R(q_2)q_1
$$

###### 重要性质

1. 不满足交换律：$q_1 \otimes q_2 \neq q_2 \otimes q_1$
2. 满足结合律：$(q_1 \otimes q_2) \otimes q_3 = q_1 \otimes (q_2 \otimes q_3)$
3. 满足分配律：$q_1 \otimes (q_2 + q_3) = q_1 \otimes q_2 + q_1 \otimes q_3$
4. $[1, 0, 0, 0]$ 是乘法的单位元
5. 对于单位四元数，其逆等于其共轭：$q^{-1} = q^*$
6. 对于旋转四元数，必须保持单位长度：$\|q\| = \sqrt{w^2 + x^2 + y^2 + z^2} = 1$

###### 几何意义

四元数乘法在旋转中的应用：
- 连续旋转可以通过四元数乘法组合
- 对于点 $p$ 的旋转：$p_1 = q \otimes p_0 \otimes q^{-1}$
- 两个旋转的组合：$q_{total} = q_2 \otimes q_1$


注意说明：后文的公式中如果没有特意说明， $q_1q_2$ 和 $q_1 \cdot q_2$ 等这些形式的写法都指的是四元数乘法 $q_1 \otimes q_2$

##### 2. 四元数求逆

对于四元数 $q = q_w + i q_x + j q_y + k q_z$，其逆定义为：

$$
q^{-1} = \frac {q_w - i q_x - j q_y - k q_z} {\|q\|²}
$$

其中 $\|q\|² = q_w² + q_x² + q_y² + q_z²$ 是四元数的平方范数。

对于单位四元数（$\|q\| = 1$），逆运算简化为：$q⁻¹ = q_w - i q_x - j q_y - k q_z$

重要性质：
- 对于单位四元数，$q^{-1} = q^*$（共轭）
- $qq⁻¹ = q⁻¹q = \mathbf 1$（其中$\mathbf 1$是单位四元数$[1,0,0,0]$）
- $(q_1q_2)⁻¹ = q_2^{-1}q_1^{-1}$（由于非交换性，顺序很重要）
- 对于纯四元数，有$q_w = 0$，逆就是取负值
- 对于表示旋转的单位四元数，逆表示相反的旋转



## 3. 表达姿态与旋转

必须使用单位四元数

##### 表达姿态

- 四元数表达姿态不是唯一的。对于同一个旋转/姿态，存在两个四元数表示：q 和 -q。
- 轴角转单位四元数:

axis-angle to quaternion (need **normalized** axis $v$)
$$
\begin{align}
  q_w &= cos(\theta/2)
  \\
  q_x &= v_x sin(\theta/2)
  \\
  q_y &= v_y sin(\theta/2)
  \\
  q_z &= v_z sin(\theta/2)
  \\
  q &= q_w + i q_x + j q_y + k q_z
\end{align}
$$

$$
q = [\cos(\theta / 2), \mathbf v \sin(\theta/2)]
$$


##### 姿态间的旋转

姿态q1到q2的旋转动作有

$$
\begin{align}
\\q_2 &= q_1^2 q_1
\\q_1^2 &= q_2 q_1^{-1}
\end{align}
$$

##### 点的旋转

运算时，需要将三维点$p = [p_x,p_y,p_z]^T$写为纯四元数形式$p := [0, p_x,p_y,p_z]^T$

对于一个三维点 $p_0$，有一单位四元数表达的旋转操作$q$，作用于$p_0$的结果
$$
p_t = q p_0 q^{-1}
$$

##### 逆旋转

旋转的逆旋转：四元数的逆表示相反的旋转动作

$$
\begin{gather}
qq^{-1} = q^{-1}q = \mathbf 1, 
\\ \mathbf 1 = [1,0,0,0]
\end{gather}
$$

点的逆旋转

$$
\begin{align}
\\p_t = q p_0 q^{-1} 
\\p_0 = q^{-1}p_tq
\end{align}
$$

##### 多次旋转

旋转叠加：左乘，先做q_1旋转再做q_2旋转，有总旋转

$$
q_a = q_2q_1
$$

点的旋转叠加

$$
p_t = q_2q_1p_0q_1^{-1}q_2^{-1} = q_a p_0 q_a^{-1}
$$


## 4. 四元数微分

四元数微分描述了四元数随时间的变化率。对于一个单位四元数 $q(t)$，其微分 $\dot{q}(t)$ 表示四元数在时间 $t$ 处的瞬时变化率。

### 4.1 从轴角表示推导

考虑一个旋转四元数 $q(t)$，它可以表示为轴角形式：

$$
q(t) = \begin{bmatrix} \cos\frac{\theta(t)}{2} \\ \mathbf{u}(t)\sin\frac{\theta(t)}{2} \end{bmatrix}
$$

其中 $\mathbf{u}(t)$ 是单位旋转轴，$\theta(t)$ 是旋转角度。

当时间变化一个微小量 $\Delta t$ 时，四元数变为：

$$
q(t + \Delta t) = \begin{bmatrix} \cos\frac{\theta(t + \Delta t)}{2} \\ \mathbf{u}(t + \Delta t)\sin\frac{\theta(t + \Delta t)}{2} \end{bmatrix}
$$

### 4.2 角速度与四元数微分的关系

定义角速度 $\boldsymbol{\omega}(t)$ 为：

$$
\boldsymbol{\omega}(t) = \lim_{\Delta t \to 0} \frac{\Delta \theta}{\Delta t} \mathbf{u}(t)
$$

其中 $\Delta \theta$ 是在 $\Delta t$ 时间内的旋转角度。

   - 角度增量：$\Delta \theta = \|\boldsymbol{\omega}\|\Delta t$
   - 旋转轴保持不变近似：$\mathbf{u}(t + \Delta t) \approx \mathbf{u}(t)$
   - 旋转轴与角速度的关系：$\omega = \|\omega\| \mathbf u(t)$


### 4.3 四元数微分的推导

四元数的微分可以表示为：

$$
\begin{equation}
\begin{split}
\dot{q}(t) &= \lim_{\Delta t \to 0} \frac{q(t + \Delta t) - q(t)}{\Delta t}
\end{split}
\end{equation}
$$

让我们逐步推导：

1. 首先，对于小角度旋转，我们有以下近似：
   - 小角度近似
	   - $\cos\frac{\Delta \theta}{2} \approx 1$
	   - $\sin\frac{\Delta \theta}{2} \approx \frac{\Delta \theta}{2}$
   - 旋转轴不变近似
	   - $\mathbf{u}(t + \Delta t) \approx \mathbf{u}(t)$

2. 应用旋转轴不变近似，将 $q(t + \Delta t)$ 展开：
   $$
   \begin{split}
   q(t + \Delta t) &\approx \begin{bmatrix} \cos\frac{\theta(t) + \Delta \theta}{2} \\ \mathbf{u}(t)\sin\frac{\theta(t) + \Delta \theta}{2} \end{bmatrix} \\
   &= \begin{bmatrix} \cos\frac{\theta(t)}{2}\cos\frac{\Delta \theta}{2} - \sin\frac{\theta(t)}{2}\sin\frac{\Delta \theta}{2} \\ \mathbf{u}(t)(\sin\frac{\theta(t)}{2}\cos\frac{\Delta \theta}{2} + \cos\frac{\theta(t)}{2}\sin\frac{\Delta \theta}{2}) \end{bmatrix}
   \end{split}
   $$

3. 应用小角度近似：
   $$
   \begin{split}
   q(t + \Delta t) &\approx \begin{bmatrix} \cos\frac{\theta(t)}{2} - \sin\frac{\theta(t)}{2}\frac{\Delta \theta}{2} \\ \mathbf{u}(t)(\sin\frac{\theta(t)}{2} + \cos\frac{\theta(t)}{2}\frac{\Delta \theta}{2}) \end{bmatrix} \\
   &= q(t) + \frac{\Delta \theta}{2} \begin{bmatrix} -\sin\frac{\theta(t)}{2} \\ \mathbf{u}(t)\cos\frac{\theta(t)}{2} \end{bmatrix}
   \end{split}
   $$

4. 代入微分定义：
   $$
   \begin{split}
   \dot{q}(t) &\equiv \lim_{\Delta t \to 0} \frac{q(t + \Delta t) - q(t)}{\Delta t} \\
   &= \lim_{\Delta t \to 0} \frac{1}{\Delta t} \frac{\Delta \theta}{2} \begin{bmatrix} -\sin\frac{\theta(t)}{2} \\ \mathbf{u}(t)\cos\frac{\theta(t)}{2} \end{bmatrix} \\
   &= \frac{\|\boldsymbol{\omega}\|}{2} \begin{bmatrix} -\sin\frac{\theta(t)}{2} \\ \mathbf{u}(t)\cos\frac{\theta(t)}{2} \end{bmatrix}
   \end{split}
   $$

5. 注意到 $\boldsymbol{\omega} = \|\boldsymbol{\omega}\|\mathbf{u}(t)$，我们可以将上式重写为：
   $$
   \dot{q}(t) = \frac{1}{2} \begin{bmatrix} 0 \\ \boldsymbol{\omega}(t) \end{bmatrix} \begin{bmatrix} \cos\frac{\theta(t)}{2} \\ \mathbf{u}(t)\sin\frac{\theta(t)}{2} \end{bmatrix}
   $$

6. 这正好是四元数乘法的形式，其中：
   - $\begin{bmatrix} 0 \\ \boldsymbol{\omega}(t) \end{bmatrix}$ 是角速度的纯四元数表示
   - $\begin{bmatrix} \cos\frac{\theta(t)}{2} \\ \mathbf{u}(t)\sin\frac{\theta(t)}{2} \end{bmatrix}$ 就是 $q(t)$

7. 因此，最终得到四元数微分方程：
   $$
   \dot{q}(t) = \frac{1}{2} \begin{bmatrix} 0 \\ \boldsymbol{\omega}(t) \end{bmatrix} \otimes q(t)
   $$

8. 注意：这里的角速度 $\boldsymbol{\omega}(t)$ 是在全局坐标系（世界坐标系）下表示的。在实际应用中，我们通常通过IMU等传感器获得的是物体坐标系下的角速度 $\boldsymbol{\omega}_b$。两者之间的关系为：
$$
\boldsymbol{\omega}_b = q^* \otimes \boldsymbol{\omega} \otimes q
$$
或
$$
\boldsymbol{\omega} = q \otimes \boldsymbol{\omega}_b \otimes q^*
$$

因此，在实际应用中，我们通常使用物体坐标系下的角速度，此时四元数微分方程变为：
$$
\dot{q}(t) = \frac{1}{2} q(t) \otimes \begin{bmatrix} 0 \\ \boldsymbol{\omega}_b(t) \end{bmatrix}
$$

### 4.4 矩阵形式表示

为了便于计算，可以将四元数微分表示为矩阵形式：

$$
\dot{q}(t) = \frac{1}{2} \Omega(\boldsymbol{\omega}(t)) q(t)
$$

其中 $\Omega(\boldsymbol{\omega})$ 是一个 4×4 矩阵：

$$
\Omega(\boldsymbol{\omega}) = \begin{bmatrix}
0 & -\omega_x & -\omega_y & -\omega_z \\
\omega_x & 0 & \omega_z & -\omega_y \\
\omega_y & -\omega_z & 0 & \omega_x \\
\omega_z & \omega_y & -\omega_x & 0
\end{bmatrix}
$$

### 4.5 推导思路2


 refitem:

- Quaternion kinematics for the error-state Kalman filter https://arxiv.org/pdf/1711.02508.pdf p45 经典教材
- https://blog.csdn.net/qq_39554681/article/details/88909564
- https://blog.csdn.net/u013236946/article/details/72831380
- http://mars.cs.umn.edu/tr/reports/Trawny05b.pdf
- https://blog.csdn.net/weixin_37835423/article/details/109452148
- https://zhuanlan.zhihu.com/p/254888810
- https://stanford.edu/class/ee267/lectures/lecture10.pdf p26

<img src="https://raw.githubusercontent.com/YuYuCong/YuYuCong.github.io/develop/img/in-post/post-geometry/
post-robotics-q-imu-inter.png" alt="img" style="zoom:40%;" align='center' text ="test_img_github.png"/>

有

$$
\begin{align}
&q(t): &t时刻姿态四元数
\\
&q(t+\Delta t): &t+\Delta时刻姿态四元数
\\
&w: &瞬时角速度(global \ frame)
\end{align}
$$
$$
q_\Delta = q(\Delta t \|\omega\|, \frac{\omega}{\|\omega\|})
$$
有
$$
q(t+\Delta t) = q_\Delta q(t) \tag2
$$
所以
$$
\begin{equation}
  \begin{split}
\dot{q}(t) =&\lim_{\Delta{t} \to 0}\frac{q(t+\Delta{t})-q(t)}{\Delta{t}}\\
=&\hat{\boldsymbol\omega}\lim_{\Delta{t} \to 0}\frac{\sin(\Vert{\boldsymbol\omega}\Vert\Delta{t}/2)}{\Delta{t}}q(t)\\
=&\hat{\boldsymbol\omega}\frac{d}{dt}\sin(\frac{\Vert{\boldsymbol\omega}\Vert t}{2})|_{t=0}q(t)\\
=&\hat{\boldsymbol\omega}\frac{\Vert{\boldsymbol\omega}\Vert}{2}q(t)\\
=&\frac{1}{2}\boldsymbol\omega(t)q(t)
  \end{split}
\end{equation}
$$



在实际中，能得到的角速度其实是相对于物体坐标系下的角速度 $ω'$（例如通过IMU获得）。世界坐标系下的角速度 ω 不动，物体坐标系旋转，则角速度 ω 在物体坐标系下的表示为 $ω′=q^*ωq$。 将 代入  $ω=qω'q^*$ (14)，得到：
$$
\dot{q}=\frac{1}{2}{q}\boldsymbol\omega'
$$


若 $q'$ 已知，(14)两边同时右乘 q∗，可以求得角速度：

$$ω =2 \dot q q^*$$

根据(14)，四元数的二阶导为：
$$
\begin{equation}  \begin{split} \ddot{q}=&\frac{1}{2}(\dot{\boldsymbol\omega} q+\boldsymbol\omega\dot{q})\\ =&\frac{1}{2}\dot{\boldsymbol\omega} q + \frac{1}{4}\boldsymbol\omega\boldsymbol\omega{q}\\ =&(-\frac{1}{4}\Vert{\boldsymbol\omega}\Vert^2+\frac{1}{2}\dot{\boldsymbol\omega})q  \end{split} \end{equation}
$$


当 *q*q 的一阶导和二阶导都是已知时，由上式两边同时右乘 *q*∗q∗ 可以求出角加速度：
$$
\begin{equation}
  \begin{split}
\dot{\boldsymbol\omega}=&2\ddot{q}q^*-\boldsymbol\omega\dot{q}q^*\\
=&2\ddot{q}q^*-2\dot{q}q^*\dot{q}q^*\\
=&2(\ddot{q}q^*-(\dot{q}q^*)^2)
  \end{split}
\end{equation}
$$


微分方程(14)可以用数值积分求解。令 *h*h 为时间步长， *q**k*qk 和 **ω***k*ωk 是 *k**h*kh 时刻的四元数和角速度。则在下一时刻的四元数近似为：
$$
q_{k+1}=q_k+\frac{1}{2}h\boldsymbol\omega_k{q_k}
$$



由于增量计算， *q**k*+1qk+1不一定是单位四元数，所以需要规范化为单位四元数：
$$
q_{k+1}\leftarrow\frac{q_{k+1}}{\Vert{q_{k+1}}\Vert}
$$


### 4.6 推导思路3

- VIO笔记Learning_vio L1 p27

当旋转一段微小的时间，即$\theta \rightarrow 0$ 趋于0时，可以得到

$$
\Delta q = \begin{bmatrix} \text{cos} \frac {\delta \theta} 2 \\ \mathbf{u} \text{sin}\frac{\delta\theta}2 \end{bmatrix} \approx \begin{bmatrix} 1 \\ \mathbf{u} \frac{\delta\theta}2 \end{bmatrix} = \begin{bmatrix} 1 \\ \frac 1 2 \mathbf {\delta\theta} \end{bmatrix}
$$
其中 $\mathbf{\delta\theta}$ 的方向为旋转轴，模长为旋转角度 ？？？？最后一个等号？？？以及这句话是怎么表达出来的？？？



对时间求导

角速度
$$
\omega = \lim_{\Delta{t} \to 0} \frac {\delta \theta}{ \Delta t}
$$

四元数微分


![200](img/in-post/post-geometry/post-robotics-quaternion-diff.png)

$$
\begin{equation}
\begin{split}
\dot{q}(t)=&\lim_{\Delta{t} \to 0}\frac{q(t+\Delta{t})-q(t)}{\Delta{t}}\\
=&\hat{\boldsymbol\omega}\lim_{\Delta{t} \to 0}\frac{\sin(\Vert{\boldsymbol\omega}\Vert\Delta{t}/2)}{\Delta{t}}q(t)\\
=&\hat{\boldsymbol\omega}\frac{d}{dt}\sin(\frac{\Vert{\boldsymbol\omega}\Vert t}{2})|_{t=0}q(t)\\
=&\hat{\boldsymbol\omega}\frac{\Vert{\boldsymbol\omega}\Vert}{2}q(t)\\
=&\frac{1}{2}\boldsymbol\omega(t)q(t)
\end{split}
\end{equation}
$$



## 5. 四元数表达下的陀螺仪积分

Gyro Integration with Quaternions

在实际应用中，我们通常使用数值积分方法来求解四元数微分方程。最常用的是四阶龙格-库塔法（RK4）：

具体数理详见 [2022-05-05-Runge-Kutta](Math/2022-05-05-Runge-Kutta.md)


$$
\begin{aligned}
k_1 &= \frac{1}{2}q_k \otimes \begin{bmatrix} 0 \\ \boldsymbol{\omega}_{b,k} \end{bmatrix} \\
k_2 &= \frac{1}{2}(q_k + \frac{h}{2}k_1) \otimes \begin{bmatrix} 0 \\ \boldsymbol{\omega}_{b,k+\frac{1}{2}} \end{bmatrix} \\
k_3 &= \frac{1}{2}(q_k + \frac{h}{2}k_2) \otimes \begin{bmatrix} 0 \\ \boldsymbol{\omega}_{b,k+\frac{1}{2}} \end{bmatrix} \\
k_4 &= \frac{1}{2}(q_k + hk_3) \otimes \begin{bmatrix} 0 \\ \boldsymbol{\omega}_{b,k+1} \end{bmatrix} \\
q_{k+1} &= q_k + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)
\end{aligned}
$$

其中：
- $h$ 是时间步长
- $\boldsymbol{\omega}_{b,k}$ 是 $t_k$ 时刻物体坐标系下的角速度测量值
- $\boldsymbol{\omega}_{b,k+\frac{1}{2}}$ 是 $t_k + \frac{h}{2}$ 时刻的角速度（通常通过线性插值得到）
- $\boldsymbol{\omega}_{b,k+1}$ 是 $t_{k+1}$ 时刻的角速度

注意：由于数值积分可能破坏四元数的单位约束，每次积分后需要进行归一化：

$$
q_{k+1} \leftarrow \frac{q_{k+1}}{\|q_{k+1}\|}
$$

在惯性导航系统中，更新姿态过程：

1. 从陀螺仪获取角速度测量值 $\boldsymbol{\omega}_b$（物体坐标系下）
2. 使用四元数微分方程更新姿态四元数：
   $$
   \dot{q}(t) = \frac{1}{2} q(t) \otimes \begin{bmatrix} 0 \\ \boldsymbol{\omega}_b(t) \end{bmatrix}
   $$
3. 对更新后的四元数进行归一化
4. 重复以上步骤

这种方法的优点是：
- 计算效率高
- 避免了欧拉角表示中的万向节锁问题
- 直接使用物体坐标系下的角速度测量值，无需坐标转换


## 6. 四元数插值

在机器人运动规划中,经常需要在两个姿态之间进行平滑插值。四元数插值主要有两种方法:

### 6.1. 线性插值 (LERP)

对于两个四元数 $q_0$ 和 $q_1$,线性插值定义为:

$$
q_{lerp}(t) = \frac{(1-t)q_0 + tq_1}{\|(1-t)q_0 + tq_1\|}
$$

其中 $t \in [0,1]$ 是插值参数。

特点:
- 计算简单
- 插值路径不是最短路径
- 插值速度不均匀

### 6.2. 球面线性插值 (SLERP)

球面线性插值能够保证插值路径是最短路径,且速度均匀:

$$
q_{slerp}(t) = q_0 (q_0^{-1}q_1)^t
$$

或者等价的表达式:

$$
q_{slerp}(t) = \frac{\sin((1-t)\theta)}{\sin\theta}q_0 + \frac{\sin(t\theta)}{\sin\theta}q_1
$$

其中 $\theta$ 是 $q_0$ 和 $q_1$ 之间的夹角。

特点:
- 插值路径是最短路径
- 角速度恒定
- 计算相对复杂

