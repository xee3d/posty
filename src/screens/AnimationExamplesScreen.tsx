import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import AnimatedWrapper from '../components/AnimatedWrapper';
import { useAnimatedTransition, useListItemAnimation } from '../hooks/useAnimatedTransition';

const AnimationExamplesScreen = () => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);

  // 제스처 애니메이션
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = e.scale;
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateY.value = withSpring(0);
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const gestureStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  // 반복 애니메이션
  const startRepeatAnimation = () => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(180, { duration: 500 }),
        withTiming(360, { duration: 500 })
      ),
      -1,
      true
    );
  };

  const stopAnimation = () => {
    rotation.value = withTiming(0);
  };

  // 커스텀 훅 사용 예시
  const { fadeStyle, slideInStyle, scaleStyle } = useAnimatedTransition(true);

  const listData = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Reanimated 3 Examples</Text>

        {/* 제스처 애니메이션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gesture Animation</Text>
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.box, gestureStyle]}>
              <Text style={styles.boxText}>Pinch & Pan</Text>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* 반복 애니메이션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Repeat Animation</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={startRepeatAnimation}>
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={stopAnimation}>
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AnimatedWrapper 사용 예시 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AnimatedWrapper Examples</Text>
          
          <AnimatedWrapper animation="fade" delay={0}>
            <View style={styles.animatedBox}>
              <Text>Fade Animation</Text>
            </View>
          </AnimatedWrapper>

          <AnimatedWrapper animation="slide" delay={100}>
            <View style={styles.animatedBox}>
              <Text>Slide Animation</Text>
            </View>
          </AnimatedWrapper>

          <AnimatedWrapper animation="scale" delay={200}>
            <View style={styles.animatedBox}>
              <Text>Scale Animation</Text>
            </View>
          </AnimatedWrapper>

          <AnimatedWrapper animation="bounce" delay={300}>
            <View style={styles.animatedBox}>
              <Text>Bounce Animation</Text>
            </View>
          </AnimatedWrapper>
        </View>

        {/* 리스트 애니메이션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>List Animation</Text>
          {listData.map((item, index) => (
            <ListItem key={index} item={item} index={index} />
          ))}
        </View>

        {/* 커스텀 훅 애니메이션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Hook Animations</Text>
          
          <Animated.View style={[styles.animatedBox, fadeStyle]}>
            <Text>Fade Style</Text>
          </Animated.View>

          <Animated.View style={[styles.animatedBox, slideInStyle]}>
            <Text>Slide In Style</Text>
          </Animated.View>

          <Animated.View style={[styles.animatedBox, scaleStyle]}>
            <Text>Scale Style</Text>
          </Animated.View>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

// 리스트 아이템 컴포넌트
const ListItem: React.FC<{ item: string; index: number }> = ({ item, index }) => {
  const animatedStyle = useListItemAnimation(index, true);

  return (
    <Animated.View style={[styles.listItem, animatedStyle]}>
      <Text>{item}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  box: {
    width: 150,
    height: 150,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 10,
  },
  boxText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  animatedBox: {
    backgroundColor: '#e74c3c',
    padding: 20,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  listItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default AnimationExamplesScreen;
