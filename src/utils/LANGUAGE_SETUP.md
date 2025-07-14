// Android의 경우 MainApplication.java에 다음 코드 추가 필요:
/*
import com.reactcommunity.rnlocalize.RNLocalizePackage;

@Override
protected List<ReactPackage> getPackages() {
  return Arrays.<ReactPackage>asList(
    new MainReactPackage(),
    new RNLocalizePackage() // 이미 있어야 함
  );
}
*/

// iOS의 경우 Info.plist에 다음 추가:
/*
<key>CFBundleDevelopmentRegion</key>
<string>ko</string>
<key>CFBundleLocalizations</key>
<array>
  <string>ko</string>
  <string>en</string>
</array>
*/

// 사용법:
// 1. deviceLanguage.ts의 FORCE_KOREAN을 false로 변경
// 2. 디바이스 설정 > 언어에서 한국어/영어 변경
// 3. 앱 재시작하여 언어별 트렌드 확인
