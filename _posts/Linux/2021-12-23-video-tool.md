---
layout: post
title: "Video Tool"
subtitle: "视频文件相关的小工具"
categories: [Linux]
tags: [tool, Linux, video]
header-img: "img/"
header-style: text
redirect_from:
  - /2021/12/23/
---

>  Linux平台下与视频文件相关的小工具

* Kramdown table of contents
{:toc .toc}



----

Created 2021.12.23 by Cong Yu; Last modified: 2022.09.01-V1.0.1

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

----



# Video Tool



## 好用的录屏软件

```shell
$ sudo apt install vokoscreen
$ vokoscreen
```



## ffmpeg 视频流转 GIF 动图

```shell
ffmpeg -ss 2 -t 10 -i output.avi -s 320x240 -r 15 output.gif
```

- -ss 2 表示从第 2 秒开始；
- -t 10 表示往后截取 10 秒；
- -i 表示输入视频；
- -s 表示分辨率；
- -r 表示视频帧率



## ffmpeg 视频格式转码

```shell
ffmpeg -i input.mp4 -vcodec libx264 -preset ultrafast -b:v 2000k output.mp4
```



## untrunc

视频流修复工具

- https://github.com/4dvn/untrunc-1


## 图片文件压缩

##### Jpegoptim

安装

```shell
sudo apt-get install jpegoptim
```

jpegoptim 支持以下格式的文件：

-   jpeg
-   jpg
-   jfif

##### OptiPNG 

支持格式：png

```shell
sudo apt-get install optipng
```

```shell
optipng -o5 ./test.png
```

参数

-o5 使用5级压缩，总共1-7，7级为最大级别压缩，非常慢！

注意：只会无损压缩图片不会改变图片尺寸

##### convert命令

convert命令是ubuntu里面自带的一个命令，这个命令功能很强大：转换图片格式（支持JPG, BMP, PCX, GIF, PNG, TIFF, XPM和XWD等类型）；改变图像尺寸大小；旋转图像；还可以在图像中添加文字等等。

将png转换成jpg

convert filename.png filename.jpg

将gif转换成png

convert filename.gif filename.jpg

改变图像尺寸（注意400和300之间是小写的x）

convert -resize 400x300 filename.jpg   filename1.jpg

上面这个不是很好用，宽度会变成400，长度会根据原图像等比例约束结果

比例缩放图片（长宽都变为原图的一半）

convert -sample 50%x50%  filename.jpg   filename1.jpg

**旋转图像**

顺时针旋转90度

convert -rotate 90 filename.jpg   filename1.jpg




----
## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.


## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

