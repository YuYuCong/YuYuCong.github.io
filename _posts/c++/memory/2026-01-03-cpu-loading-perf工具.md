---
layout: post
title: cpu-loading优化之perf工具使用详解
subtitle: 讲解perf工具的详细使用方法，以及cpu loading优化相关内容
categories:
  - cpp
tags:
  - cpp
header-img:
header-style: text
date: 2026-01-03
author: CongYu
---

# cpu-loading-perf工具


## 1. 安装perf

```shell
sudo apt update
sudo apt install linux-tools-common
sudo apt-get install linux-tools-$(uname -r) linux-tools-generic -y
```

检查是否安装成功

```shell
perf --version
```

## 2. 数据采集

### 2.1 编译

编译debug包（以ROS项目为例）：

```shell
catkin_make -j12 -DCMAKE_BUILD_TYPE=Debug
```

对于一般的C/C++项目：
```shell
# 使用CMake
cmake -DCMAKE_BUILD_TYPE=Debug ..
make

# 或直接使用g++/gcc添加调试信息
g++ -g -O0 main.cpp -o main
```

### 2.2 权限设置

解除内核符号访问限制：
```shell
echo 0 | sudo tee /proc/sys/kernel/kptr_restrict
```

设置性能监控权限：
```shell
# 查看当前值
cat /proc/sys/kernel/perf_event_paranoid

# 设置权限（根据需要选择）
sudo sysctl -w kernel.perf_event_paranoid=1   # 采样当前用户启动的进程，不能监控其他用户或root的进程
sudo sysctl -w kernel.perf_event_paranoid=-1  # 采样所有进程
```

`perf_event_paranoid` 参数说明：
- `-1`: 允许采样所有进程和内核（最宽松）
- `0/1`: 允许采样当前用户的进程和内核
- `2`: 仅允许采样当前用户的进程（默认值）
- `3`: 禁止采样（最严格）

**注意**: 降低权限值会降低系统安全性，建议仅在开发环境使用。


### 2.3 开始监控

首先启动目标程序，再输入以下命令开始记录perf监控数据：

```shell
perf record -p $(pidof test_node) -e cpu-clock -g -F 99 -o perf.data &
```

命令说明：
- `-p $(pidof test_node)`：指定要监控的进程ID
- `-e cpu-clock`：监控CPU时钟事件
- `-g`：记录调用栈信息（用于生成火焰图）
- `-o perf.data`：指定输出文件名
- `-F 99`：采样频率 99Hz（降低开销，实际可按需要调整，perf默认约为1000Hz）
- `&`：后台运行


命令会在后台运行。

可以实时使用`ls -lh perf.data`命令看到这个.data文件在不断变大。

### 2.4 结束监控

输入以下命令查看perf进程：

```shell
ps aux | grep perf
```

杀掉进程：

```shell
kill <pid>
```

或者使用 `killall` 命令：

```shell
sudo killall perf
```

监控结束后，检查perf.data文件是否成功生成：
```shell
ls -lh perf.data
```

## 3. 结果分析

### 3.1 准备Flame Graph工具

在工作目录下，拉取Flame Graph：

```shell
git clone https://github.com/brendangregg/FlameGraph.git
```

将perf.data拷贝到FlameGraph/目录下。

### 3.2 解析perf数据

```shell
# 用perf script工具对perf.data进行解析
perf script -i perf.data > perf.unfold

# 将perf.unfold中的符号进行折叠
./stackcollapse-perf.pl perf.unfold > perf.folded

# 生成火焰图
./flamegraph.pl perf.folded > perf.svg
```

或者一条命令完成（需要在包含perf.data和FlameGraph脚本的目录下执行）：
```bash
perf script -i perf.data | ./stackcollapse-perf.pl | ./flamegraph.pl > cpu_flame.svg
```

### 3.3 火焰图解释

坐标轴含义：
- X轴（宽度）：每个调用栈路径按字母顺序排列，宽度表示该调用路径在采样中出现的频率（越宽越耗时）
- Y轴（高度）：调用栈深度，从下往上表示调用链
- 颜色：通常随机分配，用于区分不同函数，不代表性能好坏

关键理解：
- 宽度代表被采样到的总执行时间（CPU占用时间），不是该函数的调用次数
- 例如：函数A调用10次每次执行1秒（总10秒），函数B调用1次每次执行5秒（总5秒），火焰图中函数A的宽度会是函数B的2倍
- 顶部平坦且较宽的函数通常是性能热点
- 火焰图的宽度 = 该调用栈路径被采样到的次数
- 采样次数多 → 总执行时间长 → 火焰图宽度大

### 3.4 火焰图的局限性与深入分析方法

**重要理解**：火焰图主要显示**总执行时间**，无法直接区分"调用次数多但每次执行时间短"和"调用次数少但每次执行时间长"。使用如下间接方法分析：

**方法1：使用perf report查看采样分布**

```shell
# 生成报告并查看
perf report -i perf.data --stdio
```

在报告中可以查看：
- 采样次数（Samples）：代表该函数被采样到的次数（反映执行时间，不是调用次数）
- 百分比（%）：占用的时间百分比
- 结合调用栈和函数内部分析，可以判断函数的性能特征

**方法2：使用perf annotate分析函数内部**

```shell
# 查看特定函数的详细分析
perf annotate -i perf.data 函数名
```

这会显示函数内部哪些指令最耗时，帮助理解单次执行的性能瓶颈。如果函数内部某几条指令占用大部分采样，说明单次执行时间长。

**方法3：使用perf script分析调用模式**

```shell
# 查看函数在调用栈中出现的模式
perf script -i perf.data | grep 函数名 | wc -l
```

通过观察该函数在采样记录中的出现频率和分布，可以推断其调用模式。

**方法4：结合调用次数统计工具**

要准确统计调用次数，需要使用专门工具：
- 代码插桩：在函数入口/出口添加计数器
- gdb：设置断点并统计命中次数
- strace：跟踪系统调用
- valgrind --tool=callgrind：详细的调用图分析


## 4. 其他常用perf命令

```shell
# 实时性能统计
perf stat -p $(pidof test_node)    
# 实时热点函数
perf top -p $(pidof test_node)     

# 查看报告
perf report                        

# 缓存性能
perf record -e cache-misses -p $(pidof test_node) -g
perf record -e cache-references -p $(pidof test_node) -g

# 分支预测
perf record -e branch-misses -p $(pidof test_node) -g

# 内存分配（需要root权限）
perf record -e kmem:kmalloc -p $(pidof test_node) -g
```


## 5. 数据采集原理

### 5.1 Linux性能计数器基础

硬件支持：
- 现代CPU（Intel/AMD）内置性能监控单元（PMU, Performance Monitoring Unit）
- PMU包含多个硬件计数器，可监控CPU周期、指令数、缓存命中/未命中、分支预测失败等

工作原理：
```
CPU执行指令
    ↓
PMU硬件计数器递增
    ↓
达到预设阈值（如每1000个CPU周期）
    ↓
触发性能监控中断（PMI, Performance Monitoring Interrupt）
    ↓
内核中断处理程序执行
    ↓
记录当前状态（PC寄存器、调用栈等）
```

### 5.2 采样机制

采样频率控制：
- `cpu-clock` 是软件事件，基于定时器
- 内核以固定频率（默认1000Hz，可通过-F参数调整）触发采样
- 每次采样时：
  1. 中断当前进程执行
  2. 保存CPU寄存器状态
  3. 记录当前指令地址（PC）
  4. 回溯调用栈（如果使用 `-g`）

调整采样频率：
```shell
perf record -F 4000 -p $(pidof test_node)  # 4000Hz，每秒4000次采样
```

权衡：
- 频率越高：精度越高，但开销越大，数据量越大
- 频率越低：开销小，但可能遗漏短时间的热点
- 一般建议：开发环境可用较高频率（1000-4000Hz），生产环境建议使用较低频率（99-500Hz）

### 5.3 调用栈回溯

`-g` 参数的作用：
使用 `-g` 时，perf会记录完整的函数调用栈：

```
当前执行位置：parseJson() 函数内部
    ↓
回溯调用栈：
1. parseJson()      ← 当前函数
2. processData()   ← 调用者
3. main()          ← 更上层调用者
4. __libc_start_main()  ← 程序入口
```

栈回溯原理：
- 基于栈帧（Stack Frame）结构
- 通过BP（Base Pointer）寄存器链式回溯
- 读取每个栈帧的返回地址，确定调用关系

符号解析：
- PC是内存地址（如 `0x7f1234567890`），需要转换为函数名
- 读取程序的符号表（ELF文件中的 `.symtab` 或 `.dynsym`）
- 查找地址对应的函数名
- 对于动态库，需要读取库的符号表

### 5.4 中断处理流程

完整的中断流程：
```
用户程序正常执行
    ↓
定时器到期（或硬件计数器溢出）
    ↓
CPU收到中断信号
    ↓
保存当前上下文（寄存器、PC、SP等）
    ↓
跳转到内核中断处理程序
    ↓
perf中断处理函数执行：
  1. 读取当前进程PID
  2. 读取PC寄存器（当前指令地址）
  3. 读取栈指针SP
  4. 执行栈回溯
  5. 将数据写入perf缓冲区
    ↓
恢复用户程序上下文
    ↓
继续执行用户程序
```

性能开销：
- 中断频率：1000Hz意味着每秒中断1000次
- 每次中断开销：约1-10微秒
- 总开销：通常 < 1% CPU（取决于采样频率）

### 5.5 数据存储格式

perf.data 结构：
```
perf.data
├── Header（元数据）
│   ├── 魔数（标识perf格式）
│   ├── 版本号
│   ├── 事件类型（cpu-clock等）
│   └── 采样频率
│
├── Event Records（采样记录）
│   ├── Record 1
│   │   ├── 时间戳
│   │   ├── PID/TID（进程/线程ID）
│   │   ├── CPU编号
│   │   ├── PC地址
│   │   └── 调用栈（地址数组）
│   └── ...
│
└── Symbol Tables（符号表缓存）
    ├── 主程序符号
    └── 动态库符号
```

调用栈存储：
每个采样记录中的调用栈以地址数组形式存储，后续通过符号表转换为函数名。

### 5.6 不同事件类型

软件事件：
- `cpu-clock`：基于定时器的CPU时钟
- `task-clock`：任务时钟（进程特定的）
- `page-faults`：页错误
- `context-switches`：上下文切换

硬件事件：
- `cycles`：CPU周期数
- `instructions`：指令数
- `cache-references`：缓存引用
- `cache-misses`：缓存未命中
- `branch-instructions`：分支指令
- `branch-misses`：分支预测失败

硬件事件采样原理：
```
硬件计数器从N开始倒数
    ↓
每次相关事件发生，计数器-1
    ↓
计数器减到0
    ↓
触发PMI中断
    ↓
记录采样数据
    ↓
重置计数器为N
```
