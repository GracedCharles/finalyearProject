import React, { useState } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,SafeAreaView,ScrollView,Alert,} from 'react-native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type IssueFineProps = {
  navigation: NativeStackNavigationProp<any>;
};

const IssueFine = ({ navigation }: IssueFineProps) => {
  const [formData, setFormData] = useState({
    offenderName: '',
    vehicleReg: '',
    driverLicenseNumber: '',
    offense: '',
    phoneNumber: '',
    email: '',
  });

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIssueFine = () => {
    const { offenderName, vehicleReg, driverLicenseNumber, offense, phoneNumber, email } = formData;

    if (!offenderName || !vehicleReg || !driverLicenseNumber || !offense || !phoneNumber || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert('Success', 'Fine issued successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Issue fine</Text>
      </View>

      <ScrollView style={styles.content}
          contentContainerStyle = {{marginTop:40}}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Offender's Name</Text>
          <TextInput
            style={styles.input}
            value={formData.offenderName}
            onChangeText={(value) => updateFormData('offenderName', value)}
            placeholder="Enter offender's name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vehicle Registration Number</Text>
          <TextInput
            style={styles.input}
            value={formData.vehicleReg}
            onChangeText={(value) => updateFormData('vehicleReg', value)}
            placeholder="Enter vehicle registration"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Driver's License Number</Text>
          <TextInput
            style={styles.input}
            value={formData.driverLicenseNumber}
            onChangeText={(value) => updateFormData('driverLicenseNumber', value)}
            placeholder="Enter driver's license Number"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Offense</Text>
          <TextInput
            style={styles.input}
            value={formData.offense}
            onChangeText={(value) => updateFormData('offense', value)}
            placeholder="Enter offense"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(value) => updateFormData('phoneNumber', value)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.issueButton} onPress={handleIssueFine}>
          <Text style={styles.issueButtonText}>Issue fine</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    fontSize: 16,
    color: '#2196F3',
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  issueButton: {
    backgroundColor: '#2196F3',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 30,
    marginBottom: 40,
  },
  issueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default IssueFine;
