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

import AsyncStorage from "@react-native-async-storage/async-storage";
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

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [password, setPassword] = useState("");

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] =
    useState("کاڵای ناوماڵ");
  const [newImage, setNewImage] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] =
    useState("");
  const [customerNote, setCustomerNote] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const saved =
        await AsyncStorage.getItem("asya_products");

      if (saved) {
        setProducts(JSON.parse(saved));
      }
    } catch (error) {
      console.log("Load error:", error);
    }
  };

  const saveProducts = async (list) => {
    try {
      await AsyncStorage.setItem(
        "asya_products",
        JSON.stringify(list)
      );

      setProducts(list);
    } catch (error) {
      Alert.alert(
        "هەڵە",
        "نەتوانرا بەرهەمەکان هەڵبگیرێن."
      );
    }
  };

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((p) => {
      const categoryOK =
        category === "هەموو" ||
        p.category === category;

      const searchOK =
        !search ||
        p.name.toLowerCase().includes(search);

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
    (sum, product) => sum + Number(product.price),
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

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "ڕێگەپێدان پێویستە",
          "تکایە ڕێگە بە Gallery بدە."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets &&
        result.assets.length > 0
      ) {
        setNewImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        "هەڵە",
        "نەتوانرا وێنە هەڵبژێردرێت."
      );
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
        "وێنەی بەرهەم هەڵبژێرە."
      );
      return;
    }

    const product = {
      id: Date.now().toString(),
      name: newName.trim(),
      price: Number(newPrice),
      category: newCategory,
      image: newImage,
    };

    await saveProducts([
      product,
      ...products,
    ]);

    setNewName("");
    setNewPrice("");
    setNewCategory("کاڵای ناوماڵ");
    setNewImage("");

    setAdminLogin(false);
    setShowAdmin(false);

    Alert.alert(
      "سەرکەوتوو بوو ✅",
      "بەرهەمەکە زیاد کرا."
    );
  };

  const deleteProduct = (product) => {
    Alert.alert(
      "سڕینەوە",
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
            const updated = products.filter(
              (p) => p.id !== product.id
            );

            await saveProducts(updated);
            setSelected(null);
          },
        },
      ]
    );
  };

  /* ================= ADMIN ================= */

  if (showAdmin) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setShowAdmin(false);
              setAdminLogin(false);
              setPassword("");
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
                  بەرهەم زیاد بکەیت.
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
                  ➕ زیادکردنی بەرهەم
                </Text>

                <TouchableOpacity
                  style={s.imagePicker}
                  onPress={pickImage}
                >
                  {newImage ? (
                    <Image
                      source={{ uri: newImage }}
                      style={s.preview}
                    />
                  ) : (
                    <>
                      <Text style={s.camera}>
                        📷
                      </Text>

                      <Text style={s.imageText}>
                        وێنە لە Gallery هەڵبژێرە
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

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

                <TouchableOpacity
                  style={s.goldBtn}
                  onPress={addProduct}
                >
                  <Text style={s.goldText}>
                    ➕ زیادکردنی بەرهەم
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ================= CHECKOUT ================= */

  if (showCheckout) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
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

  /* ================= PRODUCT DETAILS ================= */

  if (selected) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          <TouchableOpacity
            onPress={() => setSelected(null)}
          >
            <Text style={s.back}>
              ‹ گەڕانەوە
            </Text>
          </TouchableOpacity>

          <Image
            source={{ uri: selected.image }}
            style={s.hero}
          />

          <View style={s.pad}>
            <Text style={s.title}>
              {selected.name}
            </Text>

            <Text style={s.price}>
              {Number(
                selected.price
              ).toLocaleString()}{" "}
              IQD
            </Text>

            <Text style={s.desc}>
              بەرهەمێکی جوان و کوالێتی
              بۆ ماڵەکەت.
            </Text>

            <TouchableOpacity
              style={s.goldBtn}
              onPress={() =>
                addToCart(selected)
              }
            >
              <Text style={s.goldText}>
                🛒 زیادکردن بۆ سەبەت
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.deleteBtn}
              onPress={() =>
                deleteProduct(selected)
              }
            >
              <Text style={s.deleteText}>
                🗑️ سڕینەوەی بەرهەم
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ================= HOME HEADER ================= */

  const HomeHeader = () => (
    <>
      <View style={s.banner}>
        <Text style={s.bannerTitle}>
          بەخێربێیت بۆ ASYA
        </Text>

        <Text style={s.bannerSub}>
          جوانی بۆ ماڵەکەت
        </Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="بگەڕێ بۆ بەرهەم..."
        placeholderTextColor="#777"
        style={s.search}
      />

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

      <Text style={s.section}>
        بەرهەمەکان
      </Text>
    </>
  );

  /* ================= MAIN APP ================= */

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.brand}>
          ASYA
        </Text>

        <Text style={s.sub}>
          Shwshawaty ASYA
        </Text>
      </View>

      {tab === "home" && (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={s.card}>
              <TouchableOpacity
                onPress={() =>
                  setSelected(item)
                }
              >
                <Image
                  source={{ uri: item.image }}
                  style={s.cardImg}
                />

                <Text
                  style={s.cardName}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>

                <Text style={s.cardPrice}>
                  {Number(
                    item.price
                  ).toLocaleString()}{" "}
                  IQD
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.smallBtn}
                onPress={() =>
                  addToCart(item)
                }
              >
                <Text style={s.smallBtnText}>
                  + سەبەت
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListHeaderComponent={HomeHeader}
          contentContainerStyle={s.grid}
          columnWrapperStyle={s.columnWrapper}
          showsVerticalScrollIndicator={true}
          ListEmptyComponent={
            <Text style={s.empty}>
              هیچ بەرهەمێک نەدۆزرایەوە.
            </Text>
          }
        />
      )}

      {tab === "cart" && (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 90,
          }}
        >
          <View style={s.pad}>
            <Text style={s.pageTitle}>
              سەبەت 🛒
            </Text>

            {cart.length === 0 ? (
              <Text style={s.empty}>
                سەبەتەکەت بەتاڵە.
              </Text>
            ) : (
              <>
                {cart.map((p, i) => (
                  <View
                    style={s.row}
                    key={`${p.id}-${i}`}
                  >
                    <Text style={s.rowName}>
                      {p.name}
                    </Text>

                    <Text style={s.rowPrice}>
                      {Number(
                        p.price
                      ).toLocaleString()}{" "}
                      IQD
                    </Text>

                    <TouchableOpacity
                      onPress={() =>
                        removeFromCart(i)
                      }
                    >
                      <Text style={s.remove}>
                        ✕
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
              </>
            )}
          </View>
        </ScrollView>
      )}

      {tab === "profile" && (
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 90,
          }}
        >
          <View style={s.pad}>
            <Text style={s.pageTitle}>
              پڕۆفایل 👤
            </Text>

            <Text style={s.desc}>
              بەخێربێیت بۆ Shwshawaty ASYA.
            </Text>

            <TouchableOpacity
              style={s.addProductBtn}
              onPress={() =>
                setShowAdmin(true)
              }
            >
              <Text style={s.addProductText}>
                🔐 زیادکردنی بەرهەم
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <View style={s.nav}>
        <TouchableOpacity
          onPress={() => setTab("home")}
        >
          <Text
            style={
              tab === "home"
                ? s.navOn
                : s.navOff
            }
          >
            ⌂{"\n"}سەرەکی
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("cart")}
        >
          <Text
            style={
              tab === "cart"
                ? s.navOn
                : s.navOff
            }
          >
            🛒{"\n"}سەبەت ({cart.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("profile")}
        >
          <Text
            style={
              tab === "profile"
                ? s.navOn
                : s.navOff
            }
          >
            👤{"\n"}پڕۆفایل
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },

  header: {
    padding: 18,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
  },

  brand: {
    fontSize: 30,
    fontWeight: "800",
    color: "#d7a52b",
  },

  sub: {
    color: "#fff",
    fontSize: 12,
  },

  banner: {
    margin: 16,
    padding: 22,
    borderRadius: 18,
    backgroundColor: "#1d1d1d",
  },

  bannerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#e1b63e",
  },

  bannerSub: {
    color: "#fff",
    marginTop: 6,
    fontSize: 16,
  },

  addProductBtn: {
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#d7a52b",
    alignItems: "center",
  },

  addProductText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "800",
  },

  search: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#111",
  },

  cats: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },

  cat: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#555",
    marginRight: 8,
  },

  catActive: {
    backgroundColor: "#d7a52b",
    borderColor: "#d7a52b",
  },

  catText: {
    color: "#ddd",
  },

  catTextActive: {
    color: "#111",
    fontWeight: "700",
  },

  section: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  grid: {
    padding: 16,
    paddingBottom: 90,
  },

  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },

  card: {
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    padding: 9,
    flex: 1,
  },

  cardImg: {
    width: "100%",
    height: 145,
    borderRadius: 10,
  },

  cardName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 8,
  },

  cardPrice: {
    color: "#d7a52b",
    fontWeight: "800",
    marginTop: 5,
  },

  smallBtn: {
    backgroundColor: "#d7a52b",
    borderRadius: 9,
    padding: 8,
    marginTop: 8,
    alignItems: "center",
  },

  smallBtnText: {
    color: "#111",
    fontWeight: "800",
  },

  nav: {
    height: 68,
    borderTopWidth: 1,
    borderTopColor: "#333",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#101010",
  },

  navOn: {
    color: "#d7a52b",
    textAlign: "center",
    fontWeight: "800",
  },

  navOff: {
    color: "#aaa",
    textAlign: "center",
  },

  pad: {
    padding: 18,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 20,
  },

  empty: {
    color: "#aaa",
    fontSize: 17,
    padding: 16,
  },

  row: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  rowName: {
    color: "#fff",
    flex: 1,
  },

  rowPrice: {
    color: "#d7a52b",
    fontWeight: "700",
  },

  remove: {
    color: "#ff7777",
    fontSize: 18,
  },

  totalBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#1d1d1d",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  totalPrice: {
    color: "#d7a52b",
    fontSize: 20,
    fontWeight: "800",
  },

  goldBtn: {
    backgroundColor: "#d7a52b",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  goldText: {
    color: "#111",
    fontWeight: "800",
    fontSize: 16,
  },

  back: {
    color: "#d7a52b",
    fontSize: 18,
    padding: 16,
  },

  hero: {
    width: "100%",
    height: 330,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: "#fff",
  },

  price: {
    fontSize: 22,
    color: "#d7a52b",
    fontWeight: "800",
    marginTop: 10,
  },

  desc: {
    color: "#ccc",
    fontSize: 16,
    lineHeight: 26,
    marginTop: 15,
  },

  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 7,
  },

  input: {
    backgroundColor: "#fff",
    color: "#111",
    borderRadius: 12,
    padding: 13,
    fontSize: 15,
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  imagePicker: {
    height: 220,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#d7a52b",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#191919",
  },

  preview: {
    width: "100%",
    height: "100%",
  },

  camera: {
    fontSize: 45,
  },

  imageText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
  },

  deleteBtn: {
    borderWidth: 1,
    borderColor: "#8b3333",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },

  deleteText: {
    color: "#ff7777",
    fontWeight: "700",
  },
});
