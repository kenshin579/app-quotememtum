import React from 'react';
import SettingsIcon from 'Settings/SettingsIcon.jsx';
import SettingsModal from 'Settings/SettingsModal.jsx';
import Wallpaper from 'Components/Wallpaper.jsx';
import WallpaperInfo from 'Components/WallpaperInfo.jsx';
import Clock from 'Components/clock/Clock.jsx';
import Quote from 'Components/random-quote/Quote.jsx';
import 'Stylesheets/index.css';
import 'Stylesheets/top-right.css';
import {
    initializeLocalStorage,
    localStorageKeyExists,
    addToLocalStorage,
    getFromLocalStorage,
    updateLocalStorageObjProp,
    addToLocalStorageArray,
    removeFromLocalStorageArray,
} from 'Utils/utilities';

class App extends React.Component {
    constructor(props) {
        super(props);
        if (!localStorageKeyExists('localStorageInitialized')) {
            initializeLocalStorage();
        }
        const userSettings = getFromLocalStorage('userSettings');
        const currentQuote = getFromLocalStorage('quote') || {};
        const wallpaperData = getFromLocalStorage('wallpaper');

        this.state = {
            wallpaperData,
            currentQuote,
            showFeatures: userSettings.showFeatures,
            options: userSettings.options,
            responsiveWPI: 'wallpaper-info-container',
            quoteToggle: 'Quote',
            wpiToggle: 'Pic Info',
            showText: false,
        };
    }

    toggleSettingsModal() {
        this.setState({
            showSettingsModal: !this.state.showSettingsModal,
        });
    }

    toggleFeature(e) {
        const feature = e.target.id;
        const userSettings = getFromLocalStorage('userSettings');
        userSettings.showFeatures[feature] = !this.state.showFeatures[feature];
        addToLocalStorage('userSettings', userSettings);
        this.setState({
            showFeatures: userSettings.showFeatures,
        });
    }

    changeOption(e) {
        const optionArr = e.target.id.split('-');
        const userSettings = getFromLocalStorage('userSettings');
        userSettings.options[optionArr[0]] = optionArr[1];
        addToLocalStorage('userSettings', userSettings);
        this.setState({
            options: userSettings.options,
        });
    }

    updateQuoteInfo(currentQuote) {
        this.setState({
            currentQuote,
        });
    }

    toggleLike(likeStatus, objId, type) {
        if (type === 'wallpaper') {
            const wallpaperData = updateLocalStorageObjProp('wallpaper', 'wallpaperLiked', likeStatus);
            if (wallpaperData.id === objId) {
                this.setState({wallpaperData}, () => {
                    if (likeStatus) {
                        const arrLikedWallpapers = addToLocalStorageArray('arrLikedWallpapers', this.state.wallpaperData);
                        this.setState({
                            arrLikedWallpapers,
                        });
                    } else {
                        const arrLikedWallpapers = removeFromLocalStorageArray('arrLikedWallpapers', 'id', objId);
                        this.setState({
                            arrLikedWallpapers,
                        });
                    }
                });
            } else {
                const arrLikedWallpapers = removeFromLocalStorageArray('arrLikedWallpapers', 'id', objId);
                this.setState({
                    arrLikedWallpapers,
                });
            }
        }
    }

    showText() {
        this.setState({
            showText: true,
        });
    }

    updateWallpaperInfo(wallpaperData) {
        console.log('update wallpaper info called in app.jsx');
        this.setState({
            wallpaperData,
        });
    }

    render() {
        return (
            <main id="main">
                <Wallpaper
                    updateWallpaperInfo={this.updateWallpaperInfo.bind(this)}
                    showText={this.showText.bind(this)}
                    wallpaperData={this.state.wallpaperData}
                />
                {this.state.showSettingsModal
                && <SettingsModal
                    closeModal={this.toggleSettingsModal.bind(this)}
                    toggleFeature={e => this.toggleFeature(e)}
                    showFeatures={this.state.showFeatures}
                    options={this.state.options}
                    changeOption={e => this.changeOption(e)}
                    quote={this.state.currentQuote}
                    wallpaperData={this.state.wallpaperData}
                />
                }
                {this.state.showText
                && <div className="row top-row">
                    <div className="top-right-flex">
                        <Clock
                            showFocus={this.state.showFeatures.showFocus}
                            clockFormat={this.state.options.clockFormat}/>
                        <SettingsIcon toggleSettingsModal={this.toggleSettingsModal.bind(this)}/>
                    </div>
                </div>
                }
                {this.state.showText
                && <div className="row middle-row">
                    <Quote
                        updateQuoteInfo={this.updateQuoteInfo.bind(this)}
                        quote={this.state.currentQuote}
                        quoteFrequency={this.state.options.quoteFrequency}
                        showSns={this.state.showFeatures.showSns}
                    />
                </div>
                }
                {this.state.showText
                && <div className="row bottom-row">
                    {this.state.wallpaperData
                    && <WallpaperInfo
                        wallpaperInfoClassName={this.state.responsiveWPI}
                        wallpaperData={this.state.wallpaperData}
                        toggleLike={this.toggleLike.bind(this)}
                    />
                    }
                </div>
                }
            </main>
        );
    }
}

export default App;
