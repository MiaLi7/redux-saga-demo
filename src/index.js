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
