import React from 'react';
import { TouchableOpacity, Text } from 'react-native'; 
import { styles } from './styles'; 

interface ButtonProps { 
  title: string;
  onPress: () => void;
}

export function Button({ title, onPress, ...rest }: ButtonProps) { 
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} {...rest}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}