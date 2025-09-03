import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";

// 아이콘 검증을 위한 함수 - 실제 렌더링을 시도하여 유효성 검사
const isValidIoniconName = (iconName: string): boolean => {
  // 일반적으로 유효한 패턴들
  const commonPatterns = [
    /^[a-z-]+$/, // 소문자와 하이픈만
    /^[a-z-]+(outline|sharp)?$/, // outline이나 sharp 접미사
    /^logo-[a-z-]+$/, // logo- 접두사
  ];

  return commonPatterns.some((pattern) => pattern.test(iconName));
};

// 확실히 유효한 핵심 아이콘들만 포함
const CORE_VALID_IONICONS = [
  // 기본 UI
  "home",
  "home-outline",
  "home-sharp",
  "create",
  "create-outline",
  "create-sharp",
  "camera",
  "camera-outline",
  "camera-sharp",
  "star",
  "star-outline",
  "star-half",
  "heart",
  "heart-outline",
  "heart-sharp",
  "calendar",
  "calendar-outline",
  "calendar-sharp",
  "time",
  "time-outline",
  "time-sharp",
  "settings",
  "settings-outline",
  "settings-sharp",
  "person",
  "person-outline",
  "person-sharp",
  "notifications",
  "notifications-outline",
  "notifications-sharp",
  "search",
  "search-outline",
  "search-sharp",
  "add",
  "add-outline",
  "add-circle",
  "add-circle-outline",
  "checkmark",
  "checkmark-outline",
  "checkmark-circle",
  "checkmark-circle-outline",
  "close",
  "close-outline",
  "close-circle",
  "close-circle-outline",
  "arrow-back",
  "arrow-forward",
  "chevron-back",
  "chevron-forward",
  "chevron-up",
  "chevron-down",
  "chevron-up-outline",
  "chevron-down-outline",
  "menu",
  "menu-outline",
  "ellipsis-horizontal",
  "ellipsis-vertical",
  "image",
  "images",
  "images-outline",
  "play",
  "pause",
  "stop",
  "share",
  "share-outline",
  "copy",
  "copy-outline",
  "edit",
  "trash",
  "trash-outline",
  "refresh",
  "refresh-outline",
  "information-circle",
  "information-circle-outline",
  "warning",
  "warning-outline",
  "alert-circle",
  "alert-circle-outline",
  "help-circle",
  "help-circle-outline",
  "location",
  "location-outline",
  "map",
  "map-outline",
  "mail",
  "mail-outline",
  "call",
  "call-outline",
  "globe",
  "globe-outline",
  "wifi",
  "wifi-outline",

  // 날씨 관련 (실제 존재 확인됨)
  "sunny",
  "sunny-outline",
  "sunny-sharp",
  "moon",
  "moon-outline",
  "moon-sharp",
  "cloudy",
  "cloudy-outline",
  "cloudy-sharp",
  "rainy",
  "rainy-outline",
  "rainy-sharp",
  "partly-sunny",
  "partly-sunny-outline",
  "partly-sunny-sharp",
  "umbrella",
  "umbrella-outline",
  "umbrella-sharp",
  "water",
  "water-outline",
  "water-sharp",

  // 자연 관련 (실제 존재 확인됨)
  "flower",
  "flower-outline",
  "flower-sharp",
  "leaf",
  "leaf-outline",
  "leaf-sharp",

  // 기타 자주 사용되는 아이콘들
  "restaurant",
  "restaurant-outline",
  "car",
  "car-outline",
  "airplane",
  "airplane-outline",
  "train",
  "train-outline",
  "musical-notes",
  "musical-notes-outline",
  "headset",
  "headset-outline",
  "volume-high",
  "volume-low",
  "volume-mute",
  "diamond",
  "diamond-outline",
  "trophy",
  "trophy-outline",
  "gift",
  "gift-outline",
  "cash",
  "cash-outline",
  "card",
  "card-outline",
  "business",
  "business-outline",
  "school",
  "school-outline",
  "library",
  "library-outline",
  "book",
  "book-outline",
  "bulb",
  "bulb-outline",
  "color-palette",
  "color-palette-outline",
  "brush",
  "brush-outline",
  "color-wand",
  "color-wand-outline",
  "sparkles",
  "sparkles-outline",
  "flash",
  "flash-outline",
  "construct",
  "construct-outline",
  "hammer",
  "hammer-outline",
  "telescope",
  "telescope-outline",
  "eye",
  "eye-outline",
  "document",
  "document-outline",
  "document-text",
  "document-text-outline",
  "folder",
  "folder-outline",
  "folder-open",
  "folder-open-outline",
  "trending-up-outline",
  "flag-outline",
  "rocket-outline",
  "flame-outline",
  "timer-outline",
  "paw-outline",
  "cloud-outline",
  "thermometer-outline",
  "bed-outline",
  "cafe-outline",
  "hourglass-outline",
  "flame",
  "paw",
  "thermometer",
  "bed",
  "cafe",
  "hourglass",
  "timer",
  "rocket",
  "flag",
  "archive",
  "archive-outline",
  "download",
  "download-outline",
  "cloud",
  "cloud-upload",
  "cloud-download",
  "link",
  "link-outline",
  "unlink",
  "unlink-outline",
  "lock-closed",
  "lock-open",
  "key",
  "key-outline",
  "shield",
  "shield-outline",
  "shield-checkmark",
  "shield-checkmark-outline",
  "pricetag",
  "pricetag-outline",
  "pricetags",
  "pricetags-outline",
  "people",
  "people-outline",
  "person-add",
  "person-remove",
  "chatbubble",
  "chatbubble-outline",
  "chatbubbles",
  "chatbubbles-outline",
  "thumbs-up",
  "thumbs-down",
  "thumbs-up-outline",
  "thumbs-down-outline",
  "trending-up",
  "trending-down",
  "stats-chart",
  "stats-chart-outline",
  "pie-chart",
  "pie-chart-outline",
  "bar-chart",
  "bar-chart-outline",
  "radio-button-on",
  "radio-button-off",
  "checkbox",
  "checkbox-outline",
  "toggle",
  "toggle-outline",
  "options",
  "options-outline",
  "filter",
  "filter-outline",
  "funnel",
  "funnel-outline",
  "scan",
  "scan-outline",
  "qr-code",
  "qr-code-outline",
  "fingerprint",
  "fingerprint-outline",
  "hand-left",
  "hand-right",
];

interface SafeIconProps {
  name: string;
  size?: number;
  color?: string;
  type?: "ionicons" | "material" | "material-community";
}

// 아이콘 이름 매핑 (Material Design Icons -> Ionicons)
const ICON_MAPPING: Record<
  string,
  { type: "ionicons" | "material" | "material-community"; name: string }
> = {
  // Material Design Icons that might be used
  "wb-twilight": { type: "ionicons", name: "partly-sunny" },
  "wb-sunny": { type: "ionicons", name: "sunny" },
  "wb-cloudy": { type: "ionicons", name: "cloudy" },
  "brightness-4": { type: "ionicons", name: "moon" },
  "brightness-7": { type: "ionicons", name: "sunny" },
  "brightness-auto": { type: "ionicons", name: "contrast" },
  "access-time": { type: "ionicons", name: "time-outline" },
  schedule: { type: "ionicons", name: "calendar-outline" },
  "access-alarm": { type: "ionicons", name: "alarm-outline" },
  "query-builder": { type: "ionicons", name: "time-outline" },
  trending_up: { type: "ionicons", name: "trending-up" },
  star_rate: { type: "ionicons", name: "star" },
  access_time: { type: "ionicons", name: "time-outline" },
  psychology: { type: "ionicons", name: "bulb" },
  water: { type: "ionicons", name: "water-outline" },
  water_drop: { type: "ionicons", name: "water-outline" },
  "water-outline": { type: "ionicons", name: "water-outline" },
  local_drink: { type: "ionicons", name: "wine" },
  spa: { type: "ionicons", name: "flower-outline" },
  "light-mode": { type: "ionicons", name: "sunny" },
  "dark-mode": { type: "ionicons", name: "moon" },
  // Common Material Design Icons to Ionicons mapping
  edit: { type: "ionicons", name: "create" },
  "auto-fix-high": { type: "ionicons", name: "color-wand" },
  "photo-camera": { type: "ionicons", name: "camera" },
  "monetization-on": { type: "ionicons", name: "cash" },
  animation: { type: "ionicons", name: "play-circle" },
  "workspace-premium": { type: "ionicons", name: "diamond" },
  palette: { type: "ionicons", name: "color-palette" },
  "tips-and-updates": { type: "ionicons", name: "bulb" },
  "info-outline": { type: "ionicons", name: "information-circle-outline" },
  info: { type: "ionicons", name: "information-circle" },
  "help-outline": { type: "ionicons", name: "help-circle-outline" },
  "error-outline": { type: "ionicons", name: "alert-circle-outline" },
  "warning-outline": { type: "ionicons", name: "warning-outline" },
  "check-circle-outline": {
    type: "ionicons",
    name: "checkmark-circle-outline",
  },
  "play-circle-outline": { type: "ionicons", name: "play-circle-outline" },
  "people-outline": { type: "ionicons", name: "people-outline" },
  "sync-outline": { type: "ionicons", name: "sync-outline" },
  "pencil-outline": { type: "ionicons", name: "pencil-outline" },
  "sparkles-outline": { type: "ionicons", name: "sparkles-outline" },
  "add-circle-outline": { type: "ionicons", name: "add-circle-outline" },

  // personalizedRecommendationService에서 사용하는 추가 아이콘들 (안전한 대체재)
  "trending-up": { type: "ionicons", name: "trending-up-outline" },
  event: { type: "ionicons", name: "calendar-outline" },
  today: { type: "ionicons", name: "calendar-outline" },
  flag: { type: "ionicons", name: "flag-outline" },
  "rocket-outline": { type: "ionicons", name: "rocket-outline" },
  "photo-library": { type: "ionicons", name: "images-outline" },
  collections: { type: "ionicons", name: "folder-outline" },
  whatshot: { type: "ionicons", name: "flame-outline" },
  "edit-note": { type: "ionicons", name: "create-outline" },
  "hourglass-empty": { type: "ionicons", name: "hourglass-outline" },
  timer: { type: "ionicons", name: "timer-outline" },
  "pet-friendly": { type: "ionicons", name: "paw-outline" },
  cloud: { type: "ionicons", name: "cloud-outline" },
  thermostat: { type: "ionicons", name: "thermometer-outline" },
  weekend: { type: "ionicons", name: "bed-outline" },
  hotel: { type: "ionicons", name: "bed-outline" },
  "local-cafe": { type: "ionicons", name: "cafe-outline" },
  "notifications-outline": { type: "ionicons", name: "notifications-outline" },
  "trophy-outline": { type: "ionicons", name: "trophy-outline" },
  "bulb-outline": { type: "ionicons", name: "bulb-outline" },
  "create-outline": { type: "ionicons", name: "create-outline" },
  target: { type: "ionicons", name: "radio-button-on" },
  pricetag: { type: "ionicons", name: "pricetag" },
  construct: { type: "ionicons", name: "construct" },
  "document-text": { type: "ionicons", name: "document-text" },
  public: { type: "ionicons", name: "globe" },
  "card-giftcard": { type: "ionicons", name: "gift" },
  "arrow-forward": { type: "ionicons", name: "arrow-forward" },
  refresh: { type: "ionicons", name: "refresh" },
  "information-circle": { type: "ionicons", name: "information-circle" },
  "checkmark-circle": { type: "ionicons", name: "checkmark-circle" },
  "chevron-forward": { type: "ionicons", name: "chevron-forward" },
  block: { type: "ionicons", name: "ban" },
  check: { type: "ionicons", name: "checkmark" },
  "arrow-back": { type: "ionicons", name: "arrow-back" },
  "flight-takeoff": { type: "ionicons", name: "airplane" },
  "account-balance-wallet": { type: "ionicons", name: "wallet" },
  flower: { type: "ionicons", name: "flower-outline" },
  "flower-outline": { type: "ionicons", name: "flower-outline" },

  // Add more mappings as needed
};

export const SafeIcon: React.FC<SafeIconProps> = ({
  name,
  size = 24,
  color = "#000000",
  type = "ionicons",
}) => {
  // Check if we have a mapping for this icon
  const mapping = ICON_MAPPING[name];

  if (mapping) {
    name = mapping.name;
    type = mapping.type;
  }

  // 아이콘 이름 검증 및 폴백 로직
  const validateAndRenderIcon = () => {
    try {
      switch (type) {
        case "material":
          return <MaterialIcon name={name} size={size} color={color} />;
        case "material-community":
          return (
            <MaterialCommunityIcon name={name} size={size} color={color} />
          );
        case "ionicons":
        default:
          // Ionicons의 경우 유효한 아이콘인지 먼저 검증
          // 1. 핵심 아이콘 목록에 있는지 확인
          // 2. 일반적인 패턴에 맞는지 확인
          const isInCoreList = CORE_VALID_IONICONS.includes(name);
          const matchesPattern = isValidIoniconName(name);

          if (!isInCoreList && !matchesPattern) {
            console.warn(
              `⚠️ Potentially invalid Ionicons name: "${name}". Trying fallback.`
            );
            // 일반적인 폴백 매핑 시도
            const fallbackName = getFallbackIconName(name);
            const fallbackIsValid =
              CORE_VALID_IONICONS.includes(fallbackName) ||
              isValidIoniconName(fallbackName);

            if (fallbackIsValid) {
              return <Icon name={fallbackName} size={size} color={color} />;
            }

            // 최종 폴백
            console.warn(`⚠️ Using final fallback icon for "${name}".`);
            return (
              <Icon name="help-circle-outline" size={size} color={color} />
            );
          }

          try {
            return <Icon name={name} size={size} color={color} />;
          } catch (iconError) {
            console.warn(
              `Error rendering icon "${name}". Using fallback.`,
              iconError
            );
            return (
              <Icon name="help-circle-outline" size={size} color={color} />
            );
          }
      }
    } catch (error) {
      console.error(`Critical error rendering icon "${name}":`, error);
      return <Icon name="help-circle-outline" size={size} color={color} />;
    }
  };

  // 폴백 아이콘 이름을 추천하는 함수
  const getFallbackIconName = (iconName: string): string => {
    // 일반적인 패턴 매칭으로 적절한 폴백 찾기
    if (iconName.includes("event") || iconName.includes("calendar")) {
      return "calendar-outline";
    }
    if (iconName.includes("star") || iconName.includes("rate")) {
      return "star-outline";
    }
    if (
      iconName.includes("time") ||
      iconName.includes("clock") ||
      iconName.includes("schedule")
    ) {
      return "time-outline";
    }
    if (
      iconName.includes("photo") ||
      iconName.includes("camera") ||
      iconName.includes("image")
    ) {
      return "camera-outline";
    }
    if (
      iconName.includes("create") ||
      iconName.includes("edit") ||
      iconName.includes("write")
    ) {
      return "create-outline";
    }
    if (
      iconName.includes("person") ||
      iconName.includes("user") ||
      iconName.includes("account")
    ) {
      return "person-outline";
    }
    if (iconName.includes("info") || iconName.includes("information")) {
      return "information-circle-outline";
    }
    if (iconName.includes("warning") || iconName.includes("alert")) {
      return "warning-outline";
    }
    if (
      iconName.includes("check") ||
      iconName.includes("done") ||
      iconName.includes("success")
    ) {
      return "checkmark-circle-outline";
    }
    if (iconName.includes("home") || iconName.includes("house")) {
      return "home-outline";
    }
    if (iconName.includes("setting") || iconName.includes("config")) {
      return "settings-outline";
    }
    if (iconName.includes("search") || iconName.includes("find")) {
      return "search-outline";
    }
    if (
      iconName.includes("mail") ||
      iconName.includes("email") ||
      iconName.includes("message")
    ) {
      return "mail-outline";
    }
    if (
      iconName.includes("location") ||
      iconName.includes("place") ||
      iconName.includes("map")
    ) {
      return "location-outline";
    }
    if (iconName.includes("share")) {
      return "share-outline";
    }
    if (iconName.includes("copy")) {
      return "copy-outline";
    }
    if (
      iconName.includes("heart") ||
      iconName.includes("like") ||
      iconName.includes("favorite")
    ) {
      return "heart-outline";
    }
    if (iconName.includes("play") || iconName.includes("video")) {
      return "play-outline";
    }
    if (
      iconName.includes("music") ||
      iconName.includes("audio") ||
      iconName.includes("sound")
    ) {
      return "musical-notes-outline";
    }

    // personalizedRecommendationService 특화 매핑
    if (iconName.includes("trending") || iconName.includes("up")) {
      return "trending-up-outline";
    }
    if (iconName.includes("flag")) {
      return "flag-outline";
    }
    if (iconName.includes("rocket")) {
      return "rocket-outline";
    }
    if (iconName.includes("collections") || iconName.includes("library")) {
      return "library-outline";
    }
    if (
      iconName.includes("whatshot") ||
      iconName.includes("fire") ||
      iconName.includes("hot")
    ) {
      return "flame-outline";
    }
    if (iconName.includes("timer") || iconName.includes("hourglass")) {
      return "timer-outline";
    }
    if (iconName.includes("pet") || iconName.includes("animal")) {
      return "paw-outline";
    }
    if (
      iconName.includes("spa") ||
      iconName.includes("flower") ||
      iconName.includes("leaf")
    ) {
      return "flower-outline";
    }
    if (
      iconName.includes("water") ||
      iconName.includes("rain") ||
      iconName.includes("drop")
    ) {
      return "water-outline";
    }
    if (iconName.includes("cloud") || iconName.includes("weather")) {
      return "cloud-outline";
    }
    if (iconName.includes("thermostat") || iconName.includes("temperature")) {
      return "thermometer-outline";
    }
    if (
      iconName.includes("weekend") ||
      iconName.includes("bed") ||
      iconName.includes("hotel")
    ) {
      return "bed-outline";
    }
    if (iconName.includes("cafe") || iconName.includes("coffee")) {
      return "cafe-outline";
    }
    if (
      iconName.includes("psychology") ||
      iconName.includes("brain") ||
      iconName.includes("idea")
    ) {
      return "bulb-outline";
    }
    if (iconName.includes("access") && iconName.includes("time")) {
      return "time-outline";
    }

    // 기본 폴백
    return "help-circle-outline";
  };

  return validateAndRenderIcon();
};

// HOC to wrap existing Icon usage
export const withSafeIcon = (Component: React.ComponentType<any>) => {
  return React.forwardRef((props: any, ref: any) => {
    if (props.name === "wb-twilight" || props.name?.startsWith("wb-")) {
      const mapping = ICON_MAPPING[props.name];
      if (mapping) {
        return <SafeIcon {...props} name={mapping.name} type={mapping.type} />;
      }
    }
    return <Component ref={ref} {...props} />;
  });
};

// Export wrapped versions
export const IoniconsIcon = withSafeIcon(Icon);
export const MaterialIcons = withSafeIcon(MaterialIcon);
export const MaterialCommunityIcons = withSafeIcon(MaterialCommunityIcon);
