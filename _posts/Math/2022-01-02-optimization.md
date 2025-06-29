---
layout: post
title: 优化理论基础
subtitle: 介绍优化问题的常见类型，凸集，凸函数等相关数理
categories:
  - Math
tags:
  - Optimal
  - Math
header-img: img/in-post/post-optimal/post-bg-1.png
header-style: img
date: 2022.01.01
author: CongYu
---

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

---

##### 1.1 无约束优化问题

无约束优化问题：一个代价函数  cost function: $F：\mathbb{R} ^{n} \mapsto \mathbb{R}$，寻找一个$\mathbf{x}^+$ ，使得$F(\mathbf x)$最小。

$F(\mathbf x)$ 称为目标函数，或者代价函数。

该 $\mathbf{x}^+$  称为解。

$$
\begin{align}
& \textrm{Given   }F：\mathbb{R} ^{n} \mapsto \mathbb{R} \\ 
& \textrm{Find } \mathbf{x}^+ = \textrm {argmin}_\mathbf{x} F(\mathbf x) \\
\end{align}
$$




##### 1.2 有约束优化问题

有约束的优化问题：对x的取值范围，或者以某种方法对x的取值有一定要求的约束问题。

- 约束函数：$f_i(x) \leq b_i, i = 1,...,m$
- 约束函数的具体表达形式可以和目标函数的表达形式相同，此时相当于限制因变量的可能范围
- 约束边界：常量 $b_1,...b_m$ 称为对应约束函数的约束边界

有约束优化问题：

$$
\begin{align}
& \textrm{Given   }F：\mathbb{R} ^{n} \mapsto \mathbb{R} \\ 
& \textrm{Find } \mathbf{x}^+ = \textrm {argmin}_\mathbf{x} F(\mathbf x) \\
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
& \textrm{Given }F：\mathbb{R} ^{n} \mapsto \mathbb{R} \\ 
& \textrm{ Find } \mathbf{x}^+ = \textrm {argmin}_\mathbf{x} F(\mathbf x)
\end{align}
$$


#####  1.4 局部优化问题

局部优化问题的定义：在x的取值范围内，找到初值$x_0$附近一个范围内的F的某个局部最小值即可。

局部优化问题的表达形式：

Definition 1.3. Local Minimizer


$$
\begin{align}
& \textrm{Given   }F：\mathbb{R} ^{n} \mapsto \mathbb{R} \\ 
& \textrm{ Find } \mathbf{x}^+ \textrm{, so that } F(\mathbf{x}^+) \leq F(\mathbf{x})  \textrm{ for } \|\mathbf{x} - \mathbf{x}^+\| < \delta.
\end{align}
$$

初始值的选择对局部优化方法的求解至关重要。

---

##### 1.5 线性优化

<mark style="background: #FF5582A6;">线性函数</mark>： 对于任意的 $x,y \in \mathbb{R}^n$ 和 $\alpha, \beta \in \mathbb{R}$ ，有下述等式成立 $f(\alpha x + \beta y) = \alpha f(x) + \beta f(y)$ 。

线性优化：目标函数$F$和约束函数$f_i(x)$都是线性函数的一类优化问题。

问题的表达形式：

$$
\begin{align}
& \text {minimize} \quad c^Tx \\
& \text {subject to} \quad a_i^Tx \leq b_i, i=1,...,m.
\end{align}
$$

##### 1.6 非线性优化


$$
\begin{align}
& \textrm{Given   }F：\mathbb{R} ^{n} \mapsto \mathbb{R} \\ 
& \textrm{Find } \mathbf{x}^+ = \text {argmin}_\mathbf{x} F(\mathbf x) \\
& \textrm{subject to } f_i(x) \leq b_i, i = 1,...,m. 
\end{align}
$$

且其中目标函数  $F$  是非线性函数，且任一约束函数 $f_i(x)$ 是非线性函数

非线性函数：存在x、y、a、b，使得 $f(\alpha x + \beta y) \neq \alpha f(x) + \beta f(y)$


##### 1.7 凸优化问题

[2022-01-03-凸优化](Math/2022-01-03-凸优化.md)


$$
\begin{align}
& \textrm{Given   }F：\mathbb{R} ^{n} \mapsto \mathbb{R} \\ 
& \textrm{Find } \mathbf{x}^+ = \text {argmin}_\mathbf{x} F(\mathbf x) \\
& \textrm{subject to } f_i(x) \leq b_i, i = 1,...,m. 
\end{align}
$$

且其中目标函数  $F$   和约束函数 $f_i(x)$ 都是凸函数


<mark style="background: #FF5582A6;">凸函数</mark>： 对于任意的 $x,y \in \mathbb{R}^n$，任意 $\alpha, \beta \in \mathbb{R}$ 且满足 $\alpha + \beta = 1, \alpha \geq 0, \beta \geq 0$ ，下述不等式成立 $f(\alpha x + \beta y) \leq \alpha f(x) + \beta f(y)$ 。

比较线性函数和凸函数，可以发现凸函数仅仅需要在 $\alpha$ 和 $\beta$ 取特定数值的情况下满足不等式，而线性需要严格满足等式。

- 可见 <u>线性优化问题是凸优化问题的一个特例</u>，且是广泛应用的一类凸优化问题。
- <u>线性函数一定是是凸函数</u>。 
- <u>非线性函数可能是凸函数，也可能是非凸的</u>。 
- 凸优化问题的求解已经有了非常成熟的解法，所以本文主要关注于凸优化。


##### 1.8 最小二乘问题

[2022-01-04-最小二乘优化](Math/2022-01-04-最小二乘优化.md)


$$
\begin{align}
& \textrm{Given   }F：\mathbb{R} ^{n} \mapsto \mathbb{R} \\ 
& \textrm{Find } \mathbf{x}^+ = \text {argmin}_\mathbf{x} F(\mathbf x)
\end{align}
$$

其中 $F$ 具有形式：

$$
F(\mathbf x)= \frac{1}{2}\sum_{i=1}^{m} ( f_{i}( \mathbf{x} ) )^2
$$
其中 $f_i(\mathbf{x})$ 具有形式：

$$f_i(\mathbf{x}) = h(\mathbf x,t_i)-y_i$$

$h (\mathbf x,t)$ 即预测方程 hypothesis_func，被拟合的函数。

$t$即数据集中的输入，$y$ 即数据集中的拟合目标label。$f$即残差。m即样本数。n即输入数据$t$的维度。

优化目标是 $h(\mathbf x,t)$ 中的参数 $\mathbf x$ 。


##### 1.9 线性最小二乘

$$
\begin{align}
& \textrm{Given   }F：\mathbb{R} ^{n} \mapsto \mathbb{R} \\ 
& \textrm{Find } \mathbf{x}^+ = \text {argmin}_\mathbf{x} F(\mathbf x)
\end{align}
$$

其中 $F$ 具有形式：

$$
F(\mathbf x)= \frac{1}{2}\sum_{i=1}^{m} ( f_{i}( \mathbf{x} ) )^2
$$

其中 $f_i(\mathbf{x})$ 具有形式：

$$f_i(\mathbf{x}) = h(\mathbf x,t_i) - y_i = t_i \mathbf x -y_i$$
即 $h(\mathbf x,t)$ 是线性函数。


##### 1.10 非线性最小二乘

即 预测函数 $h(\mathbf x,t)$是非线性函数


## 2. 凸集

### 2.1 仿射集合和凸集

#### 直线与线段

在介绍仿射集合和凸集之前，我们先回顾直线和线段的概念：

- **直线**：通过两点 $x_1, x_2 \in \mathbb{R}^n$ 的直线可以表示为：
  $$\{x \mid x = \theta x_1 + (1-\theta) x_2, \theta \in \mathbb{R}\}$$

- **线段**：连接两点 $x_1, x_2 \in \mathbb{R}^n$ 的线段可以表示为：
  $$\{x \mid x = \theta x_1 + (1-\theta) x_2, \theta \in [0,1]\}$$

#### 仿射集合

**定义**：集合 $C \subseteq \mathbb{R}^n$ 是仿射集合，当且仅当对于任意 $x_1, x_2 \in C$ 和任意实数 $\theta$，都有：
$$\theta x_1 + (1-\theta) x_2 \in C$$

换句话说，仿射集合包含通过其中任意两点的整条直线。

**仿射组合**：点 $x_1, x_2, ..., x_k$ 的仿射组合是指形如：
$$\theta_1 x_1 + \theta_2 x_2 + ... + \theta_k x_k$$
的点，其中 $\theta_1 + \theta_2 + ... + \theta_k = 1$。

仿射集合等价于包含其中任意有限个点的所有仿射组合的集合。

**性质**：
- 仿射集合的交集仍是仿射集合
- 仿射变换 $f(x) = Ax + b$ 保持仿射性
- 任何仿射集合都可以表示为某个子空间的平移：$C = V + x_0$，其中 $V$ 是子空间

**常见例子**：
1. **空集** $\emptyset$ 和 **单点集** $\{x_0\}$
2. **直线**：$\{x \mid x = x_0 + t v, t \in \mathbb{R}\}$，其中 $v \neq 0$
3. **超平面**：$\{x \mid a^T x = b\}$，其中 $a \neq 0$
4. **子空间**：通过原点的仿射集合
5. **整个空间** $\mathbb{R}^n$

#### 凸集

**定义**：集合 $C \subseteq \mathbb{R}^n$ 是凸集，当且仅当对于任意 $x_1, x_2 \in C$ 和任意 $\theta \in [0,1]$，都有：
$$\theta x_1 + (1-\theta) x_2 \in C$$

换句话说，凸集包含连接其中任意两点的线段。

**凸组合**：点 $x_1, x_2, ..., x_k$ 的凸组合是指形如：
$$\theta_1 x_1 + \theta_2 x_2 + ... + \theta_k x_k$$
的点，其中 $\theta_i \geq 0$ 且 $\theta_1 + \theta_2 + ... + \theta_k = 1$。

凸集等价于包含其中任意有限个点的所有凸组合的集合。

**性质**：
- 凸集的交集仍是凸集
- 仿射变换保持凸性
- 凸组合保持凸性
- 凸集在优化问题中具有良好的性质

**常见例子**：
1. **空集** $\emptyset$、**单点集** $\{x_0\}$ 和 **整个空间** $\mathbb{R}^n$
2. **范数球**：$\{x \mid \|x - x_c\| \leq r\}$
3. **椭球**：$\{x \mid (x-x_c)^T P^{-1} (x-x_c) \leq 1\}$，其中 $P \succ 0$
4. **多面体**：$\{x \mid Ax \leq b, Cx = d\}$
5. **半空间**：$\{x \mid a^T x \leq b\}$
6. **单纯形**：$\{x \mid x \geq 0, \mathbf{1}^T x = 1\}$

#### 仿射集合与凸集的关系

**包含关系**：每个仿射集合都是凸集，即：
$$\text{仿射集合} \subseteq \text{凸集}$$

这是因为仿射集合的定义条件比凸集更强（$\theta$ 可以是任意实数 vs $\theta \in [0,1]$）。

**区别**：
- **参数范围**：仿射集合允许 $\theta \in \mathbb{R}$，凸集要求 $\theta \in [0,1]$
- **几何直观**：仿射集合包含整条直线，凸集只需包含线段
- **典型例子**：圆盘是凸集但不是仿射集合；直线既是仿射集合也是凸集

#### 锥

**定义**：集合 $C$ 是锥（或非负齐次），如果对于任意 $x \in C$ 和 $\theta \geq 0$，都有 $\theta x \in C$。

**凸锥**：既是凸集又是锥的集合。等价地，集合 $C$ 是凸锥当且仅当对于任意 $x_1, x_2 \in C$ 和 $\theta_1, \theta_2 \geq 0$，都有：
$$\theta_1 x_1 + \theta_2 x_2 \in C$$

**常见例子**：
1. **非负象限**：$\mathbb{R}_+^n = \{x \mid x_i \geq 0, i = 1,...,n\}$
2. **二阶锥**：$\{(x,t) \mid \|x\| \leq t\}$
3. **半正定锥**：$S_+^n = \{X \in S^n \mid X \succeq 0\}$



### 2.3 保凸运算

保凸运算是指在凸集上进行某些运算后，结果仍然是凸集的运算。这些运算在凸优化理论中非常重要，因为它们允许我们从简单的凸集构造复杂的凸集。

#### 交集

**定理**：任意多个凸集的交集仍然是凸集。

**数学表述**：如果 $C_i$ 对所有 $i \in I$（$I$ 为任意指标集）都是凸集，那么：
$$\bigcap_{i \in I} C_i \text{ 是凸集}$$

**证明思路**：设 $x, y \in \bigcap_{i \in I} C_i$，则对所有 $i$，都有 $x, y \in C_i$。由于每个 $C_i$ 都是凸集，所以对任意 $\theta \in [0,1]$，都有 $\theta x + (1-\theta) y \in C_i$，因此 $\theta x + (1-\theta) y \in \bigcap_{i \in I} C_i$。

**重要应用**：
- **多面体**：$\{x \mid id Ax \leq b\} = \bigcap_{i=1}^m \{x \mid a_i^T x \leq b_i\}$
- **椭球交集**：多个椭球的交集
- **约束集合**：优化问题中的可行域通常是多个约束集合的交集

**注意**：凸集的并集一般不是凸集。

#### 仿射函数

**定理**：仿射函数保持凸性。

**仿射函数**：函数 $f: \mathbb{R}^n \to \mathbb{R}^m$ 是仿射的，如果它具有形式：
$$f(x) = Ax + b$$
其中 $A \in \mathbb{R}^{m \times n}$，$b \in \mathbb{R}^m$。

**保凸性质**：
1. **像集**：如果 $C \subseteq \mathbb{R}^n$ 是凸集，那么 $f(C) = \{f(x) \mid x \in C\}$ 是凸集
2. **原像集**：如果 $D \subseteq \mathbb{R}^m$ 是凸集，那么 $f^{-1}(D) = \{x \mid f(x) \in D\}$ 是凸集

**常见例子**：
- **缩放和平移**：$f(x) = ax + b$
- **投影**：$f(x_1, x_2) = x_1$
- **和**：$f(x_1, x_2) = x_1 + x_2$
- **线性变换**：$f(x) = Ax$

**应用**：
- 线性规划的可行域
- 仿射变换后的凸集
- 降维投影

#### 线性分式函数

**定义**：函数 $f: \mathbb{R}^n \to \mathbb{R}^m$ 是线性分式的，如果它具有形式：
$$f(x) = \frac{Ax + b}{c^T x + d}$$
其中 $A \in \mathbb{R}^{m \times n}$，$b \in \mathbb{R}^m$，$c \in \mathbb{R}^n$，$d \in \mathbb{R}$，且定义域为 $\{x \mid id c^T x + d > 0\}$。

**保凸性质**：线性分式函数保持凸性（在其定义域内）。

#### 透视函数

**定义**：透视函数 $P: \mathbb{R}^{n+1} \to \mathbb{R}^n$ 定义为：
$$P(x, t) = \frac{x}{t}$$
其中定义域为 $\{(x, t) \mid t > 0\}$。

**保凸性质**：
- 如果 $C \subseteq \mathbb{R}^{n+1}$ 是凸集，那么其透视像 $P(C)$ 是凸集
- 如果 $D \subseteq \mathbb{R}^n$ 是凸集，那么其透视原像 $P^{-1}(D) = \{(x, t) \mid x/t \in D, t > 0\}$ 是凸集

**几何意义**：透视函数相当于从原点向超平面 $t = 1$ 进行中心投影。

#### 其他重要的保凸运算

**1. 笛卡尔积**：
如果 $C_1, C_2, ..., C_m$ 都是凸集，那么它们的笛卡尔积：
$$C_1 \times C_2 \times ... \times C_m = \{(x_1, x_2, ..., x_m) \mid x_i \in C_i, i = 1,...,m\}$$
也是凸集。

**2. 部分和**：
如果 $C_1 \subseteq \mathbb{R}^{n \times m}$ 和 $C_2 \subseteq \mathbb{R}^{n \times m}$ 是凸集，那么：
$$C_1 + C_2 = \{x + y \mid x \in C_1, y \in C_2\}$$
（Minkowski 和）也是凸集。

**3. 凸包**：
集合 $S$ 的凸包是包含 $S$ 的最小凸集：
$$\text{conv}(S) = \{\theta_1 x_1 + ... + \theta_k x_k \mid x_i \in S, \theta_i \geq 0, \sum_{i=1}^k \theta_i = 1\}$$

**4. 锥包**：
集合 $S$ 的锥包是包含 $S$ 的最小凸锥：
$$\text{cone}(S) = \{\theta_1 x_1 + ... + \theta_k x_k \mid x_i \in S, \theta_i \geq 0\}$$

#### 保凸运算的重要性

保凸运算使我们能够：
1. **构造复杂凸集**：从简单的凸集出发构造复杂的凸集
2. **验证凸性**：通过运算序列验证集合的凸性
3. **优化建模**：在凸优化问题建模中确保约束集合的凸性
4. **算法设计**：利用凸性设计高效的优化算法

这些运算为凸优化理论提供了强大的工具，使得我们能够处理各种复杂的凸优化问题。

### 2.4 广义不等式

广义不等式是凸优化理论中的重要概念，它将实数上的标准不等式关系推广到更一般的向量空间中。这种推广基于正常锥的概念，为处理向量优化问题提供了理论基础。

#### 正常锥和广义不等式

**正常锥（Proper Cone）**

集合 $K \subseteq \mathbb{R}^n$ 是正常锥，如果它满足以下条件：
1. **凸性**：$K$ 是凸集
2. **闭性**：$K$ 是闭集
3. **实性**：$K$ 有非空内部，即 $\text{int}(K) \neq \emptyset$
4. **尖性**：$K$ 不包含直线，即 $K \cap (-K) = \{0\}$

**广义不等式**

给定正常锥 $K$，我们定义两种广义不等式：

1. **广义不等式** $\preceq_K$：
   $$x \preceq_K y \Leftrightarrow y - x \in K$$

2. **严格广义不等式** $\prec_K$：
   $$x \prec_K y \Leftrightarrow y - x \in \text{int}(K)$$

当上下文清楚时，通常省略下标 $K$，简写为 $\preceq$ 和 $\prec$。

**广义不等式的性质**

广义不等式具有以下重要性质：
1. **保序性**：如果 $x \preceq y$ 且 $u \preceq v$，则 $x + u \preceq y + v$
2. **传递性**：如果 $x \preceq y$ 且 $y \preceq z$，则 $x \preceq z$
3. **齐次性**：如果 $x \preceq y$ 且 $\alpha \geq 0$，则 $\alpha x \preceq \alpha y$
4. **反射性**：$x \preceq x$
5. **反对称性**：如果 $x \preceq y$ 且 $y \preceq x$，则 $x = y$

**常见的正常锥和广义不等式**

1. **非负象限**：$\mathbb{R}_+^n = \{x \in \mathbb{R}^n \mid x_i \geq 0, i = 1,...,n\}$
   - 对应的广义不等式：$x \preceq y \Leftrightarrow x_i \leq y_i, \forall i$（分量不等式）

2. **半正定锥**：$S_+^n = \{X \in S^n \mid X \succeq 0\}$
   - 对应的广义不等式：$X \preceq Y \Leftrightarrow Y - X \succeq 0$（矩阵不等式）

3. **二阶锥**：$\{(x, t) \in \mathbb{R}^{n+1} \mid \|x\| \leq t\}$
   - 对应的广义不等式：$(x_1, t_1) \preceq (x_2, t_2) \Leftrightarrow \|x_2 - x_1\| \leq t_2 - t_1$

#### 最小与极小元

在广义不等式的框架下，我们可以定义集合中元素的最小性概念。

**最小元（Minimum Element）**

设 $S \subseteq \mathbb{R}^n$，元素 $x \in S$ 是 $S$ 关于 $\preceq_K$ 的最小元，如果对所有 $y \in S$，都有：
$$x \preceq_K y$$

**性质**：
- 最小元如果存在，则是唯一的
- 最小元一定是极小元

**极小元（Minimal Element）**

设 $S \subseteq \mathbb{R}^n$，元素 $x \in S$ 是 $S$ 关于 $\preceq_K$ 的极小元，如果不存在 $y \in S$ 使得：
$$y \preceq_K x \text{ 且 } y \neq x$$

等价地，$x$ 是极小元当且仅当：
$$(x - K) \cap S = \{x\}$$

**性质**：
- 极小元可能不唯一
- 集合可能有多个极小元
- 极小元不一定是最小元

**几何直观**：
- 最小元：在所有方向上都不能再"小"的元素
- 极小元：不能在保持可行性的前提下进一步"改进"的元素

**重要例子**

1. **标量情况**（$K = \mathbb{R}_+$）：
   - 最小元就是集合中的最小值
   - 极小元也是最小值（如果存在）

2. **向量情况**（$K = \mathbb{R}_+^n$）：
   - 最小元：所有分量都同时最小的点（通常不存在）
   - 极小元：Pareto最优解，不能在不恶化某些分量的情况下改进其他分量

3. **矩阵情况**（$K = S_+^n$）：
   - 最小元：在矩阵偏序意义下的最小矩阵
   - 极小元：不能进一步"减小"的矩阵

#### 广义不等式在优化中的应用

**1. 向量优化问题**：
$$\begin{align}
&\text{minimize} \quad f(x) \\
&\text{subject to} \quad x \in C
\end{align}$$
其中 $f: \mathbb{R}^n \to \mathbb{R}^m$，目标是找到 $f(C)$ 中关于某个正常锥的极小元。

**2. 多目标优化**：
在多目标优化中，通常寻找Pareto最优解，这些解正是目标空间中关于非负象限的极小元。

**3. 半正定规划**：
$$\begin{align}
&\text{minimize} \quad c^T x \\
&\text{subject to} \quad F(x) \preceq 0
\end{align}$$
其中 $F(x) = F_0 + x_1 F_1 + ... + x_n F_n$，$\preceq$ 是关于半正定锥的广义不等式。

**4. 鲁棒优化**：
广义不等式为处理不确定性和鲁棒性约束提供了自然的框架。

广义不等式理论为凸优化提供了强大的工具，特别是在处理向量优化、多目标优化和涉及矩阵不等式的问题时发挥重要作用。

## 3. 凸函数

### 3.1 凸函数基本性质

凸函数是凸优化理论的核心概念，它们具有许多优良的性质，使得凸优化问题相对容易求解。

#### 定义描述

**基本定义**：函数 $f : \mathbb{R}^n \to \mathbb{R}$ 是凸的，如果：
1. $\text{dom}\ f$ 是凸集
2. 对于任意 $x, y \in \text{dom}\ f$ 和任意 $\theta \in [0,1]$，都有：
   $$f(\theta x + (1-\theta) y) \leq \theta f(x) + (1-\theta) f(y)$$

**几何意义**：函数图像上任意两点之间的线段都位于函数图像的上方或上面。

**严格凸函数**：如果对于 $x \neq y$ 和 $\theta \in (0,1)$，不等式严格成立：
$$f(\theta x + (1-\theta) y) < \theta f(x) + (1-\theta) f(y)$$

**凹函数**：函数 $f$ 是凹的，当且仅当 $-f$ 是凸的。

**扩展实值函数**：对于扩展实值函数 $f : \mathbb{R}^n \to \mathbb{R} \cup \{+\infty\}$，凸性定义保持不变，但需要约定：
- $0 \cdot (+\infty) = 0$
- $\alpha \cdot (+\infty) = +\infty$ 当 $\alpha > 0$

#### 常见的凸函数例子

1. **仿射函数**：$f(x) = a^T x + b$（既凸又凹）
2. **二次函数**：$f(x) = \frac{1}{2} x^T P x + q^T x + r$，当 $P \succeq 0$ 时为凸
3. **范数**：任意范数 $\|x\|$ 都是凸函数
4. **指数函数**：$f(x) = e^{ax}$
5. **对数函数**：$f(x) = -\log x$（在 $x > 0$ 上）
6. **幂函数**：$f(x) = x^p$（当 $p \geq 1$ 或 $p \leq 0$ 时，在 $x > 0$ 上）
7. **最大值函数**：$f(x) = \max\{x_1, x_2, ..., x_n\}$

#### 一阶条件描述

**定理（一阶条件）**：设 $f$ 是可微函数，则 $f$ 是凸函数当且仅当 $\text{dom}\ f$ 是凸集且对于任意 $x, y \in \text{dom}\ f$，都有：
$$f(y) \geq f(x) + \nabla f(x)^T (y - x)$$

**几何意义**：函数在任意点的切线（或切平面）都是函数的全局下估计。

**推论**：
- 如果 $\nabla f(x^*) = 0$，则 $x^*$ 是 $f$ 的全局最小点
- 凸函数的任何局部最小点都是全局最小点

**严格凸函数的一阶条件**：$f$ 严格凸当且仅当对于 $x \neq y$：
$$f(y) > f(x) + \nabla f(x)^T (y - x)$$

#### 二阶条件描述

**定理（二阶条件）**：设 $f$ 是二阶可微函数，则：
1. $f$ 是凸函数当且仅当 $\text{dom}\ f$ 是凸集且对于任意 $x \in \text{dom}\ f$：
   $$\nabla^2 f(x) \succeq 0$$

2. 如果对于任意 $x \in \text{dom}\ f$ 都有 $\nabla^2 f(x) \succ 0$，则 $f$ 是严格凸函数

**标量情况**：对于 $f: \mathbb{R} \to \mathbb{R}$，$f$ 是凸的当且仅当 $f''(x) \geq 0$。

**例子**：
- $f(x) = x^2$：$f''(x) = 2 > 0$，严格凸
- $f(x) = |x|$：在 $x = 0$ 处不可微，但仍是凸函数
- $f(x) = x^4$：$f''(x) = 12x^2 \geq 0$，凸函数

#### 凸函数的重要性质

**1. 局部性质**：
- 凸函数的任何局部最小点都是全局最小点
- 凸函数在凸集上的最小值集合是凸的

**2. 连续性**：
- 凸函数在其定义域的内部是连续的
- 凸函数在边界可能不连续

**3. 可微性**：
- 凸函数在其定义域的内部几乎处处可微
- 凸函数的次梯度总是存在

**4. Jensen不等式**：
对于凸函数 $f$ 和 $\theta_1, ..., \theta_k \geq 0$，$\sum_{i=1}^k \theta_i = 1$：
$$f\left(\sum_{i=1}^k \theta_i x_i\right) \leq \sum_{i=1}^k \theta_i f(x_i)$$

### 3.2 保凸运算

保凸运算是指在凸函数上进行某些运算后，结果仍然是凸函数的运算。这些运算为构造复杂的凸函数提供了工具。

#### 基本保凸运算

**1. 非负加权和**：
如果 $f_1, f_2, ..., f_m$ 是凸函数，$w_1, w_2, ..., w_m \geq 0$，则：
$$f(x) = w_1 f_1(x) + w_2 f_2(x) + ... + w_m f_m(x)$$
是凸函数。

**2. 逐点最大值**：
如果 $f_1, f_2, ..., f_m$ 是凸函数，则：
$$f(x) = \max\{f_1(x), f_2(x), ..., f_m(x)\}$$
是凸函数。

**推广**：如果对于任意 $y \in \mathcal{A}$，$f(x, y)$ 关于 $x$ 是凸的，则：
$$g(x) = \sup_{y \in \mathcal{A}} f(x, y)$$
是凸函数。

**3. 标量复合**：
设 $f: \mathbb{R}^n \to \mathbb{R}$，$g: \mathbb{R} \to \mathbb{R}$，复合函数 $h(x) = g(f(x))$ 在以下情况下是凸的：
- $g$ 凸且单调递增，$f$ 凸
- $g$ 凸且单调递减，$f$ 凹
- $g$ 凹且单调递增，$f$ 凹
- $g$ 凹且单调递减，$f$ 凸

**4. 向量复合**：
设 $f: \mathbb{R}^k \to \mathbb{R}$，$g_i: \mathbb{R}^n \to \mathbb{R}$，$i = 1, ..., k$，复合函数：
$$h(x) = f(g_1(x), g_2(x), ..., g_k(x))$$
在以下情况下是凸的：
- $f$ 凸且单调递增，所有 $g_i$ 凸
- $f$ 凸且单调递减，所有 $g_i$ 凹

#### 仿射变换

**定理**：如果 $f$ 是凸函数，$A \in \mathbb{R}^{m \times n}$，$b \in \mathbb{R}^m$，则：
$$g(x) = f(Ax + b)$$
是凸函数。

**应用**：
- 线性变换后的凸函数仍是凸函数
- 这为处理约束优化问题提供了工具

#### 透视变换

**定义**：函数 $f: \mathbb{R}^n \to \mathbb{R}$ 的透视函数定义为：
$$g(x, t) = t f(x/t)$$
其中定义域为 $\{(x, t) \mid x/t \in \text{dom}\ f, t > 0\}$。

**定理**：如果 $f$ 是凸函数，则其透视函数 $g$ 也是凸函数。

#### 共轭函数

**定义**：函数 $f: \mathbb{R}^n \to \mathbb{R}$ 的共轭函数 $f^*: \mathbb{R}^n \to \mathbb{R}$ 定义为：
$$f^*(y) = \sup_{x \in \text{dom}\ f} (y^T x - f(x))$$

**性质**：
- 共轭函数总是凸的（即使原函数不凸）
- 如果 $f$ 是凸函数，则 $f^{**} = f$（双共轭定理）

**常见例子**：
- 二次函数 $f(x) = \frac{1}{2} x^T Q x$ 的共轭：$f^*(y) = \frac{1}{2} y^T Q^{-1} y$（当 $Q \succ 0$）
- 指示函数 $I_C(x)$ 的共轭是支撑函数 $S_C(y) = \sup_{x \in C} y^T x$

保凸运算为凸优化提供了强大的建模工具，使我们能够识别和构造各种凸优化问题。

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)


