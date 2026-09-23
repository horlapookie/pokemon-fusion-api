---
name: GitHub Pages connector limits
description: Constraints observed when pushing repositories and GitHub Pages workflows through the connected GitHub integration.
---

Repository content can be pushed through GitHub's Git Data API, including binary assets, but workflow files under `.github/workflows` may be rejected by the connector even when ordinary repository writes succeed. GitHub Pages also cannot run the project's Express API; it can only host a separately built static frontend.

**Why:** The connected GitHub account had repository push/admin access, but workflow-path writes and branch updates for a workflow commit were rejected while normal source and asset commits succeeded.

**How to apply:** Verify the repository commit and Pages configuration separately. Do not claim a GitHub Pages deployment exists unless the Pages endpoint or an Actions run confirms it.