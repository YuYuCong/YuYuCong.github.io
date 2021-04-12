---
layout: post
title: "git 笔记"
description: "git 使用笔记"
categories: [linux]
tags: [code,git,linux]
redirect_from:
  - /2020/07/09/
---

[TOC]

# git 笔记

Created 2020.07.09 by William Yu; Last modified: 2020.09.06-V1.0.6

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 William Yu. Some rights reserved.

---

<p style="font-size:26px;color:;text-align:left;">References</p> 

- https://blog.csdn.net/zyw0713/article/details/80083431?utm_medium=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase
- https://blog.csdn.net/qq_43461877/article/details/106826294
- https://my.oschina.net/nyankosama/blog/270546
- https://segmentfault.com/a/1190000008209343

## ch1. 基本使用

### git 基本流程

```shell
git clone
git checkout develop
git checkout -b Feature/*** develop
git add .
git commit -m ""
git push <远程主机名> <本地分支名>:<远程分支名>
git push origin Feature/***:Feature/***
开发完之后去github提pull request
```

### git 添加公匙

- https://blog.csdn.net/lk142500/article/details/80358941

### git 清理工作空间

pull失败的时候需要清理：

```shell
git clean -d -f
git checkout .
git reset --hard HEAD
```

### git LFS 大文件管理

安装

```shell
sudo apt-get install git-fls
```

使用

```shell
git fls fetch
git fls pull
```

### git branch

###### 创建branch

```shell
git branch <branch_name>
```

由某个commit创建branch

```shell
git checkout -b <branch_name>
```

###### 查看所有branch

```shell
git branch
```

###### 更改branch name

- https://www.jianshu.com/p/cc740394faf5

```shell
git branch -m <old_branch_name> <new_branch_name>
```

###### 删除branch

```shell
git branch -d <branch_name>
```

###### 删除远程分支

```shell
git push --delete origin feature/auto_ota
```

###　git rebase 

//todo(congyu)

##### 合并多个commit到一个commit

- https://www.jianshu.com/p/964de879904a

##### 合并不相邻的commit到一个commit

- http://www.d2p.top/2019/12/23/git-rebase-i/

##### git rebase 的回退

1. 如果git rebase 尚未成功，如何回退：

```cpp
git rebase不成功可以git rebase --abort取消,
```

2. git rebase 已经成功，如何回退：

```shell
git reflog
```

```shell
1f5e1d0 HEAD@{0}: rebase finished: returning to refs/heads/Feature/monitor_lucy
1f5e1d0 HEAD@{2}: rebase: frame rotate after undistort
52d0e2b HEAD@{3}: rebase: checkout develop
fd241e1 HEAD@{4}: reset: moving to fd241e1
6f045f9 HEAD@{5}: checkout: moving from 1cf2218506db4a0a7c5824f2a9020a84f84c8944 to Feature/monitor_lucy
查看rebase之前的ID为fd241e1，reset回去即可
```

```shell
git reset --hard fd241e1
```

### git merge

##### merge 其他branch

一般情况下是直接将feature_dev merge到feature，

``` shell
git checkout feature
git merge feature_dev
```

##### 只merge文件改动到暂存区域

上述方法会将dev当中的所有commit复制到feature，如果只希望merge改动，而不commit，可以使用squash

相当于添加了所有的改动到暂存区，需要手动commit

```shell
git merge --squash feature_dev
然后编辑之后再commit即可
```

##### 回退merge

```shell
git relog 查看merge前的版本号
git reset --hard [merge前的版本号]  版本号是前面7个字符就可以了
```

##### merge 一部分 commit

如果只希望merge其他branch的一部分commit，使用 cherry-pick

```shell
先去要被merge的branch，查看commit id
git log
然后checkout到要merge进的branch，
git cherry-pick [commit-id] 即可
```

### git stash

- https://zhuanlan.zhihu.com/p/33435204

```shell
git stash save
git stash list
git stash apply
git stash pop
git stash show
git stash branch <name>
git stash clear 清空所有stash
git stash drop
```

```shell
git stash list 
git stash
git stash pop 弹出最上面的stash
git stash pop stash@\{1\} 选择特定的stash弹出
```

### git push

如果本地新建了一个分支 branch_name，但是在远程没有。

这时候 push 和 pull 指令就无法确定该跟踪谁，一般来说我们都会使其跟踪远程同名分支，所以可以利用 git push --set-upstream origin branch_name ，这样就可以自动在远程创建一个 branch_name 分支，然后本地分支会 track 该分支。后面再对该分支使用 push 和 pull 就自动同步。

```shell
git push --set-upstream origin branch_name
```

### git  从其它分支提取文件

files_name可以使用相对路径

```shell
git checkout [branch] -- [file name] 
```

### git 删除commit

#### 回退版本

```shell
git reset --hard commit-id
```

将HEAD所在分支回退到之前版本

### git 更改历史 commit

git 更改历史commit的注释

- https://segmentfault.com/a/1190000022926064

### git log

Git查看历史commit记录

### git diff 查看差异

```shell
git diff [branch]或者[commit-id]
```

### git submodule

git 子模块的工作方式

https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97

```shell
git submodule init
git submodule update
```

### git 远程工作

由远程仓库创建一个本地仓库

```shell
git checkout -b feature/multiple_maps_save_load origin/feature/improve_map_management
```

本地工作commit之后push(在此之前应该先fetch然后解决分歧)

```shell
git push origin HEAD:feature/improve_map_management 
```



## ch2. git 项目开发流程

### basic concept

#### branch

- git项目主要包括两个分支：master和develop。其他分支比如release，fixbug、feature之类

- master (or main)
  - 一个
  - 经过多次测试与bugfix，最稳定的branch
- develop
  - 一个
  - 日常开发
- release
  - 多个
  - 每次定版时，由develop抻一个release branch，然后在release branch基础上修bug，稳定后合并到master，并合回develop
- feature/... 
  - 多个
  - 日常开发，由develop抻出，开发完成后，再合回develop
- bugfix/... 
  - 多个
  - 日常修bug
- improve/...
  - 对之前已经merge的feature的优化与更新
- hotfix/...  
  - 多个
  - 由master抻出来，修bug，然后合并到master和develop
- others 多个
  - unittest/
    - unit test开发
  - demo/
    - 用于demo的临时branch

#### Process

- 确定开发新的feature之后 从develop branch checkout -b 一个新的分支出来，然后开发
- 完成后push到同名远程仓库
- 然后去github提交pr，申请review
- 对于review批阅需要更改的地方，在本地修改，然后commit，push
- 再次review，被approve之后，在github点merge即可

```shell
git pull
git checkout -b feature
git commit -m "msg"
git push

然后在github提pr
```



## 其他

##### 可视化Tool

- GitKraken: git GUI tool

##### github访问网速慢：用代理

- https://blog.csdn.net/yh0503/article/details/90233216?utm_medium=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.nonecase

- 在命令行中使用代理

  复制http代理设置

  然后在命令行中粘贴即可

