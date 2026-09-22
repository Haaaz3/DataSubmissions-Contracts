# HDIDS Design Lab Prototype

Static clickable prototype for Oracle Health Data Submissions design review across MVP Submission, Hospital Quality Reporting, APP Plus, QRDA, and the Production Today control.

## Run Locally

```bash
npm run start
```

Open:

```text
http://127.0.0.1:4173/index.html
```

## Validate

```bash
npm run check
```

## Package

```bash
npm run package
```

This creates:

```text
hdids-design-lab-prototype.tar.gz
```

The archive includes only the runnable prototype files. Local video/PDF review artifacts are kept out of the deployable package.

## Deploy Internally

Recommended Git-backed path:

1. Store this project in Git.
2. Publish `outputs/ohds-prototype` as the static web root.
3. Use the included GitHub Pages workflow when GitHub Pages is approved for the repo.
4. Use Visual Builder Studio or OCI Object Storage + API Gateway if Oracle-internal hosting is required.
5. Keep one stable review URL for `latest`.
6. Tag or archive each feedback version, such as `v21`, `v22`, and `v23`.

See [Deployment Guide](DEPLOYMENT.md).

## Prototype Versioning

The visible prototype version is shown in the app footer and tracked in [CHANGELOG.md](CHANGELOG.md).
