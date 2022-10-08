---
layout: post
title: "Effective C++笔记"
description: "Effective C++学习笔记"
categories: [c++]
tags: [c++]
redirect_from:
  - /2021/02/20/
---

>  Effective C++

* Kramdown table of contents
{:toc .toc}
# Effective C++

Created 2021.02.20 by William Yu; Last modified: 2021.02.21-V1.0.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 William Yu. Some rights reserved.

---

<p style="color:#A04000;font-size:26px">References</p>

- 《Effective C++》



# Part One

## L1: four part of c++

### c

### Class

### Template

### STL

## L2: 少用#define

- 尽量少用预编译期，多用编译器

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

- ```c++
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

- ```c++
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

// todo(congyu)

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





# Part Two: Constructors, Destructor and Assignment Operators

析构、构造、赋值运算    ->  Class的脊柱

- 每一个class都会有一或多个构造函数、一个析构函数、一个copy assignment 操作符

## L5: c++默认编写并调用的函数

- 如果一个类是空的，当某操作会用到空类的【default构造函数，copy构造方法，析构函数，copy assignment 操作符】之一的时候，编译器会自动为空类声明缺少的方法

  for example:

  ```c++
  class Empty{};
  
  // 一些操作 与 会用到的函数
  Empty e1;       // default构造函数
  Empty e2(e1);   // copy构造函数
  e2 = e1;        // copy assignment 操作符
  				// 析构函数
  ```

  ```c++
  // 编译器自动补全
  class Empty{
    public:
      Empty() {...} 						 		// default 构造函数
      Empty(const Empty& rhs) {...}				// copy 构造函数
  	~Empty() {...};								// 析构函数
      
      Empty& oprator=(const Empty& rhs){...}		// copy assignment 操作符
  };
  ```

- 注意：所有编译器产生的方法都是public的

## L6: 阻止copy

问题描述：

- 某类可以生成多个实例，但是每个实例都不能被复制出一份副本
- 因此，不应该为该类声明和实现copy构造函数或者copy assignment 操作符号。
- 但是即便程序员不实现，编译器却会自动声明（如L5所述）
- 如何阻止copy呢？

答案：

##### 方法一：

- 所有编译器产生的方法都是public的，为阻止编译器创建这些方法，可以自行声明copy构造函数和 copy assignment 操作符 为private

- 并且只写声明，不予实现

- ```c++
  class OnlyOne{
    public:
      ...
    private:
      ...
      OnlyOne(const OnlyOne&);  // 但是阻止copy
      OnlyOne& operator=(const OnlyOne&);
  };
  ```

- 缺点：

  - member函数和friend函数还是可以调用private函数，但是由于未定义copy方法，所以会在链接时产生链接错误
  - 我们完全可以在编译阶段就防止member和friend函数的copy行为
  - 虽有不足，但非常通用

##### 方法二：

- base Class

- 专门设计一个阻止copy的 base class，再将不愿被copy的类继承它

- ```c++
  class Uncopyable{
    protected:
      Uncopyable() {}   // 允许derived对象构造和析构
      ~Uncopyable() {}
    private:
      Uncopyable(const Uncopyable&);  // 但是阻止copy
      Uncopyable& operator=(const Uncopyable&);
  };
  
  class OnlyOne: private Uncopyable{
      ...
  };
  ```

- 缺点：

  - 当多个不可拷贝的类都继承这个base class， 可能导致多重继承

#### 补充需求：某类只可以生成一个实例

```
// L6_instance.cpp
//********************************************************************************
/**
 * 实现只能生成一个实例的类
 */

class Base {
 public:
  static Base *getInstance() {
    if (0 == instance_) {
      // instance_为0才调用构造函数，实例化一次成功后，instance_不再为0，除非将其释放掉，才能开始下一次实例化
      instance_ = new Base();
    }
    return instance_;
  }

 private:
  Base() {}        // 将构造函数定义为private
  static Base *instance_;  //声明一个指向Base的static指针
};
Base *Base::instance_ = 0;  //定义+初始化

int main() {
  Base *s = Base::getInstance();  //第一次如果实例化成功，那么s不再为0
  Base *s1 = Base::getInstance();  //实例化不成功，因为 s!=0,无法调用构造函数，得到s1 = s
  return 0;
}
```





## L7: 为多态基类声明virtual析构函数

//todo(congyu)  p71 - 74



## L10: 让operate= 返回一个 reference to *this 

- 在为类实现赋值操作符的时候应该遵循下面的协议：赋值操作符必须返回一个reference指向操作符的左侧实参

```c++
class Point{
  public:
    Point() {...} 						 		// default 构造函数
    Point(const Point& rhs) {...}				// copy 构造函数
	~Point() {...};								// 析构函数
    
    Point& oprator=(const Point& rhs){          // copy assignment 操作符
        ...										// 返回类型是一个Reference指向当前对象
    	return* this;
    }
};
```

- 适用于以上标准赋值
- 同样适用于所有赋值相关运算

```c++
class Point{
  public:
    ...
    Point& oprator+=(const Point& rhs){         // 此协议是英语 +=，-+，*= 等 
        ...										
    	return* this;
    }
};
```



## L11: 在=里处理好自我赋值

## L12: 复制对象时勿忘每一成分

# Part Three: Resource Management

资源管理

 

# Part Four: 设计与声明

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

