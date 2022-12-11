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
   function cloneDeep(source) {
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

2. ### 作用域

   #### 一：全局作用域

   #### 二：块级作用域

   #### 三：函数作用域

   #### 四：作用域链

3. ### 原型链与继承

4. ### 事件循环（EventLoop）

5. ### 异步（Promise/async/await）

6. ### Dom

7. ### Bom

8. ### 垃圾回收

9. ### 常用高阶函数