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

// ⚠️ گرنگ: Collection ـەکەت لە Firestore بە Products ـە
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

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);

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

  // =========================
  // FIRESTORE
  // =========================
  useEffect(() => {
    const ref = collection(db, PRODUCTS_COLLECTION);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        console.log("PRODUCTS FROM FIRESTORE:", data.length);
        setProducts(data);
        setLoading(false);
      },
      (error) => {
        console.log("FIRESTORE ERROR:", error);
        setLoading(false);
        Alert.alert(
          "هەڵەی Database",
          "نەتوانرا بەرهەمەکان لە Firestore بخوێندرێنەوە."
        );
      }
    );

    return unsubscribe;
  }, []);

  // =========================
  // FILTER
  // =========================
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((p) => {
      const name = String(p.Name ?? p.name ?? "");
      const cat = String(p.Category ?? p.category ?? "");

      const categoryOK =
        category === "هەموو" || cat === category;

      const searchOK =
        !search || name.toLowerCase().includes(search);

      return categoryOK && searchOK;
    });
  }, [products, category, query]);

  // =========================
  // CART
  // =========================
  const addToCart = (product) => {
    setCart((current) => [...current, product]);

    Alert.alert(
      "زیادکرا ✅",
      `${product.Name ?? product.name} خرایە ناو سەبەتەکە.`
    );
  };

  const removeFromCart = (index) => {
    setCart((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const total = cart.reduce(
    (sum, p) =>
      sum + Number(p.Price ?? p.price ?? 0),
    0
  );

  // =========================
  // WHATSAPP
  // =========================
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
      .map((p, i) => {
        const name = p.Name ?? p.name ?? "";
        const price = Number(p.Price ?? p.price ?? 0);

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
      `📝 تێبینی: ${customerNote.trim() || "نییە"}`;

    const url =
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("هەڵە", "WhatsApp نەکرایەوە.");
    }
  };

  // =========================
  // ADMIN
  // =========================
  const loginAdmin = () => {
    if (password === ADMIN_PASSWORD) {
      setAdminLogin(true);
      setPassword("");
    } else {
      Alert.alert("پاسۆرد هەڵەیە ❌");
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

    if (!newPrice.trim() || isNaN(Number(newPrice))) {
      Alert.alert("هەڵە", "نرخ بە ژمارە بنووسە.");
      return;
    }

    if (!newImage.trim()) {
      Alert.alert("هەڵە", "لینکی وێنە بنووسە.");
      return;
    }

    try {
      await addDoc(collection(db, PRODUCTS_COLLECTION), {
        Name: newName.trim(),
        Price: Number(newPrice),
        Category: newCategory,
        image: newImage.trim(),
      });

      resetProductForm();

      Alert.alert(
        "سەرکەوتوو بوو ✅",
        "بەرهەمەکە زیاد کرا."
      );
    } catch (error) {
      console.log(error);
      Alert.alert("هەڵە", "نەتوانرا بەرهەم زیاد بکرێت.");
    }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);

    setNewName(product.Name ?? product.name ?? "");
    setNewPrice(
      String(product.Price ?? product.price ?? "")
    );
    setNewCategory(
      product.Category ?? product.category ?? "کاڵای ناوماڵ"
    );
    setNewImage(product.image ?? "");
  };

  const updateProduct = async () => {
    if (!editingProduct) return;

    if (!newName.trim()) {
      Alert.alert("هەڵە", "ناوی بەرهەم بنووسە.");
      return;
    }

    if (!newPrice.trim() || isNaN(Number(newPrice))) {
      Alert.alert("هەڵە", "نرخ بە ژمارە بنووسە.");
      return;
    }

    if (!newImage.trim()) {
      Alert.alert("هەڵە", "لینکی وێنە بنووسە.");
      return;
    }

    try {
      await updateDoc(
        doc(db, PRODUCTS_COLLECTION, editingProduct.id),
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
    const name = product.Name ?? product.name ?? "";

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
                doc(db, PRODUCTS_COLLECTION, product.id)
              );

              if (
                editingProduct?.id === product.id
              ) {
                resetProductForm();
              }
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

  // =========================
  // ADMIN PAGE
  // =========================
  if (showAdmin) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView>
          <TouchableOpacity
            onPress={() => {
              setShowAdmin(false);
              setAdminLogin(false);
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

                <Text style={s.label}>
                  پاسۆرد
                </Text>

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="پاسۆرد"
                  placeholderTextColor="#777"
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
                      ? "✏️ دەستکاریکردن"
                      : "➕ زیادکردنی بەرهەم"}
                  </Text>

                  <Text style={s.label}>
                    وێنە
                  </Text>

                  <TextInput
                    value={newImage}
                    onChangeText={setNewImage}
                    placeholder="https://..."
                    placeholderTextColor="#777"
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
                    placeholderTextColor="#777"
                    style={s.input}
                  />

                  <Text style={s.label}>
                    نرخ
                  </Text>

                  <TextInput
                    value={newPrice}
                    onChangeText={setNewPrice}
                    placeholder="50000"
                    placeholderTextColor="#777"
                    keyboardType="numeric"
                    style={s.input}
                  />

                  <Text style={s.label}>
                    جۆر
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
                        ? "💾 پاشەکەوتکردن"
                        : "➕ زیادکردن"}
                    </Text>
                  </TouchableOpacity>

                  {editingProduct && (
                    <TouchableOpacity
                      style={s.cancelBtn}
                      onPress={resetProductForm}
                    >
                      <Text style={s.cancelText}>
                        ✕ هەڵوەشاندنەوە
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={s.adminListTitle}>
                  📦 {products.length} بەرهەم
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

                    <View style={s.adminProductInfo}>
                      <Text
                        style={s.adminProductName}
                        numberOfLines={2}
                      >
                        {product.Name ??
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
                        style={s.adminProductCategory}
                      >
                        {product.Category ??
                          product.category}
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
                        <Text style={s.deleteSmallText}>
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

  // =========================
  // CHECKOUT
  // =========================
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
              👤 ناو
            </Text>

            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="ناوت"
              placeholderTextColor="#777"
              style={s.input}
            />

            <Text style={s.label}>
              📞 مۆبایل
            </Text>

            <TextInput
              value={customerPhone}
              onChangeText={setCustomerPhone}
              placeholder="07xxxxxxxxx"
              placeholderTextColor="#777"
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
              placeholderTextColor="#777"
              multiline
              style={[s.input, s.textArea]}
            />

            <Text style={s.label}>
              📝 تێبینی
            </Text>

            <TextInput
              value={customerNote}
              onChangeText={setCustomerNote}
              placeholder="تێبینی"
              placeholderTextColor="#777"
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
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =========================
  // MAIN
  // =========================
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.logo}>
          Shwshawaty ASYA
        </Text>

        <TouchableOpacity
          onPress={() => setShowAdmin(true)}
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
              placeholderTextColor="#777"
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
              renderItem={({ item }) => {
                const name =
                  item.Name ??
                  item.name ??
                  "بێ ناو";

                const price = Number(
                  item.Price ??
                    item.price ??
                    0
                );

                return (
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
                        {name}
                      </Text>

                      <Text
                        style={s.productPrice}
                      >
                        {price.toLocaleString()} IQD
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
                );
              }}
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
                      {product.Name ??
                        product.name}
                    </Text>

                    <Text
                      style={s.cartPrice}
                    >
                      {Number(
                        product.Price ??
                          product.price ??
                          0
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
                onPress={() => {
                  if (cart.length === 0) {
                    Alert.alert(
                      "سەبەت بەتاڵە"
                    );
                    return;
                  }

                  setShowCheckout(true);
                }}
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
              بۆ بینینی بەرهەمەکان،
              سەبەت و ناردنی داواکاری
              لەگەڵمان بەکاربهێنە.
            </Text>

            <TouchableOpacity
              style={s.goldBtn}
              onPress={() =>
                setTab("home")
              }
            >
              <Text style={s.goldText}>
                🛍️ دەستپێکردنی کڕین
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={s.adminProfileBtn}
            onPress={() =>
              setShowAdmin(true)
            }
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
              {selected.Name ??
                selected.name}
            </Text>

            <Text style={s.modalCategory}>
              {selected.Category ??
                selected.category}
            </Text>

            <Text style={s.modalPrice}>
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
          <Text style={s.navText}>
            سەرەکی
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.navItem}
          onPress={() =>
            setTab("cart")
          }
        >
          <View>
            <Text style={s.navIcon}>
              🛒
            </Text>

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
          onPress={() =>
            setTab("profile")
          }
        >
          <Text style={s.navIcon}>
            👤
          </Text>
          <Text style={s.navText}>
            پڕۆفایل
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// =========================
// STYLES
// =========================

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b0b0b",
  },

  header: {
    height: 65,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111",
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
    margin: 14,
  },

  searchInput: {
    backgroundColor: "#181818",
    color: "#fff",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    textAlign: "right",
  },

  cats: {
    maxHeight: 55,
    paddingHorizontal: 10,
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
    padding: 9,
    paddingBottom: 100,
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
  },

  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginTop: 10,
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
    padding: 16,
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
    color: "#d4af37",
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
