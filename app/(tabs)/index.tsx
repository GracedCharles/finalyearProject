import { Image } from 'expo-image';
// Removed direct import of IssueFine screen
import { Platform, StyleSheet } from 'react-native';
import {View,Text,TouchableOpacity,SafeAreaView,ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';

interface Props {
  navigation: any; // Replace 'any' with the correct type if you use a navigation library like React Navigation
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {

  const router = useRouter();

  return (
   
   <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>John Doe</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/screens/issueFine")}
          >
            <Icon name="add" size={30} color="#fff" />
            <Text style={styles.primaryButtonText}>Issue a fine</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}
            onPress={() => {}}>
            <Text style={styles.secondaryButtonText}>View Issued Fines</Text>
          </TouchableOpacity>
        </View>

        

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent fines issued</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  greeting: {
    fontSize: 32,
    color: '#333',
    marginBottom: 5,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  actionButtons: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    paddingVertical: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  secondaryButton: {
    backgroundColor: '#b9ffeaff',
    borderRadius: 15,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#3c3b3bff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  recentSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#6a6a6aff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;