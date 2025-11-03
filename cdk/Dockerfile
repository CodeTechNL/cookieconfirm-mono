# cdk/docker/esbuild-node22/Dockerfile
FROM public.ecr.aws/docker/library/node:22-alpine
RUN apk add --no-cache bash && npm i -g esbuild
WORKDIR /asset-input
ENTRYPOINT ["bash", "-lc"]
