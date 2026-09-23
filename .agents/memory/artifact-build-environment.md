---
name: Artifact build environment
description: Environment-specific behavior when building the Vite artifact outside its managed workflow.
---

Direct Vite production builds for this workspace require both `PORT` and `BASE_PATH` because the artifact config validates them at load time.

**Why:** The managed Replit workflow injects these values, while shell-based verification does not.

**How to apply:** Prefer the managed workflow for normal runs; when running a direct build, set both variables explicitly.