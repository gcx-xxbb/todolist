### 底层渲染模式更新 新增了并发渲染模式

1.  初步理解 并发渲染类似于异步渲染 它可以在一些可能会堵塞系统的渲染任务时 主动中断完成优先级更高的任务 然后接着继续执行渲染任务
2.  可以使用React.createRoot(root).render(<App />)来开启并发模式
3.  开启并发模式 并不意味着开启了并发更新 只有在使用并发特性的时候才会开启并发更新
4.  一些并发特性：
    1.  startTransition:
        1. 使用方式

        ```tsx
        import React, { useState, useTransition } from 'react';
        const App: React.Fc = () => {
          const [list, setList] = useState<number[]>([]);
          const [isPending, startTransition] = useTransition();
          useEffect(() => {
            startTransition(() => {
              setList(new Array(10000).fill(null)
            });
          }, []);
        		 return(<>
        		 	{list.map(_,i)=>{
        				<div key={i} >{i}</div>
        			}}
        		 </div>)
        };
        ```

        2. 主要作用是在大量任务下也能保持ui响应 简单来说 就是被startTransition包裹的setState触发的渲染是不紧急渲染 有可能会被其他紧急渲染所打断

    2.  useDeferredValue
        1.  使用方式
            ````tsx
            	import React, { useState,useEffect, useDeferredValue } from 'react';
            			const App: React.F c = () => {
            				const [list, setList] = useState<number[]>([]);
            						useEffect(() => {
            							setList(new Array(10000).fill(null))
            						},[])
            						const deferredList = useDeferredValue(list);
            						return(<>
            						{deferredList.map((_,i)=><div key={i}>{i}</div>)}
            						</div>)
            			}
            	```
            ````
        2.  返回一个延迟响应的值 可以让一个state延迟生效 只有当前没有紧急更新时 该值才会变为最新值
        3.  与startTransition比较：
        - 相同: 都是标记成为延迟更新任务
        - 不同: useTransition是把更新任务变成了延迟更新任务 而useDeferredValue是产生一个新的值 这个值作为延时状态
        - 一个用来包装方法，一个用来包装值
    3.  useId：支持同一个组件在服务端和客户端生成相同的唯一id
    4.  useSyncExternalStore:主要解决外部数据撕裂问题 一般是第三方库使用 日常业务中不太需要关注
    5.  renderApi:为了更好管理root节点 引入了一个新的rootApi 新Api支持并发模式的渲染 允许进入并发模式
        - 使用方式:ReactDom.createRoot(root).render(<App />)
        - 卸载组件时 需要将unmountComponentAtNode升级为root.unmount
        - React18从render方法中删除了回调函数 如果需要在render中使用回调函数 可以通过useEffect实现
        - 如果使用了ssr服务端渲染 需要把ReactDom.hydration升级为ReactDom.hydrateRoot
        - 更新了ts的类型定义 现在定义props类型时需要显示定义children属性
    6.  setState自动批处理
        1.  在React18前 只在React事件处理函数中进行批处理更新 默认情况下 在promise setTimeout 原生事件处理函数 或任何其他事件内 都不会进行批处理更新
        2.  在React18中 任何情况都会自动执行批处理，多次更新始终合并为一次
    7.  flushSync:批处理更新是一个破坏性改动 如果想退出 可以使用flushSync
        - 使用方式:ReactDom.flushSync(()=>{setState(1)})
        - flushSync函数内部的多个setState仍然是批处理更新 这样可以精准控制哪些不需要批处理更新
    8.  React组件的返回值
    - 在React16中 如果需要返回一个空组件 只能返回null 返回undefined会报错
    - 在React18中 不再因为检查返回undefined导致崩溃 两个都可以返回 但是在React18的dts文件 仍然只接受null
