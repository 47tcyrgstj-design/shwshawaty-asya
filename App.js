import React, { useMemo, useState } from "react";
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
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const WHATSAPP = "9647718758585";
const ADMIN_PASSWORD = "tt69fu35T";

const categories = [
  "کۆمەڵە خواردن",
  "پیاڵە و پیاڵەخانە",
  "کاسە و جام",
  "کالای ماڵ",
  "کۆمەڵە دیاری",
];

const initialProducts = [
  {
    id: "1",
    name: "کۆمەڵە خواردن 25 پارچە",
    price: 75000,
    category: "کۆمەڵە خواردن",
    image:
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800",
  },
  {
    id: "2",
    name: "سێتی پیاڵە 12 پارچە",
    price: 45000,
    category: "پیاڵە و پیاڵەخانە",
    image:
      "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=800",
  },
  {
    id: "3",
    name: "کاسە سێتە 6 پارچە",
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
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [category, setCategory] = useState("هەموو");
  const [query, setQuery] = useState("");

  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [password, setPassword] = useState("");

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("کالای ماڵ");
  const [newImage, setNewImage] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        (category === "هەموو" || p.category === category) &&
        p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, category, query]);

  const total = cart.reduce((sum, p) => sum + p.price, 0);

  // =========================
  // هەڵبژاردنی وێنە لە گەلەری
  // =========================

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "ڕێگەپێدان",
          "تکایە ڕێگە بدە بە ئەپەکە بۆ دەستگەیشتن بە گەلەری."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setNewImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("هەڵە", "نەتوانرا وێنە هەڵبژێردرێت.");
    }
  };

  // =========================
  // زیادکردنی بەرهەم
  // =========================

  const addProduct = () => {
    if (!admin) {
      Alert.alert("ڕێگەپێنەدراو", "تکایە وەک بەڕێوەبەر بچۆ ژوورەوە.");
      return;
    }

    if (!newName.trim()) {
      Alert.alert("هەڵە", "ناوی بەرهەم بنووسە.");
      return;
    }

    if (!newPrice.trim() || isNaN(Number(newPrice))) {
      Alert.alert("هەڵە", "نرخی بەرهەم بە ژمارە بنووسە.");
      return;
    }

    if (!newImage.trim()) {
      Alert.alert("هەڵە", "تکایە وێنەی بەرهەم هەڵبژێرە.");
      return;
    }

    const product = {
      id: Date.now().toString(),
      name: newName.trim(),
      price: Number(newPrice),
      category: newCategory,
      image: newImage,
    };

    setProducts((old) => [product, ...old]);

    setNewName("");
    setNewPrice("");
    setNewCategory("کالای ماڵ");
    setNewImage("");
    setShowAdd(false);

    Alert.alert("✅ سەرکەوتوو بوو", "بەرهەمەکە زیاد کرا.");
  };

  // =========================
  // سڕینەوەی بەرهەم
  // =========================

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
          onPress: () => {
            setProducts((old) =>
              old.filter((p) => p.id !== product.id)
            );

            setSelected(null);

            setCart((old) =>
              old.filter((p) => p.id !== product.id)
            );
          },
        },
      ]
    );
  };

  // =========================
  // زیادکردن بۆ سەبەت
  // =========================

  const addToCart = (product) => {
    setCart((old) => [...old, product]);

    Alert.alert(
      "✅ زیادکرا",
      `${product.name}\nخرایە ناو سەبەتەکە.`
    );
  };

  // =========================
  // سڕینەوەی دانەیەک لە سەبەت
  // =========================

  const removeFromCart = (index) => {
    setCart((old) => old.filter((_, i) => i !== index));
  };

  // =========================
  // چوونەژوورەوەی بەڕێوەبەر
  // =========================

  const loginAdmin = () => {
    if (password === ADMIN_PASSWORD) {
      setAdmin(true);
      setPassword("");
      Alert.alert("✅ سەرکەوتوو بوو", "بەڕێوەبەر چووە ژوورەوە.");
    } else {
      Alert.alert("❌ هەڵە", "پاسۆردەکە هەڵەیە.");
    }
  };

  // =========================
  // ناردنی داواکاری بۆ WhatsApp
  // =========================

  const sendOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("سەبەت بەتاڵە", "هیچ بەرهەمێکت هەڵنەبژاردووە.");
      return;
    }

    if (!customerName.trim()) {
      Alert.alert("هەڵە", "تکایە ناوت بنووسە.");
      return;
    }

    if (!customerPhone.trim()) {
      Alert.alert("هەڵە", "تکایە ژمارەی مۆبایلت بنووسە.");
      return;
    }

    if (!customerAddress.trim()) {
      Alert.alert("هەڵە", "تکایە ناونیشانی گەیاندن بنووسە.");
      return;
    }

    let message = `🛍️ *داواکاری نوێ - Shwshawaty ASYA*%0A%0A`;

    message += `👤 ناو: ${customerName}%0A`;
    message += `📞 مۆبایل: ${customerPhone}%0A`;
    message += `📍 ناونیشان: ${customerAddress}%0A%0A`;

    message += `🛒 *بەرهەمەکان:*%0A`;

    cart.forEach((p, index) => {
      message += `${index + 1}. ${p.name} - ${p.price.toLocaleString()} IQD%0A`;
    });

    message += `%0A💰 *کۆی گشتی: ${total.toLocaleString()} IQD*`;

    const url = `https://wa.me/${WHATSAPP}?text=${message}`;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "WhatsApp نەدۆزرایەوە",
          "تکایە WhatsApp لەسەر مۆبایلەکەت دابەزێنە."
        );
      }
    } catch (error) {
      Alert.alert("هەڵە", "نەتوانرا WhatsApp بکرێتەوە.");
    }
  };

  // =========================
  // پەڕەی زیادکردنی بەرهەم
  // =========================

  if (showAdd) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView>
          <TouchableOpacity onPress={() => setShowAdd(false)}>
            <Text style={s.back}>‹ گەڕانەوە</Text>
          </TouchableOpacity>

          <View style={s.pad}>
            <Text style={s.pageTitle}>
              ➕ زیادکردنی بەرهەم
            </Text>

            <Text style={s.label}>✏️ ناوی بەرهەم</Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="بۆ نموونە: سێتی چای 18 پارچە"
              placeholderTextColor="#888"
              style={s.input}
            />

            <Text style={s.label}>💰 نرخ بە دینار</Text>

            <TextInput
              value={newPrice}
              onChangeText={setNewPrice}
              placeholder="65000"
              placeholderTextColor="#888"
              keyboardType="numeric"
              style={s.input}
            />

            <Text style={s.label}>📂 جۆری بەرهەم</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.cats}
            >
              {categories.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setNewCategory(c)}
                  style={[
                    s.cat,
                    newCategory === c && s.catActive,
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

            <Text style={s.label}>📷 وێنەی بەرهەم</Text>

            <TouchableOpacity
              style={s.galleryBtn}
              onPress={pickImage}
            >
              <Text style={s.galleryText}>
                📷 هەڵبژاردنی وێنە لە گەلەری
              </Text>
            </TouchableOpacity>

            {newImage ? (
              <Image
                source={{ uri: newImage }}
                style={s.preview}
              />
            ) : null}

            <TouchableOpacity
              style={s.goldBtn}
              onPress={addProduct}
            >
              <Text style={s.goldText}>
                ➕ زیادکردنی بەرهەم
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =========================
  // پەڕەی بەرهەم
  // =========================

  if (selected) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView>
          <TouchableOpacity onPress={() => setSelected(null)}>
            <Text style={s.back}>‹ گەڕانەوە</Text>
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
              {selected.price.toLocaleString()} IQD
            </Text>

            <Text style={s.categoryText}>
              📂 {selected.category}
            </Text>

            <Text style={s.desc}>
              بەرهەمێکی جوان و کوالێتی بۆ ماڵەکەت.
              بۆ زانیاری زیاتر پەیوەندیمان پێوە بکە.
            </Text>

            <TouchableOpacity
              style={s.goldBtn}
              onPress={() => addToCart(selected)}
            >
              <Text style={s.goldText}>
                🛒 زیادکردن بۆ سەبەت
              </Text>
            </TouchableOpacity>

            {admin && (
              <TouchableOpacity
                style={s.deleteBtn}
                onPress={() => deleteProduct(selected)}
              >
                <Text style={s.deleteText}>
                  🗑️ سڕینەوەی بەرهەم
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =========================
  // ئەپی سەرەکی
  // =========================

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.brand}>ASYA</Text>
        <Text style={s.sub}>Shwshawaty ASYA</Text>
      </View>

      {tab === "home" && (
        <ScrollView>
          <View style={s.banner}>
            <Text style={s.bannerTitle}>
              Shwshawaty ASYA
            </Text>

            <Text style={s.bannerSub}>
              جوانترین کاڵاکان بۆ ماڵەکەت
            </Text>
          </View>

          {admin && (
            <TouchableOpacity
              style={s.addProductBtn}
              onPress={() => setShowAdd(true)}
            >
              <Text style={s.addProductText}>
                ➕ زیادکردنی بەرهەم
              </Text>
            </TouchableOpacity>
          )}

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="🔎 بگەڕێ بۆ بەرهەم..."
            placeholderTextColor="#777"
            style={s.search}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.cats}
          >
            {["هەموو", ...categories].map((c) => (
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

          <Text style={s.section}>
            بەرهەمەکان
          </Text>

          <FlatList
            data={filtered}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(x) => x.id}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={s.grid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.card}
                onPress={() => setSelected(item)}
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
                  {item.price.toLocaleString()} IQD
                </Text>

                <TouchableOpacity
                  style={s.smallBtn}
                  onPress={() => addToCart(item)}
                >
                  <Text style={s.smallBtnText}>
                    + سەبەت
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      )}

      {tab === "cart" && (
        <ScrollView>
          <View style={s.pad}>
            <Text style={s.pageTitle}>
              🛒 سەبەت
            </Text>

            {cart.length === 0 ? (
              <Text style={s.empty}>
                سەبەتەکەت بەتاڵە.
              </Text>
            ) : (
              <>
                {cart.map((p, i) => (
                  <View style={s.row} key={`${p.id}-${i}`}>
                    <Image
                      source={{ uri: p.image }}
                      style={s.cartImg}
                    />

                    <View style={s.cartInfo}>
                      <Text style={s.rowName}>
                        {p.name}
                      </Text>

                      <Text style={s.rowPrice}>
                        {p.price.toLocaleString()} IQD
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeFromCart(i)}
                    >
                      <Text style={s.removeText}>
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

                <Text style={s.formTitle}>
                  📝 زانیاری داواکاری
                </Text>

                <TextInput
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="👤 ناوی تەواو"
                  placeholderTextColor="#777"
                  style={s.input}
                />

                <TextInput
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="📞 ژمارەی مۆبایل"
                  placeholderTextColor="#777"
                  keyboardType="phone-pad"
                  style={s.input}
                />

                <TextInput
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                  placeholder="📍 ناونیشانی گەیاندن"
                  placeholderTextColor="#777"
                  multiline
                  style={[s.input, s.addressInput]}
                />

                <TouchableOpacity
                  style={s.whatsappBtn}
                  onPress={sendOrder}
                >
                  <Text style={s.whatsappText}>
                    📱 ناردنی داواکاری بۆ WhatsApp
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      )}

      {tab === "profile" && (
        <ScrollView>
          <View style={s.pad}>
            <Text style={s.pageTitle}>
              👤 پڕۆفایل
            </Text>

            {!admin ? (
              <>
                <Text style={s.desc}>
                  🔐 بەشی بەڕێوەبەر
                </Text>

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="پاسۆرد"
                  placeholderTextColor="#777"
                  secureTextEntry
                  style={s.input}
                />

                <TouchableOpacity
                  style={s.goldBtn}
                  onPress={loginAdmin}
                >
                  <Text style={s.goldText}>
                    🔐 چوونەژوورەوە
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={s.adminBox}>
                  <Text style={s.adminTitle}>
                    👑 بەڕێوەبەر
                  </Text>

                  <Text style={s.adminText}>
                    ئێستا وەک بەڕێوەبەر چوویتە ژوورەوە.
                  </Text>
                </View>

                <TouchableOpacity
                  style={s.addProductBtn}
                  onPress={() => setShowAdd(true)}
                >
                  <Text style={s.addProductText}>
                    ➕ زیادکردنی بەرهەم
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.logoutBtn}
                  onPress={() => setAdmin(false)}
                >
                  <Text style={s.logoutText}>
                    🚪 دەرچوون لە بەڕێوەبەر
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
    fontSize: 27,
    fontWeight: "800",
    color: "#e1b63e",
  },

  bannerSub: {
    color: "#fff",
    marginTop: 6,
    fontSize: 16,
  },

  addProductBtn: {
    marginHorizontal: 16,
    marginBottom: 10,
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
    gap: 12,
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
  },

  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    flexDirection: "row",
    alignItems: "center",
  },

  cartImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },

  cartInfo: {
    flex: 1,
    marginLeft: 12,
  },

  rowName: {
    color: "#fff",
    fontWeight: "700",
  },

  rowPrice: {
    color: "#d7a52b",
    fontWeight: "700",
    marginTop: 5,
  },

  removeText: {
    color: "#ff6666",
    fontSize: 22,
    padding: 8,
  },

  totalBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#1c1c1c",
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
    fontWeight: "900",
  },

  formTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 25,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#fff",
    color: "#111",
    borderRadius: 12,
    padding: 13,
    fontSize: 15,
    marginTop: 10,
  },

  addressInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  whatsappBtn: {
    backgroundColor: "#25D366",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },

  whatsappText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
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

  categoryText: {
    color: "#aaa",
    marginTop: 10,
    fontSize: 15,
  },

  desc: {
    color: "#ccc",
    fontSize: 16,
    lineHeight: 26,
    marginTop: 15,
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

  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 7,
  },

  galleryBtn: {
    borderWidth: 1,
    borderColor: "#d7a52b",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },

  galleryText: {
    color: "#d7a52b",
    fontWeight: "800",
    fontSize: 16,
  },

  preview: {
    width: "100%",
    height: 240,
    borderRadius: 12,
    marginTop: 15,
  },

  adminBox: {
    backgroundColor: "#1c1c1c",
    borderRadius: 14,
    padding: 18,
    marginBottom: 15,
  },

  adminTitle: {
    color: "#d7a52b",
    fontSize: 22,
    fontWeight: "900",
  },

  adminText: {
    color: "#ccc",
    marginTop: 8,
  },

  logoutBtn: {
    borderWidth: 1,
    borderColor: "#8b3333",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },

  logoutText: {
    color: "#ff7777",
    fontWeight: "800",
  },
});
