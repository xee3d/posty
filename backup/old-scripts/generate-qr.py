import qrcode
import subprocess
import re
import os

def get_wifi_info():
    """현재 연결된 WiFi 정보 가져오기"""
    try:
        # WiFi SSID 가져오기
        result = subprocess.run(['netsh', 'wlan', 'show', 'interfaces'], 
                              capture_output=True, text=True)
        ssid_match = re.search(r'SSID\s+:\s+(.+)', result.stdout)
        ssid = ssid_match.group(1).strip() if ssid_match else None
        
        # WiFi 비밀번호 가져오기 (저장된 경우)
        if ssid:
            profile_result = subprocess.run(['netsh', 'wlan', 'show', 'profile', ssid, 'key=clear'], 
                                          capture_output=True, text=True)
            key_match = re.search(r'Key Content\s+:\s+(.+)', profile_result.stdout)
            password = key_match.group(1).strip() if key_match else None
        else:
            password = None
            
        return ssid, password
    except:
        return None, None

def get_pc_ip():
    """PC IP 주소 가져오기"""
    try:
        result = subprocess.run(['ipconfig'], capture_output=True, text=True)
        ip_match = re.search(r'IPv4.*?:\s+(192\.168\.\d+\.\d+)', result.stdout)
        return ip_match.group(1) if ip_match else None
    except:
        return None

def generate_wireless_qr():
    """무선 디버깅 QR 코드 생성"""
    print("=== Wireless Debugging QR Generator ===\n")
    
    # 자동 감지
    ssid, password = get_wifi_info()
    pc_ip = get_pc_ip()
    
    # 사용자 입력
    if ssid:
        user_ssid = input(f"WiFi SSID [{ssid}]: ") or ssid
    else:
        user_ssid = input("WiFi SSID: ")
    
    if password:
        user_password = input(f"WiFi Password [***]: ") or password
    else:
        user_password = input("WiFi Password: ")
    
    if pc_ip:
        user_ip = input(f"PC IP Address [{pc_ip}]: ") or pc_ip
    else:
        user_ip = input("PC IP Address: ")
    
    port = input("Pairing Port (from phone): ")
    pair_code = input("6-digit Pairing Code: ")
    
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
    
    print(f"\n✅ QR code saved as: {filename}")
    print("\nNow on your phone:")
    print("1. Go to Developer options → Wireless debugging")
    print("2. Tap 'Pair device with QR code'")
    print("3. Scan the generated QR code")
    
    # 이미지 열기
    os.startfile(filename)

if __name__ == "__main__":
    # 필요한 패키지 설치 확인
    try:
        import qrcode
    except ImportError:
        print("Installing required package...")
        subprocess.run(['pip', 'install', 'qrcode[pil]'])
        import qrcode
    
    generate_wireless_qr()