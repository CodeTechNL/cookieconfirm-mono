#!/usr/bin/env ts-node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { loadAndMergeEnvFiles } from "./utils/env.js";
import { createSsmClient, fetchSsmParametersByPrefix, putSsmParameter } from "./utils/ssm.js";
import { renderOverviewTable, renderPlannedChangesTable, OverviewRow, PlannedChangeRow, RowStatus } from "./utils/table.js";
import {
    promptCompanyName,
    promptEnvFiles,
    promptProceed,
    promptStage,
    promptRegion,
    Stage,
    promptSearchTerm,
    promptSelectVariablesWithChoices,
    promptNewValue,
} from "./utils/prompts.js";
import { ENV_FILES } from "./config/env-files.js";
import chalk from "chalk";

type Args = {
    write?: boolean;
    debug?: boolean;
};

interface CompareResult {
    key: string;
    env?: string;
    ssm?: string;
    status: RowStatus;
}

function compareMaps(envMap: Record<string, string>, ssmMap: Record<string, string>): CompareResult[] {
    const keys = new Set<string>([...Object.keys(envMap), ...Object.keys(ssmMap)]);
    const rows: CompareResult[] = [];
    for (const key of Array.from(keys).sort()) {
        const env = envMap[key];
        const ssm = ssmMap[key];
        let status: RowStatus;
        if (env !== undefined && ssm !== undefined) {
            status = env === ssm ? "same" : "diff";
        } else if (env !== undefined) {
            status = "only-env";
        } else {
            status = "only-ssm";
        }
        rows.push({ key, env, ssm, status });
    }
    return rows;
}

function displayPrefixFor(companyName: string, stage: Stage): string {
    const cap = stage.charAt(0).toUpperCase() + stage.slice(1);
    // New scheme: CompanyNameEnvironment (no slashes between)
    return `${companyName}${cap}`;
}

async function main() {
    // Load .env so AWS_PROFILE (and others) are available to the SDK
    // Prefer repository root .env (two levels up) and fall back to local .env
    const rootEnvPath = path.resolve(process.cwd(), "../../.env");
    const localEnvPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(rootEnvPath)) {
        dotenv.config({ path: rootEnvPath });
    } else if (fs.existsSync(localEnvPath)) {
        dotenv.config({ path: localEnvPath });
    } else {
        dotenv.config();
    }

    const argv = yargs(hideBin(process.argv))
        .option("write", {
            type: "boolean",
            default: false,
            describe: "Voer werkelijk wijzigingen uit (zonder deze flag is het een dry-run)",
        })
        .option("debug", {
            type: "boolean",
            default: false,
            describe: "Toon extra debug-informatie (zoals gebruikte/geplande SSM-keys)",
        })
        .help()
        .parseSync() as Args;

    const companyName = await promptCompanyName();
    const stage = await promptStage();
    const region = await promptRegion();
    const envFiles = await promptEnvFiles();

    const envMap = loadAndMergeEnvFiles(envFiles);
    const client = createSsmClient(region);
    const displayPrefix = displayPrefixFor(companyName, stage);
    const ssmPathPrefix = `/${displayPrefix}`; // SSM GetParametersByPath requires leading slash
    const ssmMap = await fetchSsmParametersByPrefix(client, ssmPathPrefix);

    // Debug: toon alle SSM keys die we hebben opgehaald/"gebruikt"
    if (argv.debug) {
        const usedKeys = Object.keys(ssmMap)
            .sort()
            .map((k) => `/${displayPrefix}/${k}`);
        console.log(`\n${chalk.bgMagenta.black(" DEBUG ")} ${chalk.magenta("SSM keys opgehaald (gebruikt):")}`);
        if (usedKeys.length === 0) {
            console.log(chalk.dim("  (geen keys gevonden onder prefix)"));
        } else {
            usedKeys.forEach((k) => console.log(chalk.dim(`  - ${k}`)));
        }
    }

    // Render per-file overview tables first for clarity
    const labelByPath = new Map<string, string>(ENV_FILES.map((f) => [f.path, f.label] as const));
    // Bepaal voor elke key uit de samengevoegde env welke file het laatst de waarde heeft gezet (voor label weergave)
    const originLabelByKey = new Map<string, string>();
    for (const filePath of envFiles) {
        const singleEnv = loadAndMergeEnvFiles([filePath]);
        const label = labelByPath.get(filePath) ?? filePath;
        for (const k of Object.keys(singleEnv)) {
            // Later bestanden overschrijven eerdere labels, conform merge-logica
            originLabelByKey.set(k, label);
        }
    }
    for (const filePath of envFiles) {
        const singleEnv = loadAndMergeEnvFiles([filePath]);
        // Limit SSM to keys present in this file so the table focuses on the file's variables
        const ssmSubset: Record<string, string> = {};
        for (const k of Object.keys(singleEnv)) {
            if (ssmMap[k] !== undefined) ssmSubset[k] = ssmMap[k];
        }
        const perFileRows = compareMaps(singleEnv, ssmSubset) as OverviewRow[];
        const label = labelByPath.get(filePath) ?? filePath;
        const header = `${chalk.bold("Overzicht voor")}: ${label}`;
        console.log(`\n${chalk.bgCyan.black(` ${header} `)}`);
        if (perFileRows.length > 0) {
            console.log(renderOverviewTable(perFileRows));
        } else {
            console.log(chalk.dim("(Geen variabelen gevonden in dit bestand)"));
        }
    }

    // Interactieve review-loop: blijf vragen tot gebruiker tevreden is
    let finalPlan: PlannedChangeRow[] = [];
    while (true) {
        // Haal de meest actuele SSM-waarden op voor deze iteratie
        const currentSsmMap = await fetchSsmParametersByPrefix(client, ssmPathPrefix);
        // Bepaal samengevoegde vergelijking op basis van actuele SSM-stand
        const overview = compareMaps(envMap, currentSsmMap);
        // Basisplan: alleen nieuwe variabelen (only-env) automatisch als create met ENV-waarde
        const plannedMap = new Map<string, PlannedChangeRow>();
        for (const row of overview) {
            if (row.status === "only-env" && row.env !== undefined) {
                plannedMap.set(row.key, {
                    key: row.key,
                    from: undefined,
                    to: row.env,
                    action: "create",
                });
            }
        }

        // Samenstellen van selectiepool voor handmatige overrides (alle variabelen zichtbaar, incl. same/only-ssm)
        // Maak een zoeklus zodat een niet-matchende zoekterm opnieuw kan worden ingevoerd
        let visible = overview.slice();
        while (true) {
            const term = await promptSearchTerm();
            const pool = overview
                .filter((r) => (term.length === 0 ? true : r.key.toLowerCase().includes(term.toLowerCase())))
                .sort((a, b) => a.key.localeCompare(b.key));
            if (pool.length === 0) {
                console.log(chalk.yellow("Geen resultaten voor deze zoekterm. Probeer opnieuw of laat leeg voor alle variabelen."));
                continue;
            }
            visible = pool;
            break;
        }

        // Bouw keuzes met label van herkomst (.env-bestand) indien bekend
        const choices = visible.map((r) => {
            const origin = originLabelByKey.get(r.key);
            const name = origin ? `${r.key} (${origin})` : r.key;
            // value = index in oorspronkelijke overview, zodat we later eenvoudig kunnen mappen
            const idx = overview.findIndex((o) => o.key === r.key);
            return { name, value: idx };
        });

        const selectedIdxs = await promptSelectVariablesWithChoices(choices);

        // Verwerk handmatige overrides: vraag nieuwe waarde; default = SSM, anders ENV
        for (const idx of selectedIdxs) {
            const row = overview[idx];
            const def = row.ssm ?? row.env;
            const newVal = await promptNewValue(row.key, def);
            // Sla alleen op als er daadwerkelijk iets te doen is
            if (row.ssm === undefined) {
                // key bestaat nog niet in SSM -> create (overschrijft evt. env-default)
                plannedMap.set(row.key, {
                    key: row.key,
                    from: undefined,
                    to: newVal,
                    action: "create",
                });
            } else if (newVal !== row.ssm) {
                // bestaande sleutel -> update alleen als afwijkend van huidige SSM
                plannedMap.set(row.key, {
                    key: row.key,
                    from: row.ssm,
                    to: newVal,
                    action: "update",
                });
            } else {
                // gelijk aan huidige SSM -> geen wijziging nodig; verwijder eventuele bestaande plan entry
                plannedMap.delete(row.key);
            }
        }

        const planned = Array.from(plannedMap.values()).sort((a, b) => a.key.localeCompare(b.key));

        if (planned.length === 0) {
            console.log(chalk.green("Geen wijzigingen gepland. Het script wordt afgesloten."));
            return; // niets te doen -> direct afsluiten zoals gevraagd
        } else {
            console.log(`\n${chalk.bold.green("Geplande wijzigingen:")}`);
            console.log(renderPlannedChangesTable(planned));
        }

        const proceed = await promptProceed();
        if (proceed) {
            // Re-fetch latest SSM values at the moment of confirmation to ensure 'from' reflects current AWS
            const latestSsmMap = await fetchSsmParametersByPrefix(client, ssmPathPrefix);
            finalPlan = planned.map((p) => ({
                ...p,
                from: latestSsmMap[p.key] ?? p.from,
            }));

            // Bepaal aantallen voor samenvatting
            const finalOverview = compareMaps(envMap, latestSsmMap);
            const unchangedCount = finalOverview.filter((r) => r.status === "same").length;
            const newCount = finalPlan.filter((p) => p.action === "create").length;
            const changedCount = finalPlan.filter((p) => p.action === "update").length;

            // Toon samenvatting vóór definitieve verzending
            console.log(`\n${chalk.bgBlue.white(" SAMENVATTING VOOR VERZENDEN ")}`);
            console.log(`${chalk.bold("Key prefix:")} ${chalk.cyan(`/${displayPrefix}/<KEY>`)} `);
            console.log(`${chalk.bold("Region:")} ${chalk.yellow(region)}`);
            console.log(`${chalk.bold("Nieuwe variabelen:")} ${chalk.green(String(newCount))}`);
            console.log(`${chalk.bold("Gewijzigde variabelen:")} ${chalk.yellow(String(changedCount))}`);
            console.log(`${chalk.bold("Ongewijzigde variabelen:")} ${chalk.dim(String(unchangedCount))}`);

            // Debug: toon alle SSM keys die we gaan gebruiken (schrijven)
            if (argv.debug) {
                const plannedKeys = finalPlan.map((c) => `/${displayPrefix}/${c.key}`).sort();
                console.log(`\n${chalk.bgMagenta.black(" DEBUG ")} ${chalk.magenta("SSM keys gepland (schrijven):")}`);
                if (plannedKeys.length === 0) {
                    console.log(chalk.dim("  (geen geplande wijzigingen)"));
                } else {
                    plannedKeys.forEach((k) => console.log(chalk.dim(`  - ${k}`)));
                }
            }

            // Laatste bevestiging om definitief te verzenden of proces te herstarten
            const { promptFinalConfirm } = await import("./utils/prompts.js");
            const finalConfirm = await promptFinalConfirm();
            if (!finalConfirm) {
                console.log(chalk.yellow("Proces wordt opnieuw gestart. Pas je selectie/waarden aan."));
                continue; // terug naar begin van de while-loop
            }
            // anders: definitief, breek uit de loop om dry-run preview of write uit te voeren
            break;
        }
        console.log(chalk.yellow("Niet akkoord. We gaan opnieuw de overrides selecteren..."));
    }

    if (!argv.write) {
        // Toon altijd duidelijk welke volledige SSM-keys en waarden zouden worden geschreven
        console.log(`\n${chalk.bold.cyan("Dry-run preview:")} ${chalk.dim("de volgende parameters zouden worden geschreven:")}`);
        if (finalPlan.length === 0) {
            console.log(chalk.dim("  (geen geplande wijzigingen)"));
        } else {
            for (const change of finalPlan) {
                const fullKey = `/${displayPrefix}/${change.key}`;
                const tag = change.action === "create" ? chalk.green("CREATE") : chalk.yellow("UPDATE");
                const from = change.from !== undefined ? chalk.dim(` from ${change.from}`) : "";
                console.log(`  ${tag} ${chalk.cyan(fullKey)}${from} ${chalk.dim("=>")} ${chalk.bold(change.to)}`);
            }
        }
        console.log(
            `\n${chalk.yellow("Dry-run:")} ${chalk.dim("geen wijzigingen naar SSM geschreven. Voeg")} ${chalk.bold("--write")} ${chalk.dim("toe om te schrijven.")}`,
        );
        return;
    }

    for (const change of finalPlan) {
        const name = `${ssmPathPrefix}/${change.key}`;
        await putSsmParameter(client, name, change.to, "String");
        const tag = change.action === "create" ? chalk.green("CREATE") : chalk.yellow("UPDATE");
        console.log(`${tag}: ${chalk.cyan(`/${displayPrefix}/${change.key}`)}`);
    }
    console.log(chalk.bold.green("Klaar."));
}

main().catch((err) => {
    console.error(chalk.red("Fout:"), err);
    process.exit(1);
});
