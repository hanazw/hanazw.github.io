---
title: 「游戏编程模式」读书笔记四：原型模式、单例模式
description: 重访设计模式：原型模式、单例模式
lang: zh
slug: game-programming-patterns-prototype-singleton
tags:
  - design-patterns
draft: false
published_date: "2023-04-05"
---

![img](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202304060426139.jpeg)

> **《游戏编程模式》-Bob Nystrom**
>
> **书籍汉化版网址：https://gpp.tkchu.me/**
>
> **笔记目录：[/zh/blog/game-programming-patterns-index/](/zh/blog/game-programming-patterns-index/)**

---

## 原型模式

![一个生产者包含一个对怪物应用的原型字段。 他调用原型的clone()方法来产生新的怪物。](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202304061710457.png)

原型模式（PrototypePattern）是一种创建型设计模式，设计之初是为了解决"重复创建类似对象"这一问题；原型模式最重要的特性便是“**clone**”，其提倡通过预先创建一个"原型对象"，再通过对原型进行克隆的方式创建对象。

在OOP中，类拥有方法，而实例拥有属性，但实际上这不是OOP的唯一实现，一种名为Self的语言使用了原型作为构建OOP体系的核心，在Self中不再区分方法与属性，对象拥有一切，而要建立新的对象便需要克隆一个原有对象并向其中添加东西，这种构想听上去非常理想，但是在实际编码时却并不方便。而现代的JavaScript则吸收了部分Self语言的思想，但JS为其添加上了类的外衣，使其更加易用。

虽然在今时今日原始的原型模式实现方式已经有些过时，很多语言已经将原型模式纳入了其语言特性中(如Unity中的Instantiate方法)，但其思想仍然有值得学习借鉴的地方，如在我们通过JSON配置对象数据时，我们便可以将一部分相同的数据作为原型部分来提高效率。

---

## 单例模式

### 基本定义与概念

单例模式(Singleton)是最易于使用，同时也存在着许多争议的一种设计模式。其理念是:**保证一个类只有一个实例，并且提供访问该实例的全局访问点。**从另一个角度来说，单例模式是一种将全局状态封装为类的模式。其有着鲜明的优缺点，它是一种方便好用的设计模式，但是它也有着很多缺陷，依据本书作者的话来说，使用它更接近一种“饮鸩止渴”的状态。

#### 优点

- 使用懒汉式单例时，惰性加载可以一定程度上节省内存，没人调用它时，其便不会被创建
- 与静态/全局状态相比，其在运行时进行实例化，这让其初始化变得方便，不必担心引用问题
- 因其可以被全局访问，调用它非常轻松惬意

#### 缺点

- 全局访问的特性，让理解代码变得困难，同时并不安全，因为所有人都能访问到，也让并行开发变得困难
- 使用懒汉式单例时，惰性加载让准确控制其加载时机变得困难，无法手动控制其内存
- 饿汉式单例随没有惰性加载的问题，但其相比静态类很难突出其优势

### Unity简单实现

Singleton泛型基类的基本实现：分为不继承Mono与继承Mono两个版本

```csharp
namespace SingletonPattern
{
    public abstract class Singleton<T> where T : Singleton<T>, new()
    {
        private static readonly Lazy<T> InstanceHolder = new(() =>
        {
            var instance = new T();
            instance.OnInstanceInit(instance);
            return instance;
        });

        public static T Instance => InstanceHolder.Value;

        /// <summary>
        /// called when instance is initialized
        /// </summary>
        protected virtual void OnInstanceInit(T instance) {}

        protected Singleton() { }
    }
    
    public abstract class SingletonMono<T> : MonoBehaviour where T : SingletonMono<T>
	{
		private static T _instance;
		private static readonly object LockObj = new();
		private static bool _isApplicationQuitting;

		public static T Instance
		{
			get
			{
				if (_isApplicationQuitting)
				{
					Debug.LogWarning($"[{typeof(T)}] Instance is destroyed. Returning null.");
					return null;
				}

				lock (LockObj)
				{
					if (_instance) return _instance;
					_instance = FindObjectOfType<T>();
					if (_instance) return _instance;
					var singletonObject = new GameObject($"{typeof(T).Name}_SingletonMono");
					_instance = singletonObject.AddComponent<T>();
					return _instance;
				}
			}
		}

		protected virtual bool KeepAliveAcrossScenes => true;

		protected virtual void Awake()
		{
			lock (LockObj)
			{
				if (!_instance)
				{
					_instance = this as T;
					if (KeepAliveAcrossScenes) DontDestroyOnLoad(gameObject);
				}
				else if (_instance != this)
				{
					Debug.LogWarning($"[{typeof(T)}] Duplicate instance detected. Destroying {name}.");
					DestroyImmediate(gameObject);
				}
			}
		}

		protected virtual void OnDestroy()
		{
			lock (LockObj) if (_instance == this) _instance = null;
		}

		protected virtual void OnApplicationQuit() => _isApplicationQuitting = true;
	}
}
```

### 到底用不用单例？

- 很多单例可以被替换为静态类
- 全局访问不是一个好性质，我们应该尽量缩小可访问单例的范围
- 有时我们实际上只需要“全局唯一实例”的性质，那么用一个静态布尔值标识一下就行了
