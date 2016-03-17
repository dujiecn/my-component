import React from 'react'
import Immutable from 'immutable'
import uid from '../../util/uid'
import '../../util/Date'


// 使用：<FormTime label="更新时间" name='updateTime' type="day" date={new Date()}/>
var MONTH_NAME = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
var WEEK_NAME = ["日", "一", "二", "三", "四", "五", "六"];
var WEEK_DAY_LENGTH = 7;
// 当前面板的类型
var CALENDAR_TYPE = {
  MONTH: "month",
  DAY:"day"
};


export default class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      type: props.type,
      date: props.date // Date 类型
    }
  }

  componentDidMount() {
    this.setParam(this.state.date)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (Immutable.is(Immutable.fromJS(this.state), Immutable.fromJS(nextState)))
      return false
    return true
  }

  componentDidUpdate(prevProps,prevState) {
    this.setParam(this.state.date)
  }

  handleFocus() {
    this.setState({
      show: true
    })

    const {container} = this.props

    let mask = document.getElementById('c-mask')
    if (!mask) {
      mask = document.createElement('div');
      container.appendChild(mask);
      mask.id = "c-mask"
      mask.style.position = 'absolute';
      mask.style.left = 0;
      mask.style.top = 0;
      mask.style.width = '100%';
      mask.style.height = container.scrollHeight + 'px';
      mask.style.zIndex = 3999;
    }
    if (mask.addEventListener) {
      mask.addEventListener('click', this.handleBlur.bind(this, mask))
    } else {
      mask.attachEvent('onclick', this.handleBlur.bind(this, mask))
    }
  }

  handleBlur(mask) {
    this.setState({
      show: false
    })
    if (mask.removeEventListener) {
      mask.removeEventListener('click', this.handleBlur.bind(this, mask));
    } else {
      mask.deattachEvent('onclick', this.handleBlur.bind(this, mask))
    }
    this.props.container.removeChild(mask);
  }

  handleDateChange(date) {
    this.setState({date})
  }

  setParam(date) {
    this.context.setParam && this.context.setParam(this.props.name,date.getTime())
  }

  render() {
    const {label} = this.props
    const {date,type} = this.state

    let value = null
    let content = ''
    if(type == CALENDAR_TYPE.DAY) {
    	content = this.renderDay(date)
      value = date.format('yyyy-MM-dd')
    }else if(type == CALENDAR_TYPE.MONTH) {
      content = this.renderMonth(date)
      value = date.format('yyyy-MM')
    }

    return (
      <div className="form-group">
      	<label className="col-md-2 control-label" style={{whiteSpace:'nowrap'}}>{label || ''}</label>
      	<div className="col-md-5 c-time">
      		<input
      			className="form-control"
      			type="text"
      			readOnly={true}
      			value={value}
      			onFocus={this.handleFocus.bind(this)}/>
      			{content}
      	</div>
      </div>
    );
  }

  renderMonth(date) {
    var index = 0;
    var timeContent = []
    for(let i = 0;i < 4;i++) {
      var tds = []
      for(let j = 0;j < 3;j++) {
        tds.push(<td key={uid()} index={index} className={"timeval clickable " + (date.getMonth() == index ? "selected" : "")}>{MONTH_NAME[index++]}</td>)
      }
      timeContent.push(<tr key={uid()}>{tds}</tr>)
    }

    return (
      <div className={"c-calendar " + (this.state.show ? "show" : "")}>
        <div>
          <table className="c-calendar-header">
            <tbody>
              <tr>
                <td onClick={(e) => {
                  this.handleDateChange(new Date(date.getFullYear() - 1,0))
                }}>
                  <i className="glyphicon glyphicon-menu-left" />
                </td>
                <td>
                  <span>{date.format('yyyy年')}</span>
                </td>
                <td onClick={(e) => {
                  this.handleDateChange(new Date(date.getFullYear() + 1,0))
                }}>
                  <i className="glyphicon glyphicon-menu-right" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <table className="c-calendar-main month" onClick={(e) => {
            var target = e.target
            if(target.className.search(/timeval/) == -1)
              return

            for(var i = 0;i < MONTH_NAME.length;i++)
              if(MONTH_NAME[i] == target.innerText)
                break

            this.handleDateChange(new Date(this.state.date.getFullYear(),i))

            // 如果初始化的类型是day，则需要重新设置state
            var {type} = this.props
            if(type == CALENDAR_TYPE.DAY) {
              this.setState({type:CALENDAR_TYPE.DAY})
            }
          }}>
            <tbody>
              {timeContent}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  renderDay(date) {
    var totalDaysOfMonth = date.getDays();
    var firstDayOfMonth = date.getFirstDay();
    var rowSize = this.getRowSize(firstDayOfMonth,totalDaysOfMonth)

    var weekname = []
    for(let i = 0;i < WEEK_DAY_LENGTH;i++) {
    	weekname.push(<td key={uid()}>{WEEK_NAME[i]}</td>)
		}

		var index = 1;
		var timeContent = []
		for(let i = 0;i < rowSize;i++) {
			var tds = []
			for(let j = 0;j < WEEK_DAY_LENGTH;j++) {
				if(i == 0 && j < firstDayOfMonth) {
					tds.push(<td key={uid()}></td>)
				}else {
					tds.push(<td key={uid()} className={"timeval clickable " + (date.getDate() == index ? "selected" : "")}>{index}</td>)
					if(++index > totalDaysOfMonth)
						break;
				}
			}
			timeContent.push(<tr key={uid()}>{tds}</tr>)
		}

    return (
    	<div className={"c-calendar " + (this.state.show ? "show" : "")}>
  			<div>
  				<table className="c-calendar-header">
  					<tbody>
  						<tr>
    						<td onClick={(e) => {
                  const {date} = this.state
                  const month = date.getMonth()
                  const newDate = month == 0 ? new Date(date.getFullYear() - 1, 11) : new Date(date.getFullYear(), month - 1)
                  this.handleDateChange(newDate)
                }}>
    							<i className="glyphicon glyphicon-menu-left" />
    						</td>
    						<td>
    							<span className="clickable" onClick={() => {
                    this.setState({type:CALENDAR_TYPE.MONTH})
                  }}>{date.format('yyyy年MM月')}</span>
    						</td>
    						<td onClick={(e) => {
                  const {date} = this.state
                  const month = date.getMonth()
                  const newDate = month == 11 ? new Date(date.getFullYear() + 1,0) : new Date(date.getFullYear(),month + 1)
                  this.handleDateChange(newDate)
                }}>
    							<i className="glyphicon glyphicon-menu-right" />
    						</td>
    					</tr>
  					</tbody>
  				</table>
  			</div>
  			<div>
  				<table className="c-calendar-main day" onClick={(e) => {
						var target = e.target
						if(target.className.search(/timeval/) == -1)
							return

            const {date} = this.state
            this.handleDateChange(new Date(date.getFullYear(),date.getMonth(),+target.innerText))
					}}>
						<tbody>
							<tr>{weekname}</tr>
							{timeContent}
						</tbody>
					</table>
  			</div>
  		</div>
    )
  }

  getRowSize(firstDayOfMonth,totalDaysOfMonth) {
    // 根据每个月的一号是周几 计算出总共是多少天（以每行7天计算，方便下面计算行数）
    var tempTotalDays = 0;
    switch (firstDayOfMonth) {
      case 1:
        tempTotalDays = totalDaysOfMonth + 1;
        break;
      case 2:
        tempTotalDays = totalDaysOfMonth + 2;
        break;
      case 3:
        tempTotalDays = totalDaysOfMonth + 3;
        break;
      case 4:
        tempTotalDays = totalDaysOfMonth + 4;
        break;
      case 5:
        tempTotalDays = totalDaysOfMonth + 5;
        break;
      case 6:
        tempTotalDays = totalDaysOfMonth + 6;
        break;
      case 0:
        tempTotalDays = totalDaysOfMonth;
        break;
      default:
        break;
    }
    return Math.ceil(tempTotalDays / WEEK_DAY_LENGTH)
  }
}


Calendar.defaultProps = {
	type:CALENDAR_TYPE.DAY,
  date:new Date(),
  container:document.getElementById('root')
}

Calendar.propTypes = {
  name: React.PropTypes.string.isRequired,
  date:React.PropTypes.object.isRequired
}

Calendar.contextTypes = {
  setParam: React.PropTypes.func.isRequired
}
