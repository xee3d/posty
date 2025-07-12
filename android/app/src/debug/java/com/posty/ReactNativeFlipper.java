/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * <p>This source code is licensed under the MIT license found in the LICENSE file in the root
 * directory of this source tree.
 */
package com.posty;

import android.content.Context;
import com.facebook.react.ReactInstanceManager;

/**
 * Class responsible of loading Flipper inside your React Native application. This is the debug
 * flavor of it. In React Native 0.74.5, Flipper is no longer supported.
 */
public class ReactNativeFlipper {
  public static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {
    // Flipper is no longer supported in React Native 0.74.5
    // Use native debugging tools in Android Studio instead
  }
}
