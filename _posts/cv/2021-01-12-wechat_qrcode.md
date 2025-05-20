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

<small class="img-hint">Fig1.  **QR-code detect result using wechat_qrcode**</small>



## 2. QR code

再好奇一下二维码的结构。

Refitem:

- wiki [https://en.wikipedia.org/wiki/QR_code](https://en.wikipedia.org/wiki/QR_code)

//todo(congyu)





---


## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.


## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

