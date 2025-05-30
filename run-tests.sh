#!/bin/bash

# Ensure proper environment
if [ ! -f "package.json" ]; then
  echo "Please run this script from the root of your Playwright project."
  exit 1
fi

# Clean previous results
rm -rf playwright-report allure-results allure-report

# Run tests
echo "Running Playwright tests..."
npx playwright test

# Generate Allure report
if [ -d "allure-results" ]; then
  echo "Generating Allure report..."
  npx allure generate allure-results -o allure-report
  npx allure open allure-report
else
  echo "No Allure results found. Test execution might have failed."
fi
