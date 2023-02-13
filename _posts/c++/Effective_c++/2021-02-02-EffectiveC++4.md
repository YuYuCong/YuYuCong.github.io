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

# Ch4 设计与声明


## L18-19 暂略

## L20: 参数传入：多使用pass-by-reference-to-const 替换 pass-by-value

Prefer pass-by-reference-to-const to pass-by-value

##### 避免拷贝

- c++函数的参数和返回值默认采用传值的方式
- pass-by-value 是一件非常耗时的事情
	- 当函数被调用的时候，会调用传入参数的类的copy构造，初始化形参
	- 当函数返回时，又会触发析构
- pass-by-reference-to-const 效率高
	- 避免了所有参数的构造和析构动作，没有任何新对象被创建
	- const是非常重要的
		- 保证不会对传入的对象作改变
		- 可以避免对象切割问题
- 但是对于 内置类型，STL的迭代器和函数对象，pass-by-value往往更合适
	- reference 是以指针实现的，指针需要32或者64位的空间
	- 所以，对于内置对象而言，pass-by-value比pass-by-reference-to-const更高效，还是建议使用pass-by-value
	- 内置对象非常小，copy的消耗不大
- 但是用户自定义的小对象却不一定适用于上面这个法则
	- 原因：
		- 对象小并不意味着copy的消耗不大，对象小并不意味着拷贝构造的代价不高
			- 比如：
				- 某些对象含有的东西只比一个指针多一点点
				- 但是copy这个对象，却要copy指针所指的每一样东西
		- 另一个重要原因是：即使拷贝构造的代价很小，传值依然有性能问题
			- 编译器可能会区别对待内置类型和用户自定义类型
			- 编译器可能会将一个double放在寄存器中，却拒绝将只含有一个double的对象放入寄存器中
	- 所以对于用户自定义对象还是传引用的好
- 一些规范和习惯
	- 如果函数的参数是in,out的参数，使用指针，一定不要使用引用
	- 如果函数的参数是in的参数，可以使用const 引用

- 此外传递引用还可以避免截断问题

##### 截断问题

- 截断问题：由于类型限制，子类对象被传递时只有父类部分被传入函数。

比如：

一个 `Window` 父类派生了子类 `WindowWithScrollBars`：

```c++
class Window {
public:
...
std::string name() const;           // return name of window
virtual void display() const;       // draw window and contents
};

class WindowWithScrollBars: public Window {
public:
...
virtual void display() const;
};
```

有一个访问 `Window` 接口的函数，通过传值的方式来获取 `Window` 的实例：

```c++
// incorrect! parameter may be sliced!
void printNameAndDisplay(Window w){     
std::cout << w.name();
w.display();
}

WindowWithScrollBars wwsb;
printNameAndDisplay(wwsb);
```

当调用 `printNameAndDisplay` 时参数类型从 `WindowWithScrollBars` 被隐式转换为 `Window`。 该转换过程通过调用 `Window` 的拷贝构造函数来进行。 导致的结果便是函数中的 `w` 事实上是一个 `Window` 对象， 并不会调用多态子类 `WindowWithScrollBars` 的 `display()`。

```c++
// fine, parameter won't be sliced
void printNameAndDisplay(const Window& w){ 
std::cout << w.name();
w.display();
}
```

##### 特殊情况

- 内置类型，STL 迭代器，函数对象不要使用常量引用传递。

原因：

- 内置类型非常小，而一个引用通常需要 32 位或者 64 位的空间
- 内置类型的copy代价也很小
- STL 迭代器和函数对象也应当被传值，这是因为它们在 STL 中确实是被这样设计的，同时它们的拷贝构造函数代价并不高


## L21: 参数返回：不要返回reference

Don't try to return a reference when you must return an object

https://harttle.land/2015/08/18/effective-cpp-21.html

todo(congyu)

## L22: 将成员变量声明为private

- 将成员变量声明为private
- 提供public的成员方法访问和修改这些成员变量

```c++
class UserClass{
public:
  int data() const { return data_; }
  void set_data(int data) { data_ = data; }

private:
  int data_;
}
```

## L23: 非成员函数非友元函数好于成员函数

Prefer non-member non-friend functions to member functions

todo(congyu)

## L24: 用非成员函数来支持所有元的类型转换

Declare non-member functions when type conversions should apply to all parameters.

todo(congyu)

## L25: 考虑实现一个不抛异常的 swap

Consider support for a non-throwing swap.

`std` 中swap的基本实现是很直观的：

```c++
namespace std{
    template<typename T>
    void swap(T& a, T& b){
        T tmp(a);
        a = b;
        b = tmp;
    }
}
```

可以看到，上述 swap 是通过赋值和拷贝构造实现的。所以 `std::swap` 并未提供异常安全。
但由于 swap 操作是很重要的，所以我们应当为自定义的类实现异常安全的 swap。

https://harttle.land/2015/08/23/effective-cpp-25.html

todo(congyu)




-----

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

