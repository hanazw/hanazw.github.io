---
title: 「C#-泛型约束」学习笔记
description: 泛型是C#中极其重要的一种特性，善用泛型可以很大程度上提高编写代码的效率 这里总结了泛型约束的一些使用方法，希望对你有帮助🤐
lang: zh
slug: csharp-generic-constraints
translation_key: csharp_generic_constraints
tags:
  - csharp
draft: false
published_date: "2023-03-28"
---


> 泛型约束：对泛型类型参数施加限制，用于限制可以传递到该类型参数的类型种类，共有6种

**基本语法**：

```csharp
class MyGeneric<T> where T : struct/class/new()/<base class name>/<interface name>
```

---

## 结构约束 `where T : struct`

T必须是**值类型**，可以指定除 Nullable 以外的任何值类型

（值类型有int、float、char、bool、struct、enum、byte等，值类型声明后被直接分配内存）

```csharp
public class MyGeneric<T> where T : struct { }
    
static void Main(string[] args)
{
    MyGeneric<int> myGenericint = new MyGeneric<int>();
}
```

---

## 类关键词约束 `where T : class`

T必须是**引用类型**，包括任何类、接口、委托或数组类型

（引用类型有string和class，引用类型被声明时只在栈中分配一小片内存用于容纳一个地址，其实例被创建时，才会为其在堆中分配内存，并将堆中被分配的内存地址保存到栈中）

```csharp
public class MyGeneric<T> where T : class { }

static void Main(string[] args)
{
    MyGeneric<string> myGenericstring = new MyGeneric<string>();
}
```

---

## 接口名约束 `where T : <interface name>`

T必须**继承所给名称的指定接口**，并实现其中的所有方法

可以指定多个接口约束

```csharp
public interface IMyInterface
{
    int Add(int a,int b);
    void Show();
}

public class A : IMyInterface
{
    public void Add(int a,int b)
    {
        return a + b
    }
    public void Show()
    {
        Debug.Log("This is a test.")
    }
}

public class MyGeneric<T> where T : IMyInterface { }

static void Main(string[] args)
{
    MyGeneric<A> myGenericA = new MyGeneric<A>();
}
```

---

## 类名约束 `where T : <base class name>`

T必须**是该类本身或是该类的子类**

```csharp
public class A { }

public class B : A { }

public class MyGeneric<T> where T : A { }

static void Main(string[] args){
    MyGeneric<A> myGenericA = new MyGeneric<A>();
    MyGeneric<B> myGenericB = new MyGeneric<B>();
}
```

---

## 构造约束 `where T : new()`

T必须具**有无参数的公共构造函数**

当与其他约束一起使用时，new() 约束必须最后指定

```csharp
public class A{}

public class MyGeneric<T> where T : A,new() {}

static void Main(string[] args){
    MyGeneric<A> myGenericA = new MyGeneric<A>();
}
```

---

## 泛型约束的应用

### 例：

```csharp
public class MyBaseGeneric<T> where T : MyGeneric<T> { }
```

采用了**“类名约束”**

根据定义：T必须是该类本身或是该类的子类，即T必须是MyBaseGeneric&lt;T&gt;本身或是MyBaseGeneric&lt;T&gt;的子类

故当有其他类MyGeneric想要继承MyBaseGeneric&lt;T&gt;时，T便只能为MyGeneric本身或其他已经继承了MyBaseGeneric&lt;T&gt;的类

写法为：

```csharp
public class MyGeneric : MyBaseGeneric<MyGeneric> { }
```

这样便通过类名泛型约束限制了泛型T