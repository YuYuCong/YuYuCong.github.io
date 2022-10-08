---
layout: post
title: "Marker based pose estimate"
subtitle: "使用ArUco Marker估计相机的外参，或者估计标定板的位姿"
categories: [OpenCV]
tags: [OpenCV, camera, calibrate]
header-img: "img/in-post/post-cv/pose_aruco_bg.png"
header-style: img
date: 2020.07.14
---

>  本文主要包括两部分内容：1. 基于单个Marker的位姿估计；2. 基于标定板的位姿估计。

* Kramdown table of contents
{:toc .toc}

# Marker pose estimate

---

Created 2020.07.14 by Cong Yu; Last modified: 2020.07.14-v1.0.0 -> 2022.08.30-v1.1.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

---

<p style="font-size:16px;color:#176;text-align:left;">References</p> 

- opencv module [**ArUco Marker Detection**](https://docs.opencv.org/4.x/d9/d6a/group__aruco.html#ga84dd2e88f3e8c3255eb78e0f79571bd1) 一份重要的参考资料
- opencv tutorials [ArUco marker detection (aruco module)](https://docs.opencv.org/4.x/d9/d6d/tutorial_table_of_content_aruco.html)
- code OpenCV例程 [detect_board_charuco](https://github.com/opencv/opencv_contrib/blob/master/modules/aruco/samples/detect_board_charuco.cpp)

## 1. 使用单个ArUco Marker的姿态估计

单个ChArUco Marker的姿态估计

// todo(congyu)


## 2. 使用ChArUco标定板的姿态估计

Pose estimation using a ChArUco board.

#### 过程

- code OpenCV例程 [detect_board_charuco](https://github.com/opencv/opencv_contrib/blob/master/modules/aruco/samples/detect_board_charuco.cpp)


![pose_aruco.gif](/img/in-post/post-cv/pose_aruco.gif)


#### 主要函数: [estimatePoseCharucoBoard()](https://docs.opencv.org/4.x/d9/d6a/group__aruco.html#ga21b51b9e8c6422a4bac27e48fa0a150b)

```c++
bool cv::aruco::estimatePoseCharucoBoard	(	InputArray 	charucoCorners,
InputArray 	charucoIds,
const Ptr< CharucoBoard > & 	board,
InputArray 	cameraMatrix,
InputArray 	distCoeffs,
InputOutputArray 	rvec,
InputOutputArray 	tvec,
bool 	useExtrinsicGuess = false 
)
```

```python
cv.aruco.estimatePoseCharucoBoard(	charucoCorners, charucoIds, board, cameraMatrix, distCoeffs, rvec, tvec[, useExtrinsicGuess]	) ->	retval, rvec, tvec
```

**参数说明**

- charucoCorners 检测出的charuco的角点
- charucoIds 检测出的角点的id
- board 标定板的边框
- cameraMatrix 相机内参矩阵
	- $A = \begin{bmatrix} f_x & 0 & c_x \\  0 & f_y & c_y \\ 0 & 0 & 1 \end{bmatrix}$
- distCoeffs 畸变参数
- rvec [output] Output vector (e.g. cv::Mat) corresponding to the rotation vector of the board  (see [cv::Rodrigues](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html#ga61585db663d9da06b68e70cfbf6a1eac)).  罗德里格斯。由旋转向量表达的姿态
- tvec 位置
- useExtrinsicGuess 定义是否使用r,t的初始猜测


注意：得到的位姿是标定板在相机坐标系下的位姿，即相机坐标系为原点。



----



## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.


## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

