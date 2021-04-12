# Git Repository Release



[toc]

---

Created 2021.03.24 by William Yu; Last modified: 2021.04.02-V1.0.e

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 WilliamYu. Some rights reserved.

---

## Basic Concept

### Branch

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

### Releases & Tags

- 定版打包发布内容



---



## Release Process

### Basic Release Process

#### Step 1. checkout release branch

- 由develop 抻 release branch
- release 编号 如1.2， 1.5，通常单号内侧，双号发布
  - 单号内测
  - 双号发布
- release上版本号根据需要修改为单号

```shell
# pull最新的develop
git checout develop
git pull

# 由develop抻release
git checkout -b Release/<version>
```

#### Step 2. pr to master

- 在github上面提pr到master，先挂着不合并


#### Step 3. bugfix to release

- 针对release测试中反馈的bug，尽快修复

```shell
# pull最新的Release
git checkout Release/<ver>
git pull

# 由Release抻bugfix branch
git checkout -b bugfix/
```

- 修完bug之后，提pr到release

- 如有冲突，解决冲突，commit

- 等待其他开发人员review

- merge到release branch

-  **重要bug**

  - 对于重要bug需同时提pr合并到release和develop，**注意**不要引入bugfix外的其他修改

  - Tips: 使用以下方式获得可以同时向两端合并的bugfix分支

    ```shell
    # 获得共同父结点
    git merge-base develop Release/<ver>
    # 抻出bugfix分支，commit为上述命令的结果
    git checkout -b bugfix/<sth> <commit>
    ```

#### Step 4. update version

- 等release中的bug都已基本解决，开始定版

- 更新代码 config 中的 version信息，然后commit并push

  ```shell
  git checkout Release/<ver>
  git pull
  ```

  修改config

  ```shell
  git commit -m "update version 1.6"
  git push
  ```

- 待编译check通过后，合并到master（**选择普通合并Merge Pull Request**），close pr

#### Step 5. tag

- 打tag
  - 切换到master分支并更新
  - 打tag并push

```shell
# pull 最新的master
git checkout master
git pull
# 打tag
git tag <tag_name>
git push origin <tag_name>
```

#### Step 6. edit tag info 

- 到github上直接编辑上述tag



- 上传该tag的打包，并填写md5
- md5 

```shell
# 由文件生成md5
md5sum <file_name>
```

- 并填写 change log，根据历史commit 总结一份change log

```shell
# 查看历史tag
git tag -l

# 查看上一版至今所有的commit
git log --graph --decorate --first-parent <上一个tag名称>..HEAD
# 总结所有commit内容编写change log
```

#### Step 7. pr back to develop

- **由此时间点开始，该release branch将不再有效**
- 将release branch 提 pr 合并回 develop
  - 如仍有其他进行中的release branch，需合并到进行中的release branch，而非develop
  - 优先级：**其他进行中的release branch > develop**
  - e.g. 预计同期发布两个产品Release/Ch_v2.6.0和Release/En_v2.4.0
    - Release/En_v2.4已经定完版，理应合并回develop，此时发现尚有未定完版的Ch_v2.6，则应提pr合并到Release/Ch_v2.6
- 如有冲突，解决冲突，再commit
- 待编译check通过之后，merge到develop（**必须选择普通合并Merge Pull Request**）



### Hotfix Process

#### Step 1. bugfix

- 定版发布之后，如果发现重大bug，需立即hotfix
- **由master** 抻 hotfix branch

```shell
git checkout -b hotfix/<ch_2.6.1>
```

- 修完bug之后提pr到master
- 并且记得也要提pr到develop
- review之后merge

#### Step 2. release

- 再次打tag
  - tag名称，如：上一版为v2.4.0， 则hotfix一版之后打tag为 Lucy_v2.4.1
  
- 填写change log
- 结束



















---

图示：

<img src="http://windmillyu.top/static/img/test.png" alt="Screenshot from 2021-03-24 14-29-20" style="zoom:70%;"/>

---

