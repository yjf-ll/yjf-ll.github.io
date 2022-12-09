---
title: Flutter使用Dio进行网络交互
date: 2022-02-17 12:04:33
tags:
- Flutter
- Dio
categories:
- Flutter
---

# Flutter & Dio 网络交互

##### 前言

> flutter做网络请求目前最火的就是Dio库了，那么如何使用该库呢，怎么进行一个通用的封装呢，封装技巧能复用嘛？请看下文：

##### 一：安装dio库 (dio: ^4.0.4) 官方地址传送门：https://github.com/flutterchina/dio/blob/master/README-ZH.md

> flutter pub add dio

##### 二：dio的基本使用

```dart
import 'package:dio/dio.dart';

//  这里使用的是网易云api，感谢开源感谢分享！官方地址传送门：
// https://binaryify.github.io/NeteaseCloudMusicApi/#/

void send() async {
   final query = {'id': 186016, 'limit': 1};
   try {
        // 实例化Dio，传入参数做一个get请求
      final result = await Dio().get(
          'http://123.207.32.32:9001/comment/music',
          queryParameters: query,
      );
        // 打印结果
      print(result);
   } catch (e) {
        // 打印异常
      print(e);
   }
}
```

> 使用dio的步骤就是，实例化一个Dio，使用该实例做某些请求（也许会传入一些参数），那么问题来了，每个页面都要生成这样的一个实例嘛？或者说有方法可以更好的管理dio，答案是有的，各位看官请继续：

##### 三：dio的基本封装

> 一般来说，主要是对请求的配置信息，和网络拦截器做一个通用的封装，这边采取的思路是使用一个类来保存dio的实例，然后全局都可以使用该实例进行网络请求

- 编写网络配置类

  ```dart
  class NetworkConfig {
    static const String baseUrl = 'http://123.207.32.32:9001/';
  
    static const int sendTimeout = 8000;
  
    static const int connectTimeout = 8000;
  
    static const int receiveTimeout = 8000;
  
  }
  ```

- 编写接口工具类（保存常用的接口，好管理）

  ```
  class EndPoint {
    static const String comment = 'comment/music';
  }
  ```

  

- 编写dio的拦截器

  ```dart
  //   拦截器可以做很多事情，具体可以看一下官方文档
  //  假如我们在请求的时候需要添加token，那么就可以在onRequest里面进行处理
  class NetworkIntercept extends Interceptor {
    @override
    void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
      //  这里的AppCache缓存类在我的上一篇文章里有讲，有需要可以查看
      //   从缓存中添加token，这里只是举一个例子，也有其他方式添加token
      final String? token = AppCache.token;
      if (token != null) {
        options.headers['token'] = token;
      }
      super.onRequest(options, handler);
    }
  
    @override
    void onResponse(Response response, ResponseInterceptorHandler handler) {
        super.onResponse(response, handler);
    }
  
    @override
    void onError(DioError err, ErrorInterceptorHandler handler) {
      super.onError(err, handler);
    }
  }
  ```

  

- 编写保存dio的单例类，

  ```dart
  import 'package:dio/dio.dart';
  import 'package:flutter_network/cache/cache.dart';
  import 'package:flutter_network/network/network_config.dart';
  
  class Network {
    final Dio dio;
  
    Network._({required this.dio});
  
    factory Network._create(Dio dio) => Network._(dio: dio);
  
    static Network? _client;
  
    static void init() {
      if (_client == null) {
        //  创建配置信息
        final BaseOptions options = BaseOptions(
          baseUrl: NetworkConfig.baseUrl,
          sendTimeout: NetworkConfig.sendTimeout,
          connectTimeout: NetworkConfig.connectTimeout,
          receiveTimeout: NetworkConfig.receiveTimeout,
        );
  
        //  创建dio实例，并且添加配置信息
        final Dio dio = Dio(options);
  
        //  对dio添加上面的拦截器
        dio.interceptors.add(NetworkIntercept());
  
        //  创建network实例并保存
        _client = Network._create(dio);
      }
    }
  
    //  对外返回处理过的dio实例
    static Dio get instance => _client!.dio;
  }
  ```

- 封装后需要在main函数里面进行一次初始化，代码如下：

  ```dart
  import 'package:flutter/material.dart';
  import 'package:flutter_network/cache/cache.dart';
  import 'package:flutter_network/network/network.dart';
  import 'package:flutter_network/view/home_page.dart';
  
  Future<void> main() async {
    WidgetsFlutterBinding.ensureInitialized();
    //  初始化缓存单例类
    //  这里的AppCache缓存类在我的上一篇文章里有讲，有需要可以查看
    await AppCache.init();
    //  初始化网络单例类
    Network.init();
    runApp(MyApp());
  }
  
  class MyApp extends StatelessWidget {
    @override
    Widget build(BuildContext context) {
      return MaterialApp(
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        home: HomePage(),
      );
    }
  }
  ```

- 那么封装好后，我们应该如何使用呢？简单，上代码：

  ```dart
  import 'package:dio/dio.dart';
  import 'package:flutter/material.dart';
  import 'package:flutter_network/network/end_point.dart';
  import 'package:flutter_network/network/network.dart';
  
  class HomePage extends StatefulWidget {
    const HomePage({Key? key}) : super(key: key);
  
    @override
    _HomePageState createState() => _HomePageState();
  }
  
  class _HomePageState extends State<HomePage> {
    //  引用网络单例类里面封装好的dio
    final Dio dio = Network.instance;
  
    Future<void> send() async {
      final query = {
        'id': 186016,
        'limit': 1,
      };
      try {
        final result = await dio.get(
          EndPoint.comment,
          queryParameters: query,
        );
        print(result);
      } catch (e) {
        print(e);
      }
    }
  
    @override
    Widget build(BuildContext context) {
      return Scaffold(
        appBar: AppBar(
          title: Text('Network'),
          centerTitle: true,
        ),
        body: Center(
          child: FloatingActionButton(
            onPressed: send,
            child: Text('点击'),
          ),
        ),
      );
    }
  }
  ```

- 至此，dio的简单封装教程就结束了，有啥不懂得可以在评论区留言，或者有更好的方法也可以一起分享，感谢看完的铁铁们！：） 封装的技巧都是通用的，活学活用才是王道！
- 完整demo地址：https://github.com/yjf-ll/flutter_dio_network