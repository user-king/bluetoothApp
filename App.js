import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, PermissionsAndroid, Platform, Alert, ScrollView } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

const App = () => {
  const [bleManager] = useState(new BleManager());
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [data, setData] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [storedData, setStoredData] = useState([]);

  // Request Bluetooth and Location Permissions on Android
  useEffect(() => {
    requestPermissions();
    return () => {
      bleManager.destroy();
    };
  }, []);

  // Check Network Connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });

    loadStoredData();
    return () => unsubscribe();
  }, []);

  // Request Permissions (for Android only)
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required for Bluetooth scanning.');
      }
    }
  };

  // Start Scanning for Bluetooth Devices
  const startScan = () => {
    setDevices([]);
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }
      if (device && device.name) {
        setDevices((prevDevices) => {
          const deviceExists = prevDevices.find((d) => d.id === device.id);
          if (!deviceExists) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });
  };

  // Stop Scanning
  const stopScan = () => {
    bleManager.stopDeviceScan();
  };

  // Connect to Bluetooth Device
  const connectToDevice = async (device) => {
    try {
      const connectedDevice = await bleManager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connectedDevice);
      simulateDataReading();
    } catch (error) {
      console.error(error);
      Alert.alert('Connection Failed', 'Unable to connect to the device.');
    }
  };

  // Simulate Data Reading (Random Numerical Data)
  const simulateDataReading = () => {
    const interval = setInterval(() => {
      const randomData = (Math.random() * 100).toFixed(2); // Generate random data
      setData(randomData);
      storeDataLocally(randomData);
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  };

  // Store Data Locally using AsyncStorage
  const storeDataLocally = async (data) => {
    try {
      
      const stored = await AsyncStorage.getItem('bluetoothData');
      const currentData = stored ? JSON.parse(stored) : [];
      const newData = [...currentData, { data, timestamp: new Date() }];
      await AsyncStorage.setItem('bluetoothData', JSON.stringify(newData));
      setStoredData(newData);

      if (isOnline) {
        syncToCloud(newData);
      }
    } catch (error) {
      console.error('Error storing data locally', error);
    }
  };

  // Load Stored Data from AsyncStorage
  const loadStoredData = async () => {
    try {
      const stored = await AsyncStorage.getItem('bluetoothData');
      if (stored) {
        setStoredData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading stored data', error);
    }
  };

  // Sync Data to the Cloud (Mock API)
  const syncToCloud = async (data) => {
    try {
      await axios.post('https://your-cloud-api.com/sync', { data });
      Alert.alert('Sync Success', 'Data has been synced to the cloud.');
    } catch (error) {
      console.error('Error syncing data to the cloud', error);
      Alert.alert('Sync Failed', 'Unable to sync data to the cloud.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Bluetooth Devices</Text>

      {connectedDevice ? (
        <View>
          <Text>Connected to: {connectedDevice.name}</Text>
          <Text>Current Data: {data}</Text>
        </View>
      ) : (
        <>
          <Button title="Start Scan" onPress={startScan} />
          <Button title="Stop Scan" onPress={stopScan} />

          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => connectToDevice(item)}>
                <Text style={{ padding: 10 }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      <ScrollView style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18 }}>Stored Data:</Text>
        {storedData.map((item, index) => (
          <Text key={index}>
            {item.data} - {new Date(item.timestamp).toLocaleString()}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default App;
