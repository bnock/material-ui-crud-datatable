import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from './reducers';
import CrudDatatableContainer from './containers/CrudDatatable';

let store;

if (process.env.NODE_ENV === 'production') {
    store = createStore(rootReducer, applyMiddleware(thunkMiddleware, createLogger()));

} else {
    store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
}

export const CrudDatatable = (props) => {
    return (
        <Provider store={store}>
            <CrudDatatableContainer {...props} />
        </Provider>
    )
};
