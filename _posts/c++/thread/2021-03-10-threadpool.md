---
layout: post
title: "线程池与生产消费者模式"
subtitle: "线程池"
categories: [c++]
tags: [c++,多线程,thread]
header-img: "img/in-post/post-cpp/"
header-style: text
redirect_from:
date: 2021.02.08
---

>  线程池

* Kramdown table of contents
{:toc .toc}


----

Created 2021.02.08 by Cong Yu; Last modified: 2021.02.08-v1.0.1

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022  Cong Yu. Some rights reserved.

---

# 线程池

<p style="font-size:17px;color:#176;text-align:left;">References</p> 
- https://wangpengcheng.github.io/2019/05/17/cplusplus_theadpool/

### 基本概念

**线程池:** 当进行并行的任务作业操作时，线程的建立与销毁的开销是阻碍性能进步的关键，因此线程池诞生。提前创建好多个线程，往线程池中提交任务，无限制循环等待队列，进行计算和操作。

开销计算：

```shell
T1: 线程创建时间
T2: 线程执行时间
T3: 线程销毁时间

我们不希望有的开销： T1和T3，
这部分的比例为  (T1+T3)/(T1+T2+T3)， 
所以T2越大，越划算，并且尽量减少T1和T3。
```

组成：

- 线程管理器： 创建、初始化线程，管理调度
- 工作线程：线程中等待并分配执行任务
- 任务接口：添加任务的接口
- 任务队列：存放未处理的任务

工作的四种情况：

- 空闲（休眠）：没有任务执行，没有任务缓存
- 部分忙碌部分空闲：有任务在执行中，没有任务缓存
- 全部忙碌：有任务在执行，有任务缓存待执行
- 全部忙碌，激活备用线程：有任务在执行，且缓存任务超出队列阈值


### code

- [https://github.com/YuYuCong/MultiThreadDownloader/tree/main/threadpool](https://github.com/YuYuCong/MultiThreadDownloader/tree/main/threadpool)


实现ThreadPool，以及一个public的任务提交接口：

```c++
  
/**  
 * Define a thread pool. 
 */
class ThreadPool {  
public:  
  ThreadPool(unsigned int n = std::thread::hardware_concurrency());  
  ~ThreadPool();  
  
  template <class F, class... Args>  
  auto CommitTask(F &&f, Args &&... args)  
      -> std::future<typename std::result_of<F(Args...)>::type>;  
  
  bool Finished();  
  unsigned int GetProcessed();  
  
private:  
  std::vector<std::thread> workers_;  
  std::deque<std::function<void()>> tasks_;  
  std::mutex queue_mutex_;  
  std::condition_variable cv_task_;  
  unsigned int busy_;  
  std::atomic_uint processed_;  
  bool shutdown_;  
  
  void ThreadProcess();  
};  


template <class F, class... Args>  
auto ThreadPool::CommitTask(F &&f, Args &&... args)  
    -> std::future<typename std::result_of<F(Args...)>::type> {  
  using return_type = typename std::result_of<F(Args...)>::type;  
  
  auto task = std::make_shared<std::packaged_task<return_type()>>(  
      std::bind(std::forward<F>(f), std::forward<Args>(args)...));  
  
  std::future<return_type> res = task->get_future();  
  {  
    std::unique_lock<std::mutex> lock(queue_mutex_);  
    // don't allow enqueueing after stopping the pool  
    if (shutdown_)  
      throw std::runtime_error("enqueue on stopped ThreadPool");  
  
    tasks_.emplace_back([task]() { (*task)(); });  
  }  
  cv_task_.notify_one();  
  return res;  
}
```

其中：
- std::vector<std::thread> workers_;   即 工作线程们
- std::deque<std::function<void()>> tasks_;  即 任务队列

```c++
  
ThreadPool::ThreadPool(unsigned int n) : busy_(), processed_(), shutdown_() {  
  for (unsigned int i = 0; i < n; ++i) {  
    workers_.emplace_back(std::bind(&ThreadPool::ThreadProcess, this));  
  }  
}  
  
ThreadPool::~ThreadPool() {  
  std::unique_lock<std::mutex> latch(queue_mutex_);  
  shutdown_ = true;  
  latch.unlock();  
  cv_task_.notify_all();  
  for (auto &worker : workers_)  
    worker.join();  
}  
  
void ThreadPool::ThreadProcess() {  
  while (true) {  
    std::unique_lock<std::mutex> latch(queue_mutex_);  
    cv_task_.wait(latch, [this]() { return shutdown_ || !tasks_.empty(); });  
    if (shutdown_) {  
      break;  
    }  
  
    if (!tasks_.empty()) {  
      ++busy_;  
      auto task = tasks_.front();  
      tasks_.pop_front();  
      latch.unlock();  
      task();  
      ++processed_;  
      latch.lock();  
      --busy_;  
    }  
  }}  
  
bool ThreadPool::Finished() {  
  std::unique_lock<std::mutex> lock(queue_mutex_);  
  return tasks_.empty() && (busy_ == 0);  
}  
  
unsigned int ThreadPool::GetProcessed() { return processed_; }
```


---

## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

-----

## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)



