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
