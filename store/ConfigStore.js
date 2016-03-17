import {createStore,applyMiddleware} from 'redux'
import thunkMiddleware from 'redux-thunk'
import loggMiddleware from 'redux-logger'


export default (reducer,initState) => {
  let middleware = [thunkMiddleware]

  if(__DEV__) {
    middleware = [...middleware,loggMiddleware()]
  }

  return applyMiddleware(...middleware)(createStore)(reducer,initState)
}
