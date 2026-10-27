---
title: 「Algorithm4」读书笔记一：基础
description: 《算法4》第一章：基础 读书笔记
lang: zh
slug: algorithms-fourth-edition-fundamentals
translation_key: algorithms_fourth_edition_fundamentals
tags:
  - algorithms
draft: false
published_date: "2023-09-13"
---

![algorithm4](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202309132308381.png>)

> **官网：[https://algs4.cs.princeton.edu/home/](https://algs4.cs.princeton.edu/home/)**
>
> **笔记目录：[/zh/blog/algorithms-fourth-edition-index/](/zh/blog/algorithms-fourth-edition-index/)**

---


## 基础编程模型

> **《算法4》中主要采用了Java作为编程语言，而这章主要介绍了Java的语言基础**

### Java基础

#### 编译流程

Java是一个完全遵循面向对象编程思想（`OOP`）进行设计的语言，其中通过`class`来组织所有的代码

在Java中，我们编写的是后缀名为`.java`的源代码文件，每个`.java`文件中都包含着一个同名类，每个类中都可以包含一个`main`入口函数

在命令行中使用`javac`命令可以对`.java`文件进行编译，编译通过后会生成后缀为`.class`的Java字节码文件，通过`java`命令即可运行`.class`文件中的`main`函数

#### Java原理

Java是一门半解释半编译的语言，其会将源文件的高级语言先编译为Java字节码后运行在Java虚拟机（JVM）上

Java因此得以拥有了良好地跨平台性，Java字节码是不分平台的，只要对应平台实现了Java虚拟机，Java字节码即可运行在该平台上

同时Java虚拟机会在运行时对代码进行优化处理，使得Java同时拥有了比纯解释型语言更快的速度，在这一过程中还可以使得语言获得一定的运行时特性

---

### 重定向、管道与输入/输出

#### 标准输入

在Java中，`main`函数会接受一个`String[] args`类型的参数作为`main`函数的输入

而当我们使用`java`命令运行`.class`文件时（进行这一步时`.class`文件不需要输入后缀名），我们可以直接在后面追加参数作为`args`

```shell
java test abc 123 qwe
```

如在上面这行命令中，我们通过`java`命令运行了`test.class`文件，而后续的`abc`、`123`、`qwe`则为输入，即`String[] args = {"abc", "123", "qwe"};`

#### 标准输出

在一般情况下，我们可以调用`System.out`库或本书作者提供的`Stdout`库将我们想要的内容输出到控制台上

同时`Stdout`也支持格式化输出，即类似`C/C++`中的`printf()`

使用并无特殊之处，故不再详细赘述

#### 重定向

在上面的标准输入/输出中我们都是在和控制台进行交互，这在进行一些大量数据的输入/输出时并不方便

而重定向允许我们直接从文本文件中读取输入，或直接将内容输出至文件中

重定向输入操作符为`<`，输出则为`>`，在其后面追加需要读取/输出到的文件路径即可

```shell
java test < data.txt > output.txt
```

上述意思为从`data.txt`文件中读取输入，并将输出内容输出至`output.txt`

同时，重定向输入是可以和上述的标准输入混用的

```shell
java test data1.txt < data2.txt
```

如上面这段语句代表着`String[] args = {" data.txt", ...}`，`...`为从`data2.txt`中读取到的内容

#### 管道

管道是进一步的重定向，其可以将上一个`.class`文件的输出作为下一个文件的输入，操作符为`|`

```shell
java test1 100 200 | java test2
```

如上面这段语句代表将`args = [100, 200]`作为参数输入`test1.class`，后将`test1.class`的输出输入`test2.class`

---

## 数据抽象

> **数据类型指的是一组值和一组对这些值的操作的集合；本章主要介绍了数据类型的定义与使用，这个过程也被称为`数据抽象`**

### 抽象数据类型的使用

#### API与继承

我们使用API来对抽象数据类型中的函数与方法进行描述，这近似于静态方法库

同时我们可以通过继承类，覆写父类中的方法来实现API的灵活改变

#### 对象

而与静态方法库不同的是，数据类型往往需要依托于对象存在

> **对象是能够承载数据类型的值的实体**

所有对象都具有三大重要特性：

- 状态：即数据类型中的值
- 标识：即对象在内存中地址的引用
- 行为：即可对数据类型进行的操作

数据类型的实现的唯一职责就是维护一个对象的身份，这样用例代码在使用数据类型时便只需要遵守描述对象行为的API即可，无需关心对象状态的表示方法

#### 对象的创建

每种数据类型中的值都存储于一个对象中，使用`new`关键字即可实例化对象，即对象的创建

```java
Counter heads = new Counter("Header")
```

当我们使用`new`进行实例化时，系统会：

- 为对象分配内存空间
- 调用构造函数
- 返回对象的引用

我们可以用同一个类创建无数个对象

#### 对象赋值

当我们对引用类型的变量进行赋值操作时，我们实际是创建了一个别名，复制了一遍内存地址

这只是一种浅拷贝，在使用时我们应注意这点

#### 对象总结

运用数据抽象的思想编写代码的方式被称为`面向对象编程`，这是一种极其重要的编程思想

一个数据类型的实现所支持的操作有：

- 创建对象：使用`new`触发构造函数并创建对象，初始化对象中的值并返回对其的引用
- 操作对象中的值：使用和对象关联的变量调用实例方法来对对象中的值进行操作
- 操作多个对象：创建对象的数组，像原始数据类型的值一样将他们传递给方法或是从方法中返回，只是变量关联的是对象的引用而非对象本身

---

### 抽象数据类型的实现

#### `Counter`类

```java
public class Counter
{
    // 实例变量
    private final String name; // final 类似C#中的const
    private int count;

    // 构造函数
    public Counter(String id)
    {
        name = id;
    }

    // 实例方法
    public void Increment()
    {
        count++;
    }

    public int Tally()
    {
        return count;
    }

    public String toString()
    {
        return count + " " + name;
    }

    // 测试用例
    public static void main(String[] args)
    {
        Counter heads = new Counter("Heads");
        Counter tails = new Counter("Tails");

        heads.Increment();
        heads.Increment();
        tails.Increment();

        StdOut.println(heads + " " + tails);
        StdOut.println(heads.Tally() + tails.Tally());
    }
}
```

#### `VisualAccumulator`类

```java
public class VisualAccumulator
{
    private double total;
    private int n;

    public VisualAccumulator(int trials, double max)
    {
        StdDraw.setXscale(0, trials);
        StdDraw.setYscale(0, max);
        StdDraw.setPenRadius(.005);
    }

    public void AddDataValue(double value)
    {
        n++;
        total += value;
        StdDraw.setPenColor(StdDraw.DARK_GRAY);
        StdDraw.point(n, value);
        StdDraw.setPenColor(StdDraw.RED);
        StdDraw.point(n, total / n);
    }

    public double Mean()
    {
        return total / n;
    }

    public String toString()
    {
        return "Mean (" + n + " values): " + String.format("%7.5f", Mean());
    }

    public static void main(String[] args)
    {
        int T = Integer.parseInt(args[0]);
        VisualAccumulator visualAccumulator = new VisualAccumulator(T, 1.0);
        for (int i = 0; i < T; i++)
            visualAccumulator.AddDataValue(StdRandom.uniformDouble());
        StdOut.println(visualAccumulator);
    }
}
```

---

### 数据类型的设计

> **抽象数据类型是一种向用例隐藏内部表示的数据类型**

#### 封装

面向对象编程的特征之一就是使用数据类型的实现封装数据，以简化实现和隔离用例开发

封装实现了模块化编程，它允许我们：

- 独立开发用例和实现的代码
- 切换至改进的实现而不会影响用例的代码
- 支持尚未编写的程序

封装同时也隔离了数据类型的操作，这使得我们可以：

- 限制潜在的错误
- 在实现中添加一致性检查等调试工具
- 确保用例代码更明晰

封装是实现高拓展性的关键，模块化编程成功的关键在于保持模块之间的独立性

#### 设计API

设计API是构建现代软件最重要也是最有挑战的一项任务

它没有标准答案，需要经验、思考和反复的修改

> **这句格言或许有帮助：只为用例提供它们所需要的，仅此而已**

#### 算法与抽象数据类型

数据抽象天生适合算法研究，其可以让我们：

- 准确定义算法能为用例提供什么
- 隔离算法的实现和用例的代码
- 实现多层抽象，用已知算法实现其他算法

#### 等价性

当我们进行引用类型的等价性测试时，如`a == b`，我们比较的是其的引用，即比较是标识

而如果我们想进行状态的比较，可以实现`Object`类中的`equals`方法

Java约定`equals()`必须是一种等价性关系，它必须具有：

- 自反性：`x.equals(x)`为`true`
- 对称性：当`x.equals(y)`为`true`时，`y.equals(x)`也应为`true`
- 传递性：当`x.equals(y)`，`y.equals(z)`都为`true`时，`x.equals(z)`为`true`
- 一致性：当对象不变时，反复调用`x.equals(y)`的结果应相同
- 非空性：`x.equals(null)`应始终为`false`

#### 不可变性

我们可以通过`final`将某一变量标记为不可变，这意味着其在第一次赋值之后，值便无法改变了

但需要注意的是，对于引用类型，`final`只能保证引用的不变，即变量永远指向初始指定的内存，但无法保证内存中的内容不变

#### 异常与断言

- 异常：一般用于处理不受我们控制的不可预见的错误
- 断言：验证我们在代码中的一些假设

断言是一个布尔表达式，当我们运行到断言处时，如果表达式为`false`，程序会直接抛出异常

我们可以在测试中使用断言来验证我们的想法，并且帮助我们更好地debug，保证代码永远不会被系统错误终止或进入死循环；但我们不应该在实际程序中使用他们，其在实际运行中可能会被禁用

> **契约式设计：数据类型的设计者需要说明前提条件（用例在调用某个方法前必须满足的条件）、后置条件（实现在方法返回时必须达到的要求）和副作用（方法可能对对象状态产生的任何其他变更）**

---

## 背包、队列和栈

在本章中，会讲述背包（Bag）、队列（Queue）和栈（Stack）三种数据类型

### API

```java
public class Bag<T> implements Iterable<T>
{
    Bag();				// 创建空背包
    
    void add(T item);	// 添加一个元素 
    
    boolean isEmpty();	// 背包是否为空
    
    int size();			// 背包的元素数量
}

public class Queue<T> implements Iterable<T>
{
    Queue();				// 创建空队列
    
    void enqueue(T item);	// 添加一个元素
    
    void dequeue(T item);	// 删除最早添加的元素
    
    boolean isEmpty();		// 队列是否为空
    
    int size();				// 队列的元素数量
}

public class Stack<T> implements Iterable<T>
{
    Stack();			// 创建空栈
    
    void push(T item);	// 添加一个元素
    
    T pop();			// 删除最晚添加的元素
    
    boolean isEmpty();	// 栈是否为空
    
    int size();			// 栈的元素数量
}
```

#### 泛型

> **泛型，也叫做参数化类型，其可以被用来储存任意类型的数据**

我们可以用任意数据类型来替换泛型中的`<T>`

```java
Stack<String> stack = new Stack<String>();
```

#### 自动装箱

类型参数必须被实例化为引用类型，因此Java有一种特殊机制来使泛型代码能够处理原始数据类型

Java中的中的原始数据类型都有着对应的引用类型，如`Boolean`、`Byte`、`Integer`分别对应`boolean`、`byte`、`int`，Java会自动对其进行类型转换

> **自动将一个原始数据类型转换为一个封装类型被称为自动装箱，反之则为自动拆箱**

#### 背包

> **背包是一种不支持从中删除指定元素的集合数据类型，它的目的就是帮助用例收集元素，并迭代遍历所有收集到的元素**

在背包中，迭代的顺序是不确定的；我们当然可以使用栈或队列或其他数据结构来完成这一项工作，但使用背包可以说明元素的处理顺序并不重要

下面是一个基于背包的计算标准差与平均值的程序

```java
public class Test
{
    public static void main(String[] args)
    {
        Bag<Double> numbers = new Bag<Double>();

        while (! StdIn.isEmpty())
            numbers.add(StdIn.readDouble());

        int N = numbers.size();

        double sum = 0.0;
        for (double x : numbers)
            sum += x;
        double mean = sum / N;

        sum = 0.0;
        for (double x : numbers)
            sum += (x - mean) * (x - mean);
        double std = Math.sqrt(sum / (N - 1));

        StdOut.printf("Mean: %.2f\n", mean);
        StdOut.printf("Std dev: %.2f\n", std);
    }
}

// result:
// 100
// 101
// 98
// 65
// ^D
// Mean: 91.00
// Std dev: 17.38
```

#### 先进先出队列

> **队列是一种基于先进先出（FIFO）策略的集合类型**

*这在C++/C#或一些其他语言中都非常常见，不再赘述*

```java
Queue<Integer> queue = new Queue<Integer>();
```

在使用`foreach`进行遍历时，元素会以加入顺序被处理

#### 下压栈

> **栈是一种基于后进先出（LIFO）策略的集合类型**

*这在C++/C#或一些其他语言中都非常常见，不再赘述*

```java
Stack<Integer> stack = new Stack<Integer>;
```

在使用`foreach`进行遍历时，元素被处理的顺序与加入顺序相反

#### 算术表达式求值

对于字符串形式的算术表达式的求值，我们可以通过`E.W.Dijkstra`发明的双栈运算算法进行

表达式由括号、运算符和操作数组成，我们根据以下四种情况从左到右逐个将这些实体入栈处理：

- 将操作数压入操作数栈
- 将运算符压入运算符栈
- 忽略左括号
- 在遇到右括号时，弹出一个运算符，弹出所需数量的操作数，并将运算符与操作数的运算结果压入操作数栈

操作数栈上最后剩下的值即为表达式的值，下面是Java中的实现

```java
public class Evaluate
{
    public static void main(String[] args)
    {
        // Dijkstra双栈算术表达式求值算法
        Stack<String> operators = new Stack<>();
        Stack<Double> values = new Stack<>();
        while (! StdIn.isEmpty())
        {
            // 读取字符
            String s = StdIn.readString();
            // 左括号则直接跳过
            if (s.equals("("))
                continue;
            // 是运算符则压入操作符栈
            if (s.equals("+") || s.equals("-") || s.equals("*") || s.equals("/") || s.equals("sqrt"))
            {
                operators.push(s);
                continue;
            }
            // 是右括号则出栈
            if (s.equals(")"))
            {
                String operator = operators.pop();
                Double value = values.pop();
                if (operator.equals("+"))
                    values.push(values.pop() + value);
                else if (operator.equals("-"))
                    values.push(values.pop() - value);
                else if (operator.equals("*"))
                    values.push(values.pop() * value);
                else if (operator.equals("/"))
                    values.push(values.pop() / value);
                else if (operator.equals("sqrt"))
                    values.push(Math.sqrt(value));
                continue;
            }
            // 上述都不是则压入数值栈
            values.push(Double.parseDouble(s));
        }
        StdOut.println(values.pop());
    }
}

// result:
//( ( 1 + sqrt ( 5.0 ) ) / 2.0 )
//^D
//1.618033988749895
```

这段代码实际上是一个极其简单的“解释器”

---

### 集合类数据类型的实现

接下来就该来自己实现数据结构了！

#### 定容栈

我们将会从最简单的固定容量的字符串栈的实现开始，它要求用例指定一个容量且不支持迭代

```java
public class FixedCapacityStackOfStrings
{
    private String[] s;
    private int N;

    public FixedCapacityStackOfStrings(int capacity)
    { s = new String[capacity]; }

    public boolean isEmpty()
    { return N == 0; }

    public int size()
    { return N; }

    public void push(String item)
    { s[N++] = item; }

    public String pop()
    { return s[--N]; }
}
```

这是最简单的数据结构，但也是一切的基础

#### 泛型

定容栈的第一个缺点是其只能处理`String`一种类型的数据，而泛型可以解决这一问题

需要注意的是，因为一些历史遗留问题，Java不能直接创建泛型数组，但我们可以通过类型转换来实现`T[] s = (T[]) new Object[capacity];`

```java
public class FixedCapacityStack<T>
{
    private T[] s;
    private int N;

    public FixedCapacityStack(int capacity)
    { s = (T[]) new Object[capacity]; }

    public boolean isEmpty()
    { return N == 0; }

    public int size()
    { return N; }

    public void push(T item)
    { s[N++] = item; }

    public T pop()
    { return s[--N]; }
}
```

将所有`Sting`改为`T`即可

#### 动态调整数组的大小

在Java中，数组一旦创建，其大小便无法改变了；但我们可以通过动态创建更大的数组并将原来的数组复制过来来实现数组大小的动态变化

通过以下函数便可以实现动态调整数组的大小

```java
private void resize(int new_capacity)
{
    T[] temp = (T[]) new Object[new_capacity];
    for (int i = 0; i < N; i++)
        temp[i] = array[i];
    array = temp;
}
```

之后更改`push()`与`pop()`，在要溢出时扩容，利用率太低时减容，即可实现内存大小的动态调整

```java
public class ResizingArrayStack<T>
{
    private T[] array;
    private int N;

    public ResizingArrayStack(int capacity)
    { array = (T[]) new Object[capacity]; }

    public boolean isEmpty()
    { return N == 0; }

    public int size()
    { return N; }

    public void push(T item)
    {
        if (N >= array.length)
            resize(2 * N);
        array[N++] = item;
    }

    public T pop()
    {
        T item = array[--N];
        array[N] = null;
        if (N > 0 && N <= array.length / 4)
            resize(N / 2);
        return item;
    }

    private void resize(int new_capacity)
    {
        T[] temp = (T[]) new Object[new_capacity];
        for (int i = 0; i < N; i++)
            temp[i] = array[i];
        array = temp;
    }
}
```

#### 迭代

在Java中，实现迭代只需要让对应类继承`Iterable<T>`接口，并实现对应方法即可

```java
public interface Iterable<T> 
{
    Iterator<T> iterator();
}
```

在接口中，可以看到我们需要实现一个返回值为`Iterator<T>`的`iterator()`方法即可

而`Iterator<T>`即为迭代器，迭代器中需要实现的方法如下

```java
public interface Iterator<T>
{
    boolean hasNext();
    T next();
}
```

我们声明一个内部类继承`Iterator<T>`，并实现其中的方法即可

```java
private class ReverseArrayIterator implements Iterator<T>
{
    private int i = N;
    public boolean hasNext()
    { return i > 0; }

    public T next()
    {
        i--;
        return array[i];
    }
}
```

> **迭代器的实现对于数据类型的封装是十分重要的，其可以让外部完全不关系内部实现，使用迭代器即可完成对内部元素的遍历**

#### 最终实现

```java
public class ResizingArrayStack<T> implements Iterable<T>
{
    private T[] array;
    private int N;

    public ResizingArrayStack(int capacity)
    { array = (T[]) new Object[capacity]; }

    public boolean isEmpty()
    { return N == 0; }

    public int size()
    { return N; }

    public void push(T item)
    {
        if (N >= array.length)
            resize(2 * N);
        array[N++] = item;
    }

    public T pop()
    {
        T item = array[--N];
        array[N] = null;
        if (N > 0 && N <= array.length / 4)
            resize(N / 2);
        return item;
    }

    private void resize(int new_capacity)
    {
        T[] temp = (T[]) new Object[new_capacity];
        for (int i = 0; i < N; i++)
            temp[i] = array[i];
        array = temp;
    }

    public Iterator<T> iterator()
    {
        return new ReverseArrayIterator();
    }

    private class ReverseArrayIterator implements Iterator<T>
    {
        private int i = N;
        public boolean hasNext()
        { return i > 0; }

        public T next()
        {
            i--;
            return array[i];
        }
    }
}
```

`ResizingArrayStack<T>`已经是一个颇具雏形的数据类型了，但在具体实现上，其还有着一定的问题

在进行`push()`与`pop()`操作时，数组的大小会被调整，这种调整的规模是呈指数上升的，这对内存与性能都并不友好，而使用链表可以解决这一缺陷，并以一种完全不同的方式组织数据

---

### 链表

> **链表是一种递归数据结构，它或为空，或为含有泛型元素的结点和指向另一个结点的引用**

*链表的基础概念较为简单，且笔者之前已经学过很多遍，此处不再赘述*

- 链表可以处理任意数据类型的数据
- 链表所需的空间总是和集合的大小成正比
- 链表操作所需时间总是和集合大小无关

在上一章我们通过数组实现了可动态调整大小可迭代的下压数组

而使用链表来实现它们一样可以：

```java
public class LinklistStack<T> implements Iterable<T>
{
    private class Node
    {
        T value;
        Node next;
    }

    private Node head;
    private int N;

    public boolean isEmpty()
    { return head == null; }

    public int size()
    { return N; }

    public void push(T value)
    {
        Node newNode = new Node();
        newNode.value = value;
        newNode.next = head;
        head = newNode;
        N++;
    }

    public T pop()
    {
        T value = head.value;
        head = head.next;
        N--;
        return value;
    }

    public Iterator<T> iterator()
    {
        return new LinklistIterator();
    }
    
    private class LinklistIterator implements Iterator<T>
    {
        private Node current = head;
        public boolean hasNext()
        { return current.next != null; }

        public T next()
        {
            T value = current.value;
            current = current.next;
            return value;
        }
    }
}
```

> **在结构化存储数据集时，链表是数组的一种重要的替代方法**

---

### 总结

在研究一个新的应用领域时，我们应按照以下步骤识别目标并使用数据抽象解决问题：

- 定义API
- 根据特定的应用场景开发用例代码
- 描述一种数据结构（一组值的表示），并在API所对应的抽象数据类型的实现中根据它定义类的实例变量
- 描述算法（实现一组操作的方法），并根据它实现类中的实例方法
- 分析算法的性能特点

---

## 算法分析

> - **我的程序会运行多长时间**
> - **我的程序会耗费多少内存**
>
> **这是我们在编写代码时会不可避免地遇到的两大问题，而为这些基础问题给出答案实际上并不困难**

### 数学模型

根据Knuth的理论，尽管有着许多复杂因素影响着程序的效率，但原则上我们总可以构建出一个数学模型来描述任意程序的运行时间

一个程序的运行时间主要和两点有关：

- 执行每条语句的耗时
- 执行每条语句的频率

前者取决于计算机硬件和操作系统，后者取决于程序本身和输入，而我们最需要关注的便是后者

#### 近似

对于语句频率的分析往往会使我们得到一个复杂冗长的表达式，如对于下面这段程序而言

```java
for (int i = 0; i < N; i++)
    for (int j = i + 1; j < N; j++)
        for (int k = j + 1; k < N; k++)
            sum++;
```

得到的语句频率表达式为：$N(N-1)(N-2)/6=N^3/6-N^2/2+N/3$

这并不直观，但我们可以发现，当N比较大时，首项之后的其他项都相对较小

如对于$N=1000$，$-N^2/2+N/3\approx499667$，这相对于$N^3/6\approx166666667$来说小了非常多，以至于可以省略

所以我们可以舍去除首项外的其他项来大大简化我们的表达式，从而得到一个$N^3/6$

而实际上我们还可以进一步的简化，在首项的基础上舍去常数量，我们即可得到算法的`增长数量级`，如$N^3$

> **增长数量级（大O表示法）是一个非常重要的概念，其可以非常简单直观地表示一个算法的抽象效率，且与算法的具体实现无关**

#### 成本模型

上述的增长数量级非常简单直观，但如果我们想要一种更加系统性且可以量化的方法来对算法的性能进行精确的比较或预测，我们便可以使用成本模型

> **成本模型是一个用于评估算法性能的概念框架，其定义了哪些操作或资源应该被计算，以及是如何进行计算的**

在算法分析中，成本模型用于：

1. **确定算法效率**：通过计算算法执行中某些操作的数量，可以评估算法的运行时间。例如，在排序算法中，可能会计算比较和交换的次数
2. **比较算法**：成本模型允许我们在同一基础上比较不同算法的性能。通过分析不同算法在相同成本模型下的行为，我们可以确定哪种算法更有效
3. **预测性能**：通过对算法在不同输入大小下的成本进行数学建模，我们可以预测算法在更大输入上的行为

在选择成本模型时，通常会选择对于特定算法和问题域来说最具代表性和影响力的操作。例如，在分析快速排序算法时，比较和交换可能是成本模型中最重要的操作，而在分析图算法时，可能会更关注边和顶点的遍历次数

#### 总结

对于大多数程序，得到其运行时间的数学模型所需步骤如下：

- 确定输入模型，定义问题的规模
- 识别内循环
- 根据内循环中的操作确定成本模型
- 对于给定输入，判断这些操作的执行频率

---

### 倍率实验

倍率实验是一种估计运行时间的增长数量级的简单方法，我们通过倍率实验可以越过程序本身直接测试并预测出算法的运行效率

通过下面的方法我们便可以对一段程序进行倍率实验：

- 使用一个输入生成器生成各规模的输入
- 不断提高输入规模并重新运行程序
- 直到运行时间与上一次的运行时间比值趋近于$2^b$

由此便可以得到倍率实验的结果，而被测程序的增长数量级便近似为$N^b$

而，之所以运行时间的比值会趋近于一个常数是因为`倍率定理`

> **倍率定理：**
>
> 如果$T(N) \backsim aN^b \lg N$，那么$T(2N)/T(N) \backsim 2^b$

---

### 处理对于输入的依赖

我们通常采用大O表示法，即增长数量级来描述算法的效率，但需要注意的是，随着输入内容及规模的改变，算法的效率很可能会发生非常大的变化，这时我们便需要进行更为细致的分析

#### 输入模型

一种方法是更加小心细致地选择输入模型，如让输入模型足够适应现实情况

这种方法往往会面临以下两个缺点：

1. 输入模型可能是不切实际的
2. 对输入的分析可能极端困难，所需的数学技巧远非一般的学生或程序员可以掌握

#### 对最坏情况下的性能保证

我们需要从极度悲观的视角下来估算算法的信念

虽然我们是程序的设计者，但程序的输入确是来自于各个不同的用户（其中或许包含着恶意），我们需要确保即使程序接收到了异常规模的数据也不会直接崩溃，这是为性能做的最后一层保险

#### 随机化算法

为性能提供保证的一种重要方法是引入随机性

如，大名鼎鼎的快速排序算法在最坏最坏的情况下性能会达到平方级别，但在输入完全随机的情况下，其在概率下的性能可以达到线性对数，要让其达到平方级的概率微乎其微

虽然概率不为0，但快速排序达到平方级的概率可能比电脑出问题的概率还低

因此，随机情况下的概率保证，在实际情况中也可以作为最坏情况下的性能保证

#### 操作序列

有些情况下，更改一次计时中某些操作的顺序也会改变程序的效率

如对于一个下压栈来说，一次性压入N个对象再将它们全部弹出所需的时间，和将这些操作混合进行所需的时间可能完全不同

我们需要将这些情况也考虑进去

#### 均摊分析

提供性能保证的另一种方法是通过记录所有操作的总成本并除以操作总数来将成本均摊掉

这种方法可以用于分析一些每次调用的成本可能不同的方法，如之前实现的可动态调整大小的栈

---

### 内存

Java是基于JVM运行的，得益于此，其拥有自动内存管理的能力，但也正因此，其过高的内存占用常常被诟病，而JVM对于内存管理的实现也是高度依赖于硬件的，不同的操作系统与硬件会带来截然不同的内存分配策略与大小

但幸运的是，我们只是一个程序编写者~~臭写代码的~~，我们不必关心不同系统的JVM对于内存的具体实现，基本上只需要专注于基础数据类型与对象即可

每个基础数据类型就像内存世界中的原子，一切对象都基于他们而展开，而他们所占用的内存空间往往是固定的

#### 对象

而对于一个对象而言，我们只需要将所有实例变量所用的内存与对象本身的开销（一般为16字节）相加即可

如，一个`Integer`对象会使用24字节，其中包含16字节的对象开销，4字节`int`值以及4个填充字节

#### 链表

链表属于嵌套的非静态类，其中需要额外8个字节用于指向外部类的引用

对于下面的`Node`类而言，一共需要40字节的开销，其中包含16字节的对象开销，指向`Item`和`Node`的引用各8字节，另外加上8字节的额外开销

```java
class Node
{
    Item item;
    Node next;
}
```

#### 数组

Java中数组被实现为对象，它们一般都会因为记录长度而需要额外的内存

一个原始数据类型的数组一般需要24字节的头信息，其中包含16字节的对象开销，4字节用于保存长度以及4个填充字节

头信息再加上保存值所需的内存即为总内存开销

总的来说，与对象的计算方法类似

#### 字符串对象

String的标准实现中含有4个实例变量：

- 一个指向字符数组的引用：8字节
- 一个描述字符数组偏移量的int值：4字节
- 一个计数器int值：4字节
- 一个散列int值：4字节

故String对象将会额外使用40字节：16字节对象开销、3个int变量各4字节、数组引用的8字节、4个填充字节

#### 字符串的值和子字符串

一个长度为N的String对象一般需要使用40字节加上（24+2N）字节

但考虑到字符串经常会和子字符串打交道，但字符串值的复制会产生很大的开销，所以Java会希望尽量避免在创建字符串时进行字符串的复制

所以当我们调用`substring()`时，我们虽然仍然会创建一个新对象，但其中数组引用可以指向旧数组，只需改变偏移量与长度即可

因此，一个子字符串所需的额外内存是一个常数，构建一个子字符串所需的时间也是常数

---

### 展望

良好的性能是非常重要的，效率极低的程序几乎和不正确的程序一样无用，因此关注程序的运行开销是重要的

但在编程领域中，有两个常见错误时常发生

- 其一是过于关注的程序的性能

我们应先明白，我们的首要任务是写出清晰而明确的代码，而非花费大量时间却只让程序快了0.1秒

特别是在计算机硬件如此发达的今天，对于一个运行只需要一瞬的程序而言，即使你让他快了10倍也是无关紧要的

而快速排序的发明者Hoare也曾说过：”**不成熟的优化是所有罪恶之源。**“

- 其二是完全忽略了程序的性能

较快的算法往往比暴力求解复杂许多，这也导致了一部分人不愿意应付它们，但实际上，有时候几行代码的优化便可以带来成倍的性能提升

同时，当我们面临大规模问题时，寻找更好的算法是我们的唯一解

---

## 案例研究：union-find算法

下面让我们从一个实际案例入手，开始我们真正意义上的算法学习吧！

### 问题描述：动态连通性的判定

如下图所示

![img](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202310071311415.png)

假设我们输入了一组整数对，即上图中的`(4, 3) (3, 8)`等等，每对整数代表这两个points/sites是连通的。那么随着数据的不断输入，整个图的连通性也会发生变化，从上图中可以很清晰的发现这一点。同时，对于已经处于连通状态的points/sites，直接忽略，比如上图中的`(8, 9)`

---

### 动态连通性的应用

- 网络连接判断

如果每个pair中的两个整数分别代表一个网络节点，那么该pair就是用来表示这两个节点是需要连通的。那么为所有的pairs建立了动态连通图后，就能够尽可能少的减少布线的需要，因为已经连通的两个节点会被直接忽略掉

- 变量名等价性

某些编程环境允许声明两个等价的变量名（指向同一个对象的多个引用），在一系列别名被声明后，系统需要能够判别两个给定的变量名是否等价

- 数学集合

在更高的抽象层次上，可以将输入的所有整数看做属于不同的数学集合，在处理一个整数对pq时，我们是在判断它们是否属于相同的集合，如果不是，我们会将p所属的集合和q所属的集合归并到一个集合中

---

### 实现

#### API与框架

```java
public class UnionFind
{
    private int[] id;
    private int count;

    public UnionFind(int N)
    {
        count = N;
        id = new int[N];
        for (int i = 0; i < N; i++)
            id[i] = i;
    }

    public int getCount() { return count; }

    public boolean connected(int p, int q) { return find(p) == find(q); }

    public int find(int k) // todo

    public void union(int p, int q) // todo

    public static void main(String[] args)
    {
        int N = StdIn.readInt();
        UnionFind uf = new UnionFind(N);
        while (!StdIn.isEmpty())
        {
            int p = StdIn.readInt();
            int q = StdIn.readInt();
            if (uf.connected(p, q))
                continue;
            uf.union(p, q);
            StdOut.println(p + " " + q);
        }
        StdOut.println(uf.getCount() + "components");
    }
}
```

- `int id[]`：标识符数组，索引为触点值
- `void union(int p, int q)`：如果两个触点在不同分量中，`union()`会将两个分量归并

- `int find(int k)`：返回给定触点所在分量的标识符
- `boolean connected(int p, int q)`：判断两个触点是否处于同一个分量中
- `int getCount()`：返回所有连通分量的数量

#### `quick-find`算法

我们可以引入“标识值”概念来表示某一分量，即同一分量的标示值都相同

直接将`id[p]`作为`p`触点的标识值，那么若`id[p]==id[q]`，则p和q是连通的

如此一来我们只需要保证将同一分量的触点的标识符都统一即可

- `int find(int k)`：返回`id[k]`的值即可
- `void union(int p, int q)`：先判断q、p是否连通，如果是则直接返回，如果不是那么遍历`id`，将`id`中所有标识值等于`id[p]`的改为`id[q]`即可

```java
public int find(int k) { return id[k]; }

public void union(int p, int q)
{
    int pID = id[p];
    int qID = id[q];
    
    if (pID == qID)
        return;
    
    for (int i = 0; i < id.length; i++)
        if (id[i] == pID) id[i] = qID;
    count--;
}
```

> **分析：在`quick-find`中，`find()`操作非常快，但是`union()`每次都需要遍历整个数组，当问题规模较大时效率较低，其时间复杂度约为$N^2$**

#### `quick-union`算法

在`quick-find`中，同一分量中所有元素都拥有同一标识值

而实际上我们并不需要使得分量中的标识值都相同，也能表示一个分量

我们可以使用“单向链接”，即指向的方式来连通两个触点，一个触点的标识值为另一个与之连通的触点，若p与q是连通的，那么`id[p] = q`，即`p`指向`q`

因为分量是由单向链接的一个个触点构成，所以总会存在一个`k = id[k]`的根触点，其类似链表的头，而我们进行链接时也是对根触点进行操作

![img](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202310071807652.png)

- `int find(int k)`：找到并返回根触点
- `void union(int p, int q)`：找到需要归并的两个分量的根触点，将其中的一个指向至另一个即可

```java
public int find(int k)
{
    while (k != id[k])
        k = id[k];
    return k;
}

public void union(int p, int q)
{
    int pRoot = find(p);
    int qRoot = find(q);
    if (pRoot == qRoot)
        return;
    id[pRoot] = qRoot;
    count--;
}
```

> **分析：对于`quick-union`算法的成本分析较为困难，其效率会随着输入的改变发生很大的变化，在最好的情况下其时间复杂度可以达到线性级别，而最坏情况下其也会到达$N^2$的复杂度，但总的来说，`quick-union`虽然不能保证其在每种情况下都比`quick-find`要快，但其仍然是对`quick-find`算法的改良**

#### 加权`quick-union`算法

`quick-union`中基于“单向链接”的触点关系的组织方式是类似数据结构中的“树”的方式，而影响`quick-union`效率的一个很重要的因素便是树的深度过深，导致使用`find()`寻找根节点时，需要经历很长遍历；这一情况的产生很大程度上是由于在链接两颗树时顺序的随意，导致较深的树被链接到了较浅的树的根节点上，使得树变得越来越深，而我们若能记录每棵树的深度，并以此有顺序地进行分量的链接，`quick-union`算法的效率便可以得到大幅提升，这便是加权`quick-union`算法

![img](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202310072332226.png)

加权`quick-union`算法需要一个额外的数组来记录各个分量的深度，下面是加权`quick-union`算法的基本实现：

```java
public class WeightedQuickUnionFind
{
    private int[] id;
    private int[] size;
    private int count;

    public WeightedQuickUnionFind(int N)
    {
        count = N;
        id = new int[N];
        size = new int[N];
        for (int i = 0; i < N; i++)
        {
            id[i] = i;
            size[i] = i;
        }
    }

    public int getCount() { return count; }

    public boolean connected(int p, int q){ return find(p) == find(q); }

    public int find(int k)
    {
        while (k != id[k])
            k = id[k];
        return k;
    }

    public void union(int p, int q)
    {
        int pRoot = find(p);
        int qRoot = find(q);
        if (pRoot == qRoot)
            return;

        if (size[pRoot] > size[qRoot])
        { 
            id[qRoot] = pRoot; 
            size[pRoot] += size[qRoot];
        }
        else
        { 
            id[pRoot] = qRoot; 
            size[qRoot] += size[pRoot];
        }
        count--;
    }

    public static void main(String[] args)
    {
        int N = StdIn.readInt();
        WeightedQuickUnionFind uf = new WeightedQuickUnionFind(N);
        while (!StdIn.isEmpty())
        {
            int p = StdIn.readInt();
            int q = StdIn.readInt();
            if (uf.connected(p, q))
                continue;
            uf.union(p, q);
            StdOut.println(p + " " + q);
        }
        StdOut.println(uf.getCount() + "components");
    }
}
```

> **分析：加权`quick-union`算法的时间复杂度可以达到$\lg N$，其是三种算法中唯一可以解决大规模实际问题的算法**

**为什么使用分量的大小而非高度作为比较值？**

- 因为union-find中树的构成方式，其形成的数的高度永远不会大于大小的$\log_2N$，所以并不会造成问题，其带来的性能变化微乎其微
- union-find中树的大小更好追踪，特别是使用了路径压缩方法后，树的根节点与高度会发生变化，高度很难准确追踪

#### 最优算法：路径压缩优化

最好的算法总是大家所趋之若鹜的，而加权`quick-union`算法虽已经很优秀，但仍然还有优化空间

路径压缩方法便是很容易实现的高效优化思路，其优化思路非常简单，既然我们希望树的深度尽量小，那么让元素尽量链接在根节点上就行了，只需要为`find()`添加一个循环，将在路径上遇到的所有节点都直接链接到根节点，那么我们就能得到一个近乎完全扁平的树

```java
public int find(int k)
{
    int root = k;
    // 找到根节点
    while (root != id[root])
        root = id[root];
    // 将中间所有的节点链接至根节点
    while (k != root)
    {
        int next = id[k];
        id[k] = root;
        k = next;
    }
    return root;
}
```

这种方法简单有效，其可以产生近乎于理想情况下的树

而加上路径压缩方法后，实际情况下已经很难再对加权`quick-union`算法进行改进了

> **路径压缩的quick-union算法是解决动态连通性问题的最佳算法，其均摊效率可以接近与常数级**
