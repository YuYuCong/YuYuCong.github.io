---
layout: post
title: C++并发编程系列5-内存模型与原子操作
subtitle: C++并发编程系列笔记，ch5笔记
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
  - /2021/02/05/
---

>  C++ 并发编程系列笔记，ch5笔记

* Kramdown table of contents
{:toc .toc}
# C++ 并发笔记

Created 2021.02.05 by William Yu; Last modified: 2022.09.16-v1.1.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 William Yu. Some rights reserved.

---





<center style="font-size:72px;color:;text-align:center;">CH5</center> 





## Chapter Five: 内存模型与原子操作

<p style="font-size:20px;color:#176;text-align:left;">References</p> 

- https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264956

### 5.0 Concepts

- 内存模型

- 原子类型

- 原子操作

### 5.1 内存模型

#### 5.1.1 对象的存储形式

- 每一个变量都是一个对象，包括成员变量的对象
- 每个对象至少占有一个内存位置
- 基本类型都有确定的内存位置
- 相邻位域是相同内存中的一部分

#### 5.1.2 考虑并发

- 所有东西都在内存中。
- 当两个线程访问不同(*separate*)的内存位置时，不会存在任何问题，一切都工作顺利。
- 而当两个线程访问同一(*same*)个内存位置，你就要小心了。
  - 如果没有线程更新内存位置上的数据，那还好；只读数据不需要保护或同步。
  - 当有线程对内存位置上的数据进行修改，那就有可能会产生条件竞争，

### 5.2 原子操作与原子类型

#### 5.1.1 原子操作

- 原子操作：一类不可分割的操作，
  - 当这样操作在任意线程中进行一半的时候，你是不能查看的
  - 它的状态要不就是完成，要不就是未完成
  - 注意：加锁不加锁的前提是看能不能cpu一条指令读取到
    - CPU 同内存交换数据的最小内存单位为4字节
    - 因此小于 4 字节的无需加锁， 如 int, char。
    - 而大于4 字节的, 如 double, 64位的 long 需要加锁。
    - 以上只是对其读写不需加锁, 对 i++ 这类组合操作,仍需加锁。
  
- 非原子操作：
  - 可能会被视为由一个线程完成一半的操作
  - 如果这种是一个存储操作，那么其他线程看到的，可能既不是存储前的值，也可能不是已存储的值

#### 5.2.2 原子类型

<center style="font-size:30px;color:#CD5C5C;text-align:right;">std::atomic</center> 

头文件

```c++
#include <atomic>
```

类型

| 原子类型        | 相关特化类                      |
| :-------------- | :------------------------------ |
| atomic_bool     | std::atomic<bool>               |
| atomic_char     | std::atomic<char>               |
| atomic_schar    | std::atomic<signed char>        |
| atomic_uchar    | std::atomic<unsigned char>      |
| atomic_int      | std::atomic<int>                |
| atomic_uint     | std::atomic<unsigned>           |
| atomic_short    | std::atomic<short>              |
| atomic_ushort   | std::atomic<unsigned short>     |
| atomic_long     | std::atomic<long>               |
| atomic_ulong    | std::atomic<unsigned long>      |
| atomic_llong    | std::atomic<long long>          |
| atomic_ullong   | std::atomic<unsigned long long> |
| atomic_char16_t | std::atomic<char16_t>           |
| atomic_char32_t | std::atomic<char32_t>           |
| atomic_wchar_t  | std::atomic<wchar_t>            |

使用

```c++
  std::atomic_int times_ = {0}; // 初始化时使用{}
```

使用时不用考虑锁，直接当做正常变量使用即可。



### 5.3 栅栏

// todo(congyu)

参 https://www.kancloud.cn/jxm_zn/cpp_concurrency_in_action/264956#51__12    5.3小节





---

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

