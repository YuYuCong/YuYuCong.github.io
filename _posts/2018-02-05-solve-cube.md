---
layout: post
title: "Rubik's Cube restoration program"
description: ""
categories: [code]
tags: [cube]
redirect_from:
  - /2018/02/05/
---

> 

* Kramdown table of contents
{:toc .toc}
#三阶魔方还原的13种程序实现

---

William Yu  2018.02.07  update

原文地址：http://tomas.rokicki.com/cubecontest/winners.html

Copyright © 2018 本文遵从创作公用约定（署名-非商业作品-保持一致）条款。欢迎转载、散布，但希望附带本条并注明出处。

不足之处，万望指正，邮箱windmillyucong@163.com

---

##简介

冠军是来自于Ann Arbor, Michigan的Tomas Sirgedas，他提供了一种非常切实可行的并且只有874个C++字符的程序！对于我设定的魔方状态，这套程序的平均解决步数是16.03步，并且平均每种耗时仅仅64毫秒。他的总成绩是非常不可思议的7901；[这份程序](http://tomas.rokicki.com/cubecontest/tomas.txt) 是十分可信的。

第二名是来自Darmstadt, Germany的 Stefan Pochmann，他用C++实现了Thistlethwaite's algorithm算法，他的程序总得分为15,278，总计1311个字符，平均197毫秒得出结果，每个魔方基本上在16.72步还原。即便[这个程序](http://tomas.rokicki.com/cubecontest/stefan1.txt)还不够好的话他也很可能会获得第二名（？），由于所有提交者中Perl提供了只有528个字符的[最短的程序](http://tomas.rokicki.com/cubecontest/stefan2.txt)，平均占用15毫秒得出结果，并且平均327,63步复原一个魔方。

三等奖给了Jaap Scherphuis，来自Delft, the Netherlands，他再次用C++实现了Thistlethwaite's algorithm算法。[他的程序](http://tomas.rokicki.com/cubecontest/jaap.txt)总计2059个字符，平均154毫秒得出结果，并且平均执行16.04步复原魔, 总得分21,599。此外，第一名和第二名都是<u>归功于</u>Jaap和他的网站算法的帮助。（原句Furthermore, both the first and second place winners **credit** Jaap and his site for help with the algorithms! ）

第三名是来自Gennevilliers, France的Antony Boucher ，他使用了四步连续的IDA*搜索算法来复原所有的十字到特定状态，如果失败了，就 复原顶部十字，然后复原剩下的棱块儿，接着用预先设定好的算法复原角块儿。他用C语言编写的[程序](http://tomas.rokicki.com/cubecontest/boucher.txt)使用了1628个字符，获得了惊人的平均22毫秒得出结果的成绩，对于我设定的数据，平均29.49步复原模仿，并且最终得分25,061分。

##Data set

我设置的[实验数据](http://tomas.rokicki.com/cubecontest/testdata.txt)包括了所有的单步转动魔方状态，18种两步转动混乱魔方，18种3步，和46种随机混乱状态。

##源码

按最终成绩排列的最高分记录如下（附下载链接）：

| Place | 名称                                       | 大小   | 速度   | 步骤数    | 得分     |
| ----- | ---------------------------------------- | ---- | ---- | ------ | ------ |
| 1     | [Tomas Sirgedas, Ann Arbor, MI, USA](http://tomas.rokicki.com/cubecontest/sirgedas.zip) | 874  | 64   | 16.03  | 7901   |
| 2     | [Stefan Pochmann, Darmstadt, Germany](http://tomas.rokicki.com/cubecontest/pochmann.zip) | 1311 | 197  | 16.72  | 15278  |
| 3     | [Jaap Scherphuis, Delft, the Netherlands](http://tomas.rokicki.com/cubecontest/jaap.zip) | 2059 | 154  | 16.04  | 21599  |
| 4     | [Antony Boucher, Gennevilliers, France](http://tomas.rokicki.com/cubecontest/boucher.zip) | 1628 | 22   | 29.49  | 25061  |
| 5     | [David Barr, Laurel, MD, USA](http://tomas.rokicki.com/cubecontest/barr.zip) | 1499 | 155  | 35.03  | 34394  |
| 6     | [Charles Tsai, Canton, MA, USA](http://tomas.rokicki.com/cubecontest/ctsai.zip) | 2213 | 10   | 78.76  | 87322  |
| 7     | [Mikael Klasson, Linköping, Sweden](http://tomas.rokicki.com/cubecontest/klasson.zip) | 2190 | 10   | 88.34  | 96925  |
| 8     | [Grant Tregay, West Chicago, IL, USA](http://tomas.rokicki.com/cubecontest/tregay.zip) | 4009 | 10   | 59.17  | 118843 |
| 9     | [Adrian Sandor, Hong Kong, China](http://tomas.rokicki.com/cubecontest/sandor.zip) | 1992 | 670  | 54.65  | 127423 |
| 10    | [Yuri Pertsovski, Hazorea, Israel](http://tomas.rokicki.com/cubecontest/pertsovski.zip) | 3013 | 2    | 98.82  | 149467 |
| 11    | [Joe Lindström, Linköping, Sweden](http://tomas.rokicki.com/cubecontest/lindstrom.zip) | 2054 | 1600 | 39.96  | 172363 |
| 12    | [Justin Legakis](http://tomas.rokicki.com/cubecontest/legakis.zip) | 3517 | 212  | 93.4   | 233883 |
| *     | [Stefan Pochmann, Darmstadt, Germany](http://tomas.rokicki.com/cubecontest/pochmann2.zip) | 528  | 15   | 327.63 | 89089  |

-----

2018.02.07 William Yu 