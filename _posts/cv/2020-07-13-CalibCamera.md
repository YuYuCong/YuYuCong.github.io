---
layout: post
title: "Camera Calibrate"
subtitle: "相机畸变校准原理与工具代码"
categories: [OpenCV]
tags: [OpenCV, camera, calibrate]
header-img: "img/in-post/post-cv/bg_marker2.png"
header-style: img
date: 2020.07.13
---

>  相机的内外参标定原理，与棋盘格标定方法，以及OpenCV提供库方法的简单笔记。 Camera internal and external parameter calibration.

* Kramdown table of contents
{:toc .toc}
# Camera Calibrate


---

Created 2020.07.13 by Cong Yu; Last modified: 2022.09.01-v1.1.1 -> 2022.09.02-v1.1.2

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

---

<p style="font-size:20px;color:#187732;text-align:left;">REFERENCES</p> 

- opencv module [**Camera Calibration and 3D Reconstruction**](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html) 一份重要的参考资料
- opencv tutorial doc [**Camera calibration and 3D reconstruction (calib3d module)**](https://docs.opencv.org/4.x/d6/d55/tutorial_table_of_content_calib3d.html)
- opencv doc [Calibration with ArUco and ChArUco](https://docs.opencv.org/4.x/da/d13/tutorial_aruco_calibration.html)

## 1. Camera model

相机模型

- 本小节主要讲针孔模型 pinhole camera model.
- 此外还有鱼眼相机模型 [**Fisheye camera model**](https://docs.opencv.org/4.x/db/d58/group__calib3d__fisheye.html) 本文暂不讨论

### 1.1 针孔相机的投影模型

#### Camera intrinsic matrix

相机内参矩阵A，通常也写作K


$$
A = \begin{bmatrix} f_x & 0 & c_x \\  0 & f_y & c_y \\ 0 & 0 & 1 \end{bmatrix}
$$
其中：

- fx fy： 焦距
- cx cy： 主点偏移

#### 无畸变的投影模型 The distortion-free projective transformation.

$$
s \ p = A \ [R|t] \ P_w \tag1
$$

where

- $P_w$ is a 3D point expressed with respect to the world coordinate system, 
- $p$ is a 2D pixel in the image plane,
- $A$ is the camera intrinsic matrix, 
- $R$ and $t$ are the rotation and translation that describe the change of coordinates from world to camera coordinate systems (or camera frame) 
- and $s$ is the projective transformation's arbitrary scaling and not part of the camera model. 影射变换的尺度部分，与相机模型无关

![pinhole_camera_model.png](https://docs.opencv.org/4.x/pinhole_camera_model.png)
<small class="img-hint">Fig1.  **Pinhole camera model**</small>

注意：相机坐标系的方向规定为：假设你的眼睛是相机，右手方向为x，脚的方向为y，目光直视方向（正前方）为z。得到的图像视野为左上方到右下方。横宽竖窄。

世界坐标系转相机坐标系
$$
P_c = 
\begin{bmatrix}
R | t \\
\end{bmatrix}
P_w \tag2
$$
相机坐标系归一化
$$
P^`_c = \begin{bmatrix} x^` \\ y^` \\ 1 \end{bmatrix} = \frac 1 {Z_c} P_c = \frac 1 {Z_c}  \begin{bmatrix}X_c \\ Y_c \\ Z_c \end{bmatrix} \tag 3
$$
相机归一化坐标系转像素坐标系
$$
s \begin{bmatrix}
u \\
v \\
1
\end{bmatrix} = A P^`_c \tag4
$$
总结为：
$$
s\begin{bmatrix} u \\ v\\ 1 \end{bmatrix} = \begin{bmatrix} f_x & 0 & c_x \\  0 & f_y & c_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix}
R | t \\ 
\end{bmatrix}_{3,4}
\begin{bmatrix}
X_w \\
Y_w \\
Z_w \\
1
\end{bmatrix} \tag5
$$
简写做 式(1)



### 1.2 相机畸变

#### 畸变分类

Real lenses usually have some distortion, mostly radial distortion, and slight tangential distortion.

畸变 distortion 包括两部分：

- mostly radial distortion,  主要是径向畸变
- and slight tangential distortion. 以及轻微的切向畸变

径向畸变分为两种：
- 枕形畸变

- 桶形畸变

  <img src="https://docs.opencv.org/4.x/distortion_examples.png" alt="distortion_examples.png" style="zoom:67%;" />

  <small class="img-hint">Fig2.  radial distortion</small>

切向畸变

// todo(congyu)

#### 畸变模型

- 畸变作用于相机归一化坐标系 $P_c^`$ ，
- 畸变后记为 $P^{``}_c$ 。
- 畸变模型为：
$$
\begin{bmatrix} x^{``} \\ y^{``} \end{bmatrix} = 
\begin{bmatrix} 
x^{`} 
\frac{
1+k_1 r^2 + k_2 r^4 + k_3 r^6 }{1+k_4 r^2 + k_5 r^4 + k_6 r^6} + 2 p_1 x^` y^` + p_2(r^2 + 2 x^{`2}) + s_1 r^2 + s_2 r^4 \\ 
y^{`}
\frac{1+k_1 r^2 + k_2 r^4 + k_3 r^6 }{1+k_4 r^2 + k_5 r^4 + k_6 r^6} + 2 p_2 x^` y^` + p_1(r^2 + 2 y^{`2}) + s_3 r^2 + s_4 r^4 
\end{bmatrix} \tag 6
$$
其中
$$
r^2 = x^2 + y^2
$$

k1, k2, k3, k4, k5, k6 p1, p2, s1, s2, s3, and s4是畸变参数

#### 畸变参数 

The distortion parameters：

- k1, k2, k3, k4, k5, and k6: the radial coefficients 径向畸变系数
- p1, p2 tangential distortion coefficients 切向畸变系数
- s1, s2, s3, and s4, are the thin prism distortion coefficients. 薄棱镜畸变系数
- (k1,k2,p1,p2[,k3[,k4,k5,k6[,s1,s2,s3,s4[,τx,τy]]]]) 必要参数与非必要参数

注意：

- OpenCV中不考虑高阶系数
-  More generally, radial distortion must be monotonic and the distortion function must be bijective. 真实镜头中径向畸变总是单调递减的，且畸变函数必须是双映摄的
- 如果不满足上述条件，则应该认为校准失败。OpenCV使用的校准优化方法里不提供上述约束



## 2. 校准步骤

### 2.1 <mark style="background: #ADCCFFA6;">生成 ChArUco 标定板</mark>

Create a ChArUco board image.

#### OpenCV例程

- https://github.com/opencv/opencv_contrib/blob/master/modules/aruco/samples/create_board_charuco.cpp

示例：

```shell
./create_board_charuco ./marker_charuco.png -w=13 -h=8 -sl=200 -ml=160 -d=10 -bb=1 -si=1
```

参数：

```c++
const char* keys =
    "{@outfile |<none> | Output image }"
    "{w        |       | Number of squares in X direction }"
    "{h        |       | Number of squares in Y direction }"
    "{sl       |       | Square side length (in pixels) }"
    "{ml       |       | Marker side length (in pixels) }"
    "{d        |       | dictionary: DICT_4X4_50=0, DICT_4X4_100=1, "
    "DICT_4X4_250=2,"
    "DICT_4X4_1000=3, DICT_5X5_50=4, DICT_5X5_100=5, DICT_5X5_250=6, "
    "DICT_5X5_1000=7, "
    "DICT_6X6_50=8, DICT_6X6_100=9, DICT_6X6_250=10, DICT_6X6_1000=11, "
    "DICT_7X7_50=12,"
    "DICT_7X7_100=13, DICT_7X7_250=14, DICT_7X7_1000=15, DICT_ARUCO_ORIGINAL = "
    "16}"
    "{m        |       | Margins size (in pixels). Default is "
    "(squareLength-markerLength) }"
    "{bb       | 1     | Number of bits in marker borders }"
    "{si       | false | show generated image }";
```

- w: x方向的格子数
- h: y方向的格子数
- sl: 格子的大小 pix
- ml: 格子里marker的大小 pix
- d: marker的字典
  - 4x4表示二维码为4x4 bit大小，共有16个二进制位
- bb: marker的边框为几个bit
- si: show image 是否显示生成的标定板

#### 主要函数: [CharucoBoard::create()](https://docs.opencv.org/4.x/d0/d3c/classcv_1_1aruco_1_1CharucoBoard.html#aa83b0a885d4dd137a41686991f85594c)

- https://docs.opencv.org/4.x/d0/d3c/classcv_1_1aruco_1_1CharucoBoard.html#aa83b0a885d4dd137a41686991f85594c

c++

```c++
static Ptr<CharucoBoard> cv::aruco::CharucoBoard::create	(	int 	squaresX,
int 	squaresY,
float 	squareLength,
float 	markerLength,
const Ptr< Dictionary > & 	dictionary 
)		
```

python

```python
cv.aruco.CharucoBoard_create(	squaresX, squaresY, squareLength, markerLength, dictionary	) ->	retval
```

**参数说明**

| **Parameters** | 说明                                               | 说明                  |
| -------------- | -------------------------------------------------- | --------------------- |
| squaresX       | number of chessboard squares in X direction        | x方向的格子数         |
| squaresY       | number of chessboard squares in Y direction        | y方向的格子数         |
| squareLength   | chessboard square side length (normally in meters) | 格子的长度(单位：m)   |
| markerLength   | marker side length (same unit than squareLength)   | marker的长度(单位：m) |


### 2.2. <mark style="background: #ADCCFFA6;">内参标定</mark>

#### OpenCV例程

- [**Calibration with ArUco and ChArUco**](https://docs.opencv.org/4.x/da/d13/tutorial_aruco_calibration.html)
- code https://github.com/opencv/opencv_contrib/blob/master/modules/aruco/samples/calibrate_camera_charuco.cpp

示例：

```c++
./calibrate_camera_charuco ./calibrate_result.txt -w=13 -h=8 -sl=0.0310 -ml=0.0248 -d=10 -ci=4
```

参数：

```c++
const char* keys  =
        "{w        |       | Number of squares in X direction }"
        "{h        |       | Number of squares in Y direction }"
        "{sl       |       | Square side length (in meters) }"
        "{ml       |       | Marker side length (in meters) }"
        "{d        |       | dictionary: DICT_4X4_50=0, DICT_4X4_100=1, DICT_4X4_250=2,"
        "DICT_4X4_1000=3, DICT_5X5_50=4, DICT_5X5_100=5, DICT_5X5_250=6, DICT_5X5_1000=7, "
        "DICT_6X6_50=8, DICT_6X6_100=9, DICT_6X6_250=10, DICT_6X6_1000=11, DICT_7X7_50=12,"
        "DICT_7X7_100=13, DICT_7X7_250=14, DICT_7X7_1000=15, DICT_ARUCO_ORIGINAL = 16}"
        "{@outfile |<none> | Output file with calibrated camera parameters }"
        "{v        |       | Input from video file, if ommited, input comes from camera }"
        "{ci       | 0     | Camera id if input doesnt come from video (-v) }"
        "{dp       |       | File of marker detector parameters }"
        "{rs       | false | Apply refind strategy }"
        "{zt       | false | Assume zero tangential distortion }"
        "{a        |       | Fix aspect ratio (fx/fy) to this value }"
        "{pc       | false | Fix the principal point at the center }"
        "{sc       | false | Show detected chessboard corners after calibration }";
```

- sl: 方格大小，注意单位m，需要自己测量。
- ml: marker的大小，单位m
- v: 读取video
- ci: 或者直接读取camera 端口号

注意：一个小技巧，tool_create_charuco运行后直接在显示屏上显示标定板，不要打印出来，那么同一个显示屏配置下，显示出来的实际物理尺寸大小也是确定的！！！ 不需要每次都重新测量。

![calibrate](/img/in-post/post-cv/calibrate.png)

#### 主要函数 : [calibrateCameraCharuco()](https://docs.opencv.org/4.x/d9/d6a/group__aruco.html#gaa7357017aa9da857b487e447c7b13f11)

```c++
double cv::aruco::calibrateCameraCharuco	(	InputArrayOfArrays 	charucoCorners,
InputArrayOfArrays 	charucoIds,
const Ptr< CharucoBoard > & 	board,
Size 	imageSize,
InputOutputArray 	cameraMatrix,
InputOutputArray 	distCoeffs,
OutputArrayOfArrays 	rvecs,
OutputArrayOfArrays 	tvecs,
OutputArray 	stdDeviationsIntrinsics,
OutputArray 	stdDeviationsExtrinsics,
OutputArray 	perViewErrors,
int 	flags = 0,
const TermCriteria & 	criteria = TermCriteria(TermCriteria::COUNT+TermCriteria::EPS, 30, DBL_EPSILON) 
)		
```

```python
cv.aruco.calibrateCameraCharuco(	charucoCorners, charucoIds, board, imageSize, cameraMatrix, distCoeffs[, rvecs[, tvecs[, flags[, criteria]]]]
```

**参数说明**

- charucoCorners: vector of detected charuco corners per frame
- charucoIds: list of identifiers for each corner in charucoCorners per frame
- board: 标定板对象
- imageSize: 输入图像的大小
- cameraMatrix: Output 相机内参矩阵$A$

$$
A=\begin{bmatrix}
f_x & 0 & c_x \\
0 & f_y & c_y \\
0 & 0 & 1
\end{bmatrix}
$$

- distCoeffs: Output 相机畸变参数 vector of distortion coefficients
	- (k1,k2,p1,p2[,k3[,k4,k5,k6],[s1,s2,s3,s4]]) of 4, 5, 8 or 12 elements
- rvecs: Output vector of rotation vectors (see [cv::Rodrigues](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html#ga61585db663d9da06b68e70cfbf6a1eac) 罗德里格斯) estimated for each board view (e.g. std::vector<cv::Mat>>).  每个标定板的外参的姿态，由旋转向量表达。
	- That is, each k-th rotation vector together with the corresponding k-th translation vector (see the next output parameter description) brings the board pattern from the model coordinate space (in which object points are specified) to the world coordinate space, that is, a real position of the board pattern in the k-th pattern view (k=0.. *M* -1). 相机的rt姿态
	- [cv::Rodrigues](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html#ga61585db663d9da06b68e70cfbf6a1eac) 罗德里格斯。
- tvecs: Output vector of translation vectors estimated for each pattern view. 相机的rt姿态
- stdDeviationsIntrinsics:  Output vector of standard deviations estimated for intrinsic parameters. Order of deviations values: (fx,fy,cx,cy,k1,k2,p1,p2,k3,k4,k5,k6,s1,s2,s3,s4,τx,τy) If one of parameters is not estimated, it's deviation is equals to zero. 内参估计的标准差
- stdDeviationsExtrinsics: Output vector of standard deviations estimated for extrinsic parameters. Order of deviations values: (R1,T1,…,RM,TM) where M is number of pattern views, Ri,Ti are concatenated 1x3 vectors.外参估计的标准差
- perViewErrors: Output vector of average re-projection errors estimated for each pattern view. 每一帧的平均冲投影误差
- flags: todo(congyu)
- criteria: todo(congyu)

返回值

- The function returns the final re-projection error. 返回最终的重投影误差。

#### 校准参数文件的IO

##### 保存参数文件

可以实现一个saveCameraParams()方法保存相机参数到文件。

```c++
static bool saveCameraParams(const string &filename, Size imageSize,
                             float aspectRatio, int flags,
                             const Mat &cameraMatrix, const Mat &distCoeffs,
                             double totalAvgErr) {
  FileStorage fs(filename, FileStorage::WRITE);
  if (!fs.isOpened()) return false;

  time_t tt;
  time(&tt);
  struct tm *t2 = localtime(&tt);
  char buf[1024];
  strftime(buf, sizeof(buf) - 1, "%c", t2);

  fs << "calibration_time" << buf;

  fs << "image_width" << imageSize.width;
  fs << "image_height" << imageSize.height;

  if (flags & CALIB_FIX_ASPECT_RATIO) fs << "aspectRatio" << aspectRatio;

  if (flags != 0) {
    sprintf(buf, "flags: %s%s%s%s",
            flags & CALIB_USE_INTRINSIC_GUESS ? "+use_intrinsic_guess" : "",
            flags & CALIB_FIX_ASPECT_RATIO ? "+fix_aspectRatio" : "",
            flags & CALIB_FIX_PRINCIPAL_POINT ? "+fix_principal_point" : "",
            flags & CALIB_ZERO_TANGENT_DIST ? "+zero_tangent_dist" : "");
  }

  fs << "flags" << flags;

  fs << "camera_matrix" << cameraMatrix;
  fs << "distortion_coefficients" << distCoeffs;

  fs << "avg_reprojection_error" << totalAvgErr;

  return true;
}
```

调用时，如下即可：
```c++
bool saveOk =
    saveCameraParams(outputFile, imgSize, aspectRatio, calibrationFlags,
                     cameraMatrix, distCoeffs, repError);
```

保存的结果：

```yaml
%YAML:1.0
---
image_width: 2304
image_height: 1536
flags: 0
camera_matrix: !!opencv-matrix
  rows: 3
  cols: 3
  dt: d
  data: [ 1.7278790942145540e+03, 0., 1.1309385807730075e+03, 0.,
          1.7266185538163652e+03, 7.5735707693874974e+02, 0., 0., 1. ]
distortion_coefficients: !!opencv-matrix
  rows: 1
  cols: 5
  dt: d
  data: [ 6.3777903954352969e-02, -2.5340121133838989e-01,
          8.2797304884093832e-04, 9.9076895476885444e-05,
          2.6333203915318537e-01 ]
avg_reprojection_error: 3.2079151333906419e-01

```

##### 读取参数文件

可以实现一个 readCameraParameters()方法读取上文保存的相机参数文件。

```c++
inline static bool readCameraParameters(std::string filename,  
                                        cv::Mat &camMatrix,  
                                        cv::Mat &distCoeffs) {  
  cv::FileStorage fs(filename, cv::FileStorage::READ);  
  if (!fs.isOpened()) return false;  
  fs["camera_matrix"] >> camMatrix;  
  fs["distortion_coefficients"] >> distCoeffs;  
  return true;}
```

调用时，如下即可：
```c++
Mat camMatrix, distCoeffs;
bool readOk =  
    readCameraParameters(parser.get<string>("c"), camMatrix, distCoeffs);  
if (!readOk) {  
  cerr << "Invalid camera file" << endl;  
  return 0;  
}
```



## 3. <mark style="background: #ADCCFFA6;">校准参数的使用</mark>

#### 主要函数：[undistort()](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html#ga69f2545a8b62a6b0fc2ee060dc30559d)

The function transforms an image to compensate radial and tangential lens distortion.

```c++
void cv::undistort	(	InputArray 	src,
OutputArray 	dst,
InputArray 	cameraMatrix,
InputArray 	distCoeffs,
InputArray 	newCameraMatrix = noArray() 
)		
```

```python
cv.undistort(	src, cameraMatrix, distCoeffs[, dst[, newCameraMatrix]]	) ->	dst
```

#### 代码片段示例

```c++
  cv::Mat camera_matrix_;
  cv::Mat new_camera_matrix_;
  cv::Vec<double, 5> dist_coeffs_;

  camera_matrix_ = Mat(3, 3, CV_64FC1);

  float scale = 0.8;
  int shift_x = 0;
  int shift_y = 0;
  cv::Mat matrix = cv::Mat::eye(3, 3, CV_64FC1);
  matrix.at<double>(0, 0) = scale;
  matrix.at<double>(1, 1) = scale;
  matrix.at<double>(0, 2) = shift_x;
  matrix.at<double>(1, 2) = shift_y;
  new_camera_matrix_ = camera_matrix_ * matrix;

  cv::undistort(frame, frame_undistort, camera_matrix_, dist_coeffs_,
                  new_camera_matrix_);
```

#### 函数：[undistortPoints()](https://docs.opencv.org/4.x/d9/d0c/group__calib3d.html#ga55c716492470bfe86b0ee9bf3a1f0f7e)

Computes the ideal point coordinates from the observed point coordinates.

```c++
void cv::undistortPoints	(	InputArray 	src,
OutputArray 	dst,
InputArray 	cameraMatrix,
InputArray 	distCoeffs,
InputArray 	R = noArray(),
InputArray 	P = noArray() 
)	
```

```python
cv.undistortPoints(	src, cameraMatrix, distCoeffs[, dst[, R[, P]]]	) ->	dst
cv.undistortPointsIter(	src, cameraMatrix, distCoeffs, R, P, criteria[, dst]	) ->	dst
```

## 4. 相机外参的估计

基于ChArUco board，做相机的外参标定

[2020-07-14-MarkerPoseEstimate](cv/2020-07-14-MarkerPoseEstimate.md)





----



## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.


## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

