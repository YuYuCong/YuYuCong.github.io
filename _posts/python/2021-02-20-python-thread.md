---
layout: post
title: Python多线程
subtitle: Python多线程编程简单笔记
categories:
  - python
tags:
  - 多线程
  - thread
  - python
header-img: img/in-post/post-python/
header-style: text
date: 2021.02.22
---

>  本文主要记录Python多线程编程相关的一些笔记。包括threading模块，Thread类，以及5种线程锁（互斥锁，重入锁，信号，事件，条件）等。

* Kramdown table of contents
{:toc .toc}

# Python 多线程笔记

Created 2021.02.20 by William Yu; Last modified: 2022.09.16-v1.1.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 William Yu. Some rights reserved.

---



<p style="color:#556B2F;font-size:20px">Reference</p>

 - [https://www.runoob.com/python3/python3-multithreading.html](https://www.runoob.com/python3/python3-multithreading.html)
 - [https://www.liujiangblog.com/course/python/79](https://www.liujiangblog.com/course/python/79)

## 0. 简介

在Python3中，通过threading模块提供线程。原来的thread模块已废弃。但是threading模块中有个Thread类（大写的T，类名），最主要的线程类。

## 1. threading模块

### 1.1 常用方法

| 方法与属性         | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| current_thread()   | 返回当前线程                                                 |
| active_count()     | 返回当前活跃的线程数，1个主线程+n个子线程                    |
| get_ident()        | 返回当前线程                                                 |
| enumerate()        | 返回当前活动 Thread 对象列表                                 |
| main_thread()      | 返回主 Thread 对象                                           |
| settrace(func)     | 为所有线程设置一个 trace 函数                                |
| setprofile(func)   | 为所有线程设置一个 profile 函数                              |
| stack_size([size]) | 返回新创建线程栈大小；或为后续创建的线程设定栈大小为 size    |
| TIMEOUT_MAX        | Lock.acquire(), RLock.acquire(), Condition.wait() 允许的最大超时时间 |

### 1.2 提供的类

 - Thread：基本线程类
- Lock：互斥锁
- RLock：可重入锁，使单一进程再次获得已持有的锁(递归锁)
- Condition：条件锁，使得一个线程等待另一个线程满足特定条件，比如改变状态或某个值。
- Semaphore：信号锁。为线程间共享的有限资源提供一个”计数器”，如果没有可用资源则会被阻塞。
- Event：事件锁，任意数量的线程等待某个事件的发生，在该事件发生后所有线程被激活
- Timer：一种计时器
- Barrier：Python3.2新增的“阻碍”类，必须达到指定数量的线程后才可以继续执行。

## 2. Thread类
threading模块最重要的类

### 2.1 Thread类的方法

| 方法与属性                 | 说明                                                         |
| -------------------------- | ------------------------------------------------------------ |
| start()                    | 启动线程，等待CPU调度                                        |
| run()                      | 线程被cpu调度后自动执行的方法                                |
| getName()、setName()和name | 用于获取和设置线程的名称。                                   |
| setDaemon()                | 设置为后台线程或前台线程（默认是False，前台线程）。如果是后台线程，主线程执行过程中，后台线程也在进行，主线程执行完毕后，后台线程不论成功与否，均停止。如果是前台线程，主线程执行过程中，前台线程也在进行，主线程执行完毕后，等待前台线程执行完成后，程序才停止。 |
| ident                      | 获取线程的标识符。线程标识符是一个非零整数，只有在调用了start()方法之后该属性才有效，否则它只返回None。 |
| is_alive()                 | 判断线程是否是激活的（alive）。从调用start()方法启动线程，到run()方法执行完毕或遇到未处理异常而中断这段时间内，线程是激活的。 |
| isDaemon()方法和daemon属性 | 是否为守护线程                                               |
| join([timeout])            | 调用该方法将会使主调线程堵塞，直到被调用线程运行结束或超时。参数timeout是一个数值类型，表示超时时间，如果未提供该参数，那么主调线程将一直堵塞到被调线程结束。 |

### 2.2 创建线程

##### 方法一： 类继承

 - step1. 直接从 threading.Thread 继承创建一个子类
 - step2. 并在子类里面实现一个重载的run()方法
 - step3. 实例化之后调用start()方法启动新线程
 - step4. start()会启动重载的run()方法


```python
import threading
import time

class MyThread(threading.Thread):
    def __init__(self, threadID, name, counter):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.name = name
        self.counter = counter
    def run(self):
        print("start thread:"+self.name)
        self.MyJob()
        print("exit thread:"+self.name)
        pass
    def MyJob(self):
        while self.counter:
            time.sleep(1)    # 1s
            print("%s,%s" % (self.name, time.ctime(time.time()) ))
            self.counter -= 1
        pass
```


```python
thread = MyThread(1, "hello", 6) 
thread.start()
thread.join()
print("exit main thread")
```

    start thread:hello
    hello,Sun Feb  7 16:40:44 2021
    hello,Sun Feb  7 16:40:45 2021
    hello,Sun Feb  7 16:40:46 2021
    hello,Sun Feb  7 16:40:47 2021
    hello,Sun Feb  7 16:40:48 2021
    hello,Sun Feb  7 16:40:49 2021
    exit thread:hello
    exit main thread

##### 方法二：实例化threading.Thread对象

 - 在实例化该对象的时候，将线程要执行的任务函数作为参数传入线程


```python
import threading
import time
def MyJob(name, counter):
    while counter:
        time.sleep(1)    # 1s
        print("%s,%s" % (name, time.ctime(time.time()) ))
        counter -= 1
    pass

mythread = threading.Thread(target=MyJob, args=('hello', 4))
mythread.start()
mythread.join()
```

    hello,Mon Mar  8 15:14:09 2021
    hello,Mon Mar  8 15:14:10 2021
    hello,Mon Mar  8 15:14:11 2021
    hello,Mon Mar  8 15:14:12 2021


注意：构造参数
- 第一个参数是线程函数变量
- 第二个参数args是一个数组变量参数
    - 如果需要传递多个参数，写在元组里面，（参数1, 参数2, 参数3）
    - 如果只传递一个值，元组中只包含一个元素时，需要在元素后面添加逗号，逗号不能省略 (参数1,）

## 3. 线程同步：锁

threading 提供了很多锁类型：
 - Lock 互斥锁
 - RLock 可重入锁
 - Condition 条件
 - Event 事件
 - Semaphore 信号
 - 
   Barrier “阻碍”

### 3.1 Lock 互斥锁

使用过程也非常简单：

- `lock = threading.Lock()` 实例化锁
- `lock.acquire()`    上锁
- `lock.release()`    释放锁


```python
import threading
import time

number = 0
lock = threading.Lock()  # 实例化一个互斥锁

def plus(lk):
    global number       # global声明此处的number指的就是外面的全局变量number
    lk.acquire()        # 开始加锁
    for _ in range(1000000):    # 进行一个大数级别的循环加一运算
        number += 1
    print("子线程%s运算结束后，number = %s" % (threading.current_thread().getName(), number))
    lk.release()        # 释放锁，让别的线程也可以访问number

if __name__ == '__main__':
    threads = []
    for i in range(2):      # 用2个子线程，就可以观察到脏数据
        t = threading.Thread(target=plus, args=(lock,)) # 需要把锁当做参数传递给plus函数
        t.start()
        threads.append(t)
    for i in threads:
        i.join()
    print("主线程执行完毕后，number = ", number)
```

    子线程Thread-17运算结束后，number = 1000000
    子线程Thread-18运算结束后，number = 2000000
    主线程执行完毕后，number =  2000000


### 3.2 RLock 重入锁

 - Rlock的使用方法与Lock一样，但是可重入。
 - 可被一个线程多次acquire，锁内部有一个counter计数对象，记录acquire次数
 - 可被一个线程多次release，release一次，counter减1
 - 计数为0时，其他线程才能获取资源

### 3.3 Semaphore 信号 
 - 可被多个线程同时acquire
 - 可以设置一个counter上限，表示最多有多少线程可同时拥有这把锁
 - 通常用于只访问数据，不改变数据的多线程工作
 - 信号量上限为1时，相当于互斥锁

使用方法

- `se = threading.BoundedSemaphore(2)` 构造一个允许2个线程同时持有的锁
- `se.acquire()` 获取锁
- `se.release()` 释放锁


```python
import threading
import time

def MyJob(name, counter, delay, se):
    se.acquire()
    while counter:
        time.sleep(delay)    # 1s
        print("%s,%s" % (name, time.ctime(time.time()) ))
        counter -= 1
    se.release()
    pass

se = threading.BoundedSemaphore(2)   # 创建一个信号量锁，运行同时发两把钥匙

mythread1 = threading.Thread(target=MyJob, args=('thread1', 8, 1, se))
mythread2 = threading.Thread(target=MyJob, args=('thread2', 3, 2, se))
mythread1.start()
mythread2.start()
mythread1.join()
mythread2.join()
```

    thread1,Sun Feb  7 18:29:24 2021
    thread2,Sun Feb  7 18:29:25 2021
    thread1,Sun Feb  7 18:29:25 2021
    thread1,Sun Feb  7 18:29:26 2021
    thread2,Sun Feb  7 18:29:27 2021
    thread1,Sun Feb  7 18:29:27 2021
    thread1,Sun Feb  7 18:29:28 2021
    thread2,Sun Feb  7 18:29:29 2021
    thread1,Sun Feb  7 18:29:29 2021
    thread1,Sun Feb  7 18:29:30 2021
    thread1,Sun Feb  7 18:29:31 2021


### 3.4 Event 事件 

##### 事件线程锁的运行机制
 - 定义全局Flag
 - 在线程执行wait()方法时，如果Flag为Flase，就会被阻塞，反之放行
 - 可以存在多个线程wait一个Flag的情形，放行时一次全部放行

##### Event提供的方法
 - `clear()`  复位 Flase
 - `set()`   置位放行 True
 - `wait()`    注册一个等待，一旦有其他线程运行了set()将Flag置位，就接着向下运行
 - `is_set()`  判断是否为true


```python
import threading
import time

event_green_light_on = threading.Event()
running = False

def lighter():
    green_time = 3       # 绿灯时间
    red_time = 2         # 红灯时间
    event_green_light_on.set()          # 初始设为绿灯
    while running:
        print("绿灯亮...")
        time.sleep(green_time)
        event_green_light_on.clear()
        print("红灯亮...")
        time.sleep(red_time)
        event_green_light_on.set()
    print("红绿灯线程退出")
    pass
    
def Cars(name):
    while running:
        if event_green_light_on.is_set():      # 判断当前是否"放行"状态
            print("一辆[%s] 呼啸开过..." % name)
            time.sleep(0.5)
        else:
            print("一辆[%s]开来，看到红灯，无奈的停下了..." % name)
            event_green_light_on.wait()         # 程序阻塞，等待事件
            print("[%s] 看到绿灯亮了，瞬间飞起....." % name)
    print("汽车线程退出")
    pass
    
if __name__ == '__main__':
    running = True
    light = threading.Thread(target=lighter,)
    light.start()
    for name in ['奔驰', '宝马', '奥迪']:
        car = threading.Thread(target=Cars, args=(name,))
        car.start()
    time.sleep(10)
    running = False
    if light.isAlive():
        light.join()
```

    绿灯亮...
    一辆[奔驰] 呼啸开过...一辆[宝马] 呼啸开过...
    一辆[奥迪] 呼啸开过...
    
    一辆[宝马] 呼啸开过...
    一辆[奥迪] 呼啸开过...
    一辆[奔驰] 呼啸开过...
    一辆[宝马] 呼啸开过...一辆[奥迪] 呼啸开过...
    
    一辆[奔驰] 呼啸开过...
    一辆[宝马] 呼啸开过...
    一辆[奥迪] 呼啸开过...
    一辆[奔驰] 呼啸开过...
    一辆[宝马] 呼啸开过...
    一辆[奥迪] 呼啸开过...
    一辆[奔驰] 呼啸开过...
    一辆[宝马] 呼啸开过...
    一辆[奥迪] 呼啸开过...
    一辆[奔驰] 呼啸开过...
    红灯亮...
    一辆[宝马]开来，看到红灯，无奈的停下了...
    一辆[奥迪]开来，看到红灯，无奈的停下了...
    一辆[奔驰]开来，看到红灯，无奈的停下了...
    绿灯亮...[宝马] 看到绿灯亮了，瞬间飞起.....
    一辆[宝马] 呼啸开过...
    [奔驰] 看到绿灯亮了，瞬间飞起.....
    
    一辆[奔驰] 呼啸开过...
    [奥迪] 看到绿灯亮了，瞬间飞起.....
    一辆[奥迪] 呼啸开过...
    一辆[宝马] 呼啸开过...
    一辆[奔驰] 呼啸开过...
    一辆[奥迪] 呼啸开过...
    一辆[宝马] 呼啸开过...
    一辆[奔驰] 呼啸开过...
    一辆[奥迪] 呼啸开过...
    一辆[宝马] 呼啸开过...
    一辆[奔驰] 呼啸开过...
    一辆[奥迪] 呼啸开过...
    一辆[宝马] 呼啸开过...
    一辆[奔驰] 呼啸开过...
    一辆[奥迪] 呼啸开过...
    一辆[宝马] 呼啸开过...
    一辆[奔驰] 呼啸开过...
    一辆[奥迪] 呼啸开过...
    红灯亮...
    一辆[宝马]开来，看到红灯，无奈的停下了...
    一辆[奔驰]开来，看到红灯，无奈的停下了...
    一辆[奥迪]开来，看到红灯，无奈的停下了...
    红绿灯线程退出[奥迪] 看到绿灯亮了，瞬间飞起.....[奔驰] 看到绿灯亮了，瞬间飞起.....[宝马] 看到绿灯亮了，瞬间飞起.....
    汽车线程退出  
    汽车线程退出汽车线程退出

### 3.5 条件 Condition

Condition称作条件锁

##### 提供的方法
 - `acquire()/release()`   加锁解锁
 - `wait([timeout])`       将线程加入到condition的等待池，等待通知，并释放锁。使用前线程必须已经获得锁，否则抛出异常
 - `notify()`    从等待池中间挑选一个线程并通知，收到通知的线程自动调用acquire()获取锁，其余线程依旧等待。这个方法不会释放锁。使用线程前必须已经获得锁，否则抛出异常。
 - `notifyAll()`  通知所有等待池中的线程，这些线程都进入锁定池尝试获得锁定。调用这个方法不会释放锁定。使用前线程必须已获得锁定，否则将抛出异常。

```python
import threading
import time

num = 0
con = threading.Condition()  # 设置一个条件
running = True

class Foo(threading.Thread):
    
    def __init__(self, name, action):
        super(Foo, self).__init__()
        self.name = name
        self.action = action

    def run(self):
        global num
        con.acquire()            # 获取锁
        print("%s开始执行..." % self.name)
        while running:
            if self.action == "add":
                num += 1
            elif self.action == 'reduce':
                num -= 1
            else:
                exit(1)
            print("num当前为：", num)
            time.sleep(1)
            if num == 5 or num == 0:
                print("暂停执行%s！" % self.name)
                con.notify()   # 通知
                con.wait()     # 等待
                print("%s开始执行..." % self.name)
        con.release() #　释放锁
        pass

if __name__ == '__main__':
    a = Foo("线程A", 'add')
    b = Foo("线程B", 'reduce')
    a.start()
    b.start()
    time.sleep(12)
    running = False
    if a.isAlive():
        con.notify()  
        a.join()
    if b.isAlive():
        con.notify()  
        b.join()
```

    线程A开始执行...
    num当前为： 1
    num当前为： 2
    num当前为： 3
    num当前为： 4
    num当前为： 5
    暂停执行线程A！
    线程B开始执行...
    num当前为： 4
    num当前为： 3
    num当前为： 2
    num当前为： 1
    num当前为： 0
    暂停执行线程B！
    线程A开始执行...
    num当前为： 1
    num当前为： 2
    
    ---------------------------------------------------------------------------
    
    RuntimeError                              Traceback (most recent call last)
    
    <ipython-input-7-3ccbac894eac> in <module>
         42     running = False
         43     if a.isAlive():
    ---> 44         con.notify()
         45         a.join()
         46     if b.isAlive():


    /usr/lib/python3.5/threading.py in notify(self, n)
        341         """
        342         if not self._is_owned():
    --> 343             raise RuntimeError("cannot notify on un-acquired lock")
        344         all_waiters = self._waiters
        345         waiters_to_notify = _deque(_islice(all_waiters, n))


    RuntimeError: cannot notify on un-acquired lock


### 3.6 Timer 定时器 

 - Timer定时器类，用于指定n秒之后执行某项操作
 - Timer类是threading模块中的一个小工具，用于指定n秒后执行某操作。一个简单但很实用的东西。


```python
from threading import Timer

def hello():
    print("hello. world")
    
t = Timer(3, hello)
t.start()
```

    hello. world

### 3.7 通过with语句使用的线程锁

是一种良好的代码习惯与格式。

常用于异常处理：

- 所有的线程锁都有一个加锁和释放锁的动作，类似与文件的打开与关闭
- 加锁之后，如果出现异常，没有正常释放锁，那么线程会造成致命性的影响
- 通过with上下文管理器，确保锁被正常释放


```python
with some_lock:
    # do something 
    pass
```

```python
# 也相当于
some_lock.acquire()
try:
    # 执行任务..
finally:
    some_lock.release()
```

### 3.8 全局解释锁（GIL）

 - python 中无论CPU有多少核，同时只能执行一个线程，这是由于GIL(Global Interpreter Lock())造成的
 - GIL只在CPython解释器中存在，因为CPython调用的是c语言的原生线程，不能直接操作CPU
 - 只能利用GIL保证同一时间只有一个线程拿到数据
 - PyPy和JPython中都没有GIL

##### Python多线程的工作流程：

1. 拿到公共数据
2. 申请GIL
3. Python解释器调用操作系统原生线程
4. cpu执行运算
5. 当该线程执行一段时间消耗完，无论任务是否已经执行完毕，都会释放GIL
6. 下一个被CPU调度的线程重复上面的过程

##### 特点

针对不同类型的任务，多线程的效率不同

 - 对于CPU密集型的任务（各种循环，计算等），计算次数多，ticks计数很快达到阈值，会触发GIL的释放与再竞争。但是多个线程之间的来回切换非常耗时
 - python的多线程对CPU密集型任务并不友好
 - IO密集型任务（文件处理、网络通信等设计到数据读写的操作），IO操作会常有IO等待，在等待时切换到其他线程可不保证不浪费CPU资源，提升执行效率
 - python的多线程对IO密集型任务比较友好

##### 为什么不去除GIL

历史原因

##### 如何是好

 - Python中想要充分利用CPU资源，使用多进程。每个进程有自己独立的GIL，互不干扰。多进程才是真正意义上的Python并行
 - 在Python中，多进程的执行效率优于多线程(仅仅针对多核CPU而言)
 - IO密集型任务，使用多线程
 - 计算密集型任务，使用多进程
 - 此外，python 的协程机制  //todo(congyu)

## 4. 其他

注意哦：

 - Python print()不是线程安全的



---

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

