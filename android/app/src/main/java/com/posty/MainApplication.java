package com.posty;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import java.util.List;

// Facebook Key Hash 디버깅을 위한 import
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.util.Base64;
import android.util.Log;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

// Facebook SDK import
import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    
    // Facebook SDK 초기화 (설정이 저장되지 않는 경우를 위해)
    FacebookSdk.setApplicationId("757255383655974");
    FacebookSdk.sdkInitialize(getApplicationContext());
    AppEventsLogger.activateApp(this);
    
    SoLoader.init(this, /* native exopackage */ false);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    // ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    // Flipper is no longer supported in React Native 0.74.5
    
    // Facebook Key Hash 디버깅 (개발 환경에서만)
    if (BuildConfig.DEBUG) {
      try {
        PackageInfo info = getPackageManager().getPackageInfo(
          "com.posty",
          PackageManager.GET_SIGNATURES
        );
        for (Signature signature : info.signatures) {
          MessageDigest md = MessageDigest.getInstance("SHA");
          md.update(signature.toByteArray());
          String keyHash = Base64.encodeToString(md.digest(), Base64.DEFAULT);
          Log.d("FacebookKeyHash", "KeyHash: " + keyHash.trim());
        }
      } catch (PackageManager.NameNotFoundException e) {
        Log.e("FacebookKeyHash", "Package not found", e);
      } catch (NoSuchAlgorithmException e) {
        Log.e("FacebookKeyHash", "Algorithm not found", e);
      }
    }
  }
}
