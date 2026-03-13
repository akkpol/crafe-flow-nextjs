#!/bin/bash
set -e

echo "Starting setup..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Run the build
echo "Running build..."
npm run build

# Run linting and try to fix automatically
echo "Running lint with --fix..."
npm run lint -- --fix || true

# Run tests
echo "Running tests..."
npm run test

echo "Setup completed successfully."
