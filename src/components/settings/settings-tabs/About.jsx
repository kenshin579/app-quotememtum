import React from 'react';
import '../css/about.css';

class About extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="about-settings-tab">
        <h1>About</h1>
        <p>....<br/>
        Developed for <a target='_blank' rel="noopener noreferrer" href="https://chingu-cohorts.github.io/chingu-directory/">Chingu Cohort</a> &#34;Build to Learn&#34; project
        </p>
        <p>Made by</p>
        <p><a target='_blank' rel="noopener noreferrer" href="https://github.com/kenshin579">@kenshin579</a></p>
      </div>
    );
  }
}

export default About;
