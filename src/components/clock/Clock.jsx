import React, { Component } from 'react';
import 'Stylesheets/clock.css';

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: this.currentDate(),
      time: this.currentMinSecs(this.props.clockFormat)
    };
  }

  currentDate() {
      const currentTime = new Date();
      const week = ['일', '월', '화', '수', '목', '금', '토'];
      const dayOfWeek = week[currentTime.getDay()];
      const month = currentTime.getMonth() + 1;
      const date = currentTime.getDate();
      return `${month} ${date} ${dayOfWeek}`
  }

  currentMinSecs(clockFormat) {
    const currentTime = new Date();
    const hrs = currentTime.getHours();
    const min = currentTime.getMinutes();

    if (clockFormat === '12hour') {
      return `${hrs % 12 || 12}:${min < 10 ? `0${min}` : min} ${hrs >= 12 ? 'pm' : 'am'}`;
    }
    return `${hrs < 10 ? `0${hrs}` : hrs}:${min < 10 ? `0${min}` : min}`;
  }

  updateTimeAndDate() {
    this.setState({ time: this.currentMinSecs(this.props.clockFormat) });
    this.setState({ date: this.currentDate()});
  }

  componentDidMount() {
    setInterval(this.updateTimeAndDate.bind(this), 1000);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      time: this.currentMinSecs(nextProps.clockFormat),
    });
      this.setState({
          date: this.currentDate(),
      });
  }

  render() {
    const timeArr = this.state.time.split(' ');
    const dateArr = this.state.date.split(' ');

    return (
      <div className="clock">
        <div className="date">{dateArr[0]}/{dateArr[1]} ({dateArr[2]})</div>
        <div className="time">{timeArr[0]}{timeArr[1] && <span className="ampm"> {timeArr[1]}</span>}</div>
      </div>
    );
  }
}

export default Clock;