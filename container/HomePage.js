import React from 'react'
import {SingleSelect,ComboSelect} from '../component/select'
import SingleSelectJson from '../component/select/SingleSelect.json'
import ComboSelectJson from '../component/select/ComboSelect.json'


export default class HomePage extends React.Component {
  render() {
    return (
      <div>
        {
          // <SingleSelect list={SingleSelectJson} disabled={true} selected={10003} autoPrefix={false} onChange={(name,val) => {console.log(name,val)}}/>
          <ComboSelect list={ComboSelectJson}/>
        }
      </div>
    )
  }
}
