---
title: Flutter-Bloc-状态管理
date: 2022-03-01 22:18:56
tags:
- Flutter
- Bloc
categories:
- Flutter
---

##### 前言：

> 之前分享过怎么封装dio，今天就分享下使用bloc如何做网络请求吧，下面放一些你可能需要的资料，^_^

- dio封装：https://juejin.cn/post/7065524382562533412
- bloc官网：https://bloclibrary.dev/#/zh-cn/gettingstarted
- 小呆呆分享的bloc入门教程，写的很好：https://juejin.cn/post/6856268776510504968#heading-1

##### 一：Bloc简介

![bloc.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0292fd3b68c14d02aa6376710798059c~tplv-k3u1fbpfcp-watermark.image?)

> bloc是个状态管理框架，可以做到UI和逻辑分离，并且数据也能复用，举个例子，你用bloc写了一个获取用户信息的模板，然后你在首页或者在其他地方都能使用该bloc直接获取用户信息，直接看代码吧

##### 二：Bloc使用

- 先添加这个库

  > // 这里安装的是7.0.1版本的，高版本的bloc写法会有些区别
  >
  > dependencies:
  > flutter_bloc:  7.0.1

- 创建一个网络请求的类

  ```dart
  import 'dart:async';
  import 'package:dio/dio.dart';
  import 'package:flutter_network/network/network.dart';
  
  class HomeRepository {
    final Dio dio = Network.instance;
  
    Future<String> getData() async {
      //  在这里网络请求，然后返回出去，我这里是返回模拟的数据
      final result = await Future.delayed(Duration(seconds: 2), () {
        return 'hello world';
      });
      return result;
    }
  }
  ```

  

- 通过插件创建bloc的模板

  
![bloc_temp.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ded11cd0f49a4db8b7abb81b9e747d5b~tplv-k3u1fbpfcp-watermark.image?)

- 创建一个状态枚举，作用是描述当前网络请求的状态

  ```dart
  enum Status {
    //  初始化
    pure,
    //  加载中
    progress,
    //  请求成功
    success,
    //  请求失败
    failure,
  }
  
  extension Function on Status {
    //  扩展枚举的一些方法
    bool get isPure => this == Status.pure;
  
    bool get isProgress => this == Status.progress;
  
    bool get isSuccess => this == Status.success;
  
    bool get isFailure => this == Status.failure;
  }
  ```

  

- 修改state文件为：

  ```dart
  part of 'home_bloc.dart';
  
  @immutable
  class HomeState {
    //  请求的状态
    final Status status;
  
    //  请求成功后的数据
    final String data;
  
    //  请求失败的错误
    final Exception? exception;
  
    //  私有命名构造函数
    HomeState._({
      required this.status,
      required this.data,
      this.exception,
    });
  
    //  工厂构造函数，bloc通过该构造函数来初始化真正的state
    factory HomeState.init() => HomeState._(
          status: Status.pure,
          data: '',
        );
  
    //  生成的实例通过该方法来生成新的state返回出去
    HomeState copyWith({
      Status? status,
      String? data,
      Exception? exception,
    }) =>
        HomeState._(
          status: status ?? this.status,
          data: data ?? this.data,
          exception: exception,
        );
  }
  
  
  ```

- 添加网络请求的事件

  ```dart
  part of 'home_bloc.dart';
  
  @immutable
  abstract class HomeEvent {}
  //  网络请求的事件
  class HomeDataLoaded extends HomeEvent {}
  ```

- 在bloc中对上面的事件添加逻辑处理

  ```dart
  import 'dart:async';
  
  import 'package:bloc/bloc.dart';
  import 'package:flutter_network/view/model/status.dart';
  import 'package:flutter_network/view/repository/home_repository.dart';
  import 'package:meta/meta.dart';
  
  part 'home_event.dart';
  part 'home_state.dart';
  
  class HomeBloc extends Bloc<HomeEvent, HomeState> {
    //  存储库的实例，用于网络请求
    final HomeRepository repository = HomeRepository();
  
    HomeBloc() : super(HomeState.init());
  
    @override
    Stream<HomeState> mapEventToState(
      HomeEvent event,
    ) async* {
      //  如果是这个事件那就进行里面的处理
      if(event is HomeDataLoaded) {
        yield* _mapHomeDataLoadedToState();
      }
    }
  
    Stream<HomeState> _mapHomeDataLoadedToState() async* {
      //  先把状态改成加载中
      yield state.copyWith(status: Status.progress);
  
      yield await repository.getData().then((value) {
        //  成功了就把状态改成成功，并且保存下数据
        return state.copyWith(status: Status.success, data: value);
      }).onError((Exception? error, stackTrace) {
        //  失败了就把状态改成失败，并且保存下错误消息
        return state.copyWith(status: Status.failure, exception: error);
      });
    }
  }
  
  ```

- 具体怎么使用呢，请看代码

  ```dart
  import 'package:flutter/material.dart';
  import 'package:flutter_bloc/flutter_bloc.dart';
  import 'package:flutter_network/view/bloc/home_bloc.dart';
  import 'package:flutter_network/view/model/status.dart';
  
  class HomePage extends StatelessWidget {
    const HomePage({Key? key}) : super(key: key);
  
    @override
    Widget build(BuildContext context) {
  
      //  这里使用BlocBuilder包裹我们想要使用bloc数据的widget
      final content = BlocBuilder<HomeBloc, HomeState>(builder: (context, state) {
        return Column(
          children: [
            state.status.isProgress
                ? CircularProgressIndicator(
              color: Colors.blue,
            )
                : Text(
                state.data.toString()
            ),
            IconButton(
              icon: Icon(Icons.add),
              onPressed: () {
                context.read<HomeBloc>().add(HomeDataLoaded());
              },
            )
          ],
        );
      });
  
      return Scaffold(
        appBar: AppBar(title: Text('Bloc & Dio'),centerTitle: true),
        body: Center(
          //  这里创建我们的bloc
          child: BlocProvider(
            create: (context) => HomeBloc(),
            child: content,
          ),
        ),
      );
    }
  }
  
  ```


![QQ图片20220302135124.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3417f8c1d3f44c1db8f1d2a8174a82c6~tplv-k3u1fbpfcp-watermark.image?)
  

- 如果想要在页面一进去就自动加载请求的话，在创建该bloc的时候通过级联操作符，直接添加事件就可以了

  ```
  BlocProvider(
    create: (context) => HomeBloc()..add(HomeDataLoaded()),
    child: content,
  )
  ```

##### OK，感谢看完的小伙伴。：）