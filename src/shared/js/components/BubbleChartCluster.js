import React from 'react';

import { RF, RI, DF, DI } from "../finance/constants.js";
import { hierarchicalByFunction } from "../finance/memoized.js";

import MoneyAmount from "./MoneyAmount.js";
import BubbleChartNode from "./BubbleChartNode.js";

const mergeHierarchies = (...hierarchies) => {
    const levels = new Map();

    hierarchies.forEach(children => {
        children.forEach(({id, label, total, children}) => {
            const levelId = id.split('-').pop();

            if (!levels.has(levelId)) {
                levels.set(levelId, {
                    id: levelId,
                    label,
                    total,
                    children: [],
                });
            }

            levels.get(levelId).children = levels.get(levelId).children.concat(children.toArray());
        });
    });

    return Array.from(levels.values());
};

export default class BubbleChartCluster extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            R: false,
            D: true,
            F: true,
            I: true,
            activeElement: null
        }
    }

    render() {
        const {m52Instruction} = this.props;
        const {R, D, F, I} = this.state;

        if (!m52Instruction) {
            return null;
        }

        const families = mergeHierarchies(
            hierarchicalByFunction(m52Instruction, DF).children,
            hierarchicalByFunction(m52Instruction, DI).children,
        );

        return (<div className="bubble-chart-cluster">
            <nav className="legend-list legend-list--interactive">
                <ul>
                    <li>
                        <label>
                            <input type="radio" name="rd" value="R" defaultChecked={R} /> recettes
                        </label>
                    </li>
                    <li>
                        <label>
                            <input type="radio" name="rd" value="D" defaultChecked={D} /> dépenses
                        </label>
                    </li>
                </ul>

                <ul>
                    <li>
                        <label>
                            <input type="checkbox" name="fi" value="F" defaultChecked={F} /> fonctionnement
                        </label>
                    </li>
                    <li>
                        <label>
                            <input type="checkbox" name="fi" value="I" defaultChecked={I} /> investissement
                        </label>
                    </li>
                </ul>
            </nav>

            {families.map((node) => (<BubbleChartNode key={node.id}
                                                      node={node} />))}
        </div>)
    }
}
