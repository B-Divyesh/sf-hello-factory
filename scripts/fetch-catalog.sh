#!/usr/bin/env bash
set -euo pipefail

destination="${1:-.factory/input/latest-catalog.json}"
temporary="${destination}.download"
mkdir -p "$(dirname "$destination")"
az storage blob download \
  --account-name sociobotblob \
  --container-name factory-evidence \
  --name hello-factory-controller/input/latest-catalog.json \
  --file "$temporary" \
  --auth-mode login \
  --overwrite true \
  --no-progress \
  --only-show-errors \
  --output none
node -e 'const fs=require("node:fs");const p=process.argv[1];const x=JSON.parse(fs.readFileSync(p,"utf8"));if(!x.catalog||!x.details||!x.images)throw new Error("Invalid catalogue snapshot")' "$temporary"
mv "$temporary" "$destination"
echo "Fetched the authorized Hello Factory catalogue snapshot."
