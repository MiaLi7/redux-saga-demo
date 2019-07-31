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