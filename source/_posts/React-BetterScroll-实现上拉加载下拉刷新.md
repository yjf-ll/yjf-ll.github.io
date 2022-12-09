---
title: React-BetterScroll-实现上拉加载下拉刷新
date: 2022-04-12 00:18:30
tags:
- JavaScript
- React
- BetterScroll
categories:
- JavaScript
- React
- 前端插件
---
##### 一：前言

最近使用react在做一个仿bilibili的demo，需要一个滚动容器并且应该有上拉加载和下拉刷新的功能，想到之前用vue做项目的时候用过better-scroll，所以这次也用它了。先放个最终效果图吧，，，


![scroll复杂使用.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cfc1231ed99e4a1cbf641a133e7c9812~tplv-k3u1fbpfcp-watermark.image?)



##### 二：better-scroll中无法滚动与解决思路

- content容器中放了一些元素却无法滚动

  > 请确认content容器的高度是否超过wrapper

- content容器中有图片的情况下，经常滚不到底部

  > 因为图片可能会在生成bs（better-scroll）实例后才加载完成，导致bs计算高度出错，解决办法是img标签有个回调函数（onLoad），在回调函数里面调用bs实例的refresh方法就好了，假如有很多图片的情况下，最好加上一层防抖，优化性能

##### 三：踩坑经验分享

既然选择了better-scroll做滚动容器，那么我们肯定会对其进行一层封装，以方便我们使用，但是这里把scroll抽出来封装成组件后，会出现这样一个问题，包裹在scroll组件的children中假设有图片的话，就无法在其加载完成后调用scroll的刷新方法，所以这里我使用了eventBus来处理图片加载完要刷新scroll的操作

##### 三：封装与使用

- 首先在项目中安装better-scroll（官网（ [核心滚动 | BetterScroll 2.0 (better-scroll.github.io)](https://better-scroll.github.io/docs/zh-CN/guide/base-scroll.html) ））

  > yarn add better-scroll

- 在项目的index.js中安装上拉和下拉的组件，这里贴出核心代码

  ```react
  import Pulldown from '@better-scroll/pull-down';
  import Pullup from '@better-scroll/pull-up';
  import BScroll from "@better-scroll/core";
  
  BScroll.use(Pulldown)
  BScroll.use(Pullup)
  ```

- 再安装eventBus

  > yarn add events

  对eventBus做一层封装，这样也方便我们使用和维护

  ```react
  import {EventEmitter} from "events";
  
  const event = new EventEmitter();
  
  class EventUtils {
    static _instance = event;
  
    static emit(key, value = []) {
      this._instance.emit(key, ...value);
    }
  
    static addListener(key, callback) {
      this._instance.addListener(key, callback);
    }
  
    static removeListener(key, callback) {
      this._instance.removeListener(key, callback);
    }
  
  }
  
  class EventKey {
    static scrollRefresh(event = 'default') {
      return `${event}betterScrollRefresh`;
    }
  
    static scrollToTop(event = 'default') {
      return `${event}betterScrollToTop`;
    }
  }
  
  export {
    EventUtils,
    EventKey,
  }
  ```

- 然后是scroll组件

  ```react
  import {debounceUtils} from "../../../utils/function_utils";
  import BScroll from "@better-scroll/core";
  import {useEffect, useRef, useState} from "react";
  import {EventUtils} from "../../../utils/event_utils";
  import {PullDownProgress} from "./pull_down_progress";
  import {BackTopButton} from "./back_top_button";
  
  const pullUpDebounce = debounceUtils()
  const pullDownDebounce = debounceUtils()
  const scrollDebounce = debounceUtils()
  
  class ScrollDirection {
    static vertical = 'vertical';
    static horizontal = 'horizontal';
  }
  
  export function AppScroll(props) {
    //  保存better-scroll实例，在副作用中初始化
    const [controller, setController] = useState(null);
    const wrapperRef = useRef();
    const {
      refreshKey = 'default',
      toKey = 'default',
      children = (<div>scroll默认的内容</div>),
      scrollWidth = '100%',
      scrollHeight = '100px',
      scrollBackground = 'rgba(229, 229, 229, 0.29)',
      direction = ScrollDirection.vertical,
      debounceDelay = 200,
      prototype = 1,
      click = true,
      showBackTop = false,
      showRefreshProgress = false,
      openPullDown = false,
      openPullUp = false,
      onRefresh = async () => {},
      onLoadMore = async () => {},
    } = props;
  
    const handlerPullDown = () => pullDownDebounce(
      async () => {
        if (controller === null) return;
        console.log('下拉');
        await onRefresh();
        controller.finishPullDown();
      }, debounceDelay
    );
  
    const handlerPullUp = () => pullUpDebounce(
      async () => {
        if (controller === null) return;
        console.log('上拉');
        await onLoadMore();
        controller.finishPullUp();
      }, debounceDelay
    );
  
    const handlerRefresh = () => scrollDebounce(
      () => {
        if (controller === null) return;
        console.log('刷新bs');
        controller.refresh();
      }, debounceDelay
    );
  
    const handlerBackTop = () => {
      if (controller === null) return;
      controller.scrollTo(0, 0, 300)
    }
  
    useEffect(() => {
      //  保存父组件或者新生成的better-scroll实例
      const instance = new BScroll(wrapperRef.current, {
        scrollX: direction === ScrollDirection.horizontal,
        scrollY: direction === ScrollDirection.vertical,
        pullDownRefresh: openPullDown,
        pullUpLoad: openPullUp,
        prototype: prototype,
        click: click
      });
      setController(instance);
      return () => {
        console.log('AppScroll 销毁');
        instance.destroy();
        setController(null);
      }
    }, [])
  
    useEffect(() => {
      //  给实例添加事件
      if (controller === null) return;
      if (openPullDown) {
        controller.on('pullingDown', handlerPullDown);
      }
      if (openPullUp) {
        controller.on('pullingUp', handlerPullUp);
      }
    }, [handlerPullDown, handlerPullUp])
  
    useEffect(() => {
      //  父组件通过eventBus给scroll组件传递事件
      //  刷新事件
      EventUtils.addListener(refreshKey, handlerRefresh);
      //  返回顶部事件
      EventUtils.addListener(toKey, handlerBackTop);
      return () => {
        EventUtils.removeListener(refreshKey, handlerRefresh);
        EventUtils.removeListener(toKey, handlerBackTop);
      }
    }, [controller, refreshKey, toKey])
  
    return (
      <div
        ref={wrapperRef}
        style={{
          width: scrollWidth,
          height: scrollHeight,
          background: scrollBackground,
          overflow: 'hidden'
        }}
      >
        <div className={"content position_relative"}>
          {showRefreshProgress && <PullDownProgress/>}
          {children}
        </div>
        {showBackTop && (<BackTopButton click={handlerBackTop}/>)}
      </div>
    )
  }
  ```

##### 四：实现的效果

- 简单使用完整代码

  ```react
  import {AppScroll} from "../component/app_scroll";
  
  function Profile() {
    return (
      <AppScroll scrollHeight={'200px'}>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
        <div>xxxxxxxxxxxxxx</div>
      </AppScroll>
    )
  }
  
  export default Profile
  ```

  


![scroll简单使用.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b47228b077b4991ab0eeed6146e6e5e~tplv-k3u1fbpfcp-watermark.image?)

- 复杂使用完整代码

  ```react
  import "../../../../assets/css/home.css"
  import {useCallback, useEffect, useState} from "react";
  import VideoRow from "../../component/video_row";
  import {homeInfoApi} from "../../../../network/api";
  import {HomeDataModel} from "../../../../network/model";
  import {AppScroll} from "../../component/app_scroll";
  import {EventKey, EventUtils} from "../../../../utils/event_utils";
  
  function HomeContent(props) {
    const {tag} = props;
    let [homeData, setHomeData] = useState(new HomeDataModel());
    let [pageIndex, setPageIndex] = useState(1);
    const refreshKey = EventKey.scrollRefresh(tag.name);
    const toKey = EventKey.scrollToTop(tag.name);
  
    useEffect(() => {
      //  切换tab时返回页面的顶部，暂时不做记录之前tab的位置
      EventUtils.emit(toKey)
    }, [tag])
  
    useEffect(() => {
      dataRefresh().then();
    }, [tag])
  
    async function dataRefresh() {
      try {
        const response = await homeInfoApi(tag.name);
        setPageIndex(1);
        setHomeData(response);
      } catch (e) {
        console.log(e);
      }
    }
  
    async function dataLoadMore() {
      try {
        const currentPage = pageIndex + 1;
        const response = await homeInfoApi(tag.name, currentPage);
        const currentHomeData = Object.assign({}, homeData);
        currentHomeData.videoList = homeData.videoList.concat(response.videoList);
        setPageIndex(currentPage);
        setHomeData(currentHomeData);
      } catch (e) {
        console.log(e);
      }
    }
  
    return (
      <AppScroll
        refreshKey={refreshKey}
        toKey={toKey}
        scrollHeight={'calc(100vh - 56px * 3)'}
        scrollBackground={'rgba(229, 229, 229, 0.29)'}
        showRefreshProgress={true}
        showBackTop={true}
        openPullDown={true}
        onRefresh={dataRefresh}
        openPullUp={true}
        onLoadMore={dataLoadMore}
      >
        <div className={"home_content_container"}>
          {
            homeData.videoList.map((item, index) =>
              <VideoRow
                {
                  ...Object.assign(
                    item, {imgLoaded: () => EventUtils.emit(refreshKey)}
                  )
                }
                key={item.vid + index}
              />
            )
          }
        </div>
      </AppScroll>
    )
  }
  
  export default HomeContent
  ```


![scroll复杂使用.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c74710e4f654420bc27d00b8984dcf2~tplv-k3u1fbpfcp-watermark.image?)

- ok，到这里就完结了，记录下自己的经验，也希望能帮助屏幕前的你，有啥问题也欢迎在评论区讨论  ^_^