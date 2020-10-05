import React from 'react';
import '../css/about.css';

class About extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="about-settings-tab">
                <h1>정보</h1>
                <p><a target='_blank' rel="noopener noreferrer"
                      href="https://github.com/kenshin579/app-quotememtum">Quotememtum</a>은 Momentum 프로젝트에서 영감을 받아 명언 만을 쉽게 매일 접할 수 있도록 개발되었습니다.<br/>
                </p>
                <p>Made by</p>
                <p><a target='_blank' rel="noopener noreferrer" href="https://github.com/kenshin579">@kenshin579</a></p>
            </div>
        );
    }
}

export default About;
