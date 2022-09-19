---
layout: post
title: "C++并发编程系列1-概述"
subtitle: "C++并发编程系列笔记，ch1笔记"
categories: [c++]
tags: [c++,多线程,thread]
header-img: "img/in-post/post-cpp/"
redirect_from:
  - /2021/02/01/
---

>  C++ 并发编程系列笔记，ch1笔记

* Kramdown table of contents
{:toc .toc}
# C++ 并发笔记

Created 2021.02.01 by William Yu; Last modified: 2022.09.15-v1.1.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 William Yu. Some rights reserved.

---

<p style="font-size:20px;color:#176;text-align:left;">References</p> 

- [https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264949](https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264949)
- [https://paul.pub/cpp-concurrency/](https://paul.pub/cpp-concurrency/)

---



<center style="font-size:72px;color:;text-align:center;">CH1</center> 



## Chapter One: 基础概念

<p style="font-size:20px;color:#176;text-align:left;">References</p> 

- [https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264952](https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264952)

### 1.1 Concepts

- 并发(*concurrency*)
- 处理器 -> 处理单元(processing unit) 或称 核心(core)
- 一个计算机就有一个或多个处理器，一个处理器具有一个或多个核心
- 一个核心在某一时间只能同时处理一项任务
- 假并行：单核，任务切换(task switching)
- 真并行：多核，硬件并发(hardware concurrency)

<img src="https://raw.githubusercontent.com/xiaoweiChen/Cpp_Concurrency_In_Action/master/images/chapter1/1-1.png" alt="img" style="zoom:90%;" />

- 假并发，任务切换耗时较大

- 真假并发混合：任务数大于核心数

  ![img](https://raw.githubusercontent.com/xiaoweiChen/Cpp_Concurrency_In_Action/master/images/chapter1/1-2.png)

##### 并发的形式

###### 1. 多进程并发

- 操作系统会在进程间提供了一定的保护措施，以避免一个进程去修改另一个进程的数据。
- 优点：进程并发更容易实现安全(safe)的并发代码
- 但也有缺点：开销：启动进程的开销  +  操作系统管理进程的开销
- 进程间通信速度较慢
- 进程间通信的实现方式：信号、套接字、文件、管道

<img src="https://raw.githubusercontent.com/xiaoweiChen/Cpp_Concurrency_In_Action/master/images/chapter1/1-3.png" alt="img" style="zoom:80%;" align='center' text ="并发"/>   

<small class="img-hint">Fig1. 多进程并发</small>

<img src="https://raw.githubusercontent.com/xiaoweiChen/Cpp_Concurrency_In_Action/master/images/chapter1/1-4.png" alt="img" style="zoom:100%;" align='center'/>         

<small class="img-hint">Fig2. 多线程并发</small>

总结

<img src="/img/in-post/post-cpp/cpp_thread_1.png" alt="img" style="zoom:40%;" align='center' text ="cpp_thread_1.png"/>

<small class="img-hint">Fig3. 并发</small>

###### 2. 多线程并发

- 进程中的所有线程共享地址空间
- 线程间通信：共享内存
- 共享内存非常灵活，多线程的开销远小于多进程
- 灵活的代价：程序员必须维护多个线程所访问到的数据。维护方法：加锁
- 并发 -> 主要使用多线程并发

### 1.2 代码简单示例

###### 头文件 

```c++
#include <thread>
```

###### 线程类型

线程内执行的任务写成一个函数ThreadFunction(), 然后由此函数初始化一个线程对象。

```c++
std::thread t(ThreadFunction());
```



---

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)



