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
const PRODUCTS_COLLECTION = "Products";

const cats = [
  "هەموو",
  "سێتی نان خواردن",
  "پیاڵە و قۆری",
  "کاسە و جام",
  "کۆمەڵە دیاری",
  "کاڵای ناوماڵ",
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [category, setCategory] = useState("هەموو");
  const [query, setQuery] = useState("");

  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);

  const [products, setProducts] = useState([]);
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

  // ==============================
  // FIRESTORE
  // ==============================

  useEffect(() => {
    const productsRef = collection(
      db,
      PRODUCTS_COLLECTION
    );

    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const data = snapshot.docs.map((item) => {
          const d = item.data();

          return {
            id: item.id,
            Name: d.Name || d.name || "",
            Price: Number(d.Price ?? d.price ?? 0),
            Category:
              d.Category ||
              d.category ||
              "",
            image: d.image || "",
            name: d.Name || d.name || "",
            price: Number(d.Price ?? d.price ?? 0),
            category:
              d.Category ||
              d.category ||
              "",
          };
        });

        console.log(
          "FIRESTORE PRODUCTS:",
          data
        );

        setProducts(data);
        setLoading(false);
      },
      (error) => {
        console.log(
          "Firestore error:",
          error
        );

        setLoading(false);

        Alert.alert(
          "هەڵەی Database",
          "نەتوانرا بەرهەمەکان لە Firestore بخوێندرێنەوە."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // ==============================
  // FILTER
  // ==============================

  const filtered = useMemo(() => {
    const search = query
      .trim()
      .toLowerCase();

    return products.filter((p) => {
      const productCategory =
        p.Category ||
        p.category ||
        "";

      const productName =
        p.Name ||
        p.name ||
        "";

      const categoryOK =
        category === "هەموو" ||
        productCategory === category;

      const searchOK =
        !search ||
        productName
          .toLowerCase()
          .includes(search);

      return categoryOK && searchOK;
    });
  }, [products, category, query]);

  // ==============================
  // CART
  // ==============================

  const addToCart = (product) => {
    setCart((current) => [
      ...current,
      product,
    ]);

    Alert.alert(
      "زیادکرا ✅",
      `${product.Name || product.name} خرایە ناو سەبەتەکە.`
    );
  };

  const removeFromCart = (index) => {
    setCart((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  };

  const total = cart.reduce(
    (sum, product) =>
      sum +
      Number(
        product.Price ??
          product.price ??
          0
      ),
    0
  );

  // ==============================
  // CHECKOUT
  // ==============================

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
      Alert.alert(
        "هەڵە",
        "ناوت بنووسە."
      );
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
      .map((p, i) => {
        const name =
          p.Name ||
          p.name ||
          "بەرهەم";

        const price = Number(
          p.Price ??
            p.price ??
            0
        );

        return `${i + 1}. ${name} - ${price.toLocaleString()} IQD`;
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

  // ==============================
  // ADMIN
  // ==============================

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
      Alert.alert(
        "هەڵە",
        "ناوی بەرهەم بنووسە."
      );
      return;
    }

    if (
      !newPrice.trim() ||
      Number.isNaN(Number(newPrice))
    ) {
      Alert.alert(
        "هەڵە",
        "نرخ بە ژمارە بنووسە."
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
        collection(
          db,
          PRODUCTS_COLLECTION
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

    setNewName(
      product.Name ||
        product.name ||
        ""
    );

    setNewPrice(
      String(
        product.Price ??
          product.price ??
          ""
      )
    );

    setNewCategory(
      product.Category ||
        product.category ||
        "کاڵای ناوماڵ"
    );

    setNewImage(
      product.image || ""
    );
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
      Number.isNaN(Number(newPrice))
    ) {
      Alert.alert(
        "هەڵە",
        "نرخ بە ژمارە بنووسە."
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
    const name =
      product.Name ||
      product.name ||
      "بەرهەم";

    Alert.alert(
      "سڕینەوەی بەرهەم",
      `دڵنیایت دەتەوێت "${name}" بسڕیتەوە؟`,
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
                doc(
                  db,
                  PRODUCTS_COLLECTION,
                  product.id
                )
              );

              if (
                editingProduct &&
                editingProduct.id ===
                  product.id
              ) {
                resetProductForm();
              }

              Alert.alert(
                "سڕایەوە ✅",
                "بەرهەمەکە سڕایەوە."
              );
            } catch (error) {
              console.log(
                "Delete error:",
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

  // ==============================
  // ADMIN PAGE
  // ==============================

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
                    لینکی وێنە
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
                      source={{
                        uri: newImage,
                      }}
                      style={s.preview}
                    />
                  ) : null}

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
                    />

                    <View
                      style={s.adminProductInfo}
                    >
                      <Text
                        style={s.adminProductName}
                        numberOfLines={2}
                      >
                        {product.Name ||
                          product.name}
                      </Text>

                      <Text
                        style={s.adminProductPrice}
                      >
                        {Number(
                          product.Price ??
                            product.price ??
                            0
                        ).toLocaleString()}{" "}
                        IQD
                      </Text>

                      <Text
                        style={
                          s.adminProductCategory
                        }
                      >
                        {product.Category ||
                          product.category}
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
                        style={s.deleteSmallBtn}
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
                ))}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ==============================
  // CHECKOUT PAGE
  // ==============================

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
              style={[
                s.input,
                s.textArea,
              ]}
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
              style={[
                s.input,
                s.textArea,
              ]}
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

  // ==============================
  // MAIN PAGE
  // ==============================

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.logo}>
          Shwshawaty ASYA
        </Text>

        <TouchableOpacity
          onPress={() =>
            setShowAdmin(true)
          }
        >
          <Text style={s.adminIcon}>
            ⚙️
          </Text>
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
                onPress={() =>
                  setCategory(c)
                }
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
                      {item.Name ||
                        item.name}
                    </Text>

                    <Text
                      style={s.productPrice}
                    >
                      {Number(
                        item.Price ??
                          item.price ??
                          0
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
                    هیچ بەرهەمێک نەدۆزرایەوە.
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}

      {tab === "cart" && (
        <ScrollView
          contentContainerStyle={
            s.cartContainer
          }
        >
          <Text style={s.pageTitle}>
            🛒 سەبەتەکەت
          </Text>

          {cart.length === 0 ? (
            <View style={s.emptyCart}>
              <Text style={s.emptyCartIcon}>
                🛒
              </Text>

              <Text style={s.empty}>
                سەبەتەکە بەتاڵە
              </Text>

              <TouchableOpacity
                style={s.goldBtn}
                onPress={() =>
                  setTab("home")
                }
              >
                <Text style={s.goldText}>
                  🛍️ بینینی بەرهەمەکان
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
                      {product.Name ||
                        product.name}
                    </Text>

                    <Text style={s.cartPrice}>
                      {Number(
                        product.Price ??
                          product.price ??
                          0
                      ).toLocaleString()}{" "}
                      IQD
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={s.removeBtn}
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
                  📲 تەواوکردنی داواکاری
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setCart([])}
              >
                <Text style={s.cancelText}>
                  🗑️ بەتاڵکردنەوەی سەبەت
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      {selected && (
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <TouchableOpacity
              style={s.closeBtn}
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
              style={s.detailImage}
            />

            <Text style={s.detailName}>
              {selected.Name ||
                selected.name}
            </Text>

            <Text style={s.detailCategory}>
              {selected.Category ||
                selected.category}
            </Text>

            <Text style={s.detailPrice}>
              {Number(
                selected.Price ??
                  selected.price ??
                  0
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

            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() =>
                setSelected(null)
              }
            >
              <Text style={s.cancelText}>
                داخستن
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={s.bottomNav}>
        <TouchableOpacity
          style={s.navItem}
          onPress={() =>
            setTab("home")
          }
        >
          <Text style={s.navIcon}>
            🏠
          </Text>

          <Text
            style={
              tab === "home"
                ? s.navTextActive
                : s.navText
            }
          >
            سەرەتا
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.navItem}
          onPress={() =>
            setTab("cart")
          }
        >
          <Text style={s.navIcon}>
            🛒
          </Text>

          <Text
            style={
              tab === "cart"
                ? s.navTextActive
                : s.navText
            }
          >
            سەبەت
            {cart.length > 0
              ? ` (${cart.length})`
              : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.navItem}
          onPress={() =>
            setShowAdmin(true)
          }
        >
          <Text style={s.navIcon}>
            ⚙️
          </Text>

          <Text style={s.navText}>
            ڕێکخستن
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ==============================
// STYLES
// ==============================

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#111",
  },

  header: {
    height: 65,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#171717",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },

  logo: {
    color: "#D4AF37",
    fontSize: 21,
    fontWeight: "bold",
  },

  adminIcon: {
    fontSize: 25,
  },

  searchBox: {
    margin: 12,
    backgroundColor: "#1d1d1d",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },

  searchInput: {
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: "right",
  },

  cats: {
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  cat: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#444",
  },

  catActive: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },

  catText: {
    color: "#ccc",
    fontSize: 14,
  },

  catTextActive: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 14,
  },

  grid: {
    padding: 8,
    paddingBottom: 100,
  },

  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#1b1b1b",
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },

  productImage: {
    width: "100%",
    height: 170,
    backgroundColor: "#292929",
  },

  cardBody: {
    padding: 10,
  },

  productName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
    minHeight: 42,
  },

  productPrice: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 5,
  },

  addBtn: {
    backgroundColor: "#D4AF37",
    paddingVertical: 9,
    borderRadius: 9,
    marginTop: 9,
  },

  addBtnText: {
    color: "#111",
    textAlign: "center",
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loading: {
    color: "#D4AF37",
    fontSize: 18,
  },

  empty: {
    color: "#aaa",
    fontSize: 17,
    textAlign: "center",
    marginVertical: 20,
  },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: "#171717",
    borderTopWidth: 1,
    borderTopColor: "#333",
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
    fontSize: 22,
    marginBottom: 3,
  },

  navText: {
    color: "#aaa",
    fontSize: 12,
  },

  navTextActive: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
  },

  back: {
    color: "#D4AF37",
    fontSize: 17,
    padding: 16,
    textAlign: "right",
  },

  pad: {
    padding: 16,
    paddingBottom: 40,
  },

  pageTitle: {
    color: "#D4AF37",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 15,
  },

  desc: {
    color: "#aaa",
    fontSize: 15,
    textAlign: "right",
    lineHeight: 25,
    marginBottom: 20,
  },

  label: {
    color: "#ddd",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 12,
    marginBottom: 7,
  },

  input: {
    backgroundColor: "#1d1d1d",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 10,
    color: "#fff",
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: "right",
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  goldBtn: {
    backgroundColor: "#D4AF37",
    borderRadius: 11,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginTop: 15,
    alignItems: "center",
  },

  goldText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  cancelBtn: {
    backgroundColor: "#292929",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 11,
    paddingVertical: 13,
    marginTop: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "#ddd",
    fontSize: 15,
    fontWeight: "bold",
  },

  adminBox: {
    backgroundColor: "#191919",
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#333",
  },

  adminBoxTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 8,
  },

  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: "#222",
  },

  adminListTitle: {
    color: "#D4AF37",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 25,
    marginBottom: 12,
  },

  adminProduct: {
    backgroundColor: "#1b1b1b",
    borderRadius: 13,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },

  adminProductImage: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: "#292929",
  },

  adminProductInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },

  adminProductName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
  },

  adminProductPrice: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 4,
  },

  adminProductCategory: {
    color: "#999",
    fontSize: 12,
    textAlign: "right",
    marginTop: 3,
  },

  adminActions: {
    justifyContent: "center",
    gap: 7,
  },

  editBtn: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },

  editText: {
    fontSize: 20,
  },

  deleteSmallBtn: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: "#3a2020",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteSmallText: {
    fontSize: 19,
  },

  cartContainer: {
    padding: 15,
    paddingBottom: 100,
  },

  emptyCart: {
    alignItems: "center",
    paddingTop: 70,
  },

  emptyCartIcon: {
    fontSize: 60,
    marginBottom: 10,
  },

  cartItem: {
    backgroundColor: "#1b1b1b",
    borderRadius: 13,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },

  cartImage: {
    width: 75,
    height: 75,
    borderRadius: 10,
    backgroundColor: "#292929",
  },

  cartInfo: {
    flex: 1,
    paddingHorizontal: 10,
  },

  cartName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
  },

  cartPrice: {
    color: "#D4AF37",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 5,
  },

  removeBtn: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: "#3a2020",
    alignItems: "center",
    justifyContent: "center",
  },

  removeText: {
    fontSize: 19,
  },

  totalBox: {
    backgroundColor: "#1b1b1b",
    borderRadius: 13,
    padding: 18,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#D4AF37",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: "#ddd",
    fontSize: 17,
    fontWeight: "bold",
  },

  totalPrice: {
    color: "#D4AF37",
    fontSize: 20,
    fontWeight: "bold",
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 72,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 100,
  },

  modalBox: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#181818",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#444",
  },

  closeBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  closeText: {
    color: "#fff",
    fontSize: 20,
  },

  detailImage: {
    width: "100%",
    height: 270,
    borderRadius: 14,
    backgroundColor: "#292929",
    marginBottom: 15,
  },

  detailName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 8,
  },

  detailCategory: {
    color: "#999",
    fontSize: 14,
    textAlign: "right",
    marginBottom: 8,
  },

  detailPrice: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 5,
  },
});
