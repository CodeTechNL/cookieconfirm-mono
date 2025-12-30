FROM public.ecr.aws/lambda/nodejs:20

# Tools die je entrypoint nodig heeft: bash + find
RUN dnf install -y bash findutils \
 && dnf clean all

# Wrangler installeren
RUN npm install -g wrangler@latest

ARG VITE_CDN_URL
ENV VITE_CDN_URL=$VITE_CDN_URL

RUN echo "URL: $VITE_CDN_URL"


# Project in image (read-only bij runtime)
WORKDIR /opt/app
COPY . /opt/app

# Entrypoint + handler
COPY entrypoint.sh /entrypoint.sh
COPY lambda-handler.mjs ${LAMBDA_TASK_ROOT}/lambda-handler.mjs
RUN chmod +x /entrypoint.sh

# Wrangler / CI: geen prompts
ENV CI="true"
ENV WRANGLER_SEND_METRICS="false"

# Lambda handler
CMD ["lambda-handler.handler"]
