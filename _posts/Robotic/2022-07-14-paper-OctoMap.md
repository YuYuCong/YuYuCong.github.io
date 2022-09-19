---
layout: post
title: "paper:OctoMap"
subtitle: "OctoMap: An Efficient Probabilistic 3D Mapping Framework Based on Octrees"
categories: [SLAM]
tags: [Algorithm, SLAM, Mapping, Navigation, OctoMap]
redirect_from:
  - /2022/07/14/
---

>  OctoMap: An Efficient Probabilistic 3D Mapping Framework Based on Octrees


* Kramdown table of contents
{:toc .toc}


---

Created 2022.07.14 by Cong Yu; Last modified: 2022.09.03-V1.1.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

---

# OctoMap

- code [https://octomap.github.io/](https://octomap.github.io/)
- API doc [http://octomap.github.io/octomap/doc/](http://octomap.github.io/octomap/doc/)
- paper [http://www.arminhornung.de/Research/pub/hornung13auro.pdf](http://www.arminhornung.de/Research/pub/hornung13auro.pdf)

## Abstract

- We persent: an open-source framework to generate volumetric 3D environment models.
- Our mapping approach is based on 
  - octrees
  - probabilistic occupancy estimation.
    - It explicitly represents not only occupied space, but also free and unknown areas. 
- Furthermore, we propose an octree map compression method that keeps the 3D models compact. 保证模型紧凑的压缩方法
-  We present a series of experimental results carried out with real robots and on publicly available real-world datasets. The results demonstrate that our approach is able to update the representation efficiently and models the data consistently while keeping the memory requirement at a minimum. 具有可靠的实验结果

## 1 Introduction

- bottleneck: The lack of readily available, reliable, and efficient implementations of 3D mapping.

- three requirements: 三个需求

  - ### - probabilistic representation

  - ### - unmapped area

  - ### - Efficiency

- Several approaches have been proposed to model 3D environments in robotics: 现有方案

  - pcd
    - store large amounts of measurement points and hence are not memoryefficient
    - do not allow to differentiate between obstacle-free and unmapped areas 注意：能区分free和unknown是个非常重要的需求
  - elevation maps (Hebert et al., 1989)
    -  efficient but do not represent unmapped areas either
  - multi-level surface maps (Triebel et al., 2006)
    -  efficient but do not represent unmapped areas either
  - Most importantly, these approaches cannot represent arbitrary 3D environments, such as the branches of the tree in the example. 无法反映一种拓扑结构
  - volumetric (our framework)

  

## 2 Related Work

略

## 3 OctoMap framework

### 3.1 Octrees

- Octrees: 一种分层的数据结构 8叉空间表示（或许还可以有4维的？16叉，需要合理的物理意义）

- voxel: node in an octree represents the space contained in a cubic volume. 体素

- resolutions: 分辨率，体素的大小，不同层级使用不同的分辨率

- volumetric model and tree representation.

  <img src="/home/trifo/code/sync/DevelopNotes/img/Screenshot from 2022-07-14 14-41-30.png" alt="Screenshot from 2022-07-14 14-41-30" style="zoom:67%;" />

- Boolean property.

  - In its most basic form, octrees can be used to model a Boolean property.
  - 0 free or unknow.
    - free 的解释： eg. laser传感器与end point之间都是free
  - 1 occupied.

### 3.2 Probabilistic Sensor Fusion

- log-odds

- This formulation of the update rule allows for faster updates since multiplications are replaced by additions. 因为是加法，所以概率更新计算非常块

- <img src="/home/trifo/code/sync/DevelopNotes/img/Screenshot from 2022-07-14 15-02-24.png" alt="Screenshot from 2022-07-14 15-02-24" style="zoom:50%;" />

- <img src="/home/trifo/code/sync/DevelopNotes/img/Screenshot from 2022-07-14 15-03-33.png" alt="Screenshot from 2022-07-14 15-03-33" style="zoom:50%;" />

- node 中保存log-odds，而非the occupancy probability

- 两者可以转换，但是log-odds的概率更新很迅速

- 但是要注意根据sensor的模型设置更新参数

- a clamping update policy: defines an upper and lower bound on the occupancy estimate

  - two advantages:
    - we ensure that the confidence in the map remains bounded and as a consequence the model can adapt to changes in the environment quickly
    - we are able to compress neighboring voxels with pruning。

- 最终的更新公式：occupancy estimates are updated according to

  <img src="/home/trifo/code/sync/DevelopNotes/img/Screenshot from 2022-07-14 15-06-57.png" alt="Screenshot from 2022-07-14 15-06-57" style="zoom:70%;" />

### 3.3 Multi-Resolution Queries

- 当有新测量插入时，只有叶子节点的概率会被更新
- 父节点的概率可以通过8个子节点的值计算得到，计算方法可以简单使用
  - 8个子节点和的平均
  - 8个子节点的最大值

### 3.4 Compression

### 3.5 Extensions

## 4 Implementation Details



## 5 evaluation

## 6 case





