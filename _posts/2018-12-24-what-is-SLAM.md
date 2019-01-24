---
layout: post
title: "The story about vslam"
description: "vslam科普文"
categories: [slam]
tags: [slam]
redirect_from:
  - /2018/04/25/
---

> Visual Simultaneous Localization and Mapping.

* Kramdown table of contents
{:toc .toc}
# Visual SLAM究竟是在做什么 

Created 2018.12.24 by William Yu; Last modified: 2018.12.24-V1.0.1

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyright ©2018 William Yu. All rights reserved.

----

这是一篇科普文，我的目的只有一个：做一份让文科女孩子也能看懂的对SLAM的科普，不能保证准确与正确，所以如果你是领域内的大佬，还请一笑了之并不吝赐教  ^_^

- 关键点一：要理解机器人运作模式，必须先搞清楚人类的思维过程，然后对比描述机器人slam的运作方式。
- 关键点二：但必须注意的一点是，尽管机器人仿人而生，但是机器人也必然有自己的运作方式。
- 关键点一描述了我们正在试图做的一件事：让机器人更像人
- 关键点二描述了我们未来可能做的一件事：让人更像机器人

场景假设：你出门闲逛，然而手机没电了，于是不能使用导航软件，独自穿梭在陌生的城市里，家究竟在何方？

(欲知后事如何，且听下回分解)