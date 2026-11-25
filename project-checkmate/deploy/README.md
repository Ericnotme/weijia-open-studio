# Existing ECS deployment: operator runbook

This is an isolated static release to the existing weijia-lab.com nginx vhost, not a new Netlify site and not a homepage replacement. The script is not a remote execution facility. It has not yet been executed on production. Review the public source and verify the chosen commit before running.

In the **existing authenticated ECS Workbench terminal**, from a private staging directory:

```sh
git clone --branch project-checkmate --single-branch --depth 1 https://github.com/Ericnotme/weijia-open-studio.git checkmate-release
cd checkmate-release
git rev-parse HEAD
node project-checkmate/checker.test.mjs  # if Node.js already available; otherwise run on a trusted workstation first
sudo python3 project-checkmate/deploy/publish.py preflight
sudo python3 project-checkmate/deploy/publish.py publish
```

The script shares the existing site deployment lock, refuses unexpected vhost/root or an existing CHECKMATE route, stages exactly three immutable static assets, validates nginx before reload, compares local HTTPS responses and MIME types and preserves homepage, RT5 board and RT5 API status. It saves a root-only config backup and restores it on failed validation. After success, copy the printed release hash. Verify externally `https://weijia-lab.com/research/solving-chess/`, the two modules, UI, real GitHub data fetch and mobile display. GitHub API access from mainland clients may fail; the UI makes that explicit. A same-origin mirror is a future enhancement, not already deployed. No secret or GitHub token is needed; do not put credentials in public files.

Rollback only when the exact configuration from this installation is still active:

```sh
sudo python3 project-checkmate/deploy/publish.py rollback --revision <printed-release-hash>
```

If the known root, RT5 baseline or config differs, stop and investigate rather than overwrite. Do not use this first-install script for an update without a separately reviewed update plan.
