---
title: React-Axios网络请求封装
date: 2022-02-27 16:02:26
tags:
- JavaScript
- React
- Axios
categories:
- JavaScript
- React
---
##### 前言：

> 在接触dio库和axios库后，感觉网络请求的操作基本都差不多，主要思路都是对库的网络请求实例进行通用的配置以及添加一些拦截器，然后对配置后的实例再封装一层通用的请求函数，这样做的好处在于随时可以更换底层网络请求库，再也不怕网络请求库不维护或者有重大bug啦！！！虽然这种概率极小，，，

##### 一：封装思路如下

- 生成一个axios实例，传入通用的配置
- 添加请求拦截器
- 封装请求函数
- 基本使用

##### 二：代码演示

> 生成axios实例并添加通用的配置

```react
const instance = axios.create({
  baseURL: 'https://www.xxx.api',
  timeout: 8000,
  headers: {
    'xxx-ffff': 'fa',
  }
});
```

> 添加拦截器，请求的时候判断是否需要添加token，得到结果后，假如code不是200或者0或2000，就判断该结果不是成功的，就使用throw把结果当成错误抛出

```react
instance.interceptors.request.use((config) => {
  const token = getToken();
  if(token !== null && token !== undefined) {
    config.headers['boarding-pass'] = token;
  }
  return config;
}, error => {
  return error;
})

instance.interceptors.response.use(res => {
  const {code} = res.data;
  if(code !== 200 && code !== 0 && code !== 2000) {
    console.log('请求成功，但被拦截的数据',res)
    throw res.data;
  }
  return res.data;
}, error => {
  return error;
})
```

>  对该实例封装一层通用的请求方法，我练习的接口比较简单，所以只添加三个参数，也可以添加其他的参数，具体看你！

```react
function request(method, url, params) {
  return instance.request({
    method: method,
    url: url,
    params: params
  });
}

export {
  request
}
```

> 好，封装该请求函数后，怎么使用就比较简单了

```react
// 我自己会把具体请求再封装一层，就不会在UI组件里面搞得乱乱的了，也能在其他组件里复用该请求方法，
function apiSignIn(params) {
  return request(
    'post',
    '/user/login',
    params,
  );
}

export {apiSignIn}
```

```react
// 真正使用的地方如下：
function signIn() {
  const query = {
   userName: 'xxxxxxx',
   password: 'xxxxxxx'
  }
  apiSignIn(
   query
  ).then(res => {
    console.log(res)
  }).catch(err => {
    console.log(err)
  });
}
<Button
  type="primary"
  size={"large"}
  onClick={() => signIn()}
>
    SignIn
</Button>
```

###### ok，到这里就over了，感谢看完的小伙伴，有更好的方式也可以交流哈，：)