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

import { db, storage } from "./firebase";

import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import * as ImagePicker from "expo-image-picker";

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
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600",
  },
  {
    id: "2",
    name: "سێتی پیاڵە و قۆری",
    price: 45000,
    category: "پیاڵە و قۆری",
    image:
      "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600",
  },
  {
    id: "3",
    name: "کاسە و جام 6 پارچە",
    price: 30000,
    category: "کاسە و جام",
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600",
  },
  {
    id: "4",
    name: "کۆمەڵە دیاری",
    price: 90000,
    category: "کۆمەڵە دیاری",
    image:
      "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=600",
  },
  {
    id: "5",
    name: "کاڵای ناوماڵ",
    price: 55000,
    category: "کاڵای ناوماڵ",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600",
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
  const [newCategory, setNewCategory] =
    useState("کاڵای ناوماڵ");
  const [newImage, setNewImage] = useState("");

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [showCheckout, setShowCheckout] =
    useState(false);

  const [customerName, setCustomerName] =
    useState("");
  const [customerPhone, setCustomerPhone] =
    useState("");
  const [customerAddress, setCustomerAddress] =
    useState("");
  const [customerNote, setCustomerNote] =
    useState("");

  /*
   * Firebase
   *
   * گرنگ:
   * وێنەکان لە Firebase Storage هەڵدەگیرێن
   * و لە کاتی نیشاندان cache ـیان دەکرێت.
   */
  useEffect(() => {
    const productsRef = collection(db, "products");

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
        console.log(
          "Firebase realtime error:",
          error
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /*
   * Filter
   */
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

  /*
   * Cart
   */
  const addToCart = (product) => {
    setCart((current) => [
      ...current,
      product,
    ]);

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
  );  const addToCart = (product) => {
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
      Alert.alert("هەڵە", "ژمارەی مۆبایلت بنووسە.");
      return;
    }

    if (!customerAddress.trim()) {
      Alert.alert("هەڵە", "ناونیشانت بنووسە.");
      return;
    }

    const items = cart
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} - ${Number(
            p.price || 0
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
  };

  // ⚡ وێنەکان بە قەبارەی کەمتر بار دەکرێن
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "ڕێگەپێدان پێویستە",
          "تکایە ڕێگە بە ئەپەکە بدە بۆ دەستگەیشتن بە وێنەکان."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,

          // ⚡ گرنگ: قەبارەی وێنە کەم دەکەین
          quality: 0.55,

          // ⚡ وێنەکە کراپ دەکرێت بۆ قەبارەی گونجاو
          aspect: [1, 1],
        });

      if (result.canceled) return;

      const uri = result.assets[0].uri;

      setUploadingImage(true);

      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName =
        `products/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.jpg`;

      const storageRef = ref(
        storage,
        fileName
      );

      await uploadBytes(
        storageRef,
        blob,
        {
          contentType: "image/jpeg",
        }
      );

      const downloadURL =
        await getDownloadURL(storageRef);

      setNewImage(downloadURL);

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        "وێنەکە بە قەبارەی کەمتر بارکرا."
      );
    } catch (error) {
      console.log(
        "Image upload error:",
        error
      );

      Alert.alert(
        "هەڵە",
        "نەتوانرا وێنەکە بار بکرێت."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const addProduct = async () => {
    if (!newName.trim()) {
      Alert.alert(
        "هەڵە",
        "ناوی بەرهەم بنووسە."
      );
      return;
    }

    if (
      !newPrice.trim() ||
      isNaN(Number(newPrice))
    ) {
      Alert.alert(
        "هەڵە",
        "نرخی بەرهەم بە ژمارە بنووسە."
      );
      return;
    }

    if (!newImage.trim()) {
      Alert.alert(
        "هەڵە",
        "سەرەتا وێنە هەڵبژێرە."
      );
      return;
    }

    try {
      await addDoc(
        collection(db, "products"),
        {
          name: newName.trim(),
          price: Number(newPrice),
          category: newCategory,
          image: newImage.trim(),
          createdAt: Date.now(),
        }
      );

      resetProductForm();

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        "بەرهەمەکە زیاد کرا."
      );
    } catch (error) {
      console.log(
        "Add product error:",
        error
      );

      Alert.alert(
        "هەڵە",
        "نەتوانرا بەرهەمەکە زیاد بکرێت."
      );
    }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setNewName(product.name || "");
    setNewPrice(String(product.price || ""));
    setNewCategory(
      product.category || "کاڵای ناوماڵ"
    );
    setNewImage(product.image || "");
  };

  const updateProduct = async () => {
    if (!editingProduct) return;

    if (!newName.trim()) {
      Alert.alert(
        "هەڵە",
        "ناوی بەرهەم بنووسە."
      );
      return;
    }

    if (
      !newPrice.trim() ||
      isNaN(Number(newPrice))
    ) {
      Alert.alert(
        "هەڵە",
        "نرخی بەرهەم بە ژمارە بنووسە."
      );
      return;
    }

    if (!newImage.trim()) {
      Alert.alert(
        "هەڵە",
        "وێنە هەڵبژێرە."
      );
      return;
    }

    try {
      await updateDoc(
        doc(
          db,
          "products",
          editingProduct.id
        ),
        {
          name: newName.trim(),
          price: Number(newPrice),
          category: newCategory,
          image: newImage.trim(),
          updatedAt: Date.now(),
        }
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
  };  const deleteProduct = (product) => {
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
              console.log(error);

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
              ‹ گەڕانەوە
            </Text>
          </TouchableOpacity>

          <View style={s.pad}>
            {!adminLogin ? (
              <>
                <Text style={s.pageTitle}>
                  🔐 بەشی بەڕێوەبەر
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
                      ? "✏️ دەستکاری"
                      : "➕ زیادکردنی بەرهەم"}
                  </Text>

                  <TouchableOpacity
                    style={s.goldBtn}
                    onPress={pickImage}
                    disabled={uploadingImage}
                  >
                    <Text style={s.goldText}>
                      {uploadingImage
                        ? "⏳ بارکردن..."
                        : "📷 هەڵبژاردنی وێنە"}
                    </Text>
                  </TouchableOpacity>

                  <TextInput
                    value={newImage}
                    onChangeText={setNewImage}
                    placeholder="لینکی وێنە"
                    placeholderTextColor="#888"
                    style={s.input}
                  />

                  {newImage ? (
                    <Image
                      source={{ uri: newImage }}
                      style={s.preview}
                      resizeMode="cover"
                    />
                  ) : null}

                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="ناوی بەرهەم"
                    placeholderTextColor="#888"
                    style={s.input}
                  />

                  <TextInput
                    value={newPrice}
                    onChangeText={setNewPrice}
                    placeholder="نرخ"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    style={s.input}
                  />

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={s.cats}
                  >
                    {cats
                      .filter((x) => x !== "هەموو")
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

                  <TouchableOpacity
                    style={s.goldBtn}
                    onPress={
                      editingProduct
                        ? updateProduct
                        : addProduct
                    }
                  >
                    <Text style={s.goldText}>
                      {editingProduct
                        ? "💾 پاشەکەوت"
                        : "➕ زیادکردن"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {products.map((product) => (
                  <View
                    key={product.id}
                    style={s.adminProduct}
                  >
                    <Image
                      source={{
                        uri: product.image,
                      }}
                      style={s.adminProductImage}
                      resizeMode="cover"
                    />

                    <View style={s.adminProductInfo}>
                      <Text
                        style={s.adminProductName}
                        numberOfLines={2}
                      >
                        {product.name}
                      </Text>

                      <Text
                        style={s.adminProductPrice}
                      >
                        {Number(
                          product.price || 0
                        ).toLocaleString()}{" "}
                        IQD
                      </Text>
                    </View>

                    <View style={s.adminActions}>
                      <TouchableOpacity
                        style={s.editBtn}
                        onPress={() =>
                          startEditProduct(product)
                        }
                      >
                        <Text style={s.editText}>
                          ✏️
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={s.deleteSmallBtn}
                        onPress={() =>
                          deleteProduct(product)
                        }
                      >
                        <Text
                          style={s.deleteSmallText}
                        >
                          🗑️
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
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
        <ScrollView contentContainerStyle={s.pad}>
          <TouchableOpacity
            onPress={() => setShowCheckout(false)}
          >
            <Text style={s.back}>
              ‹ گەڕانەوە
            </Text>
          </TouchableOpacity>

          <Text style={s.pageTitle}>
            📝 زانیاری داواکاری
          </Text>

          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="ناوی تەواو"
            placeholderTextColor="#888"
            style={s.input}
          />

          <TextInput
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="ژمارەی مۆبایل"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            style={s.input}
          />

          <TextInput
            value={customerAddress}
            onChangeText={setCustomerAddress}
            placeholder="ناونیشان"
            placeholderTextColor="#888"
            multiline
            style={[s.input, s.textArea]}
          />

          <TextInput
            value={customerNote}
            onChangeText={setCustomerNote}
            placeholder="تێبینی"
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
              📲 ناردن بۆ WhatsApp
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.logo}>
          Shwshawaty ASYA
        </Text>

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
                  category === c &&
                    s.catActive,
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
                    source={{ uri: item.image }}
                    style={s.productImage}
                    resizeMode="cover"
                  />

                  <View style={s.cardBody}>
                    <Text
                      style={s.productName}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={s.productPrice}
                    >
                      {Number(
                        item.price || 0
                      ).toLocaleString()}{" "}
                      IQD
                    </Text>

                    <TouchableOpacity
                      style={s.addBtn}
                      onPress={() =>
                        addToCart(item)
                      }
                    >
                      <Text
                        style={s.addBtnText}
                      >
                        ➕ زیادکردن
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={s.center}>
                  <Text style={s.empty}>
                    هیچ بەرهەمێک نییە.
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}

      {tab === "cart" && (
        <ScrollView
          contentContainerStyle={s.pad}
        >
          <Text style={s.pageTitle}>
            🛒 سەبەت
          </Text>

          {cart.map((product, index) => (
            <View
              key={`${product.id}-${index}`}
              style={s.cartItem}
            >
              <Image
                source={{ uri: product.image }}
                style={s.cartImage}
                resizeMode="cover"
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
                    product.price || 0
                  ).toLocaleString()}{" "}
                  IQD
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  removeFromCart(index)
                }
              >
                <Text style={s.removeText}>
                  🗑️
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {cart.length > 0 && (
            <>
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
              بۆ بینینی بەرهەمەکان و ناردنی
              داواکاری لەگەڵمان بەکاربهێنە.
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
        </ScrollView>
      )}

      {selected && (
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <TouchableOpacity
              style={s.close}
              onPress={() => setSelected(null)}
            >
              <Text style={s.closeText}>
                ✕
              </Text>
            </TouchableOpacity>

            <Image
              source={{ uri: selected.image }}
              style={s.modalImage}
              resizeMode="cover"
            />

            <Text style={s.modalTitle}>
              {selected.name}
            </Text>

            <Text style={s.modalCategory}>
              {selected.category}
            </Text>

            <Text style={s.modalPrice}>
              {Number(
                selected.price || 0
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
          <Text style={s.navIcon}>🛒</Text>

          {cart.length > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>
                {cart.length}
              </Text>
            </View>
          )}

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
