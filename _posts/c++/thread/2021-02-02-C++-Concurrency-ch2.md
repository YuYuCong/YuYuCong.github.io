---
layout: post
title: C++并发编程系列2-线程管理
subtitle: C++并发编程系列笔记，ch2笔记
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
  - /2021/02/02/
---

>  C++ 并发编程系列笔记，ch2笔记

* Kramdown table of contents
{:toc .toc}
# C++ 并发笔记

Created 2021.02.02 by William Yu; Last modified: 2022.09.15-v1.1.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 William Yu. Some rights reserved.

---

<p style="font-size:20px;color:#176;text-align:left;">References</p> 

- [https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264949](https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264949)
- [https://paul.pub/cpp-concurrency/](https://paul.pub/cpp-concurrency/)

---



<center style="font-size:72px;color:;text-align:center;">CH2</center> 



## Chapter Two: 线程管理

<p style="font-size:20px;color:;text-align:;">Reference</p> 

- [https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264953](https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264953)

### 2.1 线程创建与启动

- 除main()函数之外的所有线程都有自己的入口函数

- main()函数在主线程，程序启动时，主线程启动，main()函数开始执行

- 其余子线程在`std::thread`对象创建的时候启动

  ```c++
  void do_some_work();
  std::thread my_thread(do_some_work);
  ```

- lambda表达式也可用于创建子线程

  ```c++
  std::thread my_thread([]{
      // do_something
      // do_something_else
  });
  ```

- 类对象用于创建子线程

  ```c++
  #include <iostream>
  #include <thread>
  
  class Worker {
   public:
    Worker(int min, int max) : mMin(min), mMax(max) {}  // ①
    void work() {                                     // ②
      mResult = 0;
      for (int i = mMin; i <= mMax; i++) {
        mResult += i;
      }
    }
    double getResult() { return mResult; }
  
   private:
    int mMin;
    int mMax;
    double mResult;
  };
  
  int main() {
    Worker w(0, 100);
    std::cout << "Task in class triggered" << std::endl;
    auto subthread = std::thread(&Worker::work, &w);  // 类对象用于创建子线程
    subthread.join();
    std::cout << "Task in class finish, result: " << w.getResult() << std::endl;
    return 0;
  }
  ```

##### 常用代码片段 之 子线程创建

一个子线程创建和维护的例子：

```c++
class UserClass {
 public:
  UserClass() : estimate_robot_pose_thread_running_(false) {
    //balabalabala
  }

  ~UserClass(){
    do_something_thread_running_ = false;
    if (do_something_thread_.joinable()) {
      do_something_thread_.join();
      LOG(ERROR) << "do_something_thread_ exit.";
    }
  }

  bool Launch() {
    do_something_thread_running_ = true;
    do_something_thread_ =
      std::thread(&UserClass::DoSomethingThread, this);
    return true;
  }

 private:
  void DoSomethingThread() {   
    while (do_something_thread_running_) {
      //balabalabala
      std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }
  }

  std::atomic_bool do_something_thread_running_;
  std::thread do_something_thread_;
};

```



### 2.2 join() 

等待线程结束

<center style="font-size:30px;color:#CD5C5C;text-align:right;">join()</center> 

<center style="font-size:30px;color:#CD5C5C;text-align:right;">joinable()</center> 

- join()  阻塞当前线程，等待子线程结束，与当前线汇合

- joinable()   判断子线程是否可加入  

  ```c++
  void do_some_work();
  
  int main(){
      std::thread my_thread(do_some_work);
     
      // 主线程做其他工作，完成之后，等待子线程结束
      if(my_thread.joinable()){
          my_thread.join();
      }
  }
  ```

一些注意

- 由主线程创建线程对象，并由主线程内的线程对象运行子线程函数，然后调用它的.join()函数
- 必须等待子线程任务结束，join()函数才能得到返回
- 主线程会被阻塞在.join()处
- 相当于主线程等待子线程结束汇合
- 通常在主线程结束之前调用 .join()
- 调用一次join() 之后，joinable()返回false
- join()时才释放资源

如果不join()会发生什么？

- 主线程结束而子线程未结束，导致进程异常

### 2.3 detach()

后台运行子线程

<center style="font-size:30px;color:#CD5C5C;text-align:right;">detach()</center> 

- detach()
- 使用detach() 分离当前线程和子线程，分离后无法join()，不可由其他线程回收或者杀死，资源在它终止时由系统自动释放
- 发后即忘 fire and forget
- 通常为后台任务

```c++
std::thread t(do_background_work);
if(t.joinable()){
    t.detach();
}
```

### 补充： join() 和 detach()的区别

- blog [https://blog.csdn.net/c_base_jin/article/details/79233705](https://blog.csdn.net/c_base_jin/article/details/79233705)

### 2.4 传递参数给线程函数

```c++
void f(int i, std::string const& s);
std::thread t(f, 3, "hello");
```

### 2.5 线程数量的合理值

<center style="font-size:26px;color:#E9967A;text-align:right;">hardware_concurrency()</center> 

```c++
std::thread::hardware_concurrency()
```

返回cpu的核心数量

### 2.6 get_id()

id 为 线程标识

<center style="font-size:26px;color:#E9967A;text-align:right;">get_id()</center> 

- 线程标识的数据类型为std::thread::id

- 获取id的方式

  1. 使用`std::this_thread`获取当前线程的

      ```c++
      std::thread::id t_id = std::this_thread::get_id();
      
      // 也支持使用uint_64t类型的数字来接收的
      auto current_thread_id = (uint_64t)pthread_self();
      ```

  2. 对thread对象使用get_id()方法

     ```c++
     std::thread::id t_id = my_thread::get_id();
     ```

- 每个线程具有全局唯一的线程id

- 可以有的一种操作：

  - 创建 `std::hash<std::thread::id>` 无序容器，使用线程id作为键，存储线程池中线程的信息





---

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)



