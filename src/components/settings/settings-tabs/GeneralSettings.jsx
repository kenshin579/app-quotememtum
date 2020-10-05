import React from 'react';
import Toggle from 'react-toggle';
import '../css/react-toggle.css';
import '../css/generalSettings.css';

class GeneralSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props;
  }

  changeOption(e) {
    this.props.changeOption(e);
    const optionArr = e.target.id.split('-');
    const newOptions = this.state.options;
    newOptions[optionArr[0]] = optionArr[1];
    this.setState({ options: newOptions });
  }

  activeClockFormat(value) {
    return `option-${(value === this.state.options.clockFormat) ? 'active' : 'default'}`;
  }

  render() {
    return (
      <div className="settings-main-pane-inner">
        <h1>보기 설정</h1>
        <label className="show-option">
          <span>SNS 공유 버튼</span>
          <Toggle id="showSns" defaultChecked={this.state.showFeatures.showSns}
            icons={false} onChange={this.props.toggleFeature.bind(this)} />
        </label>
        <br/>
        <h1>옵션</h1>
        <label className="show-option">
          <span>시계 포멧</span>
          <div className="units-toggle-container">
            <span id="clockFormat-12hour" className={this.activeClockFormat('12hour')} onClick={this.changeOption.bind(this)}>12시간</span>
            <span>|</span>
            <span id="clockFormat-24hour" className={this.activeClockFormat('24hour')} onClick={this.changeOption.bind(this)}>24시간</span>
          </div>
        </label>
      </div>
    );
  }
}

export default GeneralSettings;
