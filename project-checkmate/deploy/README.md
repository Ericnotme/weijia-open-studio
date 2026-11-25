# Existing ECS deployment: operator runbook

This is an isolated static release to the existing weijia-lab.com nginx vhost, not a new Netlify site and not a homepage replacement. The script is not a remote execution facility. Review the public source and verify the chosen commit before running.

On 2026-11-25 the first production attempt failed its HTML readback and automatically restored the prior nginx configuration. The nginx error log showed that a file `alias` for the trailing-slash HTML URI caused the index module to look for `index.htmlindex.html`. Route version 2 uses `root <release>; try_files /index.html =404;` for the exact HTML location and retains file aliases for the JavaScript modules. `ROUTE_VERSION` is included in the release digest, so this retry has a new release and journal identity even with identical asset bytes. Preserve the failed attempt's journal and configuration backup; never delete or overwrite them to force a retry.

Local mocked tests cover deployment control flow, locking, response checks and rollback, but do not exercise nginx's URI mapping or TLS behavior. Those tests did not detect the first attempt's alias problem. `preflight` performs read-only baseline and parser checks; it does not execute `nginx -t`. Before publishing route version 2, test the generated locations using real nginx on an isolated loopback-only temporary port, verify the returned HTML and JavaScript bytes and MIME types, then run the production preflight under the shared lock. The corrected version is not considered deployed until actual origin and independent public checks pass.

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
