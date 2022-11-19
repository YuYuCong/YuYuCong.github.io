---
layout: post
title: "Effective C++系列笔记18-25"
description: "Effective C++系列笔记，第四章，第18-25小节"
categories: [c++]
tags: [c++]
redirect_from:
  - /2021/02/20/
---

>  Effective C++


* Kramdown table of contents
{:toc .toc}

# Effective C++ 18-25

Created 2021.02.20 by William Yu; Last modified: 2021.02.21-V1.0.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 William Yu. Some rights reserved.

---

<p style="color:#A04000;font-size:26px">References</p>

- 《Effective C++》

本文内容：《Effective C++》阅读笔记，总共9个章节，55小节。

# Ch3 设计与声明

## L20: 参数传入：多使用pass-by-reference-to-const 替换 pass-by-value

- pass-by-value 是一件非常耗时的事情
  - 当函数被调用的时候，会调用传入参数的类的copy构造，初始化形参
  - 当函数返回时，又会触发析构
- pass-by-reference-to-const 效率高
  - 避免了所有参数的构造和析构动作，没有任何新对象被创建
  - const是非常重要的
    - 保证不会对传入的对象作改变
  - 可以避免对象切割问题
- 内置类型，STL的迭代器和函数对象，pass-by-value往往更合适
  - reference 是以指针实现的
  - 所以，对于内置对象而言，pass-by-value比pass-by-reference-to-const更高校，还是建议使用pass-by-value
  - 内置对象非常小，copy的消耗不大
  - 但是用户自定义的小对象却不一定满足这个法则，小对象并不意味着copy的消耗不大
    - 比如：某些对象含有的东西只比一个指针多一点点
    - 但是copy这个对象，却要copy指针所指的每一样东西



## L21: 参数返回：不要返回reference



## L22: 将成员变量声明为private

- 将成员变量声明为private
- 提供public的成员方法访问和修改这些成员变量





# Part Five: Implementations

实现

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

