import React, {PropTypes} from 'react';
import Immutable from 'immutable'

export default class ComboSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list:[this.preprocess()],
      values:[-1] // 可以改造成对象下属性，可以得到直接修改的值
    }
    this.selected = -1
    this.list = []
  }

  componentDidMount() {
    this.list = this.props.list
    this.changeSelected()
    this.setParam()
  }

  componentWillReceiveProps(nextProps) {
    if(Immutable.is(Immutable.fromJS(this.props.list),Immutable.fromJS(nextProps.list)))
      return

    this.list = nextProps.list
    this.changeSelected()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(Immutable.is(Immutable.fromJS(this.state),Immutable.fromJS(nextState)))
      return false
    return true
  }

  componentDidUpdate(prevProps, prevState) {
    this.setParam()
  }

  changeSelected() {
    const {field,pid,selected} = this.props
    let values = [],list = []

    let cnode = this.node(selected)
    if(!cnode) {
      list.unshift(this.children(pid))
      values.unshift(selected)
    }else {
      let pnode = this.node(cnode.pid)
      values.unshift(cnode[field])
      var obj = null;
      while (pnode) {
        obj = this.children(pnode[field])
        list.unshift(obj);

        cnode = pnode;
        values.unshift(cnode[field])
        pnode = this.node(cnode.pid)
      }
      // 补充根节点数据
      if (!pnode) {
        obj = this.children(pid)
        list.unshift(obj);
      }
    }
    this.setState({list,values})
  }

  handleChange(e,index) {
    const {selectedIndex} = e.target;
    this.selected = e.target.value

    const values = Object.assign([],this.state.values)
    values.splice(index + 1,values.length - (index + 1))
    values[index] = this.selected

    const list = Object.assign([],this.state.list)
    list.splice(index + 1,list.length - (index + 1))
    const children = this.children(this.selected)
    if (children.length > (this.props.autoPrefix ? 1 : 0)) {
        list.push(children)
    }

    this.setState({list, values});

    this.props.onChange(this.props.name, this.val())
  }

  setParam() {
    this.context.setParam && this.context.setParam(this.props.name,this.val())
  }

  val() {
    let selected = this.selected
    if(selected == -1) {
      const {values} = this.state
      for (let i = values.length - 1; i >= 0; i--) {
        if (values[i] != -1) {
          selected = values[i]
          break;
        }
      }
    }

    __DEV__ && console.log("%c 当前选中:", "color: #800c50;", selected)
    return selected;
  }

  preprocess() {
    let array = []
    if(!this.props.autoPrefix)
      return array;

    const {field,text} = this.props
    let obj = {}
    obj[field] = -1
    obj[text] = '请选择...'
    array.unshift(obj)
    return array
  }

  children(pid) {
    return this.preprocess().concat(this.list.filter(item => item.pid == pid))
  }

  node(selected) {
    if(!selected && selected != 0)
      return null

    return this.list.filter(item => item[this.props.field] == selected)[0];
  }

  render() {
    const {list,values} = this.state
    const {disabled,name} = this.props

    return (<span>
      {
        list.map((list,index) => {
          return (
            <select disabled={disabled}
              className="form-control"
              style={{color:'#000', minWidth: 80, marginRight:5,display:'inline-block',width:"auto"}}
              key={Math.random()}
              name={name}
              value={values[index]}
              onChange={(e) => this.handleChange(e,index)}>
              {
                list.map((o,i) => {
                    return (
                      <option key={Math.random()} index={i} value={o.id} >{o.text}</option>
                    )
                })
              }
            </select>
          )
        })
      }
    </span>);
  }
}

ComboSelect.defaultProps = {
  list:[],
  autoPrefix:true,
  selected:-1,
  field:'id',
  text:'text',
  pid:0,
  disabled:false,
  onChange:() => {}
}

ComboSelect.contextTypes = {
  setParam: React.PropTypes.func
}

ComboSelect.propTypes = {
  name:React.PropTypes.string.isRequired
};
