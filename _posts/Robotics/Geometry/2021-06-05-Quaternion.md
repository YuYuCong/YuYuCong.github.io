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

## Quaternion

refitem: https://stanford.edu/class/ee267/lectures/lecture10.pdf

##### 约定

- robot坐标系  front  x, left  y, up  z
- 欧拉角顺序 zyx ypr yaw pitch roll
- $\Psi$ 方向或偏航 (heading or yaw)
  - $\theta$  升降或俯仰 (elevation or pitch)
  - $\phi$ 倾斜或横滚 (bank or roll)
- n系 导航坐标系
- b系 机体坐标系

### Basic

$$
q = q_w + i q_x + j q_y + k q_z
$$

where
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

- valid rotation quaternions have unit length
  $$
  ||q|| = \sqrt {q_w^2 + q_x^2+ q_y^2+ q_z^2} = 1
  $$



### Rotations with quaternions

#### 1.表达姿态



#### 2.表达转动

 ##### 2.1 向量旋转

a point in 3d space
$$
p_0 = [p_x,p_y,p_z]^T
$$
写为纯四元数
$$
p = [0, p_0]^T
$$
有一单位四元数表达的旋转操作q
$$
q = [cos(\theta / 2), v \cdot sin(\theta/2)]
$$
q作用于p的结果
$$
p' = q \cdot p \cdot \ q^{-1} = [0,p_t]^T
$$
得到 $p_t$


 ##### 2.2 坐标系旋转

有o-xyz坐标系下的点 $p = [0, p_x,p_y,p_z]^T$

有一个$q = [cos(\theta / 2), v \cdot sin(\theta/2)]$ 表示：将 o-xyz坐标系 沿着单位旋转轴v旋转$\theta$角度，得到新的坐标系 o'-xyz'

此时 p_0在新坐标系下的表示为 点 $p' = [0, p_x',p_y',p_z']^T$

有
$$
p' = q^{-1} \cdot p \cdot  q
$$


### 轴角转换四元数

- axis-angle to quaternion (need **normalized** axis v)
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

### 特性



### Quaternion Algebra

refitem: https://stanford.edu/class/ee267/lectures/lecture10.pdf p20

##### Two Types

###### 1. Vector quaternions 

又称纯四元数

represent 3D points or vectors u=(ux,uy,uz) can have arbitrary length
$$
q_u = 0 + iu_x + ju_y + ku_z
$$

###### 2. rotation quaternions

valid rotation quaternions have unit length
$$
||q|| = \sqrt {q_w^2 + q_x^2+ q_y^2+ q_z^2} = 1
$$

##### addition

//todo(congyu)

##### multiplication

//todo(congyu)

##### rotation

rotation of vector quaternion $q_u$ by $q$ :
$$
q'_u = q q_u q^{-1}
$$

##### inverse rotation

$$
q_u = q^{-1}q'_u q
$$

##### rotation after rotation

$$
q'_u = q_2 q_1 q_u q_1^{-1} q_2^{-1}
$$

### Gyro Integration with Quaternions

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





