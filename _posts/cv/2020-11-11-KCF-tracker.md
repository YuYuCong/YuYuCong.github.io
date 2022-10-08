---
layout: post
title: "KCF Tracker"
subtitle: "KCF Tracker原理简析"
categories: [OpenCV]
tags: [OpenCV, KCF, tracker]
header-img: "img/in-post/post-cv/"
redirect_from:
  - /2020/11/11/
---


>  本文主要记录KCF tracker算法原理

* Kramdown table of contents
{:toc .toc}

# KCF Tracker

---

Created 2020.11.11 by Cong Yu; Last modified: 2022.09.15-v1.0.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

---

// todo(congyu)

<p style="font-size:20px;color:#187732;text-align:left;">References</p> 

- OpenCV Modules [**Tracking API**](https://docs.opencv.org/4.x/d9/df8/group__tracking.html)
  - [**Tracking API implementation details**](https://docs.opencv.org/4.x/d5/d0b/group__tracking__detail.html)
  - [**Legacy Tracking API**](https://docs.opencv.org/4.x/dc/d6b/group__tracking__legacy.html)

- 🔗 post [https://www.cnblogs.com/jins-note/p...](https://www.cnblogs.com/jins-note/p/10215511.html)

- paper [KCF paper](https://arxiv.org/abs/1404.7584)

## 0. Intro

- KCF, Kernel Correlation Filter, 核相关滤波算法
- 作者：2014年 Joao F. Henriques, Rui Caseiro, Pedro Martins, and Jorge Batista

### Abstract

- 简介：相关滤波算法算是判别式跟踪，主要是使用给出的样本去训练一个判别分类器，判断跟踪到的是目标还是周围的背景信息。主要使用轮转矩阵对样本进行采集，使用快速傅里叶变化对算法进行加速计算。

- 主要介绍了一下想法的由来以及算法的成就和所使用的东西，还介绍了一下论文在哪些数据集上测试了等。大致思路：使用核相关滤波器训练一个判别式分类器，使用轮转矩阵生成样本去训练分类器。

## 1. Introduction

- 对整个跟踪的问题进行介绍。

- 相关滤波器是根据之前的MOSSE算法 [（论文地址） ](http://www.cs.colostate.edu/~vision/publications/bolme_cvpr10.pdf)改进的，可以说是后来CSK、STC、Color Attributes等tracker的鼻祖。

- 负样本对训练一个分类器是一个比较重要的存在，但是在训练的时候负样本的数量是比较少的，所以我们本文的算法就是为了更加方便地产生更多的样本，以便于我们能够训练一个更好的分类器。 

- Correlation Filter（以下简称CF）源于信号处理领域，后被运用于图像分类等方面。而Correlation Filter应用于tracking方面最朴素的想法就是：

  - 相关是衡量两个信号相似值的度量，如果两个信号越相似，那么其相关值就越高，

  - 而在tracking的应用里，就是需要设计一个滤波模板，使得当它作用在跟踪目标上时，得到的响应最大，最大响应值的位置就是目标的位置。（详细的介绍大家可以参考一下王泥喜龙一的博客 [地址 ](http://www.cnblogs.com/hanhuili/p/4266990.html)）如下图所示： 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=Mjc0MjcwNjBhMWQyZjZmMWE0YWE3ZGU0ZTc5ZTlhOWJfWnBVM0JiUW1XYjhXQzdyZGhkR1owWTBoRlB0d0huWVBfVG9rZW46Ym94Y254MW1aV0hkM1FLaVBUMjNYNnJaelpjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

- CSK [（论文下载地址） ](http://www.robots.ox.ac.uk/~joao/publications/henriques_eccv2012.pdf)是这个算法改进的初级版本。
  - CSK引进了循环矩阵生成样本，使用相关滤波器进行跟踪
  - 本篇论文KCF是对CSK进行更进一步的改进，引入了多通道特征，可以使用比着灰度特征更好的HOG（梯度颜色直方图）特征或者其他的颜色特征等。

## 2. Related Work

#### 2.1 基于检测的跟踪

- 基于检测到的目标进行跟踪，首先在跟踪之前对目标进行检测，得到目标的位置，然后对目标进行学习，跟踪。 

#### 2.2 样本转换和相关滤波

- 对一些以前存在的样本转换的方法和相关滤波的一些知识进行一个介绍。

- For us, this hinted that a deeper connection between translated image patches and training algorithms was needed, in order to overcome the limitations of direct Fourier domain formulations.而且说出了样本和训练算法都是必须的，直接在频域使用傅里叶变化加快算法。 

#### 2.3 后来的工作

初始版本就是我上面说的CSK那篇，然后把多通道特征以及核函数这个加进来对算法进行提升。

1. ### Contributions

- 提出了一个快速的效果良好的跟踪算法，
  - 把以前只能用单通道的灰度特征改进为现在可以使用多通道的HOG特征或者其他特征，而且在现有算法中是表现比较好的，
  - 使用HOG替换掉了灰度特征，
  - 对实验部分进行了扩充，充分证明自己的效果是比较好的。
  - 使用核函数，对偶相关滤波去计算。

- KCF的主要贡献
  - 使用目标周围区域的循环矩阵采集正负样本，利用脊回归训练目标检测器，并成功的利用循环矩阵在傅里叶空间可对角化的性质将矩阵的运算转化为向量的Hadamad积，即元素的点乘，大大降低了运算量，提高了运算速度，使算法满足实时性要求。
  - 将线性空间的脊回归通过核函数映射到非线性空间，在非线性空间通过求解一个对偶问题和某些常见的约束，同样的可以使用循环矩阵傅里叶空间对角化简化计算。
  - 给出了一种将多通道数据融入该算法的途径。

## 3. 一维脊回归

#### 4.1 一维脊回归问题

> 设训练样本集 
>
> ![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YmFlZjBjNTI3MzFlNDhlOTkwODMzYTQ0M2FmMDUzMDBfNnFPZ3hHdzNJbVF6OWl4VEd2WWFITms5d2tkNUZXTEpfVG9rZW46Ym94Y25YR2RacXVicUwxTXg0VTZmZExyYVBiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)
>
> ，那么其线性回归函数 
>
> ![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=Zjc4OWY4OGNhZmFhMTI0YTBlZTRkNTg0ZDc1NTA1YjhfeHB4M09HWHpQVjFWdGJGMkZCUU9rSXRFRnk2MWY5Qk9fVG9rZW46Ym94Y25vZ2xPUFc5RVR3NmZDSFNFSkFiUmVnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)
>
> $$$$w $$$$是列向量表示权重系数，可通过最小二乘法求解
>
> ![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NzIwMmM1YTIzZTBkODhkYTkwM2NiZjdiYjgyMDc2YjFfM2NOUmE1N0FZOFVCNUs3M05tbG0zMjBKR2Q3S0VXY1dfVG9rZW46Ym94Y24xelFBbmd1WHlIZUVuTVpaMUluVnViXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)
>
> 其中 $$$$\lambda $$$$用于控制系统的结构复杂性，也就是VC维以保证分类器的泛化性能。就是正则项。 写成矩阵形式
>
> ![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=Y2FjMThiZjliODlhZTRhMDFkNGMwYTk3YWUyY2M1ZjBfb3psMzhHQk1BalJkeXM4YnlxRG1EQnBjSUVFTW1Hak1fVG9rZW46Ym94Y25MN1pnekRxNHVZYXNPOVAxSFBsRzlnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)
>
> 其中 
>
> ![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MWIxMzkzZjU2MjlkYjM2ZGJiZTRjODZhZmYzNDAyNzVfT205U0tjT3k1NVlVMUExNkR5UVA5NzFvRXlBUUpSSU1fVG9rZW46Ym94Y254SHdpZGZxMldvNG9PRUdyUGo3eUhiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)
>
> 的每一行表示一个向量。 
>
> $$$$y $$$$是列向量，每个元素对应一个样本的标签。

#### 4.2 解析求解方法

> 令导数为0，可求得
>
> ![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YWMwNDNmZmU1ZWRhNTg4ODcwMWVhODZmYjhhMGY4ZDJfVW1VamFNVHl2dEdxb2JxQmhORVFrZnVOT3JUUEdST2FfVG9rZW46Ym94Y25Rd0hhbzVkRWpkQTdJRnFQdWFDVmFnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)
>
> 这是矩阵解析求解方法
>
> 
>
> 因为后面是在傅里叶域内计算，牵涉到复数矩阵，所以我们将结果都统一写成复数域中形式
>
> ![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NmM4ZTg4NDIyODE1YjI1YmU3OTUxM2UyNzBiNWEzMGFfRmNSZnpmMGZKMTg2TjhkUkhWWkNpalc2TjMxNTI1ZTFfVG9rZW46Ym94Y25JWHNWNHJoaWJJYnhZbkNzMmt1RkNlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)
>
> 其中 
>
> ![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OTZlZDg4NGFlOWE1MDg5OWYxYjE5OWUxNmM0NTRkZmFfVUpzQjVJVTRmeVlaWnB0WGRiaXo3TjNDN3doSVlFaTZfVG9rZW46Ym94Y25Xc2piVHlmRHRPYmQ0d2U3UHZMTGZmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)
>
> 表示复共轭转置矩阵。

#### 4.3 循环矩阵

- KCF中所有的训练样本是由目标样本循环位移得到的

- 向量的循环可由排列矩阵求出，比如

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MjBiNjg0MWU5Y2Y1MThkOGViMzQwNDY4ZjliMzIxMGNfdkVFZ2g2OENqdGRpRzkzV3ZTdWhxdmFuYTNUdFlQZWRfVG9rZW46Ym94Y25nTEdUYzVCS0NFRVZIOHhBZ29JQTlmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ODZiZjhmODU0ZGUwN2NlN2E2Y2ZjNTRmZDI0YTEyZGZfblFVR2tXUkRVYVhTbG9RRDRNUGVLam9qWllQVnFRbDdfVG9rZW46Ym94Y25ESVZIMmZSTHlqbGFxSUpWdG15OFJoXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MWM2YWE5YWQyNDIxNWY2M2YzNmY2ODc2ZDNhYTE4ZjRfRjdzMU9HMWtoWXVNMXdBWXJKb3BXVHdCWlpscFlKQktfVG9rZW46Ym94Y25HVzBGYkNSQU5wVkRWeEFjcDRENURoXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

- 当然对于二维图像的话，可以通过x轴和y轴分别循环移动实现不同位置的移动

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDg5NTlmNWRmNzc3OTc3MWMxZTIxNzQ0NzVmZDg2MTFfenJuN2F3c1I2MXh2QkM2b1gwcldKbEY0UHZWNzVpVm1fVG9rZW46Ym94Y25ycTJ2VlNNdVBhQ2VPQjlHVjZyVlVlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

举例

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YzFiZWFjMDFlNzA0NjRmNjJhZDVjZDdmOTg5NDE0NGNfNjBZSkowNEVkV2VUWW1NVkF3dlNkbWluS2x6S2cwNEhfVG9rZW46Ym94Y25XWE5xeUFYMUxmYkVQT0dKeG90SnhjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MDdiNTU4MzYyOGQ1YjYwNTQ1MWRkMmIzMjQ3YmQ3NWVfYmdwWERlTzN0RFRzR3FGbndpbjhTaklSZTlHMnRYQmZfVG9rZW46Ym94Y250ekdhZXo2Rm1oZlFiOUU0MFFxb1ZjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

所以由一个向量 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NjNmYTZhY2IzYzIxZmYwOTY0Yjg3NGE2ZDEzODIyZDNfOXBlZEhvUzJCejBHYmhqaFlKdm1hbkF1anp3WHNOUXRfVG9rZW46Ym94Y243VVhSSEhpd2JIcDFvYjhSeDRWVjBlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

可以通过不断的乘上排列矩阵得到n个循环移位向量，将这n个向量依序排列到一个矩阵中，就形成了x生成的循环矩阵，表示成 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDkyMDljODJkMDRiYmE5OWMyMmVhMDRjMTQ3YWFmNWNfc2lpMjdscXRVdXlzNkRrb3dJbGoyalNZVzlqelZNR0pfVG9rZW46Ym94Y25QZzA4N08xOXRIYUZ1OTllNDJjdDVlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

#### 4.4 C()操作

可以定义出一个C()操作：

一维

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MGQ1MWYyNmUxM2EzMzQyODEwNDA2MGQ1ZDg2NzE5ZGJfenplczY4R1ZhV1lSQjhoSmQ4YnBRYzB3TUtMTU9Kem1fVG9rZW46Ym94Y25EZk9hMXVhbVJSQ0QwWkx6OUZIZ1hmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

二维

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YjdmNjkyNDQ2NjIzZWYxOTE4YWExZmIxOWU2YzJiN2VfdU5FQWxjTU1kQm5EQUZ6Rnc0YmV4YXlhUUhjRDFxZVFfVG9rZW46Ym94Y24xa2FDTnZrb3ZReE9ZT1Jha0xER3ZnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

但是一定要注意这是图片的循环移动，不是图片的裁切与位置移动

#### 4.5 循环矩阵傅氏空间对角化

- 所有的循环矩阵都能够在傅氏空间中使用离散傅里叶矩阵进行对角化

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjUxNTVhY2U2ZTcwYTcxNGNiMzQwNDk1NDFmNTY2ZjVfUWRiZGNyRXJTWHZ1ZEtTTzMwSGdsSlpyRDZ0UkNoSk1fVG9rZW46Ym94Y25vUEFhTlZSYTVJUDVsbHBNUUtHQWtiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

其中$$\hat x $$对应于生成X的向量(就是X的第一行矩阵)的傅里叶变化后的值：

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ODg0NjBlMTA3MDQ0MDIxYjQyY2QxNWViMmU2ODQwN2FfejV3UHJGSUxadVBZb3pkZXpBVHRqOHZWY05lUDM0WXRfVG9rZW46Ym94Y25EQ3l1dmFuTEZORmhYZk5BbmgxaTRiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

$$F$$是离散傅里叶矩阵，是一个与$$ x $$无关的常量：

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NWExYzZlNTgwYzA3Mjk5YmYzYzZmMTY5OWRlYjAwOGFfdGo0Qmg5OGd3VlllaVVtV2h6a1RoeDFJN2tXMDN6V3ZfVG9rZW46Ym94Y24wcVZyQXN0allEZ3QyY0l4WVZmYzNmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

关于矩阵的傅里叶对角化请参照 [循环矩阵傅里叶对角化 ](http://blog.csdn.net/shenxiaolu1984/article/details/50884830)，后面的笔记会专门讲解傅里叶变换。

#### 4.6 傅氏对角化简化的脊回归

- 将 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTk1ZjE2NGNlOWYzYjMyOTZhOGFjOWMzNDM3OTM3MDRfUkdBREtrT2wydmgwMlVzM0c2RVFmY2NEM2g4UGl6dThfVG9rZW46Ym94Y25xSXJETEVMT0oxUXphNjlSNzRRNlpjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

带入脊回归公式得到

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NDJmNjBhZmZjZWJhNDI5ZjM5YmIyNzBiOTRmYzFkZmNfUHd5aTNqczUzVkt4OE05dEJ2Ym5kWm9KaG82eVZnVk9fVG9rZW46Ym94Y251YUZMMXJkd29kS3JnY3R1M3RYcTliXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

注意这里的分号是点除运算，就是对应元素相除 。因为 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MzU2NDNlNTgzMTM3MzgyMGJmOTdhYTM0YTAxZjNlOTdfbGd3ZWJFalMyWllVcHQxMXljdTRtaGI2MVFhZ2R2aW1fVG9rZW46Ym94Y25BVzY4ZGxCZFFOVjRJQjVUTUg2aUtjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

,（ [循环矩阵傅里叶对角化 ](http://blog.csdn.net/shenxiaolu1984/article/details/50884830)）对上式两边同时傅氏变换得

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MGMyM2YzNmE4ZjVkOGRlZDkyZDEzMjc4NTIyMzkwNTdfeEhOUGNmZnJSaXlCREtXYjZNVlYwRWtJZUV6SEQzRERfVG9rZW46Ym94Y25ZbWNVZDNIWExiVjdSRkVwUTlac2pmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

于是

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NTc3NWNjYmIwYjRlZDRlMjQxZjEwMmJmMDA2NzhkMzRfbnZyakRuQ2M5SEtRNUJ2dm10V0JGdmExQ0x0dEF1YmRfVG9rZW46Ym94Y25oUDZxeXZPOHM5VzdUUG1jMmV4RGRnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

这里和论文式(12)不一样，论文里(12)式分子上似乎多了个共轭符号,因为Appendix A.5中的式(55)后面那个 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MzllN2Q0ZmRhZDM3MTc2Y2FmNzE5NGQ2MjdhMjlmMTFfVlJ5ZTFXTXE2M0MxODZvYTFSMXZ6a3RGQUJaM2VVOUdfVG9rZW46Ym94Y25sbVJBMndhcGVKbWd1eUlqQmZWVG1nXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

应该是少了个共轭转置符号。

这样就可以使用向量的点积运算取代矩阵运算，特别是求逆运算，大大提高了计算速度。

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MmMyNzE3Y2Q4ZTgyODA4ZmU4NzEwNWFiOWFiZDE2MzdfU3U4dmFhbVV1TWI1V2ZtSExvZ0JORU1WZVIxeUlnVmxfVG9rZW46Ym94Y25TaGpnQ0lJdzBVZ1FjOHAzenV0NEhmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

## 4. 核空间的脊回归

我们希望找到一个非线性映射函数 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZWFjZGRjYTAzZWQ2NGRkYTJhNGU2YjAxMDlhOWQwNDVfWFFDZ09yNVJEQU9uRjJRVVE3WE45ck8ycmdhZ3ZTT0dfVG9rZW46Ym94Y25lZWdQaVlQa0k4bVo1eUZiUERCSzZlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

列向量，使映射后的样本在新空间中线性可分，那么在新空间中就可以使用脊回归来寻找一个分类器 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MmVjMzMzZDUzYzRjOTQ3YjhkMjBhMWI1MTljZTYxMjVfaDFoS3BGRFJtakFQNWZ6R3ZDWVpNUFhPYUpPRzhDbjlfVG9rZW46Ym94Y25RS2l4SXpCSFlhWGJrb09ydXRzS090XzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

,所以这时候得到的权重系数为

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MzI4ZmI3NjMwNGMyYTBkM2FlN2QxYjM4NTYyNjg4OGZfcUVUUWw3TGdtUkhpcGRoNUdnZHNSOGdNSVJ5UkhLcTFfVG9rZW46Ym94Y25sTUVSRU1wb3hDTkZ3YkwxRVBvU09lXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjFmZjkwMzgwMTZkYjY4YWI0N2JlZDQ1MzFlMzBlMDBfQTRPN0xaektPQW8xOUFuZ25sWGVoRTdqMFFTT01CakhfVG9rZW46Ym94Y25kc1NreXlMWEZOdDByWjEzUXAxQnBSXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OGJjMTY0YzRkNjgwMTZjMTgwZDNiMGM4ZTNiNzNjZWVfbHF0V2xHbnFZRmFUOXUxck80VG5jcmJORFBKM0FCNTZfVG9rZW46Ym94Y25KQ2dnMWN1eGladERwY2tEQzNsckpnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

行向量张成的空间中的一个向量，所以可以令

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=N2YzMzgwMmQwZDE0MTg0NDIwOTkyZTUwM2M4ZDk4YzhfWHJzM0Z3a2o4VDF3amJmeXBUc2RQbFBzREJpT0o4YU1fVG9rZW46Ym94Y24yOVRzS2hkaDljMWtseG9JVzd2UWNMXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

上式就变为

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OWE3NTViZTY5OGNjY2U3OGNmZjEzZGUxMDUwY2E0YjBfNU5rTVI0bkgwaXhhYk5JcUdvQjVzZVFQaVRaOVNzWHRfVG9rZW46Ym94Y25TSzk5alpmbkpNREM0RUZ5VElIcjZjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

该问题称为 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmU0OThiYmE2MzdkZWNjZWQ0M2FhNzNkMmJiNzEzYTBfcUxLNEw1YnR6WnVXSU91WWx4NGJWWTVjazdQZkFGVEtfVG9rZW46Ym94Y243VXpwbGJUWVk5N0JOT2tqR29VSTBmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的对偶问题

令关于列向量 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MDdlZjFkMDkzNDY0NWNkYzE4MzkzMTc3N2E0YWMwMmNfck5WVm43N1RwZE9oeWlWYjczSEI1Nlh6dGRocTY3ajlfVG9rZW46Ym94Y256T0NuclRnZWZNZUFadndxcmxmMnliXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

导数为0,

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MzczMmQyMjc3ZDkzZTRkZTk1NjQ0OTYxYjNmZmViNWFfQTFNU0NzaFJIeDB6M1lmb3FyempERVhuWU5QaElrZjNfVG9rZW46Ym94Y241cGM1UG53bmYzVWZGaFM0ZmI2alJoXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

注： 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MDY5ZmE2NzU5M2UzODEyOWQxNDNlMmEwYjRkN2YzOTlfbmRMTEY4amZEWld0dEFRbE1aOUF3cnV4bTB5Sk1kTFZfVG9rZW46Ym94Y25CeG5sRVplWUIyU1NiaVp0MEJ3Z1RlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

其实类似于核空间变量的协方差矩阵，矩阵的转置乘以矩阵，一定可逆。

对于核方法，我们一般不知道非线性映射函数 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NzNiMjAxMDdiMmYxOTc0Y2EzNWEwNmFlZmIyNGNkNDRfdVZCTFZYZ2I3OWtDSm1mRnI4M1FjZThOZXJBdnpJeVdfVG9rZW46Ym94Y240cE1vSWlyREtSMmpSbkVHMzByazJkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的具体形式，而只是刻画在核空间的核矩阵 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NzY4Yjg5MzlkNjhkM2UyZjkwZjAyMTI3ZjUwOWIyOTdfQmxDNkhOam9XODhCeE93eHMxQ3k2N0xZNUxJMlY3SlhfVG9rZW46Ym94Y25rdXhOMmpLUHNMeFVhaldKaU5xbHplXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

，那么我们令 $$$$K$$$$表示核空间的核矩阵，由核函数得到，那么 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YjIyZTZlZDc0YWU3YjZmY2NlZDk0Njk1ZmM5N2M1OTJfZFVYUVJKVWM3YkJ1aVVjSXo1Y0JEVDV3NXNPdk9oSG5fVG9rZW46Ym94Y241dXpDMjl0QXFnUFJaV0FiQzVhVVBmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

于是 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NDgwNjVkMTJkYjY2MDc1NGZiY2U0NTdmYTY5Mzg5NzFfYkhkYzJqdGlLdXlvQ0NKdExXZ2VqYThucE1FWW54bjlfVG9rZW46Ym94Y25iTkExT3lqRE00ZFNRRDBaZEJPaFBiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=N2ZjMmQ1MTZlYjEwYmRkYTI5NzNjM2M3ODk3OGVlNzdfYlU3WG1mUEpYQ0oyZTVVTXc1Y2R3OFlsQ1RjN0lONmhfVG9rZW46Ym94Y25NSm9VUUsyeDFvSTRxa1R5THM0clhGXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

论文提出的一个创新点就是使循环矩阵的傅氏对角化简化计算，所以这里如果希望计算 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MDU4ZGFhZjliYWQ5ZTUxY2EyZjJlNzVmOWVlNmNlOGFfalhpSFFqdEtkNXVncHFvWTJUTXVZVkZyczdUTnZwVWdfVG9rZW46Ym94Y25vUE5sd2w2OVZCaXBEM0lnemU4T0FmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

时可以同样将矩阵求逆运算变为元素运算，就希望将 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZGU5MDlkOWE5N2Q2NTQ0Y2ZlMWM3ZjJhOWE0N2NhZjBfcENXckpVcHdlMko0N29wajJ1WVBJODRZWXFpTFRva0tfVG9rZW46Ym94Y25qS2IwdkhKMFRTS2VHS01qWjdlb0IzXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

对角化，所以希望找到一个核函数使对应的核矩阵是循环矩阵。

> Theorem 1. Given circulant data C(x), the corresponding kernel matrix K is circulatant if the kernel function satisfies 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MzgzNmUyYjJiZTY3MDRjMDlhMWIyZjg5MTg5ZTJjYTdfdElrWHRROUVvcEZJYVpCYW1rUVVPdXVIRVExS2J1VWlfVG9rZW46Ym94Y25ZMjZOUmpXRkFkY3VET0g3WUo2NGFoXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

> ,for any permutation matrix M. 即核矩阵是循环矩阵应该满足两个条件：第一个样本和第二个样本都是由生成样本循环移位产生的，可以不是由同一个样本生成；满足 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZWI0Y2E2YTFhNzVlYzlmZjJhY2JhNTkxZTFlMDBmMGJfUlNJN2dhWlh4akhvNVFFd215UkpTVEFuZk9ybTZQY0pfVG9rZW46Ym94Y25NMnJRbkptQmpKSVlmZGpPRW5uclhlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

> ,其中 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTBjY2I4OTFlODc3MzNjMDNlY2FjMGFhMGI2ZWFjYjRfTXNtbmxZOEhuY0NWSUxjbkxESFIzS0tGZjZiZFRtM2xfVG9rZW46Ym94Y242Mm0ybmhIb3VlNm1vdFlCRkIxY2RlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

> 是排列矩阵。

证明：设 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MWRkYjU0YTY5ZWQxMDZjNTNmMGQzNmMyNDY5NmY0ZDNfQnlUcWU2RXRZTVNvQW9ZaUs1Z3p0TGYyTnJrOGR1Q1FfVG9rZW46Ym94Y25TWGREbEJJYlZuUG1FcjhZN0FIdTNxXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

,则 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YTRhMmNmMWQ1ZGUwMTEwNmEwNWNiNzFiNTA1NDFlNDdfdjhDcU1nVzJ1VmFydG9IZFpzTEJ1SE9rUlVBWVIwMzVfVG9rZW46Ym94Y25QYlVVOVpCcmFVQVlxcVZCM3VjUjNnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

,于是

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NzAxODY5NWIzNWNkZmJiYmI3NzFlMjAyYTVlOWFhNjJfR0E1WndJUWc0bGZxTlRVU0lkc0pXMExhWVFUNG9heXRfVG9rZW46Ym94Y25YNXdoMEtxWmRvVTBxMmRHeldNNzlnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

因为K的第一行为 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NmE2ZTE0YTQ4NjY2ZWRmYjVjMmYwYWM1YWU4NTZkOTlfQjZoWVpyTG5FZjJUN1BuVGNaeDQ5YkRJc2ZEaVVnekJfVG9rZW46Ym94Y25peGpMVUNseTQ0dEYyS2tGTnZLRnJnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

所以 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YzVlMWRjYTU4YmIyMGY3MzYyMjAzOGIyNTEyYTU4ZGRfOHdwQUFINW9jMkJramh3akJKbExUeHJpSlpYcEpBTURfVG9rZW46Ym94Y25EWFFZNE1xNXpjRlRidGpSSE1tUXliXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

相当于将第一行的第 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NDRmOWNiOTQ3MGQ0YjNkMmE0ZDg2MDllM2VjYWRlMDdfN2ZWN3RnT25LZG1mSDBrVFE4aWtYd3Z5Y3o4RGdsS2NfVG9rZW46Ym94Y25TQkR6c0VkWUdsVzlYcWtPbVoyclhlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

个元素放到K的第i行j列上，那么 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MmZhY2U1ZjIzZDkyZjQ0Njk1YjA4MWM4ZGNlNzFmOTZfZnR1cGtLVG01ZG8wTU1Fa1ZsODRlU2dGQXBjdm9pelZfVG9rZW46Ym94Y25Ld2x1OERZdlE2bWxJZGh6N0hpWmNkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

就得到了循环矩阵，所以 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YjgyMWExY2M0ZWFjYTJhZDEwMTU4ZDA5ZGQyYWU1ZjhfRjZjc2xWUjFzVmpRcGlYV2p5S1ZHM3VQYWphZXpkU0hfVG9rZW46Ym94Y24xSHNtaHl4d29rZEFmd3MzanFJWVBiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是循环矩阵。证明里 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=Y2U5ZDBjM2RmYTZmMGQ5YWZlNzk1YTQ4ZTQ1MjU3MDZfME5KZ3VXV05LbzVxZklLYTZkTjBkR3VOZUtvWW9DMDRfVG9rZW46Ym94Y25waWxJaDdUU050aHg1WGo2OFdkY3lnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

表示除 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NmIwN2Y0NTRlNDQ1YmYwOGYyZGFjYjEzNmNiNjQ0MzhfS0FwTTZlSDA4MUtrVm54cWFFVmdxclZRVVp6c0pMa3hfVG9rZW46Ym94Y25tSFAzMjE1TXdRWnM2OVJENHdZMEdjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的余数，因为这个过程是循环的。

证毕。

若K是循环矩阵，则

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=Nzc0Zjc0NmIyYTgyOTM0OGZjODRjMzJhZWVmZGFhYTBfMFQwcGF3WmVpRkNHQm1uMlJIOHExd25wZzdkUWFjWVJfVG9rZW46Ym94Y25YZEtFVEdpRmFOd0VBdWlVZ1MzNkxmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

其中 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NjYyMDIwNmNmMzk4YmRjNzkyYjk3NTJkMDBmNGEwNzFfZ1JJMDI0S2E0SGx5RUxaQm5lQXJwNkJJdFRwS3lIb2VfVG9rZW46Ym94Y25GdVRRNTlFeXpUVEZjb25MRDJ2OERkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是K中第一行。这里觉得奇怪？两个转置？这是因为我们已经约定 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDc4NGE3MWRhMTJkNDRiYjczMzZjNzRiMzQ2ZGRhZjJfQnNzNEYxSEhtd0hQMkVHU3hqeDFFT3hiTnVmM0tPQ21fVG9rZW46Ym94Y253SWt5N3d5Q1JBbnNEM1BZeVBPc0RkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是列向量，而 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OTE2NGM1NDgwMmVmODEyMmNjZTUwZjQ2OWM3MTUyMDJfN1hURHc2UGkzNUFQNHg0R1V4Rmoza0toalcxRXFDUVBfVG9rZW46Ym94Y25RN3JUVzR1WmlKdmJsZ1FqVjhjUDNnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的第i行是 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YjAyNjFiY2M3OGMxMTU4MTRmMDJjYzk1MTUxNzc0Mjlfa3oxMnh2Mm9nMThmaHE5b29ENVZ0RUhlWEk3YXlrSkFfVG9rZW46Ym94Y25tM0hLdkE1MVFJTTVqRVpjNGN1MW1ZXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

，是不是明白了~ 这里推出来的公式和论文中公式(17)也不大一样

那么那些核函数满足上述性质呢？论文中给出

- Radial Basis Function kernels -e.g. Gaussian

- Dot-Product kernels -e.g. linear, polynomial

- Additive kernels - e.g. intersection, 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NWZkMTcyMjAwZDdkMmEzNGE0ZGJkYzM4Yzc1OWU1ZWFfVEI2azFIdnlldlhTcTlPVVUzZ2xaSE9IMm51RE44ZVhfVG9rZW46Ym94Y25wekJUTXVCR3JDMm5sVU85ODVBdnBnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

- and Hellinger kernels

- Exponentiated additive kernels.

###  6. 快速检测

首先由训练样本和标签训练检测器，其中训练集是由目标区域和由其移位得到的若干样本组成，对应的标签是根据距离越近正样本可能性越大的准则赋值的，然后可以得到 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OTQ5Y2I1MmNlZjUwODFiZmY5YzU3OTJhODM2YmRmNWFfV08ydTdwUUNGeERjT3lvTVpLbXd4Njk3em1FNWRTQnRfVG9rZW46Ym94Y25keTRTRmE5RUVLSVV5bXJ5RHExRWRkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

待分类样本集，即待检测样本集，是由预测区域和由其移位得到的样本集合 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MGRkNGE5N2E0MjdjYjkwYTA2OTlmZDMyM2Q2ZmEzZWJfOHk1R2dheGp0Z2NGNG9EUURnQjVmTnYyU1puUU5tMExfVG9rZW46Ym94Y25qMkdQVzFySEtiZ1dmVnVBaktPYk9iXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

那么就可以选择 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=Yzk3MGM4YzA5YzU4MzZmYzI2ZDgzNGUxOWE4NjZjMTNfUDIxYjVhTzhPWm14cDVvQmF3M0c1cVYxc1NlYjI0UDlfVG9rZW46Ym94Y25rd2huT3BHeDg1QXZ1YTlsTzBuYUtnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

最大的样本作为检测出的新目标区域,由 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=Nzk0ODI0MTFhMjk0MjZjODBiZDhkZWZlYzIyMDcwYzRfWTZVblZKdFkzVTNwVXVyUDZIUzY3QWlUZjV1aTdrYThfVG9rZW46Ym94Y24zekFsZ25Ram01RHNudHdHVTFrdDdnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

判断目标移动的位置。

定义 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YzVlM2E2OTE5ZmY4ZDIwNzgyYmI3YmYwZTI5ZDdlZDRfc29zYmVUcFV1SXNKRWhPVm5Sb3FNWWFDZEhiRHJQcDdfVG9rZW46Ym94Y25qY3VyZHZHVGlpQ3QwREpqejNmOE5iXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是测试样本和训练样本间在核空间的核矩阵 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MDdjODVjNGYzNzM5YmVkM2JiMjI2YTdhNGIzMWUyNDJfWTU1TG9FNnF2Y3hzUW9wSkpydHFSempzWW5Rdk1OcnFfVG9rZW46Ym94Y25TaUhwOHVXSDBDUnpmY1VFODFOeE9EXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

由于核矩阵满足 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MjY0ZjdhNmJlMDYyMzA5M2UyOGE3Yzg0OWIyNmY0OGZfSkhhWUNqNzhpSVVROVRrdWEwYWllWE5NZFVYdnpISTRfVG9rZW46Ym94Y25ZY0hzUmVqZGN6UVU4d2dOT2RLUlNmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

,即 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTU4ZWM2MWQ2Y2IzY2JiZjQ1Nzk1NDUyYmZjZDNlM2JfMDB3a0JrTVJjRVIxd0R1TjN3RzVuMmdZbUhqeWN5OFRfVG9rZW46Ym94Y25zOTE3ZVVndk53NWRlS1k3NHhONmxkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

类似于theorem 1 的证明可得 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YTVlYmUxNmQ0Zjk4MjFiOGU1YTFlNTFmMjA4ODM5MjZfUFpNYWlQbnZoWGtYSVFVMzNhNWl3TU56d1podTZKbnRfVG9rZW46Ym94Y25zRTBrMnJUdzdiQXFPRVdRdFNtSUFkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是循环矩阵

我记得曾经见到过有人问非方阵的情况，假设采样窗口非方形，即 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OWIyNTNmNjk2ZTQxODg2NDkxN2VmZmVmNTg1NTM1MTBfajJrbnhpSkFvd1VGbUJ6ajltY0ZSMXdjd1pMTEE0UFRfVG9rZW46Ym94Y25xd2VqVEt4Vm5YNnJueXMxckVmVzhjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

那么采样窗口通过移位都会产生 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NDIzNWE0ZGZiZTU1MzNiN2NmMzRlNGY2OTE3NmNiOTNfTzhBcXZLdzN0bnFJc3J4UnE2SUo5b2tRM004TTBKa0FfVG9rZW46Ym94Y25Xd1ZKV015RHJzeHBaTWdrMlNVbXBiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

个样本，无论是训练样本还是测试样本，所以 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NzAxNTg0MzYwMjMwN2FkZDZjOTI5YmU0ZWZiYTAyZDdfcGwxWUVkbWJheFA2T3AwUk1xSmVIUm9nOEt6R1JEeHRfVG9rZW46Ym94Y25yVk9tU2VWTVJ2bHBzUXc1MkVoWkJkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

一定是方阵

于是得到各个测试样本的响应

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmI5YTBmMWZkNDVmNjQxZmFhYzc5ZWQ1OWExZjI0ZTFfWEh0R3N3SWdKMDlpZUpoRXJSdkFWeUxFTzNlMzczTXJfVG9rZW46Ym94Y25ZbHRSaDFtYVhVdTQ2NnlGOVNRQnRlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

注意我们说过小写的都是列向量， 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OTY2ZjQ5MzEwM2RhNWVmYTI3YzNkZjgxM2I2OWZiODdfU3hhNllmbDI4WjRGblBROVRwczFmcm9qTEQ0akFOUmJfVG9rZW46Ym94Y25mUm1DYVpWelphdERyY3h5cFdFV3ZjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是列向量。注意我们这里 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=Y2NhYzRhMzE2MmZhYjQ3OGEwOWE0YzQ3OTg1ZWFjMzVfZFFoc2hSOEJiQ1ZnU3hyRnRNbmZQR1FnS0JxZWpMeGtfVG9rZW46Ym94Y25PU0syVXVjeE1VMVlIeEs1TjVXdWVmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是矩阵 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NWZhYjJjZWU3MjYwMjFlMzYzOWQwN2NmZTUzMjE3ZjRfUGpzUWtBZHd3anE4RDBZYkVHall1QkFmTldMVTBXbVJfVG9rZW46Ym94Y25vcFJiQjZHc24zUVVib1lTOHZ4ZGhnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的第一行，即 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MDdmODliMjFiZjA1OTEyYzIxODI4Mzc4ZDgxZmI2ZWRfRFBCTXFPbjA2TndxMFE5eGtSN09ibDQwR1UzTGlKbUxfVG9rZW46Ym94Y25XUjN6OVdGQzBCUWtPR3I5cG03cDVmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的第一列，而文中(22)式中 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=Njc5NmFiN2JiZjZiNWU1NGRiMDdjNTAwOTg4M2I1ODFfd3ZkTnRSZDlOZGt3ZG9BZlhzM1RkWjlyY3UzcEQwN3NfVG9rZW46Ym94Y25jc1VNSzY2aFJTS0pES2U4MVQ1ek9lXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是论文中 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YjI1NDhmZDFiMWMxN2ZhMjg5NTk4YmQ0NzdjYjMzYzlfcDB0bHNTbkZCVzVrWGtHckpsUXJNUXlja2IxN3Btem5fVG9rZW46Ym94Y25JZm1WZjByNFoyRkpnOWMxVFZzQ0tjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的第一行，这是因为本文和论文中关于 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmFhNmMxZjUyYzE1ZmI5MzQ4YTI4MTA2MzhiZDIxNGFfaFVNTWlWZlNRTjZIdVk5NUZ6eExsV01QcmJxc0d3U3BfVG9rZW46Ym94Y25jY2F2RW1HOTlrUlRDdkpjeXBFZHRnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的定义正好是相转置的。也就是说我觉得(22)式只是少了一个共轭。。。 觉得蛮奇怪的，怎么和论文中推导结果好多都差一个共轭符号？？ 这是因为 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MGI5NDI2NjIyN2E4NmE0ZmZiMTg1NGQxN2M2MTNiMDJfWmRtUnFlQ1dYa2lmZlE2ckJobjkybEFpQnNPZ1VQT2dfVG9rZW46Ym94Y25zQjRzcUVxOWVqOFhHd3lRc2M4YnZlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

都是对称向量，而对称向量的共轭转置是实数，所以就和论文中一样了，这点参考 [KCF高速跟踪详解](http://blog.csdn.net/shenxiaolu1984/article/details/50905283)

###  7. 核矩阵的快速计算

现在还存在的矩阵运算就是核矩阵的第一行的计算 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MzMzNTA4NjNmM2Y5Y2Q1NWQwMWJmNzc0MTY4ZmY5MmJfQ1BDMjU4b1NlSktWcjhuR2o2ZW40QVZneEduV2xLRFdfVG9rZW46Ym94Y25PRXhOTnhlSEhwN1kzeW5LWWd4MERiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

内积和多项式核

这种核函数核矩阵可以表示成 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDZkYjBiNzBlMDNiYmE5OTA5NjI0OTMwMGZhNGZhYWJfNzRtSVNGNkMxSkF1Yjhkc3lxYlBXdVFXa0UwSFVyOXdfVG9rZW46Ym94Y25MQ1VBVDdLUWVoUFAyQzlVd0hGYThkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

，于是

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MWRmOGY3Y2MwZTQxYTY3ZTU0ZTQzOWI5YzFiZDVjMDlfeTdscUMzWlpYbGpSeTI3Zmd3Vno2SzU2ZWI4OXJFOFFfVG9rZW46Ym94Y243Y3Q4ZEViaktOVDFCSUVqYWx3WmRZXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

因此对于多项式核 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MDc5ZjQ2OTAxOGJkMmFhNDI4MmYyMzEwNDg0YjcxOTFfY2dsSEtFc0t4MVBTb1JGWENQMHRsV2pKVG1XbkdqTm1fVG9rZW46Ym94Y25KSHRsUjZhRGZYbGxHbWF0ZzdIREx6XzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

有

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NWNhZDdkMGZkM2JlNGRmN2NlNmRkZjQyNThlYjhjOWRfUnoyNjJPdUZ1RDAwbkVpUjloeVBBR1o1VUxkSlhpcDVfVG9rZW46Ym94Y25xZEQ4QUZBcW4yeTZTS1FueHNIZG9mXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

径向基核函数 比如高斯核，这类函数是 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MTBkZjEyZGE0OTJmNDM0MGM4ODliYmM1Y2Q0MDVhN2VfRml1U2IxRnRFcjJFQlV1TjZQRmU5ZlRxWk1IdDNNZm5fVG9rZW46Ym94Y25McUJoZ2d1MFgwbkZLbDBaZld5ZUNoXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的函数

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjhkN2Y5ZTU5NGY4YzkwZDVhNWFiZmZiZDBkNjcyYzJfWWJnWWJKODNUS3N6djlVMW1jZ0xFU1JsbmlBRGdKNE1fVG9rZW46Ym94Y245eEQzM2tSQncxMTRQSXk3V09raExmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

所以

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDY4Y2VjN2MyNzhiMzliZWEzMmI2OTBiOGMyNWYzOTdfcUFuczlTSkpnRDk5bGZ1U2pLTEt6cE1wWDhVYzVFYktfVG9rZW46Ym94Y242ZnFOM1VMd3JieG9xMUhUSExtMmNoXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

对于高斯核则有

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NjYwNDg3NTM0Y2I5Y2U1ZTZhYmY0NTA4YzE1ZWZhYjJfUnFtM0FrT0VicHd6MDd2Q09GSWJEcVBhVWdEeHhic2NfVG9rZW46Ym94Y25HQmZ4VXVXaWZlNEJjUEdRWkd2akExXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

###  1D到2D

上面公式推导的很爽，可是都是在1D情况下得到了结论，2D图像该怎么办呢？

这个问题困扰了我好久。。。。刚开始我也想从线性空间的脊回归推导，假设 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NmM0Y2FjYTFkNWQ1YzY1Njg2ZTY4ODYyNzE0YjI4MjNfbnBTMDJ3SVIydXRWd2dUTldDU0xXRTZYMG1PN0FDeFRfVG9rZW46Ym94Y25MSHFERFc2N01mTXY4Q2drMjFTcDBwXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是目标图像， 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NTNiYjM2NzY0ZDU4OGQyZDk2Mzk4OWM4NzY0NzhhMzVfMDZTSjJEU1FINTBwb1g2bUFZdzdndlhnT2kxR3YzdjZfVG9rZW46Ym94Y25TSER1U2tNVExkUTl5TkZxVUlsUldjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是由 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjZjNzAyMWExZGQ5ZDVjNjNjNjcwMjM4MjA3ZGY4ODRfNkU5dlZhNUh0STlLcmhxUlRyamNJa0tEN1lMNzAxYnNfVG9rZW46Ym94Y25YV3ZzT1RiT3dmME01aEhOdTZ0NjdjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

生成的循环矩阵块，即 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OGQyNDEyYmQwOTlmMmRmZmI1YzQ0MGY3MmM2MTFkN2FfS0tCYjB2OHdwQWZ1bzVMSnUzbzhiNjlwdFdnNThGWFhfVG9rZW46Ym94Y25GZGpKRFdteXhseElTVDV0a3Y0eEZlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

表示 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ODM5YTEzOGVjYzYyNWFkN2Q0OWNhZDE1ZGMwMDExZWNfQ3BEeHpMR3RQeGthR0VtQVVkclhrMFQ0M0FnTFNCUUZfVG9rZW46Ym94Y25VVkVUeWJoYU1KSUdBcVFocG5HUlRiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的第 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjA4YzdmZTFkMjNhMTBmNGU3Y2Q0ZjczNWYwZjAyYzVfQW4zWjZTOWlEeVVQQTBjY3lYQ29ZTDF1R2JocFpRY1FfVG9rZW46Ym94Y25qakhLY29sNndQTmZKWE1OcExvN3NnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

块，是由 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OGZhNjg3YjE5MDM4NzU1ZjA1NGU0YzA0NjFjMmEwZjVfRllCNXRKRUUwWDVwTFRlejRVeDJOUWdYcTAyQms5Q0tfVG9rZW46Ym94Y242Q1JGRTBEbkhWMFdMSWVoV0JMTDZOXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

右移 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmVmMGJmMmU2MTZkYWQzYmNiMWQ4YTRiYmM0NGExYmJfWXJibFdrZlE1T1o5UFcxcG1GR3FQamxxSXEzZm8wZU1fVG9rZW46Ym94Y25wQjBRdWNQbWljeWRvYkxLdE9FeFhNXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

，下移 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MmIyODVmM2NhZmE0OTRjZDY3ZjI0MDYxNmNkNzNiNmVfemJuNnUxQWRrNkFRMk14dnllNXFzTVVFVGFLdW1WMWRfVG9rZW46Ym94Y25LOXhWUDZPZDRZVUZqVXpncFBlSElnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

得到的样本块。那么即使块循环矩阵能够通过2D傅里叶变换矩阵对角化又怎么用呢？？因为我们不可能带入 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MDNkYTE0NmM0NDZmNjRlMGM4NWUxOTczNjU1ZWVlN2JfQzN3cmFyNVF4UkRoYkx1NHZnSEpHTjlpVnB5TFVkR3pfVG9rZW46Ym94Y25JNDlsNVlvUmN3MTFUMHp3SlJJdFNjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

类似的式子中啊（这个式子是类比于1D脊回归写的，并无实际意义）

哎呀，想破脑袋啊！

啊哈，想明白了，线性假设下没办法用，直接在核空间推导，发现豁然开朗~

现在有一个函数 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjIwNjBkYTNmNTNjODlhNmIyOTBhYmU5OWJiYjg1ZjhfQjcwblBVN09KRDk1WDZaQ0RzVHYzMmdWcWFtU3k0WUNfVG9rZW46Ym94Y24xdEhzTWdkaFVHZHQzREZob2syRndkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

，自变量 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NzkxNzMwNTQwMzNiNDgyMzI5NWIyYzBjNTM1NmUwYzhfTDRoQnc5N1NYV2JoRTNqajU3cDVlOGVzVUlhRGFPYnVfVG9rZW46Ym94Y25CaldYZXRCOVJkVzI5NldiclpNR1hmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

,因变量 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MTczZWEyOGI5NDllMjE5MWIxNzlkNjk0ZTk0ZDBhNDNfSHQ3clRpQXV4OExyaUlSVnI5NUVOcXhjVmJZOUFuR0FfVG9rZW46Ym94Y25MZkM2ZEpLMDJMS283VTZWY2VtMnFjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

,也不知道怎么映射的，也不知道 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjQxYWE0ODY4ZjM1ZTRjODQzMWM2NWIwZGJhNzUwOGRfR2RacTUzVXZ2MXJ4OERDM09Tams3REs3TG43R0R5MEZfVG9rZW46Ym94Y24zck8wYUV3aW84RUN5V3JxeDhaRnRnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是多少，反正是个确定但未知的值。那么在核空间我们就可以使用脊回归的公式了~

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YjE2NzYwOWI2YmVkMTZjNmM3OTg0NGFlNGZjNmUwMmRfekIyaDVyTGpRdjJCTlJPQ0E5YUwyZTRab1RIZHJWNk5fVG9rZW46Ym94Y25TTHoxR1FzS2hZWkVDdkM3UGF5YzhnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

注意:由 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=N2RkZDhmOWU5ZjI5MTMxYThmOWI2ZjAwMTIzNmMzMGFfRjl3clIyQXluQ29uVEczbURiNUFwZ2xZbEQ4eHZGOEdfVG9rZW46Ym94Y244bU9HMGdHS0ZHOG8xWENCcEx0YTdiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

移位生成的样本共有 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YWM5NDA3NWE3ZGM0NDc2ZTliY2Y4NWE5MTAxMDQ4ZDVfallBR094eG5VTVoyUzN0NzJaTFU0S1V0dDVONDFoTXBfVG9rZW46Ym94Y25EVkYxU0w5RVNndnRPZThxVWJDdWNjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

个，所以 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OWYyMGVmZDE4ZmU3NTEzNGY3ZDA5YjQxMzZkZjI0NjlfS2RBUjhhNnRBanJCb3Z4TnczUFBrMnpXM1FCdld2ZXdfVG9rZW46Ym94Y254RFNRMnYyb1lRaGRQelMxQ0JPZHZkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

，这里 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ODhiMGZkOGVmOTFjNWNmM2UwYzQxNmFkODdjYjIzNjZfWlpyM1UzVTBldkFQT3g0RE9oalE4TzJaZmFjSmRLaUlfVG9rZW46Ym94Y253SkJjNjZRVFR2eVB0dW1yb252Y1VlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

, 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MTA4ZjUxMDM5ODkzMDA1MzEzODVhYzY3MWY3ZmRmYzVfdE8xUDhBNjJjc084djZqOVY2VzFGYTlSNzVUS2JNcmFfVG9rZW46Ym94Y25xRlJkYnNUN2g0U3BLM2JxM3djNlBjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是对应样本的标签， 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NTY1OGQ4Y2I5ZjFhMTQ1ZGQ1ZmI3MGJkNTQ3NzUxYzJfNEd2RExyYzhrUDg1bUNlWXVJS25pUFF2dzd6c0Z0VXJfVG9rZW46Ym94Y245NUozZE5RSTBUNVBrUWZlRU9Vb25oXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是对应样本标签的矩阵形式。

ok，现在再来看看定理2

> Theorem 2. The block matrix 

> 

> with elements 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTVjMDFmYmNkMDUwN2M3NTc5OGNmYTY2MWRjZmFkYWNfNktQdjc5Y0k2enJVaGdwR2hTeUxhTmxSVXFoNDA1OWVfVG9rZW46Ym94Y25aWUNsbXhQWnNWcFRDTEFJRjlTTzJjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

> is a Block-Circulant Matrix (BCCM) if 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDMyOWVjYjYyNjcxYzY3NTVmMmNiNDljZDhmODM0ZTRfZW9wQkNzRGVFbDJCTWF2T0pyT1laQTdOWmNRV2NaSFNfVG9rZW46Ym94Y25SS0NIY1B0a0dhblo3OWI5dTRTZnFnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

> is a unitarily invariant kernel. 这里和Theorem 1是类似的，a unitarily invariant kernel就是说 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NzM3ZGI5ZGMxOGQzYzljMDg5MjhiNzZmMjI3ZGNiZDZfVVc1MmNaV1UzT29mWXlOZVlDa0h4Ynd6RTQ3NmxFZ3pfVG9rZW46Ym94Y25ONFRXSFhSeGVrc0MxMG9zYU95VHllXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

> ,定理的证明参见Theorem 1.

> 

而径向基核，dot-product kernel等都满足这个条件，所以得到的核矩阵都是块循环矩阵。

块循环矩阵可以使用2D傅里叶变换矩阵对角化（ [循环矩阵傅里叶对角化 ](http://blog.csdn.net/shenxiaolu1984/article/details/50884830)）

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=N2Y5MzIyNjM0NTZhOGE3MTUzMWQ0ODQ2YjAyOTJiMTRfWGZRTGlJbXZBdXVZaWZ3UDZHMUN1TWlFYXRta0loWGdfVG9rZW46Ym94Y25BYXZBd01qMHphQ2ZYVk5SZDFzYzZlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

其中 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YTRiNzY3OTU2YWM0MTY5ZWQ5OTI1ZjRiNGY5MmNjODZfRUZNYm03MHgyRHR1UldqaWY1R1ZVWTM4MzNwYVlLMmZfVG9rZW46Ym94Y25WS0xkMDBhRXB2RTNTaFFTWW9iRWRzXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是2D傅里叶变换矩阵， 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NDAyOTY0YjNiNTM5ZjM5MDM5ZWUzNzMxNzczMDYyYjhfRE4yRlcxcUZLN1B6NlNKanE3SmF4RTlla2t6T1lnVGFfVG9rZW46Ym94Y25zZndndjhScnUySms1RjJpd0w2VVplXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

是生成块循环矩阵 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YjA0MmQ4YTg2MWYzYzhhMGQyYjdlMzk1ZGVlZDAxN2Zfb0tjbGEyeG9KNmVkbkFtdFVlN3B2Z29OaEQ3RkVBR2dfVG9rZW46Ym94Y25aakxiUVU0dWoxbHlLYmdzT2xUNVpnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的生成矩阵， 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NGI5MGM2OGU2ZDg4MmY3MWIyOWQxODZhMjAzMGFjMWRfY2pMRTZsTTc2V1Z4ZG5GT0loaEIzTHprQzRsa1BrblRfVG9rZW46Ym94Y25admh4UWVZMDFyZzZQbk5UMUlFT0ZkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

表示对 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NjBiMzZlYjhkYWRhYWUzY2QwYjM4Y2RmM2Y2OTQ4MTNfbHdzOUQ0cmZhYkF3SVJrMDEydlFjMjdsTnE5RThqeU5fVG9rZW46Ym94Y25xR0NGbDBPZkNiaVpxQTZoQ0IyMW1kXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

进行2D傅里叶变换的结果。

ok，那现在

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjhhNWExMGZmZGJjM2I4YTU1Zjc2MDI0N2EzMWJiN2ZfQWFmQTZzVWVrUnVqbHF3eWNCTkRUMEpWdHNFZ25ycE9fVG9rZW46Ym94Y25kaDNJWjlta3lQc0FUVDduNmRZdlNiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

其中 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YTgzNGM2YzM0YTgzNzlmYzUxZjRhZjcwNWNhMzNiNGVfRUpUOEF1MnUwaDV5NEFLVmxtbEI2cFFLRDQwSGFqY01fVG9rZW46Ym94Y25mQTJHOE12ek9ZOWdFSWxySlFmMnlnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

表示全1的m维列向量。

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=Nzg2NDI1ZDI3YmE5NWNhNjJkNGFhMjY1Y2Q1Mjk0YzdfYVVqR0VnNnh4SW9PVXN1UGVOTTlJQVBHZElqSkVZUDNfVG9rZW46Ym94Y25XV0g4UVpDek4wbkRaRWlqOEVGYW1kXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

这里的 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YWJmYTMyZGIwOTQ1MzZhMjY0YzJlYTlmYjc4ZGI4OTlfc3hhUFh1bjk2TnNjRFU0TTNWc2hSWW9jTlNXbnBpZXZfVG9rZW46Ym94Y25JNGRTcjlqbHJWSVRxc2tDOTk5bUNjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

分别对应着 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NmJmMGFjM2Q3MzY2NGExMjIxMDlkY2Y3YTc1MTA3NTFfcTR0QVZtR0RmYW5lcWpZZVkyY2R0YmM1NHJvWTBQbk1fVG9rZW46Ym94Y25CNmhNWHpXUjJva1IzcXFRdHU2R2NlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的矩阵形式。

对应的响应

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OTBlMGU2ZjliNTQxN2RjODI1NzBhOGYzZjEzNzYzYTZfbTF1V3Q5OVNWREE1WjhUY1BzTWxlRlQ5eFUzeFlLS29fVG9rZW46Ym94Y25kSE40NXQyR2VWdUpJa1J2V2FOTldiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

其中 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MmJhNjMwMDFjZTAzZDdlOTdlNzBjZDE0NWM3ZjliYzhfS3EwaWI2Z2JkZlVIbDExejFrZFVUeFA3RWlmaXU1WWpfVG9rZW46Ym94Y253Q01NcjVMRVpyTlFLTEZQeG5XMnhkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

表示块循环矩阵 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MGUxMzI2YmRhYTdiODE3ZGNkNDA4MTg4ZTA4ODUwNjNfYW1WenA4ODdQaFpNYjlzelpYelhmeFNYREVja2xyQ3JfVG9rZW46Ym94Y250c2tzVkdIeU5NcTVwckJjR1hmclRnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

的生成矩阵。

后面测试就类似于1D不推了

### 多通道问题

论文中在提取目标区域的特征时可以是灰度特征，但是使用Hog特征能够取得更好的效果，那么Hog特征该如何加入前面提到的模型呢？

Hog特征是将图像划分成较小的局部块，称为cell，在cell里提取梯度信息，绘制梯度方向直方图，然后为了减小光照影响，将几个cell的方向直方图串在一起进行block归一化，最终将所有的cell直方图串联起来就是图像的特征啦。

那么，按照传统的方式一张图像就提取出一个向量，但是这个向量怎么用啊？我们又不能通过该向量的移位来获得采样样本，因为，你想啊，把直方图的一个bin循环移位有什么意义啊？

所以论文中Hog特征的提取是将sample区域划分成若干的区域，然后再每个区域提取特征，代码中是在每个区域提取了32维特征，即 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NDQ5ZDc0Mjk4YmFlYjlhZTlhZDcyMTA1YjI4NzU3ZjFfSUhXTkhjcVJYMXNoV1B6Mk9ibTQxUldpeTdHZzlZakNfVG9rZW46Ym94Y25wUjVwdFF0ZmdZaXZpcGtLNm96ekFoXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

,其中 

就是梯度方向划分的bin个数，每个方向提取了3个特征，2个是对方向bin敏感的，1个是不敏感的，另外4个特征是关于表观纹理的特征还有一个是零，表示阶段特征，具体参见 [fhog ](http://www.cs.berkeley.edu/~rbg/latent/index.html)。提取了31个特征(最后一个0不考虑)之后，不是串联起来，而是将每个cell的特征并起来，那么一幅图像得到的结果就是一个立体块，假设划分cell的结果是 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OWZjNDEyZjAwNzQ1NGUxY2RiYTVjYjhhYjAyYzM4M2ZfWVlIeFo0Q2xHN3dUZndYQVc3azhvTWlsdm04REk4SEZfVG9rZW46Ym94Y25YT3k0dVM1RXRBUUVaaGpzZENSWGpoXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

,那么fhog提取结果就是 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YjRkYjM5M2I1NTY3Mzk5ZmNjMTkzOTg5MTQxNGU3MGJfNlVpZGY2TloyQ2N6VFRub1hTWUNjRUtYT0NsU25qUlVfVG9rZW46Ym94Y25QaXdpbG5wSmhudmJnODBTb1c1aDRiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

,我们成31这个方向为通道。那么就可以通过cell的位移来获得样本，这样对应的就是每一通道对应位置的移位，所有样本的第i通道都是有生成图像的第i通道移位获得的， ，所以分开在每一个通道上计算，就可以利用循环矩阵的性质了。

我们来看1D的情况，1D弄明白了，2D也就明白咯，因为我们上面说了怎么推导2D的 样本cell数为M，每个cell特征维数为L,第 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YjMxMjQ2MzhiZWQ5Y2E2MjZmN2NlYWI0MzQ4N2M0ZWNfNGY3bFU2ZlZCYll2T1B1RWVLOHZiaHNxRTUyb2VWaEhfVG9rZW46Ym94Y25RN2UyWVNWR3VyTWZoMVM4Yk9xV2VkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

个样本的第 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YmRhNzIxZjEzNzg4OGNiYWQ5M2VjYmYyYTZhYWUwZTZfMmJGd3ByakhxWjNIbVlueWw1VktRbXdnOEJ4S05nUmZfVG9rZW46Ym94Y25DMXpvQk1iT2lXNGpUNWVPOFFtaDJjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

通道向量表示成 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MDFjZDVlMzE3Yzg2MGYyODVmOTRjYTMyOGUyOTcyZGVfT2Y0STZZQ1JzR2JNdUFBSHBWVVNIdFhybGc4NVoxTDFfVG9rZW46Ym94Y245TXpXRjYyNUZ1SFlYZ0lQRm1rWmloXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

，样本的总特征可以表示成 

于是K矩阵的第一行有

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MWU0Y2M4NTllNGMyOWJkZWRlYjM0YjBjOGVhMzIyZDRfRkJVUmdzanpjMldaVjVkRHdWWTlpRFBkdUlpZm9VUmpfVG9rZW46Ym94Y25rVlk5TkhNbmkwc2JIQko2a3p2cDdlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

这里用到 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NWFjZTI2ODhjYzk5Mzk1ZTQzMmM4YTI0M2IzNDNkOTJfNnYydVJ6bUJtM0lGR0FQTmszWUg1Y0Y2MlU2Q1Y1bm1fVG9rZW46Ym94Y25CVG1wMEhISXA0RlZ2SUxYQXJRRzJiXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

这是dot product kernel的情况，那径向基核就很容易推了

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YmIxOTUwNmY4OGVmNjliNTM3Y2M0MDhjOTM3ZTUzNjFfWElSOGxvdDFvUlBTVmNCbk1JOWh2ZzNnOEZPenhkeW1fVG9rZW46Ym94Y244azNMakVWVUdMSVJHNXNLZjRSakJkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZGJhNWU4YjMwYTVlY2UxM2YxYTEyOGQ4MTNkMzkxODhfU0Y5MHExT1dPUW5MT09ZMlVldGRRemphRVZSeHhpUmlfVG9rZW46Ym94Y25QZ3NYNlpJWm5TbkFIeHY2TUVnelBmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

###  8、总结

KCF相对于其他的tracking-by-detection方法速度得到了极大的提升，效果也相对较好，思想和实现十分简单。

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YzUxNTMxYjVlZjFlZjgzZmVmN2NjZDg3ZGFiNWJjODFfYzBBOW9JUUtiRVdFMTVxNzlBNDJGazkwM1NBVzB4akJfVG9rZW46Ym94Y25rNG1oUk1oYTViVzdxelU2YnhSYVpTXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

借上图来总结下KCF的过程，左图是刚开始我们使用红色虚线框框定了目标，然后红色实线框就是使用的padding了，其他的框就是将padding循环移位之后对齐目标得到的样本，由这些样本就可以训练出一个分类器，当分类器设计好之后，来到了下一帧图像，也就是右图，这时候我们首先在预测区域也就是红色实线框区域采样，然后对该采样进行循环移位，对齐目标后就像图中显示的那个样子 了，（这是为了理解，实际中不用对齐。。。），就是周围那些框框啦，使用分类器对这些框框计算响应，显然这时候白色框响应最大，因为他和之前一帧红色框一样，那我们通过白色框的相对移位就能推测目标的位移了。

然后继续，再训练再检测。。。。

论文中还说到几点

1. 对特征图像进行cosine window加权，这主要是为了减轻由于边界移位导致图像不光滑。

1. padding的size是目标框的2.5倍，肯定要使用padding窗口，要不然移位一次目标就被分解重组合了。。。效果能好哪去。。

1. 对于标签使用了高斯加权

1. 对 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmI1YjMzNjdmMGFlMzNmMDBlNGYzMDIzZGY4OGEzZDhfa0dtNHYyYW81VEI1enJhTjNMcVJvMWxwNVhEa29oVjhfVG9rZW46Ym94Y24xUURDNnRqRXM5NzY0ZDVPVVBPTnJjXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

1. 前后帧结果进行了线性插值，为了让他长记性，不至于模型剧烈变化。

但是其缺点也是很明显的。

1. 依赖循环矩阵，对于多尺度的目标跟踪效果并不理想。当然可以通过设置多个size，在每个size上进行KCF运算，但这样的话很难确定应预先设置多少size，什么样的size，而且对size的遍历必将影响算法的速度。KCF最大的优势就是速度。

我在想能不能通过少量特征点的匹配来调整窗口的size，当然这样的话，速度也是个问题

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MzNkMTgzNzdkN2YzNjA1MTc5NjZkNTI1NWI1ZjQwYjVfYXZkZm1IUkFoZGMxeXJEaGZsa21MRmxDZENBTXVjVDdfVG9rZW46Ym94Y25HZHM0REM1cWMxZ3F1OGFTYUFhc0tkXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

这种情况下还能保证最大响应就对应着目标中心所在的框吗？如果不能偏差会不会越来越大？

1. 初始化矩阵不能自适应改变，其实这个问题和上一个缺点类似，这里强调的是非刚体运动，比如跳水运动员，刚开始选定区域肯定是个瘦长的矩形框，但当运动员开始屈体的时候显然这个预选定框就很大误差了。

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=MzQwMTI4MDY0MTA1YzRhMmMxNjIyMDUxMWFkYmU2MTdfWUZCZnc2dU5Bd2hVNDhuU05Jbzlhdzg3aHhodVhjOWlfVG9rZW46Ym94Y242WHhSZm9maXFLZDhmUXVCSnNWNnhnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

3.难处理高速运动的目标

1. 难处理低帧率中目标，这个和3类似，都是说相邻帧间目标位移过大。

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=NDQ4NTBiMzFiYjZiMGI3YmE4MjBlYjZiYTQwZTJhZTRfRENBUUJQM09CR3RVTGxDdmZsY29RYWF0TlJnOTJhNUZfVG9rZW46Ym94Y25BZFhFZ1UybTRtdGpJQ3dyN3V1T2VlXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

目标下一帧出现位置不在你的padding内，你怎么也不可能移位找到。。。

5.虽然算法中对模型系数 

进行线性插值，但是对于目标一旦被遮挡若干帧之后，可能模型就再也回不去了。。。因为模型已经完全被遮挡物污染掉了。

6.我觉的论文还有一个问题就是仅仅通过检测到的框中心和目标实际中心的距离来度量性能，这是有问题的。 比如我现在有一个人垂直我的镜头逐渐远去了，但他的中心一直在我镜头的中心处，那我就开始画个框就是镜头的视角范围，那这样我检测结果百分之百，可是有什么用呢。。。。当然论文方法是在很多不同数据集上检验的性能还是很有说服力的。我的意思就是对于单个数据集不能仅凭这个指标定方法的好坏。

### 9 EXPERIMENTS

#### 9.1 Tracking pipeline

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=YTIwMDZiOTBiNzk4NzUxYmJlMWRjOTc4MmFmMzIyOWJfUWhDRWs3OFlnT1lpbFBiWVFNdWUzZHpZODVYdlZJVlBfVG9rZW46Ym94Y25YTHNxTHZ6VFJDWGQ0RDlpVDhpbVlmXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

#### 9.2 Evaluation

在50个序列集上进行测试对比。 

![img](https://tjkcbgi37n.feishu.cn/space/api/box/stream/download/asynccode/?code=OGQ5NTZmYWM5OGVmOTFlYzg0YTMyNmI1YjE5MDAxYjBfdHB0WmxRRDh6bDBNQUJvREgxcHFkS1J5MFNScDdNMUhfVG9rZW46Ym94Y25rVnhldHBIUlN0b0VYQ095eHNwRjRnXzE2NjMyMjA0NDI6MTY2MzIyNDA0Ml9WNA)

最后结果是0.732，精度还是不错的，比着原有算法有大幅度提升。

### 10 CONCLUSIONS AND FUTURE WORK

In this work, we demonstrated that it is possible to analytically model natural image translations, showing that under some conditions the resulting data and kernel matrices become circulant. Their diagonalization by the DFT provides a general blueprint for creating fast algorithms that deal with translations. We have applied this blueprint to linear and kernel ridge regression, obtaining state-of-the-art trackers that run at hundreds of FPS and can be implemented with only a few lines of code. Extensions of our basic approach seem likely to be useful in other problems. Since the first version of this work, circulant data has been exploited successfully for other algorithms in detection [31] and video event retrieval [30]. An interesting direction for further work is to relax the assumption of periodic boundaries, which may improve performance. Many useful algorithms may also be obtained from the study of other objective functions with circulant data, including classical filters such as SDF or MACE [25], [26], and more robust loss functions than the squared loss. We also hope to generalize this framework to other operators, such as affine transformations or non-rigid deformations.

到此为止，本篇的主要目的就是给大家梳理一下，给那些不想深入去了解的同学一个可以分析的参考路线，看完我说的这些，基本上你对KCF计算有一个大致的方向，如果只是想拿来使用，基本没什么问题了，想要进一步提升的话就要你去仔细专研

4.1 线性回归

一维

二维

复数

4.2  Cyclic shifts 周期性变化

Fourier domain formulation 傅里叶域公式

以下是论文摘抄

An illustration of the resulting pattern is given in Fig. 3. What we have just arrived at is a circulant matrix, which has several intriguing properties [34], [35]. Notice that the pattern is deterministic, and fully specified by the generating vector x, which is the first row. What is perhaps most amazing and useful is the fact that all circulant matrices are made diagonal by the Discrete Fourier Transform (DFT), regardless of the generating vector x [34]. This can be expressed as
where F is a constant matrix that does not depend on x, and xˆ denotes the DFT of the generating vector, xˆ = F (x). From now on, we will always use a hat ˆ as shorthand for the DFT of a vector.
The constant matrix F is known as the DFT matrix, and is the unique matrix that computes the DFT of any input vector, as F (z) = √nFz. This is possible because the DFT is a linear operation.

Correlation filters have been a part of signal processing since the 80’s, with solutions to a myriad of objective functions in the Fourier domain [21], [28]. Recently, they made a reappearance as MOSSE filters [9], which have shown remarkable performance in tracking, despite their simplicity and high FPS rate

The solution to these filters looks like Eq. 12 (see Appendix A.2), but with two crucial differences. First, MOSSE filters are derived from an objective function specifically formulated in the Fourier domain. Second, the λ regularizer is added in an ad-hoc way, to avoid division-by-zero. The derivation we showed above adds considerable insight, by specifying the starting point as Ridge Regression with cyclic shifts, and arriving at the same solution. Circulant matrices allow us to enrich the toolset put forward by classical signal processing and modern correlation filters, and apply the Fourier trick to new algorithms. Over the next section we will see one such instance, in training non-linear filters



---


## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.


## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)