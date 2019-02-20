import React from 'react';

import MoneyAmount from '../../../shared/js/components/MoneyAmount.js';
import {flattenTree} from '../../../shared/js/finance/visitHierarchical.js';

function Node({node, level, highlightedNodes}) {
    const children = Array.from(node.children.values());
    const nodes = flattenTree(node);

    return <li data-level={level} data-id={node.id} className={highlightedNodes && highlightedNodes.has(node) ? 'active' : ''}>
        <span data-label>{node.label}</span>
        <MoneyAmount amount={node.total} />

        <ul>
            {children.map((node, index) => <Node node={node} key={node.id} level={level + 1} highlightedNodes={highlightedNodes} />)}
        </ul>
    </li>;
}

export default function M52Hierarchy ({M52Hierarchical, width, M52HighlightedNodes, height}) {
    const children = Array.from(M52Hierarchical.children.values());

    return <ul className="tree">
        {children.map((node, index) => <Node node={node} key={node.id} level={0} highlightedNodes={M52HighlightedNodes} />)}
    </ul>;
}
