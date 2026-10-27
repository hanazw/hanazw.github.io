---
title: 「Unity-Timeline」学习笔记
description: Unity中的Timeline是一个强大的可视化工具，这里是一些对其知识点的整理
lang: zh
slug: unity-timeline
translation_key: unity_timeline
tags:
  - unity
  - csharp
draft: false
published_date: "2023-12-18"
---

![Unity_Timeline](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202312182321194.jpg)


> 官方文档：https://docs.unity3d.com/Packages/com.unity.timeline@1.8/manual/index.html

---

## 前言

`Timeline`是Unity中的一个强大的可视化工具，用于创建、编辑和控制复杂的时间线动画和剧情序列，可以轻松实现剪辑、动画、特效和音频的精确时间控制和协调

而从笔者目前的了解来说，`Timeline`可以做的远不止“做剧情过程”这么简单，其本质上是一个强大的可视化时间轴控制器，我们可以通过其实现一定程度的流程控制，即从某一时刻开始以既定序列执行一系列事件，而得益于其提供了可供自定义的接口，这个“事件”的定义可以非常广泛，如可以用其实现：`在玩家按下开火键后立刻触发一个粒子特效，3帧后，生成子弹预制体，1秒后播放玩家动画`之类的效果

如果只从这个角度来说，`Animation`组件也可以实现这一效果，但其只能承载一些比较简单的流程控制，并且可视化编辑体验并不算好；而`Timeline`相比来说更加强大，可供拓展的范围更广，并且可以实现一定程度的节点复用，在可视化编辑体验上来说也更加现代；同时，`Timeline`也可以很好地和原先的`Animation`系统交互

之前在Unity中，若要在不借助第三方插件的前提下进行较为精确的时间轴控制，往往使用协程或难用的`Animation`，而`Timeline`可以说补足了Unity功能的一大空缺，可以说非常强大了

---

## Timeline概念概述

### 运作方式：Timeline与Animation

在整体的运作方式上，`Timeline`与`Animation`非常相像；在使用`Animation`时，我们需要创建`Animation Clip`资源文件，并在对应物体上挂载`Animation`/`Animator`组件，通过组件驱动`Animation Clip`进行播放；而`Timeline`与其几乎一样，我们需要创建`Timeline`资源文件，并在物体上挂载`Playable Director`组件，通过其来驱动`Timeline`进行播放

而二者不同的地方在于，`Animation`在设计上是与挂载了`Animation`/`Animator`组件物体高度相关的，即动画应该是属于某一物体的，一段主角身上的动画应该是属于主角的，其应该只影响主角，我们当然也可以通过一些手段让其控制其他物体，但总的来说很不方便也很不优雅；而在`Timeline`中，`Playable Director`正如其名只是一个“导演”，其只承担`Timeline`的驱动和管理，而可以不与`Timeline`所影响的物体相关，即导演在大部分情况下不会参演其导演的作品，这赋予了`Timeline`无比的自由度，你可以在其中控制场景中的一切

### 构成方式：Track - Clip

![image-20231230021929575](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202312300219644.png>)

了解了`Timeline`的大体运作方式后，我们该认识一个`Timeline`的构成了；实际上，如果你了解或使用过任何视频剪辑软件，如：PR、达芬奇，你便会对`Timeline`的结构一目了然，`Timeline`的构成方式与视频剪辑软件非常相似

**Track**：

- 一个`Timeline`由0~N个`Track`构成，`Track`是一个无限长的时间轴，一个`Timeline`中的所有`Track`共用一个时间轴
- `Track`的存在允许我们方便地管理多个物体的行为，如我们希望A物体在1.0s出现、3.0s小时，B物体在2.0s出现、4.0s消失，我们便可以使用两个`Track`来实现这点
- `Track`有不同的类型，其描述了`Track`的基本功能，Unity已经为我们提供了一些预制好的`Track`，如最基本的`Activation Track`便是控制一个物体的`Active`状态的

**Clip**：

- 一个`Track`由0~N个`Clip`构成，`Clip`是一个有开始时间和结束时间的区块，其存在于`Track`之上，当时间运行到对应`Clip`时，其便会执行对应行为

- `Clip`允许我们对物体的状态在时间轴上进行精确的并行的控制，其与`Track`的结合可以很好地帮助我们实现想要的效果

**需要注意的是，Track和Clip本身实际上都不具有具体的功能，它们都是回调的触发者，真正的逻辑位于Behavior之上，这点在后续的自定义Track部分会详细说明**

---

## 各默认Track介绍

### `Activation Track`

![image-20240107230145773](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401072301841.png)

`Activation Track`用于在特定时间启用或禁用游戏对象

Track上可以绑定一个`GameObject`对象（这一对象最好不是Director，禁用Director将会终止Timeline的播放），一个`Activation Track`只能控制一个对象；Clip则决定了对象显隐的具体时间

***需要注意的是，Clip在设计上是从属于Track的，从抽象层来说不应该访问Track上的数据（被控制对象的引用是绑定在Track上的），此处实际上使用了`Track Mixer`进行实现，在后续的自定义Track部分会详细说明***

### `Animation Track`

![image-20240107231151968](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401072311002.png)

`Animation Track`用于播放Animator控制器上的动画片段（`Animation Clip`）

Track上可以绑定一个`Animator`对象，Clip则由对象的动画片段构成；同时，Track上实现了`Track Mixer`，我们可以将两个的Clip进行重叠，实现动画的平滑过渡，并且自由地编辑过渡曲线

### `Audio Track`

![image-20240107232004861](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401072320908.png)

`Audio Track`用于控制音频的播放

Track上可以绑定一个`Audio Source`对象，该对象用于播放音频；而Clip则是具体需要播放的音频片段（`Audio Clip`）；同时，其也实现了`Track Mixer`，我们可以将两个的Clip进行重叠，实现音频的平滑过渡，并且自由地编辑过渡曲线

### `Control Track`

![image-20240107232611495](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401072326535.png)

`Control Track`允许你控制其他`Player Director`的播放，可以用来触发其他Timeline

其Track上没有数据，Clip则由其他`Player Director`构成

### `Playable Track`

![image-20240107232843380](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401072328418.png)

`Playable Track`较为特殊，其本身没有实际的逻辑，但其可以驱动自定义Clip

当我们想进行一定程度的自定义，但不需要用到Track时，我们便可以只自定义Clip，并在`Playable Track`对其进行应用

### `Signal Track`

![image-20240107233201429](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401072332456.png)

`Signal`是Timeline中内置的“事件系统”，其基于观察者模式进行搭建，如果你有使用过事件中心，那么你便能很快上手这个概念

在使用它时，我们需要先右击创建后缀为`.signal`的资产文件，这相当于事件系统中的“事件”，需要注意的时，其本身不具有逻辑，其只是一个“概念”，一个逻辑的容器

之后我们需要在事件作用的对象身上创建`Signal Receiver`组件，在其之上，我们便可以在`Inspector`中对需要触发的事件进行绑定，如下图所示

![image-20240107233841768](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401072338800.png)

这一组件是时间的“订阅者”，需要注意的是，`Signal`在这一过程中是可以被复用的，一个`Signal`可以被绑定给多个`Reveiver`

之后，我们便可以右击Track，选择`Add Signal Emitter`，当Track运行到该节点时，对应`Signal`便会被触发

事实上，我们可以在任何Track上添加`Signal Emitter`，而独立出来的`Signal Track`或许是希望让`Signal`的触发更加容易管理

*Signal系统由于基于Timeline而生，在某些情况下并不那么好用，因其只支持在Inspector中进行事件的绑定，有时然而会让事情变得复杂，难以管理，或许我们可以在之后使用自定义Track功能创建自己的事件系统*

### `Cinemachine Track`

![image-20240107234802182](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401072348212.png)

这并不是Timeline中自带的功能，其由`Cinemachine`插件提供

其可以非常方便地通过Timeline控制`Cinemachine`中的虚拟相机，是个非常强大便捷的功能

`Cinemachine`不是本文的主角，故此处对其用法不过多赘述

---

## 自定义Track

### 概述

接下来终于来到了个人认为Timeline中最激动人心的部分：强大的自定义功能

Unity为我们提供了`TrackAsset`、`PlayableAsset`与`PlayableBehaviour`三个类与一些接口，通过继承它们，我们便可以实现对于Track的完全自定义

*上面介绍过的Timeline提供的默认Track也都是通过这些类实现的，其没有被写在Unity内核中，这也意味着我们可以在项目中直接找到实现它们的C#代码，这相当于官方范例，我想这可以给我们的自定义带来很大的帮助*

![image-20240108203042955](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401082030081.png)

上图展示了一个完整Track的基本构成方式（括号中是它们背后的类）

- `PlayerBehaviour`是承载具体逻辑的基类，其具有多个回调，如`OnBehaviourPlay`（开始调用时）、`ProcessFrame`（每个逻辑帧）等；其既可以绑定在Clip上也可以由Track创建
- `PlayableAsset`是Clip的基类，实现其`CreatePlayable`函数即可将一个`PlayerBehaviour`与其绑定，从而触发`PlayerBehaviour`中的回调函数

- `TrackAsset`是Track的基类，其定义了一个Track的方方面面，包括Track上绑定的物体的类型、Track上Clip的类型、Track的颜色等；而实现`CreateTrackMixer`可以将一个`PlayerBehaviour`与其绑定，我们通常称其为Mixer，其可以访问整个Track上的绑定对象与其中的Clip的数据；尽管绑定在Clip上的`PlayerBehaviour`实际上也可以获取到Track上的绑定对象，但从面向对象的角度出发，和Track绑定对象相关的逻辑应该写在Mixer中，同时Mixer也负责处理Clip之间的融合逻辑，例如默认Track中的`Animation Track`与`Audio Track`便实现了对应功能

### 具体实现

#### Track类

```csharp
namespace Timeline
{
    [TrackColor(0.5f, 0.5f, 0.5f)]  		// Track颜色
    [TrackClipType(typeof(CustomClip))]     // Track上的Clip类型
    [TrackBindingType(typeof(GameObject))]  // Track上的绑定对象类型
    public class CustomTrack : TrackAsset
    {
        // inputCount即为Track上的Clip数量
        public override Playable CreateTrackMixer(PlayableGraph graph, GameObject go, int inputCount)
        {
            return ScriptPlayable<CustomMixer>.Create(graph, inputCount);
        }
    }
}
```

#### Clip类

```csharp
namespace Timeline
{
    public class CustomClip : PlayableAsset
    {
        public override Playable CreatePlayable(PlayableGraph graph, GameObject owner)
        {
            return ScriptPlayable<CustomBehavior>.Create(graph);
        }
    }
}
```

#### Behavior类

```csharp
namespace Timeline
{
    public class CustomBehavior : PlayableBehaviour
    {
        public override void OnBehaviourPlay(Playable playable, FrameData info)
        {
            Debug.Log("OnBehaviourPlay");
        }

        public override void OnBehaviourPause(Playable playable, FrameData info)
        {
            Debug.Log("OnBehaviourPause");
        }

        public override void ProcessFrame(Playable playable, FrameData info, object playerData)
        {
            Debug.Log("OnBehaviourProcessFrame");
        }
    }
}
```

#### Mixer类

```csharp
namespace Timeline
{
    public class CustomMixer : PlayableBehaviour
    {
        private GameObject _boundObject;

        public override void OnBehaviourPlay(Playable playable, FrameData info)
        {
            Debug.Log("OnMixerPlay");
        }

        public override void OnBehaviourPause(Playable playable, FrameData info)
        {
            Debug.Log("OnMixerPause");
        }

        public override void ProcessFrame(Playable playable, FrameData info, object playerData)
        {
            // 如果_boundObject为空则尝试获取绑定对象
            _boundObject ??= playerData as GameObject;
            if (_boundObject == null) return;

            var inputCount = playable.GetInputCount();
            for (var i = 0; i < inputCount; i++)
            {
                // 获取融合权重
                var weight = playable.GetInputWeight(i);

                // 获取当前Clip
                var clipPlayable = (ScriptPlayable<CustomBehavior>)playable.GetInput(i);

                // 获取Clip上的Behavior
                var behavior = clipPlayable.GetBehaviour();

                // do something......
            }


            Debug.Log("OnMixerProcessFrame");
        }
    }
}
```
