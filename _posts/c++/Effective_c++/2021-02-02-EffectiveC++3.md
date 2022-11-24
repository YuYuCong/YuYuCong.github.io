---
layout: post
title: "Effective C++系列笔记13-17"
description: "Effective C++系列笔记，第三章，第13-17小节"
categories: [c++]
tags: [c++]
redirect_from:
  - /2021/02/20/
---

>  Effective C++


* Kramdown table of contents
{:toc .toc}

# Effective C++ 13-17

Created 2021.02.20 by William Yu; Last modified: 2021.02.21-V1.0.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 William Yu. Some rights reserved.

---

<p style="color:#A04000;font-size:26px">References</p>

- 《Effective C++》

本文内容：《Effective C++》阅读笔记，总共9个章节，55小节。

# Ch3 Resource Management

资源管理

资源：
- 内存
- 文件描述符
- 互斥锁
- 数据库链接
- 网络socket


## L13: 使用对象来管理资源

Use objects to manage resources.

一条原则：总是成对得使用new和free

- https://harttle.land/2015/08/02/effective-cpp-13.html


## L17 : 在单独的语句中完成 “将new的对象放入智能指针” 这件事

Store newed objects in smart pointers in standalone statements.

- 务必在单独的语句中将new的对象放入智能指针，这是为了避免 由于其他表达式抛出异常而导致的资源泄漏。 
- 因为C++不同于其他语言，函数参数的计算顺序很大程度上决定于编译器。

举例：

```c++
processWidget(shared_ptr<Widget>(new Widget), priority());
```

上面的代码，不满足L17准则，不是在单独的语句中将new出来的对象放入智能指针，可能存在潜在的问题。

上述代码，多数情况下，编译器会按下面的过程执行：

1. 执行 `new Widget`
2. 构造 `shared_ptr<Widget>`
3. 调用`priority()`

但是编译器有权决定这三个步骤的顺序，如果由于某种效率原因，编译器认为顺序应当是 1，3，2。那么如果priority执行时抛出了异常，上一步new出来的widget就丢失了，造成了资源泄露！

健壮的实现，应当是在独立的语句中完成“将new出的对象放入智能指针”这件事情

```c++
shared_ptr<Widget> pw = shared_ptr<Widget>(new Widget);
processWidget(pw, priority());
```





-----

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

