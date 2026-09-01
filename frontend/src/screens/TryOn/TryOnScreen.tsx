import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  PanResponder,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRoute, useNavigation } from "@react-navigation/native";

let Camera: any;
let CameraView: any;
if (Platform.OS !== "web") {
  try {
    const expoCamera = require("expo-camera");
    Camera = expoCamera.Camera;
    CameraView = expoCamera.CameraView;
  } catch (error) {
    console.warn("Could not require expo-camera:", error);
  }
}

import { colors } from "@/theme/colors";
import { useProducts, useProduct, useAddToCart } from "@/features/products/hooks";
import { resolveAssetUrl } from "@/services/api/client";
import { useAuth } from "@/features/auth/hooks";
import type { FeaturedProduct, ProductDetail } from "@/services/api/types";

// Advanced Try-On Imports (Dynamically required on Web only to prevent React Native bundling crashes)
let getFaceLandmarker: any;
let getImageFaceLandmarker: any;
let drawWigPose: any;
let LandmarkSmoother: any;
let HeadPoseEstimator: any;
let getWigConfig: any;

if (Platform.OS === "web") {
  try {
    const faceMesh = require("@/lib/faceMesh");
    getFaceLandmarker = faceMesh.getFaceFaceLandmarker || faceMesh.getFaceLandmarker;
    getImageFaceLandmarker = faceMesh.getImageFaceLandmarker;

    const wigRenderer = require("@/lib/wigRenderer");
    drawWigPose = wigRenderer.drawWigPose;

    const landmarkSmoothing = require("@/lib/landmarkSmoothing");
    LandmarkSmoother = landmarkSmoothing.LandmarkSmoother;

    const headPose = require("@/lib/headPose");
    HeadPoseEstimator = headPose.HeadPoseEstimator;

    const wigConfig = require("@/lib/wigConfig");
    getWigConfig = wigConfig.getWigConfig;
  } catch (error) {
    console.error("Failed to dynamically load web-only try-on libraries:", error);
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const tabs = [
  { key: "camera", label: "Live Camera" },
  { key: "upload", label: "Upload Photo" },
];

const features = [
  { icon: "sparkles", label: "Multiple styles" },
  { icon: "shield-checkmark", label: "100% free" },
];

const steps = [
  { label: "Enable Camera", description: "Allow camera access for real-time try-on or upload a selfie." },
  { label: "Pick a Style", description: "Browse wig styles and colours on the screen." },
  { label: "See It Instantly", description: "Watch the selected wig overlay your face in real time." },
  { label: "Capture & Share", description: "Download or add your look directly to cart." },
];

export function TryOnScreen() {
  const [activeTab, setActiveTab] = useState("camera");
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const cameraRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uploadCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [webStream, setWebStream] = useState<any>(null);
  const animFrameRef = useRef<number>(0);

  // Advanced tracking refs and states (lazily initialized on Web mount)
  const landmarkSmootherRef = useRef<any>(null);
  const headPoseEstimatorRef = useRef<any>(null);
  const wigImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const faceDetectedRef = useRef(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [tune, setTune] = useState({
    scale: 1.50,
    offsetX: 0,
    offsetY: -0.48,
    rotationOffset: 0,
    fringeDrop: 0.03,
    foreheadOffset: -0.50,
  });
  const tuneRef = useRef(tune);

  useEffect(() => {
    tuneRef.current = tune;
  }, [tune]);

  useEffect(() => {
    if (Platform.OS === "web") {
      if (LandmarkSmoother && !landmarkSmootherRef.current) {
        landmarkSmootherRef.current = new LandmarkSmoother();
      }
      if (HeadPoseEstimator && !headPoseEstimatorRef.current) {
        headPoseEstimatorRef.current = new HeadPoseEstimator();
      }
    }
  }, []);

  // Web camera streaming lifecycle
  useEffect(() => {
    if (Platform.OS === "web" && isLiveActive) {
      if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const isPortrait = window.innerWidth < window.innerHeight;
        navigator.mediaDevices
          .getUserMedia({
            video: {
              width: { ideal: isPortrait ? 720 : 1280 },
              height: { ideal: isPortrait ? 1280 : 720 },
              facingMode: "user"
            },
            audio: false
          })
          .then((stream) => {
            setWebStream(stream);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().then(() => {
                startRendering();
              });
            }
          })
          .catch((err) => {
            console.error("Web camera access error:", err);
            Alert.alert("Camera Error", "Could not access web camera.");
          });
      } else {
        Alert.alert("Camera Error", "Web camera access is not supported by your browser or environment.");
      }
    } else {
      if (webStream) {
        webStream.getTracks().forEach((track: any) => track.stop());
        setWebStream(null);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      faceDetectedRef.current = false;
      setFaceDetected(false);
      landmarkSmootherRef.current?.reset();
    }
    return () => {
      if (webStream) {
        webStream.getTracks().forEach((track: any) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isLiveActive]);

  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const routeProductId = route?.params?.productId;

  // Pre-selection modal state
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"camera" | "upload" | null>(null);

  // Interactive wig adjustments
  const [selectedProductId, setSelectedProductId] = useState<string | null>(routeProductId ?? null);

  useEffect(() => {
    if (routeProductId) {
      setSelectedProductId(routeProductId);
    }
  }, [routeProductId]);

  const [wigPosition, setWigPosition] = useState({ x: (SCREEN_WIDTH - 355) / 2, y: SCREEN_WIDTH * 0.25 });
  const [wigWidth, setWigWidth] = useState(355);
  const [wigHeight, setWigHeight] = useState(355);
  const [wigRotation, setWigRotation] = useState(0);

  // Screen Toast popup notifications
  const [showCartToast, setShowCartToast] = useState(false);
  const [addedProductName, setAddedProductName] = useState("");
  const toastTimeoutId = useRef<any>(null);

  const startPanRef = useRef({ x: 0, y: 0 });
  const addToCart = useAddToCart();
  const { isAuthenticated } = useAuth();

  // Fetch wig products list for selection
  const { data: productsData, isPending } = useProducts({ limit: 50 });
  const products = productsData?.products ?? [];
  const wigProducts = products.filter((p: FeaturedProduct) => p.images && p.images.length > 0);

  // Fetch full details (specifically images with angles) for the active selected product
  const { data: selectedProductDetail } = useProduct(selectedProductId || "");
  const selectedProduct = selectedProductDetail || products.find((p: FeaturedProduct) => p.id === selectedProductId);

  // Default fit overrides based on config
  const activeSlug = selectedProduct?.slug || selectedProduct?.id;
  useEffect(() => {
    if (activeSlug) {
      const config = getWigConfig(activeSlug);
      setTune({
        scale: config.scale * 0.68, // Shrink the wig size by ~50%
        offsetX: config.offsetX ?? 0,
        offsetY: config.offsetY ?? -0.48,
        rotationOffset: config.rotationOffset ?? 0,
        fringeDrop: config.fringeDrop ?? 0.03,
        foreheadOffset: -0.50,
      });
    }
  }, [activeSlug]);

  // Load and cache transparent wig angles in memory
  useEffect(() => {
    if (!selectedProduct) return;

    const loadWigImages = async () => {
      setProcessing(true);
      wigImagesRef.current = {};

      let tryOnImages = (selectedProduct.images || []).filter((img: any) => img.isTryOn);
      if (tryOnImages.length === 0) {
        // Fallback: If no images are explicitly marked isTryOn, use all product images so angles work
        tryOnImages = selectedProduct.images || [];
      }
      if (tryOnImages.length === 0) {
        console.warn("No eligible live try-on images found for this product.");
        setProcessing(false);
        return;
      }

      let loadedCount = 0;
      tryOnImages.forEach((img: any) => {
        const image = new window.Image();
        image.crossOrigin = "anonymous";
        image.src = resolveAssetUrl(img.url) || "";
        image.onload = () => {
          wigImagesRef.current[String(img.angle)] = image;
          loadedCount++;
          if (loadedCount === tryOnImages.length) {
            setProcessing(false);
          }
        };
        image.onerror = (e) => {
          console.error("Failed to load wig asset angle:", img.url, e);
          loadedCount++;
          if (loadedCount === tryOnImages.length) {
            setProcessing(false);
          }
        };
      });
    };

    if (Platform.OS === "web") {
      loadWigImages();
    }
  }, [selectedProduct]);

  // Web Face tracking MediaPipe loop
  const startRendering = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const detector = await getFaceLandmarker();
      if (!detector) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const result = detector.detectForVideo(video, performance.now());

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        if (!faceDetectedRef.current) {
          faceDetectedRef.current = true;
          setFaceDetected(true);
        }

        const landmarks = result.faceLandmarks[0];
        const timestamp = performance.now();

        // 1. Smooth landmarks with One Euro Filter
        const smoothedLandmarks = landmarkSmootherRef.current.smooth(landmarks, timestamp);

        // 2. Estimate 3D head pose from smoothed landmarks (mirror mode)
        const pose = headPoseEstimatorRef.current.estimate(
          smoothedLandmarks,
          canvas.width,
          canvas.height,
          true
        );

        if (pose) {
          // 3. Render wig using skull-anchoring and dual-angle cross-fading
          drawWigPose(
            ctx,
            wigImagesRef.current,
            pose,
            tuneRef.current,
            canvas.width,
            canvas.height,
            false
          );
        }
      } else {
        if (faceDetectedRef.current) {
          faceDetectedRef.current = false;
          setFaceDetected(false);
          landmarkSmootherRef.current?.reset();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
  }, [processing, selectedProductId]);



  // Web Face tracking for static uploaded photos using MediaPipe
  useEffect(() => {
    if (Platform.OS === "web" && selfieUri && !isLiveActive) {
      const canvas = uploadCanvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = selfieUri;
      img.onload = async () => {
        const maxWidth = 900;
        const maxHeight = 600;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);

        const detector = await getImageFaceLandmarker();
        if (!detector) return;

        const result = detector.detect(img);
        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          const landmarks = result.faceLandmarks[0];

          // Estimate 3D head pose from landmarks (static mode, not mirrored)
          const pose = headPoseEstimatorRef.current.estimate(
            landmarks,
            canvas.width,
            canvas.height,
            false
          );

          if (pose) {
            drawWigPose(
              ctx,
              wigImagesRef.current,
              pose,
              tuneRef.current,
              canvas.width,
              canvas.height,
              false
            );
          }
        }
      };
    }
  }, [selfieUri, isLiveActive, tune, processing]);

  // Setup PanResponder for dragging the wig overlay (Native only)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startPanRef.current = { x: wigPosition.x, y: wigPosition.y };
      },
      onPanResponderMove: (evt, gestureState) => {
        setWigPosition({
          x: startPanRef.current.x + gestureState.dx,
          y: startPanRef.current.y + gestureState.dy,
        });
      },
    })
  ).current;

  // Actual launch camera execution for live mode
  const executeStartLiveCamera = async () => {
    if (Platform.OS === "web") {
      setIsLiveActive(true);
      return;
    }
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed for real-time try-on.");
      return;
    }
    setIsLiveActive(true);
  };

  // Actual launch gallery execution
  const executeLaunchGallery = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setSelfieUri(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Gallery access is needed to pick a photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelfieUri(result.assets[0].uri);
    }
  };

  // Intercepting camera trigger
  const handleStartCamera = () => {
    if (!selectedProductId) {
      setPendingAction("camera");
      setShowSelectionModal(true);
    } else {
      executeStartLiveCamera();
    }
  };

  // Intercepting photo choose trigger
  const handleChoosePhoto = () => {
    if (!selectedProductId) {
      setPendingAction("upload");
      setShowSelectionModal(true);
    } else {
      executeLaunchGallery();
    }
  };

  // When user selects a wig style from the popup modal
  const handleWigSelectFromModal = (productId: string) => {
    setSelectedProductId(productId);
    setShowSelectionModal(false);

    // Proceed to pending action automatically after a brief delay
    setTimeout(() => {
      if (pendingAction === "camera") {
        executeStartLiveCamera();
      } else if (pendingAction === "upload") {
        executeLaunchGallery();
      }
      setPendingAction(null);
    }, 150);
  };

  // Handle capture/freeze photo from live camera feed
  const handleCapture = async () => {
    if (Platform.OS === "web") {
      if (canvasRef.current) {
        try {
          const dataUrl = canvasRef.current.toDataURL("image/jpeg");
          setSelfieUri(dataUrl);
          setIsLiveActive(false);
          if (webStream) {
            webStream.getTracks().forEach((track: any) => track.stop());
            setWebStream(null);
          }
        } catch (error) {
          Alert.alert("Capture Error", "Could not capture frame from canvas.");
        }
      }
    } else {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
            skipProcessing: true,
          });
          if (photo && photo.uri) {
            setSelfieUri(photo.uri);
            setIsLiveActive(false);
          }
        } catch (error) {
          Alert.alert("Capture Error", "Could not capture photo. Please try again.");
        }
      }
    }
  };

  // Handle adding selected product to cart
  const handleAddToBag = () => {
    if (!selectedProductId || !selectedProduct) return;
    if (!isAuthenticated) {
      if (Platform.OS === "web") {
        window.alert("Please sign in to add items to your cart.");
      } else {
        Alert.alert("Authentication Required", "Please sign in to add items to your cart.");
      }
      return;
    }

    addToCart.mutate(
      { productId: selectedProductId, quantity: 1 },
      {
        onSuccess: () => {
          setAddedProductName(selectedProduct.name);
          setShowCartToast(true);
          if (toastTimeoutId.current) {
            clearTimeout(toastTimeoutId.current);
          }
          toastTimeoutId.current = setTimeout(() => {
            setShowCartToast(false);
          }, 3500);
        },
        onError: (err) => {
          if (Platform.OS === "web") {
            window.alert("Could not add item to bag. Please try again.");
          } else {
            Alert.alert("Error", "Could not add item to bag. Please try again.");
          }
        },
      }
    );
  };

  // Helper function to change wig size
  const changeWigSize = (delta: number) => {
    if (Platform.OS === "web") {
      setTune((t) => ({
        ...t,
        scale: Math.max(0.5, Math.min(2.5, t.scale + (delta > 0 ? 0.05 : -0.05))),
      }));
    } else {
      setWigWidth((w) => {
        const nextW = Math.max(100, Math.min(SCREEN_WIDTH * 1.5, w + delta));
        setWigHeight(nextW);
        return nextW;
      });
    }
  };

  // Reset adjustments
  const handleResetAdjustments = () => {
    if (Platform.OS === "web") {
      const config = getWigConfig(activeSlug || "");
      setTune({
        scale: config.scale,
        offsetX: config.offsetX ?? 0,
        offsetY: config.offsetY ?? -0.15,
        rotationOffset: config.rotationOffset ?? 0,
        fringeDrop: config.fringeDrop ?? 0.03,
        foreheadOffset: config.foreheadOffset,
      });
    } else {
      setWigPosition({ x: (SCREEN_WIDTH - 355) / 2, y: SCREEN_WIDTH * 0.25 });
      setWigWidth(355);
      setWigHeight(355);
      setWigRotation(0);
    }
  };

  // Render the try-on studio once a selfie is loaded or live camera is active
  if (selfieUri || isLiveActive) {
    const selectedWigUrl = selectedProduct?.images?.[0]?.url;
    const resolvedWigUri = selectedWigUrl ? resolveAssetUrl(selectedWigUrl) : null;


    return (
      <View style={styles.studioContainer}>
        {/* Header */}
        <View style={styles.studioHeader}>
          <TouchableOpacity
            onPress={() => {
              setSelfieUri(null);
              setIsLiveActive(false);
            }}
            style={styles.studioBackBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#1F1233" />
          </TouchableOpacity>
          <Text style={styles.studioTitle}>{isLiveActive ? "Live Try-On" : "Try-On Studio"}</Text>
          <TouchableOpacity onPress={handleResetAdjustments} style={styles.resetBtn}>
            <Ionicons name="refresh-outline" size={20} color={colors.purple.DEFAULT} />
          </TouchableOpacity>
        </View>

        {/* Interactive Try-On Area */}
        <View style={styles.tryOnWorkspace}>
          {/* Selfie Background or Live Camera Feed */}
          {isLiveActive ? (
            Platform.OS === "web" ? (
              <>
                <video
                  ref={videoRef}
                  style={{ display: "none" }}
                  playsInline
                  muted
                  autoPlay
                />
                <canvas
                  ref={canvasRef}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </>
            ) : (
              <CameraView
                ref={cameraRef}
                facing="front"
                style={styles.selfieBgImage}
              />
            )
          ) : (
            Platform.OS === "web" ? (
              <canvas
                ref={uploadCanvasRef}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Image source={{ uri: selfieUri! }} style={styles.selfieBgImage} />
            )
          )}

          {/* Interactive Wig Overlay (Native Only - Web uses 3D Canvas rendering) */}
          {resolvedWigUri && Platform.OS !== "web" ? (
            <View
              {...panResponder.panHandlers}
              style={[
                styles.wigOverlayWrapper,
                {
                  left: wigPosition.x,
                  top: wigPosition.y,
                  width: wigWidth,
                  height: wigHeight,
                  transform: [
                    { rotate: `${wigRotation}deg` },
                  ],
                },
              ]}
            >
              <Image source={{ uri: resolvedWigUri }} style={styles.wigOverlayImage} />
            </View>
          ) : null}

          {/* Guidelines / adjustment tools overlay */}
          <View style={styles.adjustmentToolbar}>
            <TouchableOpacity onPress={() => changeWigSize(-15)} style={styles.adjustBtn}>
              <Ionicons name="remove" size={18} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.adjustLabel}>Size</Text>
            <TouchableOpacity onPress={() => changeWigSize(15)} style={styles.adjustBtn}>
              <Ionicons name="add" size={18} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.toolbarDivider} />

            <TouchableOpacity onPress={() => {
              if (Platform.OS === "web") {
                setTune((t) => ({ ...t, foreheadOffset: Math.max(-0.5, Math.min(0.8, t.foreheadOffset - 0.02)) }));
              } else {
                setWigRotation((r) => r - 5);
              }
            }} style={styles.adjustBtn}>
              <Ionicons name="arrow-undo-outline" size={16} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.adjustLabel}>{Platform.OS === "web" ? "Height" : "Rotate"}</Text>
            <TouchableOpacity onPress={() => {
              if (Platform.OS === "web") {
                setTune((t) => ({ ...t, foreheadOffset: Math.max(-0.5, Math.min(0.8, t.foreheadOffset + 0.02)) }));
              } else {
                setWigRotation((r) => r + 5);
              }
            }} style={styles.adjustBtn}>
              <Ionicons name="arrow-redo-outline" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Wig Display Info */}
        {selectedProduct && (
          <View style={styles.productInfoPanel}>
            <Image
              source={{ uri: resolveAssetUrl(selectedProduct.images[0].url) }}
              style={styles.productInfoImage}
            />
            <View style={styles.productInfoTextContainer}>
              <Text style={styles.productInfoBrand}>HairsUp</Text>
              <Text numberOfLines={1} style={styles.productInfoName}>{selectedProduct.name}</Text>
              <Text style={styles.productInfoPrice}>
                ₹{Math.round(selectedProduct.salePrice ?? selectedProduct.basePrice).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.studioActions}>
          <TouchableOpacity
            onPress={() => {
              setSelfieUri(null);
              setIsLiveActive(false);
            }}
            style={[styles.actionBtn, styles.actionBtnSecondary]}
          >
            <Text style={styles.actionBtnSecondaryText}>
              {isLiveActive ? "Stop Camera" : "Retake"}
            </Text>
          </TouchableOpacity>

          {isLiveActive && (
            <TouchableOpacity
              onPress={handleCapture}
              style={[styles.actionBtn, styles.actionBtnCapture]}
            >
              <Ionicons name="camera" size={16} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.actionBtnCaptureText}>Capture</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleAddToBag}
            disabled={!selectedProductId}
            style={[styles.actionBtn, styles.actionBtnPrimary, !selectedProductId && styles.actionBtnDisabled]}
          >
            <Text style={styles.actionBtnPrimaryText}>Add to Bag</Text>
          </TouchableOpacity>
        </View>

        {showCartToast ? (
          <Pressable
            onPress={() => {
              setShowCartToast(false);
              navigation.navigate("Home", { screen: "Cart" });
            }}
            style={styles.toastContainer}
          >
            <View style={styles.toastLeft}>
              <View style={styles.toastCheckmark}>
                <Ionicons name="checkmark" size={16} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.toastTitle}>Added to Bag</Text>
                <Text style={styles.toastSubtitle} numberOfLines={1}>
                  {addedProductName}
                </Text>
              </View>
            </View>
            <View style={styles.toastAction}>
              <Text style={styles.toastActionText}>Checkout</Text>
              <Ionicons name="chevron-forward" size={14} color="#FFF" />
            </View>
          </Pressable>
        ) : null}
      </View>
    );
  }

  // Render the default intro layout
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Ionicons name="flash" size={14} color="#fff" />
            <Text style={styles.heroBadgeText}> AI-Powered Virtual Try-On</Text>
          </View>
          <Text style={styles.heroTitle}>See It On You Before You Buy</Text>
          <Text style={styles.heroDescription}>
            Try on any HairsUp wig in real time using your camera. Our AI places the wig on your head instantly — no app download required.
          </Text>
          <View style={styles.featureList}>
            {features.map((feature) => (
              <View key={feature.label} style={styles.featureBadge}>
                <Ionicons name={feature.icon as any} size={16} color="#fff" />
                <Text style={styles.featureText}>{feature.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.controlSection}>
          <View style={styles.tabRow}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.contentRow}>
            {activeTab === "camera" ? (
              <View style={styles.previewCard}>
                <View style={styles.previewInner}>
                  <View style={styles.previewIconCircle}>
                    <Ionicons name="camera" size={24} color="#fff" />
                  </View>
                  <Text style={styles.previewTitle}>Virtual Try-On</Text>
                  <Text style={styles.previewSubtitle}>
                    See how any HairsUp wig looks on you — in real time using your camera.
                  </Text>
                  <TouchableOpacity onPress={handleStartCamera} style={styles.previewButton} activeOpacity={0.9}>
                    <Ionicons name="camera" size={16} color="#fff" style={styles.previewButtonIcon} />
                    <Text style={styles.previewButtonText}>Start Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.uploadCard}>
                <View style={styles.uploadInner}>
                  <View style={styles.uploadIconBorder}>
                    <Ionicons name="image-outline" size={24} color={colors.purple.DEFAULT} />
                  </View>
                  <Text style={styles.uploadTitle}>Upload your photo</Text>
                  <Text style={styles.uploadSubtitle}>JPG, PNG, WEBP up to 10MB</Text>
                  <TouchableOpacity onPress={handleChoosePhoto} style={styles.uploadButton} activeOpacity={0.9}>
                    <Text style={styles.uploadButtonText}>Choose Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Tips for best results</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>{"•"}</Text>
                <Text style={styles.tipLabel}>Find good, even lighting</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>{"•"}</Text>
                <Text style={styles.tipLabel}>Look directly at the camera</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>{"•"}</Text>
                <Text style={styles.tipLabel}>Keep your hair pulled back</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>{"•"}</Text>
                <Text style={styles.tipLabel}>Stay within 1–2 feet of camera</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.stepsSection}>
          <Text style={styles.stepsHeadline}>How It Works</Text>
          <Text style={styles.stepsDescription}>Get your perfect look in 4 simple steps</Text>
          <View style={styles.stepsGrid}>
            {steps.map((step, index) => (
              <View key={step.label} style={styles.stepCard}>
                <View style={styles.stepNumber}>{index + 1}</View>
                <Text style={styles.stepTitle}>{step.label}</Text>
                <Text style={styles.stepText}>{step.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Pre-selection Modal */}
      <Modal
        visible={showSelectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSelectionModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Choose a Wig Style</Text>
                <Text style={styles.modalSubtitle}>Select a wig to start your virtual try-on</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSelectionModal(false)}
                style={styles.closeButton}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#1F1233" />
              </TouchableOpacity>
            </View>

            {isPending ? (
              <ActivityIndicator color={colors.purple.DEFAULT} style={{ marginVertical: 40 }} />
            ) : (
              <FlatList
                data={wigProducts}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.listColumnWrapper}
                renderItem={({ item }: { item: FeaturedProduct }) => {
                  const thumbUrl = resolveAssetUrl(item.images[0].url);
                  return (
                    <TouchableOpacity
                      onPress={() => handleWigSelectFromModal(item.id)}
                      style={styles.wigGridCard}
                      activeOpacity={0.9}
                    >
                      <Image source={{ uri: thumbUrl }} style={styles.wigGridCardImage} />
                      <Text style={styles.wigGridCardBrand}>HairsUp</Text>
                      <Text numberOfLines={1} style={styles.wigGridCardName}>{item.name}</Text>
                      <Text style={styles.wigGridCardPrice}>
                        ₹{Math.round(item.salePrice ?? item.basePrice).toLocaleString("en-IN")}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => {
                  setShowSelectionModal(false);
                  navigation.navigate("Home");
                }}
                style={styles.homeBtn}
                activeOpacity={0.9}
              >
                <Ionicons name="home-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.homeBtnText}>Go to Home Page</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showCartToast ? (
        <Pressable
          onPress={() => {
            setShowCartToast(false);
            navigation.navigate("Home", { screen: "Cart" });
          }}
          style={styles.toastContainer}
        >
          <View style={styles.toastLeft}>
            <View style={styles.toastCheckmark}>
              <Ionicons name="checkmark" size={16} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>Added to Bag</Text>
              <Text style={styles.toastSubtitle} numberOfLines={1}>
                {addedProductName}
              </Text>
            </View>
          </View>
          <View style={styles.toastAction}>
            <Text style={styles.toastActionText}>Checkout</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFF" />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.white },
  pageContent: { paddingBottom: 24 },
  heroSection: { backgroundColor: colors.purple.DEFAULT, paddingVertical: 24, paddingHorizontal: 16 },
  heroBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginBottom: 16 },
  heroBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "800", lineHeight: 32, marginBottom: 12 },
  heroDescription: { color: "rgba(255,255,255,0.92)", fontSize: 14, lineHeight: 22, marginBottom: 18 },
  featureList: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginRight: 10, marginBottom: 10 },
  featureText: { color: "#fff", marginLeft: 8, fontSize: 12, fontWeight: "700" },
  controlSection: { paddingHorizontal: 16, paddingTop: 20 },
  tabRow: { flexDirection: "row", backgroundColor: "#F3F4F6", borderRadius: 16, padding: 4, marginBottom: 16 },
  tabItem: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  tabItemActive: { backgroundColor: "#fff" },
  tabText: { fontSize: 13, color: "#6B7280", fontWeight: "700" },
  tabTextActive: { color: colors.purple.dark },
  contentRow: { gap: 16 },
  previewCard: { backgroundColor: "#0F172A", borderRadius: 24, padding: 24, minHeight: 260, justifyContent: "center" },
  previewInner: { alignItems: "center" },
  previewIconCircle: { width: 70, height: 70, borderRadius: 999, backgroundColor: "rgba(139,92,246,0.24)", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  previewTitle: { fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 8, textAlign: "center" },
  previewSubtitle: { color: "rgba(255,255,255,0.76)", fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 20, paddingHorizontal: 12 },
  previewButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.purple.DEFAULT, paddingVertical: 14, paddingHorizontal: 22, borderRadius: 999 },
  previewButtonIcon: { marginRight: 8 },
  previewButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  uploadCard: { backgroundColor: "#0F172A", borderRadius: 24, padding: 24, minHeight: 260, justifyContent: "center" },
  uploadInner: { alignItems: "center" },
  uploadIconBorder: { width: 70, height: 70, borderRadius: 999, borderWidth: 1.5, borderColor: "rgba(139,92,246,0.5)", alignItems: "center", justifyContent: "center", marginBottom: 18 },
  uploadTitle: { fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 8, textAlign: "center" },
  uploadSubtitle: { color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 20, paddingHorizontal: 12 },
  uploadButton: { backgroundColor: colors.purple.DEFAULT, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 999 },
  uploadButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  tipsCard: { backgroundColor: "#F9F5FF", borderRadius: 24, padding: 18, marginTop: 16 },
  tipsTitle: { fontSize: 16, fontWeight: "700", color: colors.purple.dark, marginBottom: 12 },
  tipItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  tipBullet: { color: colors.purple.DEFAULT, fontSize: 16, lineHeight: 20 },
  tipLabel: { flex: 1, color: "#4B5563", fontSize: 13, lineHeight: 20 },
  stepsSection: { paddingHorizontal: 16, paddingTop: 24 },
  stepsHeadline: { fontSize: 22, fontWeight: "800", color: colors.purple.dark, marginBottom: 6, textAlign: "center" },
  stepsDescription: { fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 18 },
  stepsGrid: { gap: 12 },
  stepCard: { backgroundColor: "#F8F5FF", borderRadius: 24, padding: 16 },
  stepNumber: { width: 32, height: 32, borderRadius: 999, backgroundColor: "rgba(139,92,246,0.18)", color: colors.purple.DEFAULT, fontWeight: "800", textAlign: "center", lineHeight: 32, marginBottom: 12 },
  stepTitle: { fontSize: 15, fontWeight: "700", color: colors.purple.dark, marginBottom: 6 },
  stepText: { fontSize: 13, color: "#4B5563", lineHeight: 20 },

  // Try-On Studio Styles
  studioContainer: { flex: 1, backgroundColor: "#FFF" },
  studioHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  studioBackBtn: { padding: 4 },
  studioTitle: { fontSize: 18, fontWeight: "700", color: "#1F1233" },
  resetBtn: { padding: 4 },
  tryOnWorkspace: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: "#E2E8F0",
    position: "relative",
    overflow: "hidden",
  },
  selfieBgImage: { width: "100%", height: "100%" },
  wigOverlayWrapper: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  wigOverlayImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  adjustmentToolbar: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 10,
  },
  adjustBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  adjustLabel: { color: "#FFF", fontSize: 11, fontWeight: "600" },
  toolbarDivider: { width: 1, height: 20, backgroundColor: "rgba(255, 255, 255, 0.2)", marginHorizontal: 4 },

  // Selected Product Info Panel (in place of carousel)
  productInfoPanel: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FAFAFA",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 16,
  },
  productInfoImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    resizeMode: "cover",
  },
  productInfoTextContainer: {
    flex: 1,
  },
  productInfoBrand: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  productInfoName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F1233",
    marginTop: 2,
  },
  productInfoPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.purple.DEFAULT,
    marginTop: 4,
  },

  studioActions: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginBottom: Platform.OS === "web" ? 64 : 0,
  },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  actionBtnPrimary: { backgroundColor: colors.purple.DEFAULT },
  actionBtnPrimaryText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  actionBtnSecondary: { backgroundColor: "#F3F4F6" },
  actionBtnSecondaryText: { color: "#4B5563", fontSize: 12, fontWeight: "700" },
  actionBtnDisabled: { backgroundColor: "#E5E7EB" },
  actionBtnCapture: { backgroundColor: "#0F172A", flexDirection: "row", justifyContent: "center" },
  actionBtnCaptureText: { color: "#FFF", fontSize: 12, fontWeight: "700" },

  // Pre-selection modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 5, 20, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    minHeight: "50%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F1233",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  listColumnWrapper: {
    justifyContent: "space-between",
    gap: 16,
  },
  wigGridCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
  },
  wigGridCardImage: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    resizeMode: "cover",
  },
  wigGridCardBrand: {
    fontSize: 9,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    alignSelf: "flex-start",
    marginTop: 8,
  },
  wigGridCardName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1233",
    marginTop: 2,
    alignSelf: "flex-start",
  },
  wigGridCardPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.purple.DEFAULT,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  homeBtn: {
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  homeBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  toastContainer: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 86 : 30, // Raise toast higher on Web to avoid overlaps
    left: 16,
    right: 16,
    backgroundColor: "#1F1233",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9999, // Ensure it draws above overlays
  },
  toastLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  toastCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  toastTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  toastSubtitle: {
    color: "#A78BFA",
    fontSize: 12,
    marginTop: 2,
  },
  toastAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.purple.DEFAULT,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  toastActionText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
