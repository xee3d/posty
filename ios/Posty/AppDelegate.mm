#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>
#import <NaverThirdPartyLogin/NaverThirdPartyLoginConnection.h>
#import <RNKakaoLogins/RNKakaoLogins.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Firebase 초기화
  [FIRApp configure];
  
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
  
  return [super application:application openURL:url options:options];
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
