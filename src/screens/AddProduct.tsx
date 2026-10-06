import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Host, Picker } from '@expo/ui';
import { useNavigation } from '@react-navigation/native';

type Category = {
  id: number;
  nom: string;
};

const defaultProduct = {
  nom: '',
  reference: '',
  categorieId: 0,
  qteInit: 0,
  seuil: 0,
};

export default function AddProductScreen() {
    const [product, setProduct] = useState<any>(defaultProduct);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const navigation = useNavigation();

    // Met à jour le champ du produit en fonction de l'entrée de l'utilisateur
    const handleChange = (field: string, value: string | number) => {
        setSaveError(null);
        setProduct((prev: any) => ({ ...prev, [field]: value }));
    };

    // Ajoute la valeur delta à la quantité du produit (minimum 0)
    const adjustQuantity = (delta: number) => {
        setProduct((prev: any) => {
        const currentQty = Number(prev.qteInit) || 0;
        return { ...prev, qteInit: Math.max(0, currentQty + delta) };
        });
    };

    // Enregistrement du produit
    const handleSave = async () => {
        if (!product.nom.trim() || !product.reference.trim() || !product.categorieId) {
            setSaveError('Renseigne le nom, la référence et la catégorie du produit.');
            return;
        }
        setSaveError(null);
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:3000/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nom: product.nom,
                reference: product.reference,
                categorieId: product.categorieId,
                qteInit: Number(product.qteInit),
                seuil: Number(product.seuil),
            }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de l’ajout du produit.');
            }

            // Retourner à l'écran précédent après enregistrement réussi
            navigation.goBack();
        } catch (error) {
            console.error('Erreur Save:', error);
            setSaveError(error instanceof Error ? error.message : 'Impossible d’ajouter le produit.');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        // Remplit le tableau des catégories avec les données du serveur
        const fetchCategories = async () => {
          try {
            const [categoriesResponse] = await Promise.all([
              fetch('http://localhost:3000/categories'),
            ]);
            if (!categoriesResponse.ok) {
              throw new Error('Erreur lors du chargement des catégories');
            }
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData);
            setProduct((current: typeof defaultProduct) => ({
                ...current,
                categorieId: current.categorieId || categoriesData[0]?.id || 0,
            }));
          } catch (error) {
            console.error('Erreur Fetch Categories:', error);
            setLoadError('Impossible de charger les catégories.');
          }
        };
        fetchCategories();
      }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.label}>Nom du produit :</Text>
          <TextInput
            style={styles.input}
            value={product.nom}
            onChangeText={(text) => handleChange('nom', text)}
          />
    
          <Text style={styles.label}>Référence :</Text>
          <TextInput
            style={styles.input}
            value={product.reference}
            onChangeText={(text) => handleChange('reference', text)}
          />
    
          <Text style={styles.label}>Catégorie :</Text>
          {loadError && <Text style={styles.errorText}>{loadError}</Text>}
          <View style={styles.pickerContainer}>
            <Host matchContents={{ vertical: true }} style={styles.pickerHost}>
              <Picker
                selectedValue={product.categorieId}
                onValueChange={(categorieId: number) => handleChange('categorieId', categorieId)}
              >
                {categories.map((category) => (
                  <Picker.Item key={category.id} label={category.nom} value={category.id} />
                ))}
              </Picker>
            </Host>
          </View>
          {saveError && <Text style={styles.errorText}>{saveError}</Text>}
    
          <Text style={styles.label}>Quantité initiale :</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.btnQuantity} onPress={() => adjustQuantity(-1)}>
              <Text style={styles.btnText}>-</Text>
            </TouchableOpacity>
    
            <TextInput
              style={[styles.input, styles.quantityInput]}
              value={String(product.qteInit)}
              keyboardType="numeric"
              onChangeText={(text) => handleChange('qteInit', parseInt(text, 10) || 0)}
            />
    
            <TouchableOpacity style={styles.btnQuantity} onPress={() => adjustQuantity(1)}>
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
          </View>
    
          <Text style={styles.label}>Seuil :</Text>
          <TextInput
            style={styles.input}
            value={String(product.seuil)}
            keyboardType="numeric"
            onChangeText={(text) => handleChange('seuil', parseInt(text, 10) || 0)}
          />
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
            >
            {saving ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.saveButtonText}>Ajouter</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 12,
  },
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 20,
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  btnQuantity: {
    backgroundColor: '#2563eb',
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    marginBottom: 0,
  },
  saveButton: {
    backgroundColor: '#16a34a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#86efac',
    },
    saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
