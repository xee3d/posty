import os
import re
import json
from pathlib import Path

# 한국어 텍스트 패턴
korean_pattern = re.compile(r'''['"`]([^'"`]*[가-힣]+[^'"`]*)['"`]''')

# 제외할 디렉토리
exclude_dirs = {
    'node_modules', '.git', 'android', 'ios', '__tests__', 
    'locales', '.svn', 'temp', 'logs', 'docs'
}

# 제외할 파일
exclude_files = {'textConstants.ts', 'promptUtils.ts'}

# 결과 저장
extracted_texts = {}

def find_korean_texts(root_dir):
    """디렉토리를 순회하며 한국어 텍스트 찾기"""
    root_path = Path(root_dir)
    
    for file_path in root_path.rglob('*'):
        # 제외 디렉토리 체크
        if any(exclude in file_path.parts for exclude in exclude_dirs):
            continue
            
        # TypeScript/React 파일만 검사
        if file_path.suffix in ['.ts', '.tsx'] and file_path.name not in exclude_files:
            extract_from_file(file_path, root_path)

def extract_from_file(file_path, root_path):
    """파일에서 한국어 텍스트 추출"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        matches = korean_pattern.findall(content)
        
        if matches:
            relative_path = str(file_path.relative_to(root_path))
            extracted_texts[relative_path] = []
            
            for match in matches:
                # 줄 번호 찾기
                line_num = content[:content.find(match)].count('\n') + 1
                
                # 컨텍스트 추출
                context = extract_context(content, match)
                
                extracted_texts[relative_path].append({
                    'text': match,
                    'line': line_num,
                    'type': categorize_text(context)
                })
                
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

def extract_context(content, text):
    """텍스트 주변 컨텍스트 추출"""
    index = content.find(text)
    start = max(0, index - 100)
    end = min(len(content), index + 100)
    return content[start:end].replace('\n', ' ').strip()

def categorize_text(context):
    """텍스트 유형 분류"""
    if 'Alert.alert' in context:
        return 'alert'
    elif 'Button' in context or 'TouchableOpacity' in context:
        return 'button'
    elif 'title' in context.lower() or 'Title' in context:
        return 'title'
    elif 'placeholder' in context:
        return 'placeholder'
    elif 'Text>' in context:
        return 'text'
    else:
        return 'other'

def generate_report():
    """분석 리포트 생성"""
    total_files = len(extracted_texts)
    total_texts = sum(len(texts) for texts in extracted_texts.values())
    
    # 카테고리별 분류
    categories = {}
    for file, texts in extracted_texts.items():
        for text_info in texts:
            category = text_info['type']
            if category not in categories:
                categories[category] = []
            categories[category].append({
                'text': text_info['text'],
                'file': file,
                'line': text_info['line']
            })
    
    report = {
        'summary': {
            'total_files': total_files,
            'total_texts': total_texts,
            'by_category': {cat: len(texts) for cat, texts in categories.items()}
        },
        'categories': categories,
        'files': extracted_texts
    }
    
    return report

# 실행
print("🔍 하드코딩된 한국어 텍스트 검색 중...")
find_korean_texts('./src')

# 리포트 생성
report = generate_report()

# 결과 저장
with open('hardcoded-korean-texts.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

# 요약 출력
print(f"\n✅ 검색 완료!")
print(f"📊 총 {report['summary']['total_files']}개 파일에서 {report['summary']['total_texts']}개의 한국어 텍스트 발견")
print(f"\n📝 카테고리별 분류:")
for category, count in report['summary']['by_category'].items():
    print(f"  - {category}: {count}개")

# 주요 텍스트 샘플 출력
print(f"\n📌 주요 발견 사항:")
for category, texts in report['categories'].items():
    if texts:
        print(f"\n[{category.upper()}]")
        for text in texts[:3]:  # 각 카테고리별 상위 3개만
            print(f"  - \"{text['text']}\" ({text['file']}:{text['line']})")
