## 核心概念

- 应用
  应用实例是整个express的根容器和核心。它负责管理全局配置、注册中间件、挂载路由以及启动http服务器。
  - 创建方式：通过express函数创建一个应用实例 通常命名为app
  - 核心方法
    - app.use():用于注册中间件
    - app.METHOD():用于定义路由 其中METHOD是一个路由方法 比如 get post这些
    - app.listen():用于启动服务器并监听相对应的接口
- 路由
  路由定义了应用程序如何响应客户端对特定端点(一个url或路径)发出的HTTP请求(POST,GET等)。可以看作应用的寻址系统
  - 基本结构:app.METHOD(PATH,HANDLER)
    - METHOD:HTTP请求方法
    - PATH:服务器上的路径
    - HANDLER:匹配到该路由时执行的函数
  - 动态参数:路由路径可以包含动态参数，例如 /users/:id,可以通过req.params 来获取
  - 模块化:推荐使用express.Router() 将不同功能的路由拆分到独立的模块中，以提高代码的可维护性
- 中间件
  中间件是Express的灵魂，可以说'一切都中间件'。它是一个函数，可以访问请求对象(res),响应对象(req)
  以及应用请求-响应周期中的下一个中间件函数(next)。
  中间件可以执行代码、修改请求和响应对象、结束请求-响应循环，或调用下一个中间件。
  - 核心签名:(req,res,next)=>{}
  - 执行流程:中间件按照注册顺序执行，形成一个流水线或洋葱模型。next()函数用于将控制权传递给下一个中间件。
  - 主要类型
    - 应用级中间件:通过app.use()绑定到整个应用
    - 路由级中间件:绑定到Express.Router()实例
    - 错误处理中间件:需要四个参数(err,req,res,next)，用于集中处理错误
    - 内置/第三方中间件:如express.json()用于解析JSON请求体，或morgan()用于记录请求日志
- 请求与响应对象
  Express对Node.js的原生请求和响应对象进行功能增强，提供了更便捷的方法和属性来处理HTTP通信
  - 请求对象(req):封装了客户端发来的所有信息。
    - req.params:路由参数 如/user/:id中的id
    - req.query:URL查询字符串，如/search?q=express中的q
    - req.body:请求体数据，通常需要配合express.json()等中间件使用
  - 响应对象(res):用于向客户端发送响应
    - res.send():发送各种类型的响应(字符串,BUffer,对象等)
    - res.json():发送一个JSON响应
    - res.status():设置HTTP状态码

## 静态资源托管
让我的express服务器可以直接向外界提供图片 css js 字体等不需要经过复杂处理的文件
直接使用express.static()方法来进行托管
也可以加上一个虚拟路径 比如app.use(express.static(path.join(__dirname, 'public')));

  
## 模板引擎
模板引擎就是固定的html加上动态的数据
操作流程
1. 安装模板引擎 (我这里是用的ejs)
2. 配置 app.set('view engine',ejs)
3. 创建.ejs文件 在Html中写动态数据
   - <%= 变量 %>:输出变量
   - <% 代码 %>:执行代码 
4. 渲染:res.render('文件名',{变量})

### 遇到的问题
1. 不知道该怎么通过post方法来访问接口 直接输入网址好像只能是get请求 后来通过apipost解决
2. 原来打印req.body是undefined 后来发现是1. 自己没有重启服务器 2. 没有注入express.json的中间件
3. static静态资源 原来一直无法访问 后来发现是在地址栏中不需要输入public路径
4. __dirname 发现在mjs中 无法直接使用 后来查资料 发现通过 import.meta.dirname获取