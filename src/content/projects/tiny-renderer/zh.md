---
title: 从零开始的C++软光栅渲染器
description: 《计算机图形学》结课项目 一个从零开始无第三方依赖的软光栅渲染器
lang: zh
slug: tiny-renderer
tags:
  - cpp
  - graphics
draft: false
cover: https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202406202341390.png
---


> 项目地址：[https://github.com/hmxsqaq/Graphics-TinyRenderer](https://github.com/hmxsqaq/Graphics-TinyRenderer)
>
> GitHub中有更加详细的英语项目文档与实时更新的项目源码
>
> *这个项目是我进行图形学学习的起点，存在着诸多不完善与我自己不满意的地方，我正在基于`Win32API`对项目进行重构，感兴趣的话可以查看[这里](https://github.com/hmxsqaq/HmxsRenderer)*

## 概述

这是一个基于 [tinyrenderer](https://github.com/ssloy/tinyrenderer/wiki) 的微型 C++ 软光栅渲染器，可以读取`.obj`模型文件与`.tga`纹理图像，对模型进行渲染后将结果输出到`.tga`文件中

我的目标是创建一个不依赖任何第三方库的足够灵活的渲染器，在这一实践中我会亲自编写从最基础的几何数学库到光栅化渲染器的全部代码，在这一过程中，我可以全面地了解并控制渲染器中的一切，提升自己对图形学、C++与软件架构设计的理解，这对我之后的学习大有裨益。

以下是一些输出图片的例子：

*因为md不支持原生显示tga图片，为方便展示，这里的图片经由外部转换为了png格式*

![image-20240620234127293](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202406202341390.png>)

![african_head_gouraud_shader](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202406202345553.png>)

![african_head_static_layer_value_shader](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202406202345558.png>)

![boggie](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202406202351974.png>)

![diablo3_tangent_shader](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202406202351979.png>)

## 特性

- [x] 无第三方库依赖
- [x] 小型灵活的架构
- [x] 自建几何库（向量与矩阵操作）
- [x] `.obj` 模型读取
- [x] `.tga` 图片读取与写入（带 RLE 压缩算法）
- [x] 线段绘制
- [x] 重心坐标计算
- [x] 三角形光栅化
- [x] 深度缓冲
- [x] 法线贴图
- [x] 纹理映射
- [x] Phong 着色
- [x] 可定制的着色器
- [ ] 阴影映射
- [ ] 抗锯齿

## 架构

![class_diagram](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202406202351924.png)

- `main.cpp`

这是程序的主渲染流程。

1. 定义基本信息，如图像大小、模型路径、相机等
2. 加载模型和纹理
3. 初始化渲染器与着色器
4. 设置MVP矩阵和视口矩阵
5. 渲染!!!
6. 保存图像

你可以在 `main.cpp` 文件中定义你自己的着色器

```cpp
int main(int argc, char** argv) {
    std::vector<std::string> object_infos = {
            // R"(..\model\african_head\african_head.obj)",
            // R"(..\model\african_head\african_head_eye_inner.obj)",
            // R"(..\model\diablo3_pose\diablo3_pose.obj)",
            // R"(..\model\boggie\body.obj)",
            // R"(..\model\boggie\eyes.obj)",
            // R"(..\model\boggie\head.obj)",
            R"(..\model\cottage.obj)",
    };
    const std::string output_filename = "../image/output.tga";

    Renderer renderer(width, height, Color::RGB);

    for (const auto& model_path : object_infos) {
        Object object(model_path, {0.0, 0.0, 0.0}, 0, 1);
        set_model_mat(object.angle, object.scale, object.position);
        set_view_mat(camera.position);
        set_projection_mat(camera.fov, camera.aspect_ratio, camera.zNear, camera.zFar);
        GouraudShader shader(object.model, {light1, light2});
        renderer.draw_object(object, shader);
    }

    TGAHandler::write_tga_file(output_filename,
                               renderer.width(),
                               renderer.height(),
                               renderer.bpp(),
                               renderer.frame_data());
    return 0;
}
```

- `geometry.h` 和 `color.h`

它们是基本的几何和颜色类，用于定义程序的基本数据结构。

`geometry` 使用 `template` 定义了 `Vec<int>`、`Mat<int, int>` 类，用于表示向量和矩阵。它实现了一些基本的向量和矩阵操作，如 `+`、`-`、`*`、`/` 等，以及一些有用的函数，如 `cross()`、`normalize()`、`invert()`、`transpose()` 等。

`color` 定义了 `Color` 类，用于表示图像的颜色，使用四位 `uint8_t` 存储颜色数据。

```cpp
struct Color {
    enum ColorFormat { GRAYSCALE = 1, RGB = 3, RGBA = 4 };

    std::array<std::uint8_t, 4> bgra = {0, 0, 0, 0}; // BLUE, GREEN, RED, alpha

    constexpr std::uint8_t& operator[](const int i) noexcept { assert(i >= 0 && i < 4); return bgra[i]; }
    constexpr std::uint8_t operator[](const int i) const noexcept { assert(i >= 0 && i < 4); return bgra[i]; }
    constexpr std::uint8_t R() const noexcept { return bgra[2]; }
    constexpr std::uint8_t G() const noexcept { return bgra[1]; }
    constexpr std::uint8_t B() const noexcept { return bgra[0]; }
    constexpr std::uint8_t A() const noexcept { return bgra[3]; }
    constexpr Vec3 to_vec3() const noexcept { return { R() / 255.0, G() / 255.0, B() / 255.0 }; }
};

inline std::ostream& operator<<(std::ostream &out, const Color &color) {
    out <<
    "R " << static_cast<int>(color.R()) <<
    " G " << static_cast<int>(color.G()) <<
    " B " << static_cast<int>(color.B()) <<
    " A " << static_cast<int>(color.A());
    return out;
}

inline Color operator*(const Color &color, const double scalar) {
    Color result;
    for (int i = 0; i < 3; ++i)
        result[i] = static_cast<std::uint8_t>(color[i] * scalar);
    return result;
}
```

- `texture.h` 和 `model.h`

它们用于加载纹理和模型。

`texture` 定义了 `Texture` 类，存储纹理图像的颜色数据。并且它提供了 `get_color(uv)` 函数，让其他类可以在给定的 uv 坐标处获取纹理图像的颜色。

`model` 定义了 `Model` 类，可以读取 `.obj` 模型文件并将其数据（顶点，面，纹理等）加载到内存中。

```cpp
struct Texture {
    int width = 0;
    int height = 0;
    std::uint8_t bpp = 0;
    std::vector<std::uint8_t> data = {};

    Texture() = default;
    Texture(const int _width, const int _height, const std::uint8_t _bpp)
        : width(_width), height(_height), bpp(_bpp), data(_width * _height * _bpp) {}

    Color get_color(const int x, const int y) const {
        if (data.empty() || x < 0 || y < 0 || x >= width || y >= height) {
            std::cerr << "get pixel fail: x " << x << " y " << y << "\n";
            return {};
        }

        Color ret = {0, 0, 0, 0};
        const std::uint8_t *pixel = data.data() + (x + y * width) * bpp;
        std::copy_n(pixel, bpp, ret.bgra.begin());
        return ret;
    }

    Color get_color(const Vec2& uv) const {
        return get_color(static_cast<int>(uv[0] * width), static_cast<int>(uv[1] * height));
    }

    void flip_horizontally() {
        const int half = width >> 1;
        for (int x = 0; x < half; ++x)
            for (int y = 0; y < height; ++y)
                for (int b = 0; b < bpp; ++b)
                    std::swap(data[(x + y * width) * bpp + b],
                              data[(width - 1 - x + y * width) * bpp + b]);
    }

    void flip_vertically() {
        const int half = height >> 1;
        for (int x = 0; x < width; ++x)
            for (int y = 0; y < half; ++y)
                for (int b = 0; b < bpp; ++b)
                    std::swap(data[(x + y * width) * bpp + b],
                              data[(x + (height - 1 - y) * width) * bpp + b]);
    }
};
```

- `renderer.h`

它定义了 `Renderer` 类，这是程序的核心。它包含了主要的渲染算法，如线条绘制、重心获取、三角形光栅化等。

图像颜色数据将存储在一个名为 `frame_buffer` 的 `vector<uint8_t>` 中，这是一种格式较为底层的格式，我想这有利于后续的开发。我使用 bpp（每像素位数）作为偏移量来存储像素颜色和索引。

```cpp
void set_model_mat(double angle, double scale, const Vec3 &translate);
void set_view_mat(const Vec3& eye_point);
void set_projection_mat(double fov, double aspect_ratio, double zNear, double zFar);
void set_viewport_mat(int x, int y, int w, int h);

class Renderer {
public:
    Renderer() = default;
    Renderer(int width, int height, int bbp);

    Color get_pixel(int x, int y) const;
    void set_pixel(int x, int y, const Color &color);
    void draw_line(Vec2 p0, Vec2 p1, const Color &color);
    void draw_triangle_linesweeping(Vec2 p0, Vec2 p1, Vec2 p2, const Color &color);
    void draw_object(const Object &object, IShader &shader);

    int width() const { return width_; }
    int height() const { return height_; }
    std::uint8_t bpp() const { return bpp_; }
    auto frame_data() const { return frame_buffer_.data(); }
    auto& frame_buffer() { return frame_buffer_; }
    auto depth_data() const { return depth_buffer_.data(); }
    auto& depth_buffer() { return depth_buffer_; }
private:
    void draw_triangle(const Mat<3, 4> &t_vert_clip, IShader &shader);

    static Vec3 get_barycentric2D(const std::array<Vec2, 3> &t_vert, const Vec2& p);
    static bool is_inside_triangle_cross_product(const Vec2 *t, const Vec2& P);

    int width_ = 0;
    int height_ = 0;
    std::uint8_t bpp_ = 0; // bits per pixel
    std::vector<std::uint8_t> frame_buffer_ = {};
    std::vector<double> depth_buffer_ = {};
};
```

- `shader.h`

它是与渲染相关的类和方法的集合，包括 `Object` 和 `Camera` 等工具。它还定义了基本的 `IShader` 接口，作为所有着色器的基类。

```cpp
struct Camera {
    Vec3 position;
    double fov;
    double aspect_ratio;
    double zNear;
    double zFar;

    Camera(const Vec3& position, double fov, double aspect_ratio, double zNear, double zFar)
            : position(position), fov(fov), aspect_ratio(aspect_ratio), zNear(zNear), zFar(zFar) {}
};

struct Object {
    const Model model;
    Vec3 position;
    double angle;
    double scale;

    Object(const std::string &model_path, const Vec3 &position, const double angle, const double scale)
            : model(Model(model_path)), position(position), angle(angle), scale(scale) {}
};

struct Light {
    Vec3 direction;
    Vec3 intensity;
};

struct IShader {
    virtual ~IShader() = default;

    explicit IShader(const Model &model, std::vector<Light>&& lights = std::vector<Light>())
        : model_(model), lights_(std::move(lights)) {
    }

    virtual void start() { }
    virtual void vertex(int i_face, int nth_vert, Vec4 &ret_vert) = 0;
    virtual bool fragment(const Vec3 &bc, Color& ret_color) = 0;

protected:
    const Model& model_;
    std::vector<Light> lights_;
};
```

- `tga-handler.h`

这是一个静态的 TGA 图像读取器和写入器，可以读取和写入带有 RLE 压缩的 TGA 图像。

Run-Length Encoding（RLE）是一种简单且高效的数据压缩算法，特别适用于压缩包含大量重复元素的数据。RLE的基本思想是将连续出现的相同数据值替换为一个单一的值和一个计数。

例如，考虑字符串 "AAAABBBCCDAA"。使用RLE，这个字符串可以被压缩为 "4A3B2C1D2A"。这里，“4A”表示字母 'A' 连续出现四次，“3B”表示 'B' 连续出现三次，以此类推。

```cpp
// standard TGA header
#pragma pack(push, 1)
struct TGAHeader {
    std::uint8_t  id_length = 0;
    std::uint8_t  color_map_type = 0;
    std::uint8_t  data_type_code = 0;
    std::uint16_t color_map_origin = 0;
    std::uint16_t color_map_length = 0;
    std::uint8_t  color_map_depth = 0;
    std::uint16_t x_origin = 0;
    std::uint16_t y_origin = 0;
    std::uint16_t width = 0;
    std::uint16_t height = 0;
    std::uint8_t  bits_per_pixel = 0;
    std::uint8_t  image_descriptor = 0;
};
#pragma pack(pop)

class TGAHandler {
public:
    TGAHandler() = delete;

    static Texture read_tga_file(const std::string& filename);
    static bool write_tga_file(const std::string &filename, int width, int height, std::uint8_t bpp, const unsigned char *data, bool v_flip = false, bool rle = true);
private:
    static bool load_rle_data(std::ifstream &in, Texture &texture);
    static bool unload_rle_data(std::ofstream &out, int width, int height, std::uint8_t bpp, const unsigned char *data);
};
```

