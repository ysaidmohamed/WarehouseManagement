import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Host, Picker } from '@expo/ui';
import { EditQuantity } from './EditQuantity';

export type ProductCategory = {
  id: number;
  nom: string;
};

export type ProductFormValues = {
  nom: string;
  reference: string;
  categorieId: number;
  qteInit: number;
  seuil: number;
};

type ProductFormProps = {
  product: ProductFormValues;
  categories: ProductCategory[];
  saving: boolean;
  submitLabel: string;
  onChange: (changes: Partial<ProductFormValues>) => void;
  onSubmit: () => void;
  loadError?: string | null;
  formError?: string | null;
};

export function ProductForm({
  product,
  categories,
  saving,
  submitLabel,
  onChange,
  onSubmit,
  loadError,
  formError,
}: ProductFormProps) {
  return (

    // Informations du produit.
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nom du produit :</Text>
      <TextInput
        style={styles.input}
        value={product.nom}
        onChangeText={(nom) => onChange({ nom })}
      />

      <Text style={styles.label}>Référence :</Text>
      <TextInput
        style={styles.input}
        value={product.reference}
        onChangeText={(reference) => onChange({ reference })}
      />

      <Text style={styles.label}>Catégorie :</Text>
      {loadError && <Text style={styles.errorText}>{loadError}</Text>}
      <View style={styles.pickerContainer}>
        <Host matchContents={{ vertical: true }} style={styles.pickerHost}>
          <Picker
            selectedValue={product.categorieId}
            onValueChange={(categorieId: number) => onChange({ categorieId })}
          >
            {categories.map((category) => (
              <Picker.Item key={category.id} label={category.nom} value={category.id} />
            ))}
          </Picker>
        </Host>
      </View>

      <Text style={styles.label}>Quantité initiale :</Text>
      <EditQuantity
        value={product.qteInit}
        onChange={(qteInit) => onChange({ qteInit })}
      />

      <Text style={styles.label}>Seuil :</Text>
      <TextInput
        style={styles.input}
        value={String(product.seuil)}
        keyboardType="numeric"
        onChangeText={(text) => onChange({ seuil: Number.parseInt(text, 10) || 0 })}
      />

      {formError && <Text style={styles.errorText}>{formError}</Text>}
      <TouchableOpacity
        style={[styles.submitButton, saving && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  pickerHost: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#16a34a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#86efac',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
