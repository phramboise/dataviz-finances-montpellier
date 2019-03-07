import { Map as ImmutableMap, List } from "immutable";

import React from "react";
import { connect } from "react-redux";

import { sum } from "d3-array";

import {
    RF,
    RI,
    DF,
    DI,
    EXPENDITURES,
    REVENUE
} from "../../../../shared/js/finance/constants";

import {
    hierarchicalByFunction,
    m52ToAggregated,
    hierarchicalAggregated
} from "../../../../shared/js/finance/memoized";
import { flattenTree } from "../../../../shared/js/finance/visitHierarchical.js";

import PageTitle from "../../../../shared/js/components/gironde.fr/PageTitle";
import SecundaryTitle from "../../../../shared/js/components/gironde.fr/SecundaryTitle";
import DownloadSection from "../../../../shared/js/components/gironde.fr/DownloadSection";
import PrimaryCallToAction from "../../../../shared/js/components/gironde.fr/PrimaryCallToAction";

import Markdown from "../../../../shared/js/components/Markdown";
import MoneyAmount, {SVGMoneyAmount} from "../../../../shared/js/components/MoneyAmount";

import Donut from "../../../../shared/js/components/Donut.js";
import LegendList from "../../../../shared/js/components/LegendList.js";

import { assets } from "../../constants/resources";

import M52ByFonction from "../M52ByFonction";
import BubbleChartCluster from "../../../../shared/js/components/BubbleChartCluster.js";

const MAX_HEIGHT = 30;

export function TotalBudget({
    currentYear,
    totalById,
    totals,
    m52Instruction,
    labelsById,
    assets: {
        expenditures: expURL,
        revenue: revURL,
        rf,
        ri,
        df,
        di,
        byFonction
    },
    constructionAmounts,
    screenWidth
}) {
    const expenditures = totals.get(EXPENDITURES);
    const revenue = totals.get(REVENUE);

    const expenditureItems = new List([
        { id: 'DF', colorClassName:'rdfi-F', text: 'Dépenses de fonctionnement', value: totals.get(DF) },
        { id: 'DI', colorClassName:'rdfi-I', text: 'Dépenses d\'investissement', value: totals.get(DI) },
    ]);

    const revenueItems = new List([
        { id: 'RF', colorClassName:'rdfi-F', text: 'Recettes de fonctionnement', value: totals.get(RF) },
        { id: 'RI', colorClassName:'rdfi-I', text: 'Recettes d\'investissement', value: totals.get(RI) },
    ]);

    return <article className="explore-budget">
        <PageTitle text={`Exploration des comptes ${currentYear}`} />

        <section>
            <Markdown>
Le contexte financier dans lequel s’est déroulée l’exécution de ce troisième
budget de la mandature a été marqué par l’accentuation de la contribution des
collectivités locales à la réduction des déficits publics et par une modification
des compétences résultant de la mise en œuvre des transferts de compétences avec
la Région et Bordeaux Métropole issus des lois MAPTAM de 2014 et NOTRe de 2015.

Dans un contexte national où les contraintes financières se sont durcies, l’année
2017 confirme le dynamisme des dépenses de solidarité obligatoires et incompressibles et la difficulté d’accentuer encore la maitrise des dépenses de gestion courante.

Le Département voit également ses recettes de fonctionnement évoluer plus
favorablement que prévu grâce aux droits de mutation recette conjoncturelle
mais non pérenne liée au fort dynamisme de l’immobilier et à l’attraction du
département.

Ainsi les résultats financiers de la Gironde pour cet exercice se traduisent par :

-	Une épargne brute qui s’améliore fortement
-	Une réduction importante du besoin de financement par l’emprunt</Markdown>
        </section>

        <section className="yearly-budget">
            <h2>Le budget {currentYear}</h2>

            <figure className="side-by-side">
                <Donut items={revenueItems} padAngle={0}>
                    <MoneyAmount amount={revenue} as="tspan" />
                    de recettes
                </Donut>

                <Donut items={expenditureItems} padAngle={0}>
                    <MoneyAmount amount={expenditures} as="tspan" />
                    de dépenses
                </Donut>

                <Markdown className="todo">
                    Les chiffres étant issus du compte administratif, la différence entre
                    le montant des recettes et le montant des dépenses représente l’excédent
                    de l’exercice.
                </Markdown>

                <LegendList items={new List([
                    { text: 'Fonctionnement', colorClassName: 'rdfi-F' },
                    { text: 'Investissement', colorClassName: 'rdfi-I' },
                ])} />
            </figure>
        </section>

        <section>
            <h2>Explorer le budget</h2>

            <BubbleChartCluster m52Instruction={m52Instruction} />
        </section>

        <section className="m52">
            <SecundaryTitle text="Les comptes par fonction (norme M14)" />
            <M52ByFonction  m52Instruction={m52Instruction}
                urlByFonction={byFonction}
                labelsById={labelsById}
                screenWidth={screenWidth} />
        </section>

        <DownloadSection />
    </article>;
}

export default connect(
    state => {
        const {
            docBudgByYear,
            corrections,
            currentYear,
            textsById,
            screenWidth
        } = state;
        const m52Instruction = docBudgByYear.get(currentYear);
        const aggregated =
            m52Instruction &&
            corrections &&
            m52ToAggregated(m52Instruction, corrections);
        const hierAgg = m52Instruction && hierarchicalAggregated(aggregated);

        let totalById = new ImmutableMap();
        if (hierAgg) {
            flattenTree(hierAgg).forEach(aggHierNode => {
                totalById = totalById.set(aggHierNode.id, aggHierNode.total);
            });
        }

        let totals = new ImmutableMap();
        if (m52Instruction) {
            totals = new ImmutableMap({
                [REVENUE]: sum(m52Instruction.rows.filter(r => r.CodRD === 'R').map(r => r.MtReal).toArray()),
                [EXPENDITURES]: sum(m52Instruction.rows.filter(r => r.CodRD === 'D').map(r => r.MtReal).toArray()),
                [DF]: hierarchicalByFunction(m52Instruction, DF).total,
                [DI]: hierarchicalByFunction(m52Instruction, DI).total,
                [RF]: hierarchicalByFunction(m52Instruction, RF).total,
                [RI]: hierarchicalByFunction(m52Instruction, RI).total
            });
        }

        return {
            currentYear,
            totalById,
            totals,
            m52Instruction,
            labelsById: textsById.map(texts => texts.label),
            // All of this is poorly hardcoded. TODO: code proper formulas based on what was transmitted by CD33
            constructionAmounts: m52Instruction
                ? {
                    DotationEtat: totalById.get("RF-5"),
                    FiscalitéDirecte: totalById.get("RF-1"),
                    FiscalitéIndirecte: sum(
                        ["RF-2", "RF-3", "RF-4"].map(i => totalById.get(i))
                    ),
                    RecettesDiverses:
                          totalById.get("RF") -
                          sum(
                              ["RF-1", "RF-2", "RF-3", "RF-4", "RF-5"].map(i =>
                                  totalById.get(i)
                              )
                          ),

                    Solidarité: totalById.get("DF-1"),
                    Interventions: totalById.get("DF-3"),
                    DépensesStructure:
                          totalById.get("DF") -
                          sum(["DF-1", "DF-3"].map(i => totalById.get(i))),

                    Emprunt: totalById.get("RI-EM"),
                    RIPropre: totalById.get("RI") - totalById.get("RI-EM"),

                    RemboursementEmprunt: totalById.get("DI-EM"),
                    Routes: totalById.get("DI-1-2"),
                    Colleges: totalById.get("DI-1-1"),
                    Amenagement:
                          totalById.get("DI-1-3") +
                          totalById.get("DI-1-4") +
                          totalById.get("DI-1-5"),
                    Subventions: totalById.get("DI-2")
                }
                : undefined,
            assets: {
                expenditures: "#!/finance-details/" + EXPENDITURES,
                revenue: "#!/finance-details/" + REVENUE,
                rf: "#!/finance-details/" + RF,
                ri: "#!/finance-details/" + RI,
                df: "#!/finance-details/" + DF,
                di: "#!/finance-details/" + DI,
                byFonction: {
                    "M52-DF-0": `#!/finance-details/M52-DF-0`,
                    "M52-DF-1": `#!/finance-details/M52-DF-1`,
                    "M52-DF-2": `#!/finance-details/M52-DF-2`,
                    "M52-DF-3": `#!/finance-details/M52-DF-3`,
                    "M52-DF-4": `#!/finance-details/M52-DF-4`,
                    "M52-DF-5": `#!/finance-details/M52-DF-5`,
                    "M52-DF-6": `#!/finance-details/M52-DF-6`,
                    "M52-DF-7": `#!/finance-details/M52-DF-7`,
                    "M52-DF-8": `#!/finance-details/M52-DF-8`,
                    "M52-DF-9": `#!/finance-details/M52-DF-9`,
                    "M52-DI-0": `#!/finance-details/M52-DI-0`,
                    "M52-DI-1": `#!/finance-details/M52-DI-1`,
                    "M52-DI-2": `#!/finance-details/M52-DI-2`,
                    "M52-DI-3": `#!/finance-details/M52-DI-3`,
                    "M52-DI-4": `#!/finance-details/M52-DI-4`,
                    "M52-DI-5": `#!/finance-details/M52-DI-5`,
                    "M52-DI-6": `#!/finance-details/M52-DI-6`,
                    "M52-DI-7": `#!/finance-details/M52-DI-7`,
                    "M52-DI-8": `#!/finance-details/M52-DI-8`,
                    "M52-DI-9": `#!/finance-details/M52-DI-9`
                }
            },
            screenWidth
        };
    },
    () => ({})
)(TotalBudget);
