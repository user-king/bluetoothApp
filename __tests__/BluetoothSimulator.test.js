// __tests__/BluetoothSimulator.test.js

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
// import '@testing-library/jest-native/extend-expect';

import App from '../App'; // Your main app component

jest.mock('react-native-ble-plx', () => {
  return {
    BleManager: jest.fn(() => ({
      startDeviceScan: jest.fn(),
      stopDeviceScan: jest.fn(),
    })),
    Device: jest.fn(),
  };
});

describe('Bluetooth Device Data Simulation', () => {
  test('Should read and display random data from Bluetooth device', async () => {
    const { getByTestId } = render(<App />);
    
    const randomDataDisplay = await waitFor(() => getByTestId('random-data'));
    expect(randomDataDisplay).toBeTruthy();
  });
});
