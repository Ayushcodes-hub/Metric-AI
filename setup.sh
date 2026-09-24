#!/usr/bin/env bash
cd "$(dirname "$0")"
cat schema.sql | docker exec -i intel-postgres psql -U intel_user -d intel_engine
