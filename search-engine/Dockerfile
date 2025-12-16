FROM getmeili/meilisearch:v1.29.0

# AWS Lambda Web Adapter (Function URL -> jouw app op 7700)
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.1 \
  /lambda-adapter /opt/extensions/lambda-adapter

## Meilisearch + Web Adapter defaults (CDK env vars mogen dit overrulen)
#ENV MEILI_HTTP_ADDR=0.0.0.0:7700
#ENV MEILI_ENV=production
#
#ENV AWS_LWA_PORT=7700
#ENV AWS_LWA_READINESS_CHECK_PATH=/health
#ENV AWS_LWA_READINESS_CHECK_PORT=7700
#
## Let Meilisearch use EFS (mounted in Lambda at /mnt/efs)
#ENV MEILI_DB_PATH=/mnt/efs/data
#ENV MEILI_DUMPS_DIR=/mnt/efs/dumps
#ENV MEILI_SNAPSHOTS_DIR=/mnt/efs/snapshots

CMD ["meilisearch"]
