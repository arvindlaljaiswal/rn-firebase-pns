import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, Platform, StyleSheet, Text, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { setTestProps } from "../utils/PropHelper";
import * as Notifications from "expo-notifications";
import { isDevice } from "expo-device";
import { RootStackParamList } from "../../App";

async function requestPermissionsAsync() {
  return await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
      allowAnnouncements: true,
    },
  });
}

// Show notifications when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
  handleSuccess: async (nid) => {
    console.log("nid", nid);
  },
  handleError: (nid, error) => {
    console.log("nid", nid);
    console.log("error", error.message);
  },
});
const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    borderBottomWidth: 1,
    padding: 5,
    margin: 15,
    width: "80%",
  },
  token: {
    paddingBottom: 20,
  },
});

export default function Home({}) {
  const [token, setToken] = useState<string>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "Details">>();

  const registerForPushNotificationsAsync = async () => {
    if (isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync({});
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      const token = (await Notifications.getDevicePushTokenAsync()).data;
      console.log("token", token);
      setToken(token);
      return token;
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  };

  // Getting the push token
  useEffect(() => {
    requestPermissionsAsync();
    registerForPushNotificationsAsync().then((token) => {
      console.log("token=====>>>>", token);
      setToken(token);
    });
  }, []);

  useEffect(() => {
    //When app is closed
    const backgroundSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });
    //When the app is open
    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(notification);
      });

    return () => {
      backgroundSubscription.remove();
      foregroundSubscription.remove();
    };
  }, []);

  // Add and remove listeners
  useEffect(() => {
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("--> Notification Received!");
        console.log("------>", JSON.stringify(notification.request.content));
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification Clicked!");
        console.log(response);
      });
    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // Local Notifications
  const triggerLocalNotificationHandler = () => {
    console.log("triggerLocalNotificationHandler");
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Local Notification",
        body: "Hello this is a local notification!!!",
      },

      trigger: null,
    });
  };

  const triggerFirebaseNotificationHandler = () => {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        host: "exp.host",
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        title: "Firebase Push Notification",
        body: "From EXPO",
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("response object:", responseJson);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const triggerFbNotificationHandler = () => {
    fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        Authorization:
          "key=AAAAJLdx99M:APA91bFOt5yuE84c4mh_pz3gSQdH3BoqS6f-78lSgH4Ge32neB6Ynn4QjzegRtICyE60IOKKDg9nQQZqJF7UH5SD8u26urwnzvb5lmR6JyEQOU3MyiP6VnjSvvJwGL4SKK5rBBDKzF8P",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        priority: "normal",
        data: {
          experienceId: "@arvindlal/sampleapp",
          scopeKey: "@arvindlal/sampleapp",
          title: "Title of the Notification",
          message: "Body of the Notification",
        },
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("response object:", responseJson);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  return (
    <View style={styles.container}>
      <Text {...setTestProps()({ name: "greeting" })}>Welcome!</Text>
      <Text {...setTestProps()({ name: "welcome" })}>
        Push Notification Demo using Firebase
      </Text>

      <View style={styles.button}>
        <Button
          {...setTestProps()({ name: "localNotification" })}
          title="Click me!! to trigger Firebase Notification"
          onPress={triggerFbNotificationHandler}
        />
      </View>
      {/* <View style={styles.button}>
        <Button
          {...setTestProps()({ name: "localNotification" })}
          title="Trigger Local Notification"
          onPress={triggerLocalNotificationHandler}
        />
      </View> */}
      <View style={styles.button}>
        <Button
          {...setTestProps()({ name: "nextScreen" })}
          title="Go to Details screen"
          onPress={() => navigation.navigate("Details")}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
