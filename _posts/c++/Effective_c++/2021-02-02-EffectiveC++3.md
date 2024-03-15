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
- [https://cntransgroup.github.io/EffectiveModernCppChinese/Introduction.html](https://cntransgroup.github.io/EffectiveModernCppChinese/Introduction.html)
- [https://harttle.land/effective-cpp.html](https://harttle.land/effective-cpp.html)

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

- 一条原则：总是成对得使用new和free，确保完成了释放资源的责任。
- 但是在一些工厂方法中，由create函数完成的new，然后返回对象给用户，但是这种实现将释放资源的责任交给了用户，并且没有显式声明这一点，如果用户不知情，那么代码是不安全的。

不安全的代码：

```c++
Investment *pInv = createInvestment(); // 工厂方法中new了对象并返回
...
delete pInv; // 要求用户来实现delete
```

安全的代码：将资源交给unique_ptr 对象来管理，unique_ptr对象析构的时候自动释放资源

```c++

// Prefer "std::make_unique" to direct use of "new".  
// Reference "https://herbsutter.com/gotw/_102/" for details.


```

- 简单总结为：不要用new，直接使用unique_ptr

但是要注意：
- unique_ptr是不可复制的
- 可以只用shared_ptr
	- 原理：引用计数，多个实例指向同一片内存，每生成一个实例将引用计数加1，每析构一个实例将引用计数减1，当引用计数为0时，释放内存。
	- 缺点：不能解决循环引用问题。
	- 循环引用问题：双向链表或者tree结构中，父节点保存了子节点的shared_ptr，同时子节点保存了父节点的shared_ptr，导致循环引用。
- 使用weak_ptr解决循环引用

补充：
- unique_ptr 转 shared_ptr: 使用std::move
	- std::shared_ptr<std::string> name2= std::move(name);
- 不能将shared_ptr转换为unique_ptr

## L14 : 资源管理类要特别注意拷贝行为

Think carefully about copying behavior in resource-managing classes.

拷贝行为只有4种：

1 禁止拷贝。参考L6
2 引用计数。shared_ptr的逻辑
3 拷贝底层资源。完完整整得实现资源的复制
4 转移底层资源的所有权。unique_ptr的逻辑，将资源移交给另一个资源管理对象，自己的资源清空


## L15

## L16


## L17 : 在单独的语句中完成 “将new的对象放入智能指针” 这件事

Store newed objects in smart pointers in standalone statements.

- 务必在单独的语句中将new的对象放入智能指针，这是为了避免 由于其他表达式抛出异常而导致的资源泄漏。 
- 因为C++不同于其他语言，函数参数的计算顺序很大程度上决定于编译器。

举例：

```c++
processWidget(shared_ptr<Widget>(new Widget), priority());
```

上面的代码，不满足L17准则，不是在单独的语句中将new出来的对象放入智能指针，可能存在潜在的问题。

多数情况下，编译器会按下面的过程执行上述代码：

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

