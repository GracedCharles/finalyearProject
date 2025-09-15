import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // For Clerk telemetry errors, we just want to ignore them
    if (error.message && error.message.includes('telemetry')) {
      console.warn('Ignoring telemetry error:', error.message);
      this.setState({ hasError: false, error: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <View className="flex-1 bg-gray-100 p-6 justify-center">
          <Text className="text-2xl text-center text-red-500 mb-4">
            Something went wrong.
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity 
            className="bg-blue-600 p-4 rounded-lg"
            onPress={() => this.setState({ hasError: false, error: undefined })}
          >
            <Text className="text-white text-center font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;