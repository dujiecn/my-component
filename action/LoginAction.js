import {LOGIN_STATUS} from '../constant'


export function getLoginStatus(status = 0) {
  return (dispatch,getState) => {
    dispatch({
      type:LOGIN_STATUS,
      status
    })
  }
}
