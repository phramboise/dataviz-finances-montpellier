import React from 'react';

export default function({items}){
    return <ol className="legend-list">
        {items.map(({className, url, text, colorClassName}) => {
            return <li className={className} key={text}>
                <a href={url} className={url ? 'link' : 'disabled'}>
                    <span className={`color ${colorClassName}`}></span>
                    {text}
                </a>
            </li>
        })}
    </ol>
}
