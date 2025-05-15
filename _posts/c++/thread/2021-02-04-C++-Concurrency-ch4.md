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

提供2个实现 

- `std::condition_variable`  
- `std::condition_varoable_any`
- 前者限于与`std::mutex`一起工作，后者可以与任何最低标准的互斥量一起工作
- 后者更加通用，但是意味着性能开销较大

提供5个方法

- condition_variable::wait()
- condition_variable::wait_for()
- condition_variable::wait_until()
- condition_variable::notify_one()
- condition_variable::notify_all()

##### 1. wait()

`std::condition_variable`提供了两种 `wait()` 形式。

###### 第一种 wait()

```c++
void wait(unique_lock<mutex>& lck);
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

```c++
template <class Rep, class Period>
cv_status wait_for(unique_lock<mutex>& lck, const chrono::duration<Rep,Period>& rel_time);

template <class Rep, class Period, class Predicate>
bool wait_for(unique_lock<mutex>& lck, const chrono::duration<Rep,Period>& rel_time, Predicate pred);
```

- 与`wait()`类似，但增加了超时机制
- 第一个版本：等待直到被唤醒或超时
  - 如果超时，返回`std::cv_status::timeout`
  - 如果被唤醒，返回`std::cv_status::no_timeout`
- 第二个版本：带谓词的版本
  - 如果谓词为true，立即返回true
  - 如果超时，返回false
  - 如果被唤醒且谓词为true，返回true
  - 如果被唤醒但谓词为false，继续等待

示例：
```c++
std::condition_variable cv;
std::mutex cv_mutex;
bool ready = false;

// 等待线程
std::unique_lock<std::mutex> lk(cv_mutex);
if(cv.wait_for(lk, std::chrono::seconds(5), []{return ready;})) {
    // 条件满足或超时前被唤醒
    std::cout << "Condition met or awakened before timeout\n";
} else {
    // 超时
    std::cout << "Timeout occurred\n";
}
```

##### 3. wait_until()

```c++
template <class Clock, class Duration>
cv_status wait_until(unique_lock<mutex>& lck, const chrono::time_point<Clock,Duration>& abs_time);

template <class Clock, class Duration, class Predicate>
bool wait_until(unique_lock<mutex>& lck, const chrono::time_point<Clock,Duration>& abs_time, Predicate pred);
```

- 与`wait_for()`类似，但使用绝对时间点而不是相对时间
- 第一个版本：等待直到被唤醒或到达指定时间点
  - 如果超时，返回`std::cv_status::timeout`
  - 如果被唤醒，返回`std::cv_status::no_timeout`
- 第二个版本：带谓词的版本
  - 如果谓词为true，立即返回true
  - 如果到达时间点，返回false
  - 如果被唤醒且谓词为true，返回true
  - 如果被唤醒但谓词为false，继续等待

示例：
```c++
std::condition_variable cv;
std::mutex cv_mutex;
bool ready = false;

// 等待线程
std::unique_lock<std::mutex> lk(cv_mutex);
auto timeout = std::chrono::system_clock::now() + std::chrono::seconds(5);
if(cv.wait_until(lk, timeout, []{return ready;})) {
    // 条件满足或超时前被唤醒
    std::cout << "Condition met or awakened before timeout\n";
} else {
    // 超时
    std::cout << "Timeout occurred\n";
}
```

##### 4. notify_one()

```c++
void notify_one() noexcept;
```

- 唤醒一个等待中的线程
- 如果有多个线程在等待，具体唤醒哪一个是不确定的
- 常用于生产者-消费者模式中，当生产者产生一个数据时，只需要唤醒一个消费者

示例：
```c++
std::condition_variable cv;
std::mutex cv_mutex;
bool ready = false;

// 生产者线程
{
    std::lock_guard<std::mutex> lk(cv_mutex);
    ready = true;
    cv.notify_one();  // 唤醒一个等待的消费者
}
```

##### 5. notify_all()

```c++
void notify_all() noexcept;
```

- 唤醒所有等待中的线程
- 所有等待的线程都会被唤醒，然后竞争互斥锁
- 适用于需要广播的场景，比如系统状态改变时通知所有相关线程

示例：
```c++
std::condition_variable cv;
std::mutex cv_mutex;
bool ready = false;

// 生产者线程
{
    std::lock_guard<std::mutex> lk(cv_mutex);
    ready = true;
    cv.notify_all();  // 唤醒所有等待的消费者
}
```

完整示例：生产者-消费者模式
```c++
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>

std::mutex mtx;
std::condition_variable cv;
std::queue<int> data_queue;
bool done = false;

void producer() {
    for(int i = 0; i < 5; ++i) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        {
            std::lock_guard<std::mutex> lk(mtx);
            data_queue.push(i);
            std::cout << "Produced: " << i << std::endl;
        }
        cv.notify_one();  // 通知一个消费者
    }
    {
        std::lock_guard<std::mutex> lk(mtx);
        done = true;
    }
    cv.notify_all();  // 通知所有消费者结束
}

void consumer(int id) {
    while(true) {
        std::unique_lock<std::mutex> lk(mtx);
        cv.wait(lk, []{ return !data_queue.empty() || done; });
        
        if(done && data_queue.empty()) {
            break;
        }
        
        int value = data_queue.front();
        data_queue.pop();
        std::cout << "Consumer " << id << " consumed: " << value << std::endl;
    }
}

int main() {
    std::thread prod(producer);
    std::thread cons1(consumer, 1);
    std::thread cons2(consumer, 2);
    
    prod.join();
    cons1.join();
    cons2.join();
    return 0;
}
```

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

| API           | C++标准 | 说明                                              |
| :------------ | :------ | :------------------------------------------------ |
| async         | C++11   | 异步运行一个函数，并返回保有其结果的`std::future` |
| future        | C++11   | 等待被异步设置的值                                |
| packaged_task | C++11   | 打包一个函数，存储其返回值以进行异步获取          |
| promise       | C++11   | 存储一个值以进行异步获取                          |
| shared_future | C++11   | 等待被异步设置的值（可能为其他 future 所引用）    |

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

##### 4.2.2 shared_future

<p style="font-size:30px;color:#CD5C5C;text-align:right;">std::shared_future</p>

- `std::shared_future` 是 `std::future` 的可共享版本
- 与 `std::future` 不同，`shared_future` 可以被多个线程共享和访问
- 头文件：`#include <future>`

###### 创建方式

1. 从 `std::future` 移动构造
```c++
std::future<int> f = std::async([]{ return 42; });
std::shared_future<int> sf = f.share();  // 移动构造，f变为无效
```

2. 从 `std::promise` 获取
```c++
std::promise<int> p;
std::shared_future<int> sf = p.get_future().share();
```

###### 主要方法

1. `get()`
   - 获取结果值
   - 可以多次调用
   - 如果结果未就绪，会阻塞等待

2. `wait()`
   - 等待结果就绪
   - 可以多次调用
   - 不返回结果，只等待

3. `wait_for()`
   - 等待指定时间
   - 返回 `std::future_status`
   - 可以多次调用

4. `wait_until()`
   - 等待到指定时间点
   - 返回 `std::future_status`
   - 可以多次调用

###### 示例1：基本使用

```c++
#include <iostream>
#include <thread>
#include <future>
#include <vector>

void print_result(std::shared_future<int> sf) {
    std::cout << "Thread " << std::this_thread::get_id() 
              << " got result: " << sf.get() << std::endl;
}

int main() {
    std::promise<int> p;
    std::shared_future<int> sf = p.get_future().share();
    
    std::vector<std::thread> threads;
    // 创建多个线程共享同一个future
    for(int i = 0; i < 3; ++i) {
        threads.emplace_back(print_result, sf);
    }
    
    // 设置值
    p.set_value(42);
    
    // 等待所有线程完成
    for(auto& t : threads) {
        t.join();
    }
    
    return 0;
}
```

###### 示例2：异常处理

```c++
#include <iostream>
#include <thread>
#include <future>
#include <vector>

void handle_result(std::shared_future<int> sf) {
    try {
        int result = sf.get();
        std::cout << "Result: " << result << std::endl;
    } catch(const std::exception& e) {
        std::cout << "Exception: " << e.what() << std::endl;
    }
}

int main() {
    std::promise<int> p;
    std::shared_future<int> sf = p.get_future().share();
    
    std::vector<std::thread> threads;
    for(int i = 0; i < 3; ++i) {
        threads.emplace_back(handle_result, sf);
    }
    
    // 设置异常
    p.set_exception(std::make_exception_ptr(std::runtime_error("Task failed")));
    
    for(auto& t : threads) {
        t.join();
    }
    
    return 0;
}
```

###### 示例3：超时处理

```c++
#include <iostream>
#include <thread>
#include <future>
#include <vector>
#include <chrono>

void check_result(std::shared_future<int> sf) {
    auto status = sf.wait_for(std::chrono::milliseconds(100));
    if(status == std::future_status::timeout) {
        std::cout << "Timeout waiting for result" << std::endl;
    } else {
        std::cout << "Got result: " << sf.get() << std::endl;
    }
}

int main() {
    std::promise<int> p;
    std::shared_future<int> sf = p.get_future().share();
    
    std::vector<std::thread> threads;
    for(int i = 0; i < 3; ++i) {
        threads.emplace_back(check_result, sf);
    }
    
    // 延迟设置值
    std::this_thread::sleep_for(std::chrono::milliseconds(200));
    p.set_value(42);
    
    for(auto& t : threads) {
        t.join();
    }
    
    return 0;
}
```

###### 与 std::future 的区别

1. 可共享性
   - `future` 只能被移动，不能被复制
   - `shared_future` 可以被复制，多个线程可以共享同一个结果

2. 结果获取
   - `future::get()` 只能调用一次
   - `shared_future::get()` 可以多次调用

3. 使用场景
   - `future` 适用于单线程等待结果
   - `shared_future` 适用于多线程共享结果

###### 注意事项

1. `shared_future` 对象可以被复制，但复制的是同一个结果的引用
2. 所有线程都会等待结果就绪
3. 结果就绪后，所有线程都可以获取结果
4. 如果设置的是异常，所有线程都会收到相同的异常
5. 使用 `wait_for()` 或 `wait_until()` 时，每个线程独立判断超时

##### 4.2.3 promise 

<p style="font-size:30px;color:#CD5C5C;text-align:right;">std::promise</p>

- `std::promise` 是一个模板类，用于在线程间传递数据
- 与 `std::future` 配对使用，一个线程通过 `promise` 设置值，另一个线程通过对应的 `future` 获取值
- 头文件：`#include <future>`

###### 基本用法

```c++
std::promise<T> p;  // 创建一个promise对象
std::future<T> f = p.get_future();  // 获取与promise关联的future
```

###### 主要方法

1. `get_future()`
   - 返回与promise关联的future对象
   - 每个promise只能调用一次
   - 如果多次调用会抛出`std::future_error`异常

2. `set_value()`
   - 设置值，并让future就绪
   - 只能调用一次
   - 如果多次调用会抛出`std::future_error`异常

3. `set_exception()`
   - 设置异常，并让future就绪
   - 只能调用一次

4. `set_value_at_thread_exit()`
   - 在线程退出时设置值
   - 确保值在线程完全退出后才可用

5. `set_exception_at_thread_exit()`
   - 在线程退出时设置异常
   - 确保异常在线程完全退出后才可用

###### 示例1：基本使用

```c++
#include <iostream>
#include <thread>
#include <future>

void task(std::promise<int> p) {
    // 模拟一些工作
    std::this_thread::sleep_for(std::chrono::seconds(1));
    // 设置值
    p.set_value(42);
}

int main() {
    std::promise<int> p;
    std::future<int> f = p.get_future();
    
    std::thread t(task, std::move(p));
    
    // 等待并获取结果
    std::cout << "Result: " << f.get() << std::endl;
    
    t.join();
    return 0;
}
```

###### 示例2：异常传递

```c++
#include <iostream>
#include <thread>
#include <future>

void task(std::promise<int> p) {
    try {
        // 模拟一些可能抛出异常的工作
        throw std::runtime_error("Task failed");
    } catch(...) {
        // 捕获异常并传递给future
        p.set_exception(std::current_exception());
    }
}

int main() {
    std::promise<int> p;
    std::future<int> f = p.get_future();
    
    std::thread t(task, std::move(p));
    
    try {
        // 等待并获取结果
        std::cout << "Result: " << f.get() << std::endl;
    } catch(const std::exception& e) {
        std::cout << "Exception: " << e.what() << std::endl;
    }
    
    t.join();
    return 0;
}
```

###### 示例3：多线程协作

```c++
#include <iostream>
#include <thread>
#include <future>
#include <vector>

void worker(std::promise<int> p, int value) {
    // 模拟一些工作
    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    p.set_value(value * value);
}

int main() {
    std::vector<std::thread> threads;
    std::vector<std::future<int>> futures;
    
    // 创建多个工作线程
    for(int i = 0; i < 5; ++i) {
        std::promise<int> p;
        futures.push_back(p.get_future());
        threads.emplace_back(worker, std::move(p), i);
    }
    
    // 收集所有结果
    for(auto& f : futures) {
        std::cout << "Result: " << f.get() << std::endl;
    }
    
    // 等待所有线程完成
    for(auto& t : threads) {
        t.join();
    }
    
    return 0;
}
```

###### 注意事项

1. `promise`对象不能被复制，只能被移动
2. 每个`promise`只能设置一次值或异常
3. 如果`promise`被销毁时还没有设置值或异常，会设置一个`broken_promise`异常
4. `get_future()`只能调用一次，多次调用会抛出异常
5. 使用`set_value_at_thread_exit()`或`set_exception_at_thread_exit()`时，要确保线程正常退出

###### 与async的区别

- `async`更适合简单的异步任务，使用更简单
- `promise`提供更多的控制，可以：
  - 在任意时间点设置值
  - 显式控制异常传递
  - 在线程退出时设置值
  - 在多个线程间共享future

##### 4.2.4 packaged_task

基本概念：
- packaged_task 是一个可调用对象的包装器
- 它存储了一个任务（函数、lambda表达式等）
- 它提供了一个 future 对象来获取任务的执行结果

主要特点：
- 只能移动（move），不能复制
- 可以异步执行
- 可以获取执行结果
- 可以处理异常

常用方法：

```c++
std::packaged_task<T> task;  // 创建任务
task.get_future();           // 获取关联的 future
task(参数...);               // 执行任务
task.reset();                // 重置任务
task.valid();                // 检查任务是否有效
```

与 std::async 的区别：
- packaged_task 提供了更多的控制权
- 可以手动控制任务的执行时机
- 可以自定义任务的执行方式
- 更适合在线程池等自定义执行环境中使用

使用建议：
- 当需要手动控制任务的执行时机时使用
- 在线程池实现中作为任务的基本单位
- 需要处理异常传播时使用
- 需要获取异步操作的结果时使用

注意事项：
- 任务只能执行一次
- 执行后需要调用 get_future() 获取结果
- 移动后原对象变为无效
- 需要正确处理异常

packaged_task 是 C++ 并发编程中非常重要的一个组件，它提供了任务执行和结果获取的完整解决方案。在线程池、异步编程等场景中都有广泛的应用。

```c++
class ThreadPool {
   public:
       template<typename F, typename... Args>
       auto submit(F&& f, Args&&... args) 
           -> std::future<typename std::result_of<F(Args...)>::type> {
           
           using return_type = typename std::result_of<F(Args...)>::type;
           
           // 创建 packaged_task
           auto task = std::packaged_task<return_type()>(
               std::bind(std::forward<F>(f), std::forward<Args>(args)...)
           );
           
           // 获取 future
           std::future<return_type> res = task.get_future();
           
           {
               std::unique_lock<std::mutex> lock(queue_mutex);
               // 将任务加入队列
               tasks.push(std::move(task));
           }
           
           // 通知一个等待的线程
           condition.notify_one();
           
           return res;
       }
   };
```

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

| 类型/命名空间                                          | 函数                                  | 返回值                                                             |
| ------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------ |
| std::this_thread[namespace]                            | sleep_for(duration)                   | N/A                                                                |
|                                                        | sleep_until(time_point)               |                                                                    |
| std::condition_variable 或 std::condition_variable_any | wait_for(lock, duration)              | std::cv_status::time_out 或 std::cv_status::no_timeout             |
|                                                        | wait_until(lock, time_point)          |                                                                    |
|                                                        | wait_for(lock, duration, predicate)   | bool —— 当唤醒时，返回谓词的结果                                   |
|                                                        | wait_until(lock, duration, predicate) |                                                                    |
| std::timed_mutex 或 std::recursive_timed_mutex         | try_lock_for(duration)                | bool —— 获取锁时返回true，否则返回false                            |
|                                                        | try_lock_until(time_point)            |                                                                    |
| std::unique_lock<TimedLockable>                        | unique_lock(lockable, duration)       | N/A —— 对新构建的对象调用owns_lock()                               |
|                                                        | unique_lock(lockable, time_point)     | 当获取锁时返回true，否则返回false                                  |
|                                                        | try_lock_for(duration)                | bool —— 当获取锁时返回true，否则返回false                          |
|                                                        | try_lock_until(time_point)            |                                                                    |
| std::future<ValueType>或std::shared_future<ValueType>  | wait_for(duration)                    | 当等待超时，返回std::future_status::timeout                        |
|                                                        | wait_until(time_point)                | 当"期望"准备就绪时，返回std::future_status::ready                  |
|                                                        |                                       | 当"期望"持有一个为启动的延迟函数，返回std::future_status::deferred |

  ##### 4.3.1 时钟 

- 获取现在时间，系统时钟

```c++
std::chrono::system_clock::now();
```

C++11提供了三种时钟类型：

1. `std::chrono::system_clock`
   - 系统时钟，表示系统范围的时间
   - 可以转换为日历时间
   - 可能受系统时间调整影响

2. `std::chrono::steady_clock`
   - 稳定时钟，表示单调递增的时间
   - 不受系统时间调整影响
   - 适合测量时间间隔
   - 具体实现依赖于操作系统：
     - Linux: 通常使用 CLOCK_MONOTONIC，从系统启动开始计时
     - Windows: 通常使用 QueryPerformanceCounter，不一定是系统启动时间
     - macOS: 通常使用 mach_absolute_time()，不一定是系统启动时间
   - 主要特点是保证时间值单调递增且稳定

3. `std::chrono::high_resolution_clock`
   - 高精度时钟
   - 通常是system_clock或steady_clock的别名
   - 提供最高精度的时间测量

示例：
```c++
#include <iostream>
#include <chrono>

void clock_example() {
    // 系统时钟
    auto sys_now = std::chrono::system_clock::now();
    std::time_t sys_time = std::chrono::system_clock::to_time_t(sys_now);
    std::cout << "System time: " << std::ctime(&sys_time);

    // 稳定时钟
    auto steady_now = std::chrono::steady_clock::now();
    // 稳定时钟不能直接转换为日历时间

    // 高精度时钟
    auto high_now = std::chrono::high_resolution_clock::now();
}
```

##### 4.3.2 时延

时延（duration）表示一段时间间隔，由数值和单位组成。

###### 预定义的时延类型

```c++
std::chrono::nanoseconds    // 纳秒
std::chrono::microseconds   // 微秒
std::chrono::milliseconds   // 毫秒
std::chrono::seconds        // 秒
std::chrono::minutes        // 分钟
std::chrono::hours          // 小时
```

###### 创建时延

```c++
// 使用预定义类型
std::chrono::seconds s(5);  // 5秒
std::chrono::milliseconds ms(100);  // 100毫秒

// 使用duration模板
std::chrono::duration<int> d(5);  // 5个时间单位
std::chrono::duration<double> d2(3.5);  // 3.5个时间单位
```

###### 时延运算

```c++
#include <chrono>

void duration_example() {
    using namespace std::chrono;
    
    // 时延相加
    seconds s1(5);
    seconds s2(3);
    seconds s3 = s1 + s2;  // 8秒
    
    // 时延相减
    seconds s4 = s1 - s2;  // 2秒
    
    // 时延比较
    bool b1 = s1 > s2;  // true
    
    // 时延转换
    milliseconds ms = s1;  // 5000毫秒
    
    // 时延计数
    long count = s1.count();  // 5
}
```

###### 自定义时延

```c++
// 自定义时延类型：1/30秒
using frame_duration = std::chrono::duration<int, std::ratio<1, 30>>;
frame_duration fd(1);  // 1/30秒
```

##### 4.3.3 时间点

时间点（time_point）表示时间线上的一个特定点。

###### 创建时间点

```c++
#include <chrono>

void time_point_example() {
    using namespace std::chrono;
    
    // 获取当前时间点
    auto now = system_clock::now();
    
    // 创建特定时间点
    time_point<system_clock> tp = now + seconds(5);  // 5秒后
    
    // 时间点运算
    auto diff = tp - now;  // 时间差
    auto tp2 = tp + seconds(10);  // 10秒后
    auto tp3 = tp - seconds(10);  // 10秒前
}
```

###### 时间点转换

```c++
#include <chrono>
#include <ctime>
#include <iostream>

void time_point_conversion() {
    // 系统时间点转换为日历时间
    auto now = std::chrono::system_clock::now();
    std::time_t time = std::chrono::system_clock::to_time_t(now);
    std::cout << "Current time: " << std::ctime(&time);
    
    // 日历时间转换为系统时间点
    std::time_t t = std::time(nullptr);
    auto tp = std::chrono::system_clock::from_time_t(t);
}
```

###### 时间点比较

```c++
void time_point_comparison() {
    auto now = std::chrono::system_clock::now();
    auto future = now + std::chrono::seconds(5);
    
    if (future > now) {
        std::cout << "Future is after now\n";
    }
    
    if (now < future) {
        std::cout << "Now is before future\n";
    }
}
```

###### 实际应用示例

```c++
#include <iostream>
#include <chrono>
#include <thread>

void timing_example() {
    using namespace std::chrono;
    
    // 测量代码执行时间
    auto start = steady_clock::now();
    
    // 执行一些操作
    std::this_thread::sleep_for(milliseconds(100));
    
    auto end = steady_clock::now();
    auto duration = duration_cast<milliseconds>(end - start);
    
    std::cout << "Operation took " << duration.count() << "ms\n";
    
    // 设置超时
    auto timeout = steady_clock::now() + seconds(5);
    while (steady_clock::now() < timeout) {
        // 执行操作直到超时
        std::this_thread::sleep_for(milliseconds(100));
    }
}
```

###### 注意事项

1. 选择适当的时钟类型
   - 需要日历时间：使用`system_clock`
   - 需要稳定时间测量：使用`steady_clock`
   - 需要最高精度：使用`high_resolution_clock`

2. 时延转换
   - 注意精度损失
   - 使用`duration_cast`进行显式转换
   - 避免隐式转换

3. 时间点运算
   - 只能对相同时钟类型的时间点进行运算
   - 注意时区问题
   - 考虑系统时间调整的影响

4. 性能考虑
   - 时间点获取可能有一定开销
   - 频繁获取时间可能影响性能
   - 考虑使用缓存的时间值

---

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

