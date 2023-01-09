---
title: JavaScript-一篇文章体系化总结
date: 2022-12-10 17:00:59
tags:
- JavaScript
---

# JavaScript基础原理解析笔记

> 本文纯属个人学习理解的东西（包含一些相关知识的编程题），如有错误，也请劳烦指出，共同成长，谢谢~

### 数据类型

#### 一：原始类型和引用类型

> 我们目前可以简单认为原始类型的值是存放在栈中，而引用类型是存放在堆中的，这样有助于我们理解下面的知识。关于数据具体是存放在哪里的，想具体了解的详情可以看某乎对于这个问题的回答：JavaScript中变量存储在堆中还是栈中？

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
  //  1.判断对象的原型是否指向类型
  //  2.依次循环判断原型的原型是否指向类型
  function isType(source, type) {
    let proto = source.__proto__
  
    let flag = false
  
    while (proto) {
      flag = proto.constructor === type
      if (flag) break
      proto = proto.__proto__
    }
  
    return flag
  }
  
  function Super() { }
  
  const obj = new Super()
  
  console.log(isType(obj, Super))
  //	true
  console.log(isType(obj, Object))
  //	true
  console.log(isType(obj, null))
  //  false
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

  这是因为js的精度导致的，直接使用相关库去处理是最稳妥的

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

1. ### 作用域

   #### 一：作用域

   - 全局作用域：最外层的执行环境
   - 块级作用域：if语句中的{}里面，for循环
   - 函数作用域：声明的函数{}里面
   - 作用域链：在一个作用域中使用了某个变量，会优先从当前作用域去寻找，如果没有则向上一级的作用域查找变量，于是在查找的过程中形成一层一层的链接就是作用域链

   #### 二：闭包

   - 概念：一般来说，函数执行完后就会被销毁，但闭包就是创建一个不会被销毁的函数作用域，并且能通过某种手段访问到该作用域中的变量。

     ```javascript
     function closure() {
       let count  = 0;
       return () => count++;
     }
     const test = closure()
     console.log(test());
     console.log(test());
     console.log(test());
     //  0
     //  1
     //  2
     ```

   - 防抖：在一定时间段内只会触发一次事件

     ```javascript
     function debounce(callback,delay) {
       let timer = null
       return function () {
         if(timer !== null) {
           clearTimeout(timer)
         }
         timer = setTimeout(() => callback(),delay)
       }
     }
     
     const btn = document.getElementById('btn')
     
     btn.addEventListener('click',debounce(() => {console.log('click')},500))
     ```

   - 节流：每隔一段时间触发一次

     ```javascript
     function throttle(callback,delay) {
       let timer = null
       return function () {
         if(timer !== null) return;
         timer = setTimeout(() => {
           callback()
           timer = null
         },delay)
       }
     }
     
     const btn = document.getElementById('btn')
     
     btn.addEventListener('click',throttle(() => {console.log('click')},500))
     ```

     其实防抖和节流很像，防抖根据是否有定时器就清楚定时器，重新计时，节流呢就是有定时器了就直接不管，等到定时器结束再重新执行一个定时器，理解了这些想要扩展也就轻松了。

   #### 三：变量声明

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

     - 函数作用域：在函数调用结束后，变量就会销毁，

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
     
       或者利用IIFE（立即执行函数），也相当于把参数记录下来传递进打印里

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
     
       并且全局作用域下和块级作用域用var定义的和直接赋值使用的变量会自动挂载到window对象上，看代码：

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

       if语句结束后，a变量就销毁了，所以访问就会出错

       ```javascript
       if (true) {
         let a = 'a'
       }
       console.log(a);
       //  Uncaught ReferenceError: a is not defined
       ```

     - 暂时性死区

       不能在声明前使用该变量
       
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

   #### 三：this

   - this的指向

     - 全局作用域中this指向window

       ```javascript
       console.log(this === window);
       //	true
       ```

     - 函数作用域中（箭头函数除外），谁调用该函数，this就指向谁

       比如说，在全局作用域中调用该函数，this就指向window

       ```javascript
       function test() {
         console.log(this === window);
       }
       test()
       //  true
       ```

       使用对象调用函数，this就指向该对象

       ```javascript
       const obj = {
         test(target) {
           console.log(this === target);
         }
       }
       obj.test(obj)
       //	true
       ```

       我们把test方法取出来，再调用，这是因为取出来的test方法是由window调用的，也可以理解为取出来的方法在全局作用域中执行的，所以this就指向window了

       ```javascript
       const obj = {
         test(target) {
           console.log(this === target);
         }
       }
       obj.test(obj)
       //  true
       const test = obj.test
       test(window)
       //  true
       ```

     - 箭头函数没有this，在箭头函数中使用this，永远指向创建该箭头函数的作用域，看例子

       ```javascript
       const obj = {
         test: (target) => {
           console.log(this === target);
         }
       }
       obj.test(obj)
       //  false
       obj.test(window)
       //  true
       ```

       上面的写法相当于下面的写法，所以该函数中的作用域指向window

       ```javascript
       const test = (target) => {
         console.log(this === target);
       }
       const obj = {
         test
       }
       obj.test(obj)
       //  false
       obj.test(window)
       //  true
       ```

       再来看一个例子，这Test里面定义的test方法是个箭头函数，里面的this指向的就是我们创建的a变量，就算把a变量的test方法取出来，里面的this也没有受到影响还是指向a

       ```javascript
       class Test {
         test = (target) => {
           console.log(this === target);
         }
       }
       
       const a = new Test()
       a.test(a)
       a.test(window)
       //  true
       //  false
       
       const test = a.test
       test(a)
       test(window)
       //  true
       //  false
       ```

   - 修改this的指向

     - bind：返回一个改变this的指向的新函数，至于参数什么的直接看MDN文档吧https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind 

       ```javascript
       var name = 'window'
       const obj = {
         name: 'obj'
       }
       function test () {
         console.log(this.name);
       }
       test()
       //  window
       const changedTest = test.bind(obj)
       changedTest()
       //  obj
       console.log(test === changedTest);
       //  false
       ```

     - call：修改当前调用函数中的this指向并立即执行，执行完后不会对原函数有影响

       ```javascript
       var name = 'window'
       const obj = {
         name: 'obj'
       }
       function test () {
         console.log(this.name);
       }
       test.call(obj)
       //  obj
       ```

     - apply

       ```javascript
       var name = 'window'
       const obj = {
         name: 'obj'
       }
       function test () {
         console.log(this.name);
       }
       test.apply(obj)
       //  obj
       ```

        call和apply只有一个区别，就是 call方法接受的是一个参数列表，而 apply 方法接受的是一个包含多个参数的数组 

     - 实现bind方法

       ```javascript
       function bind(callback,source) {
         const args = [...arguments].splice(2)
         return () => callback.call(source,...args)
       }
       
       const obj = {
         name: 'obj'
       }
       
       function test() {
         console.log(this.name)
       }
       
       const fn = bind(test,obj)
       fn()
       //	obj
       ```

1. ## 原型链与继承

   - #### 原型链是什么

     先说结论（个人理解）：原型链是指实例与构造函数指向的原型对象之间的关系，因为原型对象也是其他构造函数的实例，所以这个关系可能会非常深。

     有三个知识点：

     - 构造函数有prototype属性指向一个对象，这个对象就是原型对象

     - 原型对象有constructor属性，指向构造函数

     - 实例有__ proto __属性指向构造函数的原型对象

       ```javascript
       function Person() {}
       const p1 = new Person()
       console.log(p1.__proto__ === Person.prototype)
       console.log(Person.prototype.constructor === Person)
       //  true
       //	true
       ```

       他们之间的关系就是这样的：

       ![1671168650183](C:\learn\blog\yjf-ll.github.io\source\img\1671168650183.png)

       因为构造函数是Function的实例，所以他们的关系是这样的：

       ![1671169678058](C:\Users\Administrator\AppData\Roaming\Typora\typora-user-images\1671169678058.png)

       我们来验证下这个关系

       ```javascript
       function Person() {}
       const p1 = new Person()
       console.log(Person instanceof Function);
       //  true
       console.log(Person.__proto__ === Function.prototype);
       //  true
       console.log(p1.__proto__.constructor.__proto__.constructor === Function);
       //  true
       ```

       构造函数的原型对象又是Object的实例，然后Object的原型的__ proto __指向的是null，因此，关系变成这样了

       ![1671171880101](C:\learn\blog\yjf-ll.github.io\source\img\1671171880101.png)

       老道理，验证下

       ```javascript
       function Person() {}
       console.log(Person.prototype.__proto__ === Object.prototype);
       //  true
       console.log(Function.prototype.__proto__ === Object.prototype);
       //  true
       console.log(Person.prototype.__proto__.__proto__ === null);
       //  true
       console.log(Function.prototype.__proto__.__proto__ === null);
       //  true
       ```

       好，到这里其实上面的图对那些关系描述的还是挺清晰的，最模糊的来了，先看例子再结合最终图理解下

       ```javascript
       //  Function 构造了它自己！！这就意味着
       console.log(Function instanceof Function);
       //  true
       console.log(Function.__proto__ === Function.prototype);
       //  true
       console.log(Function.__proto__.constructor === Function);
       //  true
       
       //  而Object构造函数也是一个函数实例，这意味着
       console.log(Object instanceof Function);
       //  true
       
       //  我们现在把Object当作一个普通的构造函数来看，这就可以解释下面的语句了
       console.log(Object instanceof Object);
       //  true
       //  这是因为
       console.log(Object.__proto__.__proto__.constructor === Object);
       //  true
       ```

       ![1671176981710](C:\learn\blog\yjf-ll.github.io\source\img\1671176981710.png)

       好，我个人理解的原型链的关系就是这样了。

   - #### 原型链有什么用

     原型链的作用就是，调用实例上的某个方法或属性时，假设该实例没有这些东西，那么就会自动向上查找其原型对象有没有，然后原型对象没有就又会向上去查找，直到找到null为止，这也解释了，为什么我们创建一个对象，明明啥也没添加，为什么还能调用某些方法的原因，这是因为那些方法在相应的原型上

   - #### 原型对象的优缺点

     优点：

     - 实例默认共享原型对象上的属性与方法
     - 实例想要覆盖方法与属性比较简单，直接在实例上面添加同名的方法或属性可以了
     - 因为实例与构造函数共享一个原型对象，可以节省不必要的开销

     缺点：

     - 可以直接修改原型对象上的方法，污染全局，给人造成疑惑

       ```javascript
       Array.prototype.push = () => {
         console.error('浏览器崩溃了~')
       }
       const arr = []
       arr.push(1)
       //  push error
       console.log(arr)
       //  []
       ```

       ![1671161729223](C:\learn\blog\yjf-ll.github.io\source\img\1671161729223.png)

       

   - #### 寄生式组合继承

     这里我也不一个一个去推了，直接来比较完美的方案吧

     ```javascript
     function SuperType(name) { 
      this.name = name; 
      this.colors = ["red", "blue", "green"]; 
     } 
     SuperType.prototype.sayName = function() { 
      console.log(this.name); 
     }; 
     function SubType(name, age){ 
      SuperType.call(this, name); // 第二次调用 SuperType() 
      this.age = age; 
     } 
     SubType.prototype = Object.assign(SuperType.protype,{}); // 第一次调用 SuperType() 
     SubType.prototype.constructor = SubType; 
     SubType.prototype.sayAge = function() { 
      console.log(this.age); 
     }; 
     
     ```

2. ### 事件循环（EventLoop）

   因为js是单线程的，碰到需要不知道多久才能处理完的事件，会先把他挂起，然后去执行完任务栈里面的事件，再去执行挂起的任务栈， js任务分为两种，一种是同步任务，一种是异步任务，异步任务中又分为微任务和宏任务，js的执行栈会先执行同步任务，碰到异步任务会先挂起到另外一个队列中，等执行完同步任务再去执行异步任务队列，执行异步任务队列的时候会先执行微任务，微任务执行完了再执行宏任务，一直循环，这就是事件循环。

   - 微任务：Promise.then/catch/finally
   - 宏任务：setTimeout，setInterval

3. ### 异步（Promise/async/await）

   Promise的作用

   async，await的作用

4. ### Dom

   1. 增删改查

5. ### Bom

   1. window
   2. navigotar
   3. history
   4. LocalStorage
   5. SesstionStorage

6. ### 垃圾回收

   1. v8的

7. ### 常用api

   - Object
     - Object.keys(xxx)	获取对象所有的键名组成的数组
     - Object.values(xxx)	获取对象所有的值组成的数组
     - Object.prototype.toString.call(xxx)    获取对象的类型

   - Array
     - xxx.map(el => el)	对数组做层处理并返回处理后组成的新数组
     - xxx.filter(el => el !== xxx)	对数组做层过滤并返回过滤后组成的新数组
     - xxx.find(el => el)	对数组做层处理并返回处理后的数据组成的新数组
     - xxx.findIndex(el => el)	对数组做层处理并返回处理后的数据组成的新数组
     - xxx.reduce((x,y) => x + y,0 )	对数组做层处理并返回处理后的数据组成的新数组
     - xxx.forEach(el => el)	对数组做层处理并返回处理后的数据组成的新数组

   