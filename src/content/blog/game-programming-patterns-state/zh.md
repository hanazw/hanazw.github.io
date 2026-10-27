---
title: 「游戏编程模式」读书笔记五：状态模式
description: 重访设计模式：状态模式
lang: zh
slug: game-programming-patterns-state
tags:
  - design-patterns
draft: false
published_date: "2023-04-07"
---

![img](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202304070014396.jpeg)

> **《游戏编程模式》-Bob Nystrom**
>
> **书籍汉化版网址：https://gpp.tkchu.me/**
>
> **笔记目录：[/zh/blog/game-programming-patterns-index/](/zh/blog/game-programming-patterns-index/)**

---


## 有限状态机FSM

有限状态机帮助我们梳理角色的状态，防止出现一些可能由“连点”等操作导致的让一个动作不断重复的bug。unity中的动画系统很大程度上便是基于FSM进行设计的。本章通过FSM引入状态模式

![一张画有盒子的图表，盒子代表了站立，跳跃，俯卧和跳斩。标记了按键的按下和释放的箭头连接了这些盒子。](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202304070016740.png>)



### 定义

- 状态机拥有所有可能状态
- 状态机同时只能存在一个状态
- 状态机可以接收连续的输入与事件
- 每个状态都有一系列状态转移方法，这些方法与输入和另一状态相关

### FSM的简单实现

```csharp
namespace StatePattern
{
    public class SimpleFSM : MonoBehaviour
    {
        // 状态枚举
        private enum State
        {
            Idle,
            Attack,
            Walk
        }

        private State _current;// 当前状态

        private void Start()
        {
            _current = State.Idle;// 初始状态
        }

        private void Update()
        {
            // 每帧判断状态
            switch (_current)
            {
                case State.Idle:
                    Idle();
                    break;
                case State.Attack:
                    Attack();
                    break;
                case State.Walk:
                    Walk();
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        // 具体状态逻辑
        private void Idle() { }
        private void Attack() { }
        private void Walk() { }
    }
}
```

## 面向对象的状态模式

> GoF: 允许一个对象在其内部状态发生变化时改变自己的行为，该对象看起来好像修改了它的类型

Switch方法已经可以很好的实现一个简单的状态机了，但是在FSM中，我们可以更进一步，通过OOP的思想来编写FSM。通过实现状态接口、让每个状态成为类、状态委托这三步便可以实现这一点。其核心目的是将状态的行为和数据封装到单一类中。

### 动态面向对象FSM实现

**状态基类与状态类**：

```csharp
namespace StatePattern
{
    public abstract class FsmBase
    {
        public virtual void OnEnter() {}
        
        public virtual void OnExit() {}

        public abstract void OnUpdate();

        public abstract FsmBase TransitState();
    }

    public class IdleState : FsmBase
    {
        private float _changeTime;

        public IdleState(float changeTime)
        {
            _changeTime = changeTime;
        }
        
        public override void OnEnter()
        {
            Debug.Log("Idle Enter");
        }

        public override void OnUpdate()
        {
            Debug.Log("Idle Update");
        }
        
        public override FsmBase TransitState()
        {
            _changeTime -= Time.deltaTime;
            if (_changeTime < 0.1f)
            {
                return new AttackState();
            }
            return this;
        }
    }

    public class AttackState : FsmBase
    {
        public override void OnExit()
        {
            Debug.Log("Attack Exit");
        }
        
        public override void OnUpdate()
        {
            Debug.Log("Attack Update");
        }

        public override FsmBase TransitState()
        {
            if (Input.GetKeyDown(KeyCode.A))
            {
                return new IdleState(3f);
            }
            return this;
        }
    }
}
```

**人物脚本**：

```csharp
namespace StatePattern
{
    public class Test : MonoBehaviour
    {
        private FsmBase _current;

        private void Start()
        {
            _current = new IdleState(1f);
            _current.OnEnter();
        }

        private void Update()
        {
            FsmBase temp = _current.TransitState();
            if (temp != _current)
            {
                _current.OnExit();
                _current = temp;
                _current.OnEnter();
            }
            _current.OnUpdate();
        }
    }
}
```

## 并发状态机

当我们通过FSM来管理一个角色的状态，有走、跑、跳等，若我们现在想为这个角色添加各类武器，若我们仍然通过单一FSM来进行管理，状态就会变成走斩、跑斩、跳劈、走射、跑射等，如果我们还想添加别的角色模块，就会让单一FSM的状态数量成指数上涨，这并不易于编写。

这种情况下，并发状态机便可以被使用，其核心便是**分离角色状态，通过复数状态机进行管理**，如上述例子中，可以分离为“角色动作”与“角色装备”，通过两个同时运行的状态机进行管理。

## 分层状态机

当状态机中有多个状态有部分相似的行为时，我们便可以通过分层状态机来减少代码编写量。

因为我们采用了OOP的思想来建构状态机，而OOP中类共享代码的形式为继承，我们便可以为这些状态创建父类作为父状态，子状态进行继承即可。

## 下推状态机

通过状态栈来管理状态，把新状态推入栈，当前状态为栈顶的状态，当我们不需要该状态时出栈即可，这样便可以实现记忆状态的目的。
