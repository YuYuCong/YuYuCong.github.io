---
layout: post
title: C++并发编程系列3-数据共享与同步
subtitle: C++并发编程系列笔记，ch3笔记
categories:
  - c++
tags:
  - 多线程
  - thread
  - cpp
  - cplusplus
header-img: img/in-post/post-cpp/
header-style: text
redirect_from:
  - /2021/02/03/
---

>  C++ 并发编程系列笔记，ch3笔记

* Kramdown table of contents
{:toc .toc}
# C++ 并发笔记

Created 2021.02.03 by William Yu; Last modified: 2022.09.15-v1.1.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 William Yu. Some rights reserved.

---





<center style="font-size:72px;color:;text-align:center;">CH3</center> 





## Chapter Three: 数据共享

<p style="font-size:20px;color:#176;text-align:left;">References</p> 

- [https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264954](https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264954)

### 3.1 Concepts

- 不变量
- 条件竞争
- 互斥量
- 无锁编程
- 锁
- 死锁

  
### 3.2 共享数据

- 共享数据如果是只读的，不会产生问题
- 共享数据存在同时被读被写，或同时被读，可能出现问题，称为 __条件竞争（rare condition）__

##### 条件竞争

- 每个线程抢着执行自己的任务，大多数情况下执行顺序的先后影响不大，为良性竞争
- 良性竞争中，系统提供的不变量保持不变
- 当不变量被破坏时，发生条件竞争
- 条件竞争时间敏感，难以排查

##### 恶性条件竞争的避免

3种方案

- 对数据采取保护机制
  - 对数据进行保护，确保只有进行修改的线程才能看到不变量被破坏时的中间状态
  - 从其他访问线程的角度来看，只存在两种状态，修改前的数据，或者修改完成后的数据
  - 互斥量 就是一种数据保护机制
- 无锁编程 （lock-free programming）
  - 对数据结构和不变量的设计进行修改，修改成什么样子呢？
  - 修改完的结构必须能完成一系列不可分割的变化 ，变化一旦触发就必须进行下去
  - 也就是保证每个不变量保持稳定的状态
- 事务 （transacting）
  - STM 软件事务内存
  - 所需的数据存取都作为一种请求存储在事务日志中
  - 然后由管理员将相关操作合并，提交，执行

### 3.3 互斥量 mutex

<center style="font-size:30px;color:#CD5C5C;text-align:right;">std::mutex</center> 

互斥量 就是一种数据保护机制，实现机制：

- 某线程访问共享数据时，使用互斥量将数据锁住，访问结束之后再解锁
- 当数据被锁时，其他线程若想访问，必须等到之前的线程对数据解锁之后，才能访问
- c++通过实例化 std::mutex 创建互斥量 （详见后文）
  - 调用成员函数 lock() 上锁
  - 调用成员函数 unlock() 解锁
  - 另有 `std::lack_guard()` 方法自动上锁，其会在构造的时候提供已锁的互斥量，并在析构的时候进行解锁，从而保证了一个已锁的互斥量总是会被正确的解锁

注意事项：

- 潜在的问题与要求

  - 必须精心组织代码来保护正确的数据
  - 要避免对数据保护的太多（或太少）
  - 互斥量并不保险：死锁（详见后文）
  - 潜在问题：锁与指针或引用——当成员函数返回的是保护数据的指针或者引用，会破坏对数据保护。指针或者引用可以访问或者修改被保护的数据，而不会被互斥锁限制。所以成员函数的接口设计必须相当谨慎 （详见后文）
  - 思考一个问题：这样的处理方法，就相当于保证每次只能有一个线程访问共享数据，即便在所有线程都只访问而不修改数据的情况下。事实上，锁只需要在有线程要修改数据时上锁即可。读者-写者锁（reader-writer mutex）（详见后文） 

### 3.4 mutex.lock()    .unlock()    .try_lock()

互斥量的成员方法主要有3个：

- mutex.lock()    
- mutex.unlock()
- mutex.try_lock()

<center style="font-size:30px;color:#CD5C5C;text-align:right;">.lock()</center> 

```c++
std::vector<long> some_list;  // 共享的数据
std::mutex some_mutex;  // 互斥量
void some_thread_function(){
	some_mutex.lock();
    // 一些操作
    some_mutex.unlock();
}
```

<center style="font-size:30px;color:#CD5C5C;text-align:right;">.try_lock()</center> 

```c++
std::vector<long> some_list;  // 共享的数据
std::mutex some_mutex;  // 互斥量
void some_thread_function(){
	if (!some_mutex.try_lock()){
        return false;
    };
    // 一些操作
    some_mutex.unlock();
}
```

### 3.5 std::lock_guard<>

<center style="font-size:30px;color:#CD5C5C;text-align:right;">std::lock_guard</center> 

自动的锁

- 自动上锁，自动解锁
- 而对互斥锁的lock()和unlock()需要手动调用
- 构造时自动上锁
- 离开局部作用域，析构函数自动解锁

```c++
std::vector<long> some_list;  // 共享的数据
std::mutex some_mutex;  // 互斥量
void some_thread_function(){
	std::lock_guard<std::mutex> lock(some_mutex);    // 修改数据之前上锁
    // 一些操作
}
```

```c++
#include <mutex>   // 头文件

std::vector<long> some_list;  // 共享的数据
std::mutex some_mutex;  // 互斥量

void add_to_list(int new_value) {
  std::lock_guard<std::mutex> lock(some_mutex);    // 修改数据之前上锁
  some_list.push_back(new_value);
}

bool list_contains(int value_to_find) {
  std::lock_guard<std::mutex> lock(some_mutex);    // 访问数据之前上锁
  return std::find(some_list.begin(),some_list.end(),value_to_find) != some_list.end();
}
```

### 3.6 std::unique_lock<>

<center style="font-size:30px;color:#CD5C5C;text-align:right;">std::unique_lock</center> 

轻度灵活锁

- 可以提供两种第二参数：

  1. `std::adopt_lock`

     - 用于管理互斥量

     ```c++
     std::unique_lock<std::mutex> some_lock(some_mutex, std::adopt_lock);
     ```

  2. `std::defer_lock`

     - 表示在构造锁的时候并不上锁，使互斥量保持在解锁状态
     - `std::uniquelock`锁对象可以传给`lock()`对象作为参数

     ```c++
     std::unique_lock<std::mutex> some_lock(some_mutex, std::defer_lock);
     std::lock(some_lock);
     some_lock.lock();
     some_lock.unlock();
     some_lock.try_lock();
     ```
  
- 如果不提供第二参数，表示构造时同时也上锁，需要手动解锁

  ```c++
  std::unique_lock<std::mutex> some_lock(some_mutex);
  // do something
  some_lock.unlock();
  ```


- `std::unique_lock` 比 `std::lock_guard`体积大，所以后者如果够用，建议优先使用后者

### 3.7 锁指针或引用

- 锁与指针或引用——当成员函数返回的是保护数据的指针或者引用，会破坏对数据保护。指针或者引用可以访问或者修改被保护的数据，而不会被互斥锁限制。所以成员函数的接口设计必须相当谨慎
- 不过，检查迷失指针或引用是很容易的
  - 只要没有成员函数通过返回值或者输出参数的形式向其调用者返回指向受保护数据的指针或引用，数据就是安全的。
  - 如果你还想往祖坟上刨，就没这么简单了。在确保成员函数不会传出指针或引用的同时，检查成员函数是否通过指针或引用的方式来调用也是很重要的(尤其是这个操作不在你的控制下时)。函数可能没在互斥量保护的区域内，存储着指针或者引用，这样就很危险。
  - 更危险的是：将保护数据作为一个运行时参数。

### 3.8 发现接口内在的条件竞争

// todo(congyu)

参 https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264954#31__12     3.2.3 小节

### 3.9 死锁 deadlock

##### 产生原因

- 一个给定操作需要两个或两个以上的互斥量时，可能出现死锁
- 与条件竞争完全相反——不同的两个线程会互相等待，从而什么都没做

举例：

- 两个线程，两个互斥量。线程1访问数据A时，将互斥量A上锁，然后开始操作，后面的某些操作中需要用到数据B，会尝试获取B的锁；与此同时，线程2在访问数据B时，将互斥量B上锁，然后开始操作，某些操作中需要用到数据A，会尝试获取A的锁。这种情况下，线程1在等待互斥量B的锁被释放，而线程2在等待互斥量A的锁被释放。产生死锁。

##### 避免的措施

2种措施：

###### 按照顺序上锁

- 无死锁的代码风格  deadlock-free:
  - 建议互斥量总是以相同的顺序上锁。（上面的例子中，线程1和2都先锁互斥量A，再锁互斥量B） -- 但这种方法并不总是奏效:slightly_smiling_face:
  - 一个线程只持有一个锁，当已经持有一个锁时，不要再去获取第二把锁
  - 使用分层互斥锁

###### 同时上锁

- `std::lock()`： c++标准提供的解决方案。可以<u>一次锁住多个互斥量</u>，没有死锁风险

<center style="font-size:30px;color:#CD5C5C;text-align:right;">std::lock()</center> 

步骤：

1. C++ 标准库中提供了`std::lock()`函数，能够保证将多个互斥锁同时上锁，
2. 然后，使用`lock_guard`，加参数`std::adopt_lock`表示无需再次上锁。
	  备注：因为互斥锁已经被上锁了，那么`lock_guard`构造的时候不应该上锁，只是需要在析构的时候释放锁就行了，使用参数`std::adopt_lock`表示无需上锁：

```c++
std::lock(_mu, _mu2);
std::lock_guard<std::mutex> lock1(_mu, std::adopt_lock);
std::lock_guard<std::mutex> lock2(_mu2, std::adopt_lock);
```

完整的代码如下

```c++
#include <glog/logging.h>
#include <iostream>
#include <mutex>
#include <thread>

struct Data {
  int num = 0;
  std::string str = "0";
};

// 数据
std::mutex user_data_mutex_;
Data user_data;

std::mutex user_data2_mutex_;
Data user_data2;

void TestSolveDeadLock() {
  // 死锁的解决
  LOG(ERROR) << "=======TestSolveDeadLock=======";

  // 第一个线程
  std::thread sub_thread1 = std::thread([] {
    std::lock(user_data_mutex_, user_data2_mutex_);
    std::lock_guard<std::mutex> lock1(user_data_mutex_, std::adopt_lock);
    std::lock_guard<std::mutex> lock2(user_data2_mutex_, std::adopt_lock);
    std::this_thread::sleep_for(std::chrono::milliseconds(50));

    LOG(ERROR) << "sub_thread1 " << user_data.num << "," << user_data.str;
  });

  // 第二个线程
  std::thread sub_thread2 = std::thread([] {
    std::lock(user_data_mutex_, user_data2_mutex_);
    std::lock_guard<std::mutex> lock1(user_data_mutex_, std::adopt_lock);
    std::lock_guard<std::mutex> lock2(user_data2_mutex_, std::adopt_lock);
    std::this_thread::sleep_for(std::chrono::milliseconds(50));

    LOG(ERROR) << "sub_thread2 " << user_data.num << "," << user_data.str;
  });

  sub_thread1.join();
  sub_thread2.join();
}
```

// todo(congyu)

参 https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264954#31__12    3.2.4 和 3.2.5

### 3.10 锁的粒度

参 https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264954#31__12    3.2.8

- 良好的代码：在锁住互斥量的同时，只进行共享数据的处理。锁外数据的处理在上锁前就做好准备工作。锁内共享数据的访问结束就立即释放锁

// todo(congyu)

### 3.11 保护共享数据的初始化过程

// todo(congyu)

参 https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264954#31__12    3.3.1

### 3.12 保护很少更新的数据

// todo(congyu)

参 https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264954#31__12    3.3.2

读者-写者锁（reader-writer mutex）     

- 只有在更新发生时，即有线程写入数据时，才上锁
- 在没有写操作发生时，允许多个线程同时读取数据

### 3.13 嵌套锁

// todo(congyu)

参 https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264954#31__12    3.3.3



---

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

