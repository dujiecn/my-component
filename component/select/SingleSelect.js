import React from 'react';
import Immutable from 'immutable'

export default class SingleSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list: this.reparseList([]),
      selected: -1
    }
  }

  componentDidMount() {
    const {selected, list} = this.props
    this.setState({list: this.reparseList(list), selected})
    this.setParam(selected)
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (Immutable.is(Immutable.fromJS(this.props.list), Immutable.fromJS(nextProps.list)))
      return

    const list = this.reparseList(nextProps.list);
    this.setState({list})

    var obj = list.filter(item => item[this.props.field] == this.state.selected)[0]
    if (!obj) {
      this.handleChange(-1)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (Immutable.is(Immutable.fromJS(this.state), Immutable.fromJS(nextState)))
      return false
    return true
  }

  componentDidUpdate(prevProps, prevState) {
    this.setParam(this.state.selected)
  }

  reparseList(list) {
    let array = Object.assign([], list)
    if (!this.props.autoPrefix) {
      return array
    }

    const {field, text} = this.props
    var obj = {}
    obj[field] = -1
    obj[text] = "请选择..."
    array.unshift(obj)
    return array
  }

  handleChange(selected) {
    this.setState({selected})
    this.props.onChange(this.props.name, selected)
  }

  setParam(selected) {
    this.context.setParam && this.context.setParam(this.props.name, selected)
  }

  render() {
    const {field, text, name, style,disabled} = this.props
    const {selected, list} = this.state

    return (
      <select disabled={disabled} className="form-control" name={name} style={style} value={selected} onChange={(e) => {
        this.handleChange(e.target.value)
      }}>
        {
          list.map((item, i) => {
            return (
              <option {...item} key={Math.random()} value={item[field]}>{item[text]}</option>
            )
          })
        }
      </select>
    );
  }
}

SingleSelect.defaultProps = {
  list: [],
  text: 'text',
  field: 'value',
  autoPrefix: true,
  disabled:false,
  selected: -1,
  style: {
    color: 'black',
    maxWidth: 180,
    minWidth: 80,
    marginRight: 10
  },
  onChange: () => {}
}

SingleSelect.contextTypes = {
  setParam: React.PropTypes.func
}

SingleSelect.propTypes = {
  name:React.PropTypes.string.isRequired
}
