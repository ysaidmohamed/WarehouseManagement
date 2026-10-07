import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ProductForm, ProductCategory, ProductFormValues } from '../components/ProductForm';

const defaultProduct: ProductFormValues = {
  nom: '',
  reference: '',
  categorieId: 0,
  qteInit: 0,
  seuil: 0,
};

export default function AddProductScreen() {
    const [product, setProduct] = useState<ProductFormValues>(defaultProduct);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const navigation = useNavigation();

    const handleChange = (changes: Partial<ProductFormValues>) => {
        setSaveError(null);
        setProduct((previous) => ({ ...previous, ...changes }));
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
      <ProductForm
        product={product}
        categories={categories}
        saving={saving}
        submitLabel="Ajouter"
        onChange={handleChange}
        onSubmit={handleSave}
        loadError={loadError}
        formError={saveError}
      />
    );
}
