import qrcode
import subprocess
import re
import os
import sys

def install_required_packages():
    """필요한 패키지 설치"""
    required_packages = ['qrcode', 'pillow']
    for package in required_packages:
        try:
            __import__(package if package != 'pillow' else 'PIL')
        except ImportError:
            print(f"{package} 설치 중...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def get_wifi_info():
    """현재 연결된 WiFi 정보 가져오기"""
    try:
        # WiFi SSID 가져오기
        result = subprocess.run(['netsh', 'wlan', 'show', 'interfaces'], 
                              capture_output=True, text=True, encoding='cp949')
        ssid_match = re.search(r'SSID\s+:\s+(.+)', result.stdout)
        ssid = ssid_match.group(1).strip() if ssid_match else None
        
        # WiFi 비밀번호 가져오기 (저장된 경우)
        if ssid:
            profile_result = subprocess.run(['netsh', 'wlan', 'show', 'profile', ssid, 'key=clear'], 
                                          capture_output=True, text=True, encoding='cp949')
            key_match = re.search(r'Key Content\s+:\s+(.+)', profile_result.stdout)
            password = key_match.group(1).strip() if key_match else None
        else:
            password = None
            
        return ssid, password
    except Exception as e:
        print(f"WiFi 정보 가져오기 실패: {e}")
        return None, None

def get_pc_ip():
    """PC IP 주소 가져오기"""
    try:
        result = subprocess.run(['ipconfig'], capture_output=True, text=True, encoding='cp949')
        # IPv4 주소 찾기 (더 정확한 패턴)
        for line in result.stdout.split('\n'):
            if 'IPv4' in line and '192.168' in line:
                ip_match = re.search(r'192\.168\.\d+\.\d+', line)
                if ip_match:
                    return ip_match.group(0)
        return None
    except Exception as e:
        print(f"IP 주소 가져오기 실패: {e}")
        return None

def generate_wireless_qr():
    """무선 디버깅 QR 코드 생성"""
    print("╔══════════════════════════════════════════╗")
    print("║    Wireless Debugging QR Generator       ║")
    print("╚══════════════════════════════════════════╝")
    print()
    
    # 자동 감지
    ssid, password = get_wifi_info()
    pc_ip = get_pc_ip()
    
    print("현재 네트워크 정보:")
    print(f"- WiFi SSID: {ssid if ssid else '감지 실패'}")
    print(f"- PC IP: {pc_ip if pc_ip else '감지 실패'}")
    print()
    
    # 사용자 입력
    if ssid:
        user_ssid = input(f"WiFi SSID [{ssid}]: ") or ssid
    else:
        user_ssid = input("WiFi SSID를 입력하세요: ")
    
    if password:
        user_password = input(f"WiFi 비밀번호 [***]: ") or password
    else:
        user_password = input("WiFi 비밀번호를 입력하세요: ")
    
    if pc_ip:
        user_ip = input(f"PC IP 주소 [{pc_ip}]: ") or pc_ip
    else:
        user_ip = input("PC IP 주소를 입력하세요 (예: 192.168.1.100): ")
    
    print("\n휴대폰의 무선 디버깅 설정에서:")
    print("1. '개발자 옵션' → '무선 디버깅' 활성화")
    print("2. 'QR 코드로 기기 페어링' 탭")
    print("3. 표시된 포트와 페어링 코드를 아래에 입력")
    print()
    
    port = input("페어링 포트 번호: ")
    pair_code = input("6자리 페어링 코드: ")
    
    # QR 데이터 생성
    qr_data = f"WIFI:T:ADB;S:{user_ssid};P:{user_password};H:{user_ip}:{port};C:{pair_code};;"
    
    # QR 코드 생성
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    # 이미지 저장
    img = qr.make_image(fill_color="black", back_color="white")
    filename = "wireless_debugging_qr.png"
    img.save(filename)
    
    print(f"\n✅ QR 코드가 저장되었습니다: {filename}")
    print("\n다음 단계:")
    print("1. 휴대폰에서 '개발자 옵션' → '무선 디버깅' 이동")
    print("2. 'QR 코드로 기기 페어링' 탭")
    print("3. 생성된 QR 코드 스캔")
    print()
    
    # 이미지 열기
    try:
        os.startfile(filename)
        print("QR 코드 이미지가 열렸습니다.")
    except:
        print("QR 코드 이미지를 수동으로 열어주세요.")

if __name__ == "__main__":
    try:
        # 필요한 패키지 설치
        install_required_packages()
        
        # QR 생성기 실행
        generate_wireless_qr()
        
        input("\n종료하려면 Enter를 누르세요...")
    except Exception as e:
        print(f"\n오류 발생: {e}")
        input("\n종료하려면 Enter를 누르세요...")
