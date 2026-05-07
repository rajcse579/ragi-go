const { GoogleAuth } = require('google-auth-library');
const { execSync } = require('child_process');
const path = require('path');

async function deploy() {
  const rootDir = 'c:/Users/Rajesh/OneDrive/Desktop/My_Files/Projects/ragi_go/ragi_go_app';
  const keyFilePath = path.join(rootDir, 'service-account.json');

  console.log('Deploying to Firebase Hosting...');
  try {
    // Setting environment variable for firebase-tools to pick up
    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFilePath;
    execSync(`npx firebase deploy --only hosting --project ragi-go`, { stdio: 'inherit', cwd: rootDir });
    console.log('Firebase Deployment Successful!');
  } catch (e) {
    console.error('Firebase Deployment Failed:', e.message);
  }
}

deploy().catch(console.error);
