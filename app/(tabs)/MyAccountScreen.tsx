import React from 'react';
import { View,Text,TouchableOpacity,StyleSheet,SafeAreaView,Alert,} from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type MyAccountScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'My Account'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: MyAccountScreenNavigationProp;
}

interface MenuItem {
  title: string;
  icon: string | React.ReactNode;
  onPress: () => void;
}

const MyAccountScreen: React.FC<Props> = ({ navigation }) => {
  const menuItems: MenuItem[] = [
    { 
      title: 'My Profile', 
      icon: <Ionicons name="person-outline" size={24} color="black" />, 
      onPress: () => navigation.navigate('MyProfile') 
    },
    { 
      title: 'Fine History',
    icon: <Ionicons name="clipboard-outline" size={24} color="black" />,
    onPress: () => Alert.alert('Fine History', 'Coming soon!')
  },
  {
    title: 'Offence Register',
    icon: <Ionicons name="document-text-outline" size={24} color="black" />,
    onPress: () => Alert.alert('Offence Register', 'Coming soon!')
  },
  {
    title: 'Help',
    icon: <Ionicons name="help-circle-outline" size={24} color="black" />,
    onPress: () => Alert.alert('Help', 'Coming soon!')
  },
  {
    title: 'Settings',
    icon: <Ionicons name="settings-outline" size={24} color="black" />,
    onPress: () => Alert.alert('Settings', 'Coming soon!')
  },
  {
    title: 'Logout',
    icon: <Ionicons name="log-out-outline" size={24} color="black" />,
    onPress: () => navigation.replace('Login')
  },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Account</Text>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item: MenuItem, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.iconContainer}>
              {typeof item.icon === 'string' ? (
                <Text style={styles.icon}>{item.icon}</Text>
              ) : (
                item.icon
              )}
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 40,
    color: '#000',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    backgroundColor: '#e6f7ffff',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#dcf6fdff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#e6f7ffff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 20,
  },
  menuText: {
    fontSize: 18,
    color: '#444545ff',
    fontWeight: '500',
  },
});

export default MyAccountScreen;