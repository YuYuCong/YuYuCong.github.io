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
- [https://cntransgroup.github.io/EffectiveModernCppChinese/Introduction.html](https://cntransgroup.github.io/EffectiveModernCppChinese/Introduction.html)
- [https://harttle.land/effective-cpp.html](https://harttle.land/effective-cpp.html)

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

一个 `Window` 父类派生了子类 `WindowWithScrollBars`：

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

有一个访问 `Window` 接口的函数，通过传值的方式来获取 `Window` 的实例：

```c++
// incorrect! parameter may be sliced!
void printNameAndDisplay(Window w){     
std::cout << w.name();
w.display();
}

WindowWithScrollBars wwsb;
printNameAndDisplay(wwsb);
```

当调用 `printNameAndDisplay` 时参数类型从 `WindowWithScrollBars` 被隐式转换为 `Window`。 该转换过程通过调用 `Window` 的拷贝构造函数来进行。 导致的结果便是函数中的 `w` 事实上是一个 `Window` 对象， 并不会调用多态子类 `WindowWithScrollBars` 的 `display()`。

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

##### 为什么不要返回reference

当函数必须返回一个新对象时，不要试图返回一个reference。这样做会导致未定义行为或内存泄漏。

##### 错误示例

考虑一个有理数类：

```c++
class Rational {
public:
    Rational(int numerator = 0, int denominator = 1);
    // ...
private:
    int n, d;  // numerator and denominator
    friend const Rational operator*(const Rational& lhs, const Rational& rhs);
};
```

如果我们试图让 `operator*` 返回reference：

```c++
// 错误做法1：返回局部对象的引用
const Rational& operator*(const Rational& lhs, const Rational& rhs) {
    Rational result(lhs.n * rhs.n, lhs.d * rhs.d);
    return result;  // 返回局部对象的引用，未定义行为！
}

// 错误做法2：返回堆对象的引用
const Rational& operator*(const Rational& lhs, const Rational& rhs) {
    Rational* result = new Rational(lhs.n * rhs.n, lhs.d * rhs.d);
    return *result;  // 谁来delete？内存泄漏！
}

// 错误做法3：返回静态对象的引用
const Rational& operator*(const Rational& lhs, const Rational& rhs) {
    static Rational result;
    result = Rational(lhs.n * rhs.n, lhs.d * rhs.d);
    return result;  // 线程不安全，且无法处理连续运算
}
```

##### 正确做法

```c++
// 正确做法：返回对象
const Rational operator*(const Rational& lhs, const Rational& rhs) {
    return Rational(lhs.n * rhs.n, lhs.d * rhs.d);
}
```

虽然这会调用构造函数和析构函数，但编译器通常会进行返回值优化（RVO），消除不必要的拷贝。

##### 总结

- 绝不要返回pointer或reference指向一个local stack对象
- 绝不要返回reference指向一个heap-allocated对象
- 绝不要返回pointer或reference指向一个local static对象而有可能同时需要多个这样的对象

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

##### 封装性考虑

考虑一个Web浏览器类：

```c++
class WebBrowser {
public:
    void clearCache();
    void clearHistory();
    void removeCookies();
    
    // 方案1：成员函数
    void clearEverything() {
        clearCache();
        clearHistory();
        removeCookies();
    }
};

// 方案2：非成员函数
void clearBrowser(WebBrowser& wb) {
    wb.clearCache();
    wb.clearHistory();
    wb.removeCookies();
}
```

##### 为什么非成员函数更好

1. **更好的封装性**：
   - 能够访问class private成员的函数越少，封装性就越大
   - 非成员函数不能访问class的private成员，因此提供了更大的封装性

2. **包装灵活性**：
   - 非成员函数可以放在不同的头文件中，提供更好的编译依赖管理
   - 客户可以轻松扩展这组便利函数

3. **命名空间的使用**：

```c++
namespace WebBrowserStuff {
    class WebBrowser { ... };
    
    // 核心功能相关的便利函数
    void clearBrowser(WebBrowser& wb);
    
    // 书签相关的便利函数（可以放在单独的头文件中）
    void addBookmark(WebBrowser& wb, const std::string& url);
    void removeBookmark(WebBrowser& wb, const std::string& url);
    
    // 历史记录相关的便利函数（可以放在单独的头文件中）
    void exportHistory(const WebBrowser& wb, const std::string& filename);
    void importHistory(WebBrowser& wb, const std::string& filename);
}
```

##### 注意事项

- 这个建议只适用于非成员**非友元**函数
- 友元函数对class private成员的访问权力和member函数相同，因此封装性相同
- 在C++中，更自然的做法是让这些函数成为同一个namespace内的non-member函数

## L24: 用非成员函数来支持所有元的类型转换

Declare non-member functions when type conversions should apply to all parameters.

##### 问题描述

考虑一个有理数类，支持隐式类型转换：

```c++
class Rational {
public:
    Rational(int numerator = 0, int denominator = 1);  // 允许隐式转换
    int numerator() const;
    int denominator() const;
    
    // 成员函数版本的operator*
    const Rational operator*(const Rational& rhs) const;
};
```

使用成员函数时会遇到问题：

```c++
Rational oneEighth(1, 8);
Rational oneHalf(1, 2);

Rational result = oneHalf * oneEighth;  // 正常工作
result = result * oneEighth;            // 正常工作

result = oneHalf * 2;    // 正常工作，2被隐式转换为Rational
result = 2 * oneHalf;    // 错误！无法编译
```

##### 原因分析

上述调用相当于：

```c++
result = oneHalf.operator*(2);    // 正常，2被转换为Rational
result = 2.operator*(oneHalf);    // 错误，int没有operator*成员函数
```

只有当参数被列于参数列表内，这个参数才是隐式类型转换的合格参与者。地位为"被调用之成员函数所隶属的那个对象"的那个隐含参数，绝不是隐式转换的合格参与者。

##### 解决方案：非成员函数

```c++
class Rational {
public:
    Rational(int numerator = 0, int denominator = 1);
    int numerator() const;
    int denominator() const;
    // 不再声明operator*为成员函数
};

// 非成员函数版本
const Rational operator*(const Rational& lhs, const Rational& rhs) {
    return Rational(lhs.numerator() * rhs.numerator(),
                   lhs.denominator() * rhs.denominator());
}
```

现在所有调用都能正常工作：

```c++
Rational oneFourth(1, 4);
Rational result;

result = oneFourth * 2;    // 正常工作
result = 2 * oneFourth;    // 正常工作！
```

两个调用都相当于：

```c++
result = operator*(oneFourth, 2);    // oneFourth正常，2被转换为Rational
result = operator*(2, oneFourth);    // 2被转换为Rational，oneFourth正常
```

##### 是否需要友元函数

通常不需要。如果可以完全藉由class的public接口完成任务，就不需要友元函数：

```c++
// 不需要友元，因为可以通过public接口实现
const Rational operator*(const Rational& lhs, const Rational& rhs) {
    return Rational(lhs.numerator() * rhs.numerator(),
                   lhs.denominator() * rhs.denominator());
}
```

##### 总结

如果你需要为某个函数的所有参数（包括被this指针所指的那个隐喻参数）进行类型转换，那么这个函数必须是个non-member。

## L25: 考虑实现一个不抛异常的 swap

Consider support for a non-throwing swap.

`std` 中swap的基本实现是很直观的：

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

可以看到，上述 swap 是通过赋值和拷贝构造实现的。所以 `std::swap` 并未提供异常安全。
但由于 swap 操作是很重要的，所以我们应当为自定义的类实现异常安全的 swap。

##### 问题分析

对于某些类型，默认的swap实现效率很低。考虑一个"pimpl idiom"（pointer to implementation）的例子：

```c++
class WidgetImpl {
public:
    // ...
private:
    int a, b, c;              // 可能有很多数据
    std::vector<double> v;    // 意味着复制时间很长
    // ...
};

class Widget {
public:
    Widget(const Widget& rhs);
    Widget& operator=(const Widget& rhs) {
        // 复制Widget时，复制WidgetImpl对象
        *pImpl = *(rhs.pImpl);
        return *this;
    }
    // ...
private:
    WidgetImpl* pImpl;        // 指针，指向一个对象
};
```

使用默认的swap会进行三次复制：复制两个Widget对象和一个临时对象，但实际上我们只需要交换两个指针！

##### 解决方案1：全特化std::swap

```c++
class Widget {
public:
    // ...
    void swap(Widget& other) {
        using std::swap;           // 这个声明很重要
        swap(pImpl, other.pImpl);  // 交换指针
    }
    // ...
};

// 特化std::swap
namespace std {
    template<>                    // 这是std::swap针对T是Widget的特化版本
    void swap<Widget>(Widget& a, Widget& b) {
        a.swap(b);               // 调用成员函数swap
    }
}
```

##### 解决方案2：模板类的情况

对于模板类，我们不能偏特化函数模板，只能重载：

```c++
template<typename T>
class WidgetImpl { ... };

template<typename T>
class Widget {
public:
    void swap(Widget& other) {
        using std::swap;
        swap(pImpl, other.pImpl);
    }
    // ...
};

// 不能这样做（函数模板偏特化是不被允许的）：
namespace std {
    template<typename T>
    void swap<Widget<T>>(Widget<T>& a, Widget<T>& b) {  // 错误！
        a.swap(b);
    }
}

// 正确做法：重载
namespace std {
    template<typename T>
    void swap(Widget<T>& a, Widget<T>& b) {  // 重载std::swap
        a.swap(b);
    }
}
```

但是，向std命名空间添加新的templates是被禁止的！

##### 解决方案3：自定义命名空间

```c++
namespace WidgetStuff {
    template<typename T>
    class Widget { 
        public:
            void swap(Widget& other) {
                using std::swap;
                swap(pImpl, other.pImpl);
            }
        // ...
    };
    
    template<typename T>                    // non-member swap函数
    void swap(Widget<T>& a, Widget<T>& b) { // 不属于std命名空间
        a.swap(b);
    }
}
```

##### 调用swap的最佳实践

```c++
template<typename T>
void doSomething(T& obj1, T& obj2) {
    using std::swap;    // 令std::swap在此函数内可用
    // ...
    swap(obj1, obj2);   // 为T类型对象调用最佳swap版本
    // ...
}
```

这样做的好处：
1. 如果T专属的swap存在，会调用专属版本
2. 如果T专属的swap不存在，会调用std::swap

##### 总结

1. 当std::swap对你的类型效率不高时，提供一个swap成员函数，并确定这个函数不抛出异常
2. 如果你提供一个member swap，也该提供一个non-member swap用来调用前者。对于classes（而非templates），也请特化std::swap
3. 调用swap时应针对std::swap使用using声明式，然后调用swap并且不带任何"命名空间资格修饰"
4. 为"用户定义类型"进行std templates全特化是好的，但千万不要尝试在std内加入某些对std而言全新的东西




-----

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

