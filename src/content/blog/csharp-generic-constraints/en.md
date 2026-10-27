---
title: Generic Constraints in C#
description: Generics are an extremely important feature in C#. Proper use of generics can greatly improve coding efficiency. Here are some usage methods for generic constraints summarized.
lang: en
slug: csharp-generic-constraints
translation_key: csharp_generic_constraints
tags:
  - csharp
draft: false
published_date: "2023-03-28"
---

> Generic constraints place restrictions on a generic type parameter. They are used to limit the kinds of types that can be used as arguments for the type parameter.

**Basic Syntax:**

```csharp
class MyGeneric<T> where T : struct | class | new() | <base class name> | <interface name>
```

---

## Value Type Constraint: `where T : struct`

The type argument `T` must be a **value type**. Any non-nullable value type can be specified.

(Value types include `int`, `float`, `char`, `bool`, `struct`, `enum`, `byte`, etc. Memory for a value type is allocated directly where it is declared.)

### Example

```csharp
public class MyGeneric<T> where T : struct { }
    
static void Main(string[] args)
{
    // Valid: int is a struct (value type)
    MyGeneric<int> myGenericInt = new MyGeneric<int>();
}
```

---

## Reference Type Constraint: `where T : class`

The type argument `T` must be a **reference type**. This includes any class, interface, delegate, or array type.

(Reference types include `string` and any custom `class`. When a reference type variable is declared, memory is allocated on the stack to hold an address. The actual object instance is created on the heap, and its memory address is stored in the stack variable.)

### Example

```csharp
public class MyGeneric<T> where T : class { }

static void Main(string[] args)
{
    // Valid: string is a class (reference type)
    MyGeneric<string> myGenericString = new MyGeneric<string>();
}
```

---

## Interface Constraint: `where T : <interface name>`

The type argument `T` must **implement the specified interface**. Multiple interface constraints can be applied.

### Example

```csharp
public interface IMyInterface
{
    int Add(int a, int b);
    void Show();
}

public class MyImplementation : IMyInterface
{
    public int Add(int a, int b)
    {
        return a + b;
    }
    public void Show()
    {
        Console.WriteLine("This is a test.");
    }
}

// T is constrained to types that implement IMyInterface
public class MyGeneric<T> where T : IMyInterface { }

static void Main(string[] args)
{
    // Valid: MyImplementation implements IMyInterface
    MyGeneric<MyImplementation> myGenericA = new MyGeneric<MyImplementation>();
}
```

---

## Base Class Constraint: `where T : <base class name>`

The type argument `T` must be the **specified base class or a class that inherits from it**.

### Example

```csharp
public class MyBaseClass { }

public class MyDerivedClass : MyBaseClass { }

// T is constrained to MyBaseClass or its subclasses
public class MyGeneric<T> where T : MyBaseClass { }

static void Main(string[] args)
{
    // Valid: MyBaseClass is the specified class
    MyGeneric<MyBaseClass> myGenericA = new MyGeneric<MyBaseClass>();

    // Valid: MyDerivedClass inherits from MyBaseClass
    MyGeneric<MyDerivedClass> myGenericB = new MyGeneric<MyDerivedClass>();
}
```

---

## Constructor Constraint: `where T : new()`

The type argument `T` must have a **public, parameterless constructor**.

When used with other constraints, the `new()` constraint must always be specified **last**.

### Example

```csharp
public class MyClass { }

// T is constrained to MyClass (and its subclasses) and must have a public parameterless constructor
public class MyGeneric<T> where T : MyClass, new() { }

static void Main(string[] args)
{
    // Valid: MyClass has an implicit public parameterless constructor
    MyGeneric<MyClass> myGenericA = new MyGeneric<MyClass>();
}
```

---

## Practical Application of Generic Constraints

### Example: Enforcing an Inheritance Pattern

A common advanced use of the base class constraint is to ensure that a generic type parameter in a base class is the derived class itself. This is often referred to as the Curiously Recurring Template Pattern (CRTP).

```csharp
// T is constrained to be MyBaseGeneric<T> or a type that derives from it.
public class MyBaseGeneric<T> where T : MyBaseGeneric<T> { }
```

#### Explanation

According to the constraint `where T : MyBaseGeneric<T>`, the type argument `T` must be a class that inherits from `MyBaseGeneric<T>`.

This creates a powerful pattern. When another class, `MyGeneric`, wants to inherit from `MyBaseGeneric<T>`, it is forced to use itself as the type argument.

#### Implementation

```csharp
// This is valid because MyGeneric is passed as the type argument T,
// and MyGeneric itself inherits from MyBaseGeneric<MyGeneric>.
public class MyGeneric : MyBaseGeneric<MyGeneric> { }
```

This technique creates a strong, compile-time link between a base class and its derived classes, allowing the base class to call methods on the derived class without casting.