import React from 'react';
import GeneralSettings from 'Settings/settings-tabs/GeneralSettings.jsx';
import About from 'Settings/settings-tabs/About.jsx';
import './css/settings.css';

class SettingsModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      generalSettings: true,
      aboutPane: false,
      showFeatures: this.props.showFeatures,
      options: this.props.options,
      selected: 'generalSettings',
    };
  }

  changeTab(e) {
    const targetPane = e.target.id;
    this.setState({
      generalSettings: false,
      aboutPane: false,
    }, () => {
      this.setState({
        [targetPane]: true,
        selected: targetPane,
      });
    });
  }

  isActive(value) {
    return `menu-${(value === this.state.selected) ? 'active' : 'default'}`;
  }


  render() {
    return (
      <div className="settings-modal">
        <div className="settings-panes">
          <div className="settings-side-menu">
            <ul>
              <li id="generalSettings" className={this.isActive('generalSettings')} onClick={this.changeTab.bind(this)}>일반</li>
              <li id="aboutPane" className={this.isActive('aboutPane')} onClick={this.changeTab.bind(this)}>정보</li>
            </ul>
          </div>
          <div className="settings-main-pane">
            {this.state.generalSettings && <GeneralSettings
              toggleFeature={this.props.toggleFeature.bind(this)}
              showFeatures={this.state.showFeatures}
              options={this.state.options}
              changeOption={this.props.changeOption.bind(this)} />}
            {this.state.aboutPane && <About />}
          </div>
          <div className="close" onClick={this.props.closeModal.bind(this)}>&times;</div>
        </div>
      </div>
    );
  }
}

export default SettingsModal;
