import React, { Component } from 'react';
import axios from 'axios';
import { addToLocalStorage, localStorageKeyExists, getFromLocalStorage, getCurrentTime, objIsInArray } from 'Utils/utilities';
import 'Stylesheets/quote.css';
import TwitterLink from './twitter.jsx';

class Quote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentQuote: {
        quoteText: '',
        authorName: '',
        id: ''
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.state !== nextProps.quote) {
      const currentQuote = nextProps.quote;
      this.setState({
        currentQuote,
      });
    }
  }

  checkFrequency() {
    const currentTime = getCurrentTime();
    const quoteTimeStamp = getFromLocalStorage('quoteTimeStamp');
    const timeInterval = currentTime - quoteTimeStamp;
    const { quoteFrequency } = this.props;
    let quoteFrequencyMili;
    switch (true) {
      case quoteFrequency === '2hour':
        quoteFrequencyMili = 7200000;
        break;
      case quoteFrequency === '6hour':
        quoteFrequencyMili = 21600000;
        break;
      case quoteFrequency === '12hour':
        quoteFrequencyMili = 43200000;
        break;
      default:
        quoteFrequencyMili = 21600000;
        break;
    }
    return timeInterval >= quoteFrequencyMili;
  }

  componentDidMount() {
    const URL = 'http://quote.advenoh.pe.kr/api/quotes/random';
      if (localStorageKeyExists('quote') && !this.checkFrequency()) {
        const currentQuote = getFromLocalStorage('quote');
        this.setState({
          currentQuote,
        });
        this.props.updateQuoteInfo(currentQuote);
    } else {
      axios.get(URL)
        .then((response) => {
          const currentQuote = {
            quoteText: response.data.quoteText,
            authorName: response.data.authorName,
            id: response.data.quoteId
          };
          this.setState({
            currentQuote,
          });
          addToLocalStorage('quote', currentQuote);
          addToLocalStorage('quoteTimeStamp', getCurrentTime());
          this.props.updateQuoteInfo(currentQuote);
        });
    }
  }

  render() {
    return (
      <div className="quote-container">
        <div>{this.state.currentQuote.quoteText}</div>
        <div className='author-container'>
          <div>{this.state.currentQuote.authorName}</div>
        </div>
        <TwitterLink
            quoteText={this.props.quote.quoteText}
            authorName={this.props.quote.authorName}
        />
      </div>
    );
  }
}

export default Quote;
