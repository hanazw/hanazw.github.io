---
title: 「C#-反射」学习笔记
description: 理解 C# 反射的原理，以及它在 Unity 中的应用。
lang: zh
slug: csharp-reflection
translation_key: csharp_reflection
tags:
  - csharp
draft: false
published_date: "2023-05-22"
---


## 前言

反射（Reflection）是C#中的一种强大特性，其在Unity与游戏开发中被运用于诸多方面，而我之前对其早有耳闻，但一直是一知半解、望而生畏，关于什么是反射，以及反射的具体作用一直没有一个清晰的认知。

而本文是我较为系统的学习反射的一些笔记，希望对你有帮助😆

---

## C#中的内存布局：类与类的实例化

类是C#中最为重要的概念之一，Unity的每个脚本都是一个类，编写C#代码时，几乎无时无刻都在和类打交道。

而关于类的本质，其可以被称为一种**“对类型的描述”或是“字段与方法的集合”**，类本身只是一种描述、一种声明，其说明了这个类型由那些数据和方法组成，仅此而已，其并不指向任何一片具体的内存。

而“类的实例化”过程则承担了将具体的内存与相关联的任务，所谓“实例化”便是根据类的声明为具体的实例分配内存空间的过程；对于普通的类，我们需要通过new方法对其进行实例化；而在Unity中，Unity会自动帮我们实例化挂载在`GameObject`上并继承了`Monobehavior`的类。

在我们实例化一个类时，一块具体的内存会被分配给类的数据成员，而类的成员函数则属于代码指令，会被共同编译成为指令集，存入代码段，所有这一类的实例全局共用一份。

---

## 反射的原理：类的忒休斯之船

### 类的描述与解构

在Unity中，往往存在着这样一种场景，我们将一个脚本“`GameManager`”挂载在了“`Game`”物体上，并在Inspector界面中将`GameManager`中的`int`类型的变量`a`的值改为了1，之后我们关闭了Unity工程，在重新打开该工程时，我们可以发现`GameManager`仍然在`Game`上，且变量a仍然是1。

上述场景看起来稀松平常，但若细究其中的原理便会发现其不寻常。

“挂载脚本“实际上是一个“实例化”的过程，当我们把一个脚本挂载到游戏物体上的时候，实际发生的过程是通过脚本中的类实例化了一个对象挂载到游戏物体上，而当项目被关闭，其实例自然也会被销毁，而数据会以字符串的形式被保存在`scene`文件中，当我们再次打开项目时，如果要实现上述场景，那么Unity便需要根据上次保存的字符串动态的为我们的脚本进行实例化，这并不容易。在正常场景中，若要根据字符串进行实例化，那么代码往往会变成下面这样：

```csharp
if (name == "GameManager"){
    Game.AddComponent<GameManager>();
}
else if (...)
else if (...)
```

如果用这种方式实现上述场景，便意味着每次用户更改脚本，引擎底层都需要进行更改与重新编译，这将是极其灾难性的

而问题的实质便是：**每个类都有自己独立的描述，每个类都是不同的类型，而我们无法通过统一的方式来处理不同的描述、不同的类型**

若我们能找到一种统一的方式来描述任意的类，那么这一问题便可以迎刃而解，这便是“反射”的核心，我将其称之为**类的忒休斯之船**

任一类都可以转化为这样一种描述：

- 类实例的内存大小：类的实例便是一块内存空间，我们在编译时可以获得其大小
- 数据成员信息：通过数组或其他方式，我们可以将类的数据成员的名字、类型、地址偏移等信息保存起来

如：`{“name”,type string,1},{“damage”,type int,2}`

- 成员函数信息：通过数组或其他方式，我们可以将类中的方法的名字、类型、地址等信息保存起来

如：`{“add”,type func,0xaa}`

通过这种描述，我们可以用其来表达任意不同的类型，也就是表达任意不同的类，这样统一的处理不同类便成为了可能。

### 类的重新实例化-Type类的引入

而在C#中我们会通过`System`命名空间下的`Type`类型来对具体类的信息进行存储，需要进行实例化时根据`Type`实例中的数据对具体类进行实例化。

```csharp
class FiledData {
    string name;
    int type;
    int offset;
}
class MethodData {
    string name;
    int type;
    int offset;
}
class Type {
    int size;
    List<FiledData> datas;
    List<MethodData> funcs;
}
```

以上描述了`Type`类大致的组织方式，其中存储了具体类的各个信息，通过这些信息我们便可以完整的描述一个类

根据`Type`类中的数据，引擎的底层便可以通过调用OS等API，动态的分配内存，构建不同的类型

以下是通过`Type`类构建对象的流程：

1. 编译某个类时，可以为该类生成一个`Type`类型的全局数据，其中存放了该类的描述数据

   我们可以通过`System.Type.GetType(“类名”)/typeof(T)`等API，根据类型/类名获取类的描述对象实例（即Type数据）

2. `Type`类型中，系统已经封装好了描述一个类需要的信息，包含：`FieldsInfos`（数据成员信息）、`MethodInfos`（成员方法信息）等

3. 通过反射API（`Activator.CreateInstance`），便可以根据`Type`数据构建对象

4. 在Type中可以说拥有类的一切数据，我们不仅可以构建类，同时也能更改、调用它们

---

## 反射的应用：以Unity中的反射为例

```csharp
using System;
using System.Reflection;
using UnityEngine;

// 测试类，通过反射对Data类进行操作
public class Data
{
    public int Value;
    public string Name;

    public Data(string name, int value)
    {
        this.Name = name;
        this.Value = value;
    }

    public void Show()
    {
        Debug.Log("Value:" + Value);
        Debug.Log("Name:" + Name);
    }
    
    private int Add(int a, int b)
    {
        return a + b;
    }
}

public class TestClass : MonoBehaviour
{
    private void Start()
    {
        // 构建Data类的Type对象
        Type type = Type.GetType("Data");
        ShowConstructor(type);
        ShowPublicMethod(type);
        CreateObjectByConstructor(type);
        CreateObjectByActivator(type);
    }

    // 获取构造函数的所有参数与类型
    private void ShowConstructor(Type type)
    {
        // 通过Type获取Data类中所有构造函数的信息
        ConstructorInfo[] constructorInfos = type.GetConstructors();
        foreach (var constructorInfo in constructorInfos)
        {
            // 获取每个构造函数的所有参数
            ParameterInfo[] parameterInfos = constructorInfo.GetParameters();
            foreach (var parameterInfo in parameterInfos)
            {
                Debug.Log($"类型:{parameterInfo.ParameterType}, 变量名:{parameterInfo.Name};");
            }
        }
    }
    
    // 获取类中的公开方法
    private void ShowPublicMethod(Type type)
    {
        MethodInfo[] methodInfos = type.GetMethods();
        foreach (var methodInfo in methodInfos)
        {
            Debug.Log($"方法:{methodInfo}");
        }
    }
    
    // 通过反射用构造函数动态生成对象
    private void CreateObjectByConstructor(Type type)
    {
        ConstructorInfo constructorInfo = type.GetConstructor(new []{typeof(string),typeof(int)});
        object[] parameters = { "Hmxs", 100 };
        object obj = constructorInfo!.Invoke(parameters);
        ((Data)obj).Show();
    }
    
    // 通过反射用Activator静态生成对象
    private void CreateObjectByActivator(Type type)
    {
        object[] parameters = { "Hmxs2", 200 };
        object obj = Activator.CreateInstance(type, parameters);
        ((Data)obj).Show();
    }
}
```

在上述代码中，通过C#提供的反射API对Data类进行了读取、构建

> 总的来说，反射由于API贼长，且较为繁杂，给人以非常复杂的第一印象，但实际上，反射并不难以理解
