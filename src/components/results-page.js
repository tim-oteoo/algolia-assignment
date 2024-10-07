import algoliasearch from 'algoliasearch';
import instantsearch from 'instantsearch.js';
import { searchBox, hits, pagination, refinementList, rangeSlider, ratingMenu, sortBy } from 'instantsearch.js/es/widgets';
import { ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY, ALGOLIA_INDEX_NAME } from '../config';
import aa from 'search-insights';
import resultHit from '../templates/result-hit';

class ResultPage {
  constructor() {
    this._registerClient();
    this._registerWidgets();
    this._startSearch();
  }

  _registerClient() {
    this._searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);

    this._searchInstance = instantsearch({
      indexName: ALGOLIA_INDEX_NAME,
      searchClient: this._searchClient,
      insights: true,
    });
  }

  _registerWidgets() {
    this._searchInstance.addWidgets([
      searchBox({
        container: '#searchbox',
        cssClasses: {
          input: 'searchbox-input',
        },
        placeholder: 'Search products...',
      }),
      hits({
        container: '#hits',
        templates: {
          item: resultHit,
        },
      }),
      pagination({
        container: '#pagination',
      }),
      refinementList({
        container: '#brand-facet',
        attribute: 'brand',
      }),
      refinementList({
        container: '#categories-facet',
        attribute: 'categories',
      }),
      rangeSlider({
        container: '#price-range',
        attribute: 'price',
        tooltips: {
          format(value) {
            return `$${value.toFixed(2)}`;
          },
        },
      }),
      ratingMenu({
        container: '#rating-menu',
        attribute: 'rating',
        max: 5,
      }),
      sortBy({
        container: '#sort-by',
        items: [
          { label: 'Default', value: ALGOLIA_INDEX_NAME },
          { label: 'Price: Low to High', value: 'sale_products_price_asc' },
          { label: 'Price: High to Low', value: 'sale_products_price_desc' },
          { label: 'Rating', value: 'sale_products_rating_desc' },
          { label: 'Popularity', value: 'sale_products_popularity_desc' },
        ],
      }),
    ]);
  }

  _startSearch() {
    this._searchInstance.start();
    this._setupEventListeners();
    this._trackInitialImpressions();
  }

  _setupEventListeners() {
    this._attachEvent('#hits', 'click', this._handleHitClick.bind(this));
    this._attachEvent('#searchbox input', 'input', this._trackSearch.bind(this));
  }

  _attachEvent(selector, event, handler) {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener(event, handler);
    } else {
      console.error(`${selector} not found.`);
    }
  }

  _handleHitClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const objectID = button.dataset.objectId;
    const userToken = localStorage.getItem('algolia_user_token');
    const queryID = event.target.closest('.ais-Hits-item')?.dataset.queryId;

    if (!userToken || !objectID) {
      console.error('Missing the required information, either userToken or objectID for tracking.');
      return;
    }

    const eventData = {
      userToken,
      index: ALGOLIA_INDEX_NAME,
      objectIDs: [objectID],
      queryID: queryID,
    };

    if (action === 'view') {
      this._sendEvent('clickedObjectIDsAfterSearch', eventData, 'Product Viewed');
    } else if (action === 'cart') {
      this._sendEvent('convertedObjectIDsAfterSearch', eventData, 'Product Added to Cart');
    }
  }

  _sendEvent(eventType, data, eventName) {
    aa(eventType, {
      ...data,
      eventName,
    }).catch(error => console.error('Event error:', error));
  }

  _trackSearch(event) {
    const query = event.target.value;
    const userToken = localStorage.getItem('algolia_user_token');

    if (!userToken || !query) {
      console.error('Missing userToken or query for tracking search.');
      return;
    }

    aa('search', {
      eventName: 'Search Executed',
      index: ALGOLIA_INDEX_NAME,
      userToken: userToken,
      query: query,
    }).catch(error => console.error('Event error:', error));
  }

  _trackInitialImpressions() {
    const hits = document.querySelectorAll('.ais-Hits-item');
    const displayedProductIDs = Array.from(hits).map(hit => hit.dataset.objectId);

    if (displayedProductIDs.length) {
      const userToken = localStorage.getItem('algolia_user_token');
      if (!userToken) {
        console.error('The userToken was not found for tracking impressions.');
        return;
      }
      aa('viewedObjectIDs', {
        eventName: 'Product Impression',
        index: ALGOLIA_INDEX_NAME,
        objectIDs: displayedProductIDs,
        userToken: userToken,
      }).catch(error => console.error('Event error:', error));
    }
  }
}

export default ResultPage;
