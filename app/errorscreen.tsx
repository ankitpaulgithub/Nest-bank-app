import { View, Text } from 'react-native'
import React from 'react'

export default function errorscreen() {
  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor: '#5e5498'}}>
      <Text style={{fontSize:20,fontWeight:'bold',color:'white'}}>Nie masz uprawnień dla tej funkcji</Text>
    </View>
  )
}