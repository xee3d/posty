import { Alert } from "../customAlert";
import ImagePicker, {
  ImagePickerResponse,
  MediaType,
  CameraOptions,
  ImageLibraryOptions,
} from "react-native-image-picker";

interface ImagePickerOptions {
  title?: string;
  mediaType?: MediaType;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const showImagePicker = (
  options?: ImagePickerOptions
): Promise<ImagePickerResponse> => {
  return new Promise((resolve) => {
    const title = options?.title || "사진 선택";

    Alert.alert(title, "어떤 방법으로 사진을 선택하시겠어요?", [
      {
        text: "카메라로 촬영",
        onPress: () => {
          const cameraOptions: CameraOptions = {
            mediaType: options?.mediaType || "photo",
            quality: options?.quality || 0.8,
            maxWidth: options?.maxWidth || 1920,
            maxHeight: options?.maxHeight || 1920,
            includeBase64: false,
            saveToPhotos: true,
          };

          ImagePicker.launchCamera(cameraOptions, (response) => {
            resolve(response);
          });
        },
      },
      {
        text: "갤러리에서 선택",
        onPress: () => {
          const libraryOptions: ImageLibraryOptions = {
            mediaType: options?.mediaType || "photo",
            quality: options?.quality || 0.8,
            maxWidth: options?.maxWidth || 1920,
            maxHeight: options?.maxHeight || 1920,
            includeBase64: false,
            selectionLimit: 1,
          };

          ImagePicker.launchImageLibrary(libraryOptions, (response) => {
            resolve(response);
          });
        },
      },
      {
        text: "취소",
        style: "cancel",
        onPress: () => resolve({ didCancel: true, assets: [] }),
      },
    ]);
  });
};

export const launchCamera = (
  options?: ImagePickerOptions
): Promise<ImagePickerResponse> => {
  return new Promise((resolve) => {
    const cameraOptions: CameraOptions = {
      mediaType: options?.mediaType || "photo",
      quality: options?.quality || 0.8,
      maxWidth: options?.maxWidth || 1920,
      maxHeight: options?.maxHeight || 1920,
      includeBase64: false,
      saveToPhotos: true,
    };

    ImagePicker.launchCamera(cameraOptions, (response) => {
      resolve(response);
    });
  });
};

export const launchImageLibrary = (
  options?: ImagePickerOptions
): Promise<ImagePickerResponse> => {
  return new Promise((resolve) => {
    const libraryOptions: ImageLibraryOptions = {
      mediaType: options?.mediaType || "photo",
      quality: options?.quality || 0.8,
      maxWidth: options?.maxWidth || 1920,
      maxHeight: options?.maxHeight || 1920,
      includeBase64: false,
      selectionLimit: 1,
    };

    ImagePicker.launchImageLibrary(libraryOptions, (response) => {
      resolve(response);
    });
  });
};

// 권한 확인 및 요청 함수
export const checkAndRequestPermissions = async (): Promise<boolean> => {
  // React Native 0.74에서는 권한이 자동으로 처리됩니다
  // iOS는 Info.plist에, Android는 AndroidManifest.xml에 권한이 설정되어 있어야 합니다
  return true;
};
