import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
}

class TextRenderingErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    if (error.message.includes('Text strings must be rendered')) {
      console.error('🚨 Text Rendering Error Caught:', error);
      console.error('🚨 Error Stack:', error.stack);
      return { hasError: true, error };
    }
    return { hasError: false, error: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (error.message.includes('Text strings must be rendered')) {
      console.error('🚨 Text Rendering Error Info:', errorInfo);
      console.error('🚨 Component Stack:', errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>텍스트 렌더링 오류</Text>
          <Text style={styles.errorMessage}>
            Text strings must be rendered within a Text component
          </Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff5f5',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e53e3e',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: '#c53030',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 12,
    color: '#9c4221',
    textAlign: 'center',
  },
});

export default TextRenderingErrorBoundary;