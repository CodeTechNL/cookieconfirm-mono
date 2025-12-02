// Predefined selectable .env files for convenience in the CLI
// Adjust paths relative to the working directory of this package:
// tools/environment-generator -> project root is two levels up
export const ENV_FILES = [
    {
        id: 'platform-production',
        label: 'Platform (.env.example)',
        path: '../../platform/.env.example',
    },
    {
        id: 'cookie-scanner-production',
        label: 'Cookie Scanner (.env.production)',
        path: '../../cookie-scanner/.env.production',
    },
    // Voeg hier meer toe als je wilt:
    // {
    //   id: 'banner-production',
    //   label: 'Banner (.env.production)',
    //   path: '../../banner/.env.production',
    // },
];
