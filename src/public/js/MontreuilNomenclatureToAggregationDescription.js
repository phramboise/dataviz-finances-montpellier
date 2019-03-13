import { Set as ImmutableSet, Map as ImmutableMap } from 'immutable';

import { AggregationLeaf, AggregationDescription } from '../../shared/js/finance/AggregationDataStructures.js'

const FORMULA_MAP = {
    'DEPENSE': 'D',
    'RECETTE': 'R',
    'INVESTISSEMENT': 'I',
    'FONCTIONNEMENT': 'F',
}

function makeFormulaFromMontreuilRows(rows){
    return rows.toJS()
        .map(r => {
            const RDFI = FORMULA_MAP[r['Sens']] + FORMULA_MAP[r['Section']]
            // the two following lines seem to have weird characters in the property names
            // I've copied-pasted the values from agregation-Montreuil-v4
            // if only rewriting by hand via easily-accessible keyboard keys, it does not work :-/
            const fonction = r["Fonction - Code"]
            const nature = r['Nature - Code']

            return `${RDFI}*F${fonction}*N${nature}`
        })
        .join(' + ')
}

function getMontreuilNomenclatureRowKeys(MontreuilNomenclatureRow){
    return [
        'Sens',
        'Section',
        'Niveau 2 - Catégorie',
        'Niveau 3 - Type',
        'Niveau a - Politique',
        'Niveau b - Sous Politique'
    ].map(key => MontreuilNomenclatureRow[key])
}

function nomenclatureNodeToAggregationNode(node, name){
    if(ImmutableMap.isMap(node)){
        return new AggregationDescription({
            id: name,
            label: name,
            children: new ImmutableSet(
                node.entrySeq()
                    .map(([childName, node]) => nomenclatureNodeToAggregationNode(node, name+' '+childName)))
        })
    }
    else{
        // ImmutableSet.isSet(node) === true
        return new AggregationLeaf({
            id: name,
            label: name,
            formula: makeFormulaFromMontreuilRows(node)
        })
    }
}

export default function MontreuilNomenclatureToAggregationDescription(montreuilNomenclature){
    let map = new ImmutableMap()

    montreuilNomenclature = montreuilNomenclature
        .filter(r => r["Nature Mvt"] === "REELLE")
        //.slice(11000, 12000) // TODO remove this, this is for testing purposes only

    for(const row of montreuilNomenclature){
        map = map.updateIn(getMontreuilNomenclatureRowKeys(row), val => val ? val.add(row) : new ImmutableSet([row]))
    }
    
    return nomenclatureNodeToAggregationNode(map, 'Budget Montreuil');
}