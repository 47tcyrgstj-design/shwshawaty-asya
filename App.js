import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";

import { db } from "./firebase";

import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const ADMIN_PASSWORD = "tt69fu35T";
const WHATSAPP = "9647718758585";

const CATEGORIES = [
  "هەموو",
  "سێتی نان خواردن",
  "پیاڵە و قۆری",
  "کاسە و جام",
  "کۆمەڵە دیاری",
  "کاڵای ناوماڵ",
];

const PRODUCTS_COLLECTION = "Products";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState("home");
  const [category, setCategory] = useState("هەموو");
  const [query, setQuery] = useState("");

  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [password, setPassword] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] =
    useState("کاڵای ناوماڵ");
  const [newImage, setNewImage] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  useEffect(() => {
    const productsRef = collection(
      db,
      PRODUCTS_COLLECTION
    );

    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setProducts(data);
        setLoading(false);
      },
      (error) => {
        console.log("Firestore error:", error);
        setLoading(false);

        Alert.alert(
          "کێشەی Database",
          "نەتوانرا بەرهەمەکان لە Firestore بخوێندرێنەوە."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((product) => {
      const categoryOK =
        category === "هەموو" ||
        product.category === category;

      const name =
        typeof product.name === "string"
          ? product.name.toLowerCase()
          : "";

      const searchOK =
        !search || name.includes(search);

      return categoryOK && searchOK;
    });
  }, [products, category, query]);

  const total = cart.reduce(
    (sum, product) =>
      sum + Number(product.price || 0),
    0
  );

  const addToCart = (product) => {
    setCart((current) => [...current, product]);

    Alert.alert(
      "زیادکرا ✅",
      `${product.name} خرایە ناو سەبەتەکە.`
    );
  };

  const removeFromCart = (index) => {
    setCart((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const loginAdmin = () => {
    if (password === ADMIN_PASSWORD) {
      setAdminLogin(true);
      setPassword("");
    } else {
      Alert.alert(
        "پاسۆرد هەڵەیە ❌",
        "پاسۆردەکە هەڵەیە."
      );
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setNewName("");
    setNewPrice("");
    setNewCategory("کاڵای ناوماڵ");
    setNewImage("");
  };

  const addProduct = async () => {
    if (!newName.trim()) {
      Alert.alert("هەڵە", "ناوی بەرهەم بنووسە.");
      return;
    }

    if (
      !newPrice.trim() ||
      Number.isNaN(Number(newPrice))
    ) {
      Alert.alert("هەڵە", "نرخ بە ژمارە بنووسە.");
      return;
    }

    if (!newImage.trim()) {
      Alert.alert("هەڵە", "لینکی وێنەکە بنووسە.");
      return;
    }

    try {
      await addDoc(
        collection(db, PRODUCTS_COLLECTION),
        {
          Name: newName.trim(),
          Price: Number(newPrice),
          Category: newCategory,
          image: newImage.trim(),
        }
      );

      resetProductForm();

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        "بەرهەمەکە زیاد کرا."
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        "هەڵە",
        "نەتوانرا بەرهەمەکە زیاد بکرێت."
      );
    }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);

    setNewName(
      product.Name || product.name || ""
    );

    setNewPrice(
      String(product.Price ?? product.price ?? "")
    );

    setNewCategory(
      product.Category ||
        product.category ||
        "کاڵای ناوماڵ"
    );

    setNewImage(product.image || "");
  };

  const updateProduct = async () => {
    if (!editingProduct) return;

    if (!newName.trim()) {
      Alert.alert("هەڵە", "ناوی بەرهەم بنووسە.");
      return;
    }

    if (
      !newPrice.trim() ||
      Number.isNaN(Number(newPrice))
    ) {
      Alert.alert("هەڵە", "نرخ بە ژمارە بنووسە.");
      return;
    }

    if (!newImage.trim()) {
      Alert.alert("هەڵە", "لینکی وێنەکە بنووسە.");
      return;
    }

    try {
      await updateDoc(
        doc(
          db,
          PRODUCTS_COLLECTION,
          editingProduct.id
        ),
        {
          Name: newName.trim(),
          Price: Number(newPrice),
          Category: newCategory,
          image: newImage.trim(),
        }
      );

      resetProductForm();

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        "بەرهەمەکە نوێ کرایەوە."
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        "هەڵە",
        "نەتوانرا بەرهەمەکە نوێ بکرێتەوە."
      );
    }
  };

  const deleteProduct = (product) => {
    const name =
      product.Name ||
      product.name ||
      "بەرهەم";

    Alert.alert(
      "سڕینەوە",
      `دڵنیایت دەتەوێت "${name}" بسڕیتەوە؟`,
      [
        {
          text: "نەخێر",
          style: "cancel",
        },
        {
          text: "بەڵێ",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(
                doc(
                  db,
                  PRODUCTS_COLLECTION,
                  product.id
                )
              );

              resetProductForm();

              Alert.alert(
                "سڕایەوە ✅",
                "بەرهەمەکە سڕایەوە."
              );
            } catch (error) {
              console.log(error);

              Alert.alert(
                "هەڵە",
                "نەتوانرا بسڕدرێتەوە."
              );
            }
          },
        },
      ]
    );
  };

  const openCheckout = () => {
    if (cart.length === 0) {
      Alert.alert(
        "سەبەت بەتاڵە",
        "سەرەتا بەرهەمێک زیاد بکە."
      );
      return;
    }

    setShowCheckout(true);
  };

  const sendOrderToWhatsApp = async () => {
    if (!customerName.trim()) {
      Alert.alert("هەڵە", "ناوت بنووسە.");
      return;
    }

    if (!customerPhone.trim()) {
      Alert.alert("هەڵە", "ژمارەی مۆبایلت بنووسە.");
      return;
    }

    if (!customerAddress.trim()) {
      Alert.alert("هەڵە", "ناونیشانت بنووسە.");
      return;
    }

    const items = cart
      .map((product, index) => {
        const name =
          product.Name ||
          product.name ||
          "بەرهەم";

        const price =
          Number(
            product.Price ??
              product.price ??
              0
          );

        return `${index + 1}. ${name} - ${price.toLocaleString()} IQD`;
      })
      .join("\n");

    const message =
      `🛍️ داواکاری نوێ - Shwshawaty ASYA\n\n` +
      `👤 ناو: ${customerName}\n` +
      `📞 ژمارە: ${customerPhone}\n` +
      `📍 ناونیشان: ${customerAddress}\n\n` +
      `📦 بەرهەمەکان:\n${items}\n\n` +
      `💰 کۆی گشتی: ${total.toLocaleString()} IQD\n\n` +
      `📝 تێبینی: ${
        customerNote.trim() || "نییە"
      }`;

    const url =
      `https://wa.me/${WHATSAPP}` +
      `?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "هەڵە",
        "WhatsApp نەکرایەوە."
      );
    }
  };

  if (showAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.page}>
          <TouchableOpacity
            onPress={() => {
              setShowAdmin(false);
              setAdminLogin(false);
              setPassword("");
              resetProductForm();
            }}
          >
            <Text style={styles.back}>
              ‹ گەڕانەوە
            </Text>
          </TouchableOpacity>

          {!adminLogin ? (
            <View>
              <Text style={styles.title}>
                🔐 بەشی بەڕێوەبەر
              </Text>

              <Text style={styles.subtitle}>
                بە پاسۆرد بچۆ ژوورەوە بۆ بەڕێوەبردنی
                بەرهەمەکان.
              </Text>

              <Text style={styles.label}>
                پاسۆرد
              </Text>

              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="پاسۆرد"
                placeholderTextColor="#777"
                style={styles.input}
              />

              <TouchableOpacity
                style={styles.goldButton}
                onPress={loginAdmin}
              >
                <Text style={styles.goldButtonText}>
                  🔓 چوونەژوورەوە
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.title}>
                ⚙️ بەڕێوەبردنی بەرهەمەکان
              </Text>

              <View style={styles.adminBox}>
                <Text style={styles.sectionTitle}>
                  {editingProduct
                    ? "✏️ دەستکاریکردن"
                    : "➕ زیادکردنی بەرهەم"}
                </Text>

                <Text style={styles.label}>
                  ناوی بەرهەم
                </Text>

                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="ناوی بەرهەم"
                  placeholderTextColor="#777"
                  style={styles.input}
                />

                <Text style={styles.label}>
                  نرخ
                </Text>

                <TextInput
                  value={newPrice}
                  onChangeText={setNewPrice}
                  keyboardType="numeric"
                  placeholder="50000"
                  placeholderTextColor="#777"
                  style={styles.input}
                />

                <Text style={styles.label}>
                  وێنە
                </Text>

                <TextInput
                  value={newImage}
                  onChangeText={setNewImage}
                  autoCapitalize="none"
                  keyboardType="url"
                  placeholder="https://..."
                  placeholderTextColor="#777"
                  style={styles.input}
                />

                {newImage ? (
                  <Image
                    source={{ uri: newImage }}
                    style={styles.preview}
                  />
                ) : null}

                <Text style={styles.label}>
                  جۆری بەرهەم
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {CATEGORIES.filter(
                    (item) => item !== "هەموو"
                  ).map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() =>
                        setNewCategory(item)
                      }
                      style={[
                        styles.category,
                        newCategory === item &&
                          styles.categoryActive,
                      ]}
                    >
                      <Text
                        style={
                          newCategory === item
                            ? styles.categoryTextActive
                            : styles.categoryText
                        }
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={styles.goldButton}
                  onPress={
                    editingProduct
                      ? updateProduct
                      : addProduct
                  }
                >
                  <Text
                    style={styles.goldButtonText}
                  >
                    {editingProduct
                      ? "💾 پاشەکەوتکردن"
                      : "➕ زیادکردن"}
                  </Text>
                </TouchableOpacity>

                {editingProduct ? (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={resetProductForm}
                  >
                    <Text style={styles.cancelText}>
                      ✕ هەڵوەشاندنەوە
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text style={styles.sectionHeading}>
                📦 بەرهەمەکان ({products.length})
              </Text>

              {products.map((product) => {
                const name =
                  product.Name ||
                  product.name ||
                  "بەرهەم";

                const price =
                  Number(
                    product.Price ??
                      product.price ??
                      0
                  );

                const cat =
                  product.Category ||
                  product.category ||
                  "";

                return (
                  <View
                    key={product.id}
                    style={styles.adminProduct}
                  >
                    <Image
                      source={{
                        uri: product.image,
                      }}
                      style={styles.adminImage}
                    />

                    <View style={styles.adminInfo}>
                      <Text
                        style={styles.adminName}
                        numberOfLines={2}
                      >
                        {name}
                      </Text>

                      <Text
                        style={styles.adminPrice}
                      >
                        {price.toLocaleString()} IQD
                      </Text>

                      <Text
                        style={styles.adminCategory}
                      >
                        {cat}
                      </Text>
                    </View>

                    <View>
                      <TouchableOpacity
                        style={styles.smallButton}
                        onPress={() =>
                          startEditProduct(
                            product
                          )
                        }
                      >
                        <Text>✏️</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.smallButton,
                          styles.deleteButton,
                        ]}
                        onPress={() =>
                          deleteProduct(product)
                        }
                      >
                        <Text>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showCheckout) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.page}>
          <TouchableOpacity
            onPress={() => setShowCheckout(false)}
          >
            <Text style={styles.back}>
              ‹ گەڕانەوە بۆ سەبەت
            </Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            📝 زانیاری داواکاری
          </Text>

          <Text style={styles.label}>
            ناوی تەواو
          </Text>

          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="ناوت بنووسە"
            placeholderTextColor="#777"
            style={styles.input}
          />

          <Text style={styles.label}>
            ژمارەی مۆبایل
          </Text>

          <TextInput
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
            placeholder="07xxxxxxxxx"
            placeholderTextColor="#777"
            style={styles.input}
          />

          <Text style={styles.label}>
            ناونیشان
          </Text>

          <TextInput
            value={customerAddress}
            onChangeText={setCustomerAddress}
            multiline
            placeholder="شار، گەڕەک، شەقام..."
            placeholderTextColor="#777"
            style={[
              styles.input,
              styles.textArea,
            ]}
          />

          <Text style={styles.label}>
            تێبینی
          </Text>

          <TextInput
            value={customerNote}
            onChangeText={setCustomerNote}
            multiline
            placeholder="تێبینی..."
            placeholderTextColor="#777"
            style={[
              styles.input,
              styles.textArea,
            ]}
          />

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>
              کۆی گشتی
            </Text>

            <Text style={styles.totalPrice}>
              {total.toLocaleString()} IQD
            </Text>
          </View>

          <TouchableOpacity
            style={styles.goldButton}
            onPress={sendOrderToWhatsApp}
          >
            <Text style={styles.goldButtonText}>
              📲 ناردن بۆ WhatsApp
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          Shwshawaty ASYA
        </Text>

        <TouchableOpacity
          onPress={() => setShowAdmin(true)}
        >
          <Text style={styles.settings}>
            ⚙️
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "home" && (
        <>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="🔎 گەڕان بۆ بەرهەم..."
            placeholderTextColor="#777"
            style={styles.search}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryRow}
          >
            {CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.category,
                  category === item &&
                    styles.categoryActive,
                ]}
              >
                <Text
                  style={
                    category === item
                      ? styles.categoryTextActive
                      : styles.categoryText
                  }
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator
                size="large"
                color="#d4af37"
              />

              <Text style={styles.loadingText}>
                بەرهەمەکان دەهێنرێن...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              numColumns={2}
              keyExtractor={(item) =>
                String(item.id)
              }
              contentContainerStyle={
                styles.grid
              }
              renderItem={({ item }) => {
                const name =
                  item.Name ||
                  item.name ||
                  "بەرهەم";

                const price =
                  Number(
                    item.Price ??
                      item.price ??
                      0
                  );

                return (
                  <TouchableOpacity
                    style={styles.card}
                    onPress={() =>
                      setSelected(item)
                    }
                  >
                    <Image
                      source={{
                        uri: item.image,
                      }}
                      style={styles.productImage}
                    />

                    <View
                      style={styles.cardContent}
                    >
                      <Text
                        style={styles.productName}
                        numberOfLines={2}
                      >
                        {name}
                      </Text>

                      <Text
                        style={styles.productPrice}
                      >
                        {price.toLocaleString()} IQD
                      </Text>

                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() =>
                          addToCart(item)
                        }
                      >
                        <Text
                          style={styles.addButtonText}
                        >
                          ➕ زیادکردن
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyIcon}>
                    📦
                  </Text>

                  <Text style={styles.emptyText}>
                    هیچ بەرهەمێک نەدۆزرایەوە
                  </Text>

                  <Text style={styles.emptySub}>
                    ژمارەی بەرهەمەکان:{" "}
                    {products.length}
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}

      {tab === "cart" && (
        <ScrollView
          contentContainerStyle={styles.page}
        >
          <Text style={styles.title}>
            🛒 سەبەت
          </Text>

          {cart.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>
                🛒
              </Text>

              <Text style={styles.emptyText}>
                سەبەتەکەت بەتاڵە
              </Text>

              <TouchableOpacity
                style={styles.goldButton}
                onPress={() => setTab("home")}
              >
                <Text
                  style={styles.goldButtonText}
                >
                  🛍️ بینینی بەرهەمەکان
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {cart.map((product, index) => {
                const name =
                  product.Name ||
                  product.name ||
                  "بەرهەم";

                const price =
                  Number(
                    product.Price ??
                      product.price ??
                      0
                  );

                return (
                  <View
                    key={`${product.id}-${index}`}
                    style={styles.cartItem}
                  >
                    <Image
                      source={{
                        uri: product.image,
                      }}
                      style={styles.cartImage}
                    />

                    <View style={styles.cartInfo}>
                      <Text
                        style={styles.cartName}
                        numberOfLines={2}
                      >
                        {name}
                      </Text>

                      <Text
                        style={styles.cartPrice}
                      >
                        {price.toLocaleString()} IQD
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        removeFromCart(index)
                      }
                    >
                      <Text
                        style={styles.remove}
                      >
                        🗑️
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>
                  کۆی گشتی
                </Text>

                <Text style={styles.totalPrice}>
                  {total.toLocaleString()} IQD
                </Text>
              </View>

              <TouchableOpacity
                style={styles.goldButton}
                onPress={openCheckout}
              >
                <Text
                  style={styles.goldButtonText}
                >
                  📦 تەواوکردنی داواکاری
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      {tab === "profile" && (
        <ScrollView
          contentContainerStyle={styles.page}
        >
          <Text style={styles.title}>
            👤 Shwshawaty ASYA
          </Text>

          <View style={styles.profile}>
            <Text style={styles.profileLogo}>
              ASYA
            </Text>

            <Text style={styles.profileTitle}>
              بەخێربێیت بۆ Shwshawaty ASYA
            </Text>

            <Text style={styles.profileText}>
              بەرهەمەکانمان ببینە و داواکارییەکەت
              بە ئاسانی بنێرە.
            </Text>

            <TouchableOpacity
              style={styles.goldButton}
              onPress={() => setTab("home")}
            >
              <Text
                style={styles.goldButtonText}
              >
                🛍️ دەستپێکردنی کڕین
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {selected && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <TouchableOpacity
              style={styles.close}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.closeText}>
                ✕
              </Text>
            </TouchableOpacity>

            <Image
              source={{
                uri: selected.image,
              }}
              style={styles.modalImage}
            />

            <Text style={styles.modalTitle}>
              {selected.Name ||
                selected.name ||
                "بەرهەم"}
            </Text>

            <Text style={styles.modalCategory}>
              {selected.Category ||
                selected.category ||
                ""}
            </Text>

            <Text style={styles.modalPrice}>
              {Number(
                selected.Price ??
                  selected.price ??
                  0
              ).toLocaleString()}{" "}
              IQD
            </Text>

            <TouchableOpacity
              style={styles.goldButton}
              onPress={() => {
                addToCart(selected);
                setSelected(null);
              }}
            >
              <Text
                style={styles.goldButtonText}
              >
                🛒 زیادکردن بۆ سەبەت
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setTab("home")}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>
            سەرەکی
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setTab("cart")}
        >
          <View>
            <Text style={styles.navIcon}>
              🛒
            </Text>

            {cart.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cart.length}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.navText}>
            سەبەت
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setTab("profile")}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>
            پڕۆفایل
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#090909",
  },

  header: {
    height: 68,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
  },

  logo: {
    color: "#d4af37",
    fontSize: 21,
    fontWeight: "900",
  },

  settings: {
    fontSize: 24,
  },

  search: {
    margin: 14,
    marginBottom: 5,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: "#fff",
    textAlign: "right",
    fontSize: 15,
  },

  categoryRow: {
    maxHeight: 55,
    paddingHorizontal: 8,
  },

  category: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    marginHorizontal: 4,
    borderRadius: 22,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#292929",
    alignSelf: "center",
  },

  categoryActive: {
    backgroundColor: "#d4af37",
    borderColor: "#d4af37",
  },

  categoryText: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "700",
  },

  categoryTextActive: {
    color: "#111",
    fontSize: 13,
    fontWeight: "900",
  },

  grid: {
    padding: 8,
    paddingBottom: 95,
  },

  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#151515",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#292929",
  },

  productImage: {
    width: "100%",
    height: 175,
    backgroundColor: "#222",
  },

  cardContent: {
    padding: 10,
  },

  productName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
    minHeight: 40,
  },

  productPrice: {
    color: "#d4af37",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 5,
  },

  addButton: {
    marginTop: 9,
    backgroundColor: "#d4af37",
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
  },

  addButtonText: {
    color: "#111",
    fontSize: 13,
    fontWeight: "900",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#d4af37",
    marginTop: 12,
    fontSize: 15,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: 35,
  },

  emptyIcon: {
    fontSize: 55,
  },

  emptyText: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },

  emptySub: {
    color: "#666",
    fontSize: 13,
    marginTop: 8,
  },

  page: {
    padding: 16,
    paddingBottom: 110,
  },

  title: {
    color: "#d4af37",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 18,
  },

  subtitle: {
    color: "#999",
    fontSize: 14,
    lineHeight: 24,
    textAlign: "right",
    marginBottom: 18,
  },

  label: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 12,
    marginBottom: 7,
  },

  input: {
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#303030",
    borderRadius: 11,
    color: "#fff",
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    textAlign: "right",
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  goldButton: {
    backgroundColor: "#d4af37",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },

  goldButtonText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "900",
  },

  back: {
    color: "#d4af37",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 12,
  },

  adminBox: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 16,
    padding: 14,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 8,
  },

  preview: {
    width: "100%",
    height: 190,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: "#222",
  },

  sectionHeading: {
    color: "#d4af37",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 25,
    marginBottom: 10,
  },

  adminProduct: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 13,
    padding: 9,
    marginBottom: 10,
  },

  adminImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#222",
  },

  adminInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },

  adminName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },

  adminPrice: {
    color: "#d4af37",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 4,
  },

  adminCategory: {
    color: "#777",
    fontSize: 11,
    textAlign: "right",
    marginTop: 3,
  },

  smallButton: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: "#242424",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  deleteButton: {
    backgroundColor: "#321919",
  },

  cancelButton: {
    backgroundColor: "#242424",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },

  cancelText: {
    color: "#ddd",
    fontWeight: "800",
  },

  totalBox: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#d4af37",
    borderRadius: 14,
    padding: 15,
    marginTop: 16,
  },

  totalLabel: {
    color: "#999",
    textAlign: "right",
    fontSize: 14,
  },

  totalPrice: {
    color: "#d4af37",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 5,
  },

  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 13,
    padding: 9,
    marginBottom: 10,
  },

  cartImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },

  cartInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },

  cartName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },

  cartPrice: {
    color: "#d4af37",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 5,
  },

  remove: {
    fontSize: 21,
  },

  profile: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
  },

  profileLogo: {
    color: "#d4af37",
    fontSize: 45,
    fontWeight: "900",
    letterSpacing: 4,
  },

  profileTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 14,
  },

  profileText: {
    color: "#999",
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 12,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 18,
  },

  modal: {
    backgroundColor: "#151515",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#333",
  },

  close: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#fff",
    fontSize: 18,
  },

  modalImage: {
    width: "100%",
    height: 270,
    borderRadius: 13,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 15,
  },

  modalCategory: {
    color: "#888",
    fontSize: 13,
    textAlign: "right",
    marginTop: 6,
  },

  modalPrice: {
    color: "#d4af37",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 8,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#292929",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },

  navIcon: {
    fontSize: 23,
  },

  navText: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 3,
  },

  badge: {
    position: "absolute",
    right: -10,
    top: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: "#d4af37",
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#111",
    fontSize: 10,
    fontWeight: "900",
  },
});
