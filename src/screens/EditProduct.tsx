import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView, TextInput, TouchableOpacity,Alert } from 'react-native';
import { Host, Picker } from '@expo/ui';
import { useNavigation, useRoute } from '@react-navigation/native';

type Category = {
  id: number;
  nom: string;
};

export default function EditProductScreen() {
  const [product, setProduct] = useState<any>(null);// Désactive la vérification de type pour le productId
  const [categories, setCategories] = useState<Category[]>([]); // Tableau contenant uniquement des élements de type Category
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null); // Peut afficher un message d'erreur ou null si pas d'erreur
  const route = useRoute<any>();
  const navigation = useNavigation();

  // Si l'id n'est pas défini, on chargera le message d'erreur
  const { productId } = route.params || {};
  const isLoading = Boolean(productId) && loadingProduct;

  // Met à jour le champ du produit en fonction de l'entrée de l'utilisateur
  const handleChange = (field: string, value: string | number) => {
    setProduct((prev: any) => ({ ...prev, [field]: value }));
  };

  // Ajoute la valeur delta à la quantité du produit (minimum 0)
  const adjustQuantity = (delta: number) => {
    setProduct((prev: any) => {
      const currentQty = Number(prev.qteInit) || 0;
      return { ...prev, qteInit: Math.max(0, currentQty + delta) };
    });
  };

  // Enregistre les modifications du produit
  const handleSave = async () => {
    if (!product.nom.trim() || !product.reference.trim() || !product.categorieId) {
      Alert.alert('Erreur : Tous les champs sont obligatoires.');
        return;
    }
    setSaving(true);
    try {
        const response = await fetch(`http://localhost:3000/products/${productId}`, {
        method: 'PUT',
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

        if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
        }

        // Retourner à l'écran précédent après enregistrement réussi
        navigation.goBack();
    } catch (error) {
        console.error('Erreur Save:', error);
        alert('Des champs sont manquants ou invalides.');
    } finally {
        setSaving(false);
    }
  };

  useEffect(() => {
    if (!productId) {
      return;
    }

    // Remplit les tableaux product et catégories avec les données du serveur
    const fetchProductDetails = async () => {
      try {
        const [productResponse, categoriesResponse] = await Promise.all([
          fetch(`http://localhost:3000/products/${productId}`),
          fetch('http://localhost:3000/categories'),
        ]);
        if (!productResponse.ok || !categoriesResponse.ok) {
          throw new Error('Erreur lors du chargement des détails du produit');
        }
        const [productData, categoriesData] = await Promise.all([
          productResponse.json(),
          categoriesResponse.json(),
        ]);
        setProduct(productData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur Fetch Product:', error);
        setLoadError('Impossible de charger le produit et les catégories.');
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{loadError ?? 'Produit non trouvé.'}</Text>
      </View>
    );
  }

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
            <Text style={styles.saveButtonText}>Enregistrer</Text>
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
});