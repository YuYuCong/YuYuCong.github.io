---
layout: post
title: "Visual SLAM算法相关库介绍以及安装"
description: "vslam"
categories: [SLAM]
tags: [SLAM]
redirect_from:
  - /2018/05/25/
---

> 视觉SLAM十四讲（2017年3月第一版）中提及的库安装使用记录

* Kramdown table of contents
{:toc .toc}
# Visual SLAM算法相关库介绍以及安装 

Created 2018.05.25 by William Yu; Last modified: 2019.03.19-V1.1.0

Contact: windmillyucong@163.com

Copyleft! 2019 William Yu. Some rights reserved.

----

## Tools

[1] CMake 

- <https://cmake.org/cmake-tutorial/>
- <http://sewm.pku.edu.cn/src/paradise/reference/CMake%20Practice.pdf>

[2] git g++ gcc

[3] Ubuntu1604


## Requirements & Tutorials

[1] Eigen 线性代数库 <http://eigen.tuxfamily.org/dox-devel/modules.html>

[2] Sophus 李代数库

[3] OpenCV 计算机视觉库 <https://docs.opencv.org/3.3.1/d9/df8/tutorial_root.html>

[4] PCL 点云库 <http://pointclouds.org/documentation/tutorials/>

[5] Ceres 非线性优化库 <http://ceres-solver.org/tutorial.html>

[6] g2o 基于图优化的非线性优化库 <http://pointclouds.org/documentation/tutorials/>

[7] gstam 基于因子图优化的SLAM后端库

[8] DBoW3 词带模型库

[9] Octomap 八叉树地图库

## Install

1. 安装g++,git,cmake等常用工具，编辑器推荐使用VSCode

   ```shell
   $ sudo apt-get install -y cmake git g++
   ```

2. P44 安装Eigen

   ```shell
   $ sudo apt-get install libeigen3-dev
   ```


3. P60 安装pangolin 

   ```shell
   sudo apt-get install libglew-dev
   cd ~/src
   git clone https://github.com/stevenlovegrove/Pangolin.git
   cd <path_to_pangolin>
   mkdir build
   cd build
   cmake ..
   make -j4
   sudo make install 
   
   =====潜在的问题=====
   https://blog.csdn.net/limhsysu/article/details/84959736
   ```


4. P77 编译Sophus

   ```shell
   cd ~/src
   git clone https://github.com/strasdat/Sophus.git
   cd Sophus
   git checkout a621ff
   mkdir build
   cd build
   cmake ..
   make -j4
   只需编译即可，无需安装，编译之后的Sophus文件夹不要删除！
   =====================可能会出现的问题============================
   #-------------------问题描述-------------------#
   CMakeLists.txt里面调用时是这么写的：
   # Sophus 
   find_package( Sophus REQUIRED )
   include_directories( ${Sophus_INCLUDE_DIRS} )
   
   #然而我的Sophus安装在/home/will/src/Sophus/路径下，find_package找不到
   #-------------------解决方案-------------------#
   改为：
   # Sophus 
   set(Sophus_DIR /home/will/src/Sophus/build)#路径改为自己的安装路径
   find_package( Sophus REQUIRED )
   include_directories( ${Sophus_INCLUDE_DIRS} )
   =======================solved===============================
   ```


5. P95 安装OpenCV-3.3.1

   P223-确保安装了VIZ模块

   （获取源码,opencv官网下载，或者使用/3rdparty文件夹下源码即可）

   ```shell 
   # 安装依赖项
   $ sudo apt-get install -y build-essential
   $ sudo apt-get install -y python-dev python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libjasper-dev libdc1394-22-dev
   $ sudo apt-get install -y libgfortran3
   $ sudo apt-get install -y --allow-unauthenticated libgfortran3
   $ sudo apt-get install -y cmake git libgtk2.0-dev pkg-config libavcodec-dev libavformat-dev libswscale-dev
   $ sudo apt-get install -y python-dev python-numpy libtbb2 libtbb-dev libjpeg-dev libpng-dev libtiff-dev libjasper-dev libdc1394-22-dev
   $ sudo apt-get install -y libvtk5-dev
   # 获取源码,opencv官网下载，或者使用/3rdparty文件夹下源码即可
   # opencv_contrib源码地址https://github.com/opencv/opencv_contrib/tree/3.4
   will@Will:~$ cd ~/src/opencv-3.3.1
   will@Will:~/src/opencv-3.3.1$ ls
   opencv-master.zip   opencv-master   opencv_contrib-master.zip  opencv_contrib-master
   will@Will:~/src/opencv-3.3.1$ cd opencv-master
   will@Will:~/src/opencv-3.3.1/opencv$ ls
   3rdparty cmake CONTRIBUTING.md doc LICENSE platforms samples apps CMakeLists.txt data include modules README.md
   #编译安装
   will@Will:~/src/opencv-3.3.1/opencv$ mkdir build
   will@Will:~/src/opencv-3.3.1/opencv$ cd build/
   will@Will:~/src/opencv-3.3.1/opencv/build$ cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local -D INSTALL_PYTHON_EXAMPLES=ON -D INSTALL_C_EXAMPLES=ON -D OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib_master/modules -D PYTHON_EXECUTABLE=/usr/bin/python3.5 -D BUILD_EXAMPLES=ON -D WITH_VTK=ON ..
   will@Will:~/src/opencv-3.3.1/opencv/build$ make -j4
   will@Will:~/src/opencv-3.3.1/opencv/build$ sudo make install
   #注意：sudo make install之后，~/src/opencv3.3.1/opencv/build文件夹切勿删除
   ---------------------------------------------------------
   #补充说明
   $ cmake -D CMAKE_BUILD_TYPE=RELEASE -D CMAKE_INSTALL_PREFIX=/usr/local -D INSTALL_PYTHON_EXAMPLES=ON -D INSTALL_C_EXAMPLES=ON -D OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib_master/modules -D PYTHON_EXECUTABLE=/usr/bin/python3.5 -D BUILD_EXAMPLES=ON ..
   其中 -D表示定义，其后是命令和参数，
   第一个是编译类型，源码是是release（release是比较稳定的版本，建议用这个版本），所以参数是RELEASE。
   第二个是安装路径。
   第三个和第四个是是否安装C与Python例子。
   第五个是扩展模块路径。
   第六个是python可执行程序路径。
   第七个是是否编译例子。
   最后那两个点表示上一级目录，而上一级目录是源码，所以一定不要去掉。
   #延伸阅读
   https://my.oschina.net/VenusV/blog/1476666
   =====================可能会出现的问题============================
   #------------------------问题描述---------------------------#
   测试程序时，发现路径不对, 运行出现error while loading shared libraries: libopencv_highgui.so.2.4
   #------------------------问题分析---------------------------#
   是opencv的库路径没有设置好
   #------------------------解决方案---------------------------#
   opencv路径配置，运行命令
   $ sudo ldconfig
   给系统加入opencv库的环境变量（也就是库存放的路径，注意不是解压路径）
   用vim打开/etc/ld.so.conf，注意要用sudo打开获得权限，不然无法修改 ：
   $ sudo vim /etc/ld.so.conf
   在文件中加上一行 /usr/loacal/lib
   user/loacal是opencv安装路径 就是makefile中指定的安装路径
   再运行
   $ sudo ldconfig
   然后修改bash.bashrc文件
   $ sudo gedit /etc/bash.bashrc
   在文件末尾加入这两句：
   PKG_CONFIG_PATH=$PKG_CONFIG_PATH:/usr/local/lib/pkgconfig
   export PKG_CONFIG_PATH
   然后更新
   $ source /etc/bash.bashrc
   【参考】：http://blog.csdn.net/gaobobo138968/article/details/24253703
   ========================solved================================  
   ```


6. P99 安装PCL点云库
   ```shell
   书中的安装或许有问题，请参照下列方法
   
   1、下载PCL源代码
   $ git clone https://github.com/PointCloudLibrary/pcl.git 
   或者直接去https://github.com/PointCloudLibrary/pcl.git网页下载。
   
   2、安装依赖库
   $ apt-get install cmake g++   libboost1.58-all-dev libeigen3-dev libflann-dev python libusb-1.0-0-dev libudev-dev freeglut3-dev doxygen graphviz libpng12-dev libgtest-dev libxmu-dev libxi-dev libpcap-dev libqhull-dev libvtk5-qt4-dev python-vtk libvtk-java
   
   3、编译安装
   编译时间非常长，可能1小时内结束不了，编译前请考虑清楚。线程数根据情况选择
   $ cd pcl
   $ mkdir build
   $ cd build
   $ cmake -D CMAKE_BUILD_TYPE=None  -D BUILD_GPU=ON  -D BUILD_apps=ON  -D BUILD_examples=ON ..
   $ make -j4
   $ sudo make install
   =====================可能会出现的问题============================
   #-------------------问题描述-------------------#
   安装PCL依赖时libvtk5-qt4-dev无法安装，
   报错信息：E: Unable to correct problems, you have held broken packages.
   sudo apt-get install libvtk5-qt4-dev
   Reading package lists...
   Building dependency tree...
   Reading state information...
   Some packages could not be installed. This may mean that you have
   requested an impossible situation or if you are using the unstable
   distribution that some required packages have not yet been created
   or been moved out of Incoming.
   The following information may help to resolve the situation:
   The following packages have unmet dependencies:
      libvtk5-qt4-dev : Depends: libvtk5-dev (= 5.10.1+dfsg-2.1build1) but it is not going to be installed
   E: Unable to correct problems, you have held broken packages.
   #-------------------问题分析-------------------#
   应该是后来安装其他东西做了一些改动，初步推断ROS依赖
   #-------------------解决方案-------------------#
   $ sudo apt-get upgrade
   $ sudo apt-get update
   并且推荐使用  aptitude工具，运行以下命令
   sudo aptitude install libvtk5-qt4-dev
   #-------------------重要记录-------------------#
   为了解决上述问题,在运行下列命令时，似乎我的ROS依赖被删除了不少
   $ sudo apt-get install libvtk5-dev
   然后再安装
   $ sudo apt-get install libvtk5-qt4-dev
   [警告】是否会影响到ROS？未知！
   =======================solved===============================
   详情见日志/安装PCL点云库依赖出错记录日志.txt
   ```




7. P116 安装Ceres

   ```shell
   sudo apt-get install liblapack-dev libsuitesparse-dev libcxsparse3.1.4 libgflags-dev libgoogle-glog-dev libgtest-dev
   cd ~/src
   git clone https://github.com/ceres-solver/ceres-solver.git
   cd Ceres
   mkdir build
   cd build
   cmake ..
   make -j4
   sudo make install
   ```



8. P122 安装g2o

   ```shell
   sudo apt-get install libqt4-dev qt4-qmake libqglviewer-dev libsuitesparse-dev libcxsparse3.1.4 libcholmod3.0.6
   
   * 安装g2o点云库,下载g2o源代码
   git clone https://github.com/RainerKuemmerle/g2o.git
   或者可以使用3rdparty/文件夹下的g2o库，建议使用书中的版本，原因：版本不匹配易造成Error
   
   cd <path_to_g2o>
   mkdir build
   cd build
   cmake ..
   make -j4
   sudo make install
   ```




9. P264 安装Meshlab

   ```shell
   sudo add-apt-repository ppa:zarquon42/meshlab
   sudo apt-get update
   sudo apt-get install meshlab
   ```


10. P274安装g2o_viewer

   ```shell
   ==安装g2o的时候g2o_viewer组件已安装
   ==可能出现的错误：运行g2o_viewer之后报错：(core dumped) 尚未解决   
   ```



11. P289安装gstam

    ```shell
    sudo apt-get install libtbb-dev
    cd ~/src
    git clone https://bitbucket.org/gtborg/gtsam.git
    cd gtsam
    mkdir build
    cd build
    cmake ..
    make -j4
    sudo make install
    ```

12. P307安装DBoW3

    ```shell
    cd ~/src
    git clone https://github.com/rmsalinas/DBoW3.git
    cd DBoW3
    mkdir build
    cd build
    cmake ..
    make -j4
    ```



13. P350安装Octomap

    ```shell
    sudo apt-get install doxygen
    
    cd ~/src
    git clone https://github.com/Octomap/octomap.git
    
    cd octomap
    mkdir build
    cd build
    camke ..
    make -j4
    sudo make install
    =====================可能会出现的问题============================
    #-------------------问题描述-------------------#
    Ubuntu1604使用octovis模块打开已有的八叉树地图时，便会出现一大堆乱码，乱码最后有一个Core Dumped
    报错关键词：Core Dumped
    #-------------------问题分析-------------------#
    依赖冲突
    #-------------------解决方案-------------------#
    先安装依赖
    $ sudo apt-get install libqglviewer-dev-qt4
    然后重新编译安装Octomap
    在编译安装OctoMap后，可以再重新安装回libqglviewer-dev，以便为其他功能模块，如g2o提供依赖项：
    $ sudo apt-get install libqglviewer-dev
    因为libqglviewer-dev-qt4和libqglviewer-dev只能存在一个，但libqglviewer-dev-qt4并不能支持g2o。安装回libqglviewer-dev是不会影响octovis的使用的，因为它影响的只是OctoMap的编译安装。
    #-------------------参考-------------------#
    http://www.cnblogs.com/hitlrk/p/6667253.html
    
    上述方法依旧无法解决！
    =======================unsolved===============================
    ```

