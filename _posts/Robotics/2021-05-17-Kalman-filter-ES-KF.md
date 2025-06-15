---
layout: post
title: "Error-State Kalman Filter"
description: "Error-State Kalman Filter"
categories: [Kalman-Filter, filter, Math, ESKF]
tags: [Kalman-Filter, filter, Math, ESKF]
redirect_from:
  - /2021/05/16/
---

>  Error-State Kalman Filter

* Kramdown table of contents
{:toc .toc}

----

Created 2021.05.16 by William Yu; Last modified: 2022.07.12-V1.2.2

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 William Yu. Some rights reserved.

----


# Error-State Kalman Filter

误差状态卡尔曼滤波 (Error State Kalman Filter，ESKF).

refitem:

- blog https://www.cnblogs.com/JingeTU/p/11616469.html
- blog https://zhuanlan.zhihu.com/p/359014822

## Basic

#### Sentence

- EKF和ESKF分别作为直接法滤波和间接法滤波的一种实现
- 从理论上来说，精度上直接法应该优于间接法
- 因为间接法的误差系统方程实际上是推导出来的，并且过程中作了一定近似（例如去掉了所有的二次微分项），虽然完成了系统线性化，但损失了精度
- 而直接法的系统方程是没有损失的，其精度损失在于在局部点上采用了泰勒一阶近似对系统线性化造成的精度损失，这取决于迭代速度、系统份非线性化程度等多个因素，因此实际工程实践中精度还是取决于使用情况和具体实现。
- 直接法例如EKF在每次迭代都需要计算雅克比矩阵，对于算力要求较高，而间接法在将误差方程线性化后，其雅克比矩阵是固定的，只与当前状态相关。 
- 间接法由于每次估计的是状态误差项，其数值差异小，而直接法估计的是系统状态，不同状态项数值差异大，可能在实际计算中带来误差。

## Model

refitem: - blog https://zhuanlan.zhihu.com/p/359014822

#### 1.0 符号约定

- x ：状态真值 True 无从得知
- $\hat x$ ：Nominal State
- $\tilde x$ ：Error State

#### 1.1 状态向量

$$
x = \hat x + \tilde x \tag1
$$

表达式1中的$\tilde x$ 即ESCKF所处理的状态。

注： + 为广义加法，具体表达由微分方程推出

#### 1.2 运动方程

共三部分：
$$
\begin{align}
& x_k = f(x_{k-1}, u_k)+\omega_k \tag2
\\
& \hat x_k = f(\hat x_{k-1}, u_k) \tag3
\\
& \tilde x_k = \tilde f(\hat x_{k-1}, \tilde x_{k-1},u_k,w_k) \tag4
\end{align}
$$

理解:

- 表达式3 即 EKF 所用的运动更新方程。:deciduous_tree: 
- EKF 在运动更新的计算中只考虑正态分布的白噪声 $w_k$， 而不考虑<u>其他误差 (比如测量误差、环境误差等)</u>。即直接使用公式3 更新期望状态，使用协方差更新公式更新协方差 以表征$w_k$。
- 所以EKF中其他误差会积累，而EKF却未曾考虑。
- 而 ES-KF 在运动更新的计算中 不仅考虑白噪声 $w_k$，也考虑到其他各种误差。这些误差的传递与考量反应在了$\tilde x$ 的更新上面。:slightly_smiling_face:
-  所以$\tilde x$ 从哪儿来？ 答：源自于<u>其他误差 (比如测量误差、环境误差等)</u>。
- ES-KF 的思路：先按照表达式3更新 $\hat x$，然后按照表达式5 更新 $\tilde x$。然后相加得到最优的估计作为新的 $\hat x$。


$\tilde f$ 的推导：
$$
\begin{align}
& x_k = f(x_{k-1}, u_k)+\omega_k \\
\end{align}
$$

拆分$x_k$ 和 $x_{k-1}$，得
$$
\begin{align}
\hat x_k + \tilde x_k &= f(\hat x_{k-1} + \tilde x_{k-1}, u_k) + \omega_k
\end{align}
$$
对$f(\hat x_{k-1} + \tilde x_{k-1}, u_k)$ 在 $\tilde x_{k-1} = 0$ 附近泰勒展开：
$$
\begin{align}
\hat x_k + \tilde x_k &= f(\hat x_{k-1}, u_k) + \frac{\partial f}{\partial x_{k-1}}\bigg|_{\hat x_{k-1}} \tilde x_{k-1} + \omega_k\\
&= \hat x_{k} + F_{k-1} \tilde x_{k-1} + \omega_k
\end{align}
$$
其中 $F_{k-1} = \frac{\partial f}{\partial x_{k-1}}\bigg|_{\hat x_{k-1}}$ 是状态转移雅克比矩阵。

代入表达式3，两边去掉$\hat x_k$, 得
$$
\tilde x_k = F_{k-1} \tilde x_{k-1} + \omega_k \tag5
$$
表达式5即表达式4的近似形式。



#### 1.3 观测方程

$$
z_k = h(x_k) + v_k \tag6
$$

对于误差状态卡尔曼滤波，我们需要推导误差状态的观测方程。

将真实状态 $x_k = \hat x_k + \tilde x_k$ 代入观测方程：
$$
z_k = h(\hat x_k + \tilde x_k) + v_k
$$

对 $h(\hat x_k + \tilde x_k)$ 在 $\hat x_k$ 处进行泰勒展开：
$$
h(\hat x_k + \tilde x_k) \approx h(\hat x_k) + \frac{\partial h}{\partial x}\bigg|_{\hat x_k} \tilde x_k = h(\hat x_k) + H_k \tilde x_k
$$

其中 $H_k = \frac{\partial h}{\partial x}\bigg|_{\hat x_k}$ 是观测雅克比矩阵。

因此观测方程变为：
$$
z_k = h(\hat x_k) + H_k \tilde x_k + v_k \tag7
$$

定义观测残差（innovation）：
$$
\tilde z_k = z_k - h(\hat x_k) = H_k \tilde x_k + v_k \tag8
$$

这就是ESKF中用于更新的观测方程形式。



## Process

#### 1. Init

set everything to 0.

#### 2. Predict

运动更新与EKF一样，更新 $\hat x$
$$
\hat x_k^- = f(\hat x_{k-1}, u_k,0) \tag{10}
$$

EKF还需更新协方差矩阵，但ESCKF不用计算下面这一步
$$
P_k^- = F_{k}P_{k-1}F_{k}^T + Q
$$

#### 3. Update

首先，计算卡尔曼增益
$$
K_k = \tilde P_{k-1}^- H_k^T (H_k\tilde P_{k-1}^-H_k^T + R )^{-1} \tag {11}
$$

然后，观测更新，更新 $\tilde x$ :
$$
\begin{align}
\tilde x_{k} &= \tilde x_{k-1} + K_k(z_k - h(\hat x_k^-)) \tag {12}
\\
\tilde P_k &= (I-K_kH_k)\tilde P_{k-1}^- \tag{13}
\end{align}
$$
由于 $\tilde x_{k-1} = 0 $（为什么？答：每次将$\tilde x$叠加到 $\hat x$上面之后(即表达式15)，$\tilde x$就清0即可)，所以表达式12 可简化为
$$
\tilde x_{k} = K_k(z_k - h(\hat x_k^-)) \tag{14}
$$

这里需要注意的是：
- $z_k - h(\hat x_k^-)$ 就是观测残差（innovation），表示实际观测值与预测观测值的差异
- 由于误差状态在每次更新后都会被重置为0，所以 $\tilde x_{k-1} = 0$
- ESKF的核心思想是：先用nominal state进行预测，然后用error state进行修正

误差状态协方差矩阵的完整更新过程包括：

**预测步骤：**
$$
\tilde P_k^- = F_{k-1}\tilde P_{k-1}F_{k-1}^T + Q_{k-1} \tag{16}
$$

**更新步骤：**
$$
\tilde P_k = (I-K_kH_k)\tilde P_{k-1}^- \tag{13}
$$

这里 $F_{k-1}$ 是误差状态转移矩阵，$Q_{k-1}$ 是过程噪声协方差矩阵。

最后叠加
$$
\hat x_k :=  \hat x_k^-  + \tilde x_k \tag{15}
$$



Q1: 为什么不用计算 公式10 下面的那一条？

A1：在ESKF中，我们不需要为nominal state $\hat x$ 计算协方差矩阵，原因如下：

1. **分离设计思想**：ESKF将状态估计分为两部分：
   - Nominal state $\hat x$：负责主要的状态传播，不考虑不确定性
   - Error state $\tilde x$：专门处理所有的不确定性和误差

2. **协方差只属于误差状态**：所有的不确定性信息都由误差状态的协方差矩阵 $\tilde P$ 来表征，而nominal state被视为确定性的量。

3. **计算效率**：这种设计避免了对大维度nominal state协方差矩阵的计算和存储，特别是当状态包含四元数等约束量时。

4. **数值稳定性**：误差状态通常保持在较小的数值范围内，避免了大数值状态可能带来的数值问题。

因此，ESKF只需要计算和维护误差状态的协方差矩阵 $\tilde P$，这就是公式16所示的预测步骤。

# IMU Quaternion kinematics for ESKF

IMU ESKF理论总结（大多数VIO，INs 的基础）

refitem:

- Quaternion kinematics for the error-state Kalman filter. https://www.iri.upc.edu/people/jsola/JoanSola/objectes/notes/kinematics.pdf
- Indirect Kalman Filter for 3d Attitude Estimation http://mars.cs.umn.edu/tr/reports/Trawny05b.pdf
- OpenVINS https://docs.openvins.com/propagation.html#error_prop
- blog https://zhuanlan.zhihu.com/p/88756311

### Model

####　1.0 符号约定

[资料 Quaternion kinematics for the error-state Kalman filter](https://www.iri.upc.edu/people/jsola/JoanSola/objectes/notes/kinematics.pdf) 中的符号与本文前面的符号的对应：

- $x_t$ , 即前文 x：状态真值 True
- x , 即前文 $\hat x$ ：Nominal State
- $\delta x$ , 即前文 $\tilde x$ ：Error State

- $\dot x$ ：对时间的导数
- $\bar x$：归一化

#### 1.1 IMU Model

![[公式]](https://www.zhihu.com/equation?tex=%5Cbegin%7Bequation%7D+%09%5Cbegin%7Baligned%7D+%09%09%5Cboldsymbol%7B%5Comega%7D_m%28t%29+%26+%3D+%5Cboldsymbol%7B%5Comega%7D%28t%29+%2B+%5Cmathbf%7Bb%7D_%7Bg%7D%28t%29+%2B+%5Cmathbf%7Bn%7D_%7B%7Bg%7D%7D%28t%29+++++++++++++++++++++++++++++%5C%5C++%09%09%5Cmathbf%7Ba%7D_m%28t%29++++++++++%26+%3D+%5Cmathbf%7Ba%7D%28t%29+%2B+%7B%7D%5EI_G%5Cmathbf%7BR%7D%28t%29+%7B%5EG%5Cmathbf%7Bg%7D%7D+%2B+%5Cmathbf%7Bb%7D_%7Ba%7D%28t%29+%2B+%5Cmathbf%7Bn%7D_%7B%7Ba%7D%7D%28t%29++%09%5Cend%7Baligned%7D+%5Cend%7Bequation%7D)

Where 

- $\omega \ a$    are the true rotational velocity and translational acceleration in the IMU local frame $I$
- ![[公式]](https://www.zhihu.com/equation?tex=%5Cmathbf%7Bb%7D_%7Bg%7D) gyroscope bias
- ![[公式]](https://www.zhihu.com/equation?tex=%5Cmathbf%7Bb%7D_%7Ba%7D) accelerometer bias
- 两个bias 为随机游走过程, 对时间的导数为高斯白噪声，参见表达式2.6和2.7
- ![[公式]](https://www.zhihu.com/equation?tex=%5Cmathbf%7Bn%7D_%7B%7Ba%7D%7D) 和 ![[公式]](https://www.zhihu.com/equation?tex=%5Cmathbf%7Bn%7D_%7B%7Bg%7D%7D) 为观测噪声,属于高斯白噪声
-  ![[公式]](https://www.zhihu.com/equation?tex=%7B%5EG%5Cmathbf%7Bg%7D%7D) 是Global坐标系$G$ 下的重力 $[0,0,g=9.81]^T$ 
-  $R$   is the rotation matrix from global to IMU local frame

#### 1.2 状态向量

**IMU nominal state vector**
$$
\begin{align*} \mathbf
{x}_{IMU}(t) = 
\begin{bmatrix} 
^I_G\bar{q}(t) \\ 
^G\mathbf{p}_I(t) \\ 
^G\mathbf{v}_I(t)\\ 
\mathbf{b}_{\mathbf{g}}(t) \\ 
\mathbf{b}_{\mathbf{a}}(t) 
\end{bmatrix} _{16,1}
\end{align*} \tag {2.1}
$$

where:

- $^I_G\bar{q}(t) $   is the unit quaternion representing the rotation global to IMU frame
- $^G\mathbf{p}_I(t)$   is the position of IMU in global frame
- $^G\mathbf{v}_I(t)$  is the velocity of IMU in global frame
- $\mathbf{b}_{\mathbf{g}}(t)$  gyro bias
- $\mathbf{b}_{\mathbf{a}}(t)$  acc bias

**IMU error state vector**
$$
\begin{align*} \tilde{\mathbf{x}}_I(t) = \begin{bmatrix} ^I_G\tilde{\boldsymbol{\theta}}(t) \\ ^G\tilde{\mathbf{p}}_I(t) \\ ^G\tilde{\mathbf{v}}_I(t)\\ \tilde{\mathbf{b}}_{{g}}(t) \\ \tilde{\mathbf{b}}_{{a}}(t) \end{bmatrix} \end{align*}_{15,1} \tag {2.2}
$$
where:

- $^I_G\tilde{\boldsymbol{\theta}}(t)$ 是旋转误差状态，用3维向量表示（而不是4维四元数）
- $^G\tilde{\mathbf{p}}_I(t)$ 是IMU在全局坐标系下的位置误差
- $^G\tilde{\mathbf{v}}_I(t)$ 是IMU在全局坐标系下的速度误差  
- $\tilde{\mathbf{b}}_{{g}}(t)$ 是陀螺仪偏置误差
- $\tilde{\mathbf{b}}_{{a}}(t)$ 是加速度计偏置误差

**注意：** 误差状态向量的维度是15维，而nominal状态向量是16维。这是因为四元数的误差状态用3维的旋转向量表示，而不是4维的四元数。这样做的好处是：
1. 避免了四元数的约束问题（单位长度约束）
2. 误差状态的协方差矩阵是满秩的
3. 简化了雅克比矩阵的计算

**状态组合关系：**
对于旋转，真实状态与nominal状态和error状态的关系为：
$$
^I_G\bar{q}_{true} = ^I_G\bar{q} \otimes \delta q(\tilde{\boldsymbol{\theta}})
$$
其中 $\delta q(\tilde{\boldsymbol{\theta}})$ 是由旋转误差向量 $\tilde{\boldsymbol{\theta}}$ 构成的误差四元数。

对于其他状态（位置、速度、偏置），关系为简单的加法：
$$
\begin{align}
^G\mathbf{p}_{I,true} &= ^G\mathbf{p}_I + ^G\tilde{\mathbf{p}}_I \\
^G\mathbf{v}_{I,true} &= ^G\mathbf{v}_I + ^G\tilde{\mathbf{v}}_I \\
\mathbf{b}_{g,true} &= \mathbf{b}_g + \tilde{\mathbf{b}}_g \\
\mathbf{b}_{a,true} &= \mathbf{b}_a + \tilde{\mathbf{b}}_a
\end{align}
$$

refitem: [Quaternion kinematics for the error-state Kalman filter](https://www.iri.upc.edu/people/jsola/JoanSola/objectes/notes/kinematics.pdf) P52

<img src="/home/trifo/code/sync/DevelopmentNotes/img/Screenshot from 2021-09-18 13-42-04.png" alt="Screenshot from 2021-09-18 13-42-04" style="zoom:50%;" />

#### 1.3 状态微分

refitem: [IMU Kinematics](https://docs.openvins.com/propagation.html#imu_kinematic)

**true state kinematics**
$$
\begin{align}
^I_G\dot{\bar{q}}(t) &= \frac{1}{2} \begin{bmatrix} -\lfloor \boldsymbol{\omega}(t) \times \rfloor && \boldsymbol{\omega}(t) \\
-\boldsymbol{\omega}^\top(t) && 0 \end{bmatrix} {^{I_{t}}_{G}\bar{q}} \\
&=: \frac{1}{2} \boldsymbol{\Omega}(\boldsymbol{\omega}(t)) ^{I_{t}}_{G}\bar{q}
\tag {2.3} \\ 

^G\dot{\mathbf{p}}_I(t) &= ^G\mathbf{v}_I(t)
\tag {2.4} \\

^G\dot{\mathbf{v}}_I(t) &=\text{} ^{I_{t}}_G\mathbf{R}^\top \mathbf{a}(t) 
\tag {2.5} \\
\dot{\mathbf{b}}_{\mathbf{g}}(t) &= \mathbf{n}_{wg}
\tag {2.6} \\

\dot{\mathbf{b}}_{\mathbf{a}}(t) &= \mathbf{n}_{wa} 
\tag {2.7} \\

\end{align}
$$
Notice: where we have modeled the gyroscope and accelerometer biases as <u>random walk</u> and thus their time derivatives are white Gaussian. 



## MSCKF && S-MSCKF

A Multi-State Constraint Kalman Filter for Vision-aided Inertial Navigation 2007.

Robust Stereo Visual Inertial Odometry for Fast Autonomous Flight 2018.

refitem:

- MSCKF
  - paper: MSCKF [A Multi-State Constraint Kalman Filter for Vision-aided Inertial Navigation,2007,Mourikis](https://www-users.cse.umn.edu/~stergios/papers/ICRA07-MSCKF.pdf)

    paper: 2006预印版 https://intra.ece.ucr.edu/~mourikis/tech_reports/TR_MSCKF.pdf 

  - code: msckf_mono https://github.com/daniilidis-group/msckf_mono

- S-MSCKF
  - paper: S-MSCKF https://arxiv.org/pdf/1712.00036.pdf
  - code: msckf_vio https://github.com/KumarRobotics/msckf_vio

- report: https://apps.dtic.mil/sti/pdfs/AD1126850.pdf

- blog: https://zhuanlan.zhihu.com/p/76341809

  blog: https://zhuanlan.zhihu.com/p/76347723



### Basic Introduction

- MSCKF的目标是解决EKF-SLAM的维数爆炸问题

- 传统EKF-SLAM 的状态向量定义为
  $$
  x = [R \ M]^T \tag1
  $$
  其中 

  - R 为机体状态向量，即 当前时刻的(x,y,z,yaw,pitch,roll)

  - M 为地图状态向量，即 路标集合，或者理解为特征点构成的稀疏点云

- EKF-SLAM 的弊端：当环境很大时，特征点会非常多，状态向量维数会变得非常大。

- MSCKF 不将特征点加入到状态向量

- MSCKF 会缓存历史机体状态位姿 (位置 ![[公式]](https://www.zhihu.com/equation?tex=p)和姿态四元数 ![[公式]](https://www.zhihu.com/equation?tex=q))加入到状态向量，相当于
  $$
  x = [I_{mu} \ R_{k-n} \ ...R_{k-1} \ \ R_{k}]^T\tag 2
  $$

- 相机位姿的个数会远小于特征点的个数，MSCKF状态向量的维度相较EKF-SLAM大大降低

- 且历史的相机状态会不断移除，只维持固定个数的的相机位姿（Sliding Window），以降低后端的计算量 -> 维护一个pose的FIFO, 而EKF-SLAM 始终只保存最新pose。

- 特征点会被多个相机看到，从而在多个相机状态（Multi-State）之间形成几何约束（Constraint），进而利用几何约束构建观测模型对EKF进行update

- MSCKF使用的Kalman Filter壳子是 ES-KF，建议先了解ES-KF

