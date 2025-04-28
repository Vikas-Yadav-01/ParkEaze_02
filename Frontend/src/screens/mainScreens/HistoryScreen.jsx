import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { TopBar } from '../../navigation/StackNavigator'

const HistoryScreen = () => {
  return (
    <View style={{flex:1}}>
      <View style={styles.heading}>
        <Text style={styles.text}>History</Text>
      </View>
      <TopBar/>
    </View>
  )
}

export default HistoryScreen

const styles = StyleSheet.create({
  heading:{
    backgroundColor:"#0f0f0f",
    height: 45,
    alignItems:'center',
    justifyContent:'center'
  },
  text:{
    color:"#fff",
    fontSize: 24,
    fontWeight:'bold'
  }
})