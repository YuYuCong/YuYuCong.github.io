---
layout: post
title: "cv::WeChatORCode 二维码识别"
description: “cv::wechat_qrcode::WeChatORCode类"
categories: [opencv]
tags: [code,opencv,python]
redirect_from:
  - /2021/03/05/
---

>  OpenCV Wechart QR Class, 一条函数搞定二维码识别

* Kramdown table of contents
{:toc .toc}
# cv::wechat_qrcode::WeChatORCode 


Created 2021.03.05 by William Yu; Last modified: 2021.03.05-V1.0.1

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 William Yu. Some rights reserved.

---

<p style="font-size:22px;color:#098d;">References</p>


- https://docs.opencv.org/master/d5/d04/classcv_1_1wechat__qrcode_1_1WeChatQRCode.html
- https://github.com/WeChatCV/opencv_3rdparty

## Basic Concepts

- Feature：
  - Includes two CNN-based models:
    - A object detection model
      - to detect QRCode with the bounding box
    - A super resolution model  
      - zoom in QRCode when it is small

## Usage

#### head file

```c++
#include <opencv2/wechat_qrcode.hppp>

using namespace cv::wechat_qrcode;
```

#### Public Member Functions

##### 1. Constructor & Destructor

c++

```c++
WeChatQRCode::WeChatQRCode (
    const std::string &detector_prototxt_path="",
    const std::string &detector_caffe_model_path="", 
    const std::string &super_resolution_prototxt_path="", 
    const std::string &super_resolution_caffe_model_path=""
)

WeChatQRCode::~WeChatQRCode()
```

###### Parameters

| Parameters | Description |
| --- | --- |
| detector_prototxt_path | prototxt file path for the detector |
| detector_caffe_model_path         | caffe model file path for the detector            |
| super_resolution_prototxt_path    | prototxt file path for the super resolution model |
| super_resolution_caffe_model_path | caffe file path for the super resolution model    |

- file download link:
  - https://github.com/WeChatCV/opencv_3rdparty

python

```python
<wechat_qrcode_WeChatQRCode object>	=	cv.wechat_qrcode_WeChatQRCode(
    [, detector_prototxt_path
    [, detector_caffe_model_path
    [, super_resolution_prototxt_path
    [, super_resolution_caffe_model_path]]]]
)
```

##### 2. detectAndDecode()

```c++
std::vector<std::string> cv::wechat_qrcode::WeChatQRCode::detectAndDecode (
    InputArray img,
	OutputArrayOfArrays points = noArray()
)
```

```python
retval, points	=	cv.wechat_qrcode_WeChatQRCode.detectAndDecode(	img[, points]	)
```

###### Parameters

- Parameters
  - img | 输入参数 | imgsupports grayscale or color (BGR) image. 
  - points | 输出参数 | optional output array of vertices of the found QR code quadrangle. Will be empty if not found.

- Returns
  - list of decoded string.









---




## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

