const fs = require('fs');
const path = require('path');

const vendorFiles = [
  {
    from: 'node_modules/jquery/dist/jquery.min.js',
    to: 'public/js/jquery.min.js'
  },
  {
    from: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    to: 'public/js/bootstrap.min.js'
  },
  {
    from: 'node_modules/slick-carousel/slick/slick.min.js',
    to: 'public/js/slick.min.js'
  },
  {
    from: 'node_modules/nouislider/dist/nouislider.min.js',
    to: 'public/js/nouislider.min.js'
  },
  {
    from: 'node_modules/jquery-zoom/jquery.zoom.min.js',
    to: 'public/js/jquery.zoom.min.js'
  }
];

const projectRoot = path.join(__dirname, '..');

vendorFiles.forEach(({ from, to }) => {
  const sourcePath = path.join(projectRoot, from);
  const destPath = path.join(projectRoot, to);
  const destDir = path.dirname(destPath);

  // Créer le répertoire de destination s'il n'existe pas
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copier le fichier
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copié: ${from} → ${to}`);
  } else {
    console.warn(`⚠ Fichier introuvable: ${sourcePath}`);
  }
});

console.log('✅ Copie des fichiers vendor terminée!');
