import React from 'react';

export default function(){
    return <div className="w-files">
        <div className="w-files__container">
            <h3 className="w-files__title">Télécharger les données en Open Data</h3>
            <ul className="w-files__links">
                <li>
                    <a href="https://opendata.montreuil.fr/404" target="_blank">Comptes administratifs (format XML TOTEM)</a>
                </li>
                <li>
                    <a href="https://github.com/dtc-innovation/dataviz-finances-montreuil" target="_blank">Code source de cet outil d'exploration</a>
                </li>
            </ul>
        </div>
    </div>;
}
