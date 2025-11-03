# TS Banner: Vite + TypeScript + Jest + Playwright

Deze repository is geconfigureerd met:

- Vite (dev server en build)
- TypeScript
- Jest (unit tests, jsdom)
- Playwright (end?to?end browser tests: Chromium, Firefox, WebKit)

## Installatie

1. Installeer dependencies:
   - npm install
2. (Eenmalig) Installeer de Playwright-browsers:
   - npx playwright install

## Scripts

- Ontwikkelserver starten: npm run dev
- Productiebuild maken: npm run build
- Preview van build: npm run preview
- Unit tests draaien (Jest): npm test
- Unit tests watch-mode: npm run test:watch
- Coverage rapport: npm run test:coverage
- E2E-tests (Playwright): npm run test:e2e
- E2E-tests met UI: npm run test:e2e:ui
- E2E-tests headed (zichtbare browser): npm run test:e2e:headed

## Structuur

- index.html ? app entry in de browser
- src/ ? TypeScript broncode
  - main.ts ? mount een simpele pagina
  - sum.ts ? voorbeeld functie
  - sum.test.ts ? Jest unit test
- tests/ ? Playwright e2e tests
  - example.spec.ts ? controleert de homepage
- Configuratiebestanden:
  - tsconfig.json ? TypeScript instellingen (incl. DOM & Jest types)
  - vite.config.ts ? Vite server/build instellingen
  - jest.config.ts ? Jest + ts-jest + jsdom
  - playwright.config.ts ? Playwright projecten + webServer koppeling naar Vite

## Opmerkingen

- Jest draait met de jsdom testomgeving, geschikt voor DOM?gerelateerde unit tests.
- Playwright wordt automatisch gekoppeld aan de Vite dev server via webServer in de config. Start en hergebruikt de server lokaal op poort 5173.
- Als je CI gebruikt, zorg ervoor dat de Playwright-browsers ge�nstalleerd zijn (npx playwright install --with-deps in Linux CI) en cache node_modules voor snellere runs.
