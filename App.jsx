// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import React from 'react';
// import type {PropsWithChildren} from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
// } from 'react-native';

// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';

// type SectionProps = PropsWithChildren<{
//   title: string;
// }>;

// function Section({children, title}: SectionProps): React.JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// }

// function App(): React.JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   return (
//     <SafeAreaView style={backgroundStyle}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <ScrollView
//         contentInsetAdjustmentBehavior="automatic"
//         style={backgroundStyle}>
//         <Header />
//         <View
//           style={{
//             backgroundColor: isDarkMode ? Colors.black : Colors.white,
//           }}>
//           <Section title="Step One">
//             Edit <Text style={styles.highlight}>App.tsx</Text> to change this
//             screen and then come back to see your edits.
//           </Section>
//           <Section title="See Your Changes">
//             <ReloadInstructions />
//           </Section>
//           <Section title="Debug">
//             <DebugInstructions />
//           </Section>
//           <Section title="Learn More">
//             Read the docs to discover what to do next:
//           </Section>
//           <LearnMoreLinks />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });

// export default App;


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
