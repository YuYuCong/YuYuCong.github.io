---
layout: post
title: "Video Tool"
subtitle: "视频文件相关的小工具"
categories: [linux]
tags: [tool, linux, video]
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



----



## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.


## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

