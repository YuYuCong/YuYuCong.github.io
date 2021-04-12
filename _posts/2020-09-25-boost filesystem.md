---
layout: post
title: "Boost filesystem"
description: "boost filesystem"
categories: [c++]
tags: [code,boost,c++]
redirect_from:
  - /2020/09/25/
---


[toc]



# Boost filesystem

Created 2020.09.25 by William Yu; Last modified: 2020.09.25-V1.0.0

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2021 William Yu. Some rights reserved.

---





<center style="font-size:43px;color:#E9967A;text-align:center;">boost filesystem</center> 






<h4>Reference</h4>

- http://zh.highscore.de/cpp/boost/filesystem.html



## Basic Concepts

##### 头文件

```c++
#include <boost/filesystem.hpp>

using namespace boost::filesystem
```

##### 编译

编译的时候需要链接

```shell
-lboost_filesystem
```

如果不是标准路径，编译添加boost库文件与动态路径

```shell
-I $(BOOST)/include/
-L $(BOOST)/lib/
```



## Path

`boost::filesystem::path` 类，提供路径表示与处理的方法

##### path 的构建

```c++
path dir("C:\Windows");  // 由字符串构建路径
dir /= "System32";    //  /= 表示追加下级目录   += 只表示字符串拼接
dif /= "test.exe";
```

##### path提供的方法

```c++
std::cout << dir.string() << std::endl;            //转换成std::string 类型
std::cout << dir.file_string() << std::endl; 
std::cout << dir.directory_string() << std::endl;

std::cout << dir.root_name()<< std::endl;          //根目录命 盘符名
std::cout << dir.root_directory()<< std::endl;     //根目录："\"
std::cout << dir.root_path()<< std::endl;          //根路径："C:\"
std::cout << dir.relative_path()<< std::endl;      //相对路径:Windows\System32\services.exe
std::cout << dir.parent_path()<< std::endl;        //上级目录：C:\Windows\System32
std::cout << dir.filename()<< std::endl;           //文件名：services.exe
std::cout << dir.stem()<< std::endl;               //不带扩展的文件名：services
std::cout << dir.extension()<< std::endl;          //扩展名：.exe
```

## 常用代码


```c++
// 以下均在boost::filesystem::命名空间之下

create_directories(const Path & p);//  建立路径
bool create_directory(const Path& dp);//  建立路径 
system_complete(path);   // 返回完整路径(相对路径+当前路径) 
initial_path();             //  得到程序运行时的系统当前路径 
current_path();             //  得到系统当前路径
complete(const Path& p, const Path& base=initial_path<Path>());// 以base以基，p作为相对路径，返回其完整路径 
current_path(const Path& p);//  改变当前路径 

exists(path);            // 判断目录是否存在 
is_directory(path);      // 判断是否是路径 
is_regular_file(path);   // 判断是否是普通文件 
is_symlink(path);        // 判断是否是一个链接文件 
create_hard_link(const Path1& to_p, const Path2& from_p);// 
error_code create_hard_link(const Path1& to_p, const Path2& from_p, error_code& ec);// 建立硬链接 
create_symlink(const Path1& to_p, const Path2& from_p);// 
create_symlink(const Path1& to_p, const Path2& from_p, error_code& ec);// 建立软链接 

file_status status(path);   //  返回路径名对应的状态

space_info space(const Path& p);// 得到指定路径下的空间信息，space_info 有capacity, free 和 available三个成员变量，分别表示容量，剩余空间和可用空间。 

last_write_time(const Path& p);        //  获取最后修改时间 
last_write_time(const Path& p, const std::time_t new_time);// 修改最后修改时间 

remove(const Path& p, system::error_code & ec = singular );//  删除文件 
remove_all(const Path& p);//   递归删除p中所有内容，返回删除文件的数量 
rename(const Path1& from_p, const Path2& to_p);//  重命名 
copy_file(const Path1& from_fp, const Path2& to_fp);//  拷贝文件 
```


##### 创建目录  `create_directories()`

```c++
if(!boost::filesystem::exists(str_path)) {
    boost::filesystem::create_directories(str_path);
}
```

##### 重命名 `rename()`

- `rename(const path& frompath, const path& topath)`


##### 查看文件大小  `file_size()`

- `boost::filesystem::file_size()` 以字节数返回文件大小

```c++
#include <boost/filesystem.hpp> 
#include <iostream> 

int main() { 
  boost::filesystem::path p("C:\\Windows\\win.ini"); 
  try { 
    std::cout << boost::filesystem::file_size(p) << std::endl; 
  } 
  catch (boost::filesystem::filesystem_error &e) { 
    std::cerr << e.what() << std::endl; 
  } 
}
```

##### 获取磁盘的总空间和剩余空间   `space()`

- `boost::filesystem::space()` 用于取回磁盘的总空间和剩余空间
- 它返回一个 `boost::filesystem::space_info` 类型的对象，
- 其中定义了三个公有属性：capacity, free 和 available。 
- 这三个属性的类型均为 `boost::uintmax_t`，该类型定义于 Boost.Integer 库，通常是 `unsigned long long` 的 typedef
- 磁盘空间是以字节数来计算的。

```c++
#include <boost/filesystem.hpp> 
#include <iostream> 

int main() { 
  boost::filesystem::path p("C:\\"); 
  try  { 
    boost::filesystem::space_info s = boost::filesystem::space(p); 
    std::cout << s.capacity << std::endl; 
    std::cout << s.free << std::endl; 
    std::cout << s.available << std::endl; 
  } 
  catch (boost::filesystem::filesystem_error &e) { 
    std::cerr << e.what() << std::endl; 
  } 
} 
```

## 文件流

C++ 标准在 `fstream` 头文件中定义了几个文件流。这些流不能接受 `boost::filesystem::path` 类型的参数。为了当前可以让文件流与类型为 `boost::filesystem::path` 的路径信息一起工作，可以使用头文件 `boost/filesystem/fstream.hpp`。 

```
#include <boost/filesystem/fstream.hpp> 
#include <iostream> 

int main(){ 
  boost::filesystem::path p("test.txt"); 
  boost::filesystem::ofstream ofs(p); 
  ofs << "Hello, world!" << std::endl; 
} 
```


## 其他

##### 错误获取

- `boost::filesystem::filesystem_error`
- 进行一些操作的时候，可以使用filesystem_error获取错误

```c++
boost::filesystem::path p("/home/william/"); 
try { 
    std::cout << boost::filesystem::file_size(p) << std::endl; 
} 
catch (boost::filesystem::filesystem_error &e) { 
	std::cerr << e.what() << std::endl; 
} 
```

---



## Contact

Feel free to contact me [windmillyucong@163.com](mailto:windmillyucong@163.com) anytime for anything.

## License

[Creative Commons BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

