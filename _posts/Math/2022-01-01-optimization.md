---
layout: post
title: "非线性优化"
subtitle: "详细解读常用的数值优化方法，如：梯度下降，高速牛顿，以及LevenbergMarquardt等"
categories: [SLAM]
tags: [SLAM, Optimal, Math]
header-img: "img/in-post/post-optimal/post-bg-1.png"
header-style: img
date: 2022.01.01
author: "CongYu"
---

>  本文主要记录常见非线性数值优化方法的原理与公式推导，另有python代码仿真。梯度下降，(批量，全量，随机)梯度下降，牛顿法。以及适用于最小二乘优化问题的高斯牛顿法，LevenbergMarquardt等方法。

* Kramdown table of contents
{:toc .toc}

----

Created 2021.03.22 by Cong Yu; Last modified: 2022.11.07-v3.3.2

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

----

# 非线性优化

<p style="font-size:16px;color:#176;text-align:left;">References</p> 

- book METHODS-FOR-NON-LINEAR-LEAST-SQUARES-PROBLEMS.pdf
- paper [An overview of gradient descent optimization algorithms](http://cn.arxiv.org/abs/1609.04747)
- paper [http://cn.arxiv.org/pdf/1705.08292.pdf](http://cn.arxiv.org/pdf/1705.08292.pdf)
- Course [https://www.stat.cmu.edu/~ryantibs/convexopt/](https://www.stat.cmu.edu/~ryantibs/convexopt/)
- post [一些常见的优化方法](https://blog.codekiller.top/2021/02/03/%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0/%E4%BC%98%E5%8C%96%E7%AE%97%E6%B3%95BGD%E3%80%81SGD%E3%80%81Momentum-SGD%E3%80%81Adagrad%E3%80%81AdaDelta%E3%80%81RMSProp%E3%80%81Adam%E7%AE%97%E6%B3%95%E5%8F%8Apython%E5%AE%9E%E7%8E%B0/)
- post [https://blog.csdn.net/shuzfan/article/details/75675568](https://blog.csdn.net/shuzfan/article/details/75675568)
- post [https://lumingdong.cn/summary-of-gradient-descent-algorithm.html#%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D%E7%9C%9F%E6%AD%A3%E7%9A%84%E8%BD%A8%E8%BF%B9](https://lumingdong.cn/summary-of-gradient-descent-algorithm.html#%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D%E7%9C%9F%E6%AD%A3%E7%9A%84%E8%BD%A8%E8%BF%B9)



## 1. 优化问题

一个代价函数  cost function: $F：\mathbf{R} ^{n} \mapsto \mathbf{R}$，寻找一个x，得到最小的F(x):

Definition 1.2. Global Minimizer

$$
\begin{align}
\textrm{Given   }F：\mathbf{R} ^{n} \mapsto \mathbf{R}. \textrm{ Find }\\
\mathbf{x}^+ = \textrm {argmin}_\mathbf{x} \{F(x)\}.
\end{align}
$$

Definition 1.3. Local Minimizer


$$
\begin{align}
\textrm{Given   }F：\mathbf{R} ^{n} \mapsto \mathbf{R}. \textrm{ Find } \mathbf{x}^* \textrm{ so that}\\
F(\mathbf{x}^*) \leq F(\mathbf{x})  \textrm{ for } ||\mathbf{x} - \mathbf{x}^*|| < \delta.
\end{align}
$$


解析法 求解上面的问题，比较简单：直接求$F'(\mathbf{x})$  , 令其等于0，解出x即可。

但是往往会出现$F'(x)$ 好求，$F'(x) = 0$ 却无法求解的问题。故无法使用解析解法，采用数值解法，即优化迭代方法。

### 1.1 最速下降法

最速下降法总结
- 一阶方法
- 基本思路：一阶泰勒展开，每次朝梯度下降的方向迭代更新x

$$
F(\mathbf x+\Delta \mathbf x) \approx F(\mathbf x) + J \Delta \mathbf x
$$

令 $F(\mathbf x+\Delta\mathbf x)< F(\mathbf x)$ 即可，即 $J\Delta\mathbf x < 0$ , 即 $\Delta \mathbf x$ 与 J 向量的夹角大于180°即可，那么这个范围内，下降速度最快的自然就是直接取J的反方向：$\Delta \mathbf x=-J^T$

$$
\mathbf x:= \mathbf x-\eta J^T
$$

<img src="https://raw.githubusercontent.com/YuYuCong/YuYuCong.github.io/develop/img/in-post/post-optimal/gd.png" alt="img" style="zoom:40%;" align='center' text ="test_img_github.png"/>


### 1.2 最速下降衍生算法

最速下降方法选择的是梯度的反方向。实际计算过程中，由于参数的尺度不同，可能出现各种收敛缓慢的情况，而且最速下降法中的步长参数不可调，可以考虑做自适应的算法。由此衍生出一系列算法:

refitem: 
- paper [http://cn.arxiv.org/pdf/1705.08292.pdf](http://cn.arxiv.org/pdf/1705.08292.pdf)

##### Momentum 动量法

$$
\begin{align}
ν_t&=γν_{t−1}+η∇_{θ}J(θ) \\
θ&=θ−νt
\end{align}
$$

##### Adagrad 

每一个参数 $\theta_i$ 提供了一个与自身相关的学习率：

$$
θ_{t+1,i}=θ_{t,i}−\frac η {\sqrt {G_{t,ii}+ϵ}}∇_θJ(θ_{t,i})
$$

##### RMSProp

//todo(congyu)

##### AdaDelta

//todo(congyu)

##### Adam

//todo(congyu)

##### AdaMax

//todo(congyu)

所有方法的对比：

<img src="https://raw.githubusercontent.com/YuYuCong/YuYuCong.github.io/develop/img/in-post/post-optimal/NKsFHJb.gif" alt="img" style="zoom:40%;" align='center' text ="test_img_github.png"/>

<img src="https://raw.githubusercontent.com/YuYuCong/YuYuCong.github.io/develop/img/in-post/post-optimal/pD0hWu5.gif" alt="img" style="zoom:40%;" align='center' text ="test_img_github.png"/>



### 1.3 牛顿法

牛顿法：
- 二阶方法
- 二阶导矩阵 H 计算量比较大
- 基本思路：2阶泰勒展开，使用2次曲线拟合；然后求近似后函数的导数，令导数为0，即求出了当前近似函数的最小值；然后在此处继续进行2阶泰勒展开，重复上述步骤。

$$
F(\mathbf x+\Delta \mathbf x) \approx F(\mathbf x) + J \Delta \mathbf x + \frac12\Delta\mathbf x H \Delta\mathbf x \equiv G
$$

上面表达式的右边对$\Delta \mathbf x$求导，得

$$
\frac {\partial G }{\partial  \Delta \mathbf x} = J^T + H \Delta \mathbf x
$$

令其=0，解得

$$
\Delta \mathbf x = - H^{-1} J^T
$$

得出迭代公式：

$$
\mathbf x:= \mathbf x-\eta H^{-1}J^T
$$


### 1.4 组合方法

hybrid method

- 如果H是正定的，表示牛顿法近似出来的函数G是凸的，有最小值，故可以直接使用牛顿法。
- 但是如果H非正定，牛顿法可能就不能收敛了，此时应当使用1阶的梯度下降方法。

补充内容：矩阵正定的判断？

##### 矩阵的正定判断

判别对称矩阵A的正定性有两种方法：

1. 求出A的所有特征值。若A的特征值均为正数，则A是正定的；若A的特征值均为负数，则A为负定的。
2. 计算A的各阶主子式。若A的各阶主子式均大于零，则A是正定的；若A的各阶主子式中，奇数阶主子式为负，偶数阶为正，则A为负定的

### 1.5 阻尼法

阻尼法

- 思路：简单来讲，就是在牛顿法的基础上，给原函数在x附近叠加一个关于 $\Delta \mathbf x$的二次函数用于惩罚 $\Delta \mathbf x$，保证$\mathbf x_k$ 不要离 $\mathbf x_{k-1}$ 太远。

迭代公式：

$$
\mathbf x_{k}:= \mathbf x_{k} - \eta (H + \mu I) ^ {-1} J ^T
$$


## 2.  Least Squares Problem

<mark style="background: #FF5582A6;">最小二乘问题</mark>是 优化问题 的一个特例。对于这个特例，可以有更多更精细化的方法。

Definition 1.1. Least Squares Problem

$$F(\mathbf x)= \frac{1}{2}\sum_{i=1}^{m} ( f_{i}( \mathbf{x} ) )^2$$


### 2.1 线性最小二乘

#todo(congyu)

### 2.2 改进最速下降法

由于该问题由很多项组合而成，所以上面的公式中，我们可以对求和符号可以做进一步深究，由此衍生出各种批量的梯度下降算法：

##### 全量梯度下降法 FGD

每次迭代时，都选择所有的数据计算cost，即从i=1累加到i=m。 $\sum_{i=1}^{m}$。

$$
\mathbf x_k :=  \mathbf x_k -\eta J(\mathbf{x}; f_{(1:m)})
$$

##### 随机梯度下降法 SGD

每次迭代都只使用其中的一个数据求cost，然后将误差反向传播到所有的自变量参数，然后选择下一个训练数据重复上述步骤。

$$
\mathbf x_k :=  \mathbf x_k -\eta J(\mathbf{x}; f_{i})
$$
此时 J 由F求出，F为某个数据求得的cost

$$
F(\mathbf x)= \frac{1}{2} f_{i}( \mathbf{x} ) ^2
$$

##### 批量梯度下降法 Mini-batchGD

每次迭代都只选择其中的一部分数据进行拟合，求cost，将误差反向传播到所有自变量参数，然后选择下一个batch里的数据进行下一次迭代，重复上述步骤。

$$
\mathbf x_k :=  \mathbf x_k -\eta J(\mathbf{x}; f_{(js:(j+1)s)})
$$

此时 J 由F求出，F为第j次迭代所用的数据表达的cost_function。batch的大小为s个数据。

$$
F(\mathbf x)= \frac{1}{2} \sum_{i=j s}^{(j+1)s} f_{i}( \mathbf{x} ) ^2
$$

### 2.3 高斯牛顿法 

思路：

不要直接求$F$ 的一二阶导数，将$\mathbf{f(x)}$一阶泰勒展开

$$
f(\mathbf x + \Delta \mathbf x) = f(\mathbf x) + J(\mathbf x) \Delta \mathbf x + o(||\Delta \mathbf x||^2)
$$

而 $F_\mathbf x =\frac 12 \mathbf{f(x)}^T \mathbf{f(x)}$，将$\mathbf{f(x)}$展开后带入，

$$
F(\mathbf x + \Delta \mathbf x) \approx F(\mathbf x) + \Delta \mathbf x^T J^T f + \frac 12 \Delta x^T J^T J \Delta \mathbf x
$$

可得$F_\mathbf x$ 的一阶导和二阶导的近似为
$$
\mathbf{J}_{F} = (\mathbf{J_f}^T \mathbf{f}) ^T
$$

$$
\mathbf{H}_{F} \approx  \mathbf{J_f}^T \mathbf{J_{f}}
$$

于是我们只需要求$\mathbf J_f$ 就可以替代F的J和H求解，速度加快！

然后再用这个$J_F$和$H_F$ 使用牛顿法即可。

最终的迭代公式：

$$
\mathbf x_{k} := \mathbf x_{k} - \eta H^{-1} J^T
$$

### 2.4 列文伯格-马夸尔特法

思路：可以简单理解为 带阻尼的 高斯-牛顿方法

$$
\mathbf x_{k}:= \mathbf x_{k} - \eta (H + \mu I) ^ {-1} J ^T
$$

<img src="https://raw.githubusercontent.com/YuYuCong/YuYuCong.github.io/develop/img/in-post/post-optimal/Levenberg–Marquardt-1.png" alt="img" style="zoom:40%;" align='center' text ="test_img_github.png"/>

更多的小技巧：

// todo(congyu)


Ceres 优化中使用的方法：

// todo(congyu)

[2021-12-24-ceres](c++/Ceres/2021-12-24-ceres.md)



------
## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)


