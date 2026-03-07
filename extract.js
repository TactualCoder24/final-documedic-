const fs = require('fs');
const files = [
    'pages/Landing.tsx',
    'components/walkthrough/LandingOnboardingWizard.tsx'
];

const result = {};

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    // Pattern matches t('key.path', 'Default String') or t("key.path", "Default String")
    const regex = /t\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const keys = match[1].split('.');
        let current = result;
        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = current[keys[i]] || {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = match[2];
    }
}

fs.writeFileSync('extracted_en.json', JSON.stringify(result, null, 2));
console.log('Extraction complete! Check extracted_en.json');
