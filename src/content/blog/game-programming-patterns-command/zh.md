---
title: 「游戏编程模式」读书笔记二：命令模式
description: 重访设计模式：命令模式
lang: zh
slug: game-programming-patterns-command
tags:
  - design-patterns
draft: false
published_date: "2023-04-01"
---

![img](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202303301905867.jpeg)

> **《游戏编程模式》-Bob Nystrom**
>
> **书籍汉化版网址：https://gpp.tkchu.me/**
>
> **笔记目录：[/zh/blog/game-programming-patterns-index/](/zh/blog/game-programming-patterns-index/)**

---


## 基本定义与概念

命令模式(Command Pattern)是一种将函数调用对象化的设计模式，“When I’ve used it in the right place, it’s neatly untangled some really gnarly code.”，其可以增加代码的条理性，同时使得代码有更好的拓展性。命令模式的核心是将回调用面向对象的方法进行实现，让方法的调用对象化，当方法成为对象，记录与替换它们就变得很容易。

### 应用场景

- 有回溯/撤销命令的需求时
- 有按键更改/方法替换的需求时
- 有记录指令日志的需求时

### 优点

- 当在正确的地方使用时，可以将复杂的代码清理干净
- 让命令本身变为实例，提高代码的拓展性
- 可以为实现“指令的撤销”带来极大的便利

### 缺点

- 造成额外的内存开销

---

## Unity简单实现

### 命令基类/接口

此处为C#的接口实现，也可通过抽象类+虚函数的方法实现

```csharp
public interface ICommand
{
    // 传入了一个GameObject作为参数，表示命令作用的对象，也可不传/传别的
	void Execute(GameObject obj);
}
```

### 具体命令

此处创建了两个具体命令:JumpCommand,WalkCommand，具体命令需继承自ICommand接口，并实现Execute方法

实现的Execute函数为命令的具体逻辑，如果需要可以通过构造函数传入参数

```csharp
public class JumpCommand : ICommand
{
    public void Execute(GameObject obj)
    {
        Debug.Log(obj.name + "Jump");
        // 具体方法逻辑
    }
}

public class WalkCommand : ICommand
{
    private Vector2 _targetPos;
    
    // 设置构造函数传入参数，设定命令
    public WalkCommand(Vector2 pos)
    {
        _targetPos = pos;
    }
    
    public void Execute(GameObject obj)
    {
        Debug.Log(obj.name + "Walk to" + _targetPos);
        // 具体方法逻辑
    }
}
```

### 命令调用

创建继承MonoBehaviour类的脚本用于调用命令

```csharp
public class InputHandler : MonoBehaviour
{
    private Vector2 _pos; // 模拟物体移动
    private ICommand _currentCommand;
    
    private void Update()
    {
        _currentCommand = InputCommand();
        if (_currentCommand != null)
        {
        	_currentCommand.Execute(gameObject); // 执行命令
        }
    }
    
    // 接收输入，返回对应命令
    private ICommand InputCommand()
    {
        if (Input.GetKeyDown(KeyCode.A)) return new JumpCommand();
        if (Input.GetKeyDown(KeyCode.D))
        {
            _pos += Vector2.one;
            return new WalkCommand(_pos);
        }
        return null;
    }
}
```

在上面的例子中，我们可以通过命令模式在“输入”与“调用函数”之间添加了一层间接寻址，使得“输入”与“调用函数”之间不存在硬编码:

![img](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202304022311986.png)

---

## 命令的撤销

在命令模式中，每一条命令都是一个实际存在的类，由此我们可以很方便的实现回滚操作/撤销指令等功能，这在回合制游戏中有着重要的作用

![从旧到新排列的命令栈。 一个当前箭头指向一条命令，一个“撤销”箭头指向之前的命令，一个“重做”指向之后的命令](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202304030023331.png)

以下代码实现了指令的撤销：

为接口与命令类实现Undo方法，在其中编写撤销代码，当我们需要撤销某一条命令时，我们便只需要调用该命令的Undo方法即可

因为撤销方法往往有着对储存之前状态的需求，我们可以在命令类的构造函数中传入这些状态，并且声明私有变量来存储它们

```csharp
// 命令接口
public interface ICommand
{
	void Execute();
	void Undo();// 撤销方法
}

// 命令类
public class JumpCommand : ICommand
{
	public void Execute()
	{
		Debug.Log( "Jump");
	}

    public void Undo()
    {
        Debug.Log("Jump Undo");
    }
}

public class WalkCommand : ICommand
{
	private GameObject _obj;
    private Vector2 _beforePos;// 存储之前的位置
    private Vector2 _targetPos;// 目标位置
    
    // 可以设置构造函数传入参数
    public WalkCommand(GameObject obj,Vector2 pos)
    {
        _obj = obj;
        _beforePos = obj.GetComponent<InputHandler>().pos;
        _targetPos = _beforePos + pos;
    }
        
	public void Execute()
    {
        _obj.GetComponent<InputHandler>().pos = _targetPos;
        Debug.Log(_obj.name + "Walk To" + _targetPos);
    }

    public void Undo()
    {
		_obj.GetComponent<InputHandler>().pos = _beforePos;
		Debug.Log(_obj.name + "Back To" + _beforePos);
	}
}
```

在调用命令的脚本中，通过Unity提供的List&lt;T&gt;来存储指令，通过一个int变量_commandHead表示List的指针，指向当前命令，通过对commandHead的改变便可以灵活调用指令

```csharp
public class InputHandler : MonoBehaviour
{
	private List<ICommand> _commands = new();// 储存命令的List
    private int _commandHead = -1;// 命令指针

    public Vector2 pos;// 模拟物体移动
    private ICommand _currentCommand;

    private void Update()
    {
		_currentCommand = InputCommand();
        if (_currentCommand != null)
        {
			// 执行命令
            _commandHead += 1;
            if (_commands.Count <= _commandHead)
                _commands.Add(_currentCommand);
            else
                _commands[_commandHead] = _currentCommand;
            _commands[_commandHead].Execute();
		}

		if (Input.GetKeyDown(KeyCode.Z))
        {
        	// 撤销命令
			if (_commandHead >= 0)
			{
            	_commands[_commandHead].Undo();
                _commandHead -= 1;
            }
        }
	}

	// 接收输入，返回对应命令
    private ICommand InputCommand()
    {
		if (Input.GetKeyDown(KeyCode.A)) return new JumpCommand();
        if (Input.GetKeyDown(KeyCode.D))
        {
        	return new WalkCommand(gameObject, Vector2.one);
        }
        return null;
	}
}
```

