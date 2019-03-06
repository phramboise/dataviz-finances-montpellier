import {join} from 'path';
import * as fs from 'fs-extra';
import {DOMParser} from 'xmldom';

import xmlDocumentToDocumentBudgetaire from '../src/shared/js/finance/xmlDocumentToDocumentBudgetaire';
import makeNatureToChapitreFI from '../src/shared/js/finance/makeNatureToChapitreFI';

const {mkdir, readFile, writeFile} = fs;

const BUILD_FINANCE_DIR = './build/finances';
const SOURCE_FINANCE_DIR = './data/finances';


const natureToChapitreFIP = Promise.all([
    'plan-de-compte-M14-M14_COM_SUP3500-2016.xml',
    'plan-de-compte-M14-M14_COM_SUP3500-2017.xml',
].map(f => {
    return readFile(join(SOURCE_FINANCE_DIR, 'plansDeCompte', f), {encoding: 'utf-8'})
    .then( str => {
        return (new DOMParser()).parseFromString(str, "text/xml");
    })
}))
.then(makeNatureToChapitreFI);



mkdir(BUILD_FINANCE_DIR)
.catch(err => {
    if(err.code === 'EEXIST'){
        return; // ignore
    }

    throw err;
})
.then( () => {
    return Promise.all([
        'CA 2016.xml',
        'CA 2017.xml',
    ].map(f => {
        return readFile(join(SOURCE_FINANCE_DIR, 'CA', f), {encoding: 'utf-8'})
        .then( str => {
            return (new DOMParser()).parseFromString(str, "text/xml");
        })
        .then(doc => {
            return natureToChapitreFIP.then(natureToChapitreFI => {
                return xmlDocumentToDocumentBudgetaire(doc, natureToChapitreFI)
            })
        })
    }))
    .then( docBudgs => JSON.stringify(docBudgs, null, 2) )
    .then(str => writeFile(join(BUILD_FINANCE_DIR, 'doc-budgs.json'), str, 'utf-8'))

})
.catch(err => {
    console.error('err', err);
    process.exit(1);
})
