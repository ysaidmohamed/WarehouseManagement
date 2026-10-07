import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type EditQuantity = {
  value: number;
  onChange: (value: number) => void;
};

// Changer la quantité d'un produit avec les boutons + et - ou manuellement.
export function EditQuantity({ value, onChange }: EditQuantity) {
  const adjust = (delta: number) => {
    onChange(Math.max(0, value + delta));
  };

  return (
    <View style={styles.quantityContainer}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => adjust(-1)}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={String(value)}
        keyboardType="numeric"
        onChangeText={(text) => onChange(Number.parseInt(text, 10) || 0)}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => adjust(1)}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2563eb',
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
    marginHorizontal: 10,
    marginBottom: 0,
  },
});