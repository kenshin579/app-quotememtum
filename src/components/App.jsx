import React from 'react';
import SettingsIcon from 'Settings/SettingsIcon.jsx';
import SettingsModal from 'Settings/SettingsModal.jsx';
import Wallpaper from 'Components/Wallpaper.jsx';
import WallpaperInfo from 'Components/WallpaperInfo.jsx';
import Clock from 'Components/clock/Clock.jsx';
import Quote from 'Components/random-quote/Quote.jsx';
import 'Stylesheets/index.css';
import {
    initializeLocalStorage,
    localStorageKeyExists,
    addToLocalStorage,
    getFromLocalStorage,
    updateLocalStorageObjProp,
    addToLocalStorageArray,
    removeFromLocalStorageArray
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
            askNameStyle: {
                label: 'askName-label',
                input: 'askName-input',
            },
            currentQuote,
            showFeatures: userSettings.showFeatures,
            options: userSettings.options,
            responsiveWPI: 'wallpaper-info-container hide700',
            responsiveQuote: 'quote-container hide700',
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

    displayFavQuote(currentDisplayedQuote, selectedQuoteId) {
        if (currentDisplayedQuote.id !== selectedQuoteId) {
            const newDisplayQuote = this.state.arrLikedQuotes.find(quote => quote.id === selectedQuoteId);
            const currentQuote = newDisplayQuote;
            addToLocalStorage('quote', newDisplayQuote);
            this.setState({
                currentQuote,
            });
        }
    }

    displayFavWallpaper(currentDisplayedWallpaper, selectedWallpaperId) {
        if (currentDisplayedWallpaper.id !== selectedWallpaperId) {
            const wallpaperData = this.state.arrLikedWallpapers.find(wallpaper => wallpaper.id === selectedWallpaperId);
            addToLocalStorage('wallpaper', wallpaperData);
            this.setState({
                wallpaperData,
            });
        }
    }

    toggleLike(likeStatus, objId, type) {
        if (type === 'quote') {
            const currentQuote = updateLocalStorageObjProp('quote', 'liked', likeStatus);
            if (currentQuote.id === objId) {
                this.setState({currentQuote}, () => {
                    if (likeStatus) {
                        const arrLikedQuotes = addToLocalStorageArray('arrLikedQuotes', this.state.currentQuote);
                        this.setState({
                            arrLikedQuotes,
                        });
                    } else {
                        const arrLikedQuotes = removeFromLocalStorageArray('arrLikedQuotes', 'id', objId);
                        this.setState({
                            arrLikedQuotes,
                        });
                    }
                });
            } else {
                const arrLikedQuotes = removeFromLocalStorageArray('arrLikedQuotes', 'id', objId);
                this.setState({
                    arrLikedQuotes,
                });
            }
        } else if (type === 'wallpaper') {
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

    toggleShow(e) {
        const target = e.target.id.slice(0, -7).concat('ClassName');
        if (target === 'quoteClassName') {
            const newState = this.state.responsiveQuote === 'quote-container hide700' ? 'quote-container' : 'quote-container hide700';
            const newToggleState = this.state.quoteToggle === 'Quote' ? 'X' : 'Quote';
            this.setState({
                responsiveQuote: newState,
                quoteToggle: newToggleState,
                responsiveWPI: 'wallpaper-info-container hide700',
                wpiToggle: 'Pic Info',
            });
        } else {
            const newState = this.state.responsiveWPI === 'wallpaper-info-container hide700' ? 'wallpaper-info-container' : 'wallpaper-info-container hide700';
            const newToggleState = this.state.wpiToggle === 'Pic Info' ? 'X' : 'Pic Info';
            this.setState({
                responsiveWPI: newState,
                wpiToggle: newToggleState,
                responsiveQuote: 'quote-container hide700',
                quoteToggle: 'Quote',
            });
        }
    }

    render() {
        return (
            <main id="main">
                <Wallpaper
                    updateWallpaperInfo={this.updateWallpaperInfo.bind(this)}
                    showText={this.showText.bind(this)}
                    wallpaperData={this.state.wallpaperData}
                />
                {this.state.showSettingsModal &&
                <SettingsModal
                    closeModal={this.toggleSettingsModal.bind(this)}
                    toggleFeature={e => this.toggleFeature(e)}
                    showFeatures={this.state.showFeatures}
                    options={this.state.options}
                    changeOption={e => this.changeOption(e)}
                    toggleLike={this.toggleLike.bind(this)}
                    displayFavQuote={this.displayFavQuote.bind(this)}
                    displayFavWallpaper={this.displayFavWallpaper.bind(this)}
                    quote={this.state.currentQuote}
                    arrLikedQuotes={this.state.arrLikedQuotes}
                    wallpaperData={this.state.wallpaperData}
                    arrLikedWallpapers={this.state.arrLikedWallpapers}
                />
                }
                {this.state.showText &&
                <div className="row top-row">
                    <div>
                        <Clock
                            showFocus={this.state.showFeatures.showFocus}
                            clockFormat={this.state.options.clockFormat} />
                        <SettingsIcon toggleSettingsModal={this.toggleSettingsModal.bind(this)} />
                    </div>
                </div>
                }
                {this.state.showText &&
                <div className="row middle-row">
                    {this.state.showFeatures.showQuote &&
                    <Quote
                        quoteClassName={this.state.responsiveQuote}
                        updateQuoteInfo={this.updateQuoteInfo.bind(this)}
                        toggleLike={this.toggleLike.bind(this)}
                        quote={this.state.currentQuote}
                        quoteFrequency={this.state.options.quoteFrequency}
                    />
                    }
                </div>
                }
                {this.state.showText &&
                <div className="row bottom-row">
                    {/*<div className="toggle-div show700">*/}
                        {/*<div id="wallpaperInfo-toggle" onClick={this.toggleShow.bind(this)}>{this.state.wpiToggle}</div>*/}
                        {/*<div id="quote-toggle" onClick={this.toggleShow.bind(this)}>{this.state.quoteToggle}</div>*/}
                    {/*</div>*/}
                    {this.state.wallpaperData &&
                    <WallpaperInfo
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

export default  App;