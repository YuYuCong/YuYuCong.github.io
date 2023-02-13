---
layout: post
title: "c++ coding style"
subtitle: "c++代码风格规范，以及一些良好的代码习惯建议"
categories: [c++]
tags: [c++]
header-img: "img/in-post/post-cpp/bg_code_style.png"
redirect_from:
  - /20220/07/27/

---

>  本文主要记录c++ coding style相关的一些笔记，以及一些常用的代码建议与小技巧。尽力将自己写的代码视作一件艺术品，是技术与艺术的结合体。

* Kramdown table of contents
{:toc .toc}

---

Created 2020.07.27 by Cong Yu; Last modified: 2020.07.27-v1.0.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 Cong Yu. Some rights reserved.

---

# c++ coding style

## Google style

- github [https://github.com/zh-google-styleguide/zh-google-styleguide](https://github.com/zh-google-styleguide/zh-google-styleguide)
- doc [https://zh-google-styleguide.readthedocs.io/en/latest/google-cpp-styleguide/naming/#general-naming-rules](https://github.com/zh-google-styleguide/zh-google-styleguide)

以下摘录比较主要的几个：

### 1. 命名约定

- 涉及函数命名, 变量命名, 文件命名
- 命名要有描述性，少用缩写
- 不要用只有项目开发者能理解的缩写, 也不要通过砍掉几个字母来缩写单词
- 让代码易于新读者理解很重要
- 简单总结就是：
  - 函数名：驼峰
  - 变量名：全小写+下划线
  - 类变量/static变量：附加下划线结尾
  - 常量：k开头的驼峰
  - 宏变量：全大写+下划线


#### 1.1 常量命名

- 一定要多用const constexpr
- constexpr表示编译期其数值已确定

- 以"k"开头
- 大小写混合

```c++
constexpr int kDefaultDaysLimit = 7; // 好
const int kDaysLimit = config.get<int>("days_limit"); // 好
```

#### 1.2 变量命名

- 变量（包括函数参数）和数据成员名一律小写
- 单词之间用下划线连接
- 类的成员变量以下划线结尾，但是结构体的不用

##### 普通变量

```c++
string table_name;  // 好 - 用下划线.
string tablename;   // 好 - 全小写.

string tableName;  // 差 - 混合大小写
```

##### 全局变量

所有具有静态存储类型的变量 (例如静态变量或全局变量, 参见 [存储类型](http://en.cppreference.com/w/cpp/language/storage_duration#Storage_duration)) 都应当按照常量的命名方式命名. 对于其他存储类型的变量, 如自动变量等, 这条规则是可选的. 如果不采用这条规则, 就按照一般的变量命名规则.

##### 类数据成员

不管是静态的还是非静态的, 类数据成员都可以和普通变量一样都用小写, 但要在最后面接下划线.

```c++
class TableInfo {
  ...
 private:
  string table_name_;  // 好 - 后加下划线.
  string tablename_;   // 好.
  static Pool<TableInfo>* pool_;  // 好.
};
```

##### 结构体数据成员

不管是静态的还是非静态的, 结构体数据成员都可以和普通变量一样, 不用像类那样接下划线:

```c++
struct UrlTableProperties {
  string name;
  int num_entries;
  static Pool<UrlTableProperties>* pool;
};
```

##### 补充：结构体 vs. 类

- Q 什么时候建议使用class, 什么时候使用struct ?
- A 结构体与类的使用讨论, 参考 [结构体 vs. 类](https://zh-google-styleguide.readthedocs.io/en/latest/google-cpp-styleguide/classes/#structs-vs-classes) 
  - 仅当只有数据成员时使用 `struct`, 其它一概使用 `class`.


#### 1.3 函数命名

- 常规函数使用大小写混合
- 取值和设值函数则要求与变量名匹配
- 函数名的每个单词首字母大写（“驼峰命名” 或 “帕斯卡命名”）
- 没有下划线
- 对于由首字母缩写构成的词汇, 更倾向于将它们视作一个单词进行首字母大写
  - 例如, 写作 `StartCpu()` 而非 `StartCPU()`

```c++
AddTableEntry()
DeleteUrl()
OpenFileOrDie()
```

- 函数名要表意清晰且准确

```c++
void AdditionalThread(); // bad
void DownloadThread(); //good
```

- (同样的命名规则同时适用于类作用域与命名空间作用域的常量, 因为它们是作为 API 的一部分暴露对外的, 因此应当让它们看起来像是一个函数, 因为在这时, 它们实际上是一个对象而非函数的这一事实对外不过是一个无关紧要的实现细节.)
- 取值和设值函数的命名与变量一致
  - 一般来说它们的名称与实际的成员变量对应, 但并不强制要求
  - 例如 `int count()` 与 `void set_count(int count)`

### 2. 函数

// todo(congyu)

### 3. 类

// todo(congyu)

### 4. 作用域

// todo(congyu)

### 5. 头文件

// todo(congyu)

### 6. 格式

- 每个人都可能有自己的代码风格和格式, 但如果一个项目中的所有人都遵循同一风格的话, 这个项目就能更顺利地进行. 
- 每个人未必能同意下述的每一处格式规则, 而且其中的不少规则需要一定时间的适应, 但整个项目服从统一的编程风格是很重要的, 只有这样才能让所有人轻松地阅读和理解代码.
- 多人合作的项目建议使用一个.clang-format 文件，统一代码格式
- 推荐 [emacs 配置文件](https://raw.githubusercontent.com/google/styleguide/gh-pages/google-c-style.el).

#### clang format

编辑器如vscode和clion都可以设置自动格式化代码

如何设置：

- https://blog.csdn.net/core571/article/details/82867932
- https://cloud.tencent.com/developer/article/1394078
- https://blog.csdn.net/hxiaohai/article/details/100705224 直接设置为Google Style即可

install format

```shell
sudo apt-get install clang-format-8
```

add format-file

文件名称必须是.clang-format

```yaml
---
BasedOnStyle: Google
---
Language: Cpp

#AlignArrayOfStructures: Right
AlignEscapedNewlines: Right
#AllowShortBlocksOnASingleLine: Always
#AlwaysBreakTemplateDeclarations: MultiLine
ConstructorInitializerAllOnOneLineOrOnePerLine: false
CommentPragmas: '^ IWYU pragma:'
#EmptyLineAfterAccessModifier: Leave
IncludeBlocks: Preserve
IncludeCategories:
- Regex:           '^<.*\.hp*>'
  Priority:        1
#  SortPriority:    0
#  CaseSensitive:   false
- Regex:           '^<.*'
  Priority:        2
#  SortPriority:    0
#  CaseSensitive:   false
- Regex:           '.*'
  Priority:        3
#  SortPriority:    0
#  CaseSensitive:   false
#InsertTrailingCommas: Wrapped
#PackConstructorInitializers: BinPack
PointerAlignment: Right
#QualifierAlignment: Custom
#QualifierOrder: ['inline', 'static', 'const', 'volatile', 'type']
#ShortNamespaceLines: 0
SpacesInContainerLiterals: false
#SpacesInLineCommentPrefix:
#  Minimum: 1
#  Maximum: 1
TabWidth: 4
...

```

put this file under your repo

Usage:

- Command line:

  ```shell
  cd <yout-repo>
  clang-format -style=file -fallback-style=none -i <file_your_want_to_format>
  ```

- CLion setting:

  - (Option 1) Setting -> Editor -> Code Style -> Check `Enable ClangFormat (only for C/C++/Objective-C)`. This one uses the installed `clang-format` in $PATH. And can use `Ctrl+Alt+Shift+L` to trigger it.
  - (Option 2) Setting -> Tools -> External Tools -> Add a tool:
    - `Program` set to the `clang-format` binary path (e.g. /usr/bin/clang-format)
    - `Arguments` set to `-i $FileName$ -style=file -fallback-style=none`
    - `Working directory` set to `$FileDir$`
    - This one is triggered from right click on the file needed to format, and select from `External Tool` tab.

- VScode setting (TBD)

# 一些小建议

## c++

- 宏定义的注释不要用`//`

- 宏定义每个变量都要有括号

- 宏定义一些具有函数功能的内容时，如果变量类型已知的话，使用inline function更符合c++的规范

- ```c++
  #define ACCELEROMETER_UPPER_TOL 1.1 // bad
  #define ACCELEROMETER_UPPER_TOL (1.1)// good
  
  #define GET_ADDR(addr, len) \
    (addr >= len ? addr - len : addr)  // get cycle buffer addr // bad
  inline int GetAddr(int addr, int len) {
    return (addr >= len ? addr - len : addr);  // get cycle buffer addr // good
  }
  ```
  
- 最好经常禁掉拷贝构造和拷贝赋值：禁拷贝，无bug

- 一定一定一定要 多用const，在任何能用const的地方毫不吝啬地加上const

- check的函数的结果应该mark成const的

- const reference for `for` iterations

  ```c++
  std::vector<int> v;
  
  for (auto &num : v){ // bad
  	...
  }
  
  for (const auto &num : v){ // good
      
  }
  ```

- const 引用

- 引用一定限定成const，如果想传出参数一定用指针，指针才被允许做更改，养成code好习惯！

  ```c++
   bool GetDownloadBasicUrl(std::string &url); // bad
  
   bool GetDownloadBasicUrl(const std::string &url); // good
  
   bool GetDownloadBasicUrl(std::string *url); // good
  ```

- static inline 关键词要合适考虑使用

- `std::shared_ptr` also could eliminate this delete.

- thread use atomic int bool

- enum的2个小tips

  ```c++
    typedef enum {
      PATH_PLANNER_TYPE_UNKNOWN = -1, // 第一个设置为TYPE_UNKNOWN = -1
      ZIGZAG_COMMANDER,
      MAP_PATH_PLANNER,
      NUM_PATH_PLANNER // 最后一个设置为 NUM_
    } PathPlannerType;
  ```

- Do Not use float equal.

  ```c++
  float a = 1.0;
  float b = 1.2;
  double c = 0.9999;
  if (a != b) { // bad
  }
  if (std::abs(a - b) > std::numeric_limits<double>::epsilon()) { // good
  }
  
  if (a == c){ // bad
  }
  if (std::abs(a - c) < std::numeric_limits<double>::epsilon()) { // good
  }
  
  if (a == 0) { // bad
  }
  if (std::abs(a) < std::numeric_limits<float>::epsilon()) { // good
  }
  
  if (a != 0) { // bad
  }
  if (std::abs(a) > std::numeric_limits<float>::epsilon()) { // good
  }
  
  ```
  
  在CmakeList中禁止写出 float-equal 的代码
  
  ```cmake
  # Suppress float-equal warnings for line_tracker headers
  set_source_files_properties("test.cc" PROPERTIES
      COMPILE_FLAGS -Wno-float-equal)
  ```
  
  但是要注意python的不同
  ```python
  print(1.001 == True) # False
  print(1. == True) # True
  print(0.0001 == False) # False
  print(0. == False) # True
  
  """但是要注意在if条件判断里面，和上面是不一样的"""
  """1.001 不等于 True"""
  if (1.001 == True):
      print("yes")
  else:
      print("no")
  
  """但是 1.001 在if条件判断里面却是True"""
  if (1.001):
      print("yes")
  else:
      print("no")
  ```
  
- 有很多大括号嵌套的时候要注释结束符号

  ```c++
  for (int i ...) {
     for (int j ...) {
     
     } // end for j
  } // end for i
  ```

- == 判断的左右

  ```c++
  if (num == 10) {  // 不好
      // balabala
  }
  
  if (10 == num) { // 好
      // balabala
  }
  ```

  养成习惯： == 的左侧写值，==的右侧写变量

  原因：防止笔误将== 写成=，造成难以排查的bug

- stl 多用empty()判空

  容器的判空建议使用empty() 而不是 0 == vector.size()



## Python

- [https://zh-google-styleguide.readthedocs.io/en/latest/google-python-styleguide/contents/](https://zh-google-styleguide.readthedocs.io/en/latest/google-python-styleguide/contents/)

- use `!=` for string comparison

  ```python
   if author is not '': // bad
   if author != '':   // good
  ```

  

- Use `#` for simple comments. `'''` is for docstrings.

  ```shell
  # simple comments
  ''' doc strings '''
  ```



- list 记得先判空，再取[0]

  ```shell
  list = [1,3,4]
  
  a = list[0] # bad
  
  if len(list): # good
  	a = list[0]
  ```



- Use eps for 0 comparison

  使用eps用于 浮点型 的比较

  ```shell
  if (0 == val)  // bad
  if (abs(val) < eps) // good
  ```

# LGTM

一些俚语，以及常用的命名词汇收集

- LGTM look good to me

- typo 错别字

- hard code 硬编码

- duplicate 复制

- nitpick 挑剔

- cache 缓存

- cur_ current 当前的变量

- prev_  previous 上一次的变量 

- sample 样本

- sample rate 采样频率

  ```c++
  #define FRAME_TIME 0.01							// 10ms sample rate!  
  ```

- interval 间隔

  interval_time 间隔时间
  
- scale 比例，尺度

- factor 系数

- generate 生成

- calculate 计算

- iteration 迭代

- Integrate Integral Integration 积分

- differentiate derivative differentiation  微分

- transformation 变换

- conversion 变换

- calibration 校准

- component 成分，组成，部分

- implement 实现

- simulate simulation 仿真

- Velocity 速度

- attitude 姿态

- orientation 方向

- estimate 估计

- tune 调整

- accumulated 累计

- potential 潜在的

- Approximate 近似

- resolution 精度 分辨率

- conflict 冲突

- refactor 重构

- refine 优化精简

- convert 变换 转换

- transmit 传输传送

- pseudo code 伪代码

- collision 碰撞

- Third part lib 三方库

- Workaround

- State-of-the-art    adj. 最先进的

- in the Supplementary Materials 补充材料






## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.


## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

[![CC0](http://i.creativecommons.org/p/zero/1.0/88x31.png)](http://creativecommons.org/publicdomain/zero/1.0/)





