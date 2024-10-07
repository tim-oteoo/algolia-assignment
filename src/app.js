import aa from 'search-insights';
import { ALGOLIA_APP_ID, ALGOLIA_INSIGHTS_API_KEY } from './config';
import ResultsPage from './components/results-page';

class SpencerAndWilliamsSearch {
  constructor() {
    this._initInsights();
    document.addEventListener('DOMContentLoaded', () => this._initSearch());
  }

  _initInsights() {
    if (!localStorage.getItem('algolia_user_token')) {
      localStorage.setItem('algolia_user_token', this._generateUserToken());
    }

    aa('init', {
      appId: ALGOLIA_APP_ID,
      apiKey: ALGOLIA_INSIGHTS_API_KEY,
      userToken: localStorage.getItem('algolia_user_token'),
      useCookie: true,
      cookieAttributes: {
        secure: true,
        sameSite: 'Lax'
      }
    });
  }

  _generateUserToken() {
    return 'user_' + Math.random().toString(36).substring(2, 15);
  }

  _initSearch() {
    new ResultsPage();
  }
}

new SpencerAndWilliamsSearch();
