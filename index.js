import React from 'react'
import {Provider} from 'react-redux'
import ReactDOM from 'react-dom'
import configStore from './store/ConfigStore'
import Reducer from './reducer'
import App from './container/App'

ReactDOM.render(
  <Provider store={configStore(Reducer)}>
    <App />
  </Provider>,
  document.getElementById('root')
)
