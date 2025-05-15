---
layout: post
title: Smart Pointer
description: Smart Pointer
categories:
  - c++
tags:
  - shared_ptr
  - cpp
  - cplusplus
redirect_from:
  - /2020/10/12/
---

> 

* Kramdown table of contents
{:toc .toc}


----

Created 2020.10.12 by Cong Yu; Last modified: 2020.10.12-v1.0.2

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

----


# Smart Pointer


<p style="font-size:16px;color:#176;text-align:left;">References</p> 

- https://zhuanlan.zhihu.com/p/29628938

## 0. Concepts

- 三种智能指针：`std::shared_ptr`, `std::unique_ptr`, `std::weak_ptr`
- 使用时需添加头文件`memory`
```c++
#inlcude <memory>
```

## 1. std::unique_ptr

用于<mark style="background: #FF5582A6;">不能被多个实例共享的内存管理</mark>。仅有一个实例拥有内存所有权。

构造方法比较简单：使用`std::make_unique()`函数创建unique_ptr 实例即可。

```cpp
#include <iostream>
#include <memory>
#include <string>

class Fraction {
public:
  Fraction(int a = 0, int b = 1) : a_(a), b_(b) {}
  friend std::ostream &operator<<(std::ostream &out, const Fraction &f1) {
    out << f1.a_ << "/" << f1.b_;
    return out;
  }

private:
  int a_ = 0;
  int b_ = 1;
};

int main() {
  Fraction a(2, 4);
  auto f = std::make_unique<Fraction>(a);
  std::cout << *f << std::endl;

  auto f2 = std::make_unique<Fraction>(3, 5);
  std::cout << *f2 << std::endl;
}
```


什么时候用unique_ptr合适呢？ 

第一种：经常用在 unit test 里面，用于创建全局统一的实体用于测试

```c++
  
class ProblemTest : public testing::Test {  
 protected:  
  ProblemTest() : problem_(CreateProblemForTest()) {}  
  
  static inline std::unique_ptr<Problem> CreateProblemForTest() {  
    return std::make_unique<Problem>();  
  }  
  
  std::unique_ptr<Problem> problem_;  
};
```

第二种：用于创建类唯一成员

## 2. std::shared_ptr

创建： `std::make_shared<>()`

<mark style="background: #FF5582A6;">多个实例指向同一块内存</mark>，使用引用计数记录有多少个实例指向同一块内存，当最后一个引用对象离开其作用域的时候，才释放内存。

```c++
#include <iostream>
#include <memory>
#include <string>

class Fraction {
public:
  Fraction(int a = 0, int b = 1) : a_(a), b_(b) {}
  friend std::ostream &operator<<(std::ostream &out, const Fraction &f1) {
    out << f1.a_ << "/" << f1.b_;
    return out;
  }

private:
  int a_ = 0;
  int b_ = 1;
};

int main() {
  Fraction a(2, 4);
  auto ptr1 = std::make_shared<Fraction>(a);
  {
    auto ptr2 = ptr1;
    std::shared_ptr<Fraction> ptr3 = ptr1;
    std::cout << ptr1.use_count() << std::endl;
    std::cout << ptr2.use_count() << std::endl;
    std::cout << ptr3.use_count() << std::endl;
  }
  std::cout << ptr1.use_count() << std::endl;
  return 0;
}

```

```c++
#include <iostream>
#include <memory>
#include <string>

class Fraction {
public:
  Fraction(int a = 0, int b = 1) : a_(a), b_(b) {}
  void Inv() {
    a_ = a_ + b_;
    b_ = a_ - b_;
    a_ = a_ - b_;
  }
  friend std::ostream &operator<<(std::ostream &out, const Fraction &f1) {
    out << f1.a_ << "/" << f1.b_;
    return out;
  }

private:
  int a_ = 0;
  int b_ = 1;
};

int main() {
  Fraction a(2, 4);
  auto ptr1 = std::make_shared<Fraction>(a);
  {
    auto ptr2 = ptr1;
    std::shared_ptr<Fraction> ptr3 = ptr1;
    std::cout << ptr1.use_count() << std::endl;
    std::cout << ptr2.use_count() << std::endl;
    std::cout << ptr3.use_count() << std::endl;

    std::cout << *ptr1 << std::endl;
    std::cout << *ptr2 << std::endl;
    std::cout << *ptr3 << std::endl;
    ptr1->Inv(); // ptr1 对内存的改变
    std::cout << *ptr1 << std::endl;  
    std::cout << *ptr2 << std::endl; // ptr2,3指向ptr1所指向的内存，ptr1对内存的改变同样可以被ptr2，3读取到
    std::cout << *ptr3 << std::endl;

    ptr1 = nullptr;  //但是ptr1的清空，是只释放自己，内存还在
    // std::cout << *ptr1 << std::endl; ptr1已经清空，再运行cout，内存溢出
    std::cout << *ptr2 << std::endl;  //但是ptr2、3还正常存在
    std::cout << *ptr3 << std::endl;
  }
  std::cout << ptr1.use_count() << std::endl;
  return 0;
}

```

```c++
#include <iostream>
#include <memory>
#include <string>

class Fraction {
public:
  Fraction(int a = 0, int b = 1) : a_(a), b_(b) {}
  void Inv() {
    a_ = a_ + b_;
    b_ = a_ - b_;
    a_ = a_ - b_;
  }
  friend std::ostream &operator<<(std::ostream &out, const Fraction &f1) {
    out << f1.a_ << "/" << f1.b_;
    return out;
  }

private:
  int a_ = 0;
  int b_ = 1;
};

int main() {
  Fraction f(2, 4);
  auto ptr1 = std::make_shared<Fraction>(f);
  int a = 10;
  std::cout << a << std::endl;
  {
    auto ptr2 = ptr1;
    std::shared_ptr<Fraction> ptr3 = ptr1;
    std::cout << ptr1.use_count() << std::endl;
    std::cout << ptr2.use_count() << std::endl;
    std::cout << ptr3.use_count() << std::endl;

    std::cout << *ptr1 << std::endl;
    std::cout << *ptr2 << std::endl;
    std::cout << *ptr3 << std::endl;
    a = 11;
    std::cout << a << std::endl;
    ptr1 = std::make_shared<Fraction>(6, 8);  // ptr1 的重新构造不会影响ptr2和ptr3,已经不指向同一块内存了
    std::cout << *ptr1 << std::endl;
    std::cout << *ptr2 << std::endl; // ptr2,3指向ptr1所指向的内存，ptr1对内存的改变同样可以被ptr2，3读取到
    std::cout << *ptr3 << std::endl;
  }
  std::cout << *ptr1 << std::endl;
  std::cout << ptr1.use_count() << std::endl;
  std::cout << a << std::endl;//11
  return 0;
}

```



## 3. std::weak_ptr

- <mark style="background: #FF5582A6;">用于解决shared_ptr的循环引用问题</mark>
- 常常出现在双向列表，树等数据结构中

举例如下：比如一个tree结构，每个节点会存储多个子节点的指针，并且会存储父节点的指针。此时它的node设计应该如下：

```c++
struct UserNode {  
  size_t depth_;  
  UserDataPtr user_data_;  
  std::weak_ptr<UserNode> parent_;  
  std::vector<std::shared_ptr<UserNode>> children_;  
  
  explicit UserNode(UserDataPtr task,  
                         const std::shared_ptr<UserNode> &parent = nullptr)  
      : depth_(parent ? parent->depth_ + 1 : 0),  
        user_data_(std::move(user_data)),  
        parent_(parent) {  
    CHECK_NOTNULL(user_data_);  
  }  
};
```

##### .lock() 方法

在想使用parent_时，不可以直接使用parent_变量。而是应该使用.lock()方法获取：

```c++
// 获取current_node的父节点
auto parent = current_node->parent_.lock();
auto data = parent->user_data_;
```

补充解释一下：循环引用问题。

#### 循环引用

循环引用是指两个或多个对象通过 shared_ptr 相互引用，导致它们的引用计数永远不会降为 0，从而造成内存泄漏。

##### 示例代码

```cpp
#include <iostream>
#include <memory>

class B;  // 前向声明

class A {
public:
    std::shared_ptr<B> b_ptr;
    ~A() { std::cout << "A destroyed" << std::endl; }
};

class B {
public:
    std::shared_ptr<A> a_ptr;
    ~B() { std::cout << "B destroyed" << std::endl; }
};

int main() {
    {
        auto a = std::make_shared<A>();
        auto b = std::make_shared<B>();
        
        // 创建循环引用
        a->b_ptr = b;
        b->a_ptr = a;
        
        // 离开作用域时，a 和 b 的引用计数都是 2
        // 由于循环引用，它们的析构函数不会被调用
    }
    // 这里不会输出 "A destroyed" 和 "B destroyed"
    return 0;
}
```

##### 解决方案

使用 `std::weak_ptr` 来打破循环引用。将其中一个 shared_ptr 改为 weak_ptr：

```cpp
#include <iostream>
#include <memory>

class B;  // 前向声明

class A {
public:
    std::shared_ptr<B> b_ptr;
    ~A() { std::cout << "A destroyed" << std::endl; }
};

class B {
public:
    std::weak_ptr<A> a_ptr;  // 使用 weak_ptr 替代 shared_ptr
    ~B() { std::cout << "B destroyed" << std::endl; }
};

int main() {
    {
        auto a = std::make_shared<A>();
        auto b = std::make_shared<B>();
        
        a->b_ptr = b;
        b->a_ptr = a;  // weak_ptr 不会增加引用计数
        
        // 离开作用域时：
        // 1. a 的引用计数降为 0，A 被销毁
        // 2. A 销毁时，b_ptr 被销毁，B 的引用计数降为 0
        // 3. B 被销毁
    }
    // 这里会正确输出 "A destroyed" 和 "B destroyed"
    return 0;
}
```

##### 使用 weak_ptr 的注意事项

1. **检查有效性**：
   - 使用 weak_ptr 前应该检查它是否有效
   - 使用 `expired()` 方法检查对象是否已被销毁
   - 使用 `lock()` 方法获取 shared_ptr

```cpp
if (auto shared_ptr = weak_ptr.lock()) {
    // 对象仍然存在，可以使用 shared_ptr
} else {
    // 对象已被销毁
}
```

2. **常见使用场景**：
   - 观察者模式中的观察者列表
   - 缓存系统
   - 树形结构中的父节点引用
   - 任何需要打破循环引用的场景

3. **性能考虑**：
   - weak_ptr 的创建和销毁比 shared_ptr 更轻量
   - lock() 操作是线程安全的，但可能有性能开销
   - 在性能关键路径上应谨慎使用

## Contact

Feel free to [contact](mailto:windmillyucong@163.com) me anytime for anything.

