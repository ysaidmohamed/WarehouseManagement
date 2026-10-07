import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ProductForm, ProductCategory, ProductFormValues } from '../components/ProductForm';

export default function EditProductScreen() {
  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null); // Peut afficher un message d'erreur ou null si pas d'erreur
  const route = useRoute<any>();
  const navigation = useNavigation();

  // Si l'id n'est pas défini, on chargera le message d'erreur
  const { productId } = route.params || {};
  const isLoading = Boolean(productId) && loadingProduct;

  const handleChange = (changes: Partial<ProductFormValues>) => {
    setProduct((previous) => previous ? { ...previous, ...changes } : previous);
  };

  // Enregistre les modifications du produit
  const handleSave = async () => {
    if (!product) {
      return;
    }
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
    <ProductForm
      product={product}
      categories={categories}
      saving={saving}
      submitLabel="Enregistrer"
      onChange={handleChange}
      onSubmit={handleSave}
    />
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
});