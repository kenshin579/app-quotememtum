import React from 'react';
import 'Images/settings.svg';
import './css/settings.css';

class SettingsIcon extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div>
                <a href="#" title="Settings" onClick={this.props.toggleSettingsModal.bind(this)}>
                    <img className="icon-top-right" src="./assets/images/settings.svg" alt="Settings"/></a>
            </div>
        );
    }
}

export default SettingsIcon;