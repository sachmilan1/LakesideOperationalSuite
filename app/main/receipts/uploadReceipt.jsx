// app/main/receipts/uploadReceipt.jsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  StyleSheet,
  FlatList,
  ImageBackground,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../../FirebaseConfig";
import { router } from "expo-router";

// Try to use expo-image-manipulator if present (optional)
// App still works if it's not installed.
let ImageManipulator = null;
try {
  ImageManipulator = require("expo-image-manipulator");
} catch {
  console.warn(
    "expo-image-manipulator not installed; HEIC→JPEG will be skipped (original file uploaded)."
  );
}

// ---------- helpers ----------
const extFromMime = (mime) => {
  const m = (mime || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("webp")) return "webp";
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  if (m.includes("heic")) return "heic";
  if (m.includes("heif")) return "heif";
  return null;
};

const mimeFromExt = (ext) => {
  switch ((ext || "").toLowerCase()) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    default:
      return "application/octet-stream";
  }
};

const ensureFileName = (candidate, fallbackExt) => {
  if (!candidate) return `file_${Date.now()}.${fallbackExt}`;
  if (!/\.[a-z0-9]+$/i.test(candidate)) return `${candidate}.${fallbackExt}`;
  return candidate;
};

async function blobFromUri(uri) {
  const r = await fetch(uri);
  return await r.blob();
}

// Convert HEIC/HEIF → JPEG if ImageManipulator is available; otherwise pass-through
async function maybeConvertToJpeg({ uri, fileName, mimeType }) {
  const lowerName = (fileName || "").toLowerCase();
  const isHeicLike =
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif") ||
    (mimeType ? /(heic|heif)/i.test(mimeType) : false) ||
    uri.toLowerCase().includes(".heic") ||
    uri.toLowerCase().includes(".heif");

  if (!isHeicLike || !ImageManipulator?.manipulateAsync) {
    const blob = await blobFromUri(uri);
    return { blob, fileName, mimeType: mimeType || blob.type || "application/octet-stream" };
  }

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [], // just re-encode
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat ? ImageManipulator.SaveFormat.JPEG : "jpeg",
      }
    );
    const jpgBlob = await blobFromUri(result.uri);
    const newName = (fileName || "image.jpg").replace(/\.(heic|heif)$/i, ".jpg");
    return { blob: jpgBlob, fileName: newName, mimeType: "image/jpeg" };
  } catch (e) {
    console.warn("HEIC→JPEG conversion failed, uploading original:", e);
    const blob = await blobFromUri(uri);
    return { blob, fileName, mimeType: mimeType || blob.type || "application/octet-stream" };
  }
}

// Build cross-version ImagePicker mediaTypes option
function buildPickerMediaTypes() {
  // New API (v15+): ImagePicker.MediaType (string enum), expects array
  if (ImagePicker?.MediaType) {
    return { mediaTypes: [ImagePicker.MediaType.Image] };
  }
  // Old API: ImagePicker.MediaTypeOptions.Images (enum value)
  if (ImagePicker?.MediaTypeOptions?.Images != null) {
    return { mediaTypes: ImagePicker.MediaTypeOptions.Images };
  }
  // Fallback: omit (usually defaults to images)
  return {};
}

// ---------- component ----------
export default function UploadReceipt() {
  const [fileUpload, setFileUpload] = useState(null);
  const [images, setImages] = useState([]);
  const [poNumber, setPoNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  // Pick generic file
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length) {
        setFileUpload(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Unable to pick document");
    }
  };

  // Upload generic file
  const uploadFile = async () => {
    if (!fileUpload) return Alert.alert("No file", "Please select a file first");
    try {
      const resp = await fetch(fileUpload.uri);
      const blob = await resp.blob();
      const ext = extFromMime(blob.type) || "bin";
      const name = fileUpload.name || `file_${Date.now()}.${ext}`;
      const fileRef = ref(storage, `projectFiles/${name}`);
      await uploadBytes(fileRef, blob, {
        contentType: blob.type || fileUpload.mimeType || "application/octet-stream",
      });
      Alert.alert("Success", "File uploaded!");
      setFileUpload(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Upload failed", "Could not upload the file.");
    }
  };

  // Pick multiple images (version-safe)
  const pickImages = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission denied", "We need access to your photos.");
        return;
      }
      const base = buildPickerMediaTypes();
      const result = await ImagePicker.launchImageLibraryAsync({
        ...base,
        allowsMultipleSelection: true,
        quality: 0.85,
      });
      if (result.canceled) return;

      const newOnes = (result.assets || []).map((asset) => ({
        id: `${asset.assetId || asset.uri}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        uri: asset.uri,
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        mimeType: asset.mimeType || "image/jpeg",
      }));
      if (newOnes.length) setImages((prev) => [...prev, ...newOnes]);
    } catch (error) {
      console.error("Unable to pick images", error);
      Alert.alert("Error", "Unable to pick images");
    }
  };

  const removeImage = (id) => setImages((prev) => prev.filter((img) => img.id !== id));

  const totalImages = images.length;
  const canUpload = useMemo(
    () => !uploading && totalImages > 0 && poNumber.trim() && userName.trim(),
    [uploading, totalImages, poNumber, userName]
  );

  // Upload all receipts
  const uploadAllReceipts = async () => {
    const po = poNumber.trim();
    const user = userName.trim();
    if (!po || !user) return Alert.alert("Missing info", "Please enter PO Number and User Name.");
    if (images.length === 0) return Alert.alert("No images", "Add at least one receipt photo.");

    setUploading(true);
    setUploadedCount(0);
    const batchId = `batch_${Date.now()}`;

    try {
      let success = 0;

      for (let idx = 0; idx < images.length; idx++) {
        const image = images[idx];
        try {
          const recRef = doc(collection(db, "receipts"));

          // Convert HEIC→JPEG if possible (no-op if manipulator unavailable)
          const converted = await maybeConvertToJpeg({
            uri: image.uri,
            fileName: image.fileName,
            mimeType: image.mimeType,
          });

          let { blob, fileName, mimeType } = converted;

          // Determine extension/MIME
          let ext = extFromMime(mimeType);
          if (!ext) {
            const fromUri = image.uri.split("?")[0].split(".").pop();
            if (fromUri && fromUri.length <= 5) ext = fromUri.toLowerCase();
          }
          if (!ext) ext = "jpg";

          if (!mimeType || mimeType === "application/octet-stream") {
            mimeType = mimeFromExt(ext);
          }

          // Final filename + storage path
          fileName = ensureFileName(fileName, ext);
          const storagePath = `receipts/${recRef.id}/${fileName}`;
          const imageRef = ref(storage, storagePath);

          await uploadBytes(imageRef, blob, { contentType: mimeType });
          const imageUrl = await getDownloadURL(imageRef);

          await setDoc(recRef, {
            batchId,
            poNumber: po,
            userName: user,
            imagePath: storagePath,
            imageUrl,
            indexInBatch: idx,
            uploadedAt: serverTimestamp(),
          });

          success += 1;
          setUploadedCount(success);
        } catch (innerErr) {
          console.error(`Error uploading receipt ${idx + 1}:`, innerErr);
        }
      }

      if (success === images.length) {
        Alert.alert("Success! 🎉", `All ${success} receipts uploaded.`);
      } else if (success === 0) {
        Alert.alert("Upload failed", "None of the receipts were uploaded.");
      } else {
        Alert.alert("Partial success", `${success}/${images.length} receipts uploaded.`);
      }

      if (success > 0) {
        setPoNumber("");
        setUserName("");
        setImages([]);
        setFileUpload(null);
      }
    } catch (error) {
      console.error("Batch upload failed:", error);
      Alert.alert("Upload failed", error?.message ?? "Unknown error");
    } finally {
      setUploading(false);
    }
  };

  // ---------- UI ----------
  return (
    <ImageBackground source={require("../../../logo.png")} style={{ flex: 1 }} resizeMode="cover">
      <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.h2}>Upload Receipts (Multiple)</Text>

              <Text style={styles.label}>PO Number</Text>
              <TextInput
                value={poNumber}
                onChangeText={setPoNumber}
                placeholder="PO-12345"
                style={styles.input}
                autoCapitalize="characters"
                placeholderTextColor="#8a8a8a"
              />

              <Text style={styles.label}>User Name</Text>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                placeholder="John Doe"
                style={styles.input}
                autoCapitalize="words"
                placeholderTextColor="#8a8a8a"
              />

              <TouchableOpacity style={[styles.btn, styles.primary]} onPress={pickImages}>
                <Text style={styles.btnText}>Add Receipt Photos</Text>
              </TouchableOpacity>

              {images.length > 0 && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.h3}>Selected ({images.length})</Text>
                  <FlatList
                    data={images}
                    keyExtractor={(it) => it.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10, paddingVertical: 6 }}
                    renderItem={({ item }) => (
                      <View style={styles.thumbWrap}>
                        <Image source={{ uri: item.uri }} style={styles.thumb} />
                        <Text numberOfLines={1} style={styles.thumbLabel}>
                          {item.fileName ?? "image"}
                        </Text>
                        <TouchableOpacity onPress={() => removeImage(item.id)} style={styles.removeBtn}>
                          <Text style={{ color: "white", fontWeight: "800" }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {uploading && (
                    <Text style={{ marginTop: 6, fontSize: 12, color: "#374151" }}>
                      Uploading {uploadedCount}/{images.length}…
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={[styles.btn, styles.primary, (!canUpload || uploading) && { opacity: 0.6 }]}
                onPress={uploadAllReceipts}
                disabled={!canUpload}
              >
                <Text style={styles.btnText}>
                  {uploading ? `Uploading ${uploadedCount}/${images.length}...` : "Upload All Receipts"}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 16 }} />
              <Text style={styles.h3}>Or upload any file</Text>

              <TouchableOpacity onPress={pickDocument} style={[styles.btn, styles.secondary]}>
                <Text style={styles.btnText}>Select File</Text>
              </TouchableOpacity>

              {fileUpload && (
                <Text style={{ marginTop: 6, color: "#111827" }}>Selected: {fileUpload.name}</Text>
              )}

              <TouchableOpacity onPress={uploadFile} style={[styles.btn, styles.primary]}>
                <Text style={styles.btnText}>Upload File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace("/main/userId")}
                style={[styles.btn, styles.secondary]}
              >
                <Text style={styles.btnText}>Home/Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </BlurView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20 },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  h2: { fontSize: 18, fontWeight: "800", color: "#111827" },
  h3: { fontSize: 16, fontWeight: "700", marginTop: 6, color: "#111827" },
  label: { fontSize: 12, color: "#6b7280", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "white",
    marginTop: 6,
    color: "#111827",
  },
  btn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primary: { backgroundColor: "#d50000" }, // Lakeside red
  secondary: { backgroundColor: "#4b5563" },
  btnText: { color: "white", fontWeight: "700" },
  thumbWrap: {
    width: 140,
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 6,
    justifyContent: "flex-start",
    alignItems: "center",
    position: "relative",
    backgroundColor: "white",
  },
  thumb: { width: "100%", height: 110, borderRadius: 8 },
  thumbLabel: { fontSize: 12, marginTop: 6, maxWidth: "100%", color: "#111827" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
});
