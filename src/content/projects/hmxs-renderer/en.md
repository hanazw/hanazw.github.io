---
title: HmxsRenderer - C++ Software Renderer
description: A C++ software renderer with an interactive Win32 window. Custom shaders, perspective-correct rasterization, and forward and deferred rendering paths.
lang: en
slug: hmxs-renderer
tags:
  - cpp
  - graphics
draft: false
cover: https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/hmxs-renderer.png
---

> **Source Code:** [Graphics-HmxsRenderer on GitHub](https://github.com/hmxsqaq/Graphics-HmxsRenderer)

![HmxsRenderer displaying a textured head in a Win32 window with camera, lighting, and input information](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/hmxs-renderer.png>)

## Overview

HmxsRenderer is my personal software 3D renderer, written in C++20. It implements the rendering pipeline on the CPU and displays the resulting framebuffer in a native Windows window through Win32 GDI, without a third-party graphics library.

The project began as a computer graphics course project, [Graphics-TinyRenderer](https://github.com/hmxsqaq/Graphics-TinyRenderer), inspired by Dmitry V. Sokolov's [tinyrenderer](https://github.com/ssloy/tinyrenderer). I completed the refactor into HmxsRenderer to move from exporting rendered images to an interactive application, while separating the math, rendering, scene, and platform code.

## What Changed in the Refactor

- **Interactive display:** A Win32 window presents the framebuffer alongside FPS, camera, lighting, and control information.
- **Scene organization:** Mesh and camera objects use components for transforms, geometry, and projection settings.
- **Shader interface:** Vertex and fragment stages separate rendering mechanics from individual shading models.
- **Rendering paths:** The renderer supports a forward path and a basic deferred path with a normal G-buffer and a separate shading pass.
- **Reusable foundations:** Template-based vectors and matrices, typed image and depth buffers, and model loading support the pipeline.

## Rendering Features

The rasterizer processes triangles within their screen-space bounding boxes, computes barycentric coordinates, applies perspective correction to interpolated attributes, and uses a depth buffer to determine visibility. A custom vertex/fragment shader interface makes it possible to experiment with lighting and surface appearance.

Implemented features include:

- Wavefront `.obj` model loading with vertex positions, normals, and UV coordinates.
- `.tga` texture reading and writing, including RLE compression.
- Diffuse and specular texture sampling, plus object-space and tangent-space normal mapping.
- Phong and Blinn-Phong shaders, along with solid-color, grayscale, and normal-based shading implementations.
- Multiple directional lights and per-object model transforms.
- Color, depth, and normal buffers for forward rendering and deferred shading experiments.

## Architecture

| Module | Responsibility |
| --- | --- |
| Math | Vector and matrix operations, transformations, and interpolation |
| Models and textures | OBJ parsing, TGA image data, and texture sampling |
| Renderer and shaders | Vertex processing, triangle rasterization, depth testing, and shading |
| Scene and components | Mesh objects, camera, transforms, lights, and shader selection |
| Win32 platform | Window management, GDI framebuffer presentation, input callbacks, and text overlays |

Each frame, the scene supplies camera, light, and object data to the active shader. The renderer processes each mesh into the framebuffer, optionally runs a deferred shading pass, and sends the color buffer to the Win32 window.

## Interactive Controls

| Input | Action |
| --- | --- |
| W / A / S / D / Q / E | Move the camera |
| Space | Reset the camera and model transforms |
| Enter | Toggle model rotation |
| Left / right mouse button | Cycle through the shaders registered in the scene |
| Esc | Close the window |

The repository's current demo uses the forward path with Blinn-Phong shading. Other shader implementations and the deferred path can be configured in `src/main.cpp`.

## Building the Project

The application targets Windows and uses CMake 3.28 or newer with a C++20 compiler. From the repository root:

```powershell
cmake -S . -B build
cmake --build build --config Release
```

CMake copies the model and texture assets to the configured output directory. Run the generated `Graphics_HmxsRenderer.exe` from the build output; its location depends on the selected CMake generator.

## Project Focus

This is a learning project focused on understanding how a rendering pipeline works and turning that understanding into an interactive C++ application. The refactor connects the underlying graphics algorithms with scene organization, native windowing, and input handling.
