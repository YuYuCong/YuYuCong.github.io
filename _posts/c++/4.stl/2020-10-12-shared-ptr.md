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


什么时候用unique_ptr合适呢？ todo(congyu)

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

// todo(congyu)



## Contact

Feel free to [contact](mailto:windmillyucong@163.com) me anytime for anything.

