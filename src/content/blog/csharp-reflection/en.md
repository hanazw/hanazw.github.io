---
title: Reflection in C#
description: Notes on how C# reflection works and how it is used in Unity.
lang: en
slug: csharp-reflection
translation_key: csharp_reflection
tags:
  - csharp
draft: false
published_date: "2024-05-22"
---


## Introduction

Reflection is a powerful feature in C#. It is widely used in many aspects of Unity and game development. I had heard of it before but always found it intimidating and only had a superficial understanding. I never had a clear grasp of what reflection is or what it's truly used for.

This article contains my notes from a more systematic study of reflection. I hope you find it helpful! 😆

---

## Memory Layout in C#: Classes and Instantiation

The class is one of the most fundamental concepts in C#. Every script in Unity is a class, and when writing C# code, we interact with classes constantly.

In essence, a class can be described as a **"blueprint for a type"** or a **"collection of fields and methods."** A class itself is merely a description or a declaration. It specifies what data and methods a type consists of, and nothing more. It does not point to any specific block of memory.

The process of "class instantiation" is what allocates and associates memory with this blueprint. Instantiation is the process of allocating memory space for a specific instance based on the class declaration.
*   For standard classes, we use the `new` keyword to instantiate them.
*   In Unity, components that inherit from `MonoBehaviour` and are attached to a `GameObject` are instantiated for us automatically by the engine.

When we instantiate a class, a specific block of memory is allocated for its data members (fields). The class's member functions (methods), however, are compiled into a set of instructions and stored in the code segment. This single set of instructions is shared globally by all instances of that class.

---

## The Principle of Reflection: The Ship of Theseus for Classes

### Describing and Deconstructing a Class

Consider a common scenario in Unity: we attach a script named "`GameManager`" to a `GameObject` called "`Game`". In the Inspector, we set an `int` variable `a` inside `GameManager` to `1`. After we save, close, and reopen the Unity project, we find that `GameManager` is still attached to the `Game` object, and the variable `a` is still `1`.

This seems ordinary, but if we examine the underlying mechanics, it's quite remarkable.

Attaching a script is an instantiation process. When we close the project, that instance is destroyed. The data, however, is saved as a string in the `.scene` file. When we reopen the project, Unity must dynamically re-instantiate our script based on that saved string data to restore the state. This is not a trivial task. Normally, instantiating an object from a string would lead to code like this:

```csharp
if (name == "GameManager"){
    Game.AddComponent<GameManager>();
}
else if (name == "PlayerController") {
    Game.AddComponent<PlayerController>();
}
else if (...) // and so on for every possible component
```

Implementing the scene-loading process this way would be a disaster. It would mean that every time a developer created or renamed a script, the engine's source code would need to be modified and recompiled.

The core of the problem is this: **Every class has a unique definition and is a distinct type, and we lack a unified way to process these different definitions and types.**

If we could find a standardized way to describe *any* class, this problem would be solved. This is the core idea behind reflection, which I like to call **the Ship of Theseus for classes**.

Any class can be broken down into a unified description containing:

-   **Memory Size of an Instance:** The compiler can determine the size of the memory block needed for an instance of the class.
-   **Data Member Information:** We can store the names, types, and memory offsets of all data members in a list or array.
    -   Example: `{"name", type string, offset 1}, {"damage", type int, offset 2}`
-   **Member Function Information:** Similarly, we can store the names, signatures, and addresses of all methods.
    -   Example: `{"Add", type func, address 0xaa}`

With this standardized description format, we can represent any class. This makes it possible to process different classes in a unified way.

### Re-instantiation: Introducing the `Type` Class

In C#, the `System.Type` class is used to store this metadata about a specific class. When we need to dynamically instantiate an object, we can do so using the information stored in its corresponding `Type` instance.

A simplified representation of the `Type` class might look like this:

```csharp
class FieldData {
    string name;
    Type type;
    int offset;
}

class MethodData {
    string name;
    Type type; // Return type
    int address;
}

class Type {
    int size;
    List<FieldData> fields;
    List<MethodData> methods;
}
```

This illustrates how a `Type` object stores all the necessary information to completely describe a class. Using this data, the engine's core can call OS-level APIs to dynamically allocate memory and construct objects of any type.

Here is the general workflow for creating an object using its `Type` data:

1.  When a class is compiled, a global `Type` object containing its metadata is generated. We can retrieve this `Type` instance using APIs like `System.Type.GetType("ClassName")` or `typeof(T)`.
2.  This `Type` object contains all the information needed to describe the class, including collections like `FieldInfo[]` (for data members) and `MethodInfo[]` (for member methods).
3.  Using Reflection APIs, such as `Activator.CreateInstance`, we can construct an object from its `Type` data.
4.  Since the `Type` object holds all information about the class, we can not only construct instances but also access, modify, and invoke their members at runtime.

---

## Application of Reflection: A Unity Example

```csharp
using System;
using System.Reflection;
using UnityEngine;

// A sample class to be manipulated via reflection.
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
        Debug.Log("Name: " + Name);
        Debug.Log("Value: " + Value);
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
        // Get the Type object for the Data class.
        Type type = Type.GetType("Data");
        
        ShowConstructors(type);
        ShowPublicMethods(type);
        CreateObjectByConstructor(type);
        CreateObjectByActivator(type);
    }

    // Gets the types and names of all parameters for all constructors.
    private void ShowConstructors(Type type)
    {
        // Get all constructor information from the Type.
        ConstructorInfo[] constructorInfos = type.GetConstructors();
        foreach (var constructorInfo in constructorInfos)
        {
            // Get all parameters for each constructor.
            ParameterInfo[] parameterInfos = constructorInfo.GetParameters();
            foreach (var parameterInfo in parameterInfos)
            {
                Debug.Log($"Type: {parameterInfo.ParameterType}, Name: {parameterInfo.Name};");
            }
        }
    }
    
    // Gets all public methods of the class.
    private void ShowPublicMethods(Type type)
    {
        MethodInfo[] methodInfos = type.GetMethods();
        foreach (var methodInfo in methodInfos)
        {
            Debug.Log($"Method: {methodInfo}");
        }
    }
    
    // Dynamically creates an object using a specific constructor via reflection.
    private void CreateObjectByConstructor(Type type)
    {
        // Get the constructor that takes a string and an int.
        ConstructorInfo constructorInfo = type.GetConstructor(new []{typeof(string),typeof(int)});
        
        // Prepare the parameters.
        object[] parameters = { "Hmxs", 100 };
        
        // Invoke the constructor to create the object.
        object obj = constructorInfo!.Invoke(parameters);
        
        // Cast and use the object.
        ((Data)obj).Show();
    }
    
    // Dynamically creates an object using the static Activator class.
    private void CreateObjectByActivator(Type type)
    {
        object[] parameters = { "Hmxs2", 200 };
        object obj = Activator.CreateInstance(type, parameters);
        ((Data)obj).Show();
    }
}
```

In the code above, we use C#'s built-in Reflection API to inspect and instantiate the `Data` class.

> In summary, reflection can seem very complex at first because its APIs have long names and can be intricate. However, the underlying concept is not that difficult to understand.
