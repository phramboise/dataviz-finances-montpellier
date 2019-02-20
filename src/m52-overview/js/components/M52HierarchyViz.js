import React from 'react';
import {tree as d3tree, hierarchy as d3hierarchy} from 'd3-hierarchy';

import MoneyAmount from '../../../shared/js/components/MoneyAmount.js';

function Node({node, level}) {
    const children = Array.from(node.children.values());

    return <li data-level={level} data-id={node.id}>
        <span data-label>{node.label}</span>
        <MoneyAmount amount={node.total} />

        <ul>
            {children.map((node, index) => <Node node={node} key={node.id} level={level + 1} />)}
        </ul>
    </li>;
}

export default function M52Hierarchy ({M52Hierarchical, width, selectedNode, height}) {
    const children = Array.from(M52Hierarchical.children.values());

    return <ul className="tree">
        {children.map((node, index) => <Node node={node} key={node.id} level={0} />)}
    </ul>;
}
