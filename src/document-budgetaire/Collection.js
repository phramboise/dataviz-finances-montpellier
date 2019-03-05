import {Set as ImmutableSet} from 'immutable'
import {LigneBudgetRecord, DocumentBudgetaire} from './Records.js';

/**
 * [getDocumentBudgetairesFromData description]
 * @param  {Array.JSON} docBudgs A JSON parsed structure from build/finances/doc-budgs.json
 * @return {Array.<DocumentBudgetaire>} [description]
 */
export function getDocumentBudgetairesFromData (docBudgs) {
    return docBudgs.map(d => {
        d.rows = new ImmutableSet( d.rows.map(LigneBudgetRecord) )
        return DocumentBudgetaire(d)
    });
}
