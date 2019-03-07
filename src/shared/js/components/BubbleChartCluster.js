import React from 'react';

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

    return Array.from(levels.values()).sort((a, b) => b.total - a.total);
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

        this.toggle = this.toggle.bind(this);
    }

    toggle (...stateRDFI) {
        stateRDFI.forEach(RDFI => {
            const stateValue = this.state[RDFI];
            this.setState({ [RDFI]: !stateValue });
        });
    }

    render() {
        const {m52Instruction} = this.props;
        const {R, D, F, I} = this.state;
        const RD = R ? 'R' : 'D';
        const RDF = RD + 'F';
        const RDI = RD + 'I';

        if (!m52Instruction) {
            return null;
        }

        const families = mergeHierarchies(
            F ? hierarchicalByFunction(m52Instruction, RDF).children : [],
            I ? hierarchicalByFunction(m52Instruction, RDI).children : []
        );

        return (<div className="bubble-chart-cluster">
            <nav className="legend-list legend-list--interactive">
                <ul>
                    <li>
                        <label>
                            <input type="radio" name="rd" value="R" onClick={() => this.toggle('R', 'D')} defaultChecked={R} /> recettes
                        </label>
                    </li>
                    <li>
                        <label>
                            <input type="radio" name="rd" value="D" onClick={() => this.toggle('D', 'R')} defaultChecked={D} /> dépenses
                        </label>
                    </li>
                </ul>

                <ul>
                    <li>
                        <label>
                            <input type="checkbox" name="fi" value="F" onClick={() => this.toggle('F')} defaultChecked={F} /> fonctionnement
                        </label>
                    </li>
                    <li>
                        <label>
                            <input type="checkbox" name="fi" value="I" onClick={() => this.toggle('I')} defaultChecked={I} /> investissement
                        </label>
                    </li>
                </ul>
            </nav>

            {families.map((node) => (<BubbleChartNode key={`rd-CH${node.id}`} node={node} />))}
        </div>)
    }
}
