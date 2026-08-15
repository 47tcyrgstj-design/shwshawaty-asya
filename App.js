
import React, {useMemo, useState} from "react";
import {
  SafeAreaView, View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, TextInput, ScrollView, Alert
} from "react-native";

const products = [
  {id:"1", name:"کۆمەڵە خواردن 25 پارچە", price:75000, category:"کۆمەڵە خواردن", image:"https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800"},
  {id:"2", name:"سێتی پیاڵە 12 پارچە", price:45000, category:"پیاڵە و پیاڵەخانە", image:"https://images.unsplash.com/photo-1572119865084-43c285814d63?w=800"},
  {id:"3", name:"کاسە سێتە 6 پارچە", price:30000, category:"کاسە و جام", image:"https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800"},
  {id:"4", name:"کۆمەڵە دیاری", price:90000, category:"کۆمەڵە دیاری", image:"https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=800"},
];

const cats = ["هەموو","کۆمەڵە خواردن","پیاڵە و پیاڵەخانە","کاسە و جام","کالای ماڵ","کۆمەڵە دیاری"];

export default function App(){
  const [tab,setTab]=useState("home");
  const [category,setCategory]=useState("هەموو");
  const [query,setQuery]=useState("");
  const [cart,setCart]=useState([]);
  const [selected,setSelected]=useState(null);

  const filtered = useMemo(()=>products.filter(p =>
    (category==="هەموو" || p.category===category) &&
    p.name.toLowerCase().includes(query.toLowerCase())
  ),[category,query]);

  const addToCart = (p)=>{
    setCart(c=>[...c,p]);
    Alert.alert("زیادکرا", `${p.name} خرایە ناو سەبەتەکە.`);
  };

  if(selected){
    return <SafeAreaView style={s.safe}>
      <ScrollView>
        <TouchableOpacity onPress={()=>setSelected(null)}><Text style={s.back}>‹ گەڕانەوە</Text></TouchableOpacity>
        <Image source={{uri:selected.image}} style={s.hero}/>
        <View style={s.pad}>
          <Text style={s.title}>{selected.name}</Text>
          <Text style={s.price}>{selected.price.toLocaleString()} IQD</Text>
          <Text style={s.desc}>بەرهەمێکی جوان و کوالێتی بۆ ماڵەکەت. بۆ زانیاری زیاتر پەیوەندیمان پێوە بکە.</Text>
          <TouchableOpacity style={s.goldBtn} onPress={()=>addToCart(selected)}>
            <Text style={s.goldText}>🛒 زیادکردن بۆ سەبەت</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  }

  return <SafeAreaView style={s.safe}>
    <View style={s.header}>
      <Text style={s.brand}>ASYA</Text>
      <Text style={s.sub}>Shwshawaty ASYA</Text>
    </View>

    {tab==="home" && <ScrollView>
      <View style={s.banner}>
        <Text style={s.bannerTitle}>کۆمەڵە خواردن</Text>
        <Text style={s.bannerSub}>نوێ و تایبەت بۆ تۆ</Text>
      </View>
      <TextInput value={query} onChangeText={setQuery} placeholder="بگەڕێ بۆ بەرهەم..." style={s.search}/>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cats}>
        {cats.map(c=><TouchableOpacity key={c} onPress={()=>setCategory(c)} style={[s.cat,category===c&&s.catActive]}>
          <Text style={category===c?s.catTextActive:s.catText}>{c}</Text>
        </TouchableOpacity>)}
      </ScrollView>
      <Text style={s.section}>بەرهەمە نوێکان</Text>
      <FlatList data={filtered} numColumns={2} scrollEnabled={false}
        keyExtractor={x=>x.id} columnWrapperStyle={{gap:12}} contentContainerStyle={s.grid}
        renderItem={({item})=><TouchableOpacity style={s.card} onPress={()=>setSelected(item)}>
          <Image source={{uri:item.image}} style={s.cardImg}/>
          <Text style={s.cardName} numberOfLines={2}>{item.name}</Text>
          <Text style={s.cardPrice}>{item.price.toLocaleString()} IQD</Text>
          <TouchableOpacity style={s.smallBtn} onPress={()=>addToCart(item)}>
            <Text style={s.smallBtnText}>+ سەبەت</Text>
          </TouchableOpacity>
        </TouchableOpacity>}
      />
    </ScrollView>}

    {tab==="cart" && <View style={s.pad}>
      <Text style={s.pageTitle}>سەبەت 🛒</Text>
      {cart.length===0 ? <Text style={s.empty}>سەبەتەکەت بەتاڵە.</Text> :
      <>
        {cart.map((p,i)=><View style={s.row} key={i}><Text style={s.rowName}>{p.name}</Text><Text>{p.price.toLocaleString()} IQD</Text></View>)}
        <TouchableOpacity style={s.goldBtn} onPress={()=>Alert.alert("داواکاری","لە وەشانی داهاتوودا داواکارییەکە بە سیستەمی فرۆشتن نێردراوە.")}>
          <Text style={s.goldText}>تەواوکردنی داواکاری</Text>
        </TouchableOpacity>
      </>}
    </View>}

    {tab==="profile" && <View style={s.pad}>
      <Text style={s.pageTitle}>پڕۆفایل 👤</Text>
      <Text style={s.desc}>بەشی پڕۆفایل و مێژووی داواکارییەکان لە قۆناغی داهاتوودا زیاد دەکرێت.</Text>
    </View>}

    <View style={s.nav}>
      <TouchableOpacity onPress={()=>setTab("home")}><Text style={tab==="home"?s.navOn:s.navOff}>⌂{"\n"}سەرەکی</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>setTab("cart")}><Text style={tab==="cart"?s.navOn:s.navOff}>🛒{"\n"}سەبەت ({cart.length})</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>setTab("profile")}><Text style={tab==="profile"?s.navOn:s.navOff}>👤{"\n"}پڕۆفایل</Text></TouchableOpacity>
    </View>
  </SafeAreaView>
}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:"#0f0f0f"}, header:{padding:18,alignItems:"center",borderBottomWidth:1,borderBottomColor:"#292929"},
 brand:{fontSize:30,fontWeight:"800",color:"#d7a52b"},sub:{color:"#fff",fontSize:12},
 banner:{margin:16,padding:22,borderRadius:18,backgroundColor:"#1d1d1d"},bannerTitle:{fontSize:28,fontWeight:"800",color:"#e1b63e"},bannerSub:{color:"#fff",marginTop:6,fontSize:16},
 search:{marginHorizontal:16,backgroundColor:"#fff",borderRadius:12,padding:12,fontSize:15},
 cats:{paddingHorizontal:16,marginVertical:12},cat:{paddingHorizontal:13,paddingVertical:9,borderRadius:20,borderWidth:1,borderColor:"#555",marginRight:8},catActive:{backgroundColor:"#d7a52b",borderColor:"#d7a52b"},catText:{color:"#ddd"},catTextActive:{color:"#111",fontWeight:"700"},
 section:{color:"#fff",fontSize:20,fontWeight:"700",paddingHorizontal:16,paddingVertical:8},grid:{padding:16,gap:12},
 card:{backgroundColor:"#1c1c1c",borderRadius:14,padding:9,flex:1},cardImg:{width:"100%",height:145,borderRadius:10},cardName:{color:"#fff",fontSize:14,fontWeight:"700",marginTop:8},cardPrice:{color:"#d7a52b",fontWeight:"800",marginTop:5},smallBtn:{backgroundColor:"#d7a52b",borderRadius:9,padding:8,marginTop:8,alignItems:"center"},smallBtnText:{color:"#111",fontWeight:"800"},
 nav:{height:68,borderTopWidth:1,borderTopColor:"#333",flexDirection:"row",justifyContent:"space-around",alignItems:"center",backgroundColor:"#101010"},navOn:{color:"#d7a52b",textAlign:"center",fontWeight:"800"},navOff:{color:"#aaa",textAlign:"center"},
 pad:{padding:18},pageTitle:{fontSize:26,fontWeight:"800",color:"#fff",marginBottom:20},empty:{color:"#aaa",fontSize:17},row:{padding:14,borderBottomWidth:1,borderBottomColor:"#333",flexDirection:"row",justifyContent:"space-between"},rowName:{color:"#fff",flex:1,marginRight:10},goldBtn:{backgroundColor:"#d7a52b",padding:15,borderRadius:12,alignItems:"center",marginTop:20},goldText:{color:"#111",fontWeight:"800",fontSize:16},
 back:{color:"#d7a52b",fontSize:18,padding:16},hero:{width:"100%",height:330},title:{fontSize:25,fontWeight:"800",color:"#fff"},price:{fontSize:22,color:"#d7a52b",fontWeight:"800",marginTop:10},desc:{color:"#ccc",fontSize:16,lineHeight:26,marginTop:15}
});
