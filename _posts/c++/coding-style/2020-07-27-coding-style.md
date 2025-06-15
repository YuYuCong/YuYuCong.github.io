---
layout: post
title: c++ coding style
subtitle: c++代码风格规范，以及一些良好的代码习惯建议
categories:
  - c++
tags:
  - cpp
  - cplusplus
header-img: img/in-post/post-cpp/bg_code_style.png
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
- 函数名的每个单词首字母大写（"驼峰命名" 或 "帕斯卡命名"）
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

#### 2.1 函数长度

- 倾向于编写简短, 凝练的函数
- 如果函数超过 40 行, 可以思索一下能不能在不影响程序结构的前提下对其进行分割
- 即使一个长函数现在工作的非常好, 一旦有人对其修改, 有可能出现新的问题, 甚至导致难以发现的 bug
- 使函数尽量简短, 以便于他人阅读和修改代码

#### 2.2 参数顺序

- 函数的参数顺序为: 输入参数在先, 后跟输出参数
- 输入参数通常是值参或 `const` 引用
- 输出参数或输入/输出参数则一般为非 `const` 指针
- 在排列参数顺序时, 将所有的输入参数置于输出参数之前

#### 2.3 引用参数

- 所有按引用传递的参数必须加上 `const`
- 输入参数是值参或 `const` 引用, 输出参数为指针
- 输入参数可以是 `const` 指针, 但决不能是非 `const` 的引用参数, 除非用于交换, 比如 `swap()`

```c++
void Foo(const string& in, string* out);  // 好 - 输入用const引用，输出用指针
void Foo(string& in, string& out);        // 不好 - 非const引用参数
```

### 3. 类

#### 3.1 构造函数的职责

- 不要在构造函数中调用虚函数, 也不要在无法报出错误时进行可能失败的初始化
- 构造函数不得调用虚函数, 或尝试报告一个非致命错误
- 如果对象需要进行有意义的 (non-trivial) 初始化, 考虑使用明确的 Init() 方法或工厂函数

#### 3.2 隐式类型转换

- 不要定义隐式类型转换. 对于转换运算符和单参数构造函数, 请使用 `explicit` 关键字

```c++
class Foo {
 public:
  explicit Foo(int x);  // 好 - 防止隐式转换
  explicit operator bool() const;  // 好 - 显式转换运算符
};
```

#### 3.3 可拷贝类型和可移动类型

- 如果你的类型需要, 就让它们支持拷贝 / 移动
- 否则, 就把隐式产生的拷贝和移动函数禁用

```c++
class NonCopyable {
 public:
  NonCopyable() = default;
  
  // 禁用拷贝和移动
  NonCopyable(const NonCopyable&) = delete;
  NonCopyable& operator=(const NonCopyable&) = delete;
  NonCopyable(NonCopyable&&) = delete;
  NonCopyable& operator=(NonCopyable&&) = delete;
};
```

#### 3.4 结构体 vs. 类

- 仅当只有数据成员时使用 `struct`, 其它一概使用 `class`
- 在 C++ 中 `struct` 和 `class` 关键字几乎含义一样
- 我们为这两个关键字添加我们自己的语义理解, 以便为定义的数据类型选择合适的关键字

```c++
struct Point {  // 好 - 仅包含数据
  double x, y;
};

class Calculator {  // 好 - 包含方法和数据
 public:
  double Add(double a, double b);
 private:
  double result_;
};
```

#### 3.5 继承

- 使用组合常常比使用继承更合理
- 如果使用继承的话, 定义为 `public` 继承
- 所有继承必须是 `public` 的
- 如果你想使用私有继承, 你应该替换为把基类的实例作为成员对象的方式

#### 3.6 多重继承

- 真正需要用到多重实现继承的情况少之又少
- 只有当最多一个基类中含有实现, 其它基类都是以 `Interface` 为后缀的纯接口类时, 才允许使用多重继承

### 4. 作用域

#### 4.1 命名空间

- 鼓励在 `.cc` 文件内使用匿名命名空间或 `static` 声明
- 使用具名的命名空间时, 其名称可基于项目名或相对路径
- 禁止使用 using 指示（using-directive）
- 禁止使用内联命名空间（inline namespace）

```c++
// 好的命名空间使用
namespace myproject {
namespace mymodule {

class MyClass {
  // ...
};

}  // namespace mymodule
}  // namespace myproject
```

#### 4.2 匿名命名空间和静态变量

- 在 `.cc` 文件中定义一个不需要被外部引用的变量时, 可以将它们放在匿名命名空间或声明为 `static`
- 但是不要在 `.h` 文件中这么做

```c++
// 在.cc文件中
namespace {
const int kInternalConstant = 42;  // 好 - 匿名命名空间
}

static const int kAnotherConstant = 24;  // 也可以 - static声明
```

#### 4.3 非成员函数、静态成员函数和全局函数

- 使用静态成员函数或命名空间内的非成员函数, 尽量不要用裸的全局函数
- 将一系列函数直接置于命名空间中, 不要用类的静态方法模拟出命名空间的效果

```c++
namespace myproject {
namespace geometry {

// 好 - 命名空间内的非成员函数
double CalculateArea(double radius);
double CalculateVolume(double radius, double height);

}  // namespace geometry
}  // namespace myproject
```

#### 4.4 局部变量

- 将函数变量尽可能置于最小作用域内, 并在变量声明时进行初始化
- C++ 允许在函数的任何位置声明变量
- 我们提倡在尽可能小的作用域中声明变量, 离第一次使用越近越好

```c++
int i;
i = f();      // 不好 - 初始化和声明分离

int j = g();  // 好 - 声明时初始化

for (int k = 0; k < 10; ++k) {  // 好 - 循环变量在循环内声明
  // ...
}
```

### 5. 头文件

#### 5.1 Self-contained 头文件

- 头文件应该能够自给自足（self-contained,也就是可以作为第一个头文件被引入）
- 换言之, 用户和重构工具不需要为特别场合而包含额外的头文件
- 所有头文件都应该使用 `#define` 保护来防止头文件被多重包含

```c++
#ifndef PROJECT_PATH_FILE_H_
#define PROJECT_PATH_FILE_H_

// 头文件内容

#endif  // PROJECT_PATH_FILE_H_
```

#### 5.2 #define 保护

- 所有头文件都应该使用 `#define` 保护来防止头文件被多重包含
- 命名格式当是: `<PROJECT>_<PATH>_<FILE>_H_`

```c++
// 文件 foo/src/bar/baz.h
#ifndef FOO_BAR_BAZ_H_
#define FOO_BAZ_H_

// ...

#endif  // FOO_BAR_BAZ_H_
```

#### 5.3 前置声明

- 尽可能地避免使用前置声明
- 使用 `#include` 包含需要的头文件即可
- 前置声明是不提供定义的情况下声明一个类, 函数或者模板

```c++
// 不推荐的前置声明
class MyClass;
void MyFunction(const MyClass& obj);

// 推荐直接包含头文件
#include "my_class.h"
void MyFunction(const MyClass& obj);
```

#### 5.4 内联函数

- 只有当函数只有 10 行甚至更少时才将其定义为内联函数
- 当函数被声明为内联函数之后, 编译器会将其内联展开, 而不是按通常的函数调用机制进行调用

```c++
class MyClass {
 public:
  // 好 - 简短的内联函数
  int GetValue() const { return value_; }
  
  // 不好 - 复杂函数不应该内联
  void ComplexFunction();  // 在.cc文件中实现
  
 private:
  int value_;
};
```

#### 5.5 #include 的路径及顺序

- 使用标准的头文件包含顺序可增强可读性, 避免隐藏依赖
- 项目内头文件应按照项目源代码目录树结构排列

包含顺序如下:
1. 相关头文件
2. C 库
3. C++ 库  
4. 其他库的头文件
5. 本项目内的头文件

```c++
// 在 foo.cc 中
#include "foo/public/fooserver.h"  // 优先包含对应的.h文件

#include <sys/types.h>             // C系统文件
#include <unistd.h>

#include <hash_map>                // C++系统文件
#include <vector>

#include "base/basictypes.h"       // 其他库的头文件
#include "base/commandlineflags.h"
#include "foo/server/bar.h"        // 本项目内的头文件
```

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


  double d = 0.0001;
  if (d) { // bad
  }
  if (std::abs(d > std::numeric_limits<double>::epsilon() ) { // good
  }
      
  if (!d) { // bad
  }
  if (std::abs(d < std::numeric_limits<double>::epsilon() ) { // good
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





