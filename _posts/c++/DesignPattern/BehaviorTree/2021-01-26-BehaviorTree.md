---
layout: post
title: "BehaviorTree(行为树)入门"
subtitle: "使用行为树模式，让机器人实现复杂任务决策"
categories: [Design-Pattern]
tags: [BehaviorTree, Design-Pattern, c++, state-machine, ros]
header-img: "img/in-post/post-cpp/bg_behavior_tree.drawio.png"
date: 2021.01.26
---

>  Behavior Tree 与有限状态机是两种常用于游戏以及机器人复杂任务决策的框架，而行为树有着有限状态机所不具备的扩展性，ROS2的`Navigation2`中也引入了行为树来组织机器人的工作流程和动作执行。本文主要介绍行为树的基本概念与抽象模型，并记录BehaviorTree.CPP API的学习与笔记。

* Kramdown table of contents
{:toc .toc}



----

Created 2021.01.26 by William Yu; Last modified: 2022.07.12-V1.2.4

Contact: [windmillyucong@163.com](mailto:windmillyucong@163.com)

Copyleft! 2022 William Yu. Some rights reserved.

----

# Behavior Tree  

<img src="https://d33wubrfki0l68.cloudfront.net/a43d326da904f13fe1f6b8f4421aa90f2aaffcde/91af4/images/bt.png" alt="bt" style="zoom:25%;" />

<p style="font-size:20px;color:#176;text-align:left;">References</p> 

- API **BehaviorTree.CPP** [https://www.behaviortree.dev](https://www.behaviortree.dev)
- github [https://github.com/BehaviorTree/BehaviorTree.CPP/](https://github.com/BehaviorTree/BehaviorTree.CPP/)
- post: ROS2中的行为树 [https://www.guyuehome.com/38442](https://www.guyuehome.com/38442)
- paper: [Behavior Trees in Robotics and AI](https://arxiv.org/pdf/1709.00084.pdf)
  - 该文详细介绍了行为树，并且对比了行为树和状态机之间的优劣。




## Ch1. 基本概念

<img src="/img/in-post/post-cpp/behavior_tree.drawio.png" alt="img" style="zoom:50%;" align='center' text ="behavior_tree.drawio.png"/>

<small class="img-hint">Fig1. Btree</small>


### 0. Basic Concepts

##### keywords


所有节点汇总

- ControlNode 控制节点
  - SequenceNode 序列节点
    - SequenceNode 普通顺序节点
    - SequenceStarNode
    - ReactiveSequence
  - Selector 选择节点
    - FallbackNode
    - ReactiveFallback
    - IfThenElseNode
    - ManualSelectorNode
    - SwitchNode
    - WhileDoElseNode
  - ParallelNode 并行节点

- ConditionNode 条件节点

- ActionNode 行为节点
  - 同步节点 SyncActionNode
    - AlwaysFailureNode
    - AlwaysSuccessNode
    - PopFromQueue
    - SetBlackboard
  - 异步节点 AsyncActionNode
  - 协程节点 CoroActionNode

- 装饰节点
  - ...



##### sentence

- 行为树有三类主要节点：

  ![UMLå±æ¬¡ç»æ](https://behaviortree.github.io/BehaviorTree.CPP/images/TypeHierarchy.png)

  - 根节点

  - 逻辑控制类节点(Control Node)
    - 选择节点 Priority / Selector / Fallback_node / Fallback_star_node 
      - 规则：从begin到end迭代执行自己的Child Node：如遇到一个Child Node执行后返回True，那停止迭代，本Node向自己的Parent Node也返回True；否则所有Child Node都返回False，那本Node向自己的Parent Node返回False。
      
    - 并行节点 ParallelNode
    
      - 规则：从头到尾，平行执行所有的节点。
        - Parallel Selector Node: 有一个子节点True返回True，否则返回False。
          Parallel Sequence Node: 有一个子节点False返回False，否则返回True。
          Parallel Fall On All Node: 所有子节点False才返回False，否则返回True。
          Parallel Succeed On All Node: 所有子节点True才返回True，否则返回False。
          Parallel Hybrid Node: 指定数量的子节点返回True或False后，才决定结果。
    
    - 序列节点 Sequence Node / Sequence Star Node
      - 规则：从头到尾，按顺序执行每一个子节点，遇到False停止。
    
  - 行为节点
  
  - 条件节点
  
    - 条件装饰节点 一般用来作为额外的附加条件，包括间隔控制，次数控制，频率控制等
    - 反转
    - Retry
  
- 对于有限状态机FSM，每个节点表示一个状态，而对于BT，每个节点表示一个行为。

- 每个行为节点有4种运行状态：

  - 空闲 Idle
  - 运行中 Running
  - 完成 Success
  - 失败 Failure


Example

![FallbackNodes](https://d33wubrfki0l68.cloudfront.net/a439a88fb0157cc53b935a04426edd91a18f6bb7/40c92/images/fallbackbasic.png) 

### 1. 根节点 root

// todo



### 2. 控制类节点 Control Node (重点)

控制类节点划分为 序列节点，并行节点，选择节点。

##### 2.1 序列节点

- [https://www.behaviortree.dev/sequencenode/](https://www.behaviortree.dev/sequencenode/)

e.g.

![ç®åçåºåï¼å°ç®±](https://behaviortree.github.io/BehaviorTree.CPP/images/SequenceBasic.png)

- 三种序列节点

  - Sequence
  - SequenceStar
  - ReactiveSequence

- 三种序列节点共有的规则

  - 执行有顺序，从左到右依次执行

  - 如果子节点返回success，执行下一个子节点
  - 如果中间有任何一个子节点返回failure，不再执行后面的子节点，Sequence直接退出，并向自己的父节点返回failure
  - 所有子节点都返回success时，Sequence向父节点返回success
  - 在第一个子节点执行前，序列节点的状态变为  **RUNNING**

- 三种序列节点的区别

 | Type of ControlNode | Child returns FAILURE | Child returns RUNNING |
 | ------------------- | --------------------- | --------------------- |
 | Sequence            | Restart               | Tick again            |
 | SequenceStar        | Tick again            | Tick again            |
 | ReactiveSequence    | Restart               | Restart               |

  - "**Restart**" means that the entire sequence is restarted from the first child of the list. （个人理解为：比如对于SequenceNode，当一个子节点返回失败的时候，会触发Restart，这个restart的意思是，下一次调用这个SequenceNode的时候会从头开始执行每一个子节点，所以个人认为，上述原文描述再加几句："**Restart**" means that the entire sequence <u>will be</u> restarted from the first child of the list, <u>when the next time this sequence is ticked</u>.）   
  - "**Tick again**" means that the next time the sequence is ticked, the same child is ticked again. Previous sibling, which returned SUCCESS already, are not ticked again.

###### 2.1.1 Sequence Node

![SequenceNode](https://d33wubrfki0l68.cloudfront.net/e2959ca111872777e48b0838ef94ab61b82d747a/06947/images/sequencenode.png)

相当于如下 pseudocode

```c++
BT::NodeStatus Sequence() {
    status = RUNNING;
    // _index is a private member
    while(_index < number_of_children) {
        child_status = child[_index]->tick();
        if( child_status == SUCCESS ) {
            _index++;
        }
        else if( child_status == RUNNING ) {
            // keep same index
            return RUNNING;
        }
        else if( child_status == FAILURE ) {
            HaltAllChildren();
            _index = 0;
            return FAILURE;
        }
    }
    // all the children returned success. Return SUCCESS too.
    HaltAllChildren();
    _index = 0;
    return SUCCESS;
}
```

###### 2.1.2 ReactiveSequence

![ReactiveSequence](https://d33wubrfki0l68.cloudfront.net/65527bf6239cc40f28656c361a2394c66657c314/5f443/images/reactivesequence.png)

相当于如下伪代码

```c++
BT::NodeStatus ReactiveSequence() {
    status = RUNNING;

    for (int index=0; index < number_of_children; index++) {
        child_status = child[index]->tick();

        if( child_status == RUNNING ) {
            return RUNNING;
        }
        else if( child_status == FAILURE ) {
            HaltAllChildren();
            return FAILURE;
        }
    }
    // all the children returned success. Return SUCCESS too.
    HaltAllChildren();
    return SUCCESS;
}
```

###### 2.1.3 SequenceStar

![SequenceStar](https://d33wubrfki0l68.cloudfront.net/c0e72e483eb3e4e71fc86063aebd8293abf55b73/8c908/images/sequencestar.png)

相当于如下伪代码

```c++
BT::NodeStatus SequenceStar() {
    status = RUNNING;
    // _index is a private member

    while( index < number_of_children) {
        child_status = child[index]->tick();

        if( child_status == SUCCESS ) {
            _index++;
        }
        else if( child_status == RUNNING || 
                 child_status == FAILURE ) {
            // keep same index
            return child_status;
        }
    }
    // all the children returned success. Return SUCCESS too.
    HaltAllChildren();
    _index = 0;
    return SUCCESS;   
}
```

###### 2.1.4 总结

如上三种Node之间的区别就已经比较明确了：

- Reactive Sequence 每一次被调用都会从头开始执行
- Sequence 有一个全局静态标记
  - Sequence 每一次被调用，都是去执行标记的节点
  - 这个标记 指向 RUNNING状态的节点
    - 如果RUNNING子节点返回FAILURE，标记清空，下一次被调用时从头再来
    - 如果RUNNING子节点返回SUCCESS，标记后移，指向下一个子节点
- SequenceStar 有一个全局静态标记
  - SequenceStar 每一次被调用，都是去执行标记的节点
  - 这个标记 指向 RUNNING 状态的节点
    - 如果RUNNING子节点返回FAILURE，标记并不会清空，还指向当前子节点，下一次被调用时从失败的地方继续
    - 如果RUNNING子节点返回SUCCESS，标记后移，指向下一个子节点

从游戏的角度举例理解，非常有趣（再一次感受到，行为树所尝试的事情，是抽象现实世界的行为）

- Reactive Sequence 是不支持存档的游戏，第二次打开要从头开始过关。
  - 如果第一次打开后已经过了某一关，则第二次打开时候需再过一次
  - 如果第一次打开后某一关是异步的且正在进行，则第二次打开之后到这一关的时候接回之前的进度条
- Sequence 支持存档，过一关存一个档，下次打开还可以从第一次打开的进度的地方继续进行，但是一旦死亡，存档也会丢失，只有一条命
- Sequence Star 支持存档，过一关存一个档，下次打开还可以从存档的地方继续进行，即便死亡，也不会丢档，有无数条命，原地复活

补充说明：

- 当然你需要明确的一点是：序列节点的效果，不仅由序列节点的不同而异，还要考虑子执行节点是同步还是异步，如果你的子执行节点是同步的，它会阻塞父节点，此时SequenceNode任期内不可能发生第二次tick，几种顺序节点就没区别了



##### 2.2 并行节点 ParallelNode 


- 并行节点同时执行所有的子节点
- 但是并不是在不同的线程里执行
  - 意味着如果所有的子节点都是同步节点，那还是相当于在一个一个按照顺序执行
  - 如果所有的子节点都是异步节点，则这些节点同时进行
  - 如果子节点是一个异步节点，后面跟一个同步节点，则这两个节点也可以同时进行
  - 如果子节点是一个同步节点，后面跟一个异步节点，则会被这个同步节点阻塞
- 并行节点是唯一一个可以存在多个RUNNING子节点的节点

- 有成功阈值和失败阈值
- 当成功的子节点数量或者失败的子节点数量达到阈值，则halt其余还在running的子节点，并且向父节点返回结果
- 阈值为-1表示等于子节点的数量
- 默认失败阈值为-1



##### 2.3 选择节点 Fallback / ReactiveFallback Node 

- [https://www.behaviortree.dev/fallbacknode/](https://www.behaviortree.dev/fallbacknode/)
- 又称为 "Selector" or "Priority"

e.g. 

![FallbackNodes](https://behaviortree.github.io/BehaviorTree.CPP/images/FallbackBasic.png)

- 两种选择节点
  - Fallback
  - ReactiveFallback
- 共同特点
  - 在执行子节点之前，将当前节点的状态设置为 RUNNING
  - 按照顺序执行子节点
  - 如果子节点返回FAILURE，执行下一个子节点
  - 如果最后一个子节点也返回失败，则向当前节点的父节点返回失败
  - 一旦某一个子节点返回成功，Fallback直接向父节点返回success，不再执行后面的节点
- 区别
  - Fallback 有一个全局静态变量 标志，指向当前在执行的子节点
  - Fallback 被调用的时候会执行 标志指向的子节点
    - 如果子节点返回失败，执行下一个
    - 如果子节点返回成功，标志清空，不再执行后面的子节点，当前节点退出并向父节点返回成功
  - ReactiveFallback 每次被调用的时候都会从头开始执行



### 3. 装饰器节点 Decorator Node  

##### 3.1 用处

- 转接子节点接收的结果，可以取反
- 终止子节点
- 重复执行子节点

e.g.

![hello](https://behaviortree.github.io/BehaviorTree.CPP/images/DecoratorEnterRoom.png)

### 4. 行为节点 Action Node 

行为节点又细分为 异步节点，同步节点，和协程节点。

#### 4.1 四种状态

- 空闲 Idle
- 运行中 Running
- 完成 Success
- 失败 Failure

#### 4.2 三种**行为节点**  (重点)

##### 4.1.1 AsyncActionNode  异步节点

- 被触发时, 返回running
- 会在另外一个线程中执行，不阻塞父节点所在的线程
- 用于处理具有以下特性的任务：
  - 花很长时间才能得出结论的任务
  - 可以停止
  - 可以返回“running”

##### 4.1.2 SyncActionNode  同步节点

- 不可能返回running
- 在父节点所在的线程内执行，会阻塞父节点所在的线程

##### 4.1.3 CoroActionNode  协程节点

- coroutine node 
- 可能返回running，也可能不反悔running
- 在父节点所在的线程内另开一个协程执行，不会阻塞父节点的线程
- 不会产生一个新的线程，效率更高

### 5. 条件节点 ConditionNode

- 非常简单
- 条件满足，返回成功
- 条件不满足，返回失败

### 6. Blackboard

- https://blog.csdn.net/Travis_X/article/details/87772326?utm_medium=distribute.pc_relevant.none-task-blog-searchFromBaidu-18.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-searchFromBaidu-18.control

- 黑板：树的所有节点共享的**键/值**存储，本质上就是一个键值对
- A "blackboard" is a simple **key/value storage** shared by all the nodes of the Tree.
- An "entry" of the Blackboard is a **key/value pair**.
- 黑板可以分配给任何树
- 树之间也可以共享黑板
- 差不多相当于数据库

### 7. 子树

可以在不改变现有代码的情况下面扩展子树，非常有效地开发代码

![CrossDoorSubtree](https://behaviortree.github.io/BehaviorTree.CPP/images/CrossDoorSubtree.png)

### 8. XML格式

- [https://www.behaviortree.dev/xml_format/](https://www.behaviortree.dev/xml_format/)
- todo(congyu)





## Ch2. BehaviorTree.CPP

本章简单介绍Btree.cpp库的安装与使用，以创建一个简单的Btree结构为例。

### 1. Lib Install & Usage

BehaviorTree.CPP库的安装和使用

Install

```shell
git clone https://github.com/BehaviorTree/BehaviorTree.CPP.git
cd BehaviorTree.CPP
git checkout 3.8.6

mkdir build
cd build
cmake ..
make -j12
sudo make install
```

usage

```cmake
set(BINARY btree-test)
set(SOURCES
    first_tree.cpp
)

add_executable(${BINARY} ${SOURCES})
find_library(BT_LIB behaviortree_cpp_v3)
target_link_libraries(${BINARY} PUBLIC 
    ${BT_LIB}
)
```



### 2. Create a tree

> code example: t1.hello_btree

- https://www.behaviortree.dev/tutorial_01_first_tree/
- https://blog.csdn.net/whahu1989/article/details/112295130 编译与实操
- https://blog.csdn.net/Travis_X/article/details/87687914?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.control
- https://blog.csdn.net/travis_x/article/details/87693812?utm_medium=distribute.pc_relevant.none-task-blog-baidujs_title-14&spm=1001.2101.3001.4242

#### 步骤

1. 实现功能：实现函数功能，可以是简单的函数，可以是类的方法
2. 在接口中，将这些功能注册为node
3. 在main函数中，使用node搭建行为树

#### 1. 创建Node

-  可以是直接写一个简单函数

- 可以是类中的方法

- 可以是直接一个函数，并且传入BT::TreeNode &self 

- 可以是类继承行为节点

  - 此时需要继承行为节点

  - 并在类内重载tick()函数

    e.g.

    ```c++
    // 创建一个ApproachObject Node，它是SyncActionNode类型的同步行为节点。
    class ApproachObject : public BT::SyncActionNode {
      public:
        ApproachObject(const std::string& name) :
            BT::SyncActionNode(name, {}) {
        }
    
        // You must override the virtual function tick()
        BT::NodeStatus tick() override {
            std::cout << "ApproachObject: " << this->name() << std::endl;
            return BT::NodeStatus::SUCCESS;
        }
    };
    ```

#### 2. 注册Node

- 创建一个 BT::BehaviorTreeFactory factory;

- 调用生成工厂的方法来注册所有的Node

  e.g.

  ```c++
  // 注册所有的node
  inline void RegisterNodes(BT::BehaviorTreeFactory& factory) { // 传入工厂
  // The recommended way to create a Node is through inheritance.
    factory.registerNodeType<ApproachObject>("ApproachObject");
    factory.registerNodeType<SaySomething>(
        "SaySomething");  //直接指向类，则默认触发重载后的tick()方法
  
    // Registering a SimpleActionNode using a function pointer.
    // you may also use C++11 lambdas instead of std::bind
    factory.registerSimpleCondition("CheckBattery", std::bind(CheckBattery));
  
    // You can also create SimpleActionNodes using methods of a class
    static GripperInterface grip_singleton;
    factory.registerSimpleAction(
        "OpenGripper", std::bind(&GripperInterface::open,
                                 &grip_singleton));  // 直接指向具体的类内方法
    factory.registerSimpleAction(
        "CloseGripper", std::bind(&GripperInterface::close,
                                  &grip_singleton));  // 直接指向具体的类内方法
  
    // Trees are created at deployment-time (i.e. at run-time, but only
    // once at the beginning).
  }
  ```
  
- 对于简单函数，如下方式注册成node

  ```c++
    factory.registerSimpleCondition("CheckBattery", std::bind(CheckBattery));
  ```

- 对于简单类内方法，如下

  ```c++
    // You can also create SimpleActionNodes using methods of a class
    static GripperInterface grip_singleton;
    factory.registerSimpleAction(
        "OpenGripper", std::bind(&GripperInterface::open,
                                 &grip_singleton));  // 直接指向具体的类内方法
    factory.registerSimpleAction(
        "CloseGripper", std::bind(&GripperInterface::close,
                                  &grip_singleton));  // 直接指向具体的类内方法
  ```

- 对于继承行为节点的类，如下

  ```c++
    // The recommended way to create a Node is through inheritance.
    factory.registerNodeType<ApproachObject>("ApproachObject");
    factory.registerNodeType<SaySomething>("SaySomething");  //直接指向继承了行为节点的类，默认触发重载后的tick()方法
  ```

#### 3. 实现树

- 使用xml文件创建树的结构

```c++
//--------------------------------
// 设计树的结构
// clang-format off
static const char* xml_text = R"(

 <root main_tree_to_execute = "MainTree" >

     <BehaviorTree ID="MainTree">
        <Sequence name="root_sequence">
            <CheckBattery   name="battery_ok"/>
            <SaySomething   name="say_something" message="catch..."/>
            <OpenGripper    name="open_gripper"/>
            <ApproachObject name="approach_object"/>
            <CloseGripper   name="close_gripper" />
            <SaySomething   name="say_something" message="get u"/>
        </Sequence>
     </BehaviorTree>

 </root>
 )";

int main() {
  BT::BehaviorTreeFactory factory;
  DummyNodes::RegisterNodes(factory);
  auto tree = factory.createTreeFromText(xml_text);
  tree.tickRoot();

  return 0;
}
```

## Ch3. Basic Ports 

- https://www.behaviortree.dev/tutorial_02_basic_ports/

和functions一样，我们有时需要Node传参，包括传入参数，以及获取返回参数。

### 1. 传入参数 Input ports

##### 2种方法

- static strings which can be parsed by the Node,or 使用可以被Node解析的静态字符串
- "pointers" to an entry of the Blackboard, identified by a **key**.  使用指针指向Blackboard，根据key检索

##### 创建树

- 树实现时，使用 键值对 传入信息
- 可以一次性传入多个键

- 例如一个node名叫SaySomething，此时 键为message

```xml
    <SaySomething name="first"    message="hello world" />
    <SaySomething name="second"   message="{greetings}" />
```

- 前一种从xml里面读取string， 只能创建静态的信息
- 后一种回去blackboard里面查找键’greetings‘，支持动态信息

##### Node创建

- Node创建时，使用getInput<std::string>("message") 接收这个message关键词

###### 方式1：继承实现

  ```c++
/**---------------------------------------------------------------------------
 * 创建可输入信息的Node    第一种创建方式：继承
 *----------------------------------------------------------------------------*/
// SyncActionNode(synchronous action) with an input port.
// 有输入参数的同步行为节点
class SaySomething : public BT::SyncActionNode {
 public:
  // 强制构造函数格式
  // If your Node has ports, you must use this constructor signature
  SaySomething(const std::string& name, const BT::NodeConfiguration& config)
      : SyncActionNode(name, config) {}

  // 强制实现一个静态方法providedPorts
  // It is mandatory to define this static method.
  static BT::PortsList providedPorts() {
    // This action has a single input port called "message"
    // Any port must have a name. The type is optional.
    return {BT::InputPort<std::string>("message")};
  }

  // As usual, you must override the virtual function tick()
  BT::NodeStatus tick() override {
    BT::Optional<std::string> msg = getInput<std::string>(
        "message");  // 使用 TreeNode::getInput<T>(key). 方法获取参数
    // Check if optional is valid. If not, throw its error
    if (!msg) {
      throw BT::RuntimeError("missing required input [message]: ", msg.error());
    }

    // use the method value() to extract the valid message.
    std::cout << "Robot says: " << msg.value() << std::endl;
    return BT::NodeStatus::SUCCESS;
  }
};
  ```

注意：

- 最好只在tick中调用 getInput 方法

###### 方式2：简单函数的实现

- takes an instance of `BT:TreeNode` as input 
- 传入Tree Node

```c++
/**---------------------------------------------------------------------------
 * 创建可输入信息的Node    第二种创建方式：简单函数
 *----------------------------------------------------------------------------*/
// Simple function
BT::NodeStatus SaySomethingSimple(BT::TreeNode& self) {
  BT::Optional<std::string> msg = self.getInput<std::string>("message");
  // Check if optional is valid. If not, throw its error
  if (!msg) {
    throw BT::RuntimeError("missing required input [message]: ", msg.error());
  }

  // use the method value() to extract the valid message.
  std::cout << "Robot says: " << msg.value() << std::endl;
  return BT::NodeStatus::SUCCESS;
}
```

##### 注册Node

```c++
inline void RegisterNodes(BT::BehaviorTreeFactory& factory) {
  // 对于第一种方式创建的Node, 使用如下方式注册
  factory.registerNodeType<SaySomething>("SaySomething");

  // 对于第二种方式创建的Node, 使用如下方式注册
  BT::PortsList say_something_ports = {BT::InputPort<std::string>("message")};
  factory.registerSimpleAction("SaySomethingSimple", SaySomethingSimple,
                               say_something_ports);
}
```

### 2. 返回参数 Output ports

##### 创建树

```c++
static const char* xml_text = R"(
 <root main_tree_to_execute = "MainTree" >
     <BehaviorTree ID="MainTree">
        <Sequence name="root_sequence">
            <ThinkWhatToSay text="{the_answer}"/> //输出值到黑板中的键the_answer
            <SaySomething message="get answer"/>
            <SaySomething message="{the_answer}"/> // 读取黑板中的键the_answer
        </Sequence>
     </BehaviorTree>
 </root>
)";
```

##### Node创建

使用setOutput将值写入到黑板中

```c++
/**---------------------------------------------------------------------------
 * 实现返回信息的Node
 *----------------------------------------------------------------------------*/
class ThinkWhatToSay : public SyncActionNode {
 public:
  ThinkWhatToSay(const std::string& name, const NodeConfiguration& config)
      : SyncActionNode(name, config) {}

  static PortsList providedPorts() { return {OutputPort<std::string>("text")}; }

  // This Action writes a value into the port "text"
  NodeStatus tick() override {
    // the output may change at each tick(). Here we keep it simple.
    setOutput("text", "The answer is 42");
    return NodeStatus::SUCCESS;
  }
};
```

##### 注册Node

```c++
inline void RegisterNodes(BT::BehaviorTreeFactory& factory) {
  factory.registerNodeType<SaySomething>("SaySomething");
  factory.registerNodeType<ThinkWhatToSay>("ThinkWhatToSay");
}
```

以上，比较简单。

## Ch4. Generic Ports

Ports with generic types

- 在前面的教程中，我们介绍了输入和输出端口，端口的数据类型为 std::string
- 这种类型是最容易处理的，因为任何由xml传递的参数都自然而然是个string
- 接下来，我们介绍如何传递任意c++数据类型
- 对于通用简单数据类型，可以自动转换，因此重点研究用户自定义的数据类型
- 对于用户自定义数据类型，我们需要编写解析函数
  - 该解析函数将具有一定格式的字符串转换为数据类型

##### 数据

```c++
// We want to be able to use this custom type
struct Position2D { 
  double x;
  double y; 
};
```

##### 为该类型创建解析方法

- 可以定义任何解析规则，只要是完备表达的即可
- 例如此处定义字符串规则为“x;y” “-1;3”, 以；作为分割

```c++
// Template specialization to converts a string to Position2D.
namespace BT
{
    template <> inline Position2D convertFromString(StringView str)
    {
        // The next line should be removed...
        printf("Converting string: \"%s\"\n", str.data() );

        // We expect real numbers separated by semicolons
        auto parts = splitString(str, ';');
        if (parts.size() != 2)
        {
            throw RuntimeError("invalid input)");
        }
        else{
            Position2D output;
            output.x     = convertFromString<double>(parts[0]);
            output.y     = convertFromString<double>(parts[1]);
            return output;
        }
    }
} // end namespace BT
```

##### 解析方法的调用

```c++
class PrintTarget : public SyncActionNode {
 public:
  PrintTarget(const std::string& name, const NodeConfiguration& config)
      : SyncActionNode(name, config) {}

  static PortsList providedPorts() {
    // Optionally, a port can have a human readable description
    const char* description = "Simply print the goal on console...";
    return {InputPort<Position2D>("target", description)};
  }

  NodeStatus tick() override {
    auto res = getInput<Position2D>("target");
    if (!res) {
      throw RuntimeError("error reading port [target]:", res.error());
    }
    Position2D target = res.value();
    printf("Target positions: [ %.1f, %.1f ]\n", target.x, target.y);
    return NodeStatus::SUCCESS;
  }
};
```

使用getInput方法获取输入，此时自动调用convertFromString，按照规则将字符串转换为用户自定义类型，使用.value()方法获取最终数据。



## Ch5. Sequences

- https://www.behaviortree.dev/tutorial_04_sequence_star/

Sequence node 和 Reactive Sequence node 的区别与特点，前文已述





##  Ch6. Subtree

BehaviorTree是如何表达子树的呢？

- https://www.behaviortree.dev/tutorial_05_subtrees/

直接使用xml编辑即可，非常简单

```xml

static const char* xml_text = R"(
<root main_tree_to_execute = "MainTree">
	<!--------------------------------------->
    <BehaviorTree ID="DoorClosed">
        <Sequence name="door_closed_sequence">
            <Inverter>
                <Condition ID="IsDoorOpen"/>
            </Inverter>
            <RetryUntilSuccesful num_attempts="4">
                <OpenDoor/>
            </RetryUntilSuccesful>
            <PassThroughDoor/>
        </Sequence>
    </BehaviorTree>
    <!--------------------------------------->
    <BehaviorTree ID="MainTree">
        <Sequence>
            <Fallback name="root_Fallback">
                <Sequence name="door_open_sequence">
                    <IsDoorOpen/>
                    <PassThroughDoor/>
                </Sequence>
                <SubTree ID="DoorClosed"/>
                <PassThroughWindow/>
            </Fallback>
            <CloseDoor/>
        </Sequence>
    </BehaviorTree>
    <!---------------------------------------> 
</root>
 )";
```

