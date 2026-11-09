---
title: Reflections on Game Architecture from My Graduation Project
description: Looking back at communication, flow control, and code organization in the Unity tactical game I built for my graduation project.
lang: en
slug: game-architecture-reflections
translation_key: game_architecture_reflections
tags:
  - unity
  - design-patterns
draft: false
published_date: "2026-11-09"
---

My graduation project was a 2D tactical game built with Unity. I used quite a few design patterns: an `Event Bus` for communication between modules, a `State Machine` to manage interaction states, and a `Command Queue` to organize command execution.

The original idea was to keep the project well organized, extensible, and readable. That worked to some extent. But during development, my lack of experience meant that some designs were less convenient to work with than I had expected, even after I had put them in place.

After finishing the project, I went back through the code. Here I want to record two specific problems and what I would consider changing if I did it again.

## Communication and Flow Orchestration

### Decoupling with Events Made the Flow Harder to Follow

Tactical games often need to wait for the presentation layer. At the start of a round, for example, a banner needs to appear, play its animation, and disappear before the game can continue.

In this project, I handle this with a `Command Queue` and an `Event Bus`:

1. The main flow first enqueues a command that waits for the presentation to finish.
2. The turn system publishes an event, and the UI responds by showing the banner.
3. When the UI finishes, it publishes a presentation-complete event.
4. The waiting command receives a matching event, completes execution, and calls the next step in the main flow.

The implementation is spread across [BattleServer](https://github.com/Squad-Quadrant/GraduationProject/blob/master/Assets/Scripts/Systems/BattleFlow/BattleServer.cs), [AwaitPresentationCommand](https://github.com/Squad-Quadrant/GraduationProject/blob/master/Assets/Scripts/Data/Runtime/Commands/AwaitPresentationCommand.cs), and [TurnBannerPresenter](https://github.com/Squad-Quadrant/GraduationProject/blob/master/Assets/Scripts/Presentation/UI/Presenter/TurnBannerPresenter.cs).

This works, but the overall structure feels loosely connected and not particularly sound. Looking back, I am not very happy with it. The main flow only knows that it is waiting for a certain kind of event; it does not directly know who is responsible for completing the work. The UI code has to remember to send a notification at the right time, with the category, type, and other event details matching the waiting conditions.

The system runs on conventions that developers have to maintain themselves. If any path misses a notification, the flow may remain stuck waiting. The project does handle the case where opening the UI fails by immediately sending a completion event. But every new branch still needs to be checked against those conventions.

Reading the code has the same problem. A process with a clear order has been split into publishing, subscribing, callbacks, and command completion. To understand the whole flow, I have to jump between several files.

Looking back, what this needs is a call with an explicit completion point. The main flow needs the UI to finish something before continuing, and that relationship can be expressed directly.

I would now consider exposing an awaitable method through a UI interface and organizing the flow with `async/await`. At least then, reading the main flow would show where the UI appears, where execution waits, and where it continues. How the wait ends on cancellation, an exception, or UI destruction would also need to be designed. For example, the flow could be organized with `async` methods returning `UniTask`:

```csharp
// One unit's turn is an async method, with the flow visible in one place.
async UniTask RunUnitTurn(Unit unit) {
    var intent = await _input.WaitForIntent(unit);   // Wait for input
    var result = _combat.Resolve(unit, intent);      // Update internal state immediately
    _bus.Publish(new DamageDealtEvent(result));      // Broadcast a notification
    await _view.PlayAttack(unit, result);            // Wait for the presentation
}
```

Events are still useful for notifying other modules about state changes. But I would use them more carefully for steps that must wait for a result before continuing.

### Interfaces Can Provide Decoupling

Another point worth discussing is that needing a capability from the presentation layer does not mean the logic layer must depend on its concrete implementation.

For example, the main flow could depend on an `ITurnBannerView` interface implemented by the presentation layer. It would know which capability it needs without knowing how the animation plays or how UI objects are created.

This preserves a direct call relationship and allows the caller to wait for completion. The execution order is easier to follow than when one event is published and another is awaited in response.

So if the goal is simply to avoid referencing a concrete class, I would consider an interface first. There is no need to turn the call into event-based communication from the start.

### Use the Event Bus Only for Actual Broadcasts

For the `Event Bus`, I want to keep a fairly clear rule for myself: **use it only for actual broadcasts.**

By a broadcast, I mean that the publisher only announces that something has happened and does not depend on a particular subscriber's return value. Whether any subscribers exist, or how many there are, should not determine whether the publisher can continue.

I can start with two questions:

1. Does the publisher need to wait for a result?
2. Is the receiver a specific executor, or could there be zero, one, or multiple subscribers?

For example, once damage has been resolved, other modules can update health bars, write logs, or play sounds. The damage calculation module does not need to arrange each response individually, so an event makes sense here.

But showing a UI and waiting for it to finish involves a specific executor and completion point. Even if the messages go through an Event Bus, the main flow still depends on the UI's response. In this case, I would prefer a direct call or an awaitable method.

### Commands Need a Concrete Purpose

The project also uses a Command Queue. It provides a consistent execution mechanism, but it also requires command objects, completion callbacks, and separate handling for synchronous and asynchronous commands.

For this kind of flow, I would first ask whether I actually need command scheduling, Undo/Redo, or similar capabilities. If I just want to run several steps in order and wait for animations or input, an async method may already be enough.

Commands can also be used to record actions and replay them. The question is still whether the project has those specific needs. The [Command chapter of *Game Programming Patterns*](https://gameprogrammingpatterns.com/command.html) discusses these uses.

What I want to remember from this review is: **do not wrap every operation in a Command just to give everything the same execution mechanism.** If I am not using the capabilities it provides but still have to maintain completion notifications manually, I should reconsider whether the extra layer is worthwhile.

## Layering and Code Organization

### How the Project Is Currently Organized

The code is mainly divided into `Core`, `Data`, `Systems`, and `Presentation`. `Core` contains infrastructure such as the Event Bus, state machine, and command queue. `Data` holds some configuration, events, and commands, while `Systems` contains the implementations of the gameplay systems. Unity-related components, such as objects inheriting from `MonoBehaviour`, mostly live in `Presentation`.

The idea was to separate gameplay logic from Unity-related code. The folders reflect that separation, but they also scatter the code for a single feature across different locations.

For example, turn logic lives in `Systems/Turn`, related events in `Data/Runtime/Events/Turn`, and the turn banner UI is split between `Presentation/UI/Panel` and `Presentation/UI/Presenter`. Understanding or changing a complete feature means moving between these directories. A Panel and its Presenter are closely related, but they are stored separately because they are different types of code.

I do not think the code organization has enough cohesion. I paid more attention to what category a piece of code belonged to than to which pieces belonged to the same feature and often needed to change together.

### Separating Pure Logic from Unity-Related Code

I still agree with separating pure logic from Unity-related code. But "easier to test" is not a concrete enough reason for me.

What matters more is what that separation gives me during development:

- **Easier bug reproduction.** If logic depends only on explicit state and inputs, I can recreate the same conditions without playing the game back to that state every time. Randomness, time, and similar factors also need to be controlled.
- **Simulation without running a scene.** For example, AI could run battles to help examine rules involving damage, cover, and action points without running all the visuals and animations at the same time.
- **Easier saving, replay, and undo.** When state and state transitions are explicit, recording and restoring them becomes easier to handle.

These benefits explain the reason for separating the code more clearly than simply saying it improves testability. Of course, separation has its own cost, so the choice should depend on what the project actually needs.

I think testability can be a way to inspect a design: could I give this service some inputs and run it independently without opening a Unity scene? If not, does it really need information from the scene, or are its dependencies not clearly organized?

### Connecting Logic and External Systems with an Adapter

Making a logic service more independent also means looking at its relationship with the Event Bus.

One approach I could try is having the service expose its state changes through C# `event`s. An external Adapter would subscribe and forward them to the Event Bus. The service would no longer need to hold the global Event Bus itself, and existing subscribers could continue receiving notifications.

The same applies in the other direction. If the service currently subscribes to global events itself, an Adapter could subscribe instead and call the service's methods.

The communication still exists, but the service needs to know less. How the external systems pass messages can be handled outside it.

I would also try to keep data objects focused on storing state, with the services that modify that state publishing the corresponding notifications. Business state changes and the orchestration that follows should have clear responsibilities, so modifying a data object does not also advance unrelated flows.

### Folders Organize Code; Assemblies Constrain Dependencies

The project is mainly organized into directories such as `Core`, `Data`, `Systems`, and `Presentation`. Unity-related components mostly live in `Presentation`, logic implementations in `Systems`, and many events and commands in `Data`.

An obvious problem with this arrangement is that it splits up the code for a single feature. Changing the turn system means finding the logic, events, UI, and Presenters. A Panel and its Presenter are also stored separately because they belong to different code categories.

Folders cannot constrain dependencies on their own, either. Code in `Systems` can still reference `Presentation`. The directory structure may look layered without the actual dependencies following that structure.

If I need to restrict dependency directions, I can use asmdef files to divide code into assemblies and configure only the allowed references. For an assembly that should not use Unity APIs, enabling `No Engine References` removes the automatically added Unity references. [Unity's asmdef configuration documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/class-AssemblyDefinitionImporter.html) explains these options.

Some of the rules can then be checked at compile time, rather than relying entirely on developers remembering the conventions.

### Organizing by Context, Layer, and Feature

If I reorganized the project, I would consider the following order:

1. **Separate relatively independent parts first.** In-battle gameplay and out-of-battle menus or loadout selection may have different lifecycles. Within battle, turns, vision, and damage are closely connected, so there is no need to force them into independent systems just for classification.
2. **Define each layer's responsibilities.** `Domain` holds rules and state, `Application` orchestrates flows, and `Presentation` handles Unity visuals and interaction.
3. **Group code by feature within each layer.** Turn-related code goes in `Turn`, unit-related code in `Unit`. Events, commands, and configuration should stay close to the feature they belong to, and a Panel should live alongside its Presenter.

Here is a more complete reference structure:

```text
Assets/Scripts/
├─ Core/                    [asmdef]
│  └─ General infrastructure: EventBus, FSM, logging, etc.
├─ Shared/                  [asmdef]
│  └─ Pure data and types shared across modules
├─ UI/                      [asmdef]
│  └─ Gameplay-independent UI framework and reusable controls
├─ Battle/
│  ├─ Domain/               [asmdef]
│  │  ├─ Turn/
│  │  ├─ Unit/
│  │  ├─ Combat/
│  │  ├─ Vision/
│  │  └─ Map/
│  ├─ Application/          [asmdef]
│  │  └─ Flow orchestration and view interfaces
│  └─ Presentation/         [asmdef]
│     ├─ Turn/
│     │  └─ Panels, Presenters, etc.
│     ├─ Unit/
│     └─ Map/
├─ Meta/
│  ├─ Domain/               [asmdef]
│  └─ Presentation/         [asmdef]
├─ App/                     [asmdef]
│  └─ Bootstrapper, LevelLoader, dependency wiring
└─ Editor/                  [asmdef]
   └─ Editor tools
```

The dependency directions also need to be defined:

- `Domain` does not depend on `Application` or `Presentation`. It only references the pure data or infrastructure it actually needs.
- `Application` depends on `Domain` and expresses its presentation needs through interfaces.
- `Presentation` implements those interfaces and can depend on `Application`, `Domain`, and the general UI framework.
- `Meta` and `Battle` should avoid referencing each other directly, with shared types and external flow orchestration coordinating them instead.
- `App` wires these parts together.

This template records responsibilities and dependencies. There is no need to create every directory and assembly at the start of a project.

A minimal first step could be to extract `Battle.Domain` into its own assembly. But its dependencies must be organized too: a custom assembly cannot reference code in Unity's predefined assemblies. Moving one directory while still depending on `Core` or `Shared` types left in a predefined assembly would not work. See [Unity's documentation on assemblies](https://docs.unity.cn/Manual/ScriptCompilationAssemblyDefinitionFiles.html).

## Other Design and Refactoring Principles

### YAGNI: Add Abstractions for Concrete Needs

YAGNI is a principle I need to keep reminding myself of during this review.

I want to use "is there a second concrete use case?" as a check before adding an abstraction. If there is only one implementation and future cases are still unclear, I do not need to rush into designing a general framework.

The purpose of the abstraction also matters. Even with only one implementation, the view interface discussed earlier has a clear role: limiting the main flow's dependency on presentation details. That boundary has a different justification from an extension point designed for a feature that might appear later.

Either way, I should be able to explain why the abstraction is needed now. Otherwise, interfaces, base classes, and intermediate layers add code and more steps to understanding a feature.

### Check Dependencies When Problems Appear

Flows that are hard to follow, bugs that are hard to reproduce, and files for the same feature scattered everywhere are all reasons to revisit whether module responsibilities and dependencies are clear.

For example, if a waiting command keeps getting more complicated, recognizing more events and accumulating more completion conditions, I should reconsider whether event-based orchestration still suits that flow.

Local issues still need fixing. But I want to make one more check in the future: is the new handling covering a missed case, or is it keeping an already confusing set of relationships going?

Most of these changes have not been tried in the original project. I am recording the reasoning first so that, in a similar project, I can compare it with what actually happens and keep adjusting it.
