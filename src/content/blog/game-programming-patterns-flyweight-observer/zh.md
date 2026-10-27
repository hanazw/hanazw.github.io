---
title: 「游戏编程模式」读书笔记三：享元模式、观察者模式
description: 重访设计模式：享元模式、观察者模式
lang: zh
slug: game-programming-patterns-flyweight-observer
tags:
  - design-patterns
draft: false
published_date: "2023-04-03"
---

![img](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202304032232057.jpeg)

> **《游戏编程模式》-Bob Nystrom**
>
> **书籍汉化版网址：https://gpp.tkchu.me/**
>
> **笔记目录：[/zh/blog/game-programming-patterns-index/](/zh/blog/game-programming-patterns-index/)**

---

## 享元模式

### 基本定义与概念

享元模式(FlyweightPattern)是以效率为核心的设计模式，当我们有大量类似对象需要进行实例化时，如果直接一个一个类的进行创建，那其将占用大量的内存空间。而享元模式将其对象的数据分为两部分---共享部分(如材质、模型)与其他部分(如大小、坐标)分别储存，共享部分只声明一片固定空间，所有对象持有对该空间的引用，这样生成对象时便只需要关心其他部分的数据即可。

![一行树，每棵都有自己的网格、纹理、树叶，调节参数和位置朝向。](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202304032355080.png>)

![一行树，每个都有自己的参数和位置朝向，指向另一个有网格、纹理、树叶的树模型。](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202304032355211.png>)

#### 应用场景

- 有大量相同相似对象需要实例化
- 这些对象存在数据可以共享

#### 优点

- 节省内存开销，提高效率
- 在大量创建实例时更方便管理

#### 缺点

- 如果需要实例化的对象不够多，享元模式的引入反而会增加代码管理成本
- 创建对象的过程可能更加繁琐

### Unity简单实现

Unity中的预制体、材质球等本身便是应用享元模式进行开发的，如多个物体共用一个材质球等

享元的核心其实便是共享一部分不变的数据来节省空间，在Unity中通过ScriptableObject,静态类等都可以实现共享数据这一功能，同时其与建造者模式、工厂模式都有着不错的相性

以下为一些简单的实现：

```csharp
namespace FlyweightPattern
{
    /// <summary>
    /// 共享数据类(使用Struct应该也行)
    /// 在具体对象中持有该类的引用即可
    /// </summary>
    public class FlyweightClass
    {
        // 共享数据
        public int Hp;
        public float Speed;

        // 构造函数
        public FlyweightClass(int hp, float speed)
        {
            Hp = hp;
            Speed = speed;
        }
    }

    /// <summary>
    /// 共享数据SO
    /// 在菜单中右键创建SO文件或使用ScriptableObject.CreateInstance方法创建SO实例
    /// 在具体对象中持有SO文件的引用即可
    /// </summary>
    [CreateAssetMenu(fileName = "Data",menuName = "SO/Flyweight")]
    public class FlyweightSO : ScriptableObject
    {
        public int hp;
        public float speed;
    }
}
```

---

## 观察者模式

### 基本定义与概念

观察者模式(ObserverPattern)是一种可以将代码的调用与对于调用的响应分离的设计模式，这是一种极重要的设计模式，C#中的event系统便是基于观察者模式实现的。在观察者模式中，观察者拥有具体的需要执行的代码，被观察者则仅需要负责发出通知，观察者监听到了对应的通知就会执行对应的代码。当我们编写被观察者的其他代码时，便无需关心奇怪的耦合问题，只需要专注于被观察者本身，在需要触发对应事件的时候发出通知即可。

#### 应用场景

- 当一个事件会触发一个或多个分属于不同系统的行为时
- 当程序耦合严重时，观察者模式可以解除观察者与被观察者之间的依赖

#### Unity简单实现

*此处我直接实现了事件中心，这也是观察者模式的一种体现，引入了事件中心类作为第三方管理者统一订阅与触发事件

```csharp
namespace ObserverPattern
{
    public static class EventCenter
    {
        private static readonly Dictionary<string, Action> Events = new Dictionary<string, Action>();

        public static void AddListener(string key, Action action)
        {
            if (!Events.ContainsKey(key))
            {
                Events.Add(key,action);
                return;
            }
            Events[key] += action;
        }

        public static void RemoveListener(string key, Action action)
        {
            if (!Events.ContainsKey(key))
            {
                Debug.LogError($"EventCenter:can't find {key} when remove");
                return;
            }
            Events[key] -= action;
        }

        public static void Trigger(string key)
        {
            if (!Events.ContainsKey(key))
            {
                Debug.LogError($"EventCenter:can't find {key} when trigger");
                return;
            }
            Events[key]();
        }
    }
}
```