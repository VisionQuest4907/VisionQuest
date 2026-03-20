#!/usr/bin/env node
/**
 * PRDM9 / DMSF4 / FRDM4 — Asset inventory generator.
 * Reads package.json and emits dependencies, containers, DB collections, and cloud services.
 * Writes docs/asset-inventory.json and docs/asset-inventory.csv.
 * No application code or server started; safe to run anytime.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');

function loadPackageJson() {
  const p = path.join(ROOT, 'package.json');
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

function escapeCsv(s) {
  if (s == null) return '';
  const str = String(s);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function main() {
  const pkg = loadPackageJson();
  const now = new Date().toISOString();

  const dependencies = Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
    name,
    version,
    type: 'npm',
    source: 'package.json',
  }));

  const containers = [
    { name: 'visionquest-api', image: 'node:18-alpine', port: 5000, source: 'docker-compose.yml' },
    { name: 'visionquest-api-ci', image: 'node:18-alpine', port: null, source: '.github/workflows/ci.yml' },
  ];

  const databaseCollections = [
    { collection: 'users', model: 'User', source: 'models/users.js' },
    { collection: 'modules', model: 'Modules', source: 'models/training_modules.js' },
    { collection: 'logs', model: 'Log', source: 'models/logs.js' },
  ];

  const cloudServices = [
    { service: 'GitHub Actions', purpose: 'CI (build, test, audit, artifact)', source: '.github/workflows/ci.yml' },
    { service: 'AWS Elastic Beanstalk', purpose: 'Backend hosting', source: 'deployment' },
    { service: 'MongoDB Atlas (or self-hosted)', purpose: 'Database', source: 'MONGO_URI' },
  ];

  const runtimeAssets = [
    { asset: 'Node.js', version: '18', source: 'Dockerfile / CI' },
    { asset: 'Environment config', details: '.env (MONGO_URI, JWT_SECRET, PORT, NODE_ENV, CORS_ORIGINS)', source: 'config/env.js' },
  ];

  const inventory = {
    generatedAt: now,
    repo: 'VisionQuest-devops-daksh',
    requirement: 'PRDM9 / DMSF4 / FRDM4',
    dependencies,
    containers,
    databaseCollections,
    cloudServices,
    runtimeAssets,
  };

  if (!fs.existsSync(DOCS)) fs.mkdirSync(DOCS, { recursive: true });

  const jsonPath = path.join(DOCS, 'asset-inventory.json');
  fs.writeFileSync(jsonPath, JSON.stringify(inventory, null, 2), 'utf8');
  console.log('Wrote', jsonPath);

  const rows = [
    ['category', 'asset_type', 'name', 'version_or_details', 'source'],
    ...dependencies.map((d) => ['dependencies', 'npm', d.name, d.version, d.source]),
    ...containers.map((c) => ['containers', 'docker', c.name, c.image + (c.port ? ` port ${c.port}` : ''), c.source]),
    ...databaseCollections.map((d) => ['database_collections', 'mongodb', d.collection, d.model, d.source]),
    ...cloudServices.map((c) => ['cloud_services', 'service', c.service, c.purpose, c.source]),
    ...runtimeAssets.map((r) => ['runtime_assets', 'config', r.asset, r.version || r.details, r.source]),
  ];

  const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const csvPath = path.join(DOCS, 'asset-inventory.csv');
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log('Wrote', csvPath);
  console.log('Asset inventory generated successfully.');
}

main();
