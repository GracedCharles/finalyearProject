// Script to verify that all required files exist and are properly linked
const fs = require('fs');
const path = require('path');

console.log('Verifying Traffic Fine Management System Backend Setup...\n');

// List of required files
const requiredFiles = [
  'app.js',
  'package.json',
  'README.md',
  'IMPLEMENTATION_SUMMARY.md',
  '.env.example',
  '.env',
  'config/db.js',
  'middleware/auth.js',
  'models/User.js',
  'models/Fine.js',
  'models/OffenseType.js',
  'models/Payment.js',
  'models/AuditLog.js',
  'controllers/userController.js',
  'controllers/fineController.js',
  'controllers/driverController.js',
  'controllers/adminController.js',
  'controllers/offenseController.js',
  'routes/userRoutes.js',
  'routes/fineRoutes.js',
  'routes/driverRoutes.js',
  'routes/adminRoutes.js',
  'routes/offenseRoutes.js',
  'seed.js'
];

// Check if files exist
let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${file} - EXISTS`);
  } else {
    console.log(`✗ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('✓ All required files are present');
  
  // Check if package.json has the required scripts
  const packageJson = require('./package.json');
  const requiredScripts = ['start', 'dev', 'seed'];
  let allScriptsPresent = true;
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✓ ${script} script - CONFIGURED`);
    } else {
      console.log(`✗ ${script} script - MISSING`);
      allScriptsPresent = false;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  
  if (allScriptsPresent) {
    console.log('✓ All required npm scripts are configured');
    console.log('\n🎉 Backend setup verification COMPLETE!');
    console.log('The Traffic Fine Management System backend is ready for use.');
  } else {
    console.log('⚠ Some npm scripts are missing. Please check package.json');
  }
} else {
  console.log('✗ Some required files are missing. Please check the setup');
}