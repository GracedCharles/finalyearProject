import React, { useState } from 'react';
import { View, Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type MyProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyProfile'>;

interface Props {
  navigation: MyProfileScreenNavigationProp;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface ProfileItemProps {
  icon: string;
  title: string;
  value: string;
}

const MyProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [profileData] = useState<ProfileData>({
    name: 'Charles Mitiwe',
    email: 'charlesmitiwe@gmail.com',
    phone: '0881124333',
    password: '********',
  });

  const ProfileItem: React.FC<ProfileItemProps> = ({ icon, title, value }) => (
    <View style={styles.profileItem}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconPlaceholder}>{icon}</Text>
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileTitle}>{title}</Text>
        <Text style={styles.profileValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <View style={styles.avatarPlaceholder} />
            <TouchableOpacity style={styles.cameraButton}>
              <Icon name="camera-alt" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileContainer}>
          <ProfileItem icon="👤" title="Name" value={profileData.name} />
          <ProfileItem icon="✉️" title="Email" value={profileData.email} />
          <ProfileItem icon="📱" title="Phone Number" value={profileData.phone} />
          <ProfileItem icon="🔒" title="Password" value={profileData.password} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatar: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#87CEEB',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    flex: 1,
  },
  profileItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#87CEEB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconPlaceholder: {
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 5,
  },
  profileValue: {
    fontSize: 16,
    color: '#666',
  },
});

export default MyProfileScreen;