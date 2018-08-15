---
layout: post
title: "scripts"
description: "脚本编程"
categories: [scripts]
tags: [code,linux,scripts]
redirect_from:
  - /2018/08/14/
---

>  A script to push blog pictures to github.

* Kramdown table of contents
{:toc .toc}
# md博客截图上传云服务器脚本　blogimgshot.sh

Created 2018.08.10 by William Yu; Last modified: 2018.08.1５-V1.0.６

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2018 William Yu. Some rights reserved.

-----

![180815-22:07:51.png](https://github.com/YuYuCong/BlogImg/blob/master/180815-22:07:51.png?raw=true)

## 问题描述

博客文件中需要插入截图图片时使用。本地写Markdown文本时，会出现需要截图，并将截图插入md文件的情况，然而考虑到typora使用记录路径载入图片的方法，所以如果需要上传md文件到博客，或者发送md文件给别人时，图片并不能一同发送，于是路径更改造成图片丢失。

## 解决方案

一个相对合理的解决方案是在本地建立一个文件夹存放图片，在网络端github上建立一个项目专门存放会在远端使用的图片。然后配置好脚本。于是当需要在md文件中要使用截图时，运行脚本，完成截图/复制进本地项目文件夹/上传github/并返回图片链接到剪切板，然后在md文件中粘贴图片链接即可。

## 功能描述

OS：Ubuntu1604

Requirements：截图工具shutter + 交互脚本expect + 剪贴板管理工具xsel

实现：运行脚本，脚本调用shutter截图，并将截图复制进指定的存放博客图片的本地文件夹，如果没有则创建，并初始化为git本地仓库，然后使用expect交互自动填写账户密码，上传github，并返回图片链接到系统粘贴板。第一次运行脚本时会创建~/Pictures/blogimg文件夹并将其初始化为git仓库。第一次运行脚本时，会将此脚本复制进~/bin文件夹，确保该文件夹已经被添加进了环境变量，以方便在任意路径下可以调用此脚本。

## Usage

##### 配置

```shell
#在你的github创建博客图片远程仓库

$ sudo apt-get update
#安装shutter
$ sudo apt-get install shutter
#安装expect
$ sudo apt-get install except
#安装xsel
$ sudo apt-get install xsel

#获取脚本
$ git clone https://github.com/YuYuCong/Scripts.git
$ cd ./Scripts/shell/

#配置脚本 Add your github username and password and branch url to script in  line 2,3,4 

#检查环境变量，是否包含路径 ~/bin 或者 /home/你的用户名/bin
$ echo $PATH

$ chmod +x ./blogimgshot.sh
$ ./blogimgshot.sh
```

##### 使用 (可以在任意路径下运行)

```shell
$ blogimgshot.sh
```

## Code

```shell
#!/bin/bash

github_repositories_url='https://github.com/YuYuCong/BlogImg.git'
github_user='YuYuCong'
github_pwd='不告诉你'

if [ ! -d ~/bin ];then
    mkdir ~/bin
fi

if [ ! -f ~/bin/blogimgshot.sh ];then
cp -r blogimgshot.sh ~/bin
fi

if [ ! -d ~/Pictures/blogimg ]; then
    mkdir ~/Pictures/blogimg
fi

cd ~/Pictures/blogimg

if [ ! -d ./.git ];then
    git init
    git remote add origin $github_repositories_url
fi

shutter -s -e -o '~/Pictures/blogimg/%y%m%d-%T.png'

filename=`ls -t |awk 'NR==1 {print $NF}'`
imgurl=${github_repositories_url%.git}/blob/master/${filename}
echo $imgurl |xsel -i -b

git add -A
git commit -m "addimg"

/usr/bin/expect <<EOF
set timeout 20
spawn git push -u origin master
expect "Username" 
send "$github_user\r"
expect "Password" 
send "$github_pwd\r"
expect "set up"
spawn echo "Done!"
EOF
```

## Improve 改进

- [x] 完成图片链接返回
- [ ] 完成交互中步骤查错

## Changelog 更新记录

blogimgshot.sh_v1.0.0_2018.08.14



## References

- https://www.cnblogs.com/stefanking/articles/5061390.html
- https://blog.csdn.net/DuinoDu/article/details/54836890
- https://www.jb51.net/article/62349.htm
- https://blog.csdn.net/lufubo/article/details/7627393
- 字符串截取 https://blog.csdn.net/lizhidefengzi/article/details/76762059
- xsel使用https://blog.csdn.net/diamondxiao/article/details/53428204
- https://www.jianshu.com/p/83a22e1eda6a



## Further reading

### except

##### expect使用说明书

https://blog.csdn.net/jacky0922/article/details/45071817

##### expect的安装

https://www.cnblogs.com/kevingrace/p/5900303.html

```shell
下载解压
sudo su
sudo cp -r expect-5.43 /usr/local/src
sudo cp -r tcl8.4.11 /usr/local/src

（1）解压tcl，进入tcl解压目录，然后进入unix目录进行编译安装

[root@xw4 src]# tar -zvxf tcl8.4.11-src.tar.gz
[root@xw4 src]# cd tcl8.4.11/unix
[root@xw4 unix]# sudo ./configure
[root@xw4 unix]# make && make install

注意这里./configure报错
报错信息
​```shell
./configure: 1: ./configure: Syntax error: Unterminated quoted string
​```
tc报错解决方案
https://www.cnblogs.com/liuxiaoke/p/3488616.html
后来上述方法无效！
解决方案最终发现直接运行这一条命令安装即可——`sudo apt-get install except`


（2）安装expect

[root@xw4 src]# tar -zvxf expect-5.43.0.tar.gz
[root@xw4 src]# cd expect-5.43.0
[root@xw4 expect-5.43.0]# ./configure --with-tclinclude=/usr/local/src/tcl8.4.11/generic --with-tclconfig=/usr/local/lib/
[root@xw4 expect-5.43.0]# make && make instal


(3)安装完成后进行测试

[root@xw4 ~]# expect
expect1.1> 
安装成功
```

##### 问题描述

测试已经成功，但是脚本无法找到

报错：`/bin/expect: no such file or directory`

##### 问题分析

找错了expect的安装路径

脚本第一行错误写成了写的是`#!/bin/expect`

##### 解决方案

#####【小笔记】-`whereis`命令

使用where名字查找安装路径`$ whereis expect`

----



### shutter

##### shutter安装

https://blog.csdn.net/u014577061/article/details/79129976

##### shutter - Linux man page

User Contributed Perl Documentation

NAME

```
   Shutter - Feature-rich Screenshot Tool
```

SYNOPSIS

```
   shutter [options]
```

COPYRIGHT

```
   Shutter is Copyright (C) by Mario Kemper and Shutter Team
```

DESCRIPTION

```
   Shutter is a feature-rich screenshot program. You can take a screenshot of a specific area,
   window, your whole screen, or even of a website - apply different effects to it, draw on it
   to highlight points, and then upload to an image hosting site, all within one window.
```

OPTIONS

```
   Example 1
           shutter -a -p=myprofile --min_at_startup

   Example 2
           shutter -s=100,100,300,300 -e

   Example 3
           shutter --window=.*firefox.*

   Example 4
           shutter --web=http://shutter-project.org/ -e

```

   CAPTURE MODE OPTIONS

```
   -s, --select=[X,Y,WIDTH,HEIGHT]
           Capture an area of the screen. Providing X,Y,WIDTH,HEIGHT is optional.

   -f, --full
           Capture the entire screen.

   -w, --window=[NAME_PATTERN]
           Select a window to capture. Providing a NAME_PATTERN (Perl-style regex) ist
           optional.

   -a, --active
           Capture the current active window.

   --section
           Capture a section. You will be able to select any child window by moving the mouse
           over it.

   -m, --menu
           Capture a menu.

   -t, --tooltip
           Capture a tooltip.

   --web=[URL]
           Capture a webpage. Providing an URL ist optional.

   -r, --redo
           Redo last screenshot.

```

   SETTINGS OPTIONS

```
   -p, --profile=NAME
           Load a specific profile on startup.

   -o, --output=FILENAME
           Specify a filename to save the screenshot to (overwrites any profile-related
           setting).

           Supported image formats: You can save to any popular image format (e.g. jpeg, png,
           gif, bmp). Additionally it is possible to save to pdf, ps or svg.

           Please note: There are several wildcards available, like

            %Y = year
            %m = month
            %d = day
            %T = time
            $w = width
            $h = height
            $name = multi-purpose (e.g. window title)
            $nb_name = like $name but without blanks in resulting strings
            $profile = name of current profile
            $R = random char (e.g. $RRRR = ag4r)
            %NN = counter

           The string is interpretted by strftime. See "man strftime" for more examples.

           As an example: shutter -f -e -o './%y-%m-%d_$w_$h.png' would create a file named
           '11-10-28_1280_800.png' in the current directory.

   -d, --delay=SECONDS
           Wait n seconds before taking a screenshot.

   -c, --include_cursor
           Include cursor when taking a screenshot.

   -C, --remove_cursor
           Remove cursor when taking a screenshot.

```

   APPLICATION OPTIONS

```
   -h, --help
           Prints a brief help message and exits.

   -v, --version
           Prints version information.

   --debug Prints a lot of debugging information to STDOUT.

   --clear_cache
           Clears cache, e.g. installed plugins, at startup.

   --min_at_startup
           Starts Shutter minimized to tray.

   --disable_systray
           Disables systray icon.

   -e, --exit_after_capture
           Exit after the first capture has been made. This is useful when using Shutter in
           scripts.

   -n, --no_session
           Do not add the screenshot to the session. This is useful when using Shutter in
           scripts.

```

BUG REPORTS

```
   If you find a bug in Shutter, you should report it.  But first, you should make sure that it
   really is a bug, and that it appears in the latest version of Shutter.

   The latest version is always available from: https://launchpad.net/shutter

   Once you have determined that a bug actually exists, please report it at launchpad:
   https://bugs.launchpad.net/shutter/+filebug

```

perl v5.14.2                                 2013-08-25                                  SHUTTER(1)

-----



## xsel

xsel - Linux man page

http://manpages.ubuntu.com/manpages/xenial/en/man1/xsel.1x.html

-----



## Contributing / Contact

I'm far from being a script programmer and suspect there are many ways to improve - Have anything in mind that you think would make this script better?  Don't hesitate to fork and send pull requests!  Feel free to contact me anytime for anything.

-----



## License

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)

