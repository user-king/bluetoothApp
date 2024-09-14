React Native Bluetooth Data Simulation App

Overview

This project is a React Native mobile app that simulates connecting to a Bluetooth device, reading random numerical data, and displaying it in the app. The app can store data locally when offline and sync it to the cloud when connectivity is restored.

Additionally, a CI/CD pipeline is set up using GitHub Actions to automate the build, testing, and deployment process.

Features

Bluetooth Simulation: Simulates connecting to a BLE device and receiving random data.
Offline Data Storage: Stores Bluetooth data locally and syncs it when online.
CI/CD Pipeline: Automates building and testing the app on every push using GitHub Actions.
Error Handling: Provides robust error handling and validation for Bluetooth connections and data.

Prerequisites
Before running the project, ensure you have the following installed on your machine:

Node.js: Download and install from https://nodejs.org.
npm or yarn: Node.js package managers.
React Native CLI: Install the React Native CLI to run the app on a physical device or simulator/emulator.
Git: Version control system.
Bluetooth Adapter: Ensure your system has a Bluetooth adapter that supports BLE peripheral mode (if testing on hardware).

Setup
Follow these steps to set up the project on your local machine.

Clone the repository:

1. git clone https://github.com/user-king/bluetoothApp.git
 cd BluetoothApp

2. Install dependencies:
yarn install

3. Install React Native environment:
Follow the official React Native environment setup guide to install the necessary tools.

4. Running the App on Android Emulator or iOS Simulator:
Android: 
npx react-native run-android

iOS: 
npx react-native run-ios


CI/CD Pipeline
The project includes a basic CI/CD pipeline using GitHub Actions. This pipeline is triggered on every push to the main or develop branches and runs the following tasks:

1. Install dependencies.
2. Build the app.
3. Run automated tests.
4. Notify the user of build success or failure.


Setting up the CI/CD Pipeline

1. Ensure that your project is pushed to a GitHub repository.
2. GitHub Actions will automatically run on every push to the main or develop branch, executing the pipeline described in .github/workflows/ci.yml.

Pipeline Configuration
>The workflow is defined in the .github/workflows/ci.yml file.
>It installs Node.js, runs tests, and builds the app.
>If successful, a notification is sent via GitHub’s UI.


Automated Tests
The app includes a basic automated test to ensure that the Bluetooth simulation works as expected.

Running Tests
To run the tests locally, use the following command:

npm test


License
This project is licensed under the MIT License - see the LICENSE file for details.

