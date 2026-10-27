---
title: 「Algorithm4」读书笔记二：排序
description: 《算法4》第二章：排序 读书笔记
lang: zh
slug: algorithms-fourth-edition-sorting
translation_key: algorithms_fourth_edition_sorting
tags:
  - algorithms
draft: false
published_date: "2023-10-08"
---

![algorithm4](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202310081712174.png>)

> **官网：[https://algs4.cs.princeton.edu/home/](https://algs4.cs.princeton.edu/home/)**
>
> **笔记目录：[/zh/blog/algorithms-fourth-edition-index/](/zh/blog/algorithms-fourth-edition-index/)**

---


排序就是将一组对象按照某种逻辑顺序重新排列的过程，其在商业数据处理和现代科学计算方面都有着重要的地位，本章将聚焦于排序算法，介绍、研究并实现几种经典的排序算法。

*使用了C++对排序算法进行了重新实现，在[这一Github仓库下](https://github.com/hmxsqaq/Algorithm-Sorting)可以找到我的全部实现*

## 前言

### 排序算法功能函数

下面是一些排序所需的基本方法的定义，通过这些函数我们可以进行一定程度的封装，使我们能够更好地追踪算法运行的过程，如一共进行了多少次的比较与多少次的交换

```cpp
void Swap(std::vector<int> &vec, int a, int b);
bool IsSmaller(const int &a, const int &b);
bool IsGreater(const int &a, const int &b);
bool IsEqual(const int &a, const int &b);
bool IsSorted(const std::vector<int> &vec);
bool IsSorted(const std::list<int> &list);
void PrintVec(const std::vector<int> &vec);
void PrintVec(const std::list<int> &list);
```

- `IsSmaller/IsGreater/IsEqual`：比较两个数据的大小
- `Swap`：交换两个数据
- `PrintVec`：打印数组
- `IsSorted`：检查是否成功排序

---

## 冒泡排序

> **冒泡排序（bubble sort）通过连续地比较与交换相邻元素实现排序。这个过程就像气泡从底部升到顶部一样，因此得名冒泡排序。**

### 实现

```cpp
void BubbleSort(std::vector<int> &vec) {
    const int size = static_cast<int>(vec.size());
    for (int i = size - 1; i > 0; --i)
        for (int j = 0; j < i; j++)
            if (IsGreater(vec[j], vec[j + 1]))
                Swap(vec, j, j + 1);
}
```

如果某轮“冒泡”中没有执行任何交换操作，说明数组已经完成排序，可直接返回结果。因此，可以增加一个标志位 `flag` 来监测这种情况，一旦出现就立即返回，对效率进行优化

```cpp
void BubbleSortWithFlag(std::vector<int> &vec) {
    const int size = static_cast<int>(vec.size());
    for (int i = size - 1; i > 0; --i) {
        bool flag = false;
        for (int j = 0; j < i; j++)
            if (IsGreater(vec[j], vec[j + 1])) {
                Swap(vec, j, j + 1);
                flag = true;
            }
        if (!flag) break;
    }
}
```

### 特性

- **时间复杂度为$O(n2)$、自适应排序**：各轮“冒泡”遍历的数组长度依次为$n−1、n−2、…、2、1$，总和为 $(n−1)n/2$。在引入 `flag` 优化后，最佳时间复杂度可达到$O(n)$ 
- **空间复杂度为$O(1)$、原地排序**：指针 i 和 j 使用常数大小的额外空间
- **稳定排序**：由于在“冒泡”中遇到相等元素不交换

## 选择排序

> **选择排序（selection sort）是最简单的排序算法之一，其核心思想是：不断选择最小/大的元素**

我们会先找到数组中最小/大的元素，将其与数组的第一个元素交换位置；之后，在剩下的元素中找到最小/大的元素，将其与第二个元素交换位置；之后不断重复这一过程，直至最后一个元素

### 实现

```cpp
void SelectionSort(std::vector<int> &vec) {
    const int size = static_cast<int>(vec.size());
    for (int i = 0; i < size; i++) {
        int min_index = i;
        for (int j = i + 1; j < vec.size(); j++)
            if (IsSmaller(vec[j], vec[min_index]))
                min_index = j;
        if (min_index != i)
            Swap(vec, i, min_index);
    }
}
```

### 分析

> **对于长度为$N$的数组，选择排序需要大约$N^2/2$此比较与$N$次比较，其时间复杂度为$N^2$级别**

其有两个鲜明的特点：

- **运行时间与输入无关**：无论输入数组排序状态如何，是有序还是无序，对选择排序的运行效率都没有影响
- **数据移动时最少的**：选择排序的交换次数与数组大小是线性关系，其余任何算法都不具备这个特性（大部分都是$NlgN$或$N^2$级别）

### 特性

- **时间复杂度为$O(n2)$、非自适应排序**：外循环共$n−1$轮，第一轮的未排序区间长度为$n$ ，最后一轮的未排序区间长度为2，即各轮外循环分别包含$n、n−1、…、3、2$轮内循环，求和为$(n−1)(n+2)2$
- **空间复杂度为$O(1)$、原地排序**：指针 i 和 j 使用常数大小的额外空间
- **非稳定排序**：元素有可能被交换至与其相等的元素的右边，导致两者的相对顺序发生改变

---

## 插入排序

> **插入排序的核心思想就如同在斗地主时整理手牌：将每张牌插入到已有的有序牌中的适当位置**

在算法的实现中，由于要给元素腾出位置，我们需要将其余元素向右移动一位；与选择排序相同，索引左边的元素都是有序的，而当索引到达数组右端时，排序便完成了

### 实现

```cpp
void InsertionSort(std::vector<int> &vec) {
    const int size = static_cast<int>(vec.size());
    for (int i = 1; i < size; i++) {
        int num = vec[i], j = i;
        while (j > 0 && IsSmaller(num, vec[j - 1])) {
            vec[j] = vec[j - 1];
            j--;
        }
        vec[j] = num;
    }
}
```

### 分析

> **对于长度为$N$的数组选择排序，其时间复杂度为$N^2$级别**

插入排序在部分情况下非常有效，其实际效率很大程度上取决于其需要进行插入的次数

如果数组中倒置的数量小于数组大小的某个倍数，那么我们说这个数组是部分有序的。 下面是几种典型的部分有序的数组： 

- 数组中每个元素距离它的最终位置都不远
- 一个有序的大数组接一个小数组
- 数组中只有几个元素的位置不正确

插入排序对这样的数组很有效，而选择排序则不然；事实上，当倒置数量很少时，插入排序很可能比其他任何算法都快

---

## 希尔排序

> **希尔排序是一种基于插入排序的排序算法，其核心思想是：交换不相邻的元素以对数组的局部 进行排序，并最终用插入排序将局部有序的数组排序**

在上面对于插入排序的分析中，我们了解到：当数组是部分有序的时，插入排序非常快；而希尔排序正是利用了这点，先使数组变得部分有序，再进行进一步的排序，以加快插入排序的速度

如下图所示，希尔排序会以h为步长将数组进行分割，假设数组为`[5, 7, 1, 4, 6, 9]`，且$h=3$，则数组会被分割为`[5, 4]`、`[7, 6]`、`[1, 9]`三组；首先对组内进行插入排序（一个更简单的方法是在子数组中将每个元素交换到比它大的元素之前去即可），便可以得到`[4, 5]`、`[6, 7]`、`[1, 9]`，这被称为`h有序数组`；之后我们便可以进一步缩小h，以得到更大的h有序数组，最后实现数组的排序

我们也可以从这一角度去思考：如果$h$较大，在进行组内排序时便可以将元素移动到很远的地方，而插入排序只能一个个的进行元素移动，从而提高效率

在我们下面的实现中，使用了序列$1/2(3k-1)$，即从$N/3$开始递减至 1。我们把这个序列称为递增序列；下面的实现中实时计算了其递增序列，另一种方式是将递增序列存储在一个数组中

![image-20240111233622452](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401112336523.png)

### 实现

```cpp
void ShellSort(std::vector<int> &vec) {
    const int size = static_cast<int>(vec.size());
    int h = size / 3;
    while (h >= 1) {
        for (int i = h; i < size; ++i) {
            int num = vec[i], j = i;
            while (j >= h && IsSmaller(num, vec[j - h])) {
                vec[j] = vec[j - h];
                j -= h;
            }
            vec[j] = num;
        }
        h /= 3;
    }
}
```

### 分析

希尔排序比插入排序快了非常多

> **希尔排序更高效的原因是它权衡了子数组的规模和有序性**

希尔排序之初，各个子数组都很短，排序之后子数组都是部分有序的，这两种情况都很适合插入排序

而子数组部分有序的程度取决于递增序列的选择，但对于递增序列的选择是个复杂的问题：算法的性能不仅取决于$h$，还取决于$h$之间的数学性质，比如它们的公因子等；有很多论文研究了各种不同的递增序列，但都无法证明某个序 列是“最好的”；在我们的实现中，使用了非常简单易于计算的底层序列，但一些复杂的序列可以被证明其性能好于我们使用的序列，更加优秀的递增序列有待我 们去发现

透彻理解希尔排序的性能至今仍然是一项挑战；实际上，希尔排序是我们唯一无法准确描述其对于乱序的数组的性能特征的排序方法

---

## 归并排序

> **归并，即将两个有序数组合并成一个更大的有序数组；归并排序便是基于这一简单操作进行的**

归并排序是一种基于分治思想的递归排序算法，要将一个数组排序，可以先（递归地）将它分成两半分别排序，然后将结果归并起来

归并排序的优点在于其能够保证，排序将任意长度为$N$的数组所需的时间与$NlogN$成正比；同时，其也存在所需的额外空间与$N$成正比的缺点

![image-20240112200331668](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401122003737.png)

### 归并的抽象实现

实现归并的一种直截了当的办法是将两个不同的有序数组归并到第三个数组中，创建一个适当大小的数组然后将两个输 入数组中的元素一个个从小到大放入这个数组中即可

```cpp
void Merge(std::vector<int> &vec, const int left, const int mid, const int right) {
    const int length = right - left + 1;
    std::vector<int> temp(length);
    int i = left, j = mid + 1, k = 0;
    while (i <= mid && j <= right) {
        if (IsSmaller(vec[i], vec[j]))  temp[k++] = vec[i++];
        else                            temp[k++] = vec[j++];
    }
    while (i <= mid)    temp[k++] = vec[i++];
    while (j <= right)  temp[k++] = vec[j++];
    for (k = 0; k < length; ++k) {
        vec[k + left] = temp[k];
    }
}
```

  以上的代码演示了进行一次归并时进行的操作，需要创建一个临时数组作为辅助

上述代码可以完成一次归并，但是当我们想要用归并将一个大数组排序时，我们便需要进行多次归并，上述的方法会在每进行一次归并时都对原数组进行一次完整的复制，这会带来大量的内存消耗

与此相比，我们更需要一种“原地归并”的方法，使得我们不需要用一个额外的数组来存储数据，但实际上这是较为困难且复杂的；不管怎么说，上述方法仍然是有意义的，其帮助我们对归并操作进行了抽象化，我们可以在此基础上继续探索

### 自顶向下的归并排序

基于归并的抽象实现，我们可以实现一种自顶向下的递归归并算法

这也是应用高效算法设计中分治思想的 最典型的一个例子

#### 实现

```cpp
void MergeSortTopToBottom(std::vector<int> &vec, const int left, const int right) {
    if (left >= right) return;
    const int mid = (right + left) / 2;
    MergeSortTopToBottom(vec, left, mid);
    MergeSortTopToBottom(vec, mid + 1, right);
    Merge(vec, left, mid, right);
}

void MergeSortTopToBottom(std::vector<int> &vec) {
    const int size = static_cast<int>(vec.size());
    MergeSortTopToBottom(vec, 0, size - 1);
}
```

#### 分析

![image-20240112205259265](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401122052338.png)

上图展示了自顶向下的归并排序算法的递归树

> **对于长度为 N 的任意数组，自顶向下的归并排序需要$\frac{1}{2}NlgN$至$NlgN$次比较；最多需要访问数组$6NlgN$次**

归并排序和之前的初级排序方法不可同日而语，它表明我们只需要比遍历整个数组多个对数因子的时间就能将一个庞大的数组排序；可以用归并排序处理数百万甚至更大规模的数组，这是插入排序或者选择排序做不到的

### 改进<a id="anchor-merge_insertion"></a>

通过一些细致的思考我们还能够大幅度缩短归并排序的运行时间：

- 对小规模子数组使用插入排序

递归会使小规模问题中方法的调用过于频繁，而在前面对于插入排序的研究中，我们可以发现插入排序对于小数组可能比归并排序更快；在分割数组到足够小后，我们便可以采用插入排序，之后再进行归并，这可以提高算法的效率

- 测试数组是否已经有序

我们可以添加一个判断条件，如果a[mid]小于等于a[mid+1]，我们就认为数组已经是有序 的并跳过 merge() 方法。这个改动不影响排序的递归调用，但是任意有序的子数组算法的运行时间 就变为线性的了

- 不将元素复制到辅助数组

我们可以节省将数组元素复制到用于归并的辅助数组所用的时间；这种方法需要一些技巧，我们要在递归调用的每个层次交换输入数组和辅助数组的角色；`merge`的过程类似对着一个源文本进行重新抄录，而此方法便是让两个数组轮流作为源文本

**以下代码对上述三个优化进行了实现：**

```cpp
void MergeOptimized(const std::vector<int> &source, std::vector<int> &destination, const int left, const int mid, const int right) {
    int i = left, j = mid + 1, k = left;
    while (i <= mid && j <= right) {
        if (IsSmaller(source[i], source[j]))    destination[k++] = source[i++];
        else                                    destination[k++] = source[j++];
    }
    while (i <= mid)    destination[k++] = source[i++];
    while (j <= right)  destination[k++] = source[j++];
}

void MergeSortOptimized(std::vector<int> &source, std::vector<int> &destination, const int left, const int right) {
    static int kCUTOFF = 7;
    if (right - left <= kCUTOFF) {  // apply insertion sort for small subarrays
        InsertionSort(destination, left, right);
        return;
    }
    const int mid = (right + left) / 2;
    // *self-merge: avoid creating temp array when merging
    MergeSortOptimized(destination, source, left, mid);
    MergeSortOptimized(destination, source, mid + 1, right);
    // test if array is sorted before merge
    if (IsSmaller(source[mid], source[mid + 1])) {
        std::copy(source.begin() + left, source.begin() + right + 1, destination.begin() + left);
        return;
    }
    MergeOptimized(source, destination, left, mid, right);
}

void MergeSortOptimized(std::vector<int> &vec) {
    const int size = static_cast<int>(vec.size());
    std::vector aux_vec(vec);
    MergeSortOptimized(aux_vec, vec, 0, size - 1);
}
```

### 自底向上的归并排序

递归实现的归并排序是算法设计中分治思想的典型应用：我们将一个大问题分割成小问题分别解决，然后用所有小问题的答案来解决整个大问题；尽管我们考虑的问题是归并两个大数组， 实际上我们归并的数组大多数都非常小

在自顶向下的归并排序中，我们会先从大数组入手，一步步将大数组分割为小数组；而我们实际上还可以直接从小数组入手，即把每个元素想象成一个大小为1的数组，然后两两归并、四四归并、八八归并…直到归并完成；这种归并排序的实现方法被称为自底向上的归并排序

#### 实现

```cpp
void MergeSortBottomToTop(std::vector<int> &vec) {
    const int size = static_cast<int>(vec.size());
    for (int length = 1; length < size; length *= 2) {
        for (int left = 0; left < size - length; left += 2 * length) {
            const int mid = left + length - 1;
            const int right = std::min(left + 2 * length - 1, size - 1);
            Merge(vec, left, mid, right);
        }
    }
}
```

#### 分析

> **对于长度为$N$的任意数组，自底向上的归并排序需要$\frac{1}{2}NlgN$至$NlgN$次比较，最多访问数组$6NlgN$次**

这种实现方法的一个优势在于其比标准递归方法所需要的代码量要少很多

**当数组长度为2的幂时，自顶向下和自底向上的归并排序所用的比较次数和数组访问次数正好相同，只是顺序不同；**其他时候，两种方法的比较和数组访问的次序会有所不同

自底向上的归并排序比较适合用链表组织的数据，其只需要重新组织链表链接就能将链表原地排序，而不需要创建任何新的链表结点

> **用自顶向下或是自底向上的方式实现任何分治类的算法都很自然**

### 排序算法的复杂度

学习归并排序的一个重要原因是它是证明计算复杂性领域的一个重要结论的基础

对于基于比较的排序算法来说，其具有以下性质（**此处，我们忽略了访问数组的开销**）

> **没有任何基于比较的算法能够保证使用少于$lg(N!)～NlgN$次比较将长度为$N$的数组排序**

*书中对于这一结论通过一个基于二叉树的数学模型给出了精彩的证明，这里不再赘述*

这一性质告诉了我们在设计排序算法时能达到的上限与目标，如果没有这一结论，我们便可能会去尝试设计一个个在最坏情况下比较次数只有归并排序的一半的基于比较的算法；通过这一结论，我们便可以明确知道，这样的算法不存在

在上面对于归并排序的分析中，我们得到了归并排序在最坏情况下的比较次数为$NlgN$这一结论，而在上面我们同样知道了没有任何排序算法能够用少于$lg(N!)～NlgN$次比较将数组排序，这也就意味着：

> **归并排序是一种渐进最优的基于比较排序的算法**

*从严谨的角度来说，我们认为仅仅只需要$lgN!$次比较的算法才是最优的排序算法，但在实际应用中，即使对于很大的$N$，这种算法与归并排序之间的差异也并不明显*

虽说我们已经盖棺定论地说归并排序已经是渐进最优了，但其仍然是有很多局限性的：

- 归并排序的空间复杂度不是最优的
- 在实践中不一定会遇到最坏情况
- 除了比较，算法的其他操作（例如访问数组）也可能很重要
- 不进行比较也能将某些数据排序

---

## 快速排序

终于来到大名鼎鼎的快速排序了，其可能是应用最为广泛的排序算法；快速排序实现简单、对输入的抵赖低同时在一般应用中比其他排序算法都要快得多，其在内存与效率上都非常优秀

- 内存上，快速排序是原地排序，其只需要一个很小的辅助栈
- 效率上，快速排序将长度为$N$的数组排序所需的时间和$NlgN$成正比。

### 基本实现

快速排序同归并排序一样，也是一种基于分治思想的递归排序算法，它们都会将数组进行分割，并分别排序，不同的是它们在实现思路上是相反的，或者说互补的：

- 归并排序会先对数组进行分割，然后将分割完成的数组分别排序，最后将已经有序的子数组进行归并从而实现对整个数组的排序；总的来说，归并排序是**先递归再处理数组**
- 快速排序的思想则是其会依据数组元素的大小对数组进行分割，即“是当两个子数组都有序时整个数组也就自然有序了”；其是**先处理数组再进行递归**的

形象的说，归并是在递归到底层之后向上返回的过程中完成对数组的排序；而快排则是当递归到底层后，排序就已经完成了

相对应的，归并排序中会通过递归调用`“归并（merge）”`来排序数组，而快速排序则是通过`“切分（partition）”`

当我们对一个数组进行切分时，我们会从其中选定一个“切分元素”，之后通过元素交换实现：**切分元素左边的元素都小于它，而其右边的元素都大于它**

通过递归地对数组进行切分，我们便可以完成对数组的排序，这便是快速排序的基本原理，下面便可以开始实现了

![image-20240114232150071](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202401142321251.png)

如上图所示，要实现快速排序的切分，一般的策略是先随意取一个元素作为切分元素，这里先取`a[lo]`，即最左边的元素；然后我们从数组的左端开始使用指针`i`向右扫描直到找到一个大于等于它的元素，再从数组的右端开始使用指针`j`向左扫描直到找到一个小于等于它的元素；这两个元素显然是没有排定的，因此我们交换它们的位置；如此继续，直到`i`与`j`相遇，再将切分元素交换到中间，我们就可以实现切分效果了

以下快速排序的基本实现：

```cpp
int Partition(std::vector<int> &vec, const int left, const int right) {
    const int item = vec[left];
    int i = left, j = right + 1;
    while (true) {
        // stop even vec[i/j] == item, which may cause extra swap, but it can optimize elements' distribution
        while (IsSmaller(vec[++i], item)) if (i == right) break; // prevent out-of-bounds
        while (IsGreater(vec[--j], item)) if (j == left) break;
        if (i >= j) break;
        Swap(vec, i, j);
    }
    Swap(vec, left, j);
    return j;
}

void QuickSort(std::vector<int> &vec, const int left, const int right) {
    if (left >= right) return;
    const int mid = Partition(vec, left, right);
    QuickSort(vec, left, mid - 1);
    QuickSort(vec, mid + 1, right);
}

void QuickSort(std::vector<int> &vec) {
    const int size = static_cast<int>(vec.size());
    QuickSort(vec, 0, size - 1);
}
```

### 避免糟糕的实现

快速排序有着无数优点，但其非常“脆弱”，一些糟糕的实现会很容易导致糟糕的性能，让快速排序变成超慢排序🤣

以下是一些要点：

- 原地切分

我们可以轻易地像实现归并排序那样用一个辅助数组来实现切分，但其中因为开辟数组与数组复制所带来的的内存与效率损失会让我得不偿失

- 数组越界问题

在切分的内循环中，我们会依据切分元素扫描数组，而当切分元素是最小或最大的元素时，数组越界的问题便可能发生，在我们上面的实现中，我们通过`if (i == right) break`与`if (j == left) break`预防了这个问题

但实际上，上面实现中的`if (j == left) break`存在冗余，因为我们选择的切分元素是数组最左边的元素，而实际上`vec[j]`无论如何也不会小于`vec[left]`，所以这条语句实际上是可以删去的，在这一情况下，切分元素本身被作为了“哨兵”，防止了数组越界的产生

而实际上，我们也可以手动在数组最右端制造一个“哨兵”，如此一来`if (i == right) break`便也可以省去了；我们可以在开始排序前，将最大的元素放置在数组最右边，同时在递归左半部分的数组时，将上一轮的切分元素包含，即由`QuickSort(vec, left, mid - 1)`变为`QuickSort(vec, left, mid);`，因为上一轮的切分元素一定大于其左边的所有元素；这样在所有切分中，最右端的元素都是最大的，可以起到“哨兵”的作用了

- 打乱数组，保持随机

在排序开始前，我们可以对数组进行打乱，这一来是对算法效率测试的保证；二来，快速排序在面对一些特殊输入时会有极差的性能，如我们每次选取的切分元素都是最大/最小的元素，效率会来到$N^2$级别，打乱数组可以避免这一点

- 循环终止条件

正确地检测指针是否越界需要一点技巧，并不像看上去那么容易；一个最常见的错误是没有考虑到数组中可能包含和切分元素的值相同的其他元素

- 处理切分元素值有重复的情况

左侧扫描最好是在遇到大于等于切分元素值的元素时停下，右侧扫描则是遇到小于等于切分元素值的元素时停下；尽管这样可能会不必要地将一些等值的元素交换，但在某些典型应用中，它能够避免算法的运行时间变为平方级别；稍后我们会讨论另一种可以更好地处理含有大量重复值的数组的方法

- 递归终止条件

实现快速排序时一个常见的错误就是不能保证将切分元素放入正确的位置，从而导致程序在切分元素正好是子数组的最大或是最小元素时陷入了无限的递归循环之中

### 分析

快速排序的效率如此之高的一个很重要的原因得益于其简洁高效的切分内循环，在快速排序的切分方法中环会用一个递增的索引将数组元素和一个定值比较，而希尔排序与归并排序则还需要在内循环中进行数据的移动

快速排序另一个速度优势在于它的比较次数很少

> **将长度为 N 的无重复数组排序，快速排序平均需要$~2NlnN$次比较（以及$\frac{1}{6}$的交换）**

总的来说，可以肯定的是对于大小为$N$的数组，快速排序的运行时间在$1.39NlgN$的某个常数因子的范围之内；归并排序也能做到这一点，但是快速排序一般会更快（尽管它的比较次数多$39\%$），因为它移动数据的次数更少；这些保证都来自于数学概率

### 改进

快速排序是由 C.A.R Hoare 在 1960 年发明的，几乎从 Hoare 第一次发表这个算法开始，人们就不断地提出各种改进方法；并不是所有的想法都可行，因为快速排序的平衡性已经非常好，改进所带来的提高可能会被意外的副作用所抵消；但其中一些，也是我们现在要介绍的，非常有效

#### 对小规模子数组使用插入排序

同样的方法我们在之前介绍[归并排序的改进方法](#anchor-merge_insertion)时已经用过，此处的思路也差不多

- 对于小数组，快速排序比插入排序慢
- 因为递归，快速排序的`QuickSort()`方法在小数组中也会调用自己

```cpp
void QuickSort(std::vector<int> &vec, const int left, const int right) {
    static int kCUTOFF = 7;
    if (right - left <= kCUTOFF) { // apply insertion sort for small subarrays
        InsertionSort(vec, left, right);
        return;
    }
    const int mid = Partition3Sample(vec, left, right);
    QuickSort(vec, left, mid - 1);
    QuickSort(vec, mid + 1, right);
}
```

切换阈值`kCUTOFF`的最佳值是和系统相关的，但是5～15之间的任意值在大多数情况下都能令人满意

#### 三取样切分

快速排序的效率很大程度上取决于切分元素的选择，其最优情况便是切分元素正好等于数组元素的中位数，但要计算出这一数值便意味着我们需要在每次切分时都进行一次遍历，这是得不偿失的

在我们目前的实现中，我们通过打乱数组完全消除了输入的影响，使得切分元素的选取完全随机，这样可以在完全不计算中位数的情况下达到平均的效率

而取样切分则使用子数组的一小部分元素的中位数来切分数组，这可以让切分更优秀，虽然同样会付出计算中位数的代价，但这明显比遍历好多了，这种代价是可以接受的；人们发现将取样大小设为3并用大小居中的元素切分的效果最好

同时，取样切分可以带来的额外好处是，我们不需要进行特别的处理便可以将取样元素所谓哨兵使用，这样可以去除切分算法中的边界检查

```cpp
int Partition3Sample(std::vector<int> &vec, const int left, const int right) {
    // sample item at left/mid/right
    const int mid = (left + right) / 2;
    if (IsGreater(vec[mid], vec[right])) Swap(vec, right, mid);
    if (IsGreater(vec[mid], vec[left])) Swap(vec, left, mid);
    if (IsGreater(vec[left], vec[right])) Swap(vec, left, right);
    const int item = vec[left];
    int i = left, j = right + 1;
    while (true) {
        while (IsSmaller(vec[++i], item)) {} // prevent out-of-bounds
        while (IsGreater(vec[--j], item)) {}
        if (i >= j) break;
        Swap(vec, i, j);
    }
    Swap(vec, left, j);
    return j;
}
```

#### 熵最优排序 - 三向切分

在排序算法的实际应用中，常常会遇到有着大量相同元素的输入源，如按生日、性别进行排序；在这些情况下，快速排序的效率仍然有着很大的进步空间；如，对于一个完全由相同元素构成的数组，快排仍会对其进行切分。

上述问题的一个解决方案便是三向切分，即将数组分为三部分：大于、等于、小于切分元素，而不是直接二分；当然这肯定会加大算法设计的难度，下面便是由`Dijkstra`提出的简洁实现，其通过引入一个额外指针划分出等于区。

![image-20240901234931167](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202409012349345.png>)

```cpp
void QuickSort3Way(std::vector<int> &vec, const int left, const int right) {
    if (left >= right) return;
    int less_then_i = left, i = left + 1, greater_than_i = right;
    const int item = vec[left];
    while (i <= greater_than_i) {
        if (IsSmaller(vec[i], item)) {
            Swap(vec, less_then_i++, i++);
        } else if (IsGreater(vec[i], item)) {
            Swap(vec, greater_than_i--, i);
        } else {
            i++;
        }
    }
    QuickSort3Way(vec, left, less_then_i - 1);
    QuickSort3Way(vec, greater_than_i + 1 , right);
}
```

---

## 优先队列（堆排序）

在排序算法的一些实际应用中，我们有时不一定要求数据的全局有序，如在安排应用程序处理的优先级时，我们只需要确保总是处理优先级最高的程序即可。而优先队列便是基于这一思想设计的抽象数据类型，一个优先队列往往会包含_删除最大元素_与_插入元素_两种基本操作。

### 优先队列的初级实现

我们可以使用之前的排序算法，如插入排序，快速地实现优先队列，在访问元素或插入元素时自动地对数组调用一次排序算法即可，这样的实现是一种对排序算法的封装，在速度与内存上的提升有限，这里不再赘述。

### 基于二叉堆的优先队列

> **`二叉堆`是一种完全二叉树，其每个节点都大于或等于它的两个子节点**

使用二叉堆可以很好地实现优先队列的基本操作，基于二叉堆的性质，我们可以使用一个数组来实现二叉堆。其中，位置为$k$的父节点的两个子节点位置为$2k$与$2k+1$，同时我们只需通过$k/2$便可以找到节点的父节点。

![image-20240929223824022](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202409292238212.png>)

```cpp
class MaxPriorityQueue {
public:
    MaxPriorityQueue() { pq_.push_back(0); }

    void Insert(int key) {
        pq_.push_back(key);
        Swim(static_cast<int>(pq_.size()) - 1);
    }

    int ExtractMax() {
        if (pq_.size() <= 1) throw std::runtime_error("queue is empty");
        int max = pq_[1];
        pq_[1] = pq_.back();
        pq_.pop_back();
        Sink(1);
        return max;
    }

    [[nodiscard]] int GetMax() const {
        if (pq_.size() <= 1) throw std::runtime_error("queue is empty");
        return pq_[1];
    }
    [[nodiscard]] bool IsEmpty() const { return pq_.size() <= 1; }
    [[nodiscard]] size_t GetSize() const { return pq_.size() - 1; }
private:
    std::vector<int> pq_;

    void Swim(int i) {
        while (i > 1 && pq_[i / 2] < pq_[i]) {
            Swap(pq_, i / 2, i);
            i /= 2;
        }
    }

    void Sink(int i) {
        int child = 2 * i;
        while (child < pq_.size()) {
            if (child < pq_.size() - 1 && pq_[child] < pq_[child + 1]) child++;
            if (pq_[i] >= pq_[child]) break;
            Swap(pq_, i, child);
            i = child;
            child = 2 * i;
        }
    }
};
```

以上便是最大堆在`C++`中的基础实现。使用了`std::vector`作为存储数据的容器，其中我们跳过了数组的第0位，这是为了让父子节点的对应关系更加简洁。

在实现二叉堆时，两个操作至关重要：

1. `Swim`上浮：由下至上的堆有序化

插入元素时，插入的元素可能大于其父节点，我们便需要将其“上浮”——如果元素大于父节点，我们便将其不断地与其父节点进行交换，直到遇到根节点或其小于父节点时。这一操作就像元素不断地向上游（交换）。

2. `Sink`下沉：由上至下的堆有序化

删除最大元素时，我们会从数组中选择一个元素填充到根节点中（在上面的实现中是最后的元素），这会导致父节点小于子节点，我们便需要将其“下沉”——如果元素小于子节点之一，我们便将其不断地与其子节点中较大的一个进行交换。这一操作就像元素不断地下沉。

### 堆排序

我们可以将优先队列转化为一种排序算法——堆排序，其可以被分为两个阶段：

1. 堆的构造——将原始数据重新安排进堆中
2. 下沉排序——从堆中逐个取出所有元素得到最终结果

如下所示，堆排序的最简单实现方法便是直接构造一个新堆，将待排序数组的每个元素都插入中堆中，再一个个取出最大/最小元素即可。

```cpp
void HeapSort(std::vector<int> &vec) {
    MaxPriorityQueue pq;
    for (int i : vec) pq.Insert(i);
    for (int &i : vec) i = pq.ExtractMax();
}
```

如果像上面这样实现堆排序的话，因为我们新建了一个堆空间，这会带来$O(N)$的空间复杂度，而实际上我们可以做到原地堆排序。

同时，如果我们直接使用`Insert`方法对堆进行构造，我们便需要调用$N$次`Swim`函数将元素一个个上浮，而实际上改用`Sink`函数完成堆的构造是更加聪明的做法。我们可以将数组视为一些小堆的集合，进而我们可以每个小堆的根节点调用`Sink`；而如果一个结点的两个子结点都已经是堆了，那么在该结点上调用`Sink`可以将它们变成一个大堆。如此一来便可以递归地构造堆。

这样做的优势是，对于堆底层的元素，因为它们没有子节点，我们便可以直接跳过它们，这可以让我们只调用$N/2$次`Sink`，比原先的方法足足少了一半。

![image-20240930030624815](<https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202409300306001.png>)

```cpp
void SinkFrom0(std::vector<int> &vec, int root, int end) {
    int child = 2 * root + 1;
    while (child <= end) {
        if (child < end && IsSmaller(vec[child], vec[child + 1])) child++;
        if (IsGreater(vec[root], vec[child]) || IsEqual(vec[root], vec[child])) break;
        Swap(vec, root, child);
        root = child;
        child = 2 * root + 1;
    }
}

void HeapSortInPlace(std::vector<int> &vec) {
    const int size = static_cast<int>(vec.size());
    for (int i = size / 2 - 1; i >= 0; i--) SinkFrom0(vec, i, size - 1);
    for (int i = size - 1; i > 0; i--) {
        Swap(vec, 0, i);
        SinkFrom0(vec, 0, i - 1);
    }
}
```

堆排序在排序复杂性的研究中有着重要的地位，其是我们所知的唯一能够同时最优地利用空间和时间的方法——在最坏的情况下它也能保证使用$～2NlgN$次比较和恒定的额外空间。当空间十分紧张的时候（例如在嵌入式系统或低成本的移动设备中）堆排序很流行，其只用几行就能实现（甚至机器码也是）较好的性能。

但现代系统的许多应用很少使用它，因为它无法利用缓存。数组元素很少和相邻的其他元素进行比较，因此缓存未命中的次数要远远高于大多数比较都在相邻元素间进行的算法，如快速排序、归并排序，甚至是希尔排序。

## 总结与拾遗

### 排序算法的稳定性

> **如果一个排序算法能够保留数组中重复元素的相对位置则可以被称为是`稳定的`**

虽然稳定性是个不错的性质，我们也有很多办法能够将任意排序算法变成稳定的，但一般只有在稳定性是必要的情况下稳定的排序算法才有优势，事实上没有任何实际应用中常见的方法不是用了大量额外的时间和空间才做到了这一点。

### 排序算法的横评

![](https://hmxs-1315810738.cos.ap-shanghai.myqcloud.com/img/202409300316418.png)

> **在大多数实际情况中，快速排序是最佳选择，其是最快的通用排序算法**
