import React from 'react';

import {pack, hierarchy} from 'd3-hierarchy';

import MoneyAmount from "./MoneyAmount.js";

export default function BubbleChartNode ({node, width=400, height=400}) {
    const {total, label} = node;
    const children = node.children.toArray();

    const bubbles = pack({children})
        .size([width, height])
        .padding(30);
    const nodes = hierarchy({children}).sum(d => d.total);

    return (<figure className="bubble-chart">
        <figurelegend>
            <MoneyAmount amount={total} />
            <span>{label}</span>
        </figurelegend>

        <svg viewBox={`0 0 ${width} ${height}`}>
            {bubbles(nodes).descendants().filter(d => !d.children).map((circle) => (
            <g transform={`translate(${circle.x}, ${circle.y})`}>
                <circle r={circle.r}
                        className="rdfi-D"
                        aria-label={circle.data.label} />
                <text>{circle.data.label}</text>
            </g>
            ))}
        </svg>
    </figure>);
}
