import React, { Component } from 'react';
import 'Stylesheets/clock.css';

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: this.currentMinSecs(this.props.clockFormat),
    };
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

  updateTime() {
    this.setState({ time: this.currentMinSecs(this.props.clockFormat) });
  }

  componentDidMount() {
    setInterval(this.updateTime.bind(this), 1000);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      time: this.currentMinSecs(nextProps.clockFormat),
    });
  }

  render() {
    const timeArr = this.state.time.split(' ');
    return (
      <div className="clock">
        <div className="time">{timeArr[0]}{timeArr[1] && <span className="ampm">{timeArr[1]}</span>}</div>
      </div>
    );
  }
}

export default Clock;