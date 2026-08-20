import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

export default function ProductManager({ onBack }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const saveProduct = () => {
    if (!name.trim()) {
      Alert.alert("هەڵە", "تکایە ناوی بەرهەم بنووسە.");
      return;
    }

    if (!price.trim()) {
      Alert.alert("هەڵە", "تکایە نرخ بنووسە.");
      return;
    }

    if (!category.trim()) {
      Alert.alert("هەڵە", "تکایە جۆری بەرهەم بنووسە.");
      return;
    }

    Alert.alert(
      "بەرهەم ئامادەیە ✅",
      `ناو: ${name}\nنرخ: ${price} د.ع\nکۆگا: ${stock || 0}`
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.back}>‹ گەڕانەوە</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          ➕ زیادکردنی بەرهەم
        </Text>

        <Text style={styles.subtitle}>
          زانیارییەکانی بەرهەم پڕ بکەرەوە
        </Text>

        <View style={styles.card}>

          <Text style={styles.label}>
            ناوی بەرهەم
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="ناوی بەرهەم"
            placeholderTextColor="#777"
            style={styles.input}
            textAlign="right"
          />

          <Text style={styles.label}>
            نرخ
          </Text>

          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="مثلاً 75000"
            placeholderTextColor="#777"
            keyboardType="numeric"
            style={styles.input}
            textAlign="right"
          />

          <Text style={styles.label}>
            جۆری بەرهەم
          </Text>

          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="مثلاً کالای ماڵ"
            placeholderTextColor="#777"
            style={styles.input}
            textAlign="right"
          />

          <Text style={styles.label}>
            ژمارەی کۆگا
          </Text>

          <TextInput
            value={stock}
            onChangeText={setStock}
            placeholder="مثلاً 20"
            placeholderTextColor="#777"
            keyboardType="numeric"
            style={styles.input}
            textAlign="right"
          />

          <Text style={styles.imageTitle}>
            🖼️ وێنەی بەرهەم
          </Text>

          <TextInput
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="🔗 لینکی وێنە دابنێ"
            placeholderTextColor="#777"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.preview}
              resizeMode="cover"
            />
          ) : null}

          <TouchableOpacity
            style={styles.galleryButton}
            onPress={() =>
              Alert.alert(
                "گەلەری",
                "لە هەنگاوی دواتر گەلەریی مۆبایل بە Firebase Storage پەیوەست دەکەین."
              )
            }
          >
            <Text style={styles.galleryText}>
              📷 هەڵبژاردن لە گەلەری
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveProduct}
          >
            <Text style={styles.saveText}>
              ➕ زیادکردنی بەرهەم
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  safe: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },

  container: {
    padding: 18,
    paddingBottom: 50,
  },

  back: {
    color: "#d7a52b",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 20,
  },

  title: {
    color: "#d7a52b",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#1b1b1b",
    borderRadius: 18,
    padding: 16,
  },

  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#fff",
    color: "#111",
    borderRadius: 11,
    padding: 13,
    fontSize: 15,
    marginBottom: 8,
  },

  imageTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 15,
    marginBottom: 10,
  },

  preview: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 12,
  },

  galleryButton: {
    borderWidth: 1,
    borderColor: "#d7a52b",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 5,
  },

  galleryText: {
    color: "#d7a52b",
    fontSize: 16,
    fontWeight: "800",
  },

  saveButton: {
    backgroundColor: "#d7a52b",
    borderRadius: 13,
    padding: 15,
    alignItems: "center",
    marginTop: 18,
  },

  saveText: {
    color: "#111",
    fontSize: 17,
    fontWeight: "900",
  },
};