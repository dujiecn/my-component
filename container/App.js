import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import Immutable from 'immutable'

import {getLoginStatus} from '../action/LoginAction'

import LoginPage from './LoginPage'
import HomePage from './HomePage'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      container: ""
    }
  }

  componentDidMount() {
    this.props.getLoginStatus(1)
    // setTimeout(() => this.props.getLoginStatus(0),1000) // test code
    this.getContianer(this.props.status)
  }

  componentWillReceiveProps(nextProps) {
    if (Immutable.is(Immutable.fromJS(this.props), Immutable.fromJS(nextProps)))
      return

    this.getContianer(nextProps.status)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (Immutable.is(Immutable.fromJS(this.state), Immutable.fromJS(nextState)))
      return false
    return true
  }

  getContianer(status) {
    let container = ''
    switch (status) {
      case 0:
        container = <LoginPage/>
        break;
      case 1:
        container = <HomePage/>
        break;
      default:
      container = ''
    }
    this.setState({container})
  }

  render() {
    return (
      <div>
        {this.state.container}
      </div>
    )
  }
}

export default connect(state => {
  return Object.assign({}, state.Login)
}, dispatch => {
  return {
    getLoginStatus: bindActionCreators(getLoginStatus, dispatch)
  }
})(App)
