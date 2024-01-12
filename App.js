import React, {useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import WebView from 'react-native-webview';

import INJECTED_JAVASCRIPT_, {BASE_URL, injectedCodeForAlert} from './injectedCode';

const Error = err => <Text>{err}</Text>;

const App = () => {
  const webRef = useRef();

  const onAndroidBackPress = () => {
    if (webRef.current) {
      webRef.current.goBack();
      return true; // prevent default behavior (exit app)
    }
    return false;
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener(
          'hardwareBackPress',
          onAndroidBackPress,
        );
      };
    }
  }, []);

  const _onMessage = msg => {
    let data = JSON.parse(msg.nativeEvent.data);
    console.log(data?.response);
  };

  return (
    <WebView
      ref={webRef}
      containerStyle={styles.container}
      role="alert"
      source={{uri: BASE_URL}}
      renderLoading={() => <ActivityIndicator />}
      javaScriptEnabledAndroid={true}
      originWhitelist={['https://*']}
      renderError={errorName => <Error name={errorName} />}
      injectedJavaScript={INJECTED_JAVASCRIPT_}
      onMessage={_onMessage}
      injectedJavaScriptBeforeContentLoaded={injectedCodeForAlert}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('screen').height,
    width: Dimensions.get('screen').width,
  },
});

export default App;
