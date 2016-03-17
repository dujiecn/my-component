import {
  LOGIN_STATUS
}
from '../constant'

export default (state = {
  status: -1
}, action) => {
  let newState = Object.assign({},state)
  switch (action.type) {
    case LOGIN_STATUS:
      newState.status = action.status
      return newState
    default:
      return state

  }
}
