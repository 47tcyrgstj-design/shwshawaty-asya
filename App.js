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
} from "react-native";

import { db } from "./firebase";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const ADMIN_PASSWORD = "tt69fu35T";
const WHATSAPP = "9647718758585";

const cats = [
  "هەموو",
  "سێتی نان خواردن",
  "پیاڵە و قۆری",
  "کاسە و جام",
  "کۆمەڵە دیاری",
  "کاڵای ناوماڵ",
];

const initialProducts = [
  {
    id: "1",
    name: "سێتی نان خواردن 25 پارچە",
    price: 75000,
    category: "سێتی نان خواردن",
    image:
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800",
  },
  {
    id: "2",
    name: "سێتی پیاڵە و قۆری",
    price: 45000,
    category: "پیاڵە و قۆری",
    image:
      "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=800",
  },
  {
    id: "3",
    name: "کاسە و جام 6 پارچە",
    price: 30000,
    category: "کاسە و جام",
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
  },
  {
    id: "4",
    name: "کۆمەڵە دیاری",
    price: 90000,
    category: "کۆمەڵە دیاری",
    image:
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=800",
  },
  {
    id: "5",
    name: "کاڵای ناوماڵ",
    price: 55000,
    category: "کاڵای ناوماڵ",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800",
  },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [category, setCategory] = useState("هەموو");
  const [query, setQuery] = useState("");

  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);

  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(true);

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [password, setPassword] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("کاڵای ناوماڵ");
  const [newImage, setNewImage] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "products")
      );

      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      if (data.length > 0) {
        setProducts(data);
      }
    } catch (error) {
      console.log("Firebase load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((p) => {
      const categoryOK =
        category === "هەموو" ||
        p.category === category;

      const name =
        typeof p.name === "string"
          ? p.name.toLowerCase()
          : "";

      const searchOK =
        !search || name.includes(search);

      return categoryOK && searchOK;
    });
  }, [products, category, query]);

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

  const total = cart.reduce(
    (sum, product) =>
      sum + Number(product.price || 0),
    0
  );

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
      Alert.alert(
        "هەڵە",
        "ژمارەی مۆبایلت بنووسە."
      );
      return;
    }

    if (!customerAddress.trim()) {
      Alert.alert(
        "هەڵە",
        "ناونیشانت بنووسە."
      );
      return;
    }

    const items = cart
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} - ${Number(
            p.price
          ).toLocaleString()} IQD`
      )
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
    } catch (error) {
      Alert.alert(
        "هەڵە",
        "WhatsApp نەکرایەوە."
      );
    }
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
    setNewName("");
    setNewPrice("");
    setNewCategory("کاڵای ناوماڵ");
    setNewImage("");
    setEditingProduct(null);
  };  const resetProductForm = () => {
    setNewName("");
    setNewPrice("");
    setNewCategory("کاڵای ناوماڵ");
    setNewImage("");
    setEditingProduct(null);
  };  const addProduct = async () => {
    if (!newName.trim()) {
      Alert.alert("هەڵە", "ناوی بەرهەم بنووسە.");
      return;
    }

    if (!newPrice.trim() || isNaN(Number(newPrice))) {
      Alert.alert(
        "هەڵە",
        "نرخی بەرهەم بە ژمارە بنووسە."
      );
      return;
    }

    if (!newImage.trim()) {
      Alert.alert(
        "هەڵە",
        "لینکی وێنەی بەرهەم بنووسە."
      );
      return;
    }

    try {
      const productData = {
        name: newName.trim(),
        price: Number(newPrice),
        category: newCategory,
        image: newImage.trim(),
      };

      const docRef = await addDoc(
        collection(db, "products"),
        productData
      );

      const product = {
        id: docRef.id,
        ...productData,
      };

      setProducts((current) => [
        product,
        ...current,
      ]);

      resetProductForm();

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        "بەرهەمەکە زیاد کرا."
      );
    } catch (error) {
      console.log("Add product error:", error);

      Alert.alert(
        "هەڵە",
        "نەتوانرا بەرهەمەکە زیاد بکرێت."
      );
    }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setNewName(product.name);
    setNewPrice(String(product.price));
    setNewCategory(product.category);
    setNewImage(product.image);
  };

  const updateProduct = async () => {
    if (!editingProduct) return;

    if (!newName.trim()) {
      Alert.alert("هەڵە", "ناوی بەرهەم بنووسە.");
      return;
    }

    if (!newPrice.trim() || isNaN(Number(newPrice))) {
      Alert.alert(
        "هەڵە",
        "نرخی بەرهەم بە ژمارە بنووسە."
      );
      return;
    }

    if (!newImage.trim()) {
      Alert.alert(
        "هەڵە",
        "لینکی وێنەی بەرهەم بنووسە."
      );
      return;
    }

    try {
      const productData = {
        name: newName.trim(),
        price: Number(newPrice),
        category: newCategory,
        image: newImage.trim(),
      };

      await updateDoc(
        doc(db, "products", editingProduct.id),
        productData
      );

      setProducts((current) =>
        current.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...productData,
              }
            : p
        )
      );

      resetProductForm();

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        "بەرهەمەکە نوێ کرایەوە."
      );
    } catch (error) {
      console.log(
        "Update product error:",
        error
      );

      Alert.alert(
        "هەڵە",
        "نەتوانرا بەرهەمەکە نوێ بکرێتەوە."
      );
    }
  };

  const deleteProduct = (product) => {
    Alert.alert(
      "سڕینەوەی بەرهەم",
      `دڵنیایت دەتەوێت "${product.name}" بسڕیتەوە؟`,
      [
        {
          text: "نەخێر",
          style: "cancel",
        },
        {
          text: "بەڵێ، بیسڕەوە",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(
                doc(db, "products", product.id)
              );

              setProducts((current) =>
                current.filter(
                  (p) => p.id !== product.id
                )
              );

              if (
                editingProduct &&
                editingProduct.id === product.id
              ) {
                resetProductForm();
              }

              Alert.alert(
                "سڕایەوە ✅",
                "بەرهەمەکە سڕایەوە."
              );
            } catch (error) {
              console.log(
                "Delete product error:",
                error
              );

              Alert.alert(
                "هەڵە",
                "نەتوانرا بەرهەمەکە بسڕدرێتەوە."
              );
            }
          },
        },
      ]
    );
  };

  if (showAdmin) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView>
          <TouchableOpacity
            onPress={() => {
              setShowAdmin(false);
              setAdminLogin(false);
              setPassword("");
              resetProductForm();
            }}
          >
            <Text style={s.back}>
              ‹ گەڕانەوە بۆ پڕۆفایل
            </Text>
          </TouchableOpacity>

          <View style={s.pad}>
            {!adminLogin ? (
              <>
                <Text style={s.pageTitle}>
                  🔐 بەشی بەڕێوەبەر
                </Text>

                <Text style={s.desc}>
                  تەنها بە پاسۆرد دەتوانیت
                  بەرهەمەکان بەڕێوە ببەیت.
                </Text>

                <Text style={s.label}>
                  پاسۆرد
                </Text>

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="پاسۆرد"
                  placeholderTextColor="#888"
                  secureTextEntry
                  style={s.input}
                />

                <TouchableOpacity
                  style={s.goldBtn}
                  onPress={loginAdmin}
                >
                  <Text style={s.goldText}>
                    🔓 چوونەژوورەوە
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={s.pageTitle}>
                  ⚙️ بەڕێوەبردنی بەرهەمەکان
                </Text>

                <View style={s.adminBox}>
                  <Text style={s.adminBoxTitle}>
                    {editingProduct
                      ? "✏️ دەستکاریکردنی بەرهەم"
                      : "➕ زیادکردنی بەرهەم"}
                  </Text>

                  <Text style={s.imageText}>
                    📷 لینکی وێنەی بەرهەم دابنێ.
                  </Text>

                  <Text style={s.label}>
                    لینکی وێنە
                  </Text>

                  <TextInput
                    value={newImage}
                    onChangeText={setNewImage}
                    placeholder="https://..."
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    style={s.input}
                  />

                  {newImage ? (
                    <Image
                      source={{ uri: newImage }}
                      style={s.preview}
                    />
                  ) : null}

                  <Text style={s.label}>
                    ناوی بەرهەم
                  </Text>

                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="ناوی بەرهەم"
                    placeholderTextColor="#888"
                    style={s.input}
                  />

                  <Text style={s.label}>
                    نرخ بە دینار
                  </Text>

                  <TextInput
                    value={newPrice}
                    onChangeText={setNewPrice}
                    placeholder="65000"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    style={s.input}
                  />

                  <Text style={s.label}>
                    جۆری بەرهەم
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={s.cats}
                  >
                    {cats
                      .filter(
                        (x) => x !== "هەموو"
                      )
                      .map((c) => (
                        <TouchableOpacity
                          key={c}
                          onPress={() =>
                            setNewCategory(c)
                          }
                          style={[
                            s.cat,
                            newCategory === c &&
                              s.catActive,
                          ]}
                        >
                          <Text
                            style={
                              newCategory === c
                                ? s.catTextActive
                                : s.catText
                            }
                          >
                            {c}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>

                  {editingProduct ? (
                    <>
                      <TouchableOpacity
                        style={s.goldBtn}
                        onPress={updateProduct}
                      >
                        <Text style={s.goldText}>
                          💾 پاشەکەوتکردنی گۆڕانکاری
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={s.cancelBtn}
                        onPress={resetProductForm}
                      >
                        <Text style={s.cancelText}>
                          ✕ هەڵوەشاندنەوە
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={s.goldBtn}
                      onPress={addProduct}
                    >
                      <Text style={s.goldText}>
                        ➕ زیادکردنی بەرهەم
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={s.adminListTitle}>
                  📦 هەموو بەرهەمەکان
                </Text>

                {products.length === 0 ? (
                  <Text style={s.empty}>
                    هیچ بەرهەمێک نییە.
                  </Text>
                ) : (
                  products.map((product) => (
                    <View
                      key={product.id}
                      style={s.adminProduct}
                    >
                      <Image
                        source={{
                          uri: product.image,
                        }}
                        style={s.adminProductImage}
                      />

                      <View
                        style={
                          s.adminProductInfo
                        }
                      >
                        <Text
                          style={
                            s.adminProductName
                          }
                          numberOfLines={2}
                        >
                          {product.name}
                        </Text>

                        <Text
                          style={
                            s.adminProductPrice
                          }
                        >
                          {Number(
                            product.price
                          ).toLocaleString()}{" "}
                          IQD
                        </Text>

                        <Text
                          style={
                            s.adminProductCategory
                          }
                        >
                          {product.category}
                        </Text>
                      </View>

                      <View style={s.adminActions}>
                        <TouchableOpacity
                          style={s.editBtn}
                          onPress={() =>
                            startEditProduct(
                              product
                            )
                          }
                        >
                          <Text style={s.editText}>
                            ✏️
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={
                            s.deleteSmallBtn
                          }
                          onPress={() =>
                            deleteProduct(
                              product
                            )
                          }
                        >
                          <Text
                            style={
                              s.deleteSmallText
                            }
                          >
                            🗑️
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showCheckout) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView>
          <TouchableOpacity
            onPress={() =>
              setShowCheckout(false)
            }
          >
            <Text style={s.back}>
              ‹ گەڕانەوە بۆ سەبەت
            </Text>
          </TouchableOpacity>

          <View style={s.pad}>
            <Text style={s.pageTitle}>
              📝 زانیاری داواکاری
            </Text>

            <Text style={s.label}>
              👤 ناوی تەواو
            </Text>

            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="ناوت بنووسە"
              placeholderTextColor="#888"
              style={s.input}
            />

            <Text style={s.label}>
              📞 ژمارەی مۆبایل
            </Text>

            <TextInput
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="07xxxxxxxxx"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              style={s.input}
            />

            <Text style={s.label}>
              📍 ناونیشان
            </Text>

            <TextInput
              value={customerAddress}
              onChangeText={setCustomerAddress}
              placeholder="شار، گەڕەک، شەقام..."
              placeholderTextColor="#888"
              multiline
              style={[s.input, s.textArea]}
            />

            <Text style={s.label}>
              📝 تێبینی
            </Text>

            <TextInput
              value={customerNote}
              onChangeText={setCustomerNote}
              placeholder="ئەگەر تێبینییەکت هەیە..."
              placeholderTextColor="#888"
              multiline
              style={[s.input, s.textArea]}
            />

            <View style={s.totalBox}>
              <Text style={s.totalLabel}>
                کۆی گشتی
              </Text>

              <Text style={s.totalPrice}>
                {total.toLocaleString()} IQD
              </Text>
            </View>

            <TouchableOpacity
              style={s.goldBtn}
              onPress={sendOrderToWhatsApp}
            >
              <Text style={s.goldText}>
                📲 ناردنی داواکاری بۆ WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.logo}>Shwshawaty ASYA</Text>

        <TouchableOpacity
          onPress={() => setShowAdmin(true)}
        >
          <Text style={s.adminIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {tab === "home" && (
        <>
          <View style={s.searchBox}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="گەڕان بۆ بەرهەم..."
              placeholderTextColor="#888"
              style={s.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.cats}
          >
            {cats.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  s.cat,
                  category === c && s.catActive,
                ]}
              >
                <Text
                  style={
                    category === c
                      ? s.catTextActive
                      : s.catText
                  }
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View style={s.center}>
              <Text style={s.loading}>
                چاوەڕێ بکە...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) =>
                String(item.id)
              }
              numColumns={2}
              contentContainerStyle={s.grid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.card}
                  onPress={() =>
                    setSelected(item)
                  }
                >
                  <Image
                    source={{
                      uri: item.image,
                    }}
                    style={s.productImage}
                  />

                  <View style={s.cardBody}>
                    <Text
                      style={s.productName}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    <Text style={s.productPrice}>
                      {Number(
                        item.price
                      ).toLocaleString()}{" "}
                      IQD
                    </Text>

                    <TouchableOpacity
                      style={s.addBtn}
                      onPress={() =>
                        addToCart(item)
                      }
                    >
                      <Text style={s.addBtnText}>
                        ➕ زیادکردن
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={s.center}>
                  <Text style={s.empty}>
                    هیچ بەرهەمێک نەدۆزرایەوە.
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}

      {tab === "cart" && (
        <View style={s.flex}>
          <ScrollView
            contentContainerStyle={s.pad}
          >
            <Text style={s.pageTitle}>
              🛒 سەبەت
            </Text>

            {cart.length === 0 ? (
              <View style={s.emptyCart}>
                <Text style={s.emptyIcon}>
                  🛒
                </Text>

                <Text style={s.empty}>
                  سەبەتەکەت بەتاڵە.
                </Text>

                <TouchableOpacity
                  style={s.goldBtn}
                  onPress={() =>
                    setTab("home")
                  }
                >
                  <Text style={s.goldText}>
                    بینینی بەرهەمەکان
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {cart.map((product, index) => (
                  <View
                    key={`${product.id}-${index}`}
                    style={s.cartItem}
                  >
                    <Image
                      source={{
                        uri: product.image,
                      }}
                      style={s.cartImage}
                    />

                    <View style={s.cartInfo}>
                      <Text
                        style={s.cartName}
                        numberOfLines={2}
                      >
                        {product.name}
                      </Text>

                      <Text style={s.cartPrice}>
                        {Number(
                          product.price
                        ).toLocaleString()}{" "}
                        IQD
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() =>
                        removeFromCart(index)
                      }
                    >
                      <Text
                        style={s.removeText}
                      >
                        🗑️
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={s.totalBox}>
                  <Text style={s.totalLabel}>
                    کۆی گشتی
                  </Text>

                  <Text style={s.totalPrice}>
                    {total.toLocaleString()} IQD
                  </Text>
                </View>

                <TouchableOpacity
                  style={s.goldBtn}
                  onPress={openCheckout}
                >
                  <Text style={s.goldText}>
                    📦 تەواوکردنی داواکاری
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      )}

      {tab === "profile" && (
        <ScrollView
          contentContainerStyle={s.pad}
        >
          <Text style={s.pageTitle}>
            👤 Shwshawaty ASYA
          </Text>

          <View style={s.profileBox}>
            <Text style={s.profileLogo}>
              ASYA
            </Text>

            <Text style={s.profileTitle}>
              بەخێربێیت بۆ Shwshawaty ASYA
            </Text>

            <Text style={s.profileText}>
              بۆ بینینی بەرهەمەکان، سەبەت و
              ناردنی داواکاری لەگەڵمان بەکاربهێنە.
            </Text>

            <TouchableOpacity
              style={s.goldBtn}
              onPress={() => setTab("home")}
            >
              <Text style={s.goldText}>
                🛍️ دەستپێکردنی کڕین
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={s.adminProfileBtn}
            onPress={() => setShowAdmin(true)}
          >
            <Text style={s.adminProfileText}>
              ⚙️ بەشی بەڕێوەبەر
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {selected && (
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <TouchableOpacity
              style={s.close}
              onPress={() =>
                setSelected(null)
              }
            >
              <Text style={s.closeText}>
                ✕
              </Text>
            </TouchableOpacity>

            <Image
              source={{
                uri: selected.image,
              }}
              style={s.modalImage}
            />

            <Text style={s.modalTitle}>
              {selected.name}
            </Text>

            <Text style={s.modalCategory}>
              {selected.category}
            </Text>

            <Text style={s.modalPrice}>
              {Number(
                selected.price
              ).toLocaleString()}{" "}
              IQD
            </Text>

            <TouchableOpacity
              style={s.goldBtn}
              onPress={() => {
                addToCart(selected);
                setSelected(null);
              }}
            >
              <Text style={s.goldText}>
                🛒 زیادکردن بۆ سەبەت
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={s.bottomNav}>
        <TouchableOpacity
          style={s.navItem}
          onPress={() => setTab("home")}
        >
          <Text style={s.navIcon}>🏠</Text>
          <Text style={s.navText}>
            سەرەکی
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.navItem}
          onPress={() => setTab("cart")}
        >
          <View>
            <Text style={s.navIcon}>🛒</Text>

            {cart.length > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>
                  {cart.length}
                </Text>
              </View>
            )}
          </View>

          <Text style={s.navText}>
            سەبەت
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.navItem}
          onPress={() => setTab("profile")}
        >
          <Text style={s.navIcon}>👤</Text>
          <Text style={s.navText}>
            پڕۆفایل
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#111111",
  },

  flex: {
    flex: 1,
  },

  header: {
    height: 65,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
  },

  logo: {
    color: "#d6b56b",
    fontSize: 21,
    fontWeight: "800",
  },

  adminIcon: {
    fontSize: 22,
  },

  searchBox: {
    margin: 14,
    backgroundColor: "#1d1d1d",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#303030",
  },

  searchInput: {
    color: "#fff",
    paddingHorizontal: 16,
    height: 48,
    textAlign: "right",
    fontSize: 15,
  },

  cats: {
    paddingHorizontal: 10,
    maxHeight: 52,
  },

  cat: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#202020",
  },

  catActive: {
    backgroundColor: "#d6b56b",
  },

  catText: {
    color: "#ddd",
    fontSize: 13,
  },

  catTextActive: {
    color: "#111",
    fontSize: 13,
    fontWeight: "700",
  },

  grid: {
    padding: 10,
    paddingBottom: 100,
  },

  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#1d1d1d",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2c2c2c",
  },

  productImage: {
    width: "100%",
    height: 155,
    backgroundColor: "#292929",
  },

  cardBody: {
    padding: 10,
  },

  productName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    minHeight: 40,
    textAlign: "right",
  },

  productPrice: {
    color: "#d6b56b",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 7,
    textAlign: "right",
  },

  addBtn: {
    marginTop: 9,
    backgroundColor: "#d6b56b",
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: "center",
  },

  addBtnText: {
    color: "#111",
    fontWeight: "800",
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: "#181818",
    borderTopWidth: 1,
    borderTopColor: "#303030",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  navItem: {
    alignItems: "center",
    minWidth: 80,
  },

  navIcon: {
    fontSize: 22,
  },

  navText: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 3,
  },

  badge: {
    position: "absolute",
    right: -9,
    top: -5,
    backgroundColor: "#d6b56b",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    color: "#111",
    fontSize: 10,
    fontWeight: "800",
  },

  pad: {
    padding: 18,
    paddingBottom: 100,
  },

  pageTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 18,
    textAlign: "right",
  },

  desc: {
    color: "#aaa",
    lineHeight: 23,
    marginBottom: 18,
    textAlign: "right",
  },

  label: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 7,
    textAlign: "right",
  },

  input: {
    backgroundColor: "#1d1d1d",
    borderWidth: 1,
    borderColor: "#343434",
    borderRadius: 10,
    color: "#fff",
    paddingHorizontal: 14,
    minHeight: 48,
    textAlign: "right",
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  goldBtn: {
    backgroundColor: "#d6b56b",
    borderRadius: 11,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginTop: 15,
  },

  goldText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "800",
  },

  cancelBtn: {
    backgroundColor: "#292929",
    borderRadius: 11,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  cancelText: {
    color: "#ddd",
    fontWeight: "700",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loading: {
    color: "#d6b56b",
    fontSize: 17,
  },

  empty: {
    color: "#888",
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
  },

  emptyCart: {
    alignItems: "center",
    paddingTop: 50,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 15,
  },

  cartItem: {
    backgroundColor: "#1d1d1d",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  cartImage: {
    width: 70,
    height: 70,
    borderRadius: 9,
  },

  cartInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },

  cartName: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "right",
  },

  cartPrice: {
    color: "#d6b56b",
    fontWeight: "800",
    textAlign: "right",
    marginTop: 6,
  },

  removeText: {
    fontSize: 22,
    padding: 7,
  },

  totalBox: {
    backgroundColor: "#1d1d1d",
    borderRadius: 12,
    padding: 17,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#303030",
  },

  totalLabel: {
    color: "#aaa",
    textAlign: "right",
    fontSize: 14,
  },

  totalPrice: {
    color: "#d6b56b",
    textAlign: "right",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 5,
  },

  profileBox: {
    backgroundColor: "#1d1d1d",
    borderRadius: 15,
    padding: 22,
    alignItems: "center",
  },

  profileLogo: {
    color: "#d6b56b",
    fontSize: 45,
    fontWeight: "900",
  },

  profileTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 15,
    textAlign: "center",
  },

  profileText: {
    color: "#aaa",
    lineHeight: 23,
    marginTop: 10,
    textAlign: "center",
  },

  adminProfileBtn: {
    backgroundColor: "#1d1d1d",
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
    alignItems: "center",
  },

  adminProfileText: {
    color: "#d6b56b",
    fontWeight: "800",
  },

  adminBox: {
    backgroundColor: "#1d1d1d",
    borderRadius: 14,
    padding: 15,
    borderWidth: 1,
    borderColor: "#303030",
  },

  adminBoxTitle: {
    color: "#d6b56b",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 10,
  },

  imageText: {
    color: "#888",
    textAlign: "right",
    marginBottom: 5,
  },

  preview: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 12,
  },

  adminListTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 22,
    marginBottom: 12,
    textAlign: "right",
  },

  adminProduct: {
    backgroundColor: "#1d1d1d",
    borderRadius: 12,
    padding: 9,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  adminProductImage: {
    width: 70,
    height: 70,
    borderRadius: 9,
  },

  adminProductInfo: {
    flex: 1,
    paddingHorizontal: 9,
  },

  adminProductName: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "right",
  },

  adminProductPrice: {
    color: "#d6b56b",
    fontWeight: "800",
    textAlign: "right",
    marginTop: 4,
  },

  adminProductCategory: {
    color: "#888",
    fontSize: 11,
    textAlign: "right",
    marginTop: 3,
  },

  adminActions: {
    gap: 7,
  },

  editBtn: {
    backgroundColor: "#292929",
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  editText: {
    fontSize: 17,
  },

  deleteSmallBtn: {
    backgroundColor: "#292929",
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteSmallText: {
    fontSize: 17,
  },

  back: {
    color: "#d6b56b",
    fontSize: 16,
    padding: 16,
    textAlign: "right",
  },

  modalOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.82)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#1d1d1d",
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: "#383838",
  },

  close: {
    position: "absolute",
    right: 12,
    top: 10,
    zIndex: 5,
    backgroundColor: "#292929",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#fff",
    fontSize: 18,
  },

  modalImage: {
    width: "100%",
    height: 280,
    borderRadius: 12,
    backgroundColor: "#292929",
  },

  modalTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 15,
    textAlign: "right",
  },

  modalCategory: {
    color: "#888",
    marginTop: 6,
    textAlign: "right",
  },

  modalPrice: {
    color: "#d6b56b",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8,
    textAlign: "right",
  },
});
