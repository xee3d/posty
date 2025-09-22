#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <NaverThirdPartyLogin/NaverThirdPartyLoginConnection.h>
#import <RNKakaoLogins/RNKakaoLogins.h>
#import <KakaoSDKCommon/KakaoSDKCommon.h>
#import <GoogleMobileAds/GoogleMobileAds.h>
// Facebook SDK disabled for release
// #import <FBSDKCoreKit/FBSDKCoreKit-Swift.h>
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Google Mobile Ads SDK 초기화
  [[GADMobileAds sharedInstance] startWithCompletionHandler:nil];
  
  // Kakao SDK 초기화
  [KakaoSDK initSDKWithAppKey:@"566cba5c08009852b6b5f1a31c3b28d8"];
  
  // Naver Login 초기화
  [[NaverThirdPartyLoginConnection getSharedInstance] setServiceAppName:@"Posty"];
  [[NaverThirdPartyLoginConnection getSharedInstance] setConsumerKey:@"jXC0jUWPhSCotIWBrKrB"];
  [[NaverThirdPartyLoginConnection getSharedInstance] setConsumerSecret:@"RND5w7pcJt"];
  [[NaverThirdPartyLoginConnection getSharedInstance] setAppUrlScheme:@"postynaverlogin"];
  
  // Facebook SDK disabled for release
  // [[FBSDKApplicationDelegate sharedInstance] application:application didFinishLaunchingWithOptions:launchOptions];
  
  // Push Notifications 초기화
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  self.moduleName = @"Posty";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// URL Scheme 핸들링 (소셜 로그인)
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  // 카카오 로그인 URL 처리
  if([RNKakaoLogins isKakaoTalkLoginUrl:url]) {
    return [RNKakaoLogins handleOpenUrl: url];
  }
  
  // 네이버 로그인 URL 처리
  if ([url.scheme isEqualToString:@"postynaverlogin"]) {
    [[NaverThirdPartyLoginConnection getSharedInstance] application:application openURL:url options:options];
    return YES;
  }
  
  // Facebook URL 처리 disabled for release
  // if ([[FBSDKApplicationDelegate sharedInstance] application:application openURL:url options:options]) {
  //   return YES;
  // }
  
  return [super application:application openURL:url options:options];
}

// Push Notifications 관련 메서드들
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
 [RNCPushNotificationIOS didRegisterUserNotificationSettings:notificationSettings];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
 [RNCPushNotificationIOS didReceiveLocalNotification:notification];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
