FROM node:24-alpine
WORKDIR /app
COPY src/strategy.mjs src/strategy.mjs
COPY scripts/clockd.mjs scripts/clockd.mjs
USER node
ENTRYPOINT ["node", "scripts/clockd.mjs"]
CMD ["--config", "/data/clock-plan.json", "--state", "/data/account.json"]
