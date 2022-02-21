import React from "react";
import { View, Text } from "react-native";
import { setTestProps } from "../utils/PropHelper";

export default function Details() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text {...setTestProps()({ name: "details" })}>
        This is Details Screen
      </Text>
    </View>
  );
}
