---
title: JavaScript-一篇文章体系化总结
date: 2022-12-10 17:00:59
tags:
- JavaScript
---

# JavaScript体系总结

> 本文纯属个人学习笔记，如有错误，也请劳烦指出，谢谢~

1. ### 数据类型

   #### 一：js的数据类型分为原始类型和引用数据类型，我们目前可以简单认为原始类型的值是存放在栈中，而引用类型是存放在堆中的，这样有助于我们理解下面的知识。关于数据具体是存放在哪里的，想了解的详情可以看 [(10 封私信 / 28 条消息) JavaScript中变量存储在堆中还是栈中？ - 知乎 (zhihu.com)](https://www.zhihu.com/question/482433315) 

   原始类型：

   - String
   - Number
   - Boolean
   - Undefined
   - Symbol
   - BigInt
   - Null

   引用类型：

   - Object
   - Array
   - Function
   - Date
   - Set
   - Map
   - ...

   #### 二：判断数据类型的方法

   - typeof

     先说结论，typeof操作符可以较为精准的判断原始类型，为什么说较为精准，是因为Null是原始类型，但是typeof null却是返回object， 这是因为特殊值 null 被认为是一个对空对象的引用。 

     对于引用类型，除了Function，其他都是直接返回object，

     ```javascript
     console.log(typeof '')
     //	'string'
     console.log(typeof 0)
     //	'number'
     console.log(typeof true)
     //	'boolean'
     console.log(typeof undefined)
     //	'undefined'
     console.log(typeof null)
     //	'object'
     console.log(typeof BigInt(1))
     //	'bigint'
     console.log(typeof Symbol(''))
     //	'symbol'
     console.log(typeof {})
     //	'object'
     console.log(typeof (() => {}))
     //  'function
     console.log(typeof [])
     //	'object'
     ```

     

   - instanceof

     instanceof用来判断变量是属于哪种引用类型，虽然typeof null 是object类型，但是null其实是个原始类型，因此null instanceof Object是false

     ```javascript
     console.log(null instanceof Object) //  false
     console.log({} instanceof Object)   //  true
     console.log([] instanceof Array)    //  true
     console.log([] instanceof Object)   //  true
     console.log((() => {}) instanceof Function) //  true
     console.log((() => {}) instanceof Object)   //  true
     ```

     该操作符判断的原理是去寻找类型是否存在于变量所属的原型链中，所以[] 既是Array类型也是Object类型（这里需要了解原型链相关的知识才能理解，但又因为是数据类型相关，所以放在这里）。因此我们也可以写一个方法来模拟instanceof功能

     ```javascript
     
     ```

     

   - Object.prototype.toString.call(variable)

     通过该方法就可以简单的获取变量的类型

     ```javascript
     console.log(Object.prototype.toString.call(''))
     //  [object String]
     console.log(Object.prototype.toString.call(0))
     //  [object Number]
     console.log(Object.prototype.toString.call(true))
     //  [object Boolean]
     console.log(Object.prototype.toString.call(undefined))
     //  [object Undefined]
     console.log(Object.prototype.toString.call(null))
     //  [object Null]
     console.log(Object.prototype.toString.call(1n))
     //  [object BigInt]
     console.log(Object.prototype.toString.call(Symbol('')))
     //  [object Symbol]
     console.log(Object.prototype.toString.call({}))
     //  [object Object]
     console.log(Object.prototype.toString.call([]))
     //  [object Array]
     console.log(Object.prototype.toString.call((() => {})))
     //  [object Function]
     ```

     因此，也可以简单的把获取变量的逻辑抽离成一个工具函数，思路如下：

     ```javascript
     const typeUtils = {
         getType(value) {
             const typeStr = Object.prototype.toString.call(value)
             return typeStr.slice(8,typeStr.length - 1)
         },
         isString(value) {
             return typeUtils.getType(value) === 'String'
         },
         isNumber(value) {
             return typeUtils.getType(value) === 'Number'
         },
         isFunction(value) {
             return typeUtils.getType(value) === 'Function'
         }
     }
     console.log(typeUtils.getType(null))    //  Null
     console.log(typeUtils.isString(''))     //  true
     console.log(typeUtils.isNumber(0))      //  true
     console.log(typeUtils.isFunction(() => {})) //  true
     ```

   #### 三：关于数据类型个人觉得有些要注意的点

   - NaN !== NaN	//	true

   - typeof NaN    //    number

     也就是说NaN是number类型的，所以在对数据做一些判断的时候一定要注意NaN

   - 0.1 + 0.2 !== 0.3    //    true

     这是因为js的精度导致的，解决办法简单的可以都乘100再进行计算，最后除100就可以了，或者直接使用相关库去处理是最稳妥的

   #### 四：深浅拷贝

   这里先解释下为什么需要深浅拷贝

   > 我们声明引用变量的时候，真正的值是存放在堆中的，而我们变量保存的是指向该值的一个指针（指针是存放在栈中的），所以我们直接复制一个引用类型的变量，其实是复制一个指向真正的值的一个指针，因此原来的变量和复制后的变量指向的都是相同的值。下面的图源自红宝书：

   ![1670684300908](D:\project\yjf-ll.github.io\source\img\1670684300908.png)

   因此会出现下面的情况

   ```javascript
   const obj1 = {}
   const obj2 = obj1
   obj2.name = 'soul'
   console.log(obj1.name)
   //	soul
   ```

   浅拷贝就是创建一个新的对象，再把原对象的值的第一层都复制一遍，因此深层次的属性改变，原对象还是会被影响

   ```javascript
   function clone(source) {
       const target = {}
       for(let key in source) {
           target[key] = source[key]
       }
       return target
   }
   
   const obj1 = {ext: {name: 'soul'}}
   const obj2 = clone(obj1)
   obj2.name = 'soul'
   console.log(obj1.name)
   //	undefined
   obj2.ext.name = 'none'
   console.log(obj1.ext.name)
   //	none
   ```

   深拷贝就是通过递归不断的创建新对象再复制原对象相应的值，简单实现如下：

   ```javascript
   function deepClone(source) {
       if(typeof source !== 'object' && source === null) return source;
       const type = Object.prototype.toString.call(source)
       if(type === '[object Array]') {
           return source.map(deepClone)
       }
       if(type === '[object Object]') {
           const target = {}
           for(let key in source) {
               target[key] = deepClone(source[key])
           }
           return target
       }
       return source;
   }
   
   const obj1 = {ext: {name: 'soul'}}
   const obj2 = deepClone(obj1)
   obj2.name = 'soul'
   console.log(obj1.name)
   //	undefined
   obj2.ext.name = 'none'
   console.log(obj1.ext.name)
   //	soul
   
   const arr1 = []
   const arr2 = deepClone(arr1)
   arr2.push('test')
   console.log(arr1)
   //  []
   ```

   因为有可能克隆的对象会存在互相引用的情况，所以也需要做下处理

   ```javascript
   function deepClone(source) {
     const target = {}
     const loopList = [
       {
         parent: target,
         key: undefined,
         data: source
       }
     ]
     while (loopList.length) {
       const node = loopList.pop()
       const parent = node.parent
       const key = node.key
       const data = node.data
       let res = parent
       if (typeof key !== 'undefined') {
         res = parent[key] = {}
       }
       for (const key in data) {
         if (Object.hasOwnProperty.call(data, key)) {
           if (typeof data[key] === 'object' && data[key] !== null) {
             loopList.push({
               parent: res,
               key,
               data: data[key]
             })
           } else {
             res[key] = data[key]
           }
         }
       }
     }
     return target
   }
   ```
   
2. ### 作用域，变量，this

   #### 一：作用域

   - 全局作用域：最外层的执行环境
   - 块级作用域：if语句中的{}里面，for循环
   - 函数作用域：声明的函数{}里面
   - 作用域链：在一个作用域中使用了某个变量，会优先从当前作用域去寻找，如果没有则向上一级的作用域查找变量，于是在查找的过程中形成一层一层的链接就是作用域链

   #### 二：变量声明

   ​	先说结论，创建后不会改变的推荐直接使用const，其次使用let，var不推荐使用

   - var，

     - 变量提升：可以在var声明变量语句前直接使用，但是值是undefined，这是因为js 使用这个关键字声明的变量会自动提升到函数作用域 顶部 ，再进行其他操作

       ```javascript
       console.log(a)
       //	undefined
       var a = 'a'
       ```

       上面的代码相当于：

       ```javascript
       var a
       console.log(a)
       //	undefined
       a = 'a'
       ```

     - 声明作用域：声明的是函数作用域，在函数调用结束后，变量就会销毁，

       ```javascript
       function test() {
         var a = 'a'
       }
       test()
       console.log(a)
       //	Uncaught ReferenceError: a is not defined
       ```

       假设是在块级作用域下声明的变量，在外层依然可以访问到

       ```javascript
       if(true) {
         var a = 'a'
       }
       console.log(a);
       //	a
       ```
     
       因为块级作用域，所以使用var声明的变量会出现下面这种情况，这是因为setTimeout是个宏任务，js会先执行其他同步代码，也就是先循环了5次，最后再执行5次setTimeout，这个时候因为块级作用域，i的值就是5，所以会打印5次5

       ```javascript
     for(var i = 0; i < 5; i++) {
         setTimeout(() => {
           console.log(i);
         })
       }
       console.log(i);
       //	5
       //	5次5
       ```
     
       所以上面的解决办法可以是这样：通过setTimeout的第三个参数，传递进方法

       ```javascript
     for(var i = 0; i< 5; i++) {
         setTimeout((i) => {
           console.log(i);
         },0,i)
       }
       console.log(i);
       //	5
       //	0
       //	1
       //	2
       //	3
       //	4
       ```
     
       或者利用IIFE，立即执行函数，也相当于把参数记录下来传递进打印里

       ```javascript
     for(var i = 0; i< 5; i++) {
         (function (i) {
           setTimeout(() => {
             console.log(i);
           })
         })(i)
       }
       console.log(i);
       //	5
       //	0
       //	1
       //	2
       //	3
       //	4
       ```
     
       全局作用域下和块级作用域用var定义的和直接赋值使用的变量会自动挂载到window对象上，看代码：

       ```javascript
     var a = 'a'
       console.log(a)
     //	a
       console.log(window.a)
       //	a
       if (true) {
         var b = 'b'
       }
       console.log(b);
       //	b
       console.log(window.b)
       //  b
       ```
     
       这就是为什么不推荐使用var来声明变量的原因，规则复杂还有坑，所以能用const和let就不要用var。

   - let

     - 声明一个变量后，依然可以为该变量赋不同的值

     - 块级作用域

       ```javascript
       if (true) {
         let a = 'a'
       }
       console.log(a);
       //  Uncaught ReferenceError: a is not defined
       ```

     - 暂时性死区

       ```javascript
       console.log(a);
       let a = 'a'
       //  Uncaught ReferenceError: Cannot access 'a' before initialization
       ```

       

     - 不能重复声明

   - const

     - 用const声明变量，必须要给到一个初始值

     - 声明以后不能被赋值

     - 块级作用域

       ```javascript
       if (true) {
         const a = 'a'
       }
       console.log(a);
       //  Uncaught ReferenceError: a is not defined
       ```

       

     - 暂时性死区

       ```javascript
       console.log(a);
       const a = 'a'
       //  Uncaught ReferenceError: Cannot access 'a' before initialization
       ```

     - 不能重重复声明

   - 因为作用域链以及let和const的暂时性死区，打印a变量会优先在fn函数里面寻找a变量，所以下面的代码会报错

     ```javascript
     var a = 'a'
     function fn() {
       console.log(a);
       // let a = 'b'
       const a = 'b'
     }
     fn()
     //	Uncaught ReferenceError: Cannot access 'a' before initialization
     ```

   

3. ### 原型链与继承

4. ### 事件循环（EventLoop）

5. ### 异步（Promise/async/await）

6. ### Dom

7. ### Bom

8. ### 垃圾回收

9. ### 常用高阶函数