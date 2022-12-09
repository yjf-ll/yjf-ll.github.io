---
title: JavaScript-一篇文章体系化总结
date: 2022-12-09 17:00:59
tags:
- JavaScript
---

### JavaScript总结

> 本文纯属笔记，如有错误，也请劳烦指出，谢谢~

1. ##### 数据类型

   ###### 一：js的数据类型分为原始类型和引用数据类型

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
   - ...

   ###### 二：判断数据类型的方法

   - typeof

     ```javascript
     const str = ''
     console.log(typeof str)
     //	'string'
     const num = 0
     console.log(typeof num)
     //	'number'
     const bool = true
     console.log(typeof bool)
     //	'boolean'
     const str = ''
     console.log(typeof str)
     //	'string'
     const str = ''
     console.log(typeof str)
     //	'string'
     const str = ''
     console.log(typeof str)
     //	'string'
     const str = ''
     console.log(typeof str)
     //	'string'
     const str = ''
     console.log(typeof str)
     //	'string'
     ```

     

   - instanceof

   - Object.prototype.toString.call(variable)

2. ##### 作用域

3. ##### 原型链与继承

4. ##### 异步（Promise/async/await）

5. ##### 事件循环（EventLoop）

6. ##### 代理（Proxy）

7. ##### Dom

8. ##### Bom

9. ##### 垃圾回收

10. ##### 常用高阶函数