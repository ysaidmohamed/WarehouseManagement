import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AntDesign from '@expo/vector-icons/AntDesign';

import index from './src/screens/index';
import EditProduct from './src/screens/EditProduct';
import AddProduct from './src/screens/AddProduct';
import {TouchableOpacity } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={index} 
          options={({ navigation }) => ({
            title: 'Produits',
            headerRight: () => (
              <TouchableOpacity 
                onPress={() => navigation.navigate('AddProduct')}
                style={{ marginRight: 15 }}
              >
                <AntDesign name="plus" size={24} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen 
          name="EditProduct" 
          component={EditProduct} 
          options={{ title: 'Modifier le produit' }} 
        />
        <Stack.Screen 
          name="AddProduct" 
          component={AddProduct} 
          options={{ title: 'Ajouter un produit' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}