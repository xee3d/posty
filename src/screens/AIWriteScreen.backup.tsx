import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, MOLLY_MESSAGES, BRAND, CARD_THEME } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { AnimatedCard, SlideInView, FadeInView, ScaleButton } from '../components/AnimationComponents';
import GeneratedContentDisplay from '../components/GeneratedContentDisplay';
import aiService from '../services/aiService';
import Clipboard from '@react-native-clipboard/clipboard';
import { saveContent } from '../utils/storage';
import { APP_TEXT, getText } from '../utils/textConstants';
import { soundManager } from '../utils/soundManager';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  ImageLibraryOptions,
  CameraOptions,
} from 'react-native-image-picker';
import localAnalyticsService from '../services/analytics/localAnalyticsService';
import simplePostService from '../services/simplePostService';
import tokenService from '../services/subscription/tokenService';

type WriteMode = 'text' | 'photo' | 'polish';

interface AIWriteScreenProps {
  onNavigate?: (tab: string) => void;
  initialMode?: WriteMode;
  initialText?: string;
  initialHashtags?: string[];
  initialTitle?: string;
}

const AIWriteScreen: React.FC<AIWriteScreenProps> = ({ onNavigate, initialMode = 'text', initialText, initialHashtags, initialTitle }) => {
  console.log('AIWriteScreen mounted with:', { initialText, initialHashtags, initialTitle });
  const { colors, cardTheme, isDark } = useAppTheme();
  const [writeMode, setWriteMode] = useState<WriteMode>(initialMode);
  const [prompt, setPrompt] = useState(initialText || '');
  const [selectedTone, setSelectedTone] = useState('casual');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPolishOption, setSelectedPolishOption] = useState<'spelling' | 'refine' | 'improve'>('refine');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [initialHashtagsList, setInitialHashtagsList] = useState<string[]>(initialHashtags || []);
  const [imageAnalysis, setImageAnalysis] = useState<string>('');
  const [imageAnalysisResult, setImageAnalysisResult] = useState<any