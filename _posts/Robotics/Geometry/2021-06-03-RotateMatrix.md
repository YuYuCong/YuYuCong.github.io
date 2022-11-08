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


## Rotate Matrix

// todo(congyu)


2D 

$$
R\{\theta\} =
\begin{bmatrix}
cos\theta & -sin\theta \\
sin\theta & cos\theta
\end{bmatrix}
$$

$$
T = \begin{bmatrix}
R & t \\
0^T & 1
\end{bmatrix}
$$
逆变换时
$$
T^` = \begin{bmatrix}
R^T & -R^Tt \\
0^T & 1
\end{bmatrix}
$$

多次旋转

$$
\begin{align}
p_1 &= R_0^1 p_0 \\
p_2 &= R_1^2 p_1 \\
R_0^2 &= R_1^2 R_0^1
\end{align}
$$


#### 李代数 旋转求导

learning_vio L1 p29

todo(congyu)

泊松公式

反对称算子

SO3 SE3

## 常用代码块

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


逆变换

// todo(congyu)

$$
T = \begin{bmatrix} R & t \\ 0^T & 1\end{bmatrix}
$$

其中R为旋转矩阵，有特性 $R^{-1} = R^T$



线性代数：
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
p_g = T_b^g p_b = Rp_b + t \\
p_b = R^{-1}(p_g - t) = R^T p_g - R^T t
$$



