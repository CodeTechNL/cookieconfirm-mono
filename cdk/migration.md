### Copy RDS snapshot to another region
```shell
aws rds copy-db-snapshot \
  --region eu-west-3 \
  --source-db-snapshot-identifier arn:aws:rds:eu-central-1:585008041582:snapshot:cc-migration-example \
  --target-db-snapshot-identifier migration-test \
  --kms-key-id arn:aws:kms:eu-west-3:585008041582:key/6905e9c2-704b-4790-b4c6-6422b6136178 \
  --source-region eu-central-1 \
  --profile cookieconfirm
```

### Copy db to AWS
```shell
aws s3 cp dump.sql s3://cc-mysql-dumps/ --profile=cookieconfirm
```

### Copy from S3 to machine
```shell
aws s3 cp s3://cc-mysql-dumps/dump.sql ./dump.sql
```

### Import database
```shell
mysql \
  -h cc-cdk-sample-database.clyukyamot25.eu-west-3.rds.amazonaws.com \
  -u TODO1234 \
  -p \
  cookie_confirm \
  < dump_fixed.sql
```

### Drop database and create
```shell
mysql \
  -h cc-cdk-sample-database.clyukyamot25.eu-west-3.rds.amazonaws.com \
  -u TODO1234 \
  -p \
  -e "DROP DATABASE cookie_confirm; CREATE DATABASE cookie_confirm;"
```

### Repair SQL
```shell
sed -E '
/GTID_PURGED/d;
s/DEFINER[ ]*=`[^`]*`@`[^`]*`/DEFINER=CURRENT_USER/g;
' dump.sql > dump_fixed.sql
```
