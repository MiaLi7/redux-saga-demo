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