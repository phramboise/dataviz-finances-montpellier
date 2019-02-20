import React from 'react'

import M52Viz from '../../../shared/js/components/M52Viz';
import M52HierarchyViz from './M52HierarchyViz.js';
import TextualSelected from './TextualSelected';
import RDFISelector from './RDFISelector';
import DepartmentFinanceHeader from './DepartmentFinanceHeader';

import {M52_INSTRUCTION} from '../../../shared/js/finance/constants';

/*
    rdfi, dfView,
    documentBudgetaire, aggregatedInstruction,
    M52Hierarchical, M52OveredNodes,
    aggregatedHierarchical, aggregatedOveredNodes,
    over
*/

export default function({
        rdfi, dfView,
        documentBudgetaire,
        M52Hierarchical, M52HighlightedNodes,
        M52ByNature, M52ByNatureHighlightedNodes,
        selection,
        onM52NodeOvered, onM52ByNatureNodeOvered,
        onM52NodeSelected, onM52ByNatureNodeSelected,
        onRDFIChange,
        onNewM52CSVFile
    }){

    if (!documentBudgetaire) {
        return null;
    }

    const onChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = e => onNewM52CSVFile(e.target.result);
            // TODO error case
        }
    }

    return <div className="top-level">
        <DepartmentFinanceHeader LibelleColl={documentBudgetaire.LibelleColl}
                                 Exer={documentBudgetaire.Exer}
                                 NatDec={documentBudgetaire.NatDec}>
            <label>
                Fichier XML au format <code>&lt;DocumentBudgetaire&gt;</code>:
                <input type="file" onChange={onChange} />
            </label>
        </DepartmentFinanceHeader>

        <h1>Hiérarchie par Fonction</h1>

        <section>
            <M52Viz M52Hierarchical={M52Hierarchical}
                    M52HighlightedNodes={M52HighlightedNodes}
                    selectedNode={selection && selection.type === M52_INSTRUCTION ? selection.node : undefined}
                    onSliceOvered={onM52NodeOvered}
                    onSliceSelected={onM52NodeSelected}
                    width={450}
                    height={450}
            />
            <RDFISelector rdfi={rdfi} onRDFIChange={onRDFIChange} />
            <M52HierarchyViz    M52Hierarchical={M52Hierarchical}
                                M52HighlightedNodes={M52HighlightedNodes}
                                selectedNode={selection && selection.type === M52_INSTRUCTION ? selection.node : undefined}
                                width={450}
                                height={450}
            />

        </section>
        <TextualSelected selection={selection} />
    </div>

}
