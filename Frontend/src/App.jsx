import { SafeAreaView } from 'react-native'
import React, { useEffect } from 'react'
import StackNavigator from './navigation/StackNavigator'
import SplashScreen from 'react-native-splash-screen'

const App = () => {

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 50);
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StackNavigator />
    </SafeAreaView>
  )
}

export default App