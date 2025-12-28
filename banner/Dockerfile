FROM node:22-alpine

RUN apk add --no-cache bash

RUN npm install -g wrangler@latest

WORKDIR /app
COPY . .

# Defaults
ENV R2_BUCKET="cookie-confirm-production"
ENV R2_PREFIX=""
ENV STAY_RUNNING="true"

# Nodig als je token meerdere accounts heeft
ENV CLOUDFLARE_ACCOUNT_ID="0c58a19e78f8dab965f667c775da5c51"

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
