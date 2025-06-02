# TaskMaster CLI — Applied Software Testing Project
TaskMaster CLI is a minimalistic, full-stack TODO application designed and tested for academic and learning purposes. This project was created as part of the "Applied Software Testing" course assignment and demonstrates modern web testing practices including UI, API, and performance testing using Playwright with Page Object Model (POM) and BDD-style test definitions.

## 🎯 Project Objective
This assignment aims to simulate a real-world software testing environment to apply comprehensive testing strategies such as:

- UI Testing (Behavior-Driven Development style)

- API Testing using REST endpoints

- Performance Testing (page load benchmarks)

- Data-driven testing (JSON-based input)

- Reporting using Allure

The testing architecture is built using Playwright with JavaScript and demonstrates POM (Page Object Model) design pattern, JSON-driven data, and test coverage that includes both functional and non-functional aspects of the system.

## 💡 Features
1. Add / Complete / Delete TODOs

2. Filter todos by All / Active / Completed

3. RESTful backend API for TODOs

4. Comprehensive Playwright test suite (20+ test cases)

5. Allure reporting for visual insights

## 🧪 Testing Scope
✅ UI Tests (BDD Style)
* Add todos
* Toggle complete status
* Delete todos
* Filter by completed, active, all
* Input field validations
* Behavior with no todos
* POM-based interactions

✅ API Tests
* GET /todos
* POST /todos
* DELETE /todos/:id
* Validate schema & status codes
* Negative test: invalid payloads

✅ Performance Test
* Page load time under 2s

✅ Additional Tests
* JSON data-driven test cases
* Edge case UI flows
* Input limit checks

## 🛠️ How to Run
### Prerequisites:
* Node.js v18 or above
* VS Code (recommended)
* Bash (for run-tests.sh)

### Step-by-step:

1. Clone the Repository:

```bash
git clone https://github.com/mdazlaanzubair/TaskMasterCli.git
```

```bash
cd taskmaster-cli
```

2. Install Dependencies:

```bash
npm install
```

3. Run Server:

```bash
npm start
```
3. Run Tests:
Back in the root folder:

```bash
./run-tests.sh
```

### This script will:

- Clean old reports
- Run all Playwright tests (UI, API, performance)
- Generate and open Allure Report

### View Allure Report
After running `./run-tests.sh` successfully, Allure report will open in your default browser. If not:

```bash
npx allure generate allure-results --clean -o allure-report
```

```bash
npx allure open allure-report
```

## 🧪 Sample Allure Dashboard
The report includes:

- Passed/failed/skipped test metrics
- Timeline view
- Test severity tagging
- Screenshots and traces for failed tests

## 🧰 Tools & Frameworks Used
* Playwright (UI, API, and Performance testing)
* Allure (Reporting)
* JSON (Data-driven testing)
* Express.js (Mock API backend)
* HTTP-Server (Static frontend serving)
* Bash Shell Script (run-tests.sh)
* Page Object Model (POM) architecture

## 📚 Learning Outcomes

- Mastery over Playwright test automation
- Understanding of API testing alongside UI
- Real-world CI-ready folder structure
- Performance benchmarking using automation
- JSON-driven test design
- Hands-on with Allure reports

## 📄 License
This project is licensed under the MIT License.

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction...

## 🤝 Contributing
This project is academic but open to improvements. Feel free to fork, suggest changes, or open issues.

## 👨‍🎓 Made with ❤️ for the Applied Software Testing course