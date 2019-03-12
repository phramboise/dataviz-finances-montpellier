import { Record } from 'immutable';

/*

interface AggregationDescription extends AggregationNode, Readonly<{
    children: ImmutableSet<AggregationDescription | AggregationLeaf>
}>{}

interface AggregationNode extends Readonly<{
    id: string,
    label: string
}>{}

interface AggregationLeaf extends AggregationNode, Readonly<{
    formula: string
}>{}

interface AggregatedDocumentBudgetaire extends Readonly<{
    id: string,
    label: string,
    // in non-leaf nodes, total and elements are computed fields accumulating the children values
    total: number
    elements: ImmutableSet<LigneBudget>,
    children?: ImmutableSet<AggregatedDocumentBudgetaire>
}>{}

interface AggregateMaker {
    (desc: AggregationDescription): 
        (doc: DocumentBudgetaire) => AggregatedDocumentBudgetaire;
}

*/

const AggregationNodeFields = {
    'id': undefined,
    'label': undefined,
}

export const AggregationLeaf = Record(
    Object.assign(
        {formula: undefined},
        AggregationNodeFields
    )
)

export const AggregationDescription = Record(
    Object.assign(
        {children: undefined},
        AggregationNodeFields
    )
)

export const AggregatedDocumentBudgetaire = Record({
    id: undefined,
    label: undefined,
    // in non-leaf nodes, total and elements are computed fields accumulating the children values
    // This could be avoided by using a memoized function that takes a node and computes these
    elements: undefined,
    children: undefined
})
