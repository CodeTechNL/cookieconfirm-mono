#!/usr/bin/env bash
set -euo pipefail

SOURCE_REGION="eu-central-1"
TARGET_REGION="eu-west-3"

SNAPSHOT_ARN="arn:aws:rds:eu-central-1:585008041582:snapshot:cdk-test-snapshot"
TARGET_SNAPSHOT_ID="cdk-test-snapshot-copy"

# VUL HIER JE KMS KEY UIT eu-west-3 IN
# Voorbeeld ARN:
# TARGET_KMS_KEY_ID="arn:aws:kms:eu-west-3:585008041582:key/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
TARGET_KMS_KEY_ID="arn:aws:kms:eu-west-3:585008041582:key/6905e9c2-704b-4790-b4c6-6422b6136178"

if [[ "$TARGET_KMS_KEY_ID" == "VUL_HIER_JE_KMS_KEY_IN" ]]; then
  echo "FOUT: TARGET_KMS_KEY_ID is niet ingevuld. Vul je KMS key uit $TARGET_REGION in."
  exit 1
fi

echo "Kopie maken van snapshot:"
echo "  Source ARN:     $SNAPSHOT_ARN"
echo "  Source region:  $SOURCE_REGION"
echo "  Target region:  $TARGET_REGION"
echo "  Target name:    $TARGET_SNAPSHOT_ID"
echo "  Target KMS key: $TARGET_KMS_KEY_ID"
echo

aws rds copy-db-snapshot \
  --source-db-snapshot-identifier "$SNAPSHOT_ARN" \
  --target-db-snapshot-identifier "$TARGET_SNAPSHOT_ID" \
  --source-region "$SOURCE_REGION" \
  --region "$TARGET_REGION" \
  --kms-key-id "$TARGET_KMS_KEY_ID" \
  --profile=cookieconfirm

echo "Snapshot kopie gestart..."
echo "Status controleren (elke 5 seconden)..."
echo

while true; do
  STATUS=$(aws rds describe-db-snapshots \
      --db-snapshot-identifier "$TARGET_SNAPSHOT_ID" \
      --region "$TARGET_REGION" \
      --profile=cookieconfirm \
      --query "DBSnapshots[0].Status" \
      --output text 2>/dev/null || echo "pending")

  echo "Huidige status: $STATUS"

  if [[ "$STATUS" == "available" ]]; then
      echo
      echo "Snapshot is volledig beschikbaar in $TARGET_REGION als '$TARGET_SNAPSHOT_ID'."
      exit 0
  fi

  sleep 5
done
