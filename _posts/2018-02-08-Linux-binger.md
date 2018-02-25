---
layout: post
title: "Linux入门很简单_Ubuntu的故事------整理笔记"
description: "linux入门很简单的学学习笔记啊"
categories: [linux]
tags: [linux]
redirect_from:
  - /2018/02/08/
---

> 学习笔记

* Kramdown table of contents
{:toc .toc}
# Linux入门很简单_Ubuntu的故事------整理笔记

------

作者：WilliamYu

日期：2018.02.08_更新

Copyright © 2018 本文遵从GNU自由文档许可（Free Document License）条款，欢迎转载、散布。 

不足之处，万望指正，邮箱windmillyucong@163.com

------



### 前言

作为一个初入linux开源世界的探索者，这本书确实令人受益匪浅，几乎就像是一本讲道理的童话书。^_^！

两个方面：【1】对于初学者，此书可以带你在linux里全面探索一番，仔细地看一遍倒也明晰很多重要的基本原理。【2】如果时间有限，渴求快速入门，只求结论而不想了解个中脉络，难免会觉得作者这厚厚一本书略显臃肿，读的太慢，那么这篇笔记应该对你有所帮助。

尝试将厚书读薄，整理出“干货”。

------

## Chapter1

### 1.xwindow gnome

负责屏幕上的图形界面

### 2.安装linux系统的流程

注意分区，从光驱安装或从U盘安装（P21），已经有许多教程。

### 3.目录结构

根目录/

/etc：存储配置文件

/bin：存储二进制文件

/boot：存放启动文件

/lib：存放库文件

/home：用户文件夹

### 4.目录不等于分区

具体区别：（P10）

理解“挂载“

### 5.BIOS

开机启动固件BIOS，检查CPU，内存，显卡等硬件，然后激活GBUR，GBUR启动，由用户选择windows系统或者linux系统。

### 6.GRUB启动管理器

位于MBR，（512B，只是一个扇区）配置文件位于linux系统下的/boot/grub/，叫做grub.cfg

### 7.如果后安装Windows系统

将清空MBR，BIOS启动将找不到GRUB，直接启动windows。修复Gber的方法;(P15)

### 8.sudo

获取管理员权限

### 9.gedit

文本编辑器

### 10.修改GRUB

修改/etc/default/grub文件

```shell
sudo gedit /etc/default/grub
```

原始内容

```shell
# If you change this file, run 'update-grub' afterwards to update
# /boot/grub/grub.cfg.
# For full documentation of the options in this file, see:
#   info -f grub -n 'Simple configuration'

GRUB_DEFAULT=0
#GRUB_HIDDEN_TIMEOUT=0
GRUB_HIDDEN_TIMEOUT_QUIET=true
GRUB_TIMEOUT=10
GRUB_DISTRIBUTOR=`lsb_release -i -s 2> /dev/null || echo Debian`
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
GRUB_CMDLINE_LINUX=""

# Uncomment to enable BadRAM filtering, modify to suit your needs
# This works with Linux (no patch required) and with any kernel that obtains
# the memory map information from GRUB (GNU Mach, kernel of FreeBSD ...)
#GRUB_BADRAM="0x01234567,0xfefefefe,0x89abcdef,0xefefefef"

# Uncomment to disable graphical terminal (grub-pc only)
#GRUB_TERMINAL=console

# The resolution used on graphical terminal
# note that you can use only modes which your graphic card supports via VBE
# you can see them in real GRUB with the command `vbeinfo'
#GRUB_GFXMODE=640x480

# Uncomment if you don't want GRUB to pass "root=UUID=xxx" parameter to Linux
#GRUB_DISABLE_LINUX_UUID=true

# Uncomment to disable generation of recovery mode menu entries
#GRUB_DISABLE_RECOVERY="true"

# Uncomment to get a beep at grub start
#GRUB_INIT_TUNE="480 440 1"

```

两个地方可以定制：

GRUB_DEFAULT=0 ，0代表linux启动的优先级，越大越靠后

GRUB_TIMEOUT=10，10是等待时间，默认10秒。

改动之后保存，并更新配置文件 /boot/grub/grub.cfg：运行命令

```shell
sudo update-grub
```



## Chapter2

### 1.apt

安装软件工具。

软件源：

```shell
sudo gedit /etc/apt/source.list
```

把里面的东西清空，建议更换成国内的源：比如163，阿里，清华的源，保存退出即可

### 3.中文输入法

直接使用搜狗输入法吧

### 4.视频播放软件的选择

直接去第三章第6项

### 5.注意软件安装的方式：

二进制文件，库文件，配置文件，其他文件都放的是不一样的文件夹，apt会列一个清单

### 6.驱动更新

### 7.Ctrl+alt+f1到f6进入不同的字符界面终端，f7回到图形界面

停止图形界面：

```shell
sudo /etc/init.d/gdm stop
```

运行图形界面：

```shell
sudo /etc/init.d/gdm start
```



## Chapter3

### 1.更改窗口最大化最小化的位置

默认在最左边，很多Windows用户习惯于右边。

运行gconf-editor软件，配置Gnome桌面：（P50）

### 2.3D桌面切换：Compiz Fusion

### 3.浏览器：火狐＋Chrome

### 4.Bt下载软件：首选奔流和deluge

### 5.关于进程：

P(63)Init是总进程，僵尸进程，子进程，父进程，（Ｐ63）

### 6.视频播放软件的选择

首选Smplayer（P67），以及解码器（P71）的基本原理。

（软件更新太快，２０１８年回头看当时的软件，大多改版较多，所以书中凡是关于软件介绍选择评比的东西，权当了解吧）

### 7.图片处理软件F-Spot和Picasa的对比，GIMP，首选Picasa

### 8.办公软件：OpenOffice.org KOffice

翻译；星际译王

邮箱客户端：Evolution和ThunderBird



## Chapter4

### 1.wine

这是一个可以在linux系统下运行windows软件的软件，700多M。

### 2.VitrualBox虚拟机

安装虚拟机的方法（P97）。

虚拟技术（P104）VMX root operation和VMX non-root operation。



## Chapter5

醒醒，重点干货来了！！！

### 1.vim

仔细研究这篇博客，多了解vim

### 2.编译器－－gcc

用来编译c程序

内部原理：gcc cpp as ld （P110）

cpp将c预处理，将宏定义之类的东西替换回去，gcc将c文件转换为汇编代码交给as，as处理之后得到机器码交给ld，（生成的多个.o文件），ld进行链接。

命令行：

```shell
vim main.c  
#然后ｖｉｍ中写一个main.c
gcc ./main.c
./a.out
```

### 3.debug工具－－gdb

```shell
gcc -g ./main.c -o test_debug
gdb ./test_debug
```

然后你会看到

```shell
$:~/code/0.daily_code/4.example_gcc$ gdb ./test_debug 
GNU gdb (Ubuntu 7.11.1-0ubuntu1~16.5) 7.11.1
#...一大堆东西
Reading symbols from ./test_debug...done.
(gdb) 

```

输入命令并回车（所有命令http://users.ece.utexas.edu/~adnan/gdb-refcard.pdf）

r运行

list显示全部代码

b <linenum>设置断点， b+空格+行号，eg:b 5

n单步执行

p打印变量值

quit退出调试

### 4.make

#### 【第一步】多个文件编译，举例：

main.c

```c
#include <stdio.h>
#include "add.h"
int main(void)
{
 	int a=1;
 	int b=3;
 	int c;
	c=add(a,b);
 	printf("c=a+b=%d\n",c);
	return 0;
}
                               
```

add.h

```c
int add(int a,int b);
```

add.c

```c
int add(int a,int b)
{
  return a+b;
}
```

终端执行下列命令：

```shell
gcc main.c add.c -o all_in_one
./all_in_one
```

以上命令可以对一个项目的多个.c文件编译为一个程序，但这样操作整个工程都要重建，比如说你只改动了add.c，用此命令时，所有.c都要重新生成对应的.o，main.c生成main.o，add.c生成add.o

#### 【第二步】所以进行如下操作

```shell
gcc -c main.c add.c
gcc main.o add.o -o all_in_one
```

这样，先生成.o文件，如果只改动了add.c，那就只需要`gcc -c add.c`重新生成add.o即可，然后再`$:gcc main.o add.o -o all_in_one`得到最终程序。对于大程序节约编程时间。

#### 【第三步】Make登场

make用来执行Makefile，cmake用来执行CMakeLists.txt，cmake可以跨平台，学习cmake更好一点。[关于CMake：http://www.hahack.com/codes/cmake/]

Make用于稍大的工程，举例

```shell
vim Makefile
```

Makefile文件的写法：(尤其注意，凡是命令的那一行(即此处的加工方法)，前面都用tab符号开头)

```shell
目标： 原料
	加工方法
```

```makefile
all:main.o add.o
	gcc main.o add.o -o all_in_one

main.o: main.c
	gcc -c main.c

add.o: add.c add.h
	gcc -c add.c

clean:
	rm ./*.o
	rm all_in_one
	
install:
	cp ./all_in_one /usr/bin

unstall:
	rm /usr/bin/all_in_one
```

然后终端运行下列命令，就可以看到多出来几个.o文件，以及最终生成的程序。

```shell
make
```

如果想清除生成的文件：

```shell
make clean
```

安装程序到系统：

```shell
make install
```

卸载程序：

```shell
make uninstall
```

### 5.解压压缩

tar工具打包和gzip工具压缩。

### 6.Config登场（关于软件发布）

configure的作用：你的程序要与别人交流，需要先确认别人系统的环境，是不是缺东西。

configure脚本运行后，根据系统情况生成Makefile。

autoconf其实包含aclocal autoconf automake	autoscan(用来自动生成configure和makefile)

【具体操作步骤：】

[1]autoscan将c文件预处理成configure.scan，

```shell
直接autoscan？？？
```

你要手动修改configure.scan，并且别把名字改成configure.in

只有几句话有用：第二行填项目名称，版本号

第三行意思是最终的configure要检查C语言编译器是否正常

```shell
????这么多年了是否有改变??
AC_INIT(main.c)
AM_INIT_AUTOMAKE(all_in_one,1.0)
AC_PROG_CC
AC_OUTPUT(Makefile)
```

[2]aclocal根据configure.in生成aclocal.m4

```
？？？？这个地方说是需要一个.ac文件
```

[3]autoconf将configure.in aclocal.m4 生成configure脚本

```
？？？？具体实现
```

[4]你要先写个草稿叫做Makefile.am，

Makefile.am的写法

```shell
AUTOMAKE_OPTIONS=foreign
bin_PROGRAMS=all_in_one
all_in_one_SOURCES=main.c add.c
```

然后用automake将Makefile.am生成Makefile.in

```shell
？？
```

需要的东西就备齐了：configure脚本和Makefile.in

把这一包东西压缩到一起，发给用户，拿到软件包之后，即可安装：

```shell
./configure
make
make install
```

`$:./configure`的时候如果别人的系统不缺东西就可以生成Makefie。

## Chapter6

### 1.shell

打开终端，查看默认shell程序：

```shell
cat /etc/passwd
```

will❌1000:1000:William Yu,,,:/home/will:/bin/bash就是指默认shell是bash shell.

基本原理：bash查看用户输入字符是不是关键字，如果是就给bash处理，如果不是，bash就去环境变量里面查找这程序。环境变量PATH，查看环境变量的路径：

```shell
echo $PATH
```

### 2.man指令：

man 其他指令：用于查看指令的使用说明。

### 3.ifconfig指令

用于修改IP地址以及mac地址，但是重启之后又会失效.

### 4.cd命令

搞清楚相对路径和绝对路径

### 5.pwd命令

查看当前路径

### 6.iwconfig命令

### 7.tab自动补全

此处需要介绍一个叫做thefuck的工具，手感非常棒的一个纠错小公举>_<尽管名字及其粗暴。

### 8.less和more

```shell
执行ifconfig|more命令，|叫做管道符。可以从第一页开始翻看直到最后一页退出

执行ifconfig|less命令，翻前翻后的看
```

【这里注意：linux命令的一个哲学：每个程序只完成一个小功能，并把它做好。避免重复开发同样的功能，所以Windows系统就逊色不少】

### 9.通配符

*可以代替所有东西。

*.jpg可以把所有.jpg后缀的东西拿出来。

通配符前加一个\，就表示*就是个普通字符，文件名就叫**.jpg。

# OVER