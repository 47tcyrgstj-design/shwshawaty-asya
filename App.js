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
  onSnapshot,
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
  const [newCategory, setNewCategory] =
    useState("کاڵای ناوماڵ");
  const [newImage, setNewImage] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

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
        console.log("Firebase realtime error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
  };

  const addProduct = async () => {
    if (!newName.trim()) {
      Alert.alert("هەڵە", "ناوی بەرهەم بنووسە.");
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
        "لینکی وێنەکە بنووسە."
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
        }
      );

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
        "لینکی وێنەکە بنووسە."
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
  };  if (showAdmin) {
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

                  <Text style={s.label}>
                    لینکـی وێنەی بەرهەم
                  </Text>

                  <TextInput
                    value={newImage}
                    onChangeText={setNewImage}
                    placeholder="https://..."
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    keyboardType="url"
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

                {products.map((product) => (
                  <View
                    key={product.id}
                    style={s.adminProduct}
                  >
                    <Image
                      source={{ uri: product.image }}
                      style={s.adminProductImage}
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
                          product.price
                        ).toLocaleString()}{" "}
                        IQD
                      </Text>

                      <Text
                        style={s.adminProductCategory}
                      >
                        {product.category}
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
        <ScrollView>
          <TouchableOpacity
            onPress={() => setShowCheckout(false)}
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
                  onPress={() => setSelected(item)}
                >
                  <Image
                    source={{ uri: item.image }}
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
          <ScrollView contentContainerStyle={s.pad}>
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
                  onPress={() => setTab("home")}
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
                      source={{ uri: product.image }}
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
                      <Text style={s.removeText}>
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
        <ScrollView contentContainerStyle={s.pad}>
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
              بۆ بینینی بەرهەمەکان، سەبەت و ناردنی
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
              onPress={() => setSelected(null)}
            >
              <Text style={s.closeText}>✕</Text>
            </TouchableOpacity>

            <Image
              source={{ uri: selected.image }}
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
}const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b0b0b",
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
    backgroundColor: "#111111",
    borderBottomWidth: 1,
    borderBottomColor: "#2b2b2b",
  },

  logo: {
    color: "#d4af37",
    fontSize: 21,
    fontWeight: "800",
  },

  adminIcon: {
    fontSize: 24,
  },

  searchBox: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 5,
  },

  searchInput: {
    backgroundColor: "#181818",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    textAlign: "right",
  },

  cats: {
    maxHeight: 55,
    paddingHorizontal: 10,
    marginTop: 5,
  },

  cat: {
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: "#292929",
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    marginHorizontal: 4,
    alignSelf: "center",
  },

  catActive: {
    backgroundColor: "#d4af37",
    borderColor: "#d4af37",
  },

  catText: {
    color: "#ccc",
    fontSize: 13,
    fontWeight: "600",
  },

  catTextActive: {
    color: "#111",
    fontSize: 13,
    fontWeight: "800",
  },

  grid: {
    paddingHorizontal: 9,
    paddingTop: 10,
    paddingBottom: 90,
  },

  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#151515",
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#282828",
  },

  productImage: {
    width: "100%",
    height: 170,
    backgroundColor: "#222",
  },

  cardBody: {
    padding: 10,
  },

  productName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    minHeight: 40,
  },

  productPrice: {
    color: "#d4af37",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "right",
  },

  addBtn: {
    backgroundColor: "#d4af37",
    marginTop: 9,
    borderRadius: 9,
    paddingVertical: 9,
    alignItems: "center",
  },

  addBtnText: {
    color: "#111",
    fontSize: 13,
    fontWeight: "800",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loading: {
    color: "#d4af37",
    fontSize: 16,
  },

  empty: {
    color: "#999",
    fontSize: 15,
    textAlign: "center",
    marginVertical: 20,
  },

  pad: {
    padding: 16,
    paddingBottom: 100,
  },

  pageTitle: {
    color: "#d4af37",
    fontSize: 23,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 18,
  },

  desc: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 24,
    textAlign: "right",
    marginBottom: 20,
  },

  label: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: "#303030",
    color: "#fff",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 15,
    textAlign: "right",
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  goldBtn: {
    backgroundColor: "#d4af37",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  goldText: {
    color: "#111",
    fontSize: 15,
    fontWeight: "800",
  },

  cancelBtn: {
    backgroundColor: "#252525",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },

  cancelText: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "700",
  },

  adminBox: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 15,
    padding: 14,
  },

  adminBoxTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
    marginBottom: 8,
  },

  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: "#222",
  },

  adminListTitle: {
    color: "#d4af37",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 25,
    marginBottom: 10,
  },

  adminProduct: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 13,
    padding: 9,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  adminProductImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#222",
  },

  adminProductInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },

  adminProductName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },

  adminProductPrice: {
    color: "#d4af37",
    fontSize: 13,
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
    justifyContent: "center",
    gap: 7,
  },

  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteSmallBtn: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: "#321919",
    alignItems: "center",
    justifyContent: "center",
  },

  editText: {
    fontSize: 18,
  },

  deleteSmallText: {
    fontSize: 18,
  },

  back: {
    color: "#d4af37",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 15,
    textAlign: "right",
  },

  cartItem: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 13,
    padding: 9,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  cartImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#222",
  },

  cartInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },

  cartName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },

  cartPrice: {
    color: "#d4af37",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 5,
  },

  removeText: {
    fontSize: 21,
  },

  totalBox: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#d4af37",
    borderRadius: 13,
    padding: 15,
    marginTop: 15,
  },

  totalLabel: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "right",
  },

  totalPrice: {
    color: "#d4af37",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 5,
  },

  emptyCart: {
    alignItems: "center",
    paddingTop: 70,
  },

  emptyIcon: {
    fontSize: 55,
    marginBottom: 10,
  },

  profileBox: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 18,
    padding: 20,
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
    fontWeight: "800",
    textAlign: "center",
    marginTop: 15,
  },

  profileText: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 12,
  },

  adminProfileBtn: {
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 15,
  },

  adminProfileText: {
    color: "#d4af37",
    fontSize: 15,
    fontWeight: "800",
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.82)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    width: "100%",
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
    zIndex: 5,
    width: 35,
    height: 35,
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
    backgroundColor: "#222",
  },

  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 15,
  },

  modalCategory: {
    color: "#999",
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
    borderTopColor: "#2b2b2b",
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
