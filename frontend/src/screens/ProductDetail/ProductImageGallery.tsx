import { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Modal,
  PanResponder,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import { resolveAssetUrl } from "@/services/api/client";
import type { ProductImage } from "@/services/api/types";

type Props = {
  images: ProductImage[];
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function ProductImageGallery({ images }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const active = images[selectedIndex] ?? images[0];
  const activeUrl = resolveAssetUrl(active?.url);

  // Filter and sort images that can be used for rotation
  // If there are multiple images, sort by angle ascending
  const rotationImages = [...images].sort((a, b) => (a.angle ?? 0) - (b.angle ?? 0));
  const startIdxRef = useRef(0);
  const playIntervalRef = useRef<any>(null);

  // Setup PanResponder for swipe-to-rotate in Modal
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Pause auto-rotation when user starts dragging
        setIsPlaying(false);
        startIdxRef.current = viewerIndex;
      },
      onPanResponderMove: (evt, gestureState) => {
        const dragThreshold = 15; // sensitivity
        const deltaFrames = Math.round(gestureState.dx / dragThreshold);
        const totalFrames = rotationImages.length;
        if (totalFrames > 1) {
          let newIdx = (startIdxRef.current - deltaFrames) % totalFrames;
          if (newIdx < 0) {
            newIdx += totalFrames;
          }
          setViewerIndex(newIdx);
        }
      },
    })
  ).current;

  // Auto-play rotation effect
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setViewerIndex((prev) => (prev + 1) % rotationImages.length);
      }, 250);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }
    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, rotationImages.length]);

  const handleOpen360 = () => {
    // Start at current selected index in the main gallery if possible
    const currentAngle = active?.angle ?? 0;
    const matchIdx = rotationImages.findIndex((img) => img.angle === currentAngle);
    setViewerIndex(matchIdx >= 0 ? matchIdx : 0);
    setIsPlaying(false);
    setModalVisible(true);
  };

  const handleRotateLeft = () => {
    setIsPlaying(false);
    setViewerIndex((prev) => (prev - 1 + rotationImages.length) % rotationImages.length);
  };

  const handleRotateRight = () => {
    setIsPlaying(false);
    setViewerIndex((prev) => (prev + 1) % rotationImages.length);
  };

  // Get current active angle display label
  const currentRotationImg = rotationImages[viewerIndex];
  const displayAngle = currentRotationImg?.angle !== undefined 
    ? `${currentRotationImg.angle}°` 
    : `${Math.round((360 / rotationImages.length) * viewerIndex)}°`;

  return (
    <View>
      <Pressable onPress={handleOpen360} style={styles.mainImageContainer}>
        {activeUrl ? (
          <Image source={{ uri: activeUrl }} resizeMode="cover" style={styles.mainImage} />
        ) : (
          <View style={[styles.mainImage, styles.placeholder]} />
        )}
        
        {rotationImages.length > 1 && (
          <View style={styles.badge360}>
            <Ionicons name="refresh-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.badge360Text}>360° View</Text>
          </View>
        )}
      </Pressable>

      {images.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
        >
          {images.map((image, index) => {
            const thumbUrl = resolveAssetUrl(image.url);
            const isSelected = index === selectedIndex;

            return (
              <Pressable
                key={image.id}
                onPress={() => setSelectedIndex(index)}
                style={[styles.thumb, isSelected && styles.thumbSelected]}
              >
                {thumbUrl ? (
                  <Image source={{ uri: thumbUrl }} resizeMode="cover" style={styles.thumbImage} />
                ) : (
                  <View style={[styles.thumbImage, styles.placeholder]} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {/* 360° Interactive Rotation Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>360° Interactive View</Text>
                <Text style={styles.modalSubtitle}>Drag image to rotate</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Main Interactive Rotation Area */}
            <View {...panResponder.panHandlers} style={styles.interactiveArea}>
              {currentRotationImg?.url ? (
                <Image
                  source={{ uri: resolveAssetUrl(currentRotationImg.url) }}
                  resizeMode="contain"
                  style={styles.rotationImage}
                />
              ) : (
                <View style={[styles.rotationImage, styles.placeholder]} />
              )}

              {/* Angle HUD Badge */}
              <View style={styles.angleHud}>
                <Text style={styles.angleHudText}>{displayAngle}</Text>
              </View>
            </View>

            {/* Instruction Banner */}
            <View style={styles.instructionBanner}>
              <Ionicons name="swap-horizontal" size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.instructionText}>Swipe left or right to spin</Text>
            </View>

            {/* Bottom Controls Panel */}
            <View style={styles.controlsPanel}>
              {/* Manual Left Button */}
              <TouchableOpacity
                onPress={handleRotateLeft}
                style={styles.controlBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Play/Pause Auto-Rotate Button */}
              <TouchableOpacity
                onPress={() => setIsPlaying(!isPlaying)}
                style={[styles.controlBtn, styles.playPauseBtn, isPlaying && styles.playingBtn]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={24}
                  color={isPlaying ? colors.purple.DEFAULT : "#FFFFFF"}
                />
                <Text style={[styles.playPauseText, isPlaying && styles.playingText]}>
                  {isPlaying ? "PAUSE" : "AUTO-SPIN"}
                </Text>
              </TouchableOpacity>

              {/* Manual Right Button */}
              <TouchableOpacity
                onPress={handleRotateRight}
                style={styles.controlBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainImageContainer: {
    position: "relative",
    width: "100%",
    height: 380,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: "#F1E6FB",
  },
  badge360: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 18, 51, 0.75)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  badge360Text: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  thumbRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbSelected: {
    borderColor: colors.purple.DEFAULT,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 5, 20, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  modalSubtitle: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  interactiveArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100%",
  },
  rotationImage: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
  },
  angleHud: {
    position: "absolute",
    bottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  angleHudText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  instructionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  instructionText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
  },
  controlsPanel: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 24,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseBtn: {
    flexDirection: "row",
    width: 140,
    gap: 8,
    borderRadius: 25,
  },
  playingBtn: {
    backgroundColor: "#FFFFFF",
  },
  playPauseText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  playingText: {
    color: colors.purple.DEFAULT,
  },
});
