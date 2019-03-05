import React from 'react';
import {arc as _arc, pie as _pie} from 'd3-shape';

/*

interface DonutProps{
    proportion: number [0, 1]
    items: ImmutableList<{text, value}>
}

*/
export default function Donut ({
    donutWidth = 50, outerRadius = 200,
    width = 2*outerRadius, height = 2*outerRadius,
    padAngle = Math.PI/30,
    proportion, items, children
}){
    const arcDescs = _pie()
        .startAngle(2*Math.PI)
        .endAngle(0)
        .padAngle(padAngle)
        .value(el => el.value)
        (items.toArray())
    const arc = _arc();

    return (<figure className="donut">
        <svg viewBox={`0 0 ${width} ${height}`}>
            <g transform={`translate(${width/2}, ${height/2})`}>
                {arcDescs.map(ad => {
                    const d = arc({
                        outerRadius,
                        innerRadius: outerRadius - donutWidth,
                        ...ad
                    });

                    return <g className={ad.data.colorClassName} key={ad.data.id}>
                        <path d={d} />
                        <title>{ad.data.text}</title>
                    </g>
                })}
            </g>
        </svg>
        <figurelegend>{children}</figurelegend>
    </figure>);

}
