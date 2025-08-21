#!/bin/bash

DEV_ENV_DIR="/tmp/polymesh-dev-env"
TEST_DIR="$DEV_ENV_DIR/tests"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SDK_DIR="$SCRIPT_DIR/.."
SDK_DIST_DIR="$SDK_DIR/dist"
COMPOSE_ENV="../envs/latest"

echo "[SDK] cloning dev env"
git clone https://github.com/PolymeshAssociation/polymesh-dev-env.git "$DEV_ENV_DIR"

# register a cleanup function to keep the env clean
function cleanup() {
    echo "cleaning up test environment"

    cd "$TEST_DIR"
    yarn test:stop

    cd "$SDK_DIR/dist"
    rm -rf "$DEV_ENV_DIR"
}
trap cleanup EXIT

cd "$SDK_DIR"

# Enable corepack to use correct Yarn version
corepack enable

# Build the SDK
yarn
yarn build:ts

cp package.json dist/package.json

cd "$TEST_DIR"

# Enable corepack for test environment
corepack enable

# Link the built SDK version
echo "[SDK] Linking built SDK version"
yarn link "$SDK_DIST_DIR"

# Install integration test packages
echo "[SDK] Installing dependencies"
yarn install

# Run the tests and capture the exit code
echo "[SDK] Running tests"
yarn test
