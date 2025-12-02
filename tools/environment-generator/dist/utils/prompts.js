import inquirer from 'inquirer';
import { ENV_FILES } from '../config/env-files.js';
export const REGIONS = ['eu-central-1', 'eu-west-3'];
export async function promptCompanyName() {
    const { companyName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'companyName',
            message: 'Voer de companyName in:',
            validate: (v) => (v && v.trim().length > 0 ? true : 'companyName is verplicht'),
        },
    ]);
    return companyName.trim();
}
export async function promptStage() {
    const { stage } = await inquirer.prompt([
        {
            type: 'list',
            name: 'stage',
            message: 'Kies een stage:',
            choices: ['local', 'staging', 'production'],
        },
    ]);
    return stage;
}
export async function promptRegion() {
    const { region } = await inquirer.prompt([
        {
            type: 'list',
            name: 'region',
            message: 'Kies een AWS regio:',
            choices: REGIONS,
        },
    ]);
    return region;
}
export async function promptEnvFiles() {
    const choices = [
        ...ENV_FILES.map((f) => ({ name: f.label, value: f.path })),
        new inquirer.Separator(),
        { name: 'Anders (handmatig pad/paden opgeven)', value: '__manual__' },
    ];
    const { selected } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selected',
            message: 'Kies een of meerdere .env-bestanden:',
            choices,
            validate: (arr) => (arr.length > 0 ? true : 'Selecteer minimaal 1 optie'),
        },
    ]);
    let paths = selected.filter((v) => v !== '__manual__');
    if (selected.includes('__manual__')) {
        const { files } = await inquirer.prompt([
            {
                type: 'input',
                name: 'files',
                message: 'Geef extra .env-bestanden op (kommagescheiden):',
                default: '',
            },
        ]);
        const manual = files
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        paths = [...paths, ...manual];
    }
    return paths;
}
export async function promptProceed() {
    const { proceed } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'proceed',
            message: 'Wijzigingen doorvoeren?',
            default: false,
        },
    ]);
    return proceed;
}
export async function promptFinalConfirm() {
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Definitief versturen naar AWS SSM? (Nee = proces opnieuw starten)',
            default: false,
        },
    ]);
    return confirm;
}
export async function promptSelectVariables(keys) {
    const choices = keys.map((k, idx) => ({ name: `${idx + 1}. ${k}`, value: idx }));
    const { selected } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selected',
            message: 'Selecteer variabelen die je handmatig wilt OVERRIDEN (optioneel):',
            pageSize: 25,
            choices,
            validate: (_arr) => true,
        },
    ]);
    return selected;
}
// Optionele zoekterm om de lijst met variabelen te filteren
export async function promptSearchTerm() {
    const { term } = await inquirer.prompt([
        {
            type: 'input',
            name: 'term',
            message: 'Zoekterm (optioneel, laat leeg voor alle variabelen):',
            default: '',
        },
    ]);
    return term.trim();
}
// Variant waarbij de caller zelf choices (name/value) aanlevert. Value is bijvoorbeeld de index in de originele lijst.
export async function promptSelectVariablesWithChoices(choices) {
    const { selected } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selected',
            message: 'Selecteer variabelen die je handmatig wilt OVERRIDEN (optioneel):',
            pageSize: 25,
            choices,
            validate: (_arr) => true,
        },
    ]);
    return selected;
}
export async function promptNewValue(key, def) {
    const { value } = await inquirer.prompt([
        {
            type: 'input',
            name: 'value',
            message: `Nieuwe waarde voor ${key}:`,
            default: def ?? '',
        },
    ]);
    return value;
}
