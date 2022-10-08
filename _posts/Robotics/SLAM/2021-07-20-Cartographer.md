---
layout: post
title: "Cartographer Overview"
description: "Cartographer Overview"
categories: [SLAM]
tags: [cartographer,SLAM, paper]
redirect_from:
  - /2021/07/20/
---

>  Cartographer Overview

* Kramdown table of contents
{:toc .toc}
# Cartographer Overview

Created 2021.07.20 by William Yu; Last modified: 2021.07.20-V1.0.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 William Yu. Some rights reserved.

---

<p style="font-size:26px;color:;text-align:left;">References</p> 

papers

- Real-Time Loop Closure in 2D LIDAR SLAM https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/45466.pdf
- Cartographer Ros https://google-cartographer-ros.readthedocs.io/en/latest/
- Algorithm walkthrough https://google-cartographer-ros.readthedocs.io/en/latest/algo_walkthrough.html
- Ros Cartographer 调参 https://google-cartographer-ros.readthedocs.io/en/latest/tuning.html
- Github https://github.com/cartographer-project/cartographer
- code note https://zhuanlan.zhihu.com/p/47997092
- A Review of Point Cloud Registration Algorithms for Mobile Robotics https://hal.archives-ouvertes.fr/hal-01178661/file/2015_Pomerleau_FnTRo_Review.pdf  ICP及其各种变形，2015比较详细的综述
- grid map http://ais.informatik.uni-freiburg.de/teaching/ws15/mapping/pdf/slam10-gridmaps.pdf
- Bilibili https://www.bilibili.com/video/BV1nV411Z7W5?from=search&seid=8833147598009061857
- code view https://zhuanlan.zhihu.com/p/48010119

blogs

- 泡泡机器人SLAM https://mp.weixin.qq.com/s?__biz=MzI5MTM1MTQwMw==&mid=2247484537&idx=1&sn=86200d961cf933896a9781bbe58442cc&chksm=ec10ba7ddb67336ba920a3c6b7e6414a0131bb775d6695e526d25dc6d377e31578684e83f802&scene=1&srcid=0925Vlxe9psorns6CY8O4sC7#rd


## Ch0 Basic Concepts


### history

1. 2D scan matching
   - scan to scan matching -- ICP,etc
   - scan to map matching -- Hector SLAM,etc 
2. GMapping
   - 使用了 IMU 
     - 作用1：将倾斜的雷达数据投影在水平面上面，如果机器人是水平移动，完全可以不适用 
     - 作用2：提供一个 initial guess 用于 scan matching
3. cartographer
   - 2016 

### lib

- Ceres / g2o
  - Ceres user handbook http://ceres-solver.org/users.html
- Eigen

### advantage

- 2016

- 论文精度：室内 5cm resolution

- 用途：室内

- Sensor：激光雷达，IMU，里程计

- Input: 

  - IMU linear_acceleration angular_velocity；
  - Odometry current Pose
  - Rangefinder（激光雷达） 的 origin和ranges
    - origin是rangefinder在robot坐标系下的位置
    - ranges是robot坐标系下的点云（3维）

- 重点

  - submap 的选择
  - 闭环检测的加速策略

- 主要代码：（2d 相关）

  1. map_builder是最顶层，cartographer_ros用cartographer就是通过这个。
  
  2. global_trajectory_builder： 使用了全库核心，数据给到**local_trajectory_builder，** 结果再给**sparse_pose_graph**（local是相对于global的，是指没有全局优化，并不是说robot坐标系； ）
  
  3. submaps 可以看到怎么管理子图，子图的position和robot pose的关系 （submap的local pose指的submap在世界下的位置）

  4. ceres_scan_matcher和几个使用的functor可以看到怎么在做scan to map match。 它的优化除了论文上的损失函数，还加了对初值的约束；计算residual查找grid中的值时用了插值ha。
  
  5. probability_grid和range_data_inserter写了grid map是在怎么迭代更新的，写成查表很快
  
  6. 3d和2d在同一个框架下，差别不大
  
     主要差别： 
  
     - 3d前端用了ukf，代码中写了参考文献的
     - 另外在优化时，3d多了些优化，包括优化imu的重力方向
     - 3d没有那么多拧巴的维度转换，不需要水平化，应该会看得通畅些
  

## Ch1 Grid Maps

refitem: http://ais.informatik.uni-freiburg.de/teaching/ws15/mapping/pdf/slam10-gridmaps.pdf

- Discretize the world into cells  将世界分割成一个个cell
- Grid structure is rigid Grid结构是坚固的
- Each cell is assumed to be occupied or free space  每个cell有两种状态
- Non-parametric model  无参数模型
- Large maps require substantial memory resources  大地图需要较高的内存
- Do not rely on a feature detector 不依赖于特征检测

### Assumption 1

- The area that corresponds to a cell is either completely free or occupied. 一个cell只能有三种种状态：空闲的或者占据的或者Unknow

Occupancy Probability

- Each cell is a binary random variable that models the occupancy 
- Cell is occupied: $p(m_i) = 1$
- Cell is not occupied: $p(m_i) = 0$
- No knowledge: $p(m_i) = 0.5$

### Assumption 2

- The world is static. 世界是静态的

### Assumption 3

- The cells (the random variables) are independent of each other. 每个cell在概率上彼此独立。

Representation

- The probability distribution of the map is given by the product over the cells.
  $$
  p(map) = \prod_{i} p(m_i)
  $$

### Estimating a Map From Data

#### Static State Binary Bayes Filter

#### From Ratio to Probability

#### Log Odds Notation

#### Occupancy Mapping Algorithm



## Ch2 Local SLAM 

- post https://blog.csdn.net/weixin_36976685/article/details/84994701



## Ch3 Closing Loops

- post https://gaoyichao.com/Xiaotu/?book=Cartographer%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB&title=%E5%88%86%E6%94%AF%E5%AE%9A%E7%95%8C%E9%97%AD%E7%8E%AF%E6%A3%80%E6%B5%8B%E7%9A%84%E5%8E%9F%E7%90%86%E5%92%8C%E5%AE%9E%E7%8E%B0



------




## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.


## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)



