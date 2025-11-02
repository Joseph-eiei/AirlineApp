import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function AccountScreen({ navigation, route }) {
  const [user, setUser] = useState(null);

  // สมมติหน้า Login ส่ง email ของผู้ใช้
  const email = route?.params?.email;

  useEffect(() => {
    if (!email) {
      Alert.alert("Error", "No email provided. Please login again.");
      navigation.replace("Login");
      return;
    }

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("username, email")
          .eq("email", email)
          .single();

        if (error || !data) {
          Alert.alert("Error", "User not found");
          navigation.replace("Login");
          return;
        }

        setUser(data);
      } catch (err) {
        Alert.alert("Error", err.message);
      }
    };

    fetchUser();
  }, [email]);

  if (!user) return null; // loading หรือ waiting for fetch

  const handleLogout = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account 👤</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user.username}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const PRIMARY = "#B2FBA5";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFF7",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2C4A34",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2F7DB",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: "#6B8766",
  },
  value: {
    fontSize: 17,
    color: "#2C4A34",
    fontWeight: "600",
    marginBottom: 14,
  },
  button: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F3D23",
  },
});
