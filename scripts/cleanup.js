import fs from 'fs';

const paths = [
  'components/ui',
  'src/components/ui',
  'src/components/InvoiceList.tsx',
  'pnpm-lock.yaml'
];

paths.forEach(p => {
  try {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`Successfully removed: ${p}`);
    }
  } catch (err) {
    console.warn(`Could not remove ${p}: ${err.message}`);
  }
});
