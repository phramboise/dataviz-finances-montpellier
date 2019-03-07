import React from 'react';

import {pack, hierarchy} from 'd3-hierarchy';
import page from "page";

import MoneyAmount from "./MoneyAmount.js";



export default class BubbleChartNode extends React.Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    /*
    TODO this is a hack til the following issue is solved
         https://github.com/visionmedia/page.js/issues/532
     */
    onClick (event, nodeId) {
        // event.stopPropagation();
        // event.preventDefault();
        page(`/finance-details/${nodeId}`);
    }

    render() {
        const {node} = this.props;
        const {total, label, children} = node;
        const WIDTH = 400;
        const HEIGHT = 400;

        const bubbles = pack({children})
            .size([WIDTH, HEIGHT])
            .padding(30);
        const nodes = hierarchy({children}).sum(d => d.total);

        return (<figure className="bubble-chart">
            <figurelegend>
                <MoneyAmount amount={total} />
                <span>{label}</span>
            </figurelegend>

            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} xmlnsXlink="http://www.w3.org/1999/xlink">
                {bubbles(nodes).descendants().filter(d => !d.children).map(({r, x, y, data}) => (
                <g transform={`translate(${x}, ${y})`}>
                    <a /*xlinkHref={`#!/finance-details/${data.id}`}*/ className="clickable" onClick={e => this.onClick(e, data.id)}>
                        <circle r={r}
                                className={`rdfi-${data.rdfi[1]}`}
                                aria-label={data.label} />
                    </a>
                    <text>{data.label}</text>
                </g>
                ))}
            </svg>
        </figure>);
    }
}
