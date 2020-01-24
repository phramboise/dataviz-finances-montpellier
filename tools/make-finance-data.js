import {join} from 'path';
import {mkdir, writeFile, readFile} from 'fs-extra';
import {csvParse} from 'd3-dsv'

import xmlDocumentToDocumentBudgetaire from '../src/shared/js/finance/xmlDocumentToDocumentBudgetaire';
import makeNatureToChapitreFI from '../src/shared/js/finance/makeNatureToChapitreFI';
import makeAggregateFunction from '../src/shared/js/finance/makeAggregateFunction';

import MontreuilNomenclatureToAggregationDescription from '../src/public/js/MontreuilNomenclatureToAggregationDescription.js'

import {readXmlFilesInDir} from './make-doc-budg-strings.js';

const SOURCE_COMPTES_DIR = process.env.SOURCE_COMPTES_DIR;
const SOURCE_CA_DIR = process.env.SOURCE_CA_DIR;
const BUILD_FINANCE_DIR = process.env.BUILD_FINANCE_DIR;

const natureToChapitreFIP = readXmlFilesInDir(SOURCE_COMPTES_DIR).then(makeNatureToChapitreFI);

const montreuilNomenclatureP = readFile(join(__dirname, '../data/agrégation-montreuil.csv'), {encoding: 'utf8'})
.then(csvParse)


mkdir(BUILD_FINANCE_DIR)
.catch(err => {
    // ignore if folder already exists
    if(err.code !== 'EEXIST') { throw err; }
})
.then(() => readXmlFilesInDir(SOURCE_CA_DIR))
.then(files => {
    return natureToChapitreFIP
        .then(natureToChapitreFI => {
            return files
                .map(doc => {
                    const res = xmlDocumentToDocumentBudgetaire(doc, natureToChapitreFI)
                    console.log('xmlDocumentToDocumentBudgetaire', res)
                    return res
                })

        })
})
.then(documentBudgetaires => {
    return montreuilNomenclatureP
    .then((montreuilNomenclature) => MontreuilNomenclatureToAggregationDescription(montreuilNomenclature, documentBudgetaires))
    .then(aggregationDescription => {
        return {
            documentBudgetaires,
            aggregations: documentBudgetaires.map(docBudg => ({
                year: docBudg['Exer'],
                aggregation: makeAggregateFunction(aggregationDescription)(docBudg)
            }))
        }
    });
})
.then(data => writeFile(join(BUILD_FINANCE_DIR, 'finance-data.json'), JSON.stringify(data, null, 2), 'utf-8'))
.catch(err => {
    console.error('Erreur dans la création du JSON des données de financières', err);
    process.exit(1);
})
