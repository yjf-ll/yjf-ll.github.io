---
title: three.js入门
date: 2023-03-12 14:13:13
tags:
- Javascript
- Three.js
---

### 前言

	最近看了一些前端可以深入的领域，有可视化，低代码，跨平台，工程化等等，再结合最近找工作的状况，想着去了解一下可视化这个领域，所以对着three.js官网的demo写写，体验一下...

### Three.js

官网demo地址

> https://threejs.org/docs/#manual/zh/introduction/Creating-a-scene

写了下demo，简单叙述下里面比较重要的概念，首先需要一个场景（存放物品模型），然后需要一个相机（相当于我们的视角），最后需要一个渲染器，把场景和视角给我们展现出来。

- 场景（Scene）
- 相机（Camera）分为透视相机和正交相机
- 渲染器（WebGLRenderer）也有其他的渲染器

```javascript
import * as THREE from 'https://unpkg.com/three/build/three.module.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,1,0.1,1000);
const renderer = new THREE.WebGLRenderer();
//	下面是设置渲染器的大小和添加进页面中,调用渲染方法
renderer.setSize(100,100);
document.body.appendChild(renderer.domElement);
renderer.render(scene,camera)
```

渲染后的场景就是这样的：

![1678604081437.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34d00b8e551a4a1c851c281092ed6d9a~tplv-k3u1fbpfcp-watermark.image?)

我们有了场景后，就可以创建一些模型了，这里简单讲下，模型需要添加材质并且需要放在一个类似于容器的东西中，这样把东西放到场景中，就能看到了

```javascript
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
camera.position.z = 2;
renderer.render(scene,camera)
```


![1678604452763.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/caba4a34ccaa447491031d6cff591e98~tplv-k3u1fbpfcp-watermark.image?)

然后我们让他动起来，这里使用的requestAnimationFrame而不是定时器，这是最重要的一点是因为定时器再离开当前标签页还会运行，而它不会，所以性能没有它好

```javascript
import * as THREE from 'https://unpkg.com/three/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,1,0.1,1000);
const renderer = new THREE.WebGLRenderer();
//	下面是设置渲染器的大小和添加进页面中
renderer.setSize(100,100);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
camera.position.z = 2;
function animate() {
    requestAnimationFrame( animate );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
}
animate();
```


![动画.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d6c38582beb34575a0c56e727f30d60c~tplv-k3u1fbpfcp-watermark.image?)

这样正方体就动起来了~

好了，官网的demo就这些，具体的还需要多了解，记录下让自己的思路更清晰。