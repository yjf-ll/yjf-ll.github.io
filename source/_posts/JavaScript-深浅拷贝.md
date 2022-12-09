---
title: JavaScript-深浅拷贝
date: 2022-03-03 17:55:22
tags:
- JavaScript
- 深浅拷贝
categories:
- JavaScript
---
##### 一：前言

> js的数据分为基本类型和引用类型，基本类型的值是保存在栈内存中，引用类型的值是保存在堆内存中，并且用变量保存一个引用类型值，其实是保存指向该值的一个指针，因此对复制后的对象进行一些操作，也会影响被复制的对象，可以看一个简单的例子

```
let a = {}
let b = a
b.name = 'soul'
console.log(a.name)
//  soul
```

> 解析：因为a保存的是{}在内存中的地址指针，所以b=a，也就相当于b保存的也是{}在内存中的地址指针，所以我们对b进行一些操作，也会影响a

-   基本类型

    -   string
    -   number
    -   boolean
    -   undefined
    -   null
    -   symbol

-   引用类型

    -   function
    -   array
    -   object

##### 二：浅拷贝

简单的说，浅拷贝就是新建一个对象（在内存中开辟了新的地盘），来保存我们目标对象的值，这样，我们操作拷贝后的值，就不会影响最开始的对象了

```
let a = {}
let b = clone(a)
b.name = 'soul'
console.log(a.name)
//  undefined
```

可以看到，我们修改拷贝后的对象b，并不会影响原对象a的值，实现方法如下，然后该方法主要的思路是，假设obj是数组，那就新建一个数组通过遍历把所有的数据复制一边，假设是对象，也把对象的值复制一边返回出去，如果是其他类型的值，就直接返回

```
  function clone(obj) {
    if(obj == null || obj instanceof Function) return obj;
    if(obj instanceof Array) {
      let newObj = []
      obj.forEach(item => newObj.push(item))
      return newObj
    }
    if(obj instanceof Object) {
      let newObj = {}
      for(let item in obj) {
        newObj[item] = obj[item]
      }
      return newObj
    }
    return obj
  }
```

仔细看过上面的方法就会发现，浅拷贝其实就是遍历了一层然后直接复制而已，那假如该对象有引用类型的值呢，那浅拷贝也只是把指向引用类型的指针拷贝过来，因此浅拷贝不适合复制有引用类型属性的对象，看以下demo

```
let a = {
  name: 'soul',
  job: {
    name: '前端'
  }
}
​
let b = clone(a)
b.name = 'zs'
b.job.name = '后端'
​
console.log(a.name)
console.log(a.job.name)
//  soul
//  后端
```

> 这里a的name没受影响，a的job的name却收到影响，因为a的job是引用类型的值，保存的是指向该值在内存中的指针，我们进行浅拷贝，也就相当于复制了这个指针，因此a和b的job指向的是同一个值，所以修改b的job的name，a的job的name也变化了

##### 三：深拷贝

分析浅拷贝后的弊端，我们发现，想要真正复制某个对象，遍历一层是不够的，因此，我们遍历的同时也要判断该属性的值是否为引用类型，如果是的话，应该再复制一层，使用递归可以很好的实现我们想要的，

```
  function deepClone(obj) {
    if(obj == null || obj instanceof Function) return obj;
    if(obj instanceof Array) {
      let newObj = []
      //  把数组中的项通过deepClone进行递归调用
      obj.forEach(item => newObj.push(deepClone(item)))
      return newObj
    }
    if(obj instanceof Object) {
      let newObj = {}
      for(let item in obj) {
        //  把对象中的值通过deepClone进行递归调用
        newObj[item] = deepClone(obj[item])
      }
      return newObj
    }
    return obj
  }
```

```
  let b = deepClone(a)
  b.name = 'zs';
  b.job.name = 'ctrl c'
  b.job.time.start = 12
  b.job.time.end = 12
​
  //  使用深拷贝后，修改b的引用类型的值也不会影响a
  console.log(a)
  console.log(b)
```


![deepclone.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0f181316c7654cff8643c7ff7ae52338~tplv-k3u1fbpfcp-watermark.image?)

##### 完结，js的深浅拷贝就谈到这里了，希望对你有所帮助，有更好的实现方法也可以分享出来一起交流哦，：）