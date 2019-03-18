import {join} from 'path';
import {mkdir, writeFile} from 'fs-extra';

import xmlDocumentToDocumentBudgetaire from '../src/shared/js/finance/xmlDocumentToDocumentBudgetaire';
import makeNatureToChapitreFI from '../src/shared/js/finance/makeNatureToChapitreFI';

import {readXmlFilesInDir} from './make-doc-budg-strings.js';

const SOURCE_COMPTES_DIR = process.env.SOURCE_COMPTES_DIR;
const SOURCE_CA_DIR = process.env.SOURCE_CA_DIR;
const BUILD_FINANCE_DIR = process.env.BUILD_FINANCE_DIR;

const natureToChapitreFIP = readXmlFilesInDir(SOURCE_COMPTES_DIR).then(makeNatureToChapitreFI);


mkdir(BUILD_FINANCE_DIR)
.catch(err => {
    // ignore if folder already exists
    if(err.code !== 'EEXIST') { throw err; }
})
.then(() => readXmlFilesInDir(SOURCE_CA_DIR))
.then(files => {
    natureToChapitreFIP
        .then(natureToChapitreFI => {
            return files
                .map(doc => xmlDocumentToDocumentBudgetaire(doc, natureToChapitreFI))

        })
        .then(docBudgs => JSON.stringify(docBudgs, null, 2))
        .then(str => writeFile(join(BUILD_FINANCE_DIR, 'doc-budgs.json'), str, 'utf-8'))

})
.catch(err => {
    console.error('err', err);
    process.exit(1);
})
