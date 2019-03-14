import {join} from 'path';
import * as fs from 'fs-extra';
import {DOMParser} from 'xmldom';

import xmlDocumentToDocumentBudgetaire from '../src/shared/js/finance/xmlDocumentToDocumentBudgetaire';
import makeNatureToChapitreFI from '../src/shared/js/finance/makeNatureToChapitreFI';

const {mkdir, readFile, writeFile} = fs;

const SOURCE_FINANCE_DIR = process.env.SOURCE_FINANCE_DIR;
const BUILD_FINANCE_DIR = process.env.BUILD_FINANCE_DIR;

const PLANS_DE_COMPTE_DIR = join(SOURCE_FINANCE_DIR, 'plansDeCompte');
const CA_DIR = join(SOURCE_FINANCE_DIR, 'CA');


const natureToChapitreFIP = new Promise((resolve, reject) =>
    fs.readdir(PLANS_DE_COMPTE_DIR, (err, items) => resolve(Promise.all(items
        .filter(item => item.endsWith('.xml'))
        .map(f => readFile(join(PLANS_DE_COMPTE_DIR, f), 'utf-8')
            .then(str => (new DOMParser()).parseFromString(str, "text/xml")))
    )))
)
.then(makeNatureToChapitreFI);


mkdir(BUILD_FINANCE_DIR)
.catch(err => {
    // ignore if folder already exists
    if(err.code !== 'EEXIST') { throw err; }
})
.then(() => {
    new Promise((resolve, reject) =>
        fs.readdir(CA_DIR, (err, items) => resolve(Promise.all(items
            .filter(item => item.endsWith('.xml'))
            .map(f => fs.readFile(join(SOURCE_FINANCE_DIR, 'CA', f), 'utf-8')
                .then(str => (new DOMParser()).parseFromString(str, "text/xml"))
                .then(doc => natureToChapitreFIP
                    .then(natureToChapitreFI =>
                        xmlDocumentToDocumentBudgetaire(doc, natureToChapitreFI)
                    )
                )
            )
        )))
    )
    .then(docBudgs => JSON.stringify(docBudgs, null, 2))
    .then(str => writeFile(join(BUILD_FINANCE_DIR, 'doc-budgs.json'), str, 'utf-8'))
})
.catch(err => {
    console.error('err', err);
    process.exit(1);
})
