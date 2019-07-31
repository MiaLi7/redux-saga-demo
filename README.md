#基于create-react-app引入redux-saga的脚手架搭建

##一、背景介绍
我们使用redux来管理组件的状态已经很方便了，而且要页面的改变都会通过action和reducer进行处理，但是由于redux的三大原则：单一数据源，state只读，通过纯函数执行修改，而reducer就是纯函数，所以很多的副作用就无法处理了，这时候我们就可以通过redux-saga来处理函数的副作用，并且可以很简单的执行异步请求，对每个异步流程saga都可以实现暂停、停止、启动三种状态。

下面我们通过创建项目引入saga搭建脚手架，通过单击按钮时从远程服务器获取一些用户数据的例子来说明saga的使用。

##二、实现步骤

### 1、创建项目
选择你想要存放项目的路径，假定当前所在的文件目录为` D:\work\workspace\react` ，在目录空白处按住键盘shift键，同时鼠标右键，选择“在此处打开命令窗口”，在打开的命令行窗口中输入命令

	$ create-react-app redux-saga-demo


,其中`redux-saga-demo`是你想创建的项目名字，输入完全后，按回车，可以看到命令行窗口一直在跳动，这样`create-react-app`就会自动帮我们下载项目所要依赖的文件了，我们只要等待项目创建完成就可以了。当命令行窗口出现`Happy hacking!`，即项目创建完成，我们可以在`D:\work\workspace\react`目录下发现该目录下多了一个`redux-saga-demo`的文件夹，这就是我们创建的项目了。



### 2、项目文件目录结构
	├── node_modules                            // 项目第三方依赖文件
	├── public                                  // 放静态资源
	├── src                                     // 源码目录
	│   ├── App.css                             // 组件样式
	│   ├── App.js                              // 组件文件
	│   ├── App.test.js                         // 组件测试文件
	│   ├── index.css                           // 项目入口文件样式
	│   ├── index.js                            // 项目入口文件
	│   ├── logo.svg                            // 项目图标文件
	│   ├── serviceWorker.js                    // 资源缓存
	├── .gitignore                              // 告诉Git哪些文件不需要添加到版本管理中
	├── package-lock.json                       // 锁定安装时的包的版本号
	├── package.json                            // 项目配置文件，项目依赖包版本号
	├── README.md                               // 项目的说明文件



### 3、启动项目
创建好项目后，需要先启动项目查看项目是否能够正常运行。在命令行窗口中输入命令

	$ cd redux-saga-demo

进入项目，再输入命令

	$ npm start

启动项目，项目启动后会自动打开一个浏览器窗口加载页面，则项目启动完成。当浏览器加载页面情况如下图代表启动成功。




### 4、下载相关依赖
先关闭刚才启动的项目，在命令行窗口，同时按住键盘`ctrl+C`按键，在显示的命令处输入“y”即可关闭项目。使用redux-saga要下载的依赖有redux,react-redux,saga,由于我们这个例子用到了异步请求，这里我用的是axios,所以也有下载axios的依赖。在命令行窗口依次输入

	$ npm install redux --save
	$ npm install react-redux --save
	$ npm install redux-saga --save
	$ npm install axios --save

下载完成后，打开`package.json`文件，即可发现在`dependencies`中多了这些依赖版本号。

下载完依赖，就可以启动项目了，在命令行窗口输入:

	npm start


### 5、redux-saga大体数据流程
	action1(plain object)——>redux-saga监听—>执行相应的Effect方法——>返回描述对象—>恢复执行异步和副作用函数—>action2(plain object)


### 6、具体实现过程

#### (1). 创建组件，与store建立连接
首先，要把页面显示出来，再处理逻辑。在src目录下新建一个components文件夹，新建一个文件index.js,创建组件把页面显示出来，考虑到使用redux,所以使用connect将组件与store建立连接，按钮点击事件就dispatch一个action。在App.js中就把自定义的组件进行组装。

src/components/index.js代码如下

	import React from 'react';
	import { connect } from 'react-redux';

	class GetSagaVal extends React.Component {

	  handleClick() {
		this.props.dispatch({ type: 'GET'});
	  }

	  render() {
		console.log(this.props.sagaval.data[0]);
		return (
		  <div style={{marginLeft: '20px'}}>
			<h4>请点击按钮，获取第一条saga数据的名字</h4>
			<button onClick={this.handleClick.bind(this)}>获取saga数据</button>
			<h4>{ this.props.sagaval.data.length > 0 ?    this.props.sagaval.data[0].name : '无'}</h4>

		  </div>
		);
	  }

	}
	const mapStateToProps = (state) => {
	  return ({
		sagaval: state.getSaga
	  });
	}

	export default connect( mapStateToProps )(GetSagaVal);



App.js代码如下：

	import React from 'react';
	import GetSagaVal from './components/index.js';

	class App extends React.Component {
	  render() {
		return (
		  <div >
			 <GetSagaVal />
		  </div>
		);
	  }
	}
	export default App;

#### (2). 引入saga,处理异步请求
在components文件夹下新建一个文件夹saga,里面新建一个文件saga.js,在saga.js中引入saga的generator函数,watchSaga()对组件发出的action进行监听,并调用对应的workerSaga()处理异步请求，处理结束后，put一个新的action给reducer。注意，saga的generator函数写法是function后加一个“*”，且所有的 Effect 如call,put等都必须被 yield 才会执行。

saga.js代码如下：

	import { put, call, takeEvery } from 'redux-saga/effects';
	import axios from 'axios';

	function* workerSaga() {
		const data = yield axios({
			method: 'get',
			url: `https://jsonplaceholder.typicode.com/users`
		});
		console.log( data );
		yield put({ type: "GETSAGA", data: data});
	}


	function* watchSaga() {
		yield takeEvery('GET', workerSaga);
	}
	export default watchSaga;


#### (3). reducer处理
action被中间件saga处理过之后，发出的一个新的action会被reducer接收，reducer通过action.type执行相应的操作。在components文件夹下新建一个文件夹reducer,里面新建文件reducer.js。

reducer.js代码如下：

	import React from 'react';
	import { combineReducers } from 'redux';

	function getSaga( state = {data: []}, action) {
		switch( action.type) {
			case 'GETSAGA':
				return action.data;
			default:
				return state;
		}
	}

	export default combineReducers({
		getSaga
	});

#### (4). 创建store,启动saga
前面我们做的都是基本事件逻辑处理，但是还没有真正放在store树上面，而且saga和reducer也还没有启动监听，所以是还不会看到效果的，所以要在index.js入口文件中创建store,并启动saga监听action。

index.js代码如下：

	import React from 'react';
	import ReactDOM from 'react-dom';
	import './index.css';
	import App from './App';
	import * as serviceWorker from './serviceWorker';
	import { createStore, applyMiddleware } from 'redux';
	import { Provider } from 'react-redux';
	import  createSagaMiddleware  from "redux-saga";
	import reducer from './components/reducer/reducer.js';
	import saga from './components/saga/saga.js';

	const sagaMiddleware = createSagaMiddleware();
	const store = createStore(
		reducer,
		applyMiddleware( sagaMiddleware )
	);
	sagaMiddleware.run( saga );

	ReactDOM.render(
		<Provider store={ store }>
			<App />
		</Provider>, 
		document.getElementById('root')
	);

	serviceWorker.unregister();

到这里，我们引入saga的例子就基本完成了，刷新页面就可以看效果了。

## 三、实现效果


