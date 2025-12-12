import inquirer from "inquirer";
import { ENV_FILES } from "../config/env-files.js";

export type Stage = "local" | "staging" | "production";

export const REGIONS = ["eu-central-1", "eu-west-3"] as const;
export type Region = (typeof REGIONS)[number];

export async function promptCompanyName(): Promise<string> {
  const { companyName } = await inquirer.prompt<{ companyName: string }>([
    {
      type: "input",
      name: "companyName",
      message: "Voer de companyName in:",
      validate: (v: string) => (v && v.trim().length > 0 ? true : "companyName is verplicht"),
    },
  ]);
  return companyName.trim();
}

export async function promptStage(): Promise<Stage> {
  const { stage } = await inquirer.prompt<{ stage: Stage }>([
    {
      type: "list",
      name: "stage",
      message: "Kies een stage:",
      choices: ["local", "staging", "production"],
    },
  ]);
  return stage;
}

export async function promptRegion(): Promise<Region> {
  const { region } = await inquirer.prompt<{ region: Region }>([
    {
      type: "list",
      name: "region",
      message: "Kies een AWS regio:",
      choices: REGIONS as unknown as string[],
    },
  ]);
  return region;
}

export async function promptEnvFiles(): Promise<string[]> {
  const choices = [
    ...ENV_FILES.map((f) => ({ name: f.label, value: f.path })),
    new inquirer.Separator(),
    { name: "Anders (handmatig pad/paden opgeven)", value: "__manual__" },
  ];

  const { selected } = await inquirer.prompt<{ selected: string[] }>([
    {
      type: "checkbox",
      name: "selected",
      message: "Kies een of meerdere .env-bestanden:",
      choices,
      validate: (arr: string[]) => (arr.length > 0 ? true : "Selecteer minimaal 1 optie"),
    },
  ]);

  let paths = selected.filter((v) => v !== "__manual__");

  if (selected.includes("__manual__")) {
    const { files } = await inquirer.prompt<{ files: string }>([
      {
        type: "input",
        name: "files",
        message: "Geef extra .env-bestanden op (kommagescheiden):",
        default: "",
      },
    ]);
    const manual = files
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    paths = [...paths, ...manual];
  }

  return paths;
}

export async function promptProceed(): Promise<boolean> {
  const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
    {
      type: "confirm",
      name: "proceed",
      message: "Wijzigingen doorvoeren?",
      default: false,
    },
  ]);
  return proceed;
}

export async function promptFinalConfirm(): Promise<boolean> {
  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: "confirm",
      name: "confirm",
      message: "Definitief versturen naar AWS SSM? (Nee = proces opnieuw starten)",
      default: false,
    },
  ]);
  return confirm;
}

export async function promptSelectVariables(keys: string[]): Promise<number[]> {
  const choices = keys.map((k, idx) => ({ name: `${idx + 1}. ${k}`, value: idx }));
  const { selected } = await inquirer.prompt<{ selected: number[] }>([
    {
      type: "checkbox",
      name: "selected",
      message: "Selecteer variabelen die je handmatig wilt OVERRIDEN (optioneel):",
      pageSize: 25,
      choices,
      validate: (_arr: number[]) => true,
    },
  ]);
  return selected;
}

// Optionele zoekterm om de lijst met variabelen te filteren
export async function promptSearchTerm(): Promise<string> {
  const { term } = await inquirer.prompt<{ term: string }>([
    {
      type: "input",
      name: "term",
      message: "Zoekterm (optioneel, laat leeg voor alle variabelen):",
      default: "",
    },
  ]);
  return term.trim();
}

// Variant waarbij de caller zelf choices (name/value) aanlevert. Value is bijvoorbeeld de index in de originele lijst.
export async function promptSelectVariablesWithChoices(choices: { name: string; value: number }[]): Promise<number[]> {
  const { selected } = await inquirer.prompt<{ selected: number[] }>([
    {
      type: "checkbox",
      name: "selected",
      message: "Selecteer variabelen die je handmatig wilt OVERRIDEN (optioneel):",
      pageSize: 25,
      choices,
      validate: (_arr: number[]) => true,
    },
  ]);
  return selected;
}

export async function promptNewValue(key: string, def: string | undefined): Promise<string> {
  const { value } = await inquirer.prompt<{ value: string }>([
    {
      type: "input",
      name: "value",
      message: `Nieuwe waarde voor ${key}:`,
      default: def ?? "",
    },
  ]);
  return value;
}
