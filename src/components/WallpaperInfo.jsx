import React from 'react';
import { titleCase } from 'Utils/utilities';
import 'Stylesheets/wallpaper-info.css';

class WallpaperInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.wallpaperData;
  }

  componentWillReceiveProps(nextProps) {
    if (this.state !== nextProps.wallpaperData) {
      this.setState({
        wallpaperLiked: nextProps.wallpaperData.wallpaperLiked,
        user: nextProps.wallpaperData.user,
        location: nextProps.wallpaperData.location,
      });
    }
  }

  render() {
    const photographer = titleCase(`${this.state.user.first_name} ${this.state.user.last_name}`);
    const location = titleCase(`${this.state.location.title}`);
    const unsplashUTM = '?utm_source=turtle-team-5.surge.sh&utm_medium=referral&utm_campaign=api-credit';

    return (
      <div className={this.props.wallpaperInfoClassName}>
        <div>{location}</div>
        <div className="photographer-container">
          <div>
            <a target='_blank' rel="noopener noreferrer" href={`${this.state.user.links.html}${unsplashUTM}`}>{photographer} / </a><a target='_blank' rel="noopener noreferrer" href={`https://unsplash.com${unsplashUTM}`}>Unsplash</a>
          </div>
        </div>
      </div>
      // </div>
    );
  }
}

export default WallpaperInfo;