---
layout: post
title: "Effective C++系列笔记26"
description: "Effective C++系列笔记，第五章，第26-小节"
categories: [c++]
tags: [c++]
redirect_from:
  - /2021/02/20/
---

>  Effective C++


* Kramdown table of contents
{:toc .toc}

# Effective C++ 26-

Created 2021.02.20 by William Yu; Last modified: 2021.02.21-V1.0.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 William Yu. Some rights reserved.

---

<p style="color:#A04000;font-size:26px">References</p>

- 《Effective C++》

本文内容：《Effective C++》阅读笔记，总共9个章节，55小节。

# Part Five: Implementations

实现

## L26: 尽量推迟变量的定义

Postpone variable definitions as long as possible.

优点：
- 一方面可以避免无用的构造使得程序更高效
- 另一方面作用域的缩小会使程序更加清晰

##### 推迟构造函数的执行

##### 推迟到有构造参数时

变量定义可以一直推迟到你有初始化参数时再进行。

##### 循环中的变量定义

循环中的变量定义是一个常见的争论点。

我们可以有两种写法：

写法A，在循环外定义：

```c++
Widget w;
for (int i = 0; i < n; ++i){ 
  w = some value dependent on i;
  ...                           
}                  

```

写法B，在循环内定义：

```c++
for (int i = 0; i < n; ++i) {
    Widget w(some value dependent on i);
    ...
}
```

优劣分析
- 写法A的代价是：1个构造函数，1个析构函数，n个赋值运算符
- 写法B的代价是：n个构造函数，n个析构函数
- 显然通常情况下写法A更高效。
- 但写法A使得循环内才使用的变量进入外部的作用域，不利于程序的理解和维护。
- **软件工程中倾向于认为人的效率比机器的效率更加难得， 所以推荐采用B来实现**。除非：
	1.  这段代码的性能尤为重要，并且：
	2.  赋值比一对构造/析构更加廉价，且廉价得多。

## L30: inline

- inline 可免除函数调用成本
- 过度使用inline 会使目标代码大小变大 
- 尽量对小型、被频繁调用的函数使用inline



# Part Six: Object

继承和面向对象设计 OOP







# Part Seven: Templates

模板和泛型编程







-----

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

