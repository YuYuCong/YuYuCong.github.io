---
layout: post
title: "Jupyter Notebook_Python利器"
description: "python编程工具"
categories: [code]
tags: [code,linux,python]
redirect_from:
  - /2018/08/09/
---

>  use jupyter notebook.

* Kramdown table of contents
{:toc .toc}
# Jupyter Notebook——Python编程利器

Created 2018.08.09 by William Yu; Last modified: 2018.11.05-V1.0.3

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2018 William Yu. Some rights reserved.

---



## 安装与运行

安装

```shell
$ sudo pip3 install jupyter
```

运行

```shell
$ jupyter notebook
浏览器访问本地服务器 http://localhost:8888/
```

部署共存的python2和python3 

<https://www.cnblogs.com/v5captain/p/6688494.html>

```shell
$ sudo pip install jupyter  #python2
$ sudo pip3 install jupyter  #python3
```

## Matplotlib

安装Pyhton的库 `pip install matplotlib`

------

##### Q1

https://github.com/YuYuCong/BlogImg/blob/master/180816-12:23:05.png

问题描述：库已经安装好了，但是Jupyter居然找不到。

![Selection_036](/home/will/Pictures/Selection_036.png)

问题分析：版本不匹配，我的电脑安装Python2和3两个版本，Jupyter使用python3，而只有Python2安装了该库。

解决方案：<https://stackoverflow.com/questions/42321784/jupyter-modulenotfounderror-no-module-named-matplotlib#>，使用命令

```shell
$ sudo pip3 install matplotlib
```

出现新的问题

![Selection_037.png](https://github.com/YuYuCong/BlogImg/blob/master/Selection_037.png?raw=true)

![Selection_038.png](https://github.com/YuYuCong/BlogImg/blob/master/Selection_038.png?raw=true)

运行命令显示已经安装，但是运行又找不到！

检查报错，尝试权限

```shell
$ sudo -H pip3 install matplotlib
```

------

##### Q2

在Jupyter使用时，如果要使用要使用matplotlib先运行下列命令载入：

`%matplotlib inline`

------



## See also

- [A gallery of interesting Jupyter Notebooks](https://github.com/jupyter/jupyter/wiki/A-gallery-of-interesting-Jupyter-Notebooks) 以后翻译一份
  - https://github.com/jupyter/jupyter/wiki/A-gallery-of-interesting-Jupyter-Notebooks#machine-learning-statistics-and-probability

## References

- https://jupyter.readthedocs.io/en/latest/install.html
- http://jupyter.org/documentation


- [Jupyter Notebook 快速入门](https://www.cnblogs.com/nxld/p/6566380.html)
- [Python图表绘制：matplotlib绘图库入门](https://www.cnblogs.com/wei-li/archive/2012/05/23/2506940.html)
- JupyterLab
- http://nbviewer.jupyter.org/github/jrjohansson/scientific-python-lectures/blob/master/Lecture-4-Matplotlib.ipynb

## Further reading

- numpy库 数学工具 官方教程 https://docs.scipy.org/doc/numpy/user/quickstart.html
- matplotlib 数学工具 绘图必备

## External links

- 计算机视觉课程 <https://www.bilibili.com/video/av12532910/>

------



## Contact

Feel free to contact me anytime for anything.

-----



## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

