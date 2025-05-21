---
layout: post
title: "三维刚体运动基础系列 之 旋转矩阵!"
subtitle: "旋转矩阵姿态表达，以及旋转矩阵微分推导"
categories: [Robotics]
tags: [pose]
header-img: "img/in-post/"
header-style: text
date: 2021.06.03
author: "CongYu"
---


>  DEMO

* Kramdown table of contents
{:toc .toc}

----

Created  2021.06.03 by Cong Yu; Last modified:  2021.06.03-v1.0.2

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

----


# Rotate Matrix

##### 约定

- robot坐标系  front  x, left  y, up  z
- 欧拉角顺序 zyx ypr yaw pitch roll
- $\Psi$ 方向或偏航 (heading or yaw)
- $\theta$  升降或俯仰 (elevation or pitch)
- $\phi$ 倾斜或横滚 (bank or roll)
- n系 导航坐标系
- b系 机体坐标系


## 1. 基本概念

### 1.1. 表达姿态

##### 2d姿态

$$
R\{\theta\} =
\begin{bmatrix}
\cos\theta & -\sin\theta \\
\sin\theta & \cos\theta
\end{bmatrix}
$$

- 2d旋转矩阵有4个数字，其实只有一个自由度


##### 3d姿态

3D旋转矩阵可以通过三个基本旋转矩阵的组合来表示，分别是绕X轴、Y轴和Z轴的旋转：

绕X轴旋转（Roll）：
$$
R_x(\phi) = 
\begin{bmatrix}
1 & 0 & 0 \\
0 & \cos\phi & -\sin\phi \\
0 & \sin\phi & \cos\phi
\end{bmatrix}
$$

绕Y轴旋转（Pitch）：
$$
R_y(\theta) = 
\begin{bmatrix}
\cos\theta & 0 & \sin\theta \\
0 & 1 & 0 \\
-\sin\theta & 0 & \cos\theta
\end{bmatrix}
$$

绕Z轴旋转（Yaw）：
$$
R_z(\psi) = 
\begin{bmatrix}
\cos\psi & -\sin\psi & 0 \\
\sin\psi & \cos\psi & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

完整的3D旋转矩阵可以通过这三个基本旋转矩阵的组合得到，例如按照ZYX顺序（先绕Z轴，再绕Y轴，最后绕X轴）：
$$
R = R_x(\phi)R_y(\theta)R_z(\psi)
$$

- 3D旋转矩阵有9个数字，但只有3个自由度
- 旋转矩阵是正交矩阵，满足 $R^T R = I$ 且 $\det(R) = 1$
- 旋转矩阵有 $R^{-1} = R^T$


### 1.2 位姿

$$
T = \begin{bmatrix}
R & t \\
0^T & 1
\end{bmatrix}
$$

## 2. 表达旋转

##### 姿态间的旋转

姿态R1到姿态R2的旋转动作有

$$
\begin{gather}
\\R_2 = R_1^2R_1
\\R_1^2 = R_2R_1^{-1}= R_2R_1^T
\end{gather}
$$

##### 点的旋转

$$
p_2 = R_1^2 p_1
$$

##### 逆变换

$$
R^{-1} = R^T
$$

$$
T^{-1} = \begin{bmatrix}
R^T & -R^Tt \\
0^T & 1
\end{bmatrix}
$$

##### 逆变换推导

$$
T = \begin{bmatrix} R & t \\ 0^T & 1\end{bmatrix}
$$

其中R为旋转矩阵，有特性 $R^{-1} = R^T$



线性代数公式：
$$
M = \begin{bmatrix} A & B \\ 0 & D \end{bmatrix}
$$
求逆
$$
M^{-1} = \begin{bmatrix} A^{-1} & -A^{-1}BD^{-1} \\ 0 & D^{-1} \end{bmatrix}
$$


所以
$$
T^{-1} = \begin{bmatrix} R^{-1} & -R^{-1}t \\ 0^T & 1 \end{bmatrix} = \begin{bmatrix} R^{T} & -R^{T}t \\ 0^T & 1 \end{bmatrix}
$$

$$
\begin{gather}
p_g = T_b^g p_b = Rp_b + t \\
p_b = R^{-1}(p_g - t) = R^T p_g - R^T t
\end{gather}
$$


##### 多次旋转

旋转叠加：左乘
$$
R_0^2 = R_1^2 R_0^1
$$

点的旋转叠加：左乘给一个点p表达坐标系变化之后该点的坐标
$$
\begin{align}
p_1 &= R_0^1 p_0 \\
p_2 &= R_1^2 p_1 \\
p_2 &= R_0^2 p_0 \\
\end{align}
$$


## 3. 旋转矩阵微分推导

对于旋转矩阵 $R(t)$，其导数满足：

$$
\dot{R}(t) = R(t)[\omega(t)]_\times
$$

其中 $\omega$ 是角速度向量，

其中 $[\omega(t)]_\times$ 是角速度向量 $\omega(t)$ 的反对称矩阵：

$$
[\omega]_\times = 
\begin{bmatrix}
0 & -\omega_z & \omega_y \\
\omega_z & 0 & -\omega_x \\
-\omega_y & \omega_x & 0
\end{bmatrix}
$$

这个方程的推导过程如下：

1) 考虑一个固定向量 $p$ 在旋转坐标系中的表示：
   - 在全局坐标系中：$p_g = R(t)p_b$
   - 其中 $p_b$ 是向量在旋转坐标系中的表示

2) 对时间求导：
   $$
   \dot{p}_g = \dot{R}(t)p_b
   $$

3) 另一方面，根据角速度的定义，固定向量在旋转坐标系中的变化率满足：
   $$
   \dot{p}_g = \omega(t) \times p_g = [\omega(t)]_\times p_g
   $$

4) 将 $p_g = R(t)p_b$ 代入上式：
   $$
   \dot{p}_g = [\omega(t)]_\times R(t)p_b
   $$

5) 联立两个表达式：
   $$
   \dot{R}(t)p_b = [\omega(t)]_\times R(t)p_b
   $$

6) 由于这个关系对任意 $p_b$ 都成立，因此：
   $$
   \dot{R}(t) = [\omega(t)]_\times R(t)
   $$

7) 最终得到旋转矩阵的微分方程：
   $$
   \dot{R}(t) = R(t)[\omega(t)]_\times
   $$

这个微分方程描述了旋转矩阵如何随时间演化，其中：
- $\omega(t)$ 是角速度向量
- $[\omega(t)]_\times$ 是角速度的反对称矩阵
- $R(t)$ 是旋转矩阵

这个方程是旋转矩阵积分的基础，它表明旋转矩阵的变化率与当前旋转矩阵和角速度有关。


##### 反对称矩阵性质

反对称矩阵具有以下性质：

1. 对于任意向量 $a, b \in \mathbb{R}^3$：
   $$
   [a]_\times b = a \times b
   $$

2. 反对称矩阵的幂：
   $$
   [\omega]_\times^2 = \omega\omega^T - \|\omega\|^2I
   $$

3. 反对称矩阵的指数映射：
   $$
   \exp([\omega]_\times) = I + \frac{\sin\|\omega\|}{\|\omega\|}[\omega]_\times + \frac{1-\cos\|\omega\|}{\|\omega\|^2}[\omega]_\times^2
   $$

##### 旋转矩阵的指数映射

旋转矩阵可以通过指数映射从李代数映射到李群：

$$
R = \exp([\omega]_\times)
$$

其中 $\omega$ 是旋转向量，其方向表示旋转轴，大小表示旋转角度。

##### 旋转矩阵的扰动

对于旋转矩阵 $R$，其扰动可以表示为：

$$
R' = R\exp([\delta\omega]_\times) \approx R(I + [\delta\omega]_\times)
$$

其中 $\delta\omega$ 是一个小扰动。

##### 旋转矩阵的复合导数

对于复合旋转 $R = R_1R_2$，其导数为：

$$
\dot{R} = \dot{R}_1R_2 + R_1\dot{R}_2
$$



## 4. 旋转矩阵表达下的陀螺仪积分

对于陀螺仪测量得到的角速度 $\omega(t)$，我们可以通过以下方式对旋转矩阵进行积分：

### 4.1. 连续时间下的积分：

对于旋转矩阵 $R(t)$，其导数满足：
$$
\dot{R}(t) = R(t)[\omega(t)]_\times
$$


对于微分方程 $\dot{R}(t) = R(t)[\omega(t)]_\times$，有积分：

解析解（当角速度为常数时）：
   - 如果角速度 $\omega$ 在时间间隔 $[t_0, t]$ 内为常数
   - 则解为：$R(t) = R(t_0)\exp([\omega(t-t_0)]_\times)$
   - 其中 $\exp([\omega(t-t_0)]_\times)$ 可以通过 Rodrigues 公式计算

### 4.2. 离散时间下的积分：
$$
R_{k+1} = R_k \exp([\omega_k \Delta t]_\times)
$$

其中：
- $R_k$ 是当前时刻的旋转矩阵
- $\omega_k$ 是当前时刻测量的角速度
- $\Delta t$ 是采样时间间隔
- $\exp([\omega_k \Delta t]_\times)$ 可以通过 Rodrigues 公式计算：
  $$
  \exp([\omega \Delta t]_\times) = I + \frac{\sin\|\omega \Delta t\|}{\|\omega \Delta t\|}[\omega]_\times + \frac{1-\cos\|\omega \Delta t\|}{\|\omega \Delta t\|^2}[\omega]_\times^2
  $$

实际应用中，当角速度较小时，可以使用一阶近似：
$$
R_{k+1} \approx R_k(I + [\omega_k \Delta t]_\times)
$$

数值积分方法：

   a) 欧拉法（一阶方法）：
   $$
   R_{k+1} = R_k(I + [\omega_k \Delta t]_\times)
   $$
   - 优点：计算简单
   - 缺点：精度较低，误差随 $\Delta t$ 线性增长

   b) 中点法（二阶方法）：
   $$
   \begin{align}
   \omega_{mid} &= \frac{\omega_k + \omega_{k+1}}{2} \\
   R_{k+1} &= R_k\exp([\omega_{mid} \Delta t]_\times)
   \end{align}
   $$
   - 优点：精度更高，误差随 $\Delta t^2$ 增长
   - 缺点：需要两次角速度测量

   c) 四阶龙格库塔法（RK4）：
   $$
   \begin{align}
   k_1 &= [\omega_k]_\times R_k \\
   k_2 &= [\omega_{k+1/2}]_\times(R_k + \frac{\Delta t}{2}k_1) \\
   k_3 &= [\omega_{k+1/2}]_\times(R_k + \frac{\Delta t}{2}k_2) \\
   k_4 &= [\omega_{k+1}]_\times(R_k + \Delta t k_3) \\
   R_{k+1} &= R_k + \frac{\Delta t}{6}(k_1 + 2k_2 + 2k_3 + k_4)
   \end{align}
   $$
   - 优点：精度最高，误差随 $\Delta t^4$ 增长
   - 缺点：计算量最大，需要多次角速度测量

实际应用建议：
   - 对于高精度要求：使用 RK4 方法
   - 对于实时性要求：使用欧拉法或中点法
   - 采样率越高，积分精度越好
   - 注意保持旋转矩阵的正交性，可以通过 Gram-Schmidt 正交化进行修正


## 5. 常用代码块

### 使用

```c++
// bot pose in global frame
Eigen::Matrix4d bot_T_global_; 

// 初始化 与 set
const Eigen::Matrix3d &camera_matrix;
const Eigen::Vector3d &trans;
bot_T_global_ = Eigen::Matrix4d::Identity();  
bot_T_global_.block<3, 3>(0, 0) = rotation_matrix;  
bot_T_global_.topRightCorner(3, 1) = trans;

// get
Eigen::Matrix3d GetPoseRotate() const {
  return Eigen::Matrix3d(bot_T_global_.block<3, 3>(0, 0));  
}  
Eigen::Vector3d GetPoseTrans() const {
  return bot_T_global_.topRightCorner(3, 1);  
}

// trans a point from bot frame to global frame
// p_g = T * p_b  
Eigen::Vector3d p_global =  
    (bot_T_global * Eigen::Vector4d(p_bot.x(), p_bot.y(),  
                                    p_bot.z(), 1.0))  
        .head(3);

// trans a point from global frame to bot frame
// p_b = T_inv * p_g  
// T_inv = [ R^T  -R^T * t  
//           0^T      1   ]  
Eigen::Vector3d p_bot =  
    (bot_T_global.inverse() * Eigen::Vector4d(p_global.x(),  
                                              p_global.y(),  
                                              p_global.z(), 1.0))  
        .head(3);

```

### 互相转换

RotateMatrix 转 AngleAxisd

```c++
const Eigen::Matrix3d rotation_matrix;
Eigen::AngleAxisd rotate_angle_axis(rotation_matrix);
LOG(ERROR) << "pose:\n"  
           << "rvec:axis:" << rotate_angle_axis.axis().transpose() 
           << "angle:" << rotate_angle_axis.angle() << "\n"
```

AngleAxisd 转 RotateMatrix 

```c++  
Eigen::Vector3d rotate_vector(rvec[0], rvec[1], rvec[2]);
Eigen::Vector3d rotate_axis = rotate_vector.normalized();  
double rotate_angle = rotate_vector.norm();
auto rotate_angle_axis = Eigen::AngleAxisd(rotate_angle, 
										   rotate_axis);  

Eigen::Matrix4d bot_T_global = Eigen::Matrix4d::Identity();  
bot_T_global.block<3, 3>(0, 0) = rotate_angle_axis.toRotationMatrix();
```

RotateMatrix 转 EulerAngles

```c++

/**
 * @brief Euler2RotationMatrix 欧拉角转旋转矩阵
 * @param Eigen::Vector3d eular_angle zyx ypr yaw,pitch,roll
 * @retval Eigen::Matrix3d RotationMatrix
 */
Eigen::Matrix3d Euler2RotationMatrix(const double yaw, const double pitch,
                                     const double roll) {
  Eigen::AngleAxisd yawAngle(yaw, Eigen::Vector3d::UnitZ());
  Eigen::AngleAxisd pitchAngle(pitch, Eigen::Vector3d::UnitY());
  Eigen::AngleAxisd rollAngle(roll, Eigen::Vector3d::UnitX());
  Eigen::Quaterniond q = yawAngle * pitchAngle * rollAngle;
  Eigen::Matrix3d R = q.matrix();
  std::cout << "Euler2RotationMatrix result is:" << std::endl;
  std::cout << "R = " << std::endl << R << std::endl << std::endl;
  return R;
}

/**
 * @brief RotationMatrix2Euler 旋转矩阵转欧拉角
 * @param Eigen::Matrix3d
 * @retval Eigen::Vector3d eular_angle zyx ypr yaw,pitch,roll
 */
Eigen::Vector3d RotationMatrix2Euler(Eigen::Matrix3d R) {
  Eigen::Matrix3d m;
  m = R;
  Eigen::Vector3d euler = m.eulerAngles(2, 1, 0); // zyx ypr yaw,pitch,roll
  std::cout << "RotationMatrix2Euler result is:" << std::endl;
  std::cout << "z,yaw = " << euler[0] << std::endl;   // z,yaw
  std::cout << "y,pitch = " << euler[1] << std::endl; // y,pitch
  std::cout << "x,roll = " << euler[2] << std::endl;  // x,roll
  std::cout << std::endl;

  // radian to angle
  std::cout << "z,yaw = " << euler[0] * (180.0 / M_PI) << "deg" << std::endl;
  std::cout << "y,pitch = " << euler[1] * (180.0 / M_PI) << "deg" << std::endl;
  std::cout << "x,roll = " << euler[2] * (180.0 / M_PI) << "deg" << std::endl;
  std::cout << std::endl;

  return euler;
}

```


