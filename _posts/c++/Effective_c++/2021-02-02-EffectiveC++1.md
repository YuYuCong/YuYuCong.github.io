---
layout: post
title: "Effective C++系列笔记1-4"
description: "Effective C++系列笔记，第一章，第1-4小节"
categories: [c++]
tags: [c++]
redirect_from:
  - /2021/02/20/
---

>  Effective C++


* Kramdown table of contents
{:toc .toc}

# Effective C++ 1-4

Created 2021.02.20 by William Yu; Last modified: 2021.02.21-V1.0.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 William Yu. Some rights reserved.

---

<p style="color:#A04000;font-size:26px">References</p>

- 《Effective C++》
- [https://cntransgroup.github.io/EffectiveModernCppChinese/Introduction.html](https://cntransgroup.github.io/EffectiveModernCppChinese/Introduction.html)
- [https://harttle.land/effective-cpp.html](https://harttle.land/effective-cpp.html)

本文内容：《Effective C++》阅读笔记，总共9个章节，55小节。

# Ch1 习惯c++

## L1: 将c++看做一个语言联邦

从4个方面去看待c++

### c

以c语言为基础。包含了c的特性：
- 区块 blocks
- 语句 statements
- 预处理 preprocessor
- 内置数据类型
- 数组
- 指针

### Object-Oriented

简单来讲就是面向对象

- class
	- 构造函数
	- 析构函数
	- 封装
	- 继承
	- 多态
	- virtual 函数 （动态绑定）

### Template

泛型编程

### STL

是一个template标准库

- 容器
- 迭代器
- 算法

## L2: 少用#define

- 尽量少用预处理器，多用编译器
- 使用const, enum, inline 替换 `#define`
	- 对于常量，使用const, enum替换#define
	- 对于形似函数的宏，使用inline函数替换#define

#### const、inline

- For example:

  ```c++
  #define Pi 3.1415926   //bad
  const double Pi = 3.1415926;  //good
  
  
  #define MAX(a,b) f((a)>(b) ? (a):(b)) //bad
  template<typename T>
  inline void MAX(const T& a, const T& b){   //good
      f(a > b ? a : b);
  }
  ```

#### 类内的静态常量

class专属常量

- 需求

  - 将常量的作用域限制于class内    ->     定义为类内成员
  - 确保此常量只有一份实体     ->    定义为static成员

 ```c++
  // xxx.h
  class GamePlayer{
    private:
      static const int NumTurns = 5;    // 成员常量声明式
      ...
  }
  ```

  注意：

  - 上面你只看到了NumTurns的声明式，而非定义式

  - 如果是 class 专属常量，且为static，且为整数类型（int,char,bool），只要不取他们的地址，可以在只声明不提供定义式的情况下使用

  - 但是如果要取地址，就必须另外提供一个定义式：

    ```c++
    // xxx.cc
    const int GamePlayer::NumTurns;    //这才是定义式
    ```

  - 定义式放在实现文件里面，不要放在头文件里面

  - 声明时获得初始值，定义时不可再设初始值    ->   in-class 初值设定

  - 旧的编译器可能不支持in-class 初值设定。也可以 定义时设置初值，声明时不设置初值

    ```c++
    // xxx.h
    class GamePlayer{
      private:
        static const int NumTurns;
        ...
    }
    
    // xxx.cc
    const int GamePlayer::NumTurns = 5;  // 定义时给初值
    ```

    - 但是有个例外：class编译期间需要的常量（比如某个数组的大小由某常量给出），而旧式编译器不支持“in-class 初值设定”，如何解决？  ->    "enum hack"补偿

      ```c++
      // xxx.h
      class GamePlayer{
        private:
          enum {NumTurns = 5};
          int scores[NumTurns];
          ...
      }
      
      ```

#### enum hack

以上引出了enum_hack的使用场景

- enum hack的优点
  - 可以提供一种整数常量，无法被别人获取到一个pointer或reference指向该常量
    - 这一点上，enum和#define一样，无法取地址，于是不会造成不必要的内存分配
    - 但是const却可以被取地址
  - 实用主义



## L3: 多使用const

- const提供常量约束
- 如果某些对象是确定不变的，编程的时候就立即用const约束

#### const修饰指针

- const 可以修饰指针自身  ->  *号后有const
- const 可以修饰指针所指物    ->    *号前有const
- 或者两者都修饰    ->   *号前后都有const

```c++
  char* p1 = greeting1;              // non-const pointer, non-const data
  const char* p2 = greeting2;        // non-const pointer, const data
  char const * p2 = greeting2;      // 和上一行一样，两种写法都可以
  char* const p3 = greeting3;        // const pointer, non-const data
  const char* const p4 = greeting4;  // const pointer, const data
```

for example:

```c++
// L3_const.cpp
/********************************************************************************
 * const 修饰指针
 */
int main(){
  
  char greeting1[] = "hello";
  char greeting2[] = "hello";
  char greeting3[] = "hello";
  char greeting4[] = "hello";

  char* p1 = greeting1;              // non-const pointer, non-const data
  const char* p2 = greeting2;        // non-const pointer, const data
  char* const p3 = greeting3;        // const pointer, non-const data
  const char* const p4 = greeting4;  // const pointer, const data

  p1 += 1;   // p1 = 0x7fffa0"hello" 变为 p1 = 0x7fffa1"ello", greeting = "hello"
  *p1 += 1;  // greeting = "hfllo", p1 = "fllo"

  p2 += 1;  // p2 = 0x7fffb1"ello", greeting = "hello"
  // *p2 += 1; // 编译不通过

  // p3 += 1; // 编译不通过
  *p3 += 1;  // greeting = "iello", p3 = 0x7fffc0"iello"

  // p4 += 1;  // 编译不通过
  // *p4 += 1; // 编译不通过

  return 0;
}
```

#### const修饰迭代器

- STL 迭代器相当于 T* 指针，所以const修饰指针和修饰迭代器差不多

 ```c++
  const std::vector<int>::iterator iter = vec.begin();    // iter相当于T* const   // const iter, non-const data
  std::vector<int>::const_iterator const_iter = vec.begin();  //const_iter相当于const T*  // non-const iter, const data
  ```

- STL迭代器提供了一个const_iterator类，实现non-const iter,  const data

#### const修饰函数声明

##### 1. 函数返回const常量

const写在最左边

```c++
const int f_add(int a, int b){
  return a + b;
}

int a = 4,b = 3;
if (f_add(a + b) = 10){  // 避免出现这样的笔误，本来应该写==判断，但是却写成了=赋值操作。如果f_add的返回不限定为const，这样的笔误很难发现
    ...
} 

if (f_add(a + b) == 10){  
    ...
} 
```

**一点小tips**:

当然，针对上面所讲的这种笔误，更好的操作是：所有出现 == 判断的地方，将值放在左边

```c++
if (f_add(a + b) == 10){  // bad
    ...
} 
if (10 == f_add(a + b)){  // good
    ...
} 
```

##### 2. const成员函数

如果一个成员方法里面的操作是不会改变成员变量的，那么我们应该务必将它限定为const

好处：
- class的接口可以非常容易理解：哪些是会改变对象内容的，哪些是不会改变对象内容的。一目了然。

```c++
class TestClass{
 public:
	int GetNum() const { // 限定const成员函数
		nums_++; // 这种操作会在编译时报错
		return nums_;
	}

 private:
	int nums_;
}

```

#### const修饰类

// todo(congyu)



## L4: 确定对象被使用前已经被初始化

- 永远在使用对象之前先将其初始化
	- 对于C++内置数据类型（如int, double, string），手动完成初始化
	- 对于其他，在构造函数进行初始化，确保每一个构造函数都将对象的每一个成员初始化


#### 初始化的方法：成员初值列

##### 初始化和赋值的区别

- 对象成员变量的初始化动作发生在进入构造函数本体之前，**成员初值列**     **member initialization list**
- 在构造函数之内的，都是赋值而非初始化

for example:

```c++
class Point2d{
  public:
	Point2d(const float x, const float y);
  private:
    float x_;
    float y_;
};

Point2d::Point2d(const float x, const float y){
    x_ = x;   // 赋值
    y_ = y;
}

Point2d::Point2d(const float x, const float y)
   	:x_(x),y_(y)  // 初始化
{
   // 构造函数本体不用做什么       
}
```

- 成员初值列的效率通常较高，是copy构造

  - 对于大多数类型而言，先调用default构造，再调用copy assignment操作，对比  单只调用一次copy构造函数，后者要高效得多
  - 对于c++内置的简单对象，初始化和赋值成本相同，但是依旧建议使用成员初值列

- 成员初值列也支持default构造，只要指定(nothing)作为初始化实参即可：

  ```c++
  class Circle{
    public:
      Circle(const Point2d& point, const float r);
    private:
      Point2d point_;
      float r_;
     	float think_;
  };
  
  Circle::Circle(const Point2d& point, const float r)
  	:point_(),     // 调用 point_的默认构造函数
  	 r_(r),        // 调用 copy构造
       think_(0.5)   // 显式初始化
  {
  }
  ```

- 建议总是在初值列中列出所有成员变量，但是有下面这种例外情形：一个类拥有多个构造函数时

#### 当类拥有多个构造函数 

问题：

- 当class拥有多个构造函数的时候，每个构造函数都会有自己的成员初值列，这会造成重复。

解决：

- 这种情况下，可以在初值列中忽略一些成员变量的初始化
- 忽略哪些呢？忽略那些c++内置的简单对象的初始化   （因为他们初始化与赋值的成本一样）
- 对没有初始化的被忽略的成员变量改用赋值，进行“伪初始化”
- 将这些赋值操作移到某个函数内（通常为private, 命名为Init...）
- 然后在所有的构造函数内调用

Tips：

- 这种操作通常发生在“成员变量的初值由参数文件或者数据库读入”的情形下

#### 成员初始化次序

- c++有固定的成员初始化顺序
	- base class 早于  derived class
	- class内的成员变量按照其声明顺序初始化
- 但是对于static对象，该如何分析？

For example

```c++
code: pc/sync/c++/basic/Effective_c++/L4.cpp
```



##### static对象的初始化次序

// todo(congyu) P61 - 63

- 最好使用local static对象替换non-local static对象





-----

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

