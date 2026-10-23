# Source export

Original source snapshot: `0d777683beb0e1fb2822bf9071fd1a480e00ac28`. This is a clean source export, not a mirror of deployment history.

## License
Original software code and the simple geometric SVG placeholder are licensed under MIT (LICENSE). Third-party code retains its original licenses and notices. The MIT grant does not cover original writings, photos, PDFs, research datasets or third-party content. Fictional in-app examples remain identified as examples.

## Run
Serve `dist/` with `python3 -m http.server 4173 --directory dist`. Where package.json defines tests, run `npm test`. The SIBIR and Starhaven builds use `python3 assemble.py` without installing dependencies.

## Export changes
Original deployment identity, analytics hook, deployment-specific sitemap and research/marketing bookkeeping were omitted. Original binary art/PDFs were omitted; affected illustrations use a neutral geometric SVG and the paper PDF link is removed. Existing README may describe the live edition and artwork not included here. No personal records, runtime storage, credentials, or Git history are included.

Omitted files:
- .openai/hosting.json

The optional browser test now uses a separately installed Playwright package (or PLAYWRIGHT_PATH) and CHROMIUM_PATH override instead of author-machine paths. Browser tests were not run for this export; core Node tests passed.
