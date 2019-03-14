import {join} from 'path';
import * as fs from 'fs-extra';
import xmlBufferToString from 'xml-buffer-tostring';
import {DOMParser} from 'xmldom';

const {readFile, writeFile} = fs;

const SOURCE_FINANCE_DIR = process.env.SOURCE_FINANCE_DIR;
const BUILD_FINANCE_DIR = process.env.BUILD_FINANCE_DIR;


const natureToChapitreFIP = new Promise((resolve, reject) =>
    fs.readdir(SOURCE_FINANCE_DIR, (err, items) => resolve(Promise.all(items
        .filter(item => item.endsWith('.xml'))
        .map(f => readFile(join(SOURCE_FINANCE_DIR, f), 'utf-8')
            .then(str => (new DOMParser()).parseFromString(str, "text/xml")))
    )))
).then(plansDeComptes => {

    // sort with most recent years first
    plansDeComptes = plansDeComptes.sort((pc1, pc2) => {
        const [year1, year2] = [pc1, pc2].map(
            p => Number(p.getElementsByTagName('Nomenclature')[0].getAttribute('Exer'))
        )

        return year2 - year1;
    })

    const natureLabels = {}
    const fonctionLabels = {}

    for(const pc of plansDeComptes){
        const comptes = Array.from(pc.getElementsByTagName('Compte'));

        comptes.forEach(c => {
            const code = c.getAttribute('Code')

            if(!(code in natureLabels))
                natureLabels[code] = c.getAttribute('Libelle')
        })

        const fonctions = Array.from(pc.getElementsByTagName('RefFonc'));

        fonctions.forEach(c => {
            const code = c.getAttribute('Code')

            if(!(code in fonctionLabels))
                fonctionLabels[code] = c.getAttribute('Libelle')
        })
    }

    return {
        natureLabels,
        fonctionLabels
    }
})
.then( docBudgs => JSON.stringify(docBudgs, null, 2) )
.then(str => writeFile(join(BUILD_FINANCE_DIR, 'finance-strings.json'), str, {encoding: 'utf8'}))
.catch(err => {
    console.error('make-doc-budg-strings', err)
    process.exit(1)
})
