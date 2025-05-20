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

##### 表达形式

$$
q = q_w + i q_x + j q_y + k q_z
$$

where:
- $q_w$是实部
- $q_x,q_y,q_z$是虚部
- i,j,k有如下特性：

$$
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
$$

且用于三维刚体旋转时，必须使用单位四元数

$$
||q|| = \sqrt {q_w^2 + q_x^2+ q_y^2+ q_z^2} = 1
$$

##### 轴角转换四元数

axis-angle to quaternion (need **normalized** axis $v$)
$$
  q_w = cos(\theta/2)
  \\
  q_x = v_x sin(\theta/2)
  \\
  q_y = v_y sin(\theta/2)
  \\
  q_z = v_z sin(\theta/2)
  \\
  q = q_w + i q_x + j q_y + k q_z
$$

$$
q = [\cos(\theta / 2), \mathbf v \sin(\theta/2)]
$$

## 2. 基本运算

Quaternion Algebra

refitem: https://stanford.edu/class/ee267/lectures/lecture10.pdf p20


##### 1. 四元数乘法

对于两个元数:
$$
\\ q_1 = w_1 + i x_1 + j y_1 + k z_1
\\ q_2 = w_2 + i x_2 + j y_2 + k z_2
$$

其乘法结果计算如下:

1. 标量部分:
$$
w = w_1w_2 - x_1x_2 - y_1y_2 - z_1z_2
$$

2. 向量部分:
$$
\begin{aligned}
x &= w_1x_2 + x_1w_2 + y_1z_2 - z_1y_2 \\
y &= w_1y_2 - x_1z_2 + y_1w_2 + z_1x_2 \\
z &= w_1z_2 + x_1y_2 - y_1x_2 + z_1w_2
\end{aligned}
$$

最终有
$$
q_1 \cdot q_2 = w + i x + j y + k z
$$

重要性质:
- 四元数乘法不满足交换律: $q_1q_2 \neq q_2q_1$
- 四元数乘法满足结合律: $(q_1q_2)q_3 = q_1(q_2q_3)$
- 对于旋转四元数,必须保持单位长度: $||q|| = \sqrt{w^2 + x^2 + y^2 + z^2} = 1$

##### 2. 四元数求逆

对于四元数 $q = q_w + i q_x + j q_y + k q_z$，其逆定义为：

$$
q^{-1} = \frac {q_w - i q_x - j q_y - k q_z} {||q||²}
$$

其中 $||q||² = q_w² + q_x² + q_y² + q_z²$ 是四元数的平方范数。

对于单位四元数（$||q|| = 1$），逆运算简化为：
$q⁻¹ = q_w - i q_x - j q_y - k q_z$

重要性质：
- 对于单位四元数，$q^{-1} = q^*$（共轭）
- $q·q⁻¹ = q⁻¹·q = \mathbf 1$（其中$\mathbf 1$是单位四元数$[1,0,0,0]$）
- $(q₁·q₂)⁻¹ = q₂⁻¹·q₁⁻¹$（由于非交换性，顺序很重要）
- 对于纯四元数，有$q_w = 0$，逆就是取负值
- 对于表示旋转的单位四元数，逆表示相反的旋转



## 3. 表达姿态与旋转

必须使用单位四元数

##### 1. 表达姿态

todo(congyu)

##### 2. 表达姿态间的旋转

todo(congyu)

##### 3. 点的旋转

运算时，需要将三维点$p = [p_x,p_y,p_z]^T$写为纯四元数形式$p := [0, p_x,p_y,p_z]^T$

对于一个三维点 $p_0$，有一单位四元数表达的旋转操作$q$，作用于$p_0$的结果
$$
p_t = q \cdot p_0 \cdot \ q^{-1}
$$

##### 4. 逆旋转

旋转的逆旋转：四元数的逆表示相反的旋转动作

$$qq⁻¹ = q⁻¹q = \mathbf 1, \\ \mathbf 1 = [1,0,0,0]$$

点的逆旋转

$$
\\p_t = q p_0 q^{-1} 
\\p_0 = q^{-1}p_tq
$$

##### 5. 多次旋转

旋转叠加，先做q_1旋转再做q_2旋转，有总旋转

$$
q_a = q_2q_1
$$

点的旋转叠加

$$
p_t = q_2q_1p_0q_1^{-1}q_2^{-1} = q_a p_0 q_a^{-1}
$$

## 4. Gyro Integration with Quaternions

四元数微分

#### Derivations 1

简单推导

refitem: 

- https://stanford.edu/class/ee267/lectures/lecture10.pdf p26

start pose : $q_0$ (in world frame)

convert 3-axis gyro measurements to instantaneous rotation quaternion (in bot frame) as
$$
q_\Delta = q(\Delta t ||\omega||, \frac{\omega}{||\omega||})
$$
where: $\Delta t||\omega||$ is angle (in bot frame)

​			$\frac{\omega}{||\omega||}$ is rotation axis (in bot frame)

integrate as 
$$
q_t = q_\Delta q_{t-1} q_0 q_{t-1}^{-1} q_\Delta ^{-1}
$$
here we get $q_t$  (in world frame)



#### Derivations 2

复杂推导

 refitem:

- Quaternion kinematics for the error-state Kalman filter https://arxiv.org/pdf/1711.02508.pdf p45 经典教材

<img src="https://raw.githubusercontent.com/YuYuCong/YuYuCong.github.io/develop/img/in-post/post-geometry/
post-robotics-q-imu-inter.png" alt="img" style="zoom:40%;" align='center' text ="test_img_github.png"/>


$$
q = [qw, qx, qy, qz]
\\
\frac {dq} {dt} = \frac 1 2 \cdot \Omega \cdot q
\\
\therefore \ \ \ \ 
q^{(t+1)} = q^{(t)} + \frac 1 2 \cdot \Delta t \cdot \Omega
$$
where
$$
\Omega =
\left[
\begin{matrix}
   0 & -w_x & -w_y & -w_z \\ 
   w_x & 0 & w_z & -w_y \\
   w_y & -w_z & 0 & w_x \\
   w_z & w_y & -w_x & 0 \\
\end{matrix}
\right] \tag{1}
$$


- why add ???? //todo(congyu)



#### Derivations 3

refitem:

- https://blog.csdn.net/qq_39554681/article/details/88909564

// todo(congyu)
$$
q(t):
\\
q(t+\Delta t):
\\
w: 瞬时角速度(global \ frame)
$$

$$
q_\Delta = q(\Delta t ||\omega||, \frac{\omega}{||\omega||})
$$





#### Derivations 4

refitem:

- http://mars.cs.umn.edu/tr/reports/Trawny05b.pdf





#### Derivations 6

refitem:

- https://blog.csdn.net/u013236946/article/details/72831380

$$
q(t): t时刻姿态四元数
\\
q(t+\Delta t): t+1时刻姿态四元数
\\
w: 瞬时角速度(global \ frame)
\\
q_\Delta = q(\Delta t ||\omega||, \frac{\omega}{||\omega||})
$$

有
$$
q(t+\Delta t) = q_\Delta q(t) \tag2
$$
所以
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





四元数代数 (sync/0.books/Robotics/Course on SLAM-excerpt-Quaternion algebra.pdf) todo(congyu)



##### VIO笔记

learning_vio L1 p27

轴角 单位向量u，旋转角度$\theta$
对应的单位四元数
$$q = \begin{bmatrix} \text{cos}{\frac \theta 2} \\ \mathbf{u} \text{sin} \frac \theta 2\end{bmatrix}$$


当旋转一段微小的时间，即$\theta \rightarrow 0$ 趋于0时，可以得到

$$
\Delta q = \begin{bmatrix} \text{cos} \frac {\delta \theta} 2 \\ \mathbf{u} \text{sin}\frac{\delta\theta}2 \end{bmatrix} \approx \begin{bmatrix} 1 \\ \mathbf{u} \frac{\delta\theta}2 \end{bmatrix} = \begin{bmatrix} 1 \\ \frac 1 2 \mathbf {\delta\theta} \end{bmatrix}
$$
其中 $\mathbf{\delta\theta}$ 的方向为旋转轴，模长为旋转角度 ？？？？<mark style="background: #FF5582A6;">todo(congyu)</mark> 最后一个等号？？？以及这句话是怎么表达出来的？？？



##### 对时间求导

角速度
$$
\omega = \lim_{\Delta{t} \to 0} \frac {\delta \theta}{ \Delta t}
$$

四元数微分


![|200](img/in-post/post-geometry/post-robotics-quaternion-diff.png)

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
todo(congyu) 核实上面的公式







refitem:

- https://blog.csdn.net/weixin_37835423/article/details/109452148



- https://zhuanlan.zhihu.com/p/254888810






## 5. 四元数插值

在机器人运动规划中,经常需要在两个姿态之间进行平滑插值。四元数插值主要有两种方法:

##### 1. 线性插值 (LERP)

对于两个四元数 $q_0$ 和 $q_1$,线性插值定义为:

$$
q_{lerp}(t) = \frac{(1-t)q_0 + tq_1}{||(1-t)q_0 + tq_1||}
$$

其中 $t \in [0,1]$ 是插值参数。

特点:
- 计算简单
- 插值路径不是最短路径
- 插值速度不均匀

##### 2. 球面线性插值 (SLERP)

球面线性插值能够保证插值路径是最短路径,且速度均匀:

$$
q_{slerp}(t) = q_0 \cdot (q_0^{-1}q_1)^t
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

