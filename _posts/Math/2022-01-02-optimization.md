---
layout: post
title: "优化理论"
subtitle: "详细解读常用的数值优化方法，如：梯度下降，高速牛顿，以及LevenbergMarquardt等"
categories: [SLAM]
tags: [SLAM, Optimal, Math]
header-img: "img/in-post/post-optimal/post-bg-1.png"
header-style: img
date: 2022.01.01
author: "CongYu"
---

>  优化相关笔记。非线性优化方法的原理与公式推导，另有python代码示例。梯度下降，(批量，全量，随机)梯度下降，牛顿法。以及适用于最小二乘优化问题的高斯牛顿法，LevenbergMarquardt等方法。

* Kramdown table of contents
{:toc .toc}

----

Created 2021.03.22 by Cong Yu; Last modified: 2024.06.22-v4.3.2

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2024 Cong Yu. Some rights reserved.

----

# 优化

<p style="font-size:16px;color:#176;text-align:left;">References</p> 

- book [[METHODS-FOR-NON-LINEAR-LEAST-SQUARES-PROBLEMS.pdf]]
- post https://www.cnblogs.com/d1012181765/p/13841903.html
- book [Math_Convex-Optimization凸优化中文版](Math/Math_Convex-Optimization凸优化中文版.pdf)
- paper [An overview of gradient descent optimization algorithms](http://arxiv.org/abs/1609.04747)
- post [https://blog.csdn.net/shuzfan/article/details/75675568](https://blog.csdn.net/shuzfan/article/details/75675568)
- paper [http://cn.arxiv.org/pdf/1705.08292.pdf](http://cn.arxiv.org/pdf/1705.08292.pdf)
- Course [https://www.stat.cmu.edu/~ryantibs/convexopt/](https://www.stat.cmu.edu/~ryantibs/convexopt/)
- post [https://lumingdong.cn/summary-of-gradient-descent-algorithm.html#%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D%E7%9C%9F%E6%AD%A3%E7%9A%84%E8%BD%A8%E8%BF%B9](https://lumingdong.cn/summary-of-gradient-descent-algorithm.html#%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D%E7%9C%9F%E6%AD%A3%E7%9A%84%E8%BD%A8%E8%BF%B9)


## 1. 优化问题

##### 1.0 问题分类

[2022-01-01-optimization-map](Math/2022-01-01-optimization-map.canvas)

- 无约束 vs. 有约束 
- 连续优化 vs. 离散优化
- 线性 vs. 非线性
- 凸优化 vs. 非凸优化
- 全局最优 vs. 局部最优

- 无约束优化问题可以是全局优化的，也可以是局部优化的
- 有约束优化问题也可以是全局优化的，也可以是局部优化的
- <u>最小二乘问题是凸优化问题的一个特例</u>
- <u>线性规划问题是凸优化问题的一个特例</u>

---

##### 1.1 无约束优化问题

无约束优化问题：一个代价函数  cost function: $F：\mathbf{R} ^{n} \mapsto \mathbf{R}$，寻找一个$\mathbf{x}^+$ ，得到最小的F(x)值。

F(x) 称为目标函数，或者代价函数。

该 $\mathbf{x}^+$  称为解。

$$
\begin{align}
& \textrm{Given   }F：\mathbf{R} ^{n} \mapsto \mathbf{R} \\ 
& \textrm{Find } \mathbf{x}^+ = \textrm {argmin}_\mathbf{x} \{F(x)\}. \\
\end{align}
$$




##### 1.2 有约束优化问题

有约束的优化问题：对x的取值范围，或者以某种方法对x的取值有一定要求的约束问题。

- 约束x的取值范围可以直接定义 $x \in \mathbf{R}$
- 约束函数：其他约束x的取值的方法有 约束函数，$f_i(x) \leq b_i, i = 1,...,m$
- 约束函数的具体表达形式可以和目标函数的表达形式相同，此时相当于限制因变量的可能范围
- 约束边界：常量 $b_1,...b_m$ 称为对应约束函数的约束边界

有约束全局优化问题：

$$
\begin{align}
& \textrm{Given   }F：\mathbf{R} ^{n} \mapsto \mathbf{R} \\ 
& \textrm{Find } \mathbf{x}^+ = \textrm {argmin}_\mathbf{x} \{F(x)\}. \\
& \textrm{subject to } f_i(x) \leq b_i, i = 1,...,m. 
\end{align}
$$

---

##### 1.3 全局优化问题

全局优化问题的定义： 在x的取值范围内，找到F的全局最小值。

无约束全局优化问题的表达形式：

Definition 1.2. Global Minimizer

$$
\begin{align}
& \textrm{Given }F：\mathbf{R} ^{n} \mapsto \mathbf{R}. \\ 
& \textrm{ Find } \mathbf{x}^+ = \textrm {argmin}_\mathbf{x} \{F(x)\}.
\end{align}
$$


#####  1.4 局部优化问题

局部优化问题的定义：在x的取值范围内，找到初值$x_0$附近的F的某个局部最小值即可。

无约束局部优化问题的表达形式：

Definition 1.3. Local Minimizer


$$
\begin{align}
& \textrm{Given   }F：\mathbf{R} ^{n} \mapsto \mathbf{R}. \\ 
& \textrm{ Find } \mathbf{x}^+ \textrm{, so that } F(\mathbf{x}^+) \leq F(\mathbf{x})  \textrm{ for } ||\mathbf{x} - \mathbf{x}^+|| < \delta.
\end{align}
$$

初始值的选择对局部优化方法的求解至关重要。

---

##### 1.5 线性优化

<mark style="background: #FF5582A6;">线性函数</mark>： 对于任意的 $x,y \in \mathbf{R}^n$ 和 $\alpha, \beta \in \mathbf{R}$ ，有下述等式成立 $f(\alpha x + \beta y) = \alpha f(x) + \beta f(y)$ 。

线性优化：目标函数$F$和约束函数$f_i(x)$都是线性函数的一类优化问题。

问题的表达形式：

$$
\begin{align}
& \text {minimize} \quad c^Tx \\
& \text {subject to} \quad a_i^Tx \leq b_i, i=1,...,m.
\end{align}
$$

##### 1.6 非线性优化

如果优化问题不是线性的，就称为非线性规划。

非线性规划问题的研究主要关注在局部最优化问题的求解上。

##### 1.7 凸优化问题

[2022-01-03-凸优化](Math/2022-01-03-凸优化.md)


$$
\begin{align}
& \textrm{Given   }F：\mathbf{R} ^{n} \mapsto \mathbf{R} \\ 
& \textrm{Find } \mathbf{x}^+ = \text {argmin}_\mathbf{x} \{F(x)\}. \\
& \textrm{subject to } f_i(x) \leq b_i, i = 1,...,m. 
\end{align}
$$

且其中目标函数  $F$   和约束函数 $f_i(x)$ 都是凸函数


<mark style="background: #FF5582A6;">凸函数</mark>： 对于任意的 $x,y \in \mathbf{R}^n$，任意 $\alpha, \beta \in \mathbf{R}$ 且满足 $\alpha + \beta = 1, \alpha \geq 0, \beta \geq 0$ ，下述不等式成立 $f(\alpha x + \beta y) \leq \alpha f(x) + \beta f(y)$ 。

比较线性函数和凸函数，可以发现凸函数仅仅需要在 $\alpha$ 和 $\beta$ 取特定数值的情况下满足不等式，而线性需要严格满足等式。

- 可见 <u>线性规划问题是凸优化问题的一个特例</u>，且线性规划是广泛应用的一类凸优化问题。
- <u>线性函数一定是是凸函数</u>。 
- <u>非线性函数可能是凸函数，也可能是非凸的</u>。 
- 凸优化问题的求解已经有了非常成熟的解法，所以本文主要关注于凸优化。


##### 1.8 最小二乘问题

[2022-01-04-最小二乘](Math/2022-01-04-最小二乘.md)

## 2. 凸集

### 2.1 仿射集合和凸集

直线与线段

仿射集合

凸集

锥

### 2.2 重要例子

todo(congyu)

### 2.3 保凸运算

交集

仿射函数

线性分布及透视函数


### 2.4 广义不等式

正常锥和广义不等式

最小与极小元

### 2.5 分离与支撑超平面

超平面分离定理

逆定理

支撑超平面

### 2.6 对偶锥与广义不等式

对偶锥

对偶不等式

## 3. 凸函数

### 3.1 凸函数基本性质

定义描述：

函数 $f : R^n \to R$ 是凸的，如果 $\text{dom}\ f$ 是凸集，且对于任意 $x, y \in \text{dom \ f}$ 和

TODO(congyu)

由仿射函数衍生而来

一阶条件描述：

P63


二阶条件描述：

P64


### 3.2 保凸运算

P73

保持函数凸性或者凹性的运算。

### 3.3 共轭函数

### 3.4 拟凸函数

### 3.5 对数-凹函数和对数-凸函数

### 3.6 广义不等式的凸性





------
## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)


