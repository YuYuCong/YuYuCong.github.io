---
layout: post
title: "三维刚体运动基础系列 之 欧拉角!"
subtitle: "欧拉角姿态表达，以及欧拉角微分推导"
categories: [Robotics]
tags: [pose]
header-img: "img/in-post/"
header-style: text
date: 2021.06.02
author: "CongYu"
---

>  DEMO

* Kramdown table of contents
{:toc .toc}

----

Created 2021.06.02 by Cong Yu; Last modified: 2021.06.02-v1.0.2

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

----

# Euler Angles

<p style="font-size:16px;color:#176;text-align:left;">References</p> 

- wolfram post https://mathworld.wolfram.com/EulerAngles.html
- MIT courseware [KINEMATICS OF MOVING FRAMES](https://ocw.mit.edu/courses/2-017j-design-of-electromechanical-robotic-systems-fall-2009/resources/mit2_017jf09_ch09/)
- post https://hideoninternet.github.io/2020/02/17/36f31d81/
- post https://blog.csdn.net/weixin_42927959/article/details/89880825
- post https://zhuanlan.zhihu.com/p/85108850
- blog [欧拉角微分方程的推导](https://blog.csdn.net/waihekor/article/details/104158772)
- book 惯性导航, 秦永元，p288.


### 1. 欧拉角

欧拉角有三个要素：
- 规定顺序
	- 本文约定 // the euler angle sequence (zyx, ypr, z->y->x, yaw->pitch->roll)
- 规定内旋外旋
	- 内旋
		- 也称为静态欧拉角
		- 每次旋转都是绕全局固定轴，即世界坐标系的轴旋转
	- 外旋
		- 也称为动态欧拉角
		- 每次旋转都是绕上一次旋转之后的轴
	- 通常使用的是动态欧拉角。本博客只讨论常用的动态欧拉角。
- 角度数值
	- 使用三个参数表达三维姿态 [yaw,pitch,roll]。数值范围都是-180到+180

### 2. 欧拉角表达姿态

- 欧拉角表达姿态时并不唯一
	- 三维中的任一姿态，都可以有<u>至少两种</u>欧拉角表达，第二个等于180°减去第一个。


### 3. 欧拉角表达旋转

Rotations with euler angle representation

- 欧拉角表达旋转时，直接求和或者做差即可。
- 比如：姿态1 （12°，100°，113°），姿态2（15°，108°，117°）
	- 两个姿态之间的旋转动作为 （3°，8°，4°）

### 4. 万向锁  gimbal lock 

理解万向锁需要注意以下关键点：（注意！下面这一部分理解透彻是非常重要的）

- 第一个关键点：注意欧拉角的旋转轴并不是正交的，从桁架系统这个机构去理解：
	- z轴其实永远是朝向正上方的
	- y轴其实永远在水平面里面
	- x轴可以出现在空间中的任意位置，但他永远在垂直于当时的y轴，在垂直于当时的yz轴平面的竖直平面里面
- 第二个关键点：理解万向锁，是要用delta_theta或者说多次旋转或者说从欧拉角微分的思路来理解自由度丢失和锁的概念的！！！
    - 或者说是从用欧拉角表达旋转  而不是 从用欧拉角表达姿态 这件事情来理解 锁 这个字。
    - 为什么一定是从转动的角度来思考？举个例子：相机的拍摄时候的运镜，游戏中人物的手臂的运动。
    - 我们需要的是：在任何一个姿态下，可以向任何另外一个姿态过渡。但是在万向锁姿态下，只有两个方向是可以微分的 （围绕y轴的微分 + 围绕xz轴的这两个重叠的微分）
- 第三个关键点：注意理解欧拉角的顺序。
	- 并不是说必须按照顺序依次做三个旋转，顺序颠倒也是可以的，但是注意耦合关系。
	- 先转哪个轴都可以，但是要确保确保转z轴的时候xy都会被带动，转y轴的时候x轴会被带动，转x轴的时候其他不动即可。
	- <u>与其说是欧拉角顺序，不如说是欧拉角父子关系。</u>

[euler_angle_description.excalidraw](Excalidraw/euler_angle_description.excalidraw.md)

<img src="https://raw.githubusercontent.com/YuYuCong/YuYuCong.github.io/develop/_posts/Excalidraw/euler_angle_description.excalidraw.png" alt="img" style="zoom:50%;" align='center' text ="euler_angle_description.excalidraw"/>

x与z重合时，绕z旋转等效于绕x旋转，就产生了万向锁。

### 5. 欧拉角表达下的陀螺仪积分

Gyro Integration with Euler Angles

#### 微分推导

Derivations

某姿态 
$$
R_n^b = R_2^b(\psi) \cdot R_1^2(\theta) \cdot R_n^1(\phi) \tag1
$$

其中$R_n^b$表示从n系（导航系）到b系（机体系）的旋转动作


注意直接微分并不等于陀螺仪的角速度测量值
$$
\left[
\begin{matrix} {\dot\psi_n} \ {\dot\theta_n}\ {\dot\phi_n} 
\end{matrix}
\right]^T \not= w_b \tag2
$$

原因：动态欧拉角的轴可能并不正交，是由当前姿态决定的。而IMU的瞬时测量值是在I系下测得的，是正交的。只有旋转轴和角速度轴重合的情况下才能积分。所以角速度需要被投影分解到相应的欧拉角旋转轴上面去才能积分。

可以理解为I系是附着在欧拉角的x轴上的！

todo(congyu) 图解

##### 投影步骤

Step 1. yaw旋转:旋转轴为$Z_n$轴，因此
$$
w_b(\psi) = R_2^n(\theta) \cdot R_2^1(\phi) \cdot
\left[
\begin{matrix} {\dot\psi_n} \ 0 \ 0 
\end{matrix}
\right]^T \tag{2}
$$
Step 2. pitch旋转:应该是做完yaw旋转之后的机体$Y_1$,
$$
w_b(\theta) =R_2^1(\phi) \cdot\left[
\begin{matrix} 
0 \ {\dot\theta_n} \ 0 
\end{matrix}
\right]^T \tag3
$$
Step 3. roll旋转:旋转轴重合，旋转轴是做完前两次旋转之后的机体的x轴，
$$
w_b(\theta) =\left[
\begin{matrix}
0 \ 0 \ \dot\phi 
\end{matrix}
\right]^T \tag{4}
$$
最后有
$$
w_b = w_b(\psi) + w_b(\theta) + w_b(\phi) 
\\
= R^b_{\dot\psi \dot\theta \dot\phi} w_n \tag5
$$
其中：$w_b$ 即陀螺仪数据

则可以求出$w_n$

$$
\left[
\begin{matrix} {\dot\psi_n} \ {\dot\theta_n}\ {\dot\phi_n} 
\end{matrix}
\right]^T := w_n  = (R^b_{\dot\psi \dot\theta \dot\phi}) ^ {-1} \cdot w_b \tag6
$$

然后对$w_n$积分即可得到正确的欧拉角。


##### 特别注意

- 万向锁：${\dot\psi_n} \ {\dot\theta_n}\ {\dot\phi_n}$ 在n系下并不正交，所以积分区间必须足够小。
- 万向锁：$\theta = ±90°$的时候，${\dot\psi_n} \ 与\ {\dot\phi_n}$ 旋转轴重合丧失一个自由度，yaw有无穷多解，故不可用于全角度姿态解算。


