#!/usr/bin/env bash
set -euo pipefail

# Standaardwaarden
ENVIRONMENT="Staging"
ENV_FILE=".env"
AWS_REGION="eu-west-3"        # Regio vast op Parijs
AWS_PROFILE="cookieconfirm"   # AWS profielnaam

usage() {
    echo "Gebruik: $0 [-e environment] [-f env_file]"
    echo
    echo "  -e  Environment naam (default: local)"
    echo "  -f  Pad naar .env bestand (default: .env)"
    exit 1
}

while getopts ":e:f:h" opt; do
  case $opt in
    e)
      ENVIRONMENT="$OPTARG"
      ;;
    f)
      ENV_FILE="$OPTARG"
      ;;
    h|\?)
      usage
      ;;
  esac
done

if ! command -v aws >/dev/null 2>&1; then
    echo "FOUT: aws CLI niet gevonden. Installeer awscli eerst."
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "FOUT: .env bestand '$ENV_FILE' bestaat niet."
    exit 1
fi

echo "Environment: $ENVIRONMENT"
echo "Env file:    $ENV_FILE"
echo "Region:      $AWS_REGION"
echo "Profile:     $AWS_PROFILE"
echo

while IFS= read -r line || [ -n "$line" ]; do
    # Trim leading/trailing whitespace op volledige regel
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"

    # Sla lege regels en comments over
    [[ -z "$line" ]] && continue
    [[ "$line" == \#* ]] && continue
    [[ "$line" != *=* ]] && continue

    # Split key en value op eerste '='
    key="${line%%=*}"
    value="${line#*=}"

    # Trim spaties rond key
    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"

    # Trim spaties rond value
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"

    # Strip omringende quotes (enkel/dubbel) als beide kanten gequote zijn
    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
        value="${value:1:-1}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
        value="${value:1:-1}"
    fi

    param_name="/CookieConfirm${ENVIRONMENT}/${key}"

    # BESTAAT PARAMETER AL?
    if aws ssm get-parameter \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION" \
        --name "$param_name" >/dev/null 2>&1; then

        echo "Parameter bestaat al: $param_name"
        read -r -p "Wil je deze overschrijven? [y/N] " answer

        case "$answer" in
            y|Y|yes|YES)
                echo "Overschrijven van $param_name..."
                aws ssm put-parameter \
                    --profile "$AWS_PROFILE" \
                    --region "$AWS_REGION" \
                    --name "$param_name" \
                    --type String \
                    --value "$value" \
                    --overwrite >/dev/null
                echo "OK"
                ;;
            *)
                echo "Overgeslagen"
                ;;
        esac
    else
        echo "Aanmaken parameter: $param_name"
        aws ssm put-parameter \
            --profile "$AWS_PROFILE" \
            --region "$AWS_REGION" \
            --name "$param_name" \
            --type String \
            --value "$value" >/dev/null
        echo "OK"
    fi

done < "$ENV_FILE"

echo
echo "Klaar. Alle parameters gepusht naar $AWS_REGION onder /cc/$ENVIRONMENT/."

#./import-env.sh -e production -f ../platform/.env.production
