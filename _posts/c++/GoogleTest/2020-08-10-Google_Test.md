---
layout: post
title: Google Test使用方法总结
description: 写代码不测试，bug满天飞。
categories:
  - c++
tags:
  - gtest
  - unit-test
  - cpp
  - cplusplus
redirect_from:
  - /2020/08/10/
---

> Gtest 使用方法总结。写代码不测试，bug满天飞。

* Kramdown table of contents
{:toc .toc}


# Google Test

<center style="font-size:26px;color:#176;text-align:left;">References</center> 

> - https://www.cnblogs.com/coderzh/archive/2009/04/06/1426755.html
> - 《Google Test Tutorials》
>   - https://github.com/google/googletest/tree/master/docs
>     - https://github.com/google/googletest/blob/master/docs/primer.md
>     - https://github.com/google/googletest/blob/master/docs/advanced.md
>   - https://www.jianshu.com/nb/43089576
> - https://raymii.org/s/tutorials/Cpp_project_setup_with_cmake_and_unit_tests.html#toc_1

## 1. Install & hello test

> - https://blog.csdn.net/qq_35976351/article/details/79634857
>- https://www.cnblogs.com/jessica-jie/p/6704388.html

#### Install

```shell
$ sudo apt-get install libgtest-dev
```

#### hello_test.cpp

> code example --> 1.hello_gtest

```c++
// hello_test.cpp
#include <gtest/gtest.h>
#include <iostream>

// function to test
int test_fun(int a) { return a + 1; }

// unit test
TEST(FunTest, HandlesZeroInput) {
  EXPECT_EQ(1, test_fun(0)) << "hhah";
  EXPECT_EQ(2, test_fun(1));
  EXPECT_EQ(3, test_fun(2));
}

// main test function
int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}
```

- 写一个TEST()函数即可生成测试对象，在测试对象使用断言语句

### 编译

#### g++ 编译gtest

```shell
g++ test.cpp /usr/local/lib/libgtest.a -lpthread -o test
```

#### CMake编译gtest 项目

> code example -->   4.cmake_project

- 将googletest源码放在项目目录/lib/googletest/下

- 主CMakeLists.txt    项目目录/CMakeLists.txt

```cmake
  cmake_minimum_required(VERSION 3.3)
  project(gtest_cmake_example)
  
  set(CMAKE_CXX_STANDARD 14)
  
  include_directories(src)
  
  add_subdirectory(src)
  add_subdirectory(tst)
  add_subdirectory(lib/googletest)
```

- src目录下面为待测试的源码

- tst目录下面为gtest测试代码


- src目录下面的CMakeLists.txt 正常填写即可

```cmake
  file(GLOB_RECURSE SOURCES LIST_DIRECTORIES true *.h *.cc)
  set(SOURCES ${SOURCES})
  add_library(${CMAKE_PROJECT_NAME}_lib STATIC ${SOURCES})
  
  set(BINARY ${CMAKE_PROJECT_NAME})
  add_executable(${BINARY}_run main.cpp)
  target_link_libraries(${BINARY}_run ${CMAKE_PROJECT_NAME}_lib)
```
  
- tst目录下的CMakeLists.txt，引入src目录下生成的lib

```cmake
  file(GLOB_RECURSE TEST_SOURCES LIST_DIRECTORIES false *.cpp)
  set(SOURCES ${TEST_SOURCES})
  
  set(BINARY ${CMAKE_PROJECT_NAME}_tst)
  add_executable(${BINARY} ${TEST_SOURCES})
  target_link_libraries(${BINARY} PUBLIC 
    ${CMAKE_PROJECT_NAME}_lib 
    gtest
    )
  
  add_test(NAME ${BINARY} COMMAND ${BINARY})
```

  

## 2. Basic Concepts

- Test Case
- Test

```c++
  TEST(FunTest, HandlesZeroInput) {}
  
  /*
  - FunTest 就是一个 Test Case
    - HandlesZeroInput 就是一个 Test
    - 一个cpp测试源文件可以有多个Test Case
    - 一个Test Case 可以有多个 Test  
    - 注意每个Test 都不可以重名
  */
```



## 3. Assertions

> - https://www.cnblogs.com/coderzh/archive/2009/04/06/1430364.html

- 断言分为2类
  - ASSERT_* 系列的断言
    - 当检查点失败时，退出当前函数
    - 注意：并非退出当前case
    - 用处：如果断言失败后续内容没有必要继续进行，可以使用此类断言
  - EXPECT_* 系列的断言
    - 当检查点失败时，继续往下执行
    - 通常用EXPECT系列断言



### 1. bool 值检查

| **Fatal assertion**            | **Nonfatal assertion**         | **Verifies**         |
| ------------------------------ | ------------------------------ | -------------------- |
| `ASSERT_TRUE(`*condition*`)`;  | `EXPECT_TRUE(`*condition*`)`;  | *condition* is true  |
| `ASSERT_FALSE(`*condition*`)`; | `EXPECT_FALSE(`*condition*`)`; | *condition* is false |

### 2. 数值型数据检查

| **Fatal assertion**                                     | **Nonfatal assertion**                 | **Verifies**             |
| ------------------------------------------------------- | -------------------------------------- | ------------------------ |
| `ASSERT_EQ(`*expected*`, `*actual*`);` expected写在前面 | `EXPECT_EQ(`*expected*`, `*actual*`);` | *expected* `==` *actual* |
| `ASSERT_NE(`*val1*`, `*val2*`);`                        | `EXPECT_NE(`*val1*`, `*val2*`);`       | *val1* `!=` *val2*       |
| `ASSERT_LT(`*val1*`, `*val2*`);`                        | `EXPECT_LT(`*val1*`, `*val2*`);`       | *val1* `<` *val2*        |
| `ASSERT_LE(`*val1*`, `*val2*`);`                        | `EXPECT_LE(`*val1*`, `*val2*`);`       | *val1* `<=` *val2*       |
| `ASSERT_GT(`*val1*`, `*val2*`);`                        | `EXPECT_GT(`*val1*`, `*val2*`);`       | *val1* `>` *val2*        |
| `ASSERT_GE(`*val1*`, `*val2*`);`                        | `EXPECT_GE(`*val1*`, `*val2*`);`       | *val1* `>=` *val2*       |

### 3. 浮点型检查（可含误差）

无误差

| **Fatal assertion**                       | **Nonfatal assertion**                    | **Verifies**                             |
| ----------------------------------------- | ----------------------------------------- | ---------------------------------------- |
| `ASSERT_FLOAT_EQ(`*expected, actual*`);`  | `EXPECT_FLOAT_EQ(`*expected, actual*`);`  | the two `float` values are almost equal  |
| `ASSERT_DOUBLE_EQ(`*expected, actual*`);` | `EXPECT_DOUBLE_EQ(`*expected, actual*`);` | the two `double` values are almost equal |

含误差（对相近的两个数比较）：

| **Fatal assertion**                       | **Nonfatal assertion**                    | **Verifies**                                                                     |
| ----------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------- |
| `ASSERT_NEAR(`*val1, val2, abs_error*`);` | `EXPECT_NEAR`*(val1, val2, abs_error*`);` | the difference between *val1* and *val2* doesn't exceed the given absolute error |

  同时，还可以使用：

```cpp
EXPECT_PRED_FORMAT2(testing::FloatLE, val1, val2);
EXPECT_PRED_FORMAT2(testing::DoubleLE, val1, val2);
```

### 4. 字符串检查  

| **Fatal assertion**                                   | **Nonfatal assertion**                                | **Verifies**                                                      |
| ----------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------- |
| `ASSERT_STREQ(`*expected_str*`, `*actual_str*`);`     | `EXPECT_STREQ(`*expected_str*`, `*actual_str*`);`     | the two C strings have the same content                           |
| `ASSERT_STRNE(`*str1*`, `*str2*`);`                   | `EXPECT_STRNE(`*str1*`, `*str2*`);`                   | the two C strings have different content                          |
| `ASSERT_STRCASEEQ(`*expected_str*`, `*actual_str*`);` | `EXPECT_STRCASEEQ(`*expected_str*`, `*actual_str*`);` | the two C strings have the same content, ignoring case 忽略大小写 |
| `ASSERT_STRCASENE(`*str1*`, `*str2*`);`               | `EXPECT_STRCASENE(`*str1*`, `*str2*`);`               | the two C strings have different content, ignoring case           |

*STREQ*和*STRNE*同时支持`char*和wchar_t*`类型

*STRCASEEQ*和*STRCASENE*却只接收char* 类型

### 5. 主动返回成功或失败

直接返回成功：`SUCCEED();`

返回失败：

| **Fatal assertion** | **Nonfatal assertion** |
| ------------------- | ---------------------- |
| ```FAIL();```       | ```ADD_FAILURE();```   |

### 6. 异常检查

| **Fatal assertion**                              | **Nonfatal assertion**                           | **Verifies**                                      |
| ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------- |
| `ASSERT_THROW(`*statement*, *exception_type*`);` | `EXPECT_THROW(`*statement*, *exception_type*`);` | *statement* throws an exception of the given type |
| `ASSERT_ANY_THROW(`*statement*`);`               | `EXPECT_ANY_THROW(`*statement*`);`               | *statement* throws an exception of any type       |
| `ASSERT_NO_THROW(`*statement*`);`                | `EXPECT_NO_THROW(`*statement*`);`                | *statement* doesn't throw any exception           |

### 7. Predicate Assertions

| **Fatal assertion**                    | **Nonfatal assertion**                 | **Verifies**                     |
| -------------------------------------- | -------------------------------------- | -------------------------------- |
| `ASSERT_PRED1(`*pred1, val1*`);`       | `EXPECT_PRED1(`*pred1, val1*`);`       | *pred1(val1)* returns true       |
| `ASSERT_PRED2(`*pred2, val1, val2*`);` | `EXPECT_PRED2(`*pred2, val1, val2*`);` | *pred2(val1, val2)* returns true |
| ...                                    | ...                                    | ...                              |

还可以自定义输出格式，通过如下：

| **Fatal assertion**                                | **Nonfatal assertion**                             | **Verifies**                             |
| -------------------------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| `ASSERT_PRED_FORMAT1(*pred_format1, val1*);`       | `EXPECT_PRED_FORMAT1(*pred_format1, val1*);`       | *pred_format1(val1)* is successful       |
| `ASSERT_PRED_FORMAT2(*pred_format2, val1, val2*);` | `EXPECT_PRED_FORMAT2(*pred_format2, val1, val2*);` | *pred_format2(val1, val2)* is successful |
| ...                                                | ...                                                |                                          |

### 8. 类型检查

- testting::StaticAssertTypeEq
- 是个静态检查
- 主要用于模板编程里面的类型检查
- 不是在运行时检查，是在编译时检查，如果检查失败会导致编译失败，并由编译器输出报错信息

```cpp
template <typename T>
class FooType {
 public:
  T BarString(const T& input1, const T& input2);
  T BarInt(const T& input1, const T& input2);
};

template <typename T>
T FooType<T>::BarString(const T& input1, const T& input2) {
  testing::StaticAssertTypeEq<std::string, T>();
  return input1 + " " + input2;
};

template <typename T>
T FooType<T>::BarInt(const T& input1, const T& input2) {
  testing::StaticAssertTypeEq<int, T>();
  return input1 + input2;
};

TEST(Value, type_check) {
  // 类型检查
  FooType<std::string> foo_type_string;
  std::cout << foo_type_string.BarString("hello", "gtest") << std::endl;
  FooType<int> foo_type_int;
  std::cout << foo_type_int.BarInt(21, 22) << std::endl;
}

```





## 4. 断言的输出信息

##### 内置输出信息

e.g.

```c++
EXPECT_EQ(1 + 2, Add(1, 2))
```

如果Add结果为（1,2）输出了4，报错信息为

```shell
g:\myproject\c++\gtestdemo\gtestdemo\gtestdemo.cpp(16): error: Value of: Add(1, 2)
  Actual: 4
Expected: 1 + 3
Which is: 3
```

##### 自定义输出信息

eg: 

```c++
/**
 * 断言的输出信息
 */

#include <gtest/gtest.h>

int add(int a, int b) { return a + b; }

TEST(TestCase, test) {
  for (float i = 0.9; i < 1.2; i += 0.1) { // 注意：这份代码只是举个例子，实际写作过程中一定避免使用float的循环，只对整形for循环，以避免出错
    EXPECT_EQ(1 + i, add(1, i))
        << "current value: i = " << i;  // 直接<< 就可以输出自定义信息
  }
}

int main(int argc, char** argv) {
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}

```

在不添加自定义输出信息时，如果出错的话，报错信息将是这样的，你根本不知道出错时 i 等于几，非常不方便debug：

```shell
g:\myproject\c++\gtestdemo\gtestdemo\gtestdemo.cpp(25): error: Value of: y[i]
  Actual: 2
Expected: 1 + i
Which is: 1.9
```

如果使用<<操作符将一些重要信息输出，就可以很有帮助

```cpp
current value: i = 0.89999999999761268
```



## 5. 事件机制

（Q：事件机制有怎样的用处？）

gtest提供了多种事件机制，非常方便我们在案例之前或之后做一些操作。【具体是什么呢？】

gtest的事件一共有3种：

\1. 全局的，所有案例执行前后。

\2. TestSuite级别的，在某一批案例中第一个案例前，最后一个案例执行后。

\3. TestCase级别的，每个TestCase前后。

### 1 全局事件

\1. SetUp()方法在所有案例执行前执行

\2. TearDown()方法在所有案例执行后执行

要实现全局事件，我们需要写一个类，继承`testing::Environment`类，实现里面的`SetUp`和`TearDown`方法。

1. 写一个继承自`testing::Environment`的类，实现`SetUp`和`TearDown`方法
2. 在main函数中通过`testing::AddGlobalTestEnvironment`方法将事件挂进来，也就是说，我们可以写很多个这样的类，然后将他们的事件都挂上去。

```cpp
#include <gtest/gtest.h>
#include <iostream>

class GlobalEvent : public testing::Environment
{
public:
    virtual void SetUp()
    {
        std::cout << "Before all cases" << std::endl;
    }
    virtual void TearDown()
    {
        std::cout << "After all cases" << std::endl;
    }
};

TEST(GlobalEventTest, FirstTest) {
    std::cout << "First test" << std::endl;
}

TEST(GlobalEventTest, SecondTest) {
    std::cout << "Second test" << std::endl;
}

int main(int argc, char** argv)
{
    testing::AddGlobalTestEnvironment(new GlobalEvent);
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
```

### 2 TestSuite级别事件

要实现TestSuite级别的事件，需要写一个类，继承`testing::Test`，然后实现两个静态方法：

1. `SetUpTestCase()` 方法在第一个TestCase之前执行
2. `TearDownTestCase()` 方法在最后一个TestCase之后执行

```cpp
#include <gtest/gtest.h>
#include <iostream>

class TestSuiteEvent : public testing::Test
{
public:
    static void SetUpTestCase()
    {
        std::cout << "Before first test in TestSuite" << std::endl;
    }
    static void TearDownTestCase()
    {
        std::cout << "After last test in TestSuite" << std::endl;
    }
};

TEST_F(TestSuiteEvent, FirstTest) {
    std::cout << "First test in TestSuite" << std::endl;
}

TEST_F(TestSuiteEvent, SecondTest) {
    std::cout << "Second test in TestSuite" << std::endl;
}
```

### 3 TestCase级别事件

TestCase级别的事件是挂在每个案例执行前后的，实现方式和TestSuite的几乎一样，不过需要实现的是`SetUp`方法和`TearDown`方法：

1. `SetUp()`方法在每个TestCase之前执行
2. `TearDown()`方法在每个TestCase之后执行

```cpp
#include <gtest/gtest.h>
#include <iostream>

class TestCaseEvent : public testing::Test
{
public:
    virtual void SetUp()   // 注意这里不是静态的
    {
        std::cout << "Before each test case" << std::endl;
    }
    virtual void TearDown() // 注意这里不是静态的
    {
        std::cout << "After each test case" << std::endl;
    }
};

TEST_F(TestCaseEvent, FirstTest) {
    std::cout << "First test case" << std::endl;
}

TEST_F(TestCaseEvent, SecondTest) {
    std::cout << "Second test case" << std::endl;
}
```

**注意：**
- TestSuite级别的SetUpTestCase和TearDownTestCase是静态方法
- TestCase级别的SetUp和TearDown是非静态方法
- 使用事件机制时，测试用例需要使用TEST_F宏，而不是TEST宏



## 6. 参数化测试  TEST_P

> - https://www.cnblogs.com/coderzh/archive/2009/04/08/1431297.html
> - https://www.codenong.com/p12215339/

- 使用参数化的主要目的是：方便测试一大批数据

**用参数化之前的方案：** 不好的测试代码

```cpp
// function need to test
bool IsOdd(iunt n){
    if(n%2 == 1) return true;
    else return false;
}
```

```c++
// unit test
TEST(IsOddTest, HandleTrueReturn){
    EXPECT_TRUE(IsOdd(1));
    EXPECT_TRUE(IsOdd(3));
    EXPECT_TRUE(IsOdd(5));
    EXPECT_TRUE(IsOdd(7));
}
```

然后上面的用例需要重复很多次，非常无聊

### 6.1. 数据参数化 TEST_P

**使用参数化后的方案：**

##### 1. step one : 继承类，告知gtest需要使用的参数类型

- 添加一个类，继承`testing::TestWithParam<T>`
- 其中T修改为被测试的数据们的数据类型
- 如：要测试很多int型数据

```c++
class IsOdd : public::testing::TestWithParam<int>{}; 
```

##### 2. step two: 告知gtest拿到某个参数之后执行的具体测试操作

- 编写具体测试代码
- 使用宏 TEST_P

  - 这里，我们要使用一个新的宏（嗯，挺兴奋的）：**TEST_P**，关于这个"P"的含义，Google给出的答案非常幽默，就是说你可以理解为"parameterized" 或者 "pattern"。我更倾向于 "parameterized"的解释，呵呵
- `GetParam()`获取一个参数：在TEST_P宏里，使用`GetParam()`获取当前的参数的具体值
  - 这个函数会从哪里拿数据呢，看第三步
- 然后编写断言

```cpp
TEST_P(IsOddParamTest, HandleTrueReturn) {
    int n =  GetParam(); // 获取一个数值
    EXPECT_TRUE(IsOdd(n));
}
```

##### 3. step three: 参数范围

- INSTANTIATE_TEST_CASE_P 宏

```cpp
INSTANTIATE_TEST_CASE_P(TrueReturn, IsOddParamTest, testing::Values(3, 5, 11, 23, 17));
```

- 第一个参数是测试案例的前缀，可以任意取

- 第二个参数是测试案例的名称，需要和之前定义的参数化的类的名称相同，如：IsPrimeParamTest

- 第三个参数是可以理解为参数生成器，上面的例子使用test::Values表示使用括号内的参数。

  Google提供了一系列的参数生成的函数：

##### 4. 参数产生器

| 句柄                                             | 意义                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Range(begin, end[, step])`                      | 范围在begin~end之间，步长为step，不包括end                                                                                                                                                                                                                                                                                      |
| `Values(v1, v2, ..., vN)`                        | v1,v2到vN的值                                                                                                                                                                                                                                                                                                                   |
| `ValuesIn(container)` and `ValuesIn(begin, end)` | 从一个C类型的数组或是STL容器，或是迭代器中取值                                                                                                                                                                                                                                                                                  |
| `Bool()`                                         | 取`false` 和 `true` 两个值                                                                                                                                                                                                                                                                                                      |
| `Combine(g1, g2, ..., gN)`                       | 这个比较强悍，它将g1,g2,...gN进行排列组合，g1,g2,...gN本身是一个参数生成器，每次分别从g1,g2,..gN中各取出一个值，组合成一个元组(Tuple)作为一个参数。说明：这个功能只在提供了`<tr1/tuple>`头的系统中有效。gtest会自动去判断是否支持tr/tuple，如果你的系统确实支持，而gtest判断错误的话，你可以重新定义宏`GTEST_HAS_TR1_TUPLE=1`。 |

### 6.2. 类型参数化 TYPED_TEST

type-parameterized tests

> - https://www.cnblogs.com/bangerlee/archive/2011/10/08/2199701.html
> - https://github.com/google/googletest/blob/master/googletest/include/gtest/gtest-typed-test.h

- 前面所讲的参数化测试，所有的参数类型是一样的，我们提供一系列数值作为被测值
- 当我们要测试多种数据类型的时候，使用类型参数化

#### 6.2.1. 待测类型已知

> code example --> 6.auto_value_types

##### 1. step one: 继承类，定义一个模板类，继承testing::Test

- 定义一个模板类，继承`testing::Test`

##### 2. step two: 给出参数范围并关联参数

- 如：要测试int 和 char

```c++
typedef testing::Types<int, char> typelist;
TYPED_TEST_CASE(QueueTest, typelist);
```

##### 3. step three: 拿到参数之后的具体测试行为

- TypeParam： 获取类型参数
- TYPED_TEST 宏

#### 6.2.2. 待测类型未知

当我们不知道具体要测试哪些类型，或者说类型是由外部提供的时候，我们可以使用类型参数化的另一种形式：`TYPED_TEST_P`。

这种方式被称为 **Type-Parameterized Tests**，它允许我们定义一个测试模板，然后在不同的地方用不同的类型来实例化这个测试。

##### 使用步骤：

**1. 定义测试类模板**

```cpp
template <typename T>
class QueueTest : public testing::Test {
 public:
  typedef std::queue<T> Queue;
  typedef std::list<T> List;
};
```

**2. 使用 TYPED_TEST_SUITE_P 声明测试套件**

```cpp
TYPED_TEST_SUITE_P(QueueTest);
```

**3. 使用 TYPED_TEST_P 定义测试用例**

```cpp
TYPED_TEST_P(QueueTest, DefaultConstructor) {
  typename TestFixture::Queue q0;
  EXPECT_EQ(0u, q0.size());
}

TYPED_TEST_P(QueueTest, Enqueue) {
  typename TestFixture::Queue q0;
  typename TestFixture::List expected;
  
  for (int i = 0; i < 10; ++i) {
    q0.push(i);
    expected.push_back(i);
  }
  EXPECT_EQ(10u, q0.size());
}
```

**4. 使用 REGISTER_TYPED_TEST_SUITE_P 注册测试用例**

```cpp
REGISTER_TYPED_TEST_SUITE_P(QueueTest,
                           DefaultConstructor, Enqueue);
```

**5. 使用 INSTANTIATE_TYPED_TEST_SUITE_P 实例化测试**

```cpp
typedef testing::Types<int, char, unsigned int> MyTypes;
INSTANTIATE_TYPED_TEST_SUITE_P(My,        // 实例化名称前缀
                              QueueTest,  // 测试套件名称
                              MyTypes);   // 类型列表
```

**完整示例：**

```cpp
#include <gtest/gtest.h>
#include <queue>
#include <list>

template <typename T>
class QueueTest : public testing::Test {
 public:
  typedef std::queue<T> Queue;
  typedef std::list<T> List;
};

TYPED_TEST_SUITE_P(QueueTest);

TYPED_TEST_P(QueueTest, DefaultConstructor) {
  typename TestFixture::Queue q0;
  EXPECT_EQ(0u, q0.size());
}

TYPED_TEST_P(QueueTest, Enqueue) {
  typename TestFixture::Queue q0;
  for (int i = 0; i < 10; ++i) {
    q0.push(static_cast<TypeParam>(i));
  }
  EXPECT_EQ(10u, q0.size());
}

// 注册所有的测试用例
REGISTER_TYPED_TEST_SUITE_P(QueueTest,
                           DefaultConstructor, Enqueue);

// 在一个地方实例化
typedef testing::Types<int, char, unsigned int> MyTypes;
INSTANTIATE_TYPED_TEST_SUITE_P(My, QueueTest, MyTypes);

// 也可以在另一个地方用不同的类型再次实例化
typedef testing::Types<float, double> FloatTypes;
INSTANTIATE_TYPED_TEST_SUITE_P(Float, QueueTest, FloatTypes);
```

**优势：**
- 可以在不同的源文件中用不同的类型实例化同一个测试模板
- 测试逻辑和具体类型解耦，提高了代码复用性
- 适合库开发者为用户提供测试模板



### 6.3. 类型参数化与数值参数化混合使用

> - https://www.coder.work/article/1978584

在某些情况下，我们可能需要同时对类型和数值进行参数化测试。Google Test 提供了几种方式来实现这种混合参数化。

#### 方法一：在类型参数化测试中使用数值

```cpp
#include <gtest/gtest.h>
#include <vector>

template <typename T>
class ContainerTest : public testing::Test {
 public:
  typedef std::vector<T> Container;
};

typedef testing::Types<int, float, double> NumericTypes;
TYPED_TEST_SUITE(ContainerTest, NumericTypes);

TYPED_TEST(ContainerTest, PushBackMultipleValues) {
  typename TestFixture::Container container;
  
  // 测试多个数值
  std::vector<TypeParam> test_values = {
    static_cast<TypeParam>(1),
    static_cast<TypeParam>(2),
    static_cast<TypeParam>(3)
  };
  
  for (const auto& value : test_values) {
    container.push_back(value);
  }
  
  EXPECT_EQ(test_values.size(), container.size());
  for (size_t i = 0; i < test_values.size(); ++i) {
    EXPECT_EQ(test_values[i], container[i]);
  }
}
```

#### 方法二：使用 Combine 进行组合参数化

```cpp
#include <gtest/gtest.h>
#include <tuple>

// 定义一个测试类，同时接受类型和数值参数
template <typename T>
class MathTest : public testing::TestWithParam<std::tuple<T, T, T>> {
 public:
  T GetFirst() { return std::get<0>(this->GetParam()); }
  T GetSecond() { return std::get<1>(this->GetParam()); }
  T GetExpected() { return std::get<2>(this->GetParam()); }
};

// 为不同类型实例化测试
typedef MathTest<int> MathTestInt;
typedef MathTest<float> MathTestFloat;

TEST_P(MathTestInt, Addition) {
  EXPECT_EQ(GetExpected(), GetFirst() + GetSecond());
}

TEST_P(MathTestFloat, Addition) {
  EXPECT_FLOAT_EQ(GetExpected(), GetFirst() + GetSecond());
}

// 为 int 类型提供测试数据
INSTANTIATE_TEST_SUITE_P(
  IntValues,
  MathTestInt,
  testing::Values(
    std::make_tuple(1, 2, 3),
    std::make_tuple(5, 7, 12),
    std::make_tuple(-1, 1, 0)
  )
);

// 为 float 类型提供测试数据
INSTANTIATE_TEST_SUITE_P(
  FloatValues,
  MathTestFloat,
  testing::Values(
    std::make_tuple(1.1f, 2.2f, 3.3f),
    std::make_tuple(0.5f, 0.5f, 1.0f)
  )
);
```

#### 方法三：使用宏简化多类型参数化

```cpp
#include <gtest/gtest.h>

// 定义一个宏来简化多类型测试的定义
#define DEFINE_TYPED_PARAM_TEST(TestName, TypeName) \
  typedef testing::TestWithParam<std::pair<TypeName, TypeName>> TestName##TypeName; \
  TEST_P(TestName##TypeName, Operation) { \
    auto param = GetParam(); \
    TypeName a = param.first; \
    TypeName b = param.second; \
    EXPECT_GT(a + b, a); \
    EXPECT_GT(a + b, b); \
  }

// 为不同类型定义测试
DEFINE_TYPED_PARAM_TEST(ArithmeticTest, int)
DEFINE_TYPED_PARAM_TEST(ArithmeticTest, double)

// 为每种类型提供测试数据
INSTANTIATE_TEST_SUITE_P(
  IntPairs,
  ArithmeticTestint,
  testing::Values(
    std::make_pair(1, 2),
    std::make_pair(10, 20),
    std::make_pair(-5, 10)
  )
);

INSTANTIATE_TEST_SUITE_P(
  DoublePairs,
  ArithmeticTestdouble,
  testing::Values(
    std::make_pair(1.5, 2.5),
    std::make_pair(10.1, 20.2),
    std::make_pair(-5.5, 10.5)
  )
);
```

#### 方法四：复杂的组合参数化

```cpp
#include <gtest/gtest.h>

// 定义一个更复杂的测试场景
class ComplexParamTest : public testing::TestWithParam<
  std::tuple<int,           // 容器大小
             std::string,   // 操作类型
             bool>>         // 是否预期成功
{
 public:
  int GetSize() { return std::get<0>(GetParam()); }
  std::string GetOperation() { return std::get<1>(GetParam()); }
  bool ShouldSucceed() { return std::get<2>(GetParam()); }
};

TEST_P(ComplexParamTest, ContainerOperations) {
  std::vector<int> container;
  
  // 根据参数初始化容器
  for (int i = 0; i < GetSize(); ++i) {
    container.push_back(i);
  }
  
  if (GetOperation() == "pop" && !container.empty()) {
    container.pop_back();
    EXPECT_EQ(ShouldSucceed(), container.size() == GetSize() - 1);
  } else if (GetOperation() == "clear") {
    container.clear();
    EXPECT_EQ(ShouldSucceed(), container.empty());
  }
}

INSTANTIATE_TEST_SUITE_P(
  ComplexScenarios,
  ComplexParamTest,
  testing::Combine(
    testing::Values(0, 5, 10),              // 容器大小
    testing::Values("pop", "clear"),        // 操作类型
    testing::Bool()                         // 预期结果
  )
);
```

**使用建议：**

1. **简单场景**：如果只需要对少数几个类型进行相同的数值测试，使用方法一
2. **中等复杂度**：如果需要为不同类型提供不同的测试数据，使用方法二
3. **高度重复**：如果有很多相似的类型需要测试，考虑使用宏（方法三）
4. **复杂组合**：对于需要多维度参数组合的场景，使用 `testing::Combine`（方法四）

**注意事项：**
- 混合参数化会增加测试用例的数量，注意控制测试规模
- 确保参数组合的有效性，避免无意义的测试用例
- 合理命名测试实例，便于识别失败的测试用例



## 7. 补充

### 常用模块

- random
  - gtest 经常会调用到random模块，补充一些c++的random操作。

注意参数的范围是：左闭右闭

```c++
inline int RandomInt(int min = INT_MIN, int max = INT_MAX)  
{  
    std::default_random_engine random_engine(std::random_device{}());  
    std::uniform_int_distribution<> random_int(min, max);  
    return random_int(random_engine);  
}
```

### 测试思路

待测试的功能为：

一种方法产生一种结果

所以测试可以有两种思路：

1. 找出另一种你认为正确的方法，对比两种方法结果之间的差异
2. 黑箱测试，按照该方法的功能要求，去检查结果即可


### 过滤目标Test运行

```c++

TEST_F(CalculatorTest, TimeTest) 
{

}

```

```shell
rosrun package_name package_name_test --gtest_filter=*TimeTest 
```

------




## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.


## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)