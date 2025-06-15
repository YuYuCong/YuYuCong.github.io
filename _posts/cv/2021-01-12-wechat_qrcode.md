---
layout: post
title: "WeChatQRCode二维码识别"
subtitle: "关于OpenCV中cv::wechat_qrcode的一些简单笔记"
categories: [OpenCV]
tags: [OpenCV]
header-img: "img/in-post/post-cv/"
redirect_from:
  - /2020/10/10/
---


>  OpenCV Wechat QR Class, 一条函数搞定二维码识别！

* Kramdown table of contents
{:toc .toc}

# WeChatQRCode 简单笔记

---

Created 2021.01.12 by Cong Yu; Last modified: 2021.03.05-v1.0.1 -> 2022.09.02-v1.1.1

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

---

<p style="font-size:20px;color:#187732;text-align:left;">References</p> 

- opencv modules [**WeChat QR code detector for detecting and parsing QR code.**](https://docs.opencv.org/4.x/dd/d63/group__wechat__qrcode.html)
- github [https://github.com/opencv/opencv_contrib/tree/4.x/modules/wechat_qrcode](https://github.com/opencv/opencv_contrib/tree/4.x/modules/wechat_qrcode)
- post [https://learnopencv.com/wechat-qr-code-scanner-in-opencv/](https://learnopencv.com/wechat-qr-code-scanner-in-opencv/)
- wiki [https://en.wikipedia.org/wiki/QR_code](https://en.wikipedia.org/wiki/QR_code)



## 0. Intro

作者：is contributed by WeChat Computer Vision Team (WeChatCV)

### 0.1 four primary features

There are four primary features of WeChat QR code detector:

1. CNN-based QR code detector. Different from the traditional detector, we introduce a tiny CNN model for multiple code detection. The detector is based on SSD architecture with a MobileNetV2-like backbone, which is run on caffe inference framework. 基于CNN的二维码检测器。
2. CNN-based QR code enhancement. To improve the performance of tiny QR code, we design a lighten super-resolution CNN model for QR code, called QRSR. Depth-wise convolution, DenseNet concat and deconvolution are the core techniques in the QRSR model. 基于CNN的二维码增强。
3. More robust finder pattern detection. Besides traditional horizontal line searching, we propose an area size based finder pattern detection method. we calculate the area size of black and white block to locate the finder pattern by the pre-computed connected cells. 更强大的查找器模式检测。
4. Massive engineering optimization. Based on [zxing-cpp](https://github.com/glassechidna/zxing-cpp), we conduct massive engineering optimization to boost the decoding success rate, such as trying more binarization methods, supporting N:1:3:1:1 finder pattern detection, finding more alignment pattern, clustering similar size finder pattern, and etc. 大量的工程优化。

最主要内容：两个CNN 模型

- Includes two CNN-based models:
  - A object detection model 物体检测模型
    - to detect QRCode with the bounding box 负责检测二维码的BBX
  - A super resolution model 超分辨率模型
    - zoom in QRCode when it is small 负责放大尺寸比较小的二维码

## 1. Usage

### 1.1 head file

```c++
#include <opencv2/wechat_qrcode.hppp>

using namespace cv::wechat_qrcode;
```

### 1.2 Public Member Functions

#### 1.2.1 [WeChatQRCode()](https://docs.opencv.org/4.x/d5/d04/classcv_1_1wechat__qrcode_1_1WeChatQRCode.html#a9c0dc4c37646a1a051340d6b0916f388)

构造函数：

c++

```c++
WeChatQRCode::WeChatQRCode (
    const std::string &detector_prototxt_path="",
    const std::string &detector_caffe_model_path="", 
    const std::string &super_resolution_prototxt_path="", 
    const std::string &super_resolution_caffe_model_path=""
)
```
python

```python
<wechat_qrcode_WeChatQRCode object>	=	cv.wechat_qrcode_WeChatQRCode(
    [, detector_prototxt_path
    [, detector_caffe_model_path
    [, super_resolution_prototxt_path
    [, super_resolution_caffe_model_path]]]]
)
```
##### 参数解释

| Parameters                        | Description                                       |
| --------------------------------- | ------------------------------------------------- |
| detector_prototxt_path            | prototxt file path for the detector               |
| detector_caffe_model_path         | caffe model file path for the detector            |
| super_resolution_prototxt_path    | prototxt file path for the super resolution model |
| super_resolution_caffe_model_path | caffe file path for the super resolution model    |

- 模型是caffe格式
- 模型的下载地址: [https://github.com/WeChatCV/opencv_3rdparty](https://github.com/WeChatCV/opencv_3rdparty)

#### 1.2.2 detectAndDecode()

c++

```c++
std::vector<std::string> cv::wechat_qrcode::WeChatQRCode::detectAndDecode (
    InputArray img,
	OutputArrayOfArrays points = noArray()
)
```

python

```python
retval, points	=	cv.wechat_qrcode_WeChatQRCode.detectAndDecode(	img[, points]	)
```

##### 参数解释

- Parameters
  - img : in, imgsupports grayscale or color (BGR) image.  输入的图片，彩色灰色均可
  - points : out, optional output array of vertices of the found QR code quadrangle. Will be empty if not found. 二维码的四边形的顶点
- Returns
  - list of decoded string. 解码结果

有了WeChatQRCode，一条函数搞定二维码识别！

### 1.3 code e.g.

```c++
= #include<gflags / gflags.h>
#include <glog/logging.h>
#include <opencv2/core.hpp>
#include <opencv2/opencv.hpp>
#include <opencv2/wechat_qrcode.hpp>
#include <memory>

    DEFINE_string(wechat_qrcode_module_dir_path, "./wechat_qrcode_module/",
                  "Path to the wechat_qrcode_module file");
DEFINE_string(qr_file, "./test.png", "QR img file");

class QRCodeScanWechat {
 public:
  QRCodeScanWechat() {
    try {
      qrcode_detector_ = std::make_shared<cv::wechat_qrcode::WeChatQRCode>(
          FLAGS_wechat_qrcode_module_dir_path + "detect.prototxt",
          FLAGS_wechat_qrcode_module_dir_path + "detect.caffemodel",
          FLAGS_wechat_qrcode_module_dir_path + "sr.prototxt",
          FLAGS_wechat_qrcode_module_dir_path + "sr.caffemodel");
    } catch (const std::exception &e) {
      LOG(ERROR)
          << "\n-------------------------------------------------------\n"
             "Failed to initialize WeChatQRCode.\n"
             "Please, download 'detector.*' and 'sr.*' from\n"
             "https://github.com/WeChatCV/opencv_3rdparty/tree/wechat_qrcode\n"
             "and put them into the current directory.\n"
             "-------------------------------------------------------\n";
    }
  }

  ~QRCodeScanWechat() { qrcode_detector_ = nullptr; }

  /**
   * Get all info of all QR codes in the input image.
   * @param src[in]
   * @param result[out]
   * @return true or false
   */
  bool GetQRCodeResult(const cv::Mat &src, std::vector<std::string> *result);

 private:
  std::shared_ptr<cv::wechat_qrcode::WeChatQRCode> qrcode_detector_ = nullptr;
};

bool QRCodeScanWechat::GetQRCodeResult(const cv::Mat &src,
                                       std::vector<std::string> *result) {
  if (!qrcode_detector_) {
    LOG(ERROR) << "GetQRCodeResult failed, qrcode_detector_ is null.";
    return false;
  }
  if (src.empty()) {
    return false;
  }

  std::vector<cv::Mat> points;
  auto qrcode_result = qrcode_detector_->detectAndDecode(src, points);
  if (qrcode_result.empty()) {
    LOG(ERROR) << "empty info";
    return false;
  }
  cv::Mat dst = src;

  for (const auto &point : points) {
    CHECK_EQ(point.rows, 4);
    CHECK_EQ(point.cols, 2);
    cv::Point bbx_points[4];
    bbx_points[0] = cv::Point2f(point.at<float>(0, 0), point.at<float>(0, 1));
    bbx_points[1] = cv::Point2f(point.at<float>(1, 0), point.at<float>(1, 1));
    bbx_points[2] = cv::Point2f(point.at<float>(2, 0), point.at<float>(2, 1));
    bbx_points[3] = cv::Point2f(point.at<float>(3, 0), point.at<float>(3, 1));
    for (size_t i = 0; i < 4; i++) {
      LOG(ERROR) << bbx_points[i];
      cv::line(dst, bbx_points[i], bbx_points[(i + 1) > 3 ? 0 : (i + 1)],
               cv::Scalar(0, 255, 0), 2);
      cv::circle(dst, bbx_points[i], 4, cv::Scalar(0, 255, 0), -1);
    }
  }
  cv::imshow("dst", dst);
  cv::waitKey(0);

  for (const auto &res : qrcode_result) {
    LOG(ERROR) << "wechat_qrcode result:" << res;
    result->emplace_back(res);
  }
  return false;
}

int main(int argc, char *argv[]) {
  google::InitGoogleLogging(argv[0]);
  google::InstallFailureSignalHandler();
  google::ParseCommandLineFlags(&argc, &argv, false);

  const auto src = cv::imread(FLAGS_qr_file, 1);
  cv::imshow("src", src);
  cv::waitKey(0);

  QRCodeScanWechat qr_scan;
  std::vector<std::string> *result = new std::vector<std::string>();
  qr_scan.GetQRCodeResult(src, result);

  return 0;
}
```



![pinhole_camera_model.png](/img/in-post/post-cv/QR-code-res.png)

<small class="img-hint">Fig1.  **QR-code detect result using wechat_qrcode**</small>



## 2. QR code

再好奇一下QR的结构

二维码（QR Code，Quick Response Code）是一种矩阵式二维条码，由日本Denso Wave公司于1994年发明。相比传统的一维条码，QR码具有存储容量大、纠错能力强、识别速度快等优点。

### 2.1 QR码的基本结构

一个标准的QR码主要由以下几个功能区域组成：

#### 2.1.1 定位图案（Position Detection Pattern）
- **位置**：位于QR码的左上、右上、左下三个角
- **结构**：7×7模块的正方形图案
- **图案特征**：由黑白相间的同心正方形组成，比例为 1:1:3:1:1（黑:白:黑:白:黑）
- **作用**：帮助扫描设备快速定位QR码的位置、方向和大小

#### 2.1.2 分隔符（Separator）
- **位置**：围绕每个定位图案的1模块宽度的白色边框
- **作用**：将定位图案与数据区域清晰分离，避免干扰

#### 2.1.3 定时图案（Timing Pattern）
- **位置**：连接左上角和右上角定位图案的水平线，以及连接左上角和左下角定位图案的垂直线
- **结构**：黑白相间的模块序列（1:1比例）
- **作用**：提供坐标参考，帮助确定QR码中每个数据模块的精确位置

#### 2.1.4 校正图案（Alignment Pattern）
- **位置**：根据QR码版本在预定位置出现（Version 2及以上）
- **结构**：5×5模块的图案，外圈黑色，内部白色，中心黑色
- **作用**：纠正因打印变形或拍摄角度造成的几何失真

#### 2.1.5 格式信息（Format Information）
- **位置**：围绕左上角定位图案的两条L形区域
- **长度**：15位，包含5位数据和10位纠错码
- **内容**：纠错级别（2位）+ 掩码图案标识（3位）
- **冗余存储**：相同信息在两个位置存储，提高可靠性

#### 2.1.6 版本信息（Version Information）
- **位置**：仅在Version 7及以上出现，位于右上和左下定位图案附近
- **长度**：18位，包含6位版本号和12位纠错码
- **作用**：标识QR码的版本，帮助解码器确定尺寸和数据容量

#### 2.1.7 数据和纠错码区域
- **位置**：除功能图案外的所有剩余区域
- **内容**：编码后的数据 + Reed-Solomon纠错码
- **填充顺序**：按照特定的之字形（zigzag）路径从右下角开始填充

### 2.2 QR码版本与规格

QR码共有40个版本，每个版本的模块数量递增：

| 版本 | 模块尺寸 | 数字容量 | 字母数字容量 | 字节容量 | 汉字容量 |
| ---- | -------- | -------- | ------------ | -------- | -------- |
| 1    | 21×21    | 41       | 25           | 17       | 10       |
| 5    | 37×37    | 134      | 80           | 55       | 32       |
| 10   | 57×57    | 174      | 106          | 72       | 43       |
| 15   | 77×77    | 523      | 321          | 220      | 132      |
| 20   | 97×97    | 858      | 523          | 358      | 217      |
| 25   | 117×117  | 1273     | 784          | 538      | 321      |
| 30   | 137×137  | 1852     | 1139         | 784      | 468      |
| 40   | 177×177  | 7089     | 4296         | 2953     | 1817     |

**版本计算公式**：模块数 = 21 + 4 × (版本号 - 1)

### 2.3 纠错级别

QR码采用Reed-Solomon纠错算法，支持四种纠错级别：

| 级别 | 名称     | 纠错能力 | 数据恢复率 | 典型应用场景         |
| ---- | -------- | -------- | ---------- | -------------------- |
| L    | Low      | 低       | ~7%        | 清洁环境，高质量打印 |
| M    | Medium   | 中       | ~15%       | 一般环境，标准应用   |
| Q    | Quartile | 较高     | ~25%       | 工业环境，户外使用   |
| H    | High     | 高       | ~30%       | 恶劣环境，小尺寸码   |

### 2.4 数据编码模式

QR码支持多种数据编码模式以优化存储效率：

1. **数字模式（Numeric Mode）**
   - 字符集：0-9
   - 编码效率：每3位数字用10位二进制表示
   - 适用：纯数字内容

2. **字母数字模式（Alphanumeric Mode）**
   - 字符集：0-9, A-Z, 空格, $ % * + - . / :
   - 编码效率：每2个字符用11位二进制表示
   - 适用：简单文本内容

3. **字节模式（Byte Mode）**
   - 字符集：ISO-8859-1（Latin-1）
   - 编码效率：每个字符8位
   - 适用：任意二进制数据

4. **汉字模式（Kanji Mode）**
   - 字符集：日文汉字（Shift JIS编码）
   - 编码效率：每个汉字13位
   - 适用：日文文本

5. **ECI模式（Extended Channel Interpretation）**
   - 用途：指定字符集编码方式
   - 支持：UTF-8, GBK等多种编码

6. **结构化追加模式（Structured Append）**
   - 用途：将大数据分割到多个QR码中
   - 最多：16个QR码组成一个数据序列

### 2.5 掩码图案（Mask Pattern）

为避免出现大面积相同颜色区域影响识别，QR码对数据区域应用掩码图案。共有8种掩码：

| 掩码 | 公式                                  | 描述              |
| ---- | ------------------------------------- | ----------------- |
| 000  | (i + j) mod 2 = 0                     | 棋盘图案          |
| 001  | i mod 2 = 0                           | 水平条纹          |
| 010  | j mod 3 = 0                           | 垂直条纹（间隔3） |
| 011  | (i + j) mod 3 = 0                     | 对角条纹（间隔3） |
| 100  | (⌊i/2⌋ + ⌊j/3⌋) mod 2 = 0             | 大棋盘图案        |
| 101  | (i×j) mod 2 + (i×j) mod 3 = 0         | 复合图案1         |
| 110  | ((i×j) mod 2 + (i×j) mod 3) mod 2 = 0 | 复合图案2         |
| 111  | ((i+j) mod 2 + (i×j) mod 3) mod 2 = 0 | 复合图案3         |

其中 i 为行坐标，j 为列坐标。编码时选择使图案分布最均匀的掩码。

Refitem:

- wiki [https://en.wikipedia.org/wiki/QR_code](https://en.wikipedia.org/wiki/QR_code)
- ISO/IEC 18004:2015 Information technology — Automatic identification and data capture techniques — QR Code bar code symbology specification
- Denso Wave QR Code specification: [https://www.qrcode.com/en/](https://www.qrcode.com/en/)


## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.


## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

