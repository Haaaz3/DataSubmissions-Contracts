# Deployment Guide

This prototype is a static website. The deployable web root is:

```text
outputs/ohds-prototype
```

There is no build step.

## Recommended Oracle Internal Flow

Use this pattern when you want a durable review URL plus quick iteration:

```text
Git commit -> package/static publish -> internal URL -> stakeholder feedback -> next version
```

## Option A: GitHub Pages

Use this when the repository can be shared with the intended reviewers and GitHub Pages is approved.

1. Push the repository to GitHub.
2. In the repository settings, enable Pages with GitHub Actions as the source.
3. Each push to `main` runs `.github/workflows/pages.yml`.
4. Share the Pages URL from the completed workflow run.

This is the fastest path for design feedback loops, but use an Oracle-internal host if the prototype includes customer-identifiable or restricted content.

## Option B: Visual Builder / Visual Builder Studio

Use this if your org already has a Visual Builder instance and wants an Oracle-aligned Redwood/JET review environment.

1. Create an app/project for the prototype.
2. Use `outputs/ohds-prototype` as the static web assets.
3. Publish to a development or review environment.
4. Share the internal URL with reviewers.
5. For each feedback pass, commit changes and publish a new version.

## Option C: OCI Object Storage + API Gateway

Use this if you want a lightweight static-hosting pattern in OCI.

1. Create an Object Storage bucket for the prototype assets.
2. Upload everything inside `outputs/ohds-prototype`.
3. Serve `index.html`, `styles.css`, and `app.js` with correct content types.
4. Put API Gateway or another approved internal gateway in front of the bucket.
5. Restrict access using Oracle-approved controls.

## Versioned Review Pattern

Use a stable `latest` URL for normal review and keep versioned snapshots for feedback traceability:

```text
/latest/
/review/v21/
/review/v22/
```

## Data Caution

This prototype includes Oracle/customer/submission workflow context. Keep it internal or scrub customer-identifiable content before sharing broadly.
