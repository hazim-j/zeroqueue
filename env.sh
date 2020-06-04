#!/bin/bash

export DATABASE_URL=${DATABASE_URL:-'postgres://admin:password@127.0.0.1:5432/zeroqueue_db'}
export REDIS_URL=${REDIS_URL:-'redis://127.0.0.1:6379'}
export SESSION_SECRET=${SESSION_SECRET:-'this-is-a-secret-value-with-at-least-32-characters'}

$1
