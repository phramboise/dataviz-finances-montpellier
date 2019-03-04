import React from 'react';

import { RF, RI, DF, DI } from "../finance/constants.js";
import { hierarchicalByFunction } from "../finance/memoized.js";

import MoneyAmount from "./MoneyAmount.js";
import BubbleChartNode from "./BubbleChartNode.js";

export default class BubbleChartCluster extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            r: false,
            d: true,
            f: true,
            i: true,
            activeElement: null
        }
    }

    render() {
        const {m52Instruction} = this.props;

        if (!m52Instruction) {
            return null;
        }

        const families = hierarchicalByFunction(m52Instruction, DF).children.toArray();

        return (<div className="bubble-chart-cluster">
            <nav className="legend-list legend-list--interactive">
                <ul>
                    <li>
                        <label>
                            <input type="radio" name="rd" value="r" defaultChecked={false} /> recettes
                        </label>
                    </li>
                    <li>
                        <label>
                            <input type="radio" name="rd" value="d" defaultChecked={true} /> dépenses
                        </label>
                    </li>
                </ul>

                <ul>
                    <li>
                        <label>
                            <input type="checkbox" name="fi" value="f" defaultChecked={true} /> fonctionnement
                        </label>
                    </li>
                    <li>
                        <label>
                            <input type="checkbox" name="fi" value="i" defaultChecked={true} /> investissement
                        </label>
                    </li>
                </ul>
            </nav>

            {families.map((node) => (<BubbleChartNode key={node.id} node={node} />))}
        </div>)
    }
}
