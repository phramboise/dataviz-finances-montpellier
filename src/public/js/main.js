import { createStore } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Record, Map as ImmutableMap, List, Set as ImmutableSet } from 'immutable';
import { csvParse } from 'd3-dsv';
import page from 'page';

import {assets, COMPTES_ADMINISTRATIFS, AGGREGATED_ATEMPORAL, AGGREGATED_TEMPORAL, CORRECTIONS_AGGREGATED} from './constants/resources';
import reducer from './reducer';

import {LigneBudgetRecord, DocumentBudgetaire} from 'document-budgetaire/Records.js';
import csvStringToCorrections from '../../shared/js/finance/csvStringToCorrections.js';
import {childToParent, elementById} from '../../shared/js/finance/flatHierarchicalById.js';

import Breadcrumb from '../../shared/js/components/Breadcrumb';
import Home from './components/screens/Home';
import FinanceElement from './components/screens/FinanceElement';
import FocusSolidarity from './components/screens/FocusSolidarity';
import FocusInvestments from './components/screens/FocusInvestments';
import FocusPresence from './components/screens/FocusPresence';

import ExploreBudget from './components/screens/ExploreBudget';

import { HOME, SOLIDARITES, INVEST, PRESENCE } from './constants/pages';
import {
    DOCUMENTS_BUDGETAIRES_RECEIVED, CORRECTION_AGGREGATION_RECEIVED,
    ATEMPORAL_TEXTS_RECEIVED, TEMPORAL_TEXTS_RECEIVED,
    FINANCE_DETAIL_ID_CHANGE,
} from './constants/actions';


import {fonctionLabels} from '../../../build/finances/m52-strings.json';


/**
 *
 * Initialize Redux store + React binding
 *
 */
const REACT_CONTAINER_SELECTOR = '.finance-dataviz-container';
const CONTAINER_ELEMENT = document.querySelector(REACT_CONTAINER_SELECTOR);

// Breadcrumb
const BREADCRUMB_CONTAINER = document.body.querySelector('.breadcrumb-container');

const DEFAULT_BREADCRUMB = List([
    {
        text: 'Explorer les comptes',
        url: '#'
    }
]);


const StoreRecord = Record({
    docBudgByYear: undefined,
    corrections: undefined,
    currentYear: undefined,
    explorationYear: undefined,
    // ImmutableMap<id, FinanceElementTextsRecord>
    textsById: undefined,
    financeDetailId: undefined,
    screenWidth: undefined
});

const store = createStore(
    reducer,
    new StoreRecord({
        docBudgByYear: new ImmutableMap(),
        currentYear: 2017,
        explorationYear: 2017,
        financeDetailId: undefined,
        textsById: ImmutableMap([[HOME, {label: 'Accueil'}]]),
        screenWidth: window.innerWidth
    })
);



store.dispatch({
    type: ATEMPORAL_TEXTS_RECEIVED,
    textList: Object.keys(fonctionLabels)
        .map(fonction => ({
            id: `M52-DF-${fonction}`,
            label: fonctionLabels[fonction]
        }))
});
store.dispatch({
    type: ATEMPORAL_TEXTS_RECEIVED,
    textList: Object.keys(fonctionLabels)
        .map(fonction => ({
            id: `M52-DI-${fonction}`,
            label: fonctionLabels[fonction]
        }))
});



/**
 *
 * Fetching initial data
 *
 */
fetch(assets[CORRECTIONS_AGGREGATED]).then(resp => resp.text())
.then(csvStringToCorrections)
.then(corrections => {
    store.dispatch({
        type: CORRECTION_AGGREGATION_RECEIVED,
        corrections
    });
});


fetch(assets[COMPTES_ADMINISTRATIFS]).then(resp => resp.json())
.then(docBudgs => {
    docBudgs = docBudgs.map(db => {
        db.rows = new ImmutableSet(db.rows.map(LigneBudgetRecord))
        return DocumentBudgetaire(db)
    })

    store.dispatch({
        type: DOCUMENTS_BUDGETAIRES_RECEIVED,
        docBudgs,
    });
});


fetch(assets[AGGREGATED_ATEMPORAL]).then(resp => resp.text())
.then(csvParse)
.then(textList => {
    store.dispatch({
        type: ATEMPORAL_TEXTS_RECEIVED,
        textList
    });
});

fetch(assets[AGGREGATED_TEMPORAL]).then(resp => resp.text())
.then(csvParse)
.then(textList => {
    store.dispatch({
        type: TEMPORAL_TEXTS_RECEIVED,
        textList
    });
});



/**
 *
 * Routing
 *
 */

page('/', () => {
    console.log('in route', '/')

    ReactDOM.render(
        React.createElement(
            Provider,
            { store },
            React.createElement(Home)
        ),
        CONTAINER_ELEMENT
    );

    const breadcrumb = DEFAULT_BREADCRUMB;
    ReactDOM.render( React.createElement(Breadcrumb, { items: breadcrumb }), BREADCRUMB_CONTAINER );
});


page('/explorer', () => {
    console.log('in route', '/explorer');

    ReactDOM.render(
        React.createElement(
            Provider,
            { store },
            React.createElement(ExploreBudget)
        ),
        CONTAINER_ELEMENT
    );


    const breadcrumb = DEFAULT_BREADCRUMB.push({text: 'Explorer'});
    ReactDOM.render( React.createElement(Breadcrumb, { items: breadcrumb }), BREADCRUMB_CONTAINER );
});


page('/finance-details/:contentId', ({params: {contentId}}) => {
    console.log('in route', '/finance-details', contentId)
    scrollTo(0, 0);

    store.dispatch({
        type: FINANCE_DETAIL_ID_CHANGE,
        financeDetailId: contentId
    })

    ReactDOM.render(
        React.createElement(
            Provider,
            { store },
            React.createElement(FinanceElement)
        ),
        CONTAINER_ELEMENT
    );

    const breadcrumbData = [];

    let currentContentId = contentId.startsWith('M52-') ?
        contentId.slice(7) :
        contentId;

    while(currentContentId){
        if(currentContentId !== 'Total'){
            breadcrumbData.push({
                text: elementById.get(currentContentId).label,
                url: `#!/finance-details/${currentContentId}`
            })
        }
        currentContentId = childToParent.get(currentContentId);
    }

    breadcrumbData.push({
        text: 'Explorer',
        url: `#!/explorer`
    })

    const breadcrumb = DEFAULT_BREADCRUMB.concat(breadcrumbData.reverse());

    ReactDOM.render( React.createElement(Breadcrumb, { items: breadcrumb }), BREADCRUMB_CONTAINER );

});

page(`/focus/${SOLIDARITES}`, () => {
    console.log('in route', `/focus/${SOLIDARITES}`);
    scrollTo(0, 0);

    ReactDOM.render(
        React.createElement(
            Provider,
            { store },
            React.createElement(FocusSolidarity)
        ),
        CONTAINER_ELEMENT
    );
});

page(`/focus/${INVEST}`, () => {
    console.log('in route', `/focus/${INVEST}`);
    scrollTo(0, 0);

    ReactDOM.render(
        React.createElement(
            Provider,
            { store },
            React.createElement(FocusInvestments)
        ),
        CONTAINER_ELEMENT
    );
});

page(`/focus/${PRESENCE}`, () => {
    console.log('in route', `/focus/${PRESENCE}`);
    scrollTo(0, 0);

    ReactDOM.render(
        React.createElement(
            Provider,
            { store },
            React.createElement(FocusPresence)
        ),
        CONTAINER_ELEMENT
    );
});

page('*', (ctx) => {
    console.error('Page introuvable %o', ctx);
});

page.base(location.pathname);
page.strict(true);

page({ hashbang: true });
