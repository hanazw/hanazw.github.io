---
title: 「The Cherno-C++」学习笔记二（34-66）
description: TheCherno的C++系列视频被誉为最好的C++教程之一，这里记录了我的一些笔记与理解
lang: zh
slug: cherno-cpp-part-two
tags:
  - cpp
draft: false
published_date: "2023-06-01"
---

![cherno](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202306010145167.jpeg)

> **B站up神经元猫翻译版：[https://www.bilibili.com/video/BV1uy4y167h2](https://www.bilibili.com/video/BV1uy4y167h2)**

## 前言

C++因为其优异的性能，是游戏开发中最为常用的语言之一，目前的Unity与Unreal两大商用引擎的内核都是采用C++进行编写，作为一个有志于成为游戏开发者的人，这种语言怎么能不学一学呢？

本文基于油管著名博主，曾任职于EA的The Cherno的C++系列视频，The Cherno作为寒霜引擎的核心开发人员之一，对C++有着非常独到而深刻的理解

这些笔记记录了我通过The Cherno的系列视频学习C++的一些知识点与理解，希望对你有帮助😉

> 第一章（1-33）：[/zh/blog/cherno-cpp-part-one/](/zh/blog/cherno-cpp-part-one/)
>
> **第二章（34-66）：[/zh/blog/cherno-cpp-part-two/](/zh/blog/cherno-cpp-part-two/)**
>
> 第三章（67-99）：[/zh/blog/cherno-cpp-part-three/](/zh/blog/cherno-cpp-part-three/)

---

## const关键字（34）

`const`在改变生成的代码方面做不了什么，其有点类似类/结构体中的可见性

> **`const`是一个可以让我们的代码变得更干净的机制，是对开发人员编写代码的强制特定的规则，被`const`修饰的东西被承诺不会被改变**（但实际上，这个“承诺”是可以违背的，anyway，it just a promise.🤐）

```cpp
const int a = 1;
a = 2; // 这行代码会报错
```

如上面的代码所示，被const修饰的变量的值无法被改变，如果我们希望定义一个在程序中永远不变的量，那么`const`便可以出场了

`const`是一种声明变量的方式，而我们可以通过强制转换绕过`const`的限制

```cpp
const int MAX_AGE = 90;
int* a = new int;
a = (int*)&MAX_AGE;
```

通过上面的代码，我们让指针`a`指向了`const`的`MAX_AGE`,这样便绕过了`const`，但如果我们尝试通过逆向引用`a`来写入`MAX_AGE`便很可能导致程序崩溃，所以最好还是别这么干

```cpp
const int* a = new int;
int const* b = new int;
int* const c = new int;
```

上面是三种声明`const`指针的方式，其中a与b效果完全一样，而c与ab的效果相反

在a与b中，修改ab本身是被允许的，而修改ab指向的内容是被禁止的，即`a = &x`可行，而`*a = 2`不可行；而c的效果则与ab相反

当然我们也可以通过`const int* const a = new int;`来让`a`与``*a`的值都无法改变

```cpp
class Entity
{
private:
	int x_;
	mutable int mutableX_;
public:
	int GetX() const
	{
		mutableX_ = 2;
		return x_;
	}
};

void PrintX(const Entity& entity)
{
	std::cout << entity.GetX() << "\n";
}
```

上述代码是`const`的最后一种用法，在类中修饰方法（只能在类中这样用）

被`const`修饰的方法，只能对类中被`mutable`修饰的字段进行修改，如在上述`GetX()`方法中，若对`X`进行修改就会报错

**这种`const`有什么用呢？**

当我们以`const`传递类或类的引用时，只有类中的`const`方法才能被调用，因为`const`需要保证传入的引用的类无论如何都不会被更改，这种用法常常被用来修饰`getter`方法

在上面的代码中，如果`GetX()`方法没有被`const`修饰，那么在`PrintX()`中其便无法被调用

---

## mutable关键字（35）

`mutable`关键字在C++中有着两种不同的用途

一是和`const`一起使用，在上一章的最后有提到，类中被`const`修饰的方法，只能对类中被`mutable`修饰的字段进行修改，这种情况往往发生在我们需要调试程序时（这是一种近似于违背承诺的行为，最好还是别大量使用，这会破坏`const`的意义）

二是用在`lambda`表达式中，`lambda`基本上就像一个一次性小函数，你可以写出来并赋值给一个变量

```cpp
int x = 8;
auto f = [=]() mutable 
{
	x++;
	std::cout << x << "\n";
};
f();
// x = 8
```

在上面的`lambda`表达式中，如果我们想以值传递的形式传入`x`，并更改它，那么我们就必须加上`mutable`关键字

如果不使用`mutable`我们便需要创建一个局部变量来对`x`的值进行一次复制才能实现上面的效果

*（当然其实这种用法非常非常少见，The Cherno说他其实完全没见过这么用的🤣）*

---

## 成员初始化列表（36）

> **构造函数初始化列表是我们在构造函数中初始化类成员的一种方式**

当我们编写类时，通常需要通过构造函数对类的成员进行初始化

```cpp
class Entity
{
private:
	std::string name_;
public:
	Entity()
	{
		name_ = "Default";
	}

	Entity(const std::string& name)
	{
		name_ = name;
	}
};
```

我们通常会这样来完成字段的初始化，而实际上C++还提供了另外一种语法来实现这件事

```cpp
class Entity
{
private:
	std::string name_;
	int age_;
public:
	Entity()
		: name_("default"), age_(0)
	{
	}
};
```

如上述代码所示，`构造函数() : 字段1(初始值1), 字段2(初始值2)`通过这样的语法便可实现字段的初始化

*需要注意的是，通过这种方法进行初始化时，初始化的顺序是由字段声明的顺序决定的，在上述代码中，即使我们写成`: age_(0), name_("default") `，运行时仍然会按照先`name_`再`age_`的顺序初始化，所以在编写初始化代码时，最好直接按照声明的顺序来*

**为什么我们需要这玩意呢？**

- 把琐碎繁杂的初始化写在一起，让代码更加整洁易读
- 在特定情况下，使用原先的初始化方式会造成性能/内存的浪费，如下面这个例子

```cpp
class Example
{
public:
	Example()
	{
		std::cout << "Create Example" << "\n";
	}

	Example(int x)
	{
		std::cout << "Create Example" << x << "\n";
	}
};

class Entity
{
private:
	Example e_;
public:
	Entity()
	{
		e_ = Example(5);
	}
};

int main()
{
	Entity e;
	std::cin.get();
}
```

我们在`Entity`类中声明了`Example`类，并对其进行初始化，如果通过`e_ = Example(5)`的方式进行，那么`Example`的两个构造函数都会被运行，即`Create Example`与`Create Example5`都会被输出，其原因是在`Example e_`的创建中默认构造函数会先被调用，而使用初始化列表则不会有这个问题

**综上，我们应该在任何类的成员初始化场景用初始化列表来实现，我们没有理由不使用他们**

---

## 三元运算符（37）

> **三元运算符是if else语法的语法糖，可以方便地根据特定条件给变量赋值**
>
> **语法：`变量名 = 条件判断 ? 为真时的值 : 为假时的值`**

三元运算符可以帮助我们清理我们的代码，增加代码的可读性

```cpp
if (x > 1)
	y = 1;
else
	y = 2;

y = x > 1 ? 1 : 2;
```

上面的两段代码的意思其实是完全相同的

同时，如果我们需要赋的值是引用类型，那么三元运算符还能些许加快运算的速度

**需要注意的是，虽然三元运算符可以嵌套，但大量嵌套的三元运算符可读性极差，和其初衷背道而驰，而且会很想让看你代码的人砍死你，所以最好还是别用**

---

## 对象的实例化（38）

当我们编写完成了一个类之后，除非其是完全静态的，我们都需要对其进行实例化，而基本上，我们有两个实例化方法的选择：**在栈上创建/在堆上创建**，这两种方法的主要区别在于内存分配的位置

栈对象，拥有一个自动的生命周期，这由它们被声明的地方作用域决定，只要超出作用域，其内存便会被自动释放

而堆对象则不同，堆对象的内存需要我们进行手动释放

### 栈对象

```cpp
Entity e;
// or
Entity e = Entity();
```

这样便可简单实例化一个类对象

*与Jave/C#不同的是C++的`Entity e`并不单指声明，其效果等于`Entity e = Entity()`，会调用类的默认构造函数*

 **几乎所有时候，只要我们可以这样创建对象，我们都应该这样创建，这是C++中最快也是最易管控的实例化对象的方法**

### 堆对象

当我们需要显式控制类的生命周期时 或 我们需要实例化的类很大/很多（栈的内存往往很小）时，我们便需要借助堆来实例化

```cpp
Entity* e = new Entity();
```

堆对象实例化的关键便是`new`关键字，当我们调用`new Entity`时，它在堆上为`Entity`类分配内存，并返回实例化的类在堆上被分配的内存地址

*这与C#/Java中的语法相似，C#中的struct是在栈上的，而所有类都在堆上，而Java全在堆上*

### 尽量使用栈而不是堆

- 性能问题：在堆上分配内存要比栈花费更长的时间

- 操作繁琐：堆需要手动释放内存（`delete`）


---

## new关键字（39）

> **`new`是一个操作符，主要作用是在堆上分配内存，其会根据你指定的类型在堆上找到对应大小的内存空间，并返回该空间的地址，对类来说，new还会调用构造函数**
>
> **语法：`new 类型`**

```cpp
Entity* e = new Entity(); // C++风格
Entity* e = (Entity*)malloc(sizeof(Entity)); // C风格
```

上述两行代码的唯一区别便是`new`会调用构造函数，而`malloc`不会，大部分情况下`new`会调用`malloc`进行内存的分配

`delete`关键字会释放堆中的内存，如果是类，其还会调用析构函数，其也是借用C中的`free`函数实现的，这点与`new`类似

**`new`和`delete`总是应该成对出现，被`new`分配的内存只有在被`delete`释放后才能被再次使用**

---

## 隐式转换与explicit关键字（40）

> **隐式代表不需要明确地告诉类要做什么，类似于自动，编译器会通过上下文自行推导构造函数**

```cpp
class  Entity
{
private:
	std::string name_;
	int age_;
public:
	Entity(const std::string& name)
		: name_(name), age_(-1) { }

	Entity(int age)
		: name_("Default"), age_(age) { }
};

int main()
{
	Entity e1 = "Hmxs"; // 隐式转换“Hmxs”->Entity("Hmxs")
	Entity e2 = 20; // 隐式转换20->Entity(20)
	std::cin.get();
}
```

当构造函数限定条件足够多时，如类的构造函数只接受一个字符串为参数，而你又正好让类等于了一个字符串，那么编译器会为你自行推导，生成构造函数

这很酷，可以简化代码，但清晰的代码才是最好的，还是少用吧

> **`explicit`关键字则代表禁用该构造函数的隐式转换，如果你需要通过此构造函数进行类的实例化，那么你必须显式调用此构造函数**

`explicit`可以确保类型转换的安全，不会发生意外的隐式转换

---

## 运算符及其重载（41）

> **运算符是一种符号，通常代替一个函数来执行一些事情，如 `+ - * / += -> & << new delete` 等**

本质上运算符就是不用写函数名的函数，可以帮我们清理代码

而运算符重载的应用往往非常少，当我们需要运算符重载时，往往是类中一种特殊的类型需要处理或者类本身需要处理

如下面这个例子：

```cpp
struct Vector2
{
	float x, y;

	Vector2(float x, float y)
		: x(x), y(y) {}

	Vector2 Add(const Vector2& other) const
	{
		return Vector2(x + other.x, y + other.y);
	}

	Vector2 Multiply(const Vector2& other) const
	{
		return Vector2(x * other.x, y * other.y);
	}
};
```

我们实现了一个`Vector2`结构体，并想要实现向量的加法与乘法，于是我们编写了`Add`与`Multipy`函数

但如果这样实现，最后在使用时很可能会变成这样`Vector2 result = pos1.Add(pos2.Multiply(pos3));`，虽然结果没问题但是可读性很差，使用起来也并不方便

这时使用运算符重载便可以清理我们的代码，让其变得更加直观

**我们只需更改函数名为`operate+/operate*`即可重载对应运算符**

```cpp
struct Vector2
{
	float x, y;

	Vector2(float x, float y)
		: x(x), y(y) {}

	Vector2 operator+(const Vector2& other) const
	{
		return Vector2(x + other.x, y + other.y);
	}

	Vector2 operator*(const Vector2& other) const
	{
		return Vector2(x * other.x, y * other.y);
	}
};
```

之后直接使用运算符即可`Vector2 result = pos1 + pos2 * pos3;`，代码一下子便清晰了许多

**下面是重载`<<`达成类输出的的一个例子：**

如果我们想输出一个上面的`Vector2`变量，直接`cout`将会报错`std::cout << pos1 << "\n";`，而我们可以重载`<<`达成类似C#中`ToString()`的效果

```cpp
std::ostream& operator<<(std::ostream& stream, const Vector2& other)
{
	return  stream << other.x << "," << other.y;
}
```

*`cout`是C++中的流式输出方法，其实际是一个类型为`ostream`的流数据*

重载过后便可以正常输出了`std::cout << pos1 << "\n";`

---

## this关键字（42）

> **`this`是一个指向当前对象实例的指针，通过this可以访问类中的非静态字段方法**

```cpp
class Entity
{
public:
	int x, y;

	Entity(int x, int y)
	{
		this->x = x;
		this->y = y;
	}
};
```

上面是一个`this`应用的例子，当我们传入的参数与类字段名相同时，`x = x`显然是有问题的,`this`可以帮助编译器进行区分

当然，`this`本身只是一个指针，一个指向当前对象本身的指针，我们可以在类中可以像使用其他指针一样使用它，比如`Entity* e = this`

---

## 对象的生命周期（43）

作用域通常可以和一对大括号等价，而一旦超出作用域，作用域中的栈对象都会被释放

**下面是一个例子：**

```cpp
class Entity
{
public:
	Entity()
	{
		std::cout << "Create Entity" << "\n";
	}

	~Entity()
	{
		std::cout << "Destroy Entity" << "\n";
	}
};
```

在上面这个简单的`Entity`类中，当其被创建时会输出"Create Entity"，而被释放时会输出"Destroy Entity"

```cpp
int main()
{
	{
		Entity e;
	}
	std::cin.get();
}
```

在上面的main函数中，`e`在栈中被创建，当运行到第5行时作用域结束，`e`被释放，"Destroy Entity"被输出

而如果我们通过堆来创建`e`时

```cpp
int main()
{
	{
		Entity* e = new Entity();
	}
	std::cin.get();
}
```

只有"Create Entity"会被输出

**下面是另外一个关于作用域的例子：**

```cpp
int* CreateArray()
{
	int array[50];
	return array;
}
```

上面这个函数尝试创建一个数组并返回其指针，但实际上这段代码是完全错误且无效的，`int array[50]`是以栈的方式创建数组，而在函数结束时，`array`的作用域便结束了，其内存会被释放

**作用域在限制我们的同时，也为我们提供了一些有用的特性，善用作用域可以帮我们实现很多功能**

**以下是一个利用作用域实现堆对象自动销毁的例子：**

```cpp
class ScopedPtr
{
private:
	Entity* ptr_;
public:
	ScopedPtr(Entity* ptr)
		: ptr_(ptr) {}

	~ScopedPtr()
	{
		delete ptr_;
	}
};

int main()
{
	{
		ScopedPtr e = new Entity();
	}
	std::cin.get();
}
```

`ScopedPtr`包裹了一个`Entity`类的指针，在栈中创建`ScopedPtr`对象，当其超出作用域被自动销毁时，其会自动调用析构函数，在析构函数中释放包裹着的`Entity`类，以此便实现了堆`Entity`对象的自动销毁

除此之外作用域与生命周期还有很多妙用，如自动计时的Timer类，会在之后进行介绍

---

## 智能指针（44）

> **智能指针本质上是一个原始指针的包装**
>
> **当你使用智能指针时，它会调用new为你分配内存，然后基于你使用的智能指针，这些内存会在某一时刻被自动释放**

### `unique_ptr`

`unique_ptr`是作用域指针，当超出作用域时，它会被销毁然后调用delete；其不可复制，因为这会导致两个指针指向相同的内存，当其中一个将内存释放后，另一个便会指向已经被释放的内存，这会带来问题

*要使用智能指针我们需要引入`memory`头文件*

```cpp
std::unique_ptr<Entity> entity1(new Entity());
std::unique_ptr<Entity> entity2 = std::make_unique<Entity>();
```

以上是两种`unique_ptr`的使用方式，后者对异常处理更加友好

*需要注意的是`unique_ptr`的构造函数是`explicit`的，需要显式调用*

使用`unique_ptr`声明的`entity1`和`entity2`都会在作用域结束时被销毁

**`unique_ptr`是最简单的智能指针，是有用且低开销的，缺点是其不能复制**

*`std::unique_ptr<Entity> entity3 = entity2;`<-为了防止我们写出这种代码，尝试去复制`unique_ptr`，`unique_ptr`的复制构造函数和`=`操作符都被删除了，这样的代码会直接报错*

### `shared_ptr`

`shared_ptr`是共享指针，在大部分编译器中，其通过引用计数实现了智能指针的共享，每当共享指针被复制时，其内部的引用计数便会加一，当共享指针被释放时，引用计数便会减一，当引用数量为0时，共享指针才会真正释放其指向的内存

```cpp
std::shared_ptr<Entity> entity1(new Entity());
std::shared_ptr<Entity> entity2 = std::make_shared<Entity>();
```

我们仍有两种方式使用`shared_ptr`，但对于`shared_ptr`来说，后者明显更好

*在`unique_ptr`中使用`make_unique`带来的优势仅仅是会抛出异常，但对于`shared_ptr`来说，因为其需要声明一块专用的控制块内存用于存储应用计数，通过`new`进行内存分配再传递给`shared_ptr`会带来两次内存分配，而使用`make_shared`则可以将两次内存分配组合在一起，获得更好的效率*

### `weak_ptr`

`weak_ptr`通常和`shared_ptr`一起使用，`weak_ptr`可以被复制，但是同时不会增加引用计数，仅仅声明这个指针还活着

同时`weak_ptr`可以查询其指向的内存块是否被释放了

```cpp
std::weak_ptr<Entity> weak = entity2;
```

### 什么时候应该使用智能指针

根据实际情况而定，当你不需要手动管理内存时，智能指针会非常方便

在使用智能指针时，`unique_ptr`应该被优先考虑，因为其几乎没有开销，而当我们需要共享数据而`unique_ptr`无法实现时，`shared_ptr`就应该被使用了，即使其会带来一些额外的开销

---

## 复制构造函数（45）

> **拷贝指的是复制数据/内存，让一份数据拥有多个副本**

拷贝往往会耗费很多时间，但也会让我们得以实现很多功能

```cpp
int a = 1;
int b = a;
```

上面就是一个简单的值拷贝的过程，`a`和`b`是两个独立的变量

而当我们使用`new`来分配内存时，事情就会有些不同

```
int* a = new int(1);
int* b = a;
```

在上面的代码中，我们同样进行了一次拷贝，但是这次拷贝的是指针，这意味着我们创造了两个保存着相同地址的指针

但是无论如何，当你使用`=`，即赋值操作符时，你总是在拷贝值

*除引用之外，因为引用仅仅是别名，我们无法重新分配引用，只能改变其指向，并不是拷贝*

**下面会实现一个原始的字符串类，尝试让其具有可复制性：**

*这个字符串类将只采用C++的原始特性进行编写，为了让其更有教学意义*

`````cpp
class String
{
private:
	char* buffer_;
	unsigned int size_;
public:
	String(const char* string)
	{
		size_ = strlen(string);
		buffer_ = new char[size_ + 1];
		memcpy(buffer_, string, size_);
		buffer_[size_] = 0;
	}

	~String()
	{
		delete[] buffer_;
	}

	friend std::ostream& operator<<(std::ostream& stream, const String& string);
};

std::ostream& operator<<(std::ostream& stream, const String& string)
{
	stream << string.buffer_;
	return stream;
}
`````

上面的代码实现了一个基本的`String`类，其会自动分配分配/销毁内存，并且重载了`<<`操作符，让其可以接受流输出

这看起来很完善，但当我们尝试拷贝一个`String`类时，如下面的代码

```cpp
String string = "Hmxs";
String copy = string;
```

但当程序结束时，程序会崩溃，这是因为我们实际上进行的是一次浅拷贝，在`copy`实际拷贝的是`string`中的`char`类型指针，并没有重新进行堆内存的分配，所以当程序结束时，会运行两次`delete[] buffer_`去释放同一片内存，导致了程序的崩溃

**而如何使复制时进行深拷贝呢？**

我们可以创造一个新函数返回一个字符串，但这不够优雅，我们应该使用的方法是-**拷贝构造函数**

> **拷贝构造函数是一个构造函数，当你在进行拷贝操作，将一个变量的值拷贝给另一个变量，也就是使用`=`，并且`=`左右两边变量类型相同时，会调用的构造函数**

使用`类名(const 类名& 变量名){}`即可构建拷贝构造函数（如果不手动设定，C++会提供默认的拷贝构造函数）

```cpp
String(const String& other)
    : size_(other.size_)
{
    buffer_ = new char[size_ + 1];
    memcpy(buffer_, other.buffer_, size_ + 1);
}
```

如此一来，程序便不会崩溃了

但是仍有一点我们需要注意，只要我们对`String`类型的变量进行值的传递，如传递给一个函数，其就会对自己进行一次深拷贝，这会非常影响效率，而我们可以通过引用的方式进行值的传递，如`Print(const String& other)`,这样一来传递的便是变量本身，而非其复制了

在使用引用传值时，**总是、总是、总是使用const引用传递对象**，这会帮我们避免很多问题

---

## ->箭头操作符（46）

> **`x`是一个指针，拥有一个`print`方法，则`x->print()` = `(*x).print()`**

当我们想要通过指针访问类中的字段/方法时，我们往往需要先对指针做逆引用运算后，再使用`.`运算符访问其中的方法/字段，同时因为运算符优先级的问题，为了达到我们需要效果我们还需要加一个括号，最后的代码便需要写成`(*x).`，这写起来非常笨重；我们也可以通过在外面包一层引用来解决这个问题，但是这同样需要多写一行；此时箭头操作符便应运而生了，箭头操作符是上述操作的一个快捷方式而已

以上就是`->`箭头操作符的默认用法了，而作为一个操作符，我们同样可以重载它，**以下是一个例子：**

```cpp
class ScopedPtr
{
private:
	Entity* obj_;
public:
	ScopedPtr(Entity* entity)
		: obj_(entity) { }

	~ScopedPtr()
	{
		delete obj_;
	}
}
```

我们手动实现了一个Entity的智能指针类，此时我们便可以通过`ScopedPtr`来声明堆中的`Entity`类，但此时，通过`ScopedPtr`声明的类无法通过`->`操作符访问其中的方法，因为实际的类是`ScopedPtr`中的成员变量，此时我们便可以通过重载箭头操作符来达成我们想要的效果

```cpp
Entity* operator-> () const
{
    return obj_;
}
```

重载箭头操作符使其返回`ScopedPtr`中的成员变量即可

---

## 动态数组`std::vector`（47）

> **动态数组是指不定长的数组，我们创建它时不需要给定固定的内存空间，其会在运行时进行空间的动态分配**

C++STL中的动态数组被称为`vector`，但它实际上并不是数学意义上的“向量”，也不是C#中的Vector2/Vector3，其实际更像一个`ArrayList`

*至于它为什么起了个这么奇怪的名字，听说故事很复杂🤣*

**下面是C++STL中`vector`的基本使用方法：**

```cpp
struct Data // 任意数据类
{
	int x, y, z;
};

std::ostream& operator<< (std::ostream& stream, const Data& data)
{
	stream << data.x << "," << data.y << "," << data.z;
	return stream;
}

int main()
{
	// vector的创建
	std::vector<Data> vectors;

	// vector元素的添加
	vectors.push_back({ 1,2,3 });
	vectors.push_back({ 4,5,6 });

	// 元素删除
	vectors.erase(vectors.begin() + 1);

	// 遍历方法一
	for (int i = 0; i < vectors.size(); i++)
		std::cout << vectors[i] << "\n";
	// 遍历方法二
	for (Data& date : vectors)
		std::cout << date << "\n";

	std::cin.get();
}

```

**需要注意的是，传递`vector`时务必使用引用进行传递，防止对整个`vector`进行复制**

---

## `std::vector`使用优化（48）

虽然C++为我们提供了STL，但是STL中的数据结构在设计过程中，其性能往往不是最优先考虑的要素，而C++的`vector`在每次需要扩充数组容量时，都会先分配一个新的更大的空间，将原先的数据复制到新空间中，再删除原先的空间，这听上去性能就很差，而如果我们没有正确地使用它，这种分配往往会经常发生。

**下面是一种更好地使用`vector`类的方式，让`vector`的效率更高：**

先来看一个反面教材

```cpp
struct Data
{
	int x, y, z;

	Data(int x, int y, int z)
		: x(x), y(y), z(z) { }

	Data(const Data& other)
		: x(other.x), y(other.y), z(other.z)
	{
		std::cout << "Copy" << "\n";
	}
};

int main()
{
	std::vector<Data> vectors;
	vectors.push_back({ 1,2,3 });
	vectors.push_back({ 4,5,6 });
	vectors.push_back({ 7,8,9 });

	std::cin.get();
}
```

在上面的代码中，`Data`类是一个普通的数据类，其在每次被复制时都会输出一个“`Copy`”，我们创建了一个`vector`变量，并通过`push_back`方法向其中添加了3个元素，这看起来一点毛病没有，但如果我们运行这段代码，我们会发现有6个`Copy`被输出了，这意味着在加入元素的过程中，`Data`被复制了6次，这太糟糕了

而造成这6次复制的原因有两个：类的实例化 与 `vector`的扩容

- 类的实例化：在上述代码中，我们是在栈中实例化类的，而使用`push_back`方法会先在栈中给类分配内存，再将对象移动到`vector`变量处，这一过程便会进行一次类的复制；而解决方法也非常简单，**将`push_back`替换为`emplace_back`即可**，`emplace_back`会直接在`vector`变量的内存处构建类，省去了复制过程

- `vector`的扩容：C++的`vector`在每次需要扩充数组容量时，都会先分配一个新的更大的空间，将原先的数据复制到新空间中，再删除原先的空间；而**我们可以通过`reserve`方法为vector设定初始的容量**，这样在达到容量上限前都不会进行空间的复制

通过上述两个方法优化代码：

```cpp
int main()
{
	std::vector<Data> vectors;
	vectors.reserve(3);
	vectors.emplace_back(1,2,3);
	vectors.emplace_back(4,5,6);
	vectors.emplace_back(7,8,9);

	std::cin.get();
}
```

再次运行，我们可以发现一个`Copy`都没有输出，说明一次复制行为都没有发生，这大大提高了效率；要知道在原先的代码下，复制次数会随元素添加次数的增加而呈指数级增加，这对性能的损耗将是可怕的

---

## 库的使用（49、50）

在python、C#、Java等语言中，添加库是一项非常简单的任务，但是在C++中，似乎这里成了问题的重灾区，而实际上在C++中添加库并不困难

**以下将通过链接二进制文件的形式在C++中链接GLFW库：**

![image-20230626020227432](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202306260202572.png>)

下载解压GLFW预编译二进制文件后，我们便可以得到上述文件，它们主要由两部分组成：include文件与lib文件，它们分别对应头文件与具体的函数实现，而对于这两部分我们都需要进行加载

*C++存在着两种库：静态库（.lib）与动态库（.dll），它们基本的区别是静态库会被编译进exe文件中，而动态库则是在运行时装载的，之后会有篇章专门介绍他们*

下面是两种库引入方式的介绍：

### 静态链接

将include文件夹与对应平台的lib文件夹复制到项目文件夹中，而在lib文件夹中我们可以看到三个文件

![image-20230626021447618](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202306260214664.png)

其中`glfw3.lib`为静态库，而`glfw3.dll`为动态库，`glfw3dll.lib`为动态库的导入库，其中包含了动态库中所有函数、符号的位置，以便我们进行使用（没有它我们也可以使用动态库，但是我们需要通过函数名来访问它）

要链接到库，我们首先需要将其头文件包含到项目中，我们可以在`属性/C++/常规/附加包含目录`将库文件夹包含在项目中，如下图所示

![image-20230626022703597](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202306260227665.png>)

之后即可在代码中使用`#include "GLFW/glfw3.h"`引入头文件了，但到这里我们仅仅只是引入了头文件，并没有包含函数的实现，而这一步需要我们在链接器选项中进行操作

在`属性/链接器/常规/附加库目录`中添加库文件夹的地址

![image-20230626023444430](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202306260234490.png>)

在`属性/链接器/输入/附加依赖项`中添加`glfw3.lib`

![image-20230626023557693](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202306260235757.png>)

即可完成库文件的包含，到此我们便可以在程序中调用库函数了

### 动态链接

静态链接发生在编译时，而动态链接发生在运行时

在静态链接时，编译器和链接器会知道完全的库的代码，所以会允许更多的优化发生

而动态链接则只有在你运行exe文件时，库才会被加载，其实际上不是可执行文件的一部分

那么应该如何使用动态链接呢？

其实只需要`属性/链接器/输入/附加依赖项`中加入`glfw3dll.lib`即可

![image-20230718020213161](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202307180302256.png)

因为GLFW支持静态链接与动态链接都使用同一个头文件，所以我们的`include`也不需要更改

做完这一步之后，我们已经可以编译通过了，但是在运行时仍然会报错，这便是因为到此我们已经向编译器保证了`dll`库会存在，但实际上在运行时程序还是需要找到对应的`dll`文件的，而程序会默认在exe文件的根目录中寻找`dll`文件，所以我们只需将`dll`文件和`exe`文件放在一起便大功告成了，而我们同样可以手动指定程序对于`dll`文件的搜索范围。

---

## 处理多返回值（52）

在C++的默认情况下，是无法返回多个类型的返回值的，但我们可以通过一些手段来实现这一点

下面是一些方法的总结：

1. **使用引用/指针传入外部值后，在内部修改**

```cpp
void MultipleReturnValue(std::string& outValue1, int& outValue2)
{
	outValue1.append(" Hello");
	outValue2++;
}

int main()
{
	std::string value1 = "NiHao";
	int value2 = 10;
	MultipleReturnValue(value1, value2);

	std::cout << "Value1: " << value1 << std::endl;
	std::cout << "Value2: " << value2 << std::endl;
	std::cin.get();
}
```

**优点**：效率最高；可以返回任意数量、任意类型的值

**缺点**：看着比较乱，不够直观

2. **使用`std::array`/`std::vector`**

```cpp
std::vector<std::string> MultipleReturnValue()
{
	return std::vector<std::string>{ "Hello1","Hello2"};
}

int main()
{
	auto vector = MultipleReturnValue();

	std::cout << "Value1: " << vector[0] << std::endl;
	std::cout << "Value2: " << vector[1] << std::endl;
	std::cin.get();
}
```

**优点**：好像没什么优点

**缺点**：只能传递一种类型；得到返回值时无法显示变量名

3. **使用`std::tuple`/`std::pair`**

`tuple`和`pair`都不关心其中的变量类型，其余与`array`和`vector`类似

```cpp
std::tuple<std::string, int> MultipleReturnValue()
{
	return std::make_tuple("Hello", 10);
}

int main()
{
	auto tuple = MultipleReturnValue();

	std::cout << "Value1: " << std::get<0>(tuple) << std::endl;
	std::cout << "Value2: " << std::get<1>(tuple) << std::endl;
	std::cin.get();
}
```

**优点**：与`array`和`vector`相比，可以传递多类型了

**缺点**：得到返回值时无法显示变量名，且解包写法十分繁琐

4. **使用自建结构体传递返回值**

```cpp
struct ReturnValues
{
	std::string Value1;
	int Value2;
};

ReturnValues MultipleReturnValue()
{
	return {"Hello", 10 };
}

int main()
{
	auto returns = MultipleReturnValue();

	std::cout << "Value1: " << returns.Value1 << std::endl;
	std::cout << "Value2: " << returns.Value2 << std::endl;
	std::cin.get();
}
```

**优点**：清晰明了，可读性高，写法简单；可传递任意类型、任意数量的变量；解包可以显示变量名

**缺点**：与方法1相比效率稍差

> **总的来说，法1与法4较为实用**

---

## 模板`template`（53）

C++的`template`有点类似其他语言中的泛型`Generic`，但实际上`template`比泛型要强大地多

模板有点像宏，它实际上可以帮你完成非常多的事情，而泛型往往受限与类型系统以及其他很多因素

> **`template`允许你定义一个可以根据你想要的用途进行编译的模板，你可以编写一套规则，来让编译器帮你写代码**
>
> **这有点像一种蓝图，你只需要制定规则，而实际的生产由编译器进行**

当我们想要编写一系列函数，其大部分内容都相同，只是接受的参数不同时，我们便可以使用`template`，下面是一个例子：

我们想要编写一个`Print`函数，让其可以分别输出整数、浮点数、字符串，我们通常需要创建多个函数重载

```cpp
void Print(int value)
{
	std::cout << value << std::endl;
}

void Print(float value)
{
	std::cout << value << std::endl;
}

void Print(std::string value)
{
	std::cout << value << std::endl;
}

int main()
{
	Print(1);
	Print(1.1f);
	Print("Hello");
	std::cin.get();
}
```

如果我们想要增加更多类型我们就需要更加跟多重载，这可行，但是非常麻烦，而使用`template`可以大幅简化代码，就像下面这样

```cpp
template<typename T>
void Print(T value)
{
	std::cout << value << std::endl;
}

int main()
{
	Print(1);
	Print(1.1f);
	Print("Hello");
	std::cin.get();
}
```

*`T`可以自定义，如`typename Hmxs`同样可以*

> `template`函数实际上并不真实存在，实际的函数会在被调用时被自动创建

而在上面的代码中，在我们调用`Print`函数时，实际包含了一层隐式的类型推导，如在`Print(1)`中，编译器知道`1`是一个整数，所以其创建了一个`T`为`int`的`Print`函数

而实际上我们同样可以在调用模板函数时显式地指定类型，如：

```cpp
Print<int>(1);
```

上面是一种`template`在函数中的简单应用，而`template`实际完全不局限与函数中

如我们想创建一个自定义的在栈中生成的`Array`类：

```cpp
template<typename T, int N>
class Array
{
private:
	T array_[N];
public:
	int GetSize() { return N; }
};

int main()
{
	Array<int,5> m_array{};
	std::cout << m_array.GetSize() << std::endl;
	std::cin.get();
}
```

**`如此强大！`**

而这其实也只是`template`应用的冰山一角，大量使用`template`的编码方式被称为meta programming元编程

但实际上，任何事情都有两面性，`template`十分强大，但过分使用它会让你的代码的可读性降低，以至于你不得不为理解`template`而花费更多地时间

当一个基于`template`的系统变得过于深入与庞大时，将是非常疯狂的，没人会知道这玩意是怎么运行的

So, we should balance them well.

---

## 堆与栈内存的比较（54）

栈（`stack`）内存和堆（`heap`）内存是ram中实际存在的两个区域

栈通常是一个预定义大小的内存区域，通常约为2兆字节左右；堆也是一个预定了默认值的区域，但堆内存可以生长，并随着应用程序的进行而改变

而最重要的是，这两个内存区域的实际位置（物理上），在我们的ram中是完全一致的

**为什么栈会比堆快？**

在栈上分配内存，其实只是一行cpu指令：将栈头指针移动一定的字节

而在堆上进行内存分配则复杂地多，cpu需要记录许多信息

---

## 宏`Macro`（55）

> **宏主要在预处理阶段发挥作用，我们可以通过宏将代码中的文本替换为其他东西，这基本上就像遍历我们的代码然后进行查找和替换，但实际上并没有那么简单粗暴**

这听起来有点像之前说到的模板`template`，但宏发生作用的时间会比模板更早

下面是一个宏的使用例子：

```cpp
#define WAIT std::cin.get()

int main()
{
	WAIT;
}
```

我们用`WAIT`替代了`std::cin.get()`

这看上去更简洁了，**但实际上这是非常错误的用法**，用宏去替换原来理所应当的代码，只会让看代码的人觉得疑惑

而下面这种宏函数的用法则是合理的

```cpp
#define LOG(message) std::cout << message << std::endl

int main()
{
	LOG("Hello");
	std::cin.get();
}
```

**宏函数的优点**：没有普通函数保存寄存器、参数传递和返回值传递的开销，展开后代码效率会更高

同时我们可以使用宏定义来区分`Debug`模式与`Release`模式的代码

```cpp
#ifdef _DEBUG
	#define LOG(message) std::cout << message << std::endl
#else
	#define LOG(message)
#endif

int main()
{
	LOG("Hello");
	std::cin.get();
}
```

---

## `auto`关键字（56）

> **`auto`的作用非常简单，它可以为我们自动推导变量的类型，它在某些时候十分有效，但我们不应该滥用它**

```cpp
std::string GetHello()
{
	return "Hello";
}

int main()
{
	auto hello = GetHello();
	std::cin.get();
}
```

这是一个`auto`的使用例，我们用其来接收函数的返回值

其一个好处便是，如果我们的函数返回值类型发生了变化，如果我们使用了auto，那么我们便不需要再改动接收处的变量类型了

但这也是一把双刃剑，这也意味着，如果我们接下来的代码中有用到原来的类型特性，那么便会带来更大的问题，这降低了可读性

这种用法见仁见智

`auto`还有一种用法便是简化类型，当我们面对一个极其长的类型名时，我们便可以使用`auto`，这样反而会增加可读性，如下面这个例子

```cpp
int main()
{
	std::vector<std::string> name_vector;
	name_vector.emplace_back("Hmxs");
	name_vector.emplace_back("Cherno");

	for (std::vector<std::string>::iterator iterator = name_vector.begin(); iterator != name_vector.end(); iterator++)
		std::cout << *iterator << std::endl;

	for (auto iterator = name_vector.begin(); iterator != name_vector.end(); iterator++)
		std::cout << *iterator << std::endl;

	std::cin.get();
}
```

---

## 静态数组`std::array`（57）

> **`std::array`是C++STL的一部分，其是专门用来处理静态数组的；所谓静态数组，便是定长数组，在你完全初始化array的初始化之后，其长度便无法改变了**

在使用上，`array`几乎和C语言风格的数组别无二致

```cpp
#include <array>

int main()
{
	std::array<int, 10> array;
	array[0] = 1;

	std::cin.get();
}
```

**这看上去理所当然，那么问题便出现了，我们应该使用它还是C语言的原生数组呢？**

> **结论是：我们应该尽量使用`std::array`**

首先，`std::array`是非常快的，其是储存在栈上的，几乎没有性能损耗

其次，因为`array`属于STL，其包含了许多内置函数，可以简化我们的代码，如用于排序的`sort`

最后，使用`array`我们便不需要自己维护数组的大小了，`array.size()`函数可以返回数组大小，并且这个`size`属于模板，并不占用额外的内存

---

## 函数指针（58）

> **函数指针，是将一个函数赋值给一个变量的方法；当我们直接传递函数名而不带括号时，我们便传递了一个函数指针**

在一些情况下，函数指针的使用可以大幅简化代码

```cpp
void Print()
{
	std::cout << "Hello World" << "\n";
}


int main()
{
	void(*function)() = Print;

	function();

	std::cin.get();
}
```

如上所示，我们可以使用`返回值 (*变量名)()`创建一个函数指针，并通过函数指针调用函数

而这么写往往比较奇怪，所以我们一般会使用`auto`/`typedef`/`using`完成函数指针的声明

```cpp
typedef void(*PrintFunc)();

PrintFunc func1 = Print;
auto func2 = Print;
```

下面是关于函数指针的一个实际用例

```cpp
void Print(int value)
{
	std::cout << "Value: " << value << "\n";
}

void ForEach(const std::vector<int>& vector, void(*func)(int))
{
	for (int value : vector)
		func(value);
}

int main()
{
	std::vector<int> vector = { 1,1,4,5,1,4 };
	ForEach(vector, Print);

	std::cin.get();
}
```

我们可以通过函数指针将函数像变量一样在函数中传递，达成“回调”的效果

此外，`lambda`表达式也可以应用在函数指针中，`lambda`表达式将在下一章被详细介绍

---

## `lambda`表达式（59）

> **`lambda`本质是我们定义的一种被称为匿名函数的方法**
>
> **我们可以通过这种方法在不实际创建函数的情况下创建函数，就像一个快速的一次性函数**

**我们什么时候可以使用`lambda`？**

只要你有一个函数指针，你便可以在C++中使用`lambda`

当我们需要一个回调函数时，*即，我们想要指定一段代码，在未来的某一时刻被调用，但我们无法得知这一确切的时间时*，`lambda`是一个很好的方法用于编写回调函数

语法：`[捕获](参数) {函数体}`

C++中的`lambda`表达式由三部分组成：

- 捕获为`lambda`对于外部变量的态度，`[=]`为以值捕获所有外部变量，`[&]`为以引用捕获所有外部变量，或者也可以直接传入需要捕获的变量
- 参数与正常函数的参数列表类似，如`(int value)`
- 函数体也与正常函数类似，是函数的主体代码

---

## 为什么不应该使用`using namespace std`（60）

当我们需要调用C++标准库中的内容时，我们总是需要加上前缀`std::`，很多人会觉得这很麻烦

而在某一作用域或全局加上`using namespace std`，我们便可以直接调用标准库的内容

这在一定程度上让代码变得简洁，但实际上，这并不是什么好习惯，以下是不使用`using namespace std`的几个原因

- 让代码变得更易混淆，当我们不使用`using namespace std`时，我们可以通过函数前的`std::`清晰地看出这个函数是标准库中的，而使用`using namespace std`，会让代码的可读性降低，变得更易混淆
- 当遇到不用命名空间中的同名函数时，`using namespace`可能会导致歧义甚至编译错误

```cpp
namespace apple
{
	void print(const std::string& str)
	{
		std::cout << str << "\n";
	}
}

namespace orange
{
	void print(const char* str)
	{
		std::string temp = str;
		std::reverse(temp.begin(), temp.end());
		std::cout << temp << "\n";
	}
}

using namespace apple;
using namespace orange;

int main()
{
	print("Hello");
	std::cin.get();
}
```

在上面这个例子中，命名空间`apple`与`orange`中存在同名函数`print`，而此时因为隐式转换优先级的问题，我们实际调用的`print`将是`orange`中的，这种问题在实际遇到时很难发现，甚至不会有报错，但你会得到错误的结果，而不使用`using namespace`便可以很大程度上解决该问题

> 并且，需要强调的是：**永远不要在头文件中使用`using namespace`，天知道什么会被包含进来**

在作用域很小时，或包含自己的库时，`using namespace`是可接受的，但是对于`std`这类库，最好永远避免使用`using namespace`

---

## 命名空间（61）

> **命名空间存在的主要原因，是为了避免命名冲突**

C与C++语言中，名字完全相同的两个符号是不允许同时存在的，如我们无法拥有两个类型都为`int`，名字都为`a`的变量

在C语言中，我们通常通过在名字前增加前缀来防止命名冲突，如对于`print`函数而言，便可以写为`apple_print`与`orange_print`来区分不同的变量

而在C++中，我们便可以更加便捷地通过命名空间来实现这一点，就像下面这样

```cpp
namespace apple
{
	void print(const std::string& str)
	{
		std::cout << str << "\n";
	}
}

namespace orange
{
	void print(const std::string& str)
	{
		std::cout << str << "\n";
	}
}
```

而我们可以使用`::`来访问某一命名空间，如`apple::print()`

*类、结构体、枚举等本身也是一种命名空间，所以同理，我们也可以使用`::`来访问其中的字段与函数*

而`using namespace`便是在某一作用域内引入某一命名空间的全部内容

同时`using`也有其他灵活的用法，如下

```cpp
using a = apple;
using apple::print;
```

> **需要强调的是，引用命名空间时，应该将其限定在尽量小的作用域内**
>
> **命名空间的作用是避免命名冲突，而如果我们总是在顶层文件引入命名空间，那我们为什么还需要命名空间呢？**

---

## 多线程（62）

> **在之前的学习过程中，我们的所有代码都是单线程的，即计算机实际上只顺序运行了一段命令**
>
> **而线程系统可以让我们同时运行某几段代码，这往往在性能优化或一些其他方面非常有用**

在C++11的STL中，存在`thread`库，使用该库我们便可以便捷地开启线程

- 线程开启：创建`std::thread`类型的变量即为开启一个线程，其构造函数接受一个函数指针作为参数，传入的函数会在另外一个线程中被执行
- 线程关闭：使用`join()`函数可以让主线程的等待该子线程完成，然后主线程再继续执行。这样，子线程便可以安全的访问主线程中的资源，子线程结束后由主线程负责回收子线程资源

**应用实例：**

一个程序的输入检测系统可以采用多线程的方式来实现

```cpp
static bool is_finish = false; // 使用静态全局变量传递状态

void DoWork()
{
	using namespace std::literals::chrono_literals;

	while (!is_finish)
	{
        // 每隔一秒输出一个“Working”
		std::cout << "Working......" << "\n";
		std::this_thread::sleep_for(1s);
	}
}


int main()
{
	std::thread worker(DoWork);// 创建并开启线程，此时DoWork开始运行

	std::cin.get();// 主线程阻塞，与此同时DoWork函数会在另一个线程被不断运行
	is_finish = true;

	worker.join();// 等待子线程完全结束后再继续进行
	std::cout << "Finish!" << "\n";

	std::cin.get();
}
```

> **线程的概念非常简单，但是其应用缺极其复杂**

---

## 计时（63）

**我们应该如何在C++中计算完成某个操作或执行某个代码所需要的时间呢？**

这是个非常广泛的问题，计时的应用往往无处不在，不论是需要在特定时间运行的代码，还是进行性能测试时

我们实际上有着多种方法计算程序运行的实际时间，如操作底层系统库；而在C++中，官方的`chrono`库可以为我们这点

> `chrono`库API参考：https://en.cppreference.com/w/cpp/chrono

**以下是使用`chrono`进行高精度计时的一个范例：**

```cpp
int main()
{
	using namespace std::chrono_literals;

	auto start_time = std::chrono::high_resolution_clock::now();

	std::this_thread::sleep_for(1s);

	auto end_time = std::chrono::high_resolution_clock::now();

	std::chrono::duration<float> duration = end_time - start_time;
	std::cout << duration.count() << "\n";

	std::cin.get();
}
```

通过`std::chrono::high_resolution_clock::now()`可以获得当前的精确时间，使两个时间相减即可得到时间间隔

但这看起来挺复制的，而如果我们想要为很多个函数计时，不停地复制这些代码会变得非常麻烦，下面是一种更加聪明的计时方法-**利用C++对象的生存周期自动计时**：

```cpp
struct Timer
{
	std::chrono::time_point<std::chrono::steady_clock> start, end;
	std::chrono::duration<float> duration;

	Timer()
	{
		start = std::chrono::high_resolution_clock::now();
	}

	~Timer()
	{
		end = std::chrono::high_resolution_clock::now();
		duration = end - start;
		auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(duration);
		std::cout << ms.count() << "ms" << "\n";
	}
};

void Test()
{
	Timer timer;

	for (int i = 0; i <= 1000; i++)
	{
		std::cout << "Hello" << "\n";
	}
}

int main()
{
	Test();

	std::cin.get();
}
```

通过创建`Timer`结构体，我们可以利用构造与析构函数将计时过程自动化，如果我们需要计时，我们便只需要在某一函数的开始创建一个`Timer`变量即可

---

## 多维数组（64）

> **多维数组实际上代表着数组的嵌套**
>
> **二维数组就是数组的数组，而三维数组就是数组的数组的数组**

**多维数组的创建**

在我们创建多维数组时，我们可以将其看做是数组的嵌套

上层数组每个元素都代表着一个指向一个下层数组的指针，就像下面这样

```cpp
void MultidimensionalArray()
{
	int** array2d = new int* [50];
	for (int i = 0; i < 50; ++i)
	{
		array2d[i] = new int[50];
	}

	int*** array3d = new int** [50];
	for (int i = 0; i < 50; ++i)
	{
		array3d[i] = new int* [50];
		for (int j = 0; j < 50; ++j)
		{
			array3d[i][j] = new int[50];
		}
	}
}
```

当我们仅仅像`int** array2d = new int* [50];`这样完成声明后，我们的工作还远没有结束，到此我们只是为50个指针分配了内存空间，而并没有为这50个指针指向的50数组分配内存，所以我们还需要遍历地进行内存分配

而同理，在删除时，我们也需要遍历地进行删除

> **需要注意的是，多维数组中多层嵌套寻址的设计对内存并不友好，因为其储存的不连续性，这会带来更多的cache miss，实际应用上会比单纯地一维数组慢很多**
>
> **而实际上，一维数组其实可以在很多时候替代多维数组的作用，通过`[x+y*i]`的方式**

---

## 排序（65）

> **对于如何处理数据的排序问题，我们可以通过多种方法来实现，包括自己实现冒泡、选择排序等算法**
>
> **而当我们面对使用了C++STL，如`std::vector`，进行组织的数据时，我们实际上没必要自己写一个算法，我们可以使用C++库来帮我们排序**

C++提供的排序函数为`std::sort`，它可以为任何类型的迭代器进行排序

我们需要为其提供一个迭代器的开始与结束，并选择性地提供比较函数，如果不提供，其将自动尝试根据类型排序

```cpp
std::vector<int> values = { 3,5,1,4,2 };

std::sort(values.begin(), values.end(), [](int a, int b)
{
    return a > b;
});

for (int value : values)
    std::cout << value << std::endl;
```

这样`values`便会降序排序

而不仅如此，我们可以通过函数的使用大幅定制化我们的排序算法

---

## 类型双关（66）

> **类型双关被用来在C++中绕过类型系统的检测**

C++虽然是一门强类型语言，但因为其可以直接访问内存，其类型系统便显得不那么具有强制性，如在Java或C#中想要绕过类型系统便较为麻烦

这是一种原始的、底层的访问，对于这种操作的允许也是让C++拥有如此优秀的性能的原因

```cpp
int a = 50;
double b = a;
```

显然的，我们可以在C++中进行上述代码的使用，但是这并不意味着类型双关，这其中其实蕴含了一次隐式的类型转换

如果我们去查看`a`与`b`在内存中的表现形式，会发现其实二者是截然不同的

而类型双关则可以让我们在保持内存不变的情况下转换类型

```cpp
int a = 50;
double b = *(double*)&a;
```

在上面的代码中，我们先取了`a`的地址即`&a`，而后将`a`的`int`类型地址强制转换为了`double`类型的地址，再将其解引用，就得到了`b`，此时`a`与`b`在内存中的表现完全一直，且类型不同

但，这实际上是很糟糕的用法，`int`类型与`double`类型的内存大小不一样，这十分不安全，在一些情况下甚至可能引发崩溃

下面是一个更加实际的应用

```cpp
struct Entity
{
	int x, y;
};

int main()
{
	Entity e = { 5,8 };

	int* position = (int*)&e;

	std::cout << position[0] << "," << position[1] << "\n";

	std::cin.get();
}
```

通过类型双关处理`Entity`，我们便可以不通过`e`，直接以类似数组的形式访问其中的数据

> **总而言之，类型双关允许我们以不同的形式解释同一块内存，正确地使用它可以帮助代码提高效率**