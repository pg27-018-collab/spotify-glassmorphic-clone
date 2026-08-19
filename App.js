import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

// Production Vercel Deployment URL where the web app is hosted
const WEB_APP_URL = 'https://spotify-glassmorphic-clone.vercel.app';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070b19" />
      <WebView 
        source={{ uri: WEB_APP_URL }} 
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b19',
  },
  webview: {
    flex: 1,
    backgroundColor: '#070b19',
  },
});
