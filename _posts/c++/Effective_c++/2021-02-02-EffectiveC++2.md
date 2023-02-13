---
layout: post
title: "Effective C++系列笔记5-12"
description: "Effective C++系列笔记，第二章，第5-12小节"
categories: [c++]
tags: [c++]
redirect_from:
  - /2021/02/20/
---

>  Effective C++


* Kramdown table of contents
{:toc .toc}

# Effective C++ 5-12

Created 2021.02.20 by William Yu; Last modified: 2021.02.21-V1.0.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 William Yu. Some rights reserved.

---

<p style="color:#A04000;font-size:26px">References</p>

- 《Effective C++》

本文内容：《Effective C++》阅读笔记，总共9个章节，55小节。

# Ch2 构造/析构/赋值运算符

Constructors, Destructor and Assignment Operators

- 析构、构造、赋值运算    ->  Class的脊柱
- 每一个class都会有一或多个构造函数、一个析构函数、一个copy assignment 操作符

## L5: c++默认编写并调用的函数

#### 自动补全
- 编译器会为类自动补全一些方法：
	- default构造函数
	- copy构造方法
	- copy assignment 操作符
	- 析构函数

  ```c++
  // 如果写了一个空类
  class Empty{};
  
  // 编译器自动补全：
  class Empty{
    public:
      Empty() {...} 						 		// default 构造函数
      Empty(const Empty& rhs) {...}				    // copy 构造函数
      ~Empty() {...};								// 析构函数
      
      Empty& oprator=(const Empty& rhs){...}		// copy assignment 操作符
  };
  ```

- 注意：所有编译器产生的方法都是public的

#### 调用时机

  ```c++
  
  // 一些操作 与 会用到的函数
  Empty e1;       // default构造函数
  Empty e2(e1);   // copy构造函数
  Empty e3 = e1;   // copy构造函数

  e2 = e1;        // copy assignment 操作符
				  // 退出作用域时，自动调用析构函数
  ```

## L6: 禁用那些不需要的缺省方法

如L5小节所言，C++中，编译器会自动生成一些你没有显式定义的函数，它们包括：构造函数、析构函数、复制构造函数、=运算符。但是有时候我们并不需要这些函数。比如下面的问题：

问题描述：

- 某类可以生成多个实例，但是每个实例都不能被复制出一份副本
	- 比如运动指令
- 因此，不应该为该类声明和实现copy构造函数或者copy assignment 操作符号。
- 但是即便程序员不实现，编译器却会自动声明（如L5所述）
- 如何阻止copy呢？

答案：
- 方法一：将这些方法设为private
- 方法二：专门实现一个不可拷贝的类`Uncopyable`，再将不愿被copy的类继承它

##### 方法一： 声明为private

- 所有编译器产生的方法都是public的，为阻止编译器创建这些方法，可以自行声明copy构造函数和 copy assignment 操作符 ，并设定为private
- 并且只写声明，不予实现

```c++
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

##### 方法二：Uncopyable base class

- base Class
- 专门设计一个阻止copy的 base class，再将不愿被copy的类继承它

```c++
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

以上是，类可以有多个实例，但是每个实例都不能copy的情况。

#### 补充需求：只可以生成一个实例的类

即设计模式里面的单例模式 Singleton

```c++
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


```c++
/**  
 * @brief A singleton template for easy usage 
 * @tparam T Class derived to use for singleton 
 * @tparam lazy Lazy mode (construct while runtime) or not (construct at once 
 *         running) 
 * */
template <typename T, bool lazy = false>  
class Singleton {  
 public:  
  virtual ~Singleton() = default;  
  Singleton(const Singleton &) = delete;  
  Singleton &operator=(const Singleton &) = delete;  
  Singleton(Singleton &&) = delete;  
  Singleton &operator=(Singleton &&) = delete;  
  
  /// Create singleton  
  template <typename... Args>  
  static std::shared_ptr<T> Create(Args &&...args) {  
    if (!instance_) {  
      static std::mutex mutex;  
      std::lock_guard<std::mutex> lock(mutex);  
      if (!instance_) {  
        instance_ = std::shared_ptr<T>(new T(std::forward<Args>(args)...));  
      }  
    }    return instance_;  
  }  
  
  /// Destroy singleton  
  static void Destroy() { instance_ = nullptr; }  
  
  /// Get singleton  
  static std::shared_ptr<T> Instance() { return Create(); };  
  
 protected:  Singleton() = default;  
  
 private:  /// Singleton instance  
  static std::shared_ptr<T> instance_;  
};  
  
template <typename T, bool lazy>  
std::shared_ptr<T> Singleton<T, lazy>::instance_ =  
    lazy ? nullptr : std::shared_ptr<T>(new T);
```



## L7: 将基类的析构函数声明为virtual

Declare destructors virtual in polymorphic base classes

- 将基类的析构函声明为虚函数。
- 目的：解决指针调用时会出现的问题：
	- 以基类指针调用子类时，会只调用基类析构函数，无法调用子类的析构函数，无法正确地析构子类的内存。

正确的做法：

```c++
// 基类
class TimeKeeper{
public:
    virtual ~TimeKeeper();
    ...
};

TimeKeeper *ptk = getTimeKeeper():  // 可能返回任何一种子类，但是指针是指向基类类型
...
delete ptk;
```

- 基类的析构函数声明为virtual时，delete ptk 会先析构子类，再析构基类，保证内存的释放。
- 基类的析构函数不声明为virtual的话，delete ptk 只会调用基类的析构函数，无法保证子类内存的释放。

- 同样，当一个class不含虚函数，表明它不意图用做base class，务必不要将其析构函数声明为vritual。

##### Virtual函数的实现原理

所有存在虚方法的对象中都会存有一个虚函数表指针`vptr`， 用来在运行时定位虚函数。同时，每个存在虚方法的类也会对应一个虚函数列表的指针`vtbl`。 函数调用时会在`vtbl`指向的虚函数表中寻找`vptr`指向的那个函数。


## L8: 别在析构函数里处理异常

Prevent exceptions from leaving destructors.

如果有必要处理一些异常，可以写一个常规方法，如close()。但是千万别在析构函数里面用try catch 来处理异常。析构的异常并不会被捕获。

## L9: 别在构造/析构时调用虚函数

Never call virtual functions during construction or destruction.

- 父类对象会在子类之前进行构造，此时**子类部分的数据成员还未初始化**， 因此调用子类的函数是不安全的，因此C++不允许这样做。
- 父类构造期间，对虚函数的调用不会下降至子类。
-  **在子类对象的父类构造期间，对象类型为父类而非子类**。 
- 不仅虚函数会被解析至父类，运行时类型信息也为父类（`dynamic_cast`, `typeid`）。

## L10: 赋值运算符要返回自己的引用

Have assignment operators return a reference to this.

- 目的： 用来支持链式的赋值语句
- 在为类实现赋值操作符的时候应该遵循下面的协议：赋值操作符必须返回一个reference指向操作符的左侧实参


##### 链式赋值

解释一下链式赋值

```c++
int x,y,z;
x = y = z = 1;
```

上述语句相当于

```c++
x = (y = (z = 1));
```


 = 操作符是向右结合的

##### oprator= 

为了使自定义的类也支持链式赋值，需要在重载=运算时返回当前对象的引用

```c++
class Point{
  public:
    Point() {...} 						 		// default 构造函数
    Point(const Point& rhs) {...}				// copy 构造函数
	~Point() {...};								// 析构函数
    
    Point& oprator=(const Point& rhs){          // copy assignment 操作符
    	return* this;                           // 返回类型是一个Reference指向当前对象 
    }
};
```

- 这种要求适用于上面展示的等号标准赋值
- 同样适用于所有+=等其他赋值相关运算

```c++
class Point{
  public:
    ...
    Point& oprator+=(const Point& rhs){         // 适用于+=，-+，*= 等 
    	return* this;
    }
};
```



## L11: 在=里处理好自我赋值

Handle assignment to self in operator=

C++允许变量有别名（指针和引用），这使得一个数据可以有多个引用。所以可以存在自赋值的情况。

可能会有哪些错误的操作：

```c++
Widget& Widget::operator=(const Widget& rhs){
    delete pb;                   // stop using current bitmap
    pb = new Bitmap(*rhs.pb);    // start using a copy of rhs's bitmap
    return *this;                // see Item 10
}
```

- 自赋值安全：上述代码在自赋值发生时，会在delete时就已经将自己的内容删掉了。这不满足自赋值安全。
- 异常安全：试想一下若`new`出现了异常，当前对象的`pb`便会置空。 空指针在C++中可是会引发无数问题的。这不满足异常安全。

我们需要 自赋值安全， 且 异常安全的代码。解决方案：使用 copy 和 swap

```c++
Widget& Widget::operator=(Widget rhs){
    swap(rhs);                // swap *this's data with the copy's
    return *this;            
}
```


## L12: 完整地拷贝对象

Copy all parts of an object

- 有两种拷贝对象的方式：
	- copy构造函数
	- 赋值运算符
- copy构造函数是编译器默认生成的函数
- 默认的copy构造函数可以完整地拷贝对象
- 但是有时候需要重载拷贝构造函数，这时一定要确保：
	- 首先要完整复制当前对象的数据（local data）；
	- 调用所有父类中对应的拷贝函数



```c++
class Customer {  
  string name;  
  
 public:  Customer(const Customer& rhs) : name(rhs.name) {}  
  
  Customer& operator=(const Customer& rhs) {  
    name = rhs.name;  // copy rhs's data  
    return *this;     // see Item 10  
  }  
};  
  
```

错误的实现：

```c++
// 一个错误的拷贝的实现：忘记了拷贝基类  
class PriorityCustomer : public Customer {  
  int priority;  
  
 public:  PriorityCustomer(const PriorityCustomer& rhs) : priority(rhs.priority) {}  
  
  PriorityCustomer& operator=(const PriorityCustomer& rhs) {  
    priority = rhs.priority;  
  }  
};
```

正确的实现：

```c++
  
// 一个正确的拷贝的实现：  
class PriorityCustomer : public Customer {  
  int priority;  
  
 public:  PriorityCustomer(const PriorityCustomer& rhs)  
      : Customer(rhs), priority(rhs.priority) {}  
  
  PriorityCustomer& operator=(const PriorityCustomer& rhs) {  
    Customer::operator=(rhs);  
    priority = rhs.priority;  
  }  
};
```






-----

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

