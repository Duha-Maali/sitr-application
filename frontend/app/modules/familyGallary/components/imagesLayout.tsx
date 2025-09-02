import React, { ReactNode, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const ImagesLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  return (
    <View style={styles.container}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.props.source?.require) {
          const { require } = child.props.source;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPressIn={() => setActiveIndex(index)}
              onPressOut={() => setActiveIndex(null)}
              style={[
                styles.imageContainer,
                activeIndex === index && styles.activeContainer,
              ]}
            >
              <Image source={require} style={styles.image} />
            </TouchableOpacity>
          );
        }
        return null;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  imageContainer: {
    width: Dimensions.get("window").width / 4 - 15,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  activeContainer: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default ImagesLayout;
