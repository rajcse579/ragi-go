const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function deploy() {
  const rootDir = 'c:/Users/Rajesh/OneDrive/Desktop/My_Files/Projects/ragi_go/ragi_go_app';
  const auth = new GoogleAuth({
    keyFile: path.join(rootDir, 'service-account.json'),
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const projectId = 'ragi-go';
  const region = 'us-central1';
  const serviceName = 'ragi-go-api';
  const bucketName = `${projectId}-deploy-source`;

  const cloudbuild = google.cloudbuild('v1');
  const storage = google.storage('v1');
  const run = google.run('v1');

  console.log('--- Zipping Source ---');
  const zipPath = path.join(__dirname, 'source.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  const zipFinished = new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
  });

  archive.pipe(output);
  // Zip the backend source, excluding binary/temp files
  archive.directory(path.join(rootDir, 'ragi-go-api/'), false, (entry) => {
    if (entry.name.includes('target') || entry.name.includes('.gradle') || entry.name.includes('.mvn') || entry.name.includes('bin') || entry.name.includes('build')) {
      return false;
    }
    return entry;
  });
  await archive.finalize();
  await zipFinished;
  console.log('Zip created.');

  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  console.log('--- Checking/Creating Bucket ---');
  try {
    await storage.buckets.insert({ project: projectId, requestBody: { name: bucketName } });
  } catch (e) {
    if (e.code !== 409) throw e; // 409 = already exists
  }

  console.log('--- Uploading Source ---');
  await storage.objects.insert({
    bucket: bucketName,
    name: 'source.zip',
    media: { body: fs.createReadStream(zipPath) },
  });

  console.log('--- Triggering Cloud Build ---');
  const buildRes = await cloudbuild.projects.builds.create({
    projectId,
    requestBody: {
      source: {
        storageSource: {
          bucket: bucketName,
          object: 'source.zip',
        },
      },
      steps: [
        {
          name: 'gcr.io/cloud-builders/docker',
          args: ['build', '-t', `gcr.io/${projectId}/${serviceName}`, '.'],
        },
        {
          name: 'gcr.io/cloud-builders/docker',
          args: ['push', `gcr.io/${projectId}/${serviceName}`],
        },
      ],
      images: [`gcr.io/${projectId}/${serviceName}`],
    },
  });

  const buildId = buildRes.data.metadata.build.id;
  console.log(`Build started: ${buildId}`);

  // Poll for build status
  let buildStatus = 'WORKING';
  while (buildStatus === 'WORKING' || buildStatus === 'QUEUED') {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await cloudbuild.projects.builds.get({ projectId, id: buildId });
    buildStatus = statusRes.data.status;
    console.log(`Build status: ${buildStatus}`);
  }

  if (buildStatus !== 'SUCCESS') {
    throw new Error(`Build failed with status: ${buildStatus}`);
  }

  console.log('--- Deploying to Cloud Run ---');
  const runRegional = google.run({
    version: 'v1',
    rootUrl: `https://${region}-run.googleapis.com`
  });

  try {
    // Attempt to update existing service
    await runRegional.namespaces.services.replaceService({
      name: `namespaces/${projectId}/services/${serviceName}`,
      requestBody: {
        apiVersion: 'serving.knative.dev/v1',
        kind: 'Service',
        metadata: { name: serviceName, namespace: projectId },
        spec: {
          template: {
            spec: {
              containers: [{ 
                image: `gcr.io/${projectId}/${serviceName}`,
                env: [{ name: 'DEPLOY_TIMESTAMP', value: new Date().toISOString() }]
              }],
            },
          },
        },
      },
    });
    console.log('Deployment updated successfully.');
  } catch (err) {
    if (err.code === 404) {
      // Create new service if it doesn't exist
      await runRegional.namespaces.services.create({
        parent: `namespaces/${projectId}`,
        requestBody: {
          apiVersion: 'serving.knative.dev/v1',
          kind: 'Service',
          metadata: { name: serviceName, namespace: projectId },
          spec: {
            template: {
              spec: {
                containers: [{ 
                  image: `gcr.io/${projectId}/${serviceName}`,
                  env: [{ name: 'DEPLOY_TIMESTAMP', value: new Date().toISOString() }]
                }],
              },
            },
          },
        },
      });
      console.log('Deployment created successfully.');
    } else {
      throw err;
    }
  }

  console.log('Deployment triggered.');
  console.log('Please check Cloud Run console for the URL.');
}

deploy().catch(console.error);
