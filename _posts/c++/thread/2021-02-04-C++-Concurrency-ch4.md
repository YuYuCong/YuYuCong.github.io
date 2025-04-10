---
layout: post
title: C++并发编程系列4-同步并发
subtitle: C++并发编程系列笔记，ch4笔记
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
  - /2021/02/04/
---

>  C++ 并发编程系列笔记，ch4笔记

* Kramdown table of contents
{:toc .toc}
# C++ 并发笔记

Created 2021.02.04 by William Yu; Last modified: 2022.09.15-v1.1.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 William Yu. Some rights reserved.

---



<center style="font-size:72px;color:;text-align:center;">CH4</center> 



## Chapter Four: 同步并发

**条件变量(condition variables)** 和 **期望(futures)**

<p style="font-size:20px;color:;text-align:;">Reference</p> 

- [https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264955](https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264955)
- [https://paul.pub/cpp-concurrency/](https://paul.pub/cpp-concurrency/)

### 4.0 线程同步操作

> ​		假设你在旅游，而且正在一辆在夜间运行的火车上。在夜间，如何在正确的站点下车呢？一种方法是整晚都要醒着，然后注意到了哪一站。这样，你就不会错过你要到达的站点，但是这样会让你感到很疲倦。另外，你可以看一下时间表，估计一下火车到达目的地的时间，然后在一个稍早的时间点上设置闹铃，然后你就可以安心的睡会了。这个方法听起来也很不错，也没有错过你要下车的站点，但是当火车晚点的时候，你就要被过早的叫醒了。当然，闹钟的电池也可能会没电了，并导致你睡过站。理想的方式是，无论是早或晚，只要当火车到站的时候，有人或其他东西能把你唤醒，就好了。

##### 坏的解决方案

- 在线程1自行定时检查一个共享的标签，当线程2完成某些操作修改完标签后，线程1由共享标签得知线程2的完成情况

```c++
bool flag;  //共享数据
std::mutex m_flag;

void wait_for_flag() {
  std::unique_lock<std::mutex> lk_flag(m_flag);
  while(!flag) {
    lk_flag.unlock();  // 1 解锁互斥量
    std::this_thread::sleep_for(std::chrono::milliseconds(100));  // 2 休眠100ms
    lk_flag.lock();   // 3 再锁互斥量
  }
  // do some job  
}
```

- 相当于每睡10分钟起来看一眼再睡
- 休眠时间太短浪费资源
- 休眠时间太长会错过时机，flag被修改的事件发生时你可能刚好在睡觉

##### 好的解决方案：条件变量

- 注册某种唤醒机制：**条件变量**

### 4.1 条件变量  std::condition_variable

<center style="font-size:30px;color:#CD5C5C;text-align:right;">std::condition_variable</center> 

- [https://my.oschina.net/u/1538135/blog/3163229](https://my.oschina.net/u/1538135/blog/3163229)

##### 头文件

```c++
#include <condition_variable>
```

##### std::condition_variable 简介

- 两种实现  `std::condition_variable`  `std::condition_varoable_any`
- 前者限于与`std::mutex`一起工作，后者可以与任何最低标准的互斥量一起工作
- 后者更加通用，但是意味着性能开销较大

condition_variable 类的5个方法

- condition_variable::wait()
- condition_variable::wait_for()
- condition_variable::wait_until()
- condition_variable::notify_one()
- condition_variable::notify_all()
- ondition_variable_any

##### 1. wait()

`std::condition_variable`提供了两种 `wait()` 形式。

###### 第一种 wait()

```c++
void wait (unique_lock<mutex>& lck);
```

- 当前线程调用 `wait()` 后将被阻塞，直到另外某个线程调用 `notify_*` 唤醒了当前线程。
- 在线程被阻塞时，该函数会自动调用 `lck.unlock()` 释放锁，使得其他被阻塞在锁竞争上的线程得以继续执行
- 一旦当前线程获得通知(`notified`，通常是另外某个线程调用 `notify_*` 唤醒了当前线程)，`wait()`函数也会自动调用 `lck.lock()`，使得`lck`的状态和 `wait` 函数被调用时相同

###### 第二种  带条件的wait

```c++
template <class Predicate>
void wait(unique_lock<mutex>& lck, Predicate pred);
```

- 在第二种情况下（即设置了 `Predicate`）

- 只有当 `pred` 条件为`false` 时调用 `wait()` 才会阻塞当前线程

- 在已阻塞的情况下，只有收到其他线程的通知并且当 `pred` 为 `true` 时才会被解除阻塞

- 因此第二种情况相当于以下代码：

  ```c++
  while (!pred())
  	wait(lck);
  ```

##### 2. wait_for()

// todo(congyu)

##### 3. wait_untill()

##### 4. notify_one()

##### 5. notify_all()

##### 示例

```c++
std::mutex mut;
std::queue<data_chunk> data_queue;  // 1
std::condition_variable data_cond;

void data_preparation_thread() {
  while(more_data_to_prepare()) {
    data_chunk const data=prepare_data();
    std::lock_guard<std::mutex> lk(mut); // 2
    data_queue.push(data);  
    data_cond.notify_one();  // 3
  }
}

void data_processing_thread() {
  while(true) {
    std::unique_lock<std::mutex> lk(mut);  // 4
    data_cond.wait(lk,[]{return !data_queue.empty();});  // 5
    data_chunk data=data_queue.front();
    data_queue.pop();
    lk.unlock();  // 6
    process(data);
    if(is_last_chunk(data))
      break;
  }
}
```

- data_queue 是两个线程的共享数据

- data_cond 是条件变量

- 线程1 ：2 标记的位置 对共享数据上锁，然后进行操作

  操作完之后，3 标记的位置对 条件变量data_cond 发出通知

  如果此时有其他线程在等待wait，接到通知继续执行

- 线程2 ： 4 标记的位置对共享数据上锁

  <center style="font-size:30px;color:#CD5C5C;text-align:right;">.wait()</center> 

  <center style="font-size:30px;color:#CD5C5C;text-align:right;">.notify_one()</center> 

  5 标记的位置 调用`wait()` 检查条件，即后面的lambda表达式

  条件满足，返回，线程2继续向下执行，并且此时线程2继续持有该锁

  条件不满足，`wait()`会解锁互斥量，并阻塞等待休眠

  直到data_cond收到通知时苏醒

  苏醒后重新获取锁，重新进行检查

- 标记4的位置使用 unique_lock()

  为什么？

  等待中的线程必须在等待期间解锁互斥量，并在收到通知之后对互斥量再次上锁，而`std::lock_guard`没有这么灵活。如果互斥量在线程休眠期间保持锁住状态，准备数据的线程将无法锁住互斥量，也无法添加数据到队列中。

### 4.2 期望  future

- [https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264955#42__300](https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264955#42__300)
- [https://paul.pub/cpp-concurrency/#id-future](https://paul.pub/cpp-concurrency/#id-future)

##### 4.2.0 future

<p style="font-size:30px;color:#CD5C5C;text-align:right;">std::future</p> 

- 期望
  - 唯一期望  std::future<>
    - 一个实例只能与一个指定事件相关联
  - 共享期望  std::shared_future<>
    - 一个实例可以关联多个事件，所有的实例同时就绪

- 使用期望实现带返回值的子线程任务

| API           | C++标准 | 说明                              |
| :------------ | :---- | :------------------------------ |
| async         | C++11 | 异步运行一个函数，并返回保有其结果的`std::future` |
| future        | C++11 | 等待被异步设置的值                       |
| packaged_task | C++11 | 打包一个函数，存储其返回值以进行异步获取            |
| promise       | C++11 | 存储一个值以进行异步获取                    |
| shared_future | C++11 | 等待被异步设置的值（可能为其他 future 所引用）     |

- 头文件

  ```c++
  #include <future>
  ```

  

##### 4.2.1 async()

<p style="font-size:30px;color:#CD5C5C;text-align:right;">std::async()</p>

- `std::thread`不提供直接接收返回值的机制
- `std::async` 提供返回值机制

- 使用async创建子线程
- async会返回`std::future`对象
- 该对象持有最终计算的结果，可使用该对象的 .get()方法 获取计算结果
- 是否阻塞？何时阻塞？
- 默认情况下，`async`启动一个新线程（异步执行任务），还是不启动新线程（同步执行），是由具体的编译器决定的，g++默认同步
- 可以显式申明：
  - 使用`std::launch`
  - launch 的两个变量
    - async: 运行新线程
    - defered: 同步执行，惰性求值，即：主线程中第一次get()请求结果时或者在wait()时才执行任务

```c++
/*
 * 多线程， future
 * 
 * 获取子线程的返回值
 */

#include <future>
#include <iostream>

int thread_job(int a, int b) {
  while (a) {
    a--;
    std::cout << "sub thread job running\n";
  }
  return a + b;
}

int main_job(int a) {
  while (a) {
    a--;
    std::cout << "main thread job running\n";
  }
}

int main() {
  std::future<int> result =
      std::async(std::launch::async, thread_job, 10, 20);  // 1
  // std::future<int> result = std::async(thread_job, 10, 20); // 2
  // std::future<int> result = std::async(std::launch::deferred, thread_job, 10,
  // 20); // 3
  main_job(20);
  int answer = result.get();  // 4
  main_job(10);
  printf("the answer is %d\n", answer);
}

/*
1: 创建异步的期望
2: 创建默认期望
3: 创建同步的期望，和2等效
4: 使用期望的gat()方法获取返回值
*/ 
```

以对象的方法来指定异步任务：

```c++
class Worker {
 public:
  Worker() {}
  double work() { // ②
    ...
    return mResult;
  }
  
 private:
  ...
};

Worker w; // 创建对象
auto f3 = async(&Worker::work, &w); // 传入类的方法，以及具体对象
```

##### 4.2.2 packaged_task   线程池 

// todo(congyu)

##### 4.2.3 promise 

// todo(congyu)

- [https://paul.pub/cpp-concurrency/#id-promise%E4%B8%8Efuture](https://paul.pub/cpp-concurrency/#id-promise%E4%B8%8Efuture)

### 4.3 时间限定  std::chrono

<p style="font-size:30px;color:#CD5C5C;text-align:right;">std::chrono::</p>

wait()方法等各种阻塞调用，可以提供线程等待功能，等待某一事件的发生。这些还可设置等待时限。

- 延时超时
  - _for()后缀
  - 指定一段时间，如30s
- 绝对超时
  - _until()后缀
  - 指定一个时间点，如2048年10月24日

<p style="text-align:center;">表4.1 可接受超时的函数</p>

<table border="1"><tbody><tr><td>类型/命名空间</td><td>函数</td><td>返回值</td></tr><tr><td rowspan="2"> std::this_thread[namespace] </td><td> sleep_for(duration) </td><td rowspan="2">N/A</td></tr><tr><td>sleep_until(time_point)</td></tr><tr><td rowspan="2">std::condition_variable 或 std::condition_variable_any</td><td>wait_for(lock, duration)</td><td rowspan="2">std::cv_status::time_out 或 std::cv_status::no_timeout</td></tr><tr><td>wait_until(lock, time_point)</td></tr><tr><td rowspan="2"> </td><td> wait_for(lock, duration, predicate)</td><td rowspan="2">bool —— 当唤醒时，返回谓词的结果</td></tr><tr><td>wait_until(lock, duration, predicate)</td></tr><tr><td rowspan="2">std::timed_mutex 或 std::recursive_timed_mutex</td><td>try_lock_for(duration)</td><td rowspan="2"> bool —— 获取锁时返回true，否则返回fasle</td></tr><tr><td>try_lock_until(time_point)</td></tr><tr><td rowspan="2">std::unique_lock&lt;TimedLockable&gt;</td><td>unique_lock(lockable, duration)</td><td>N/A —— 对新构建的对象调用owns_lock();</td></tr><tr><td>unique_lock(lockable, time_point)</td><td>当获取锁时返回true，否则返回false</td></tr><tr><td rowspan="2"></td><td>try_lock_for(duration)</td><td rowspan="2">bool —— 当获取锁时返回true，否则返回false</td></tr><tr><td>try_lock_until(time_point)</td></tr><tr><td rowspan="3">std::future&lt;ValueType&gt;或std::shared_future&lt;ValueType&gt;</td><td>wait_for(duration)</td><td>当等待超时，返回std::future_status::timeout</td></tr><tr><td rowspan="2">wait_until(time_point)</td><td>当“期望”准备就绪时，返回std::future_status::ready</td></tr><tr><td>当“期望”持有一个为启动的延迟函数，返回std::future_status::deferred</td></tr></tbody></table>

  ##### 4.3.1 时钟 

// todo(congyu)

- 获取现在时间，系统时钟

```c++
std::chrono::system_clock::now();
```

##### 4.3.2 时延

// todo(congyu)

##### 4.3.3 时间点

// todo(congyu) 

 







---

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

