---
layout: post
title: "Tmux教程——打造完美的Linux shell终端"
subtitle: "shell优化工具：功能强大的工具有很多。但是只有自己亲手打造的，才是最适合自己的。"
categories: [Linux]
tags: [Linux, tmux]
redirect_from:
  - /2018/02/07/
---

> 功能强大的工具有很多。但是只有自己亲手打造的，才是最适合自己的。


* Kramdown table of contents
{:toc .toc}


# Tmux教程——打造完美的Linux终端

------

##### 前言

src：[https://lukaszwrobel.pl/blog/tmux-tutorial-split-terminal-windows-easily/](https://lukaszwrobel.pl/blog/tmux-tutorial-split-terminal-windows-easily/)

译者：WilliamYu-2018.02.07

Copyright © 2018 本文遵从创作公用约定（署名-非商业作品-保持一致）条款，欢迎转载、散布，但希望附带本条并注明出处。 

翻译不足之处，万望指正，邮箱windmillyucong@163.com

参考：

1.[http://blog.csdn.net/gatieme/article/details/49301037](http://blog.csdn.net/gatieme/article/details/49301037)

2.[http://cenalulu.github.io/linux/professional-tmux-skills/](http://cenalulu.github.io/linux/professional-tmux-skills/)

------

## Terminal and Terminator

很久以前我就意识到我工作的绝大部分都是在Linux的命令终端下完成的。这也是为什么我一直关注shell和GUN工具方面的信息，毕竟对这些工具有足够的了解，你就已经成功了一半。

于是乎，我总觉得只有一个命令终端窗口是远远不够的。即便我可以开很多个窗口（以Linux终端下多个标签页或Putty里的多个实例为代表）来解决这个麻烦，但我依旧十分渴求能一次性将所有窗口尽收眼底。比如，我们可能想编辑代码或测试的同时用tail命令查看log日志。

Terminator似乎是一个非常棒的解决办法于我而言。安装简单并且确实确实如我所想——它可以将终端窗口分割为水平或纵向，依照用户的指令。它也允许打开多个标签以防分割出一个窗口不够用。它的重要缺点在于Terminator是一个GUI工具，所以如果X服务并没有运行的话它就无法运行。

运行中的Terminator
![](https://lukaszwrobel.pl/images/blog/tmux/terminator.png)

当然，值得一提的还有*screen*工具，但是某种程度上我总觉得它有些难以理解。我曾经用它在后台运行任务并且避免由于和远程机器丢失联系造成的错误。但是我从没有勇敢到把我的终端和面板交给screen来掌管。我已经满足于Terminator了，但是有一天我遇到了tmux。

Tmux位于*Terminator* 和 *screen*之间，既简单易用且只基于朴素的终端。[?]（combining ease of use with basing on the plain terminal only.）这是它相对于Terminator的一些优势：

- 可移植性 — tmux可以在任何系统上操作平凡，老旧的终端。
- 脚本支持 — tmux支持脚本，所以建立窗口或者标签只不过是一两个按键的事情。
- 服务-主机 结构 — tmux 可以用于不同用户间分享会话。
- 调整和设置 — tmux 和 Terminator都有良好的用户界面， 但是只有tmux让我们走的更远并且提供广阔的自定义配置，哪里不爽改哪里。

------





## Beginning with tmux

这是个tmux会话的外观：
![](https://lukaszwrobel.pl/images/blog/tmux/tmux.png)

阅读完这一部分，你将熟悉如何运用tmux将终端窗口分割成不同的标签，并且知道如何运用多重窗口。这可以让你完成90%的工作。

你应该知道的第一件事就是***Ctrl+b***是tmux的默认前缀。*（译者注：当然，觉得Ctrl+b不好用，也可以随意改，想要什么自己造，开源的魅力所在。^_^）*这就是说，运行任何是要对tmux操作的指令，你就需要先按下这个前缀。估计你也猜到了，这是为了避免和终端里面运行的其他软件的快捷键组合相冲突。

这是部分基本的tmux快捷键列表：

- ***`Ctrl+b "`*** — 水平分割标签。
- ***`Ctrl+b %`*** — 竖直分割标签。
- ***`Ctrl+b`*** 方向键 — 选择标签。
- ***`按住 Ctrl+b不放，并且按方向键`*** — 调整标签大小。
- ***`Ctrl+b c`*** — 创建 (c)reate 一个新窗口。
- ***`Ctrl+b n`*** — 转到下一个 (n)ext 窗口。
- ***`Ctrl+b p`*** — 转到之前的 (p)revious 窗口。

其他的值得一提的是按***`Ctrl+b   PgUp / PgDown`*** 支持滚动翻页。事实上它也支持使用***`Ctrl+b  [`*** 进入复制模式。在复制模试下，你可以使用PgUp / PgDown和方向键来翻阅命令行里的内容。按q键，可以退出复制模试。

应该都会起作用的，至少，大部分都可以获得理想的结果（ do the trick）。

------



## Adjusting tmux

开始大刀阔斧地改造tmux，让她更适合自己吧。你的tmux配置文件应该命名为 *.tmux.conf*  并且放置在你的home目录下。

*（译者注：这个文件需要你自己创建，一开始是没有的，至于这个目录，就是命令行终端运行命令     `cd ~`      所去的目录，.开头的必然是隐藏文件，ls不出来。*

*所以你应该做的是:*

```shell
cd ~
vim .tmux.conf
```

*至于这个文件里面写些什么，附带一个优秀的例子http://blog.csdn.net/gatieme/article/details/49301037。）*

这是个常规的文本文件，并且是定制tmux的关键。

但是你需要记住，每次修改完成后，tmux必须要刷新来加载新的设置，你既可以关掉tmux重新打开也可以输入命令

```shell
tmux source-file .tmux.conf
```

让我们用一个简单地例子来改造 *.tmux.conf*  文件。

### 【1】更改前缀

就像我们之前讲过的，tmux必须使用前缀来区分命令是发给tmux本身的还是发给tmux内部运行的程序的。默认的前缀（`Ctrl + b`）非常不顺手，我们尝试使用`Ctrl + a`来代替它，`Ctrl + a`比原来的要好用一些（毕竟，a比b距离Ctrl要更近一些）并且由来已久（*time-honored*），因为screen工具已经使用这种方式很长一段时间可。为了更改这个前缀，我们需要在*.tmux.conf* 文件里面写入：

```shell
unbind C-b
set -g prefix C-a
```

我觉得这些指令完全都是不言自明的（*self-explanatory*）。首先我们去掉默认前缀，然后设置一个新的。无需多说。

### 【2】Alt+方向键选择标签

对于标签选择，`Alt + 方向键`的按键组合（在Terminator里这是默认设置）对我而言十分好用并且到目前为止没有造成任何冲突，所以我觉得这种设置在tmux里也必然表现不凡。但是这当然只是个个人习惯问题，你可以使用任何按键组合，只要你喜欢。你可以使用这些命令来用Alt选择标签：

```shell
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R
bind -n M-Up select-pane -U
bind -n M-Down select-pane -D
```

确保你没有在Terminator里面运行tmux，因为Terminator会截获`Alt + 方向键`以致于tmux里的标签选择会不起作用。

### 【3】活动监听

如果你开了多个窗口，可能想当别的窗口发生什么的时候你能收到通知。粘贴这段命令：

```shell
setw -g monitor-activity on
set -g visual-activity on
```

到.tmux.conf文件可以使tmux打印一段信息并且高亮显示发生活动的窗口。

### 【4】用指定的颜色高亮显示当前窗口

粘贴这段命令：

```shell
set-window-option -g window-status-current-bg yellowsetw -g monitor-activity on
```

到.tmux.conf文件可以使tmux用黄色高亮显示当前窗口。你也可以用“black”, “red”, “green”, “blue”, “magenta”, “cyan” 以及“white” 中的一个，或者直接写 “colour\d+“,例如： “colour5”或者 “colour170”，这些是用来给标签定制一个颜色。

### 【5】使用鼠标选择标签

为了让习惯于Terminator的使用者容易得切换到tmux，你可以定制tmux的配置文件让你可以用鼠标选择标签：

```shell
set-option -g mouse-select-pane on
```

当然，这可能会被认为是个非常不良好的行为，因为tmux本身就是为了完全脱离鼠标来提高生产效率。

### 【6】.bashrc 问题

我不了解你的习惯，但是我喜欢在rc文件（对Bash shell而言即*.bashrc* ）里面保留一些调整工具。但是对于tmux而言，*.bashrc* 文件压根儿不可读。经过一些检查，我发现tmux尝试读取*.bash_profile*而不是 *.bashrc*。在这里，我不打算提及一些这方面的规则，应为这确实有点复杂。取而代之，我会展示一个变通方案，加入这一行：

```shell
set-option -g mouse-select-pane on
```

到*.bash_profile*可以解决这个问题。

------



## Advanced Capabilities of tmux

### 【1】tmux脚本

每次使用tmux的时候我喜欢的标签布局基本上都一样，当然这也取决于在执行的任务。比如说，做一个项目的时候可能需要一个标签来显示源代码，第二个标签运行测试，以及第三个标签tail来及时查看日志。设置三个标签是个非常棒的例子。所以毫无疑问，tmux里都可以自动完成：

```shell
selectp -t 0 # 选择第一个标签
splitw -h -p 50 # 分割成两半

selectp -t 1 # 选择第二个标签
splitw -v -p 50 #  分割成两半
selectp -t 0 # 返回第一个标签
```

这些命令要保存在单独的文件夹里面，比如：*.tmux/dev*，为了能运行它们，你要在*.tmux.conf* 文件里面调用它：

```shell
bind D source-file ~/.tmux/dev
```

从现在开始，按下前缀`Ctrl + b`,然后按D（在这个例子里面要大写）就可以执行 *.tmux/dev*里面的命令。

值得一提的是这种脚本文件可以做的不仅是打开标签，你也可以在里面预置运行命令，例如：

```shell
splitw -h -p 50 'vim' #分割现在的标签，并同时在新标签里面运行vim
```

建立你自己的脚本文件花不了多少精力，但是你会大大获益。

### 【2】会话共享

至此所讲，都只是局限于一个用户的会话。就像*screen* 允许共享会话，tmux也不差。并且设置起来也十分简单。

要在一台机器上共享会话，你必然需要把会话周期里要用到的的Unix端口号的路径给tmux：

```shell
tmux -S /tmp/our_socket
```

然后要给其他用户新建文件的入口：

```shell
chmod 777 /tmp/our_socket
```

当一个新用户想要加入会话，那就必须要经过端口路径，所以tmux知道哪个会话会被用到：

```shell
tmux -S /tmp/our_socket attach
```

注意万不得已不要将权限设置为777，除非你完全相信你的合作者。你也可以考虑一些更复杂的入口控制，SSH转发或者尝试一下[wemux](https://github.com/zolrath/)。wemux是一套使分享会话更简单明了的脚本。

------



## Summary

Tmux并不是个重大突破，事实上我估计它也从没想着去做突破。然而，它确实是个很新奇的东西让我能够方便地使用多个终端。自从我觉得在tmux的帮助下我的工作效率大大提高之后，我觉得我已经离不开她了。

------







2018.02.07 copyleft! WilliamYu  转载请保留此字段。

