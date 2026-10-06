import { StyleSheet, Text, View,TextInput,TouchableOpacity,ActivityIndicator,ScrollView, Pressable, Alert } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

type Product = {
  id: number;
  nom: string;
  categorie: string;
  qteInit: number;
  seuil: number;
};

export default function Index() {
  const [products, setProducts] = useState<any>(null); // Liste des produits filtrés par la recherche
  const [allProducts,setAllProducts] = useState<any>(null); // Liste de tous les produits
  const [display, setDisplay] = useState('list'); // Affichage par défaut
  const [loadingProducts, setLoadingProducts] = useState(true); // Indique si les produits sont en cours de chargement
  const [errorProducts, setErrorProducts] = useState<string | null>(null); // Message d'erreur lors du chargement des produits
  const [query, setQuery] = useState(''); // Requête de recherche
  const [hasSearched, setHasSearched] = useState(false); // Indique si une recherche a été effectuée
  const searchState = useRef({ query: '', hasSearched: false });

  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
          const response = await fetch('http://localhost:3000/products');
          if (!response.ok) {
            throw new Error('Erreur lors du chargement des produits');
          }
          const data = await response.json();
          if (isActive) {
            setAllProducts(data);
            const { query: currentQuery, hasSearched: searchWasPerformed } = searchState.current;
            setProducts(
              searchWasPerformed
                ? data.filter((product: Product) => product.nom.toLowerCase().includes(currentQuery.toLowerCase()))
                : data
            );
            setErrorProducts(null);
          }
        } catch (error) {
          if (isActive) {
            setErrorProducts(error instanceof Error ? error.message : 'Erreur lors du chargement des produits');
          }
        } finally {
          if (isActive) {
            setLoadingProducts(false);
          }
        }
      };

      fetchProducts();
      return () => {
        isActive = false;
      };
    }, [])
  );

    const handleSearch = () => {
        searchState.current.hasSearched = true;
        setHasSearched(true);
        // Filtrer les produits selon la recherche  
        const filteredProducts = allProducts.filter((product: Product) => product.nom.toLowerCase().includes(query.toLowerCase()));
        setProducts(filteredProducts);
    };

    const colorCard = (qteInit: number, seuil: number) => {
      if(qteInit === 0) {
        return '#ef4444'; // Rouge si la quantité initiale est égale à 0 (rupture de stock)
      } else if (qteInit <= seuil) {
        return '#e2880b'; // Orange si la quantité initiale est inférieure ou égale au seuil
      } else {
        return '#10b981'; // Vert si la quantité initiale est supérieure au seuil
      }
    };

    const deleteProduct = async (productId: number) => {
      try {
        const response = await fetch(`http://localhost:3000/products/${productId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du produit');
        }
        // Mise à jour des produits après suppression
        setProducts((prevProducts: Product[]) => prevProducts.filter((product) => product.id !== productId));
        setAllProducts((prevAllProducts: Product[]) => prevAllProducts.filter((product) => product.id !== productId));
      } catch (error) {
        console.error('Erreur Delete:', error);
        Alert.alert('Impossible de supprimer le produit.');
      }
    };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/*Type d'affichage */}
      <View style={styles.displayContainer}>
        <Text style={styles.label}>Affichage :</Text>
        <View style={styles.toggleGroup}>
          <Pressable 
            style={[styles.toggleBtn, display === 'list' && styles.toggleBtnActive]}
            onPress={() => setDisplay('list')}
          >
            <Text style={display === 'list' ? styles.activeText : styles.inactiveText}>Liste</Text>
          </Pressable>

          <Pressable 
            style={[styles.toggleBtn, display === 'cards' && styles.toggleBtnActive]}
            onPress={() => setDisplay('cards')}
          >
            <Text style={display === 'cards' ? styles.activeText : styles.inactiveText}>Cartes</Text>
          </Pressable>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchForm}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(text) => {
            searchState.current.query = text;
            searchState.current.hasSearched = false;
            setQuery(text);
            setHasSearched(false);
          }}
          placeholder="Ex: PC portable, souris, clavier..."
          placeholderTextColor="#94a3b8"
        />

        <TouchableOpacity
          style={[styles.button, loadingProducts && styles.disabledButton]}
          onPress={handleSearch}
          disabled={loadingProducts}
        >
          {loadingProducts ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>🔍 Rechercher</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Nombre de produits trouvés */}
      {products && (
        <Text style={{ marginTop: 20}}>
          {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
        </Text>
      )}

      {/* Nombre de produits en rupture */}
      {products && (
        <Text style={{ marginTop: 20}}>
          {products.filter((p: any) => p.qteInit === 0).length} produit{products.filter((p: any) => p.qteInit === 0).length > 1 ? 's' : ''} en rupture de stock
        </Text>
      )}

      {/* Nombre de produits en dessous du seuil */}
      {products && (
        <Text style={{ marginTop: 20}}>
          {products.filter((p: any) => p.qteInit < p.seuil).length} produit{products.filter((p: any) => p.qteInit < p.seuil).length > 1 ? 's' : ''} en dessous du seuil
        </Text>
      )}

      {/* Liste des produits */}
{loadingProducts ? (
  <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 20 }} />
) : display === 'list' ? (
  // Affichage en liste
  <View style={styles.tableContainer}>
    {products.length > 0 ? (
      <>
        {/* En-tête du tableau */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerText, { flex: 2 }]}>Nom</Text>
          <Text style={[styles.tableCell, styles.headerText, { flex: 2 }]}>Catégorie</Text>
          <Text style={[styles.tableCell, styles.headerText, { flex: 1, textAlign: 'center' }]}>Qte Init</Text>
          <Text style={[styles.tableCell, styles.headerText, { flex: 1, textAlign: 'center' }]}>Seuil</Text>
          <Text style={[styles.tableCell, styles.headerText, { flex: 1, textAlign: 'center' }]}></Text>
          <Text style={[styles.tableCell, styles.headerText, { flex: 1, textAlign: 'center' }]}></Text>
        </View>

        {/* Lignes du tableau */}
        {products.map((product: Product, index: number) => (
          <View key={product.id || index} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2, fontWeight: '500' }]}>{product.nom}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{product.categorie}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{product.qteInit}</Text>
            <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{product.seuil}</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('EditProduct', { productId: product.id })}
            >
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: '#2563eb' }]}>
                ✏️
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => deleteProduct(product.id)}
            >
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: '#2563eb' }]}>
                ❌
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </>
    ) : (
      hasSearched && <Text style={styles.emptyText}>Aucun produit trouvé.</Text>
    )}
  </View>
) : (
  // Affichage en cartes
  <View style={styles.cardsContainer}>
    {products.length > 0 ? (
      products.map((product: Product, index: number) => (
        <View key={product.id || index} style={[styles.card, { backgroundColor: colorCard(product.qteInit, product.seuil) }]}>
          <Text style={styles.cardTitle}>{product.nom}</Text>
          <Text style={styles.cardText}>Catégorie: {product.categorie}</Text>
          <Text style={[styles.cardText]}>
            Quantité initiale: {product.qteInit}
          </Text>
          <Text style={styles.cardText}>Seuil: {product.seuil}</Text>
          <TouchableOpacity>
            <Text style={[styles.cardText, { color: '#2563eb' }]} onPress={() => navigation.navigate('EditProduct', { productId: product.id })}>
              ✏️
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={[styles.cardText, { color: '#dc2626' }]} onPress={() => deleteProduct(product.id)}>
              ❌
            </Text>
          </TouchableOpacity>
        </View>
      ))
    ) : (
      hasSearched && <Text style={styles.emptyText}>Aucun produit trouvé.</Text>
    )}
  </View>
)}

      {/* Message d'erreur */}
      {errorProducts && <Text style={styles.errorText}>{errorProducts}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
    alignItems: 'center',
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    width: '100%',
    maxWidth: 500,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    cursor: 'pointer',
  },
  toggleBtnActive: {
    backgroundColor: '#2563eb',
  },
  activeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#475569',
  },
  searchForm: {
    gap: 12,
    width: '100%',     
    maxWidth: 500,     
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
    width: '100%',
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',   
    cursor: 'pointer',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    marginTop: 10,
    textAlign: 'center',
  },
  tableContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    width: '100%',
  },
  tableHeader: {
    backgroundColor: '#e2e8f0',
    width: '100%',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#0f172a',
    width: '100%',
  },
  headerText: {
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 150,
    margin: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
});
