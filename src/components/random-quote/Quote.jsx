import React, { Component } from 'react';
import axios from 'axios';
import { QUOTE_API_URL } from 'Constants/constants';
import { addToLocalStorage, localStorageKeyExists, getFromLocalStorage, getCurrentTime } from 'Utils/utilities';
import 'Stylesheets/quote.css';
import quoteListJson from 'Json/quote.json';
import TwitterLink from './twitter.jsx';

class Quote extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentQuote: {
        quoteText: '',
        authorName: '',
        id: '',
      },
      showQuote: false,
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

  showQuote() {
      this.setState({
          showQuote: true,
      });
  }

  componentDidMount() {
      if (localStorageKeyExists('quote') && !this.checkFrequency()) {
        const currentQuote = getFromLocalStorage('quote');
        this.setState({
          currentQuote,
        });
        this.props.updateQuoteInfo(currentQuote);
        this.showQuote();
    } else {
      axios.get(QUOTE_API_URL)
        .then((response) => {
          const currentQuote = {
            quoteText: response.data.quoteText,
            authorName: response.data.authorName || '익명',
            id: response.data.quoteId,
          };
          this.setState({
            currentQuote,
          });
          addToLocalStorage('quote', currentQuote);
          addToLocalStorage('quoteTimeStamp', getCurrentTime());
          this.props.updateQuoteInfo(currentQuote);
        })
       .catch(error => {
           console.error('error getting quote from server', error);
           let index = Math.floor(Math.random() * quoteListJson.length);
           const currentQuote = {
               quoteText : quoteListJson[index].quoteText,
               authorName : quoteListJson[index].authorName,
           };
           this.setState({
               currentQuote,
           });
           this.props.updateQuoteInfo(currentQuote);
       })
       .finally(() => {
           this.showQuote();
       });
    }
  }

  render() {
    return (
      <div className="quote-container">
        <div>{this.state.currentQuote.quoteText}</div>
          {this.state.showQuote
          && <div className='author-container'>
                <div>{this.state.currentQuote.authorName}</div>
              </div>}
        {this.props.showSns && this.state.showQuote
        && <TwitterLink
            quoteText={this.props.quote.quoteText}
            authorName={this.props.quote.authorName}
        />
        }
      </div>
    );
  }
}

export default Quote;
