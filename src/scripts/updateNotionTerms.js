const { Client } = require('@notionhq/client');
require('dotenv').config();

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 문서 ID 매핑
const PAGE_IDS = {
  'terms-ko': '26cdc2bc-e21c-81d6-b4ec-f69d2a3de8c1',      // [KO] 서비스 이용약관
  'terms-en': '26cdc2bc-e21c-815c-838f-d49eee2fcfa6',      // [EN] Terms of Service
  'terms-ja': '26cdc2bc-e21c-812a-9389-c16f4cdc2814',      // [JA] 利用規約
  'terms-zh': '26cdc2bc-e21c-81a2-99a1-f65950bf5124',      // [ZH] 服务条款
};

// AI 관련 조항 콘텐츠
const AI_CLAUSES = {
  'ko': {
    title: '제12조 (인공지능 기술 사용)',
    content: [
      '1. **AI 기술 활용**',
      '   - 본 서비스는 OpenAI의 GPT 모델을 기반으로 한 인공지능 기술을 사용하여 다음과 같은 서비스를 제공합니다:',
      '     * 콘텐츠 자동 생성',
      '     * 텍스트 개선 및 윤색',
      '     * 사진 기반 콘텐츠 생성',
      '     * 맞춤형 글쓰기 추천',
      '',
      '2. **AI 생성 콘텐츠의 특성**',
      '   - AI가 생성한 콘텐츠의 정확성, 적절성, 완전성, 저작권 침해 여부에 대해서는 보장하지 않습니다.',
      '   - 사용자는 AI 생성 콘텐츠를 참고용으로만 사용하며, 최종 사용 전 내용을 검토하고 책임져야 합니다.',
      '   - AI 생성 콘텐츠가 제3자의 권리를 침해하거나 부적절한 내용을 포함할 가능성이 있음을 인지하고 사용해야 합니다.',
      '',
      '3. **데이터 처리**',
      '   - 사용자가 입력한 텍스트, 사진 등의 데이터는 AI 서비스 제공을 위해 외부 AI 서비스 제공업체(OpenAI 등)에 전송될 수 있습니다.',
      '   - 전송되는 데이터는 서비스 제공 목적으로만 사용되며, 개인정보보호정책에 따라 처리됩니다.',
      '',
      '4. **서비스 변경**',
      '   - 회사는 AI 모델의 업데이트, 변경, 또는 서비스 개선을 위해 사전 고지 후 AI 기능을 수정할 수 있습니다.',
      '   - AI 기술의 발전에 따라 새로운 기능이 추가되거나 기존 기능이 변경될 수 있습니다.',
      '',
      '5. **면책사항**',
      '   - 회사는 AI 생성 콘텐츠로 인해 발생하는 직간접적 손해에 대해 책임지지 않습니다.',
      '   - 사용자는 AI 생성 콘텐츠 사용으로 인한 모든 법적 책임을 부담합니다.'
    ]
  },
  'en': {
    title: 'Article 12 (Use of Artificial Intelligence Technology)',
    content: [
      '1. **AI Technology Utilization**',
      '   - This service uses artificial intelligence technology based on OpenAI\'s GPT models to provide the following services:',
      '     * Automatic content generation',
      '     * Text improvement and refinement',
      '     * Photo-based content creation',
      '     * Personalized writing recommendations',
      '',
      '2. **Nature of AI-Generated Content**',
      '   - We do not guarantee the accuracy, appropriateness, completeness, or copyright compliance of AI-generated content.',
      '   - Users should use AI-generated content for reference only and must review and take responsibility for the content before final use.',
      '   - Users must acknowledge that AI-generated content may infringe on third-party rights or contain inappropriate material.',
      '',
      '3. **Data Processing**',
      '   - User-input data such as text and photos may be transmitted to external AI service providers (such as OpenAI) for AI service provision.',
      '   - Transmitted data is used only for service provision purposes and is processed in accordance with our Privacy Policy.',
      '',
      '4. **Service Changes**',
      '   - The company may modify AI functions after prior notice for AI model updates, changes, or service improvements.',
      '   - New features may be added or existing features may be changed according to AI technology developments.',
      '',
      '5. **Disclaimer**',
      '   - The company is not responsible for direct or indirect damages arising from AI-generated content.',
      '   - Users bear all legal responsibility for the use of AI-generated content.'
    ]
  },
  'ja': {
    title: '第12条（人工知能技術の使用）',
    content: [
      '1. **AI技術の活用**',
      '   - 本サービスは、OpenAIのGPTモデルをベースとした人工知能技術を使用して、以下のサービスを提供します：',
      '     * コンテンツの自動生成',
      '     * テキストの改善・推敲',
      '     * 写真ベースのコンテンツ生成',
      '     * パーソナライズされた執筆推奨',
      '',
      '2. **AI生成コンテンツの特性**',
      '   - AI生成コンテンツの正確性、適切性、完全性、著作権侵害の有無については保証いたしません。',
      '   - ユーザーはAI生成コンテンツを参考用としてのみ使用し、最終使用前に内容を確認し責任を負う必要があります。',
      '   - AI生成コンテンツが第三者の権利を侵害したり、不適切な内容を含む可能性があることを認識して使用する必要があります。',
      '',
      '3. **データ処理**',
      '   - ユーザーが入力したテキスト、写真などのデータは、AIサービス提供のため外部AIサービス提供者（OpenAI等）に送信される場合があります。',
      '   - 送信されるデータはサービス提供目的でのみ使用され、プライバシーポリシーに従って処理されます。',
      '',
      '4. **サービス変更**',
      '   - 当社は、AIモデルのアップデート、変更、またはサービス改善のため、事前通知後にAI機能を修正することができます。',
      '   - AI技術の発展に伴い、新機能が追加されたり既存機能が変更される場合があります。',
      '',
      '5. **免責事項**',
      '   - 当社は、AI生成コンテンツによって生じる直接的・間接的損害について責任を負いません。',
      '   - ユーザーは、AI生成コンテンツの使用による全ての法的責任を負担します。'
    ]
  },
  'zh': {
    title: '第12条（人工智能技术使用）',
    content: [
      '1. **AI技术应用**',
      '   - 本服务使用基于OpenAI GPT模型的人工智能技术，提供以下服务：',
      '     * 内容自动生成',
      '     * 文本改进和润色',
      '     * 基于照片的内容创作',
      '     * 个性化写作推荐',
      '',
      '2. **AI生成内容的特性**',
      '   - 我们不保证AI生成内容的准确性、适当性、完整性或版权合规性。',
      '   - 用户应仅将AI生成内容作为参考使用，在最终使用前必须审查内容并承担责任。',
      '   - 用户必须认识到AI生成内容可能侵犯第三方权利或包含不当内容。',
      '',
      '3. **数据处理**',
      '   - 用户输入的文本、照片等数据可能会传输给外部AI服务提供商（如OpenAI）以提供AI服务。',
      '   - 传输的数据仅用于服务提供目的，并根据我们的隐私政策进行处理。',
      '',
      '4. **服务变更**',
      '   - 公司可在事先通知后修改AI功能，以进行AI模型更新、变更或服务改进。',
      '   - 根据AI技术发展，可能会添加新功能或更改现有功能。',
      '',
      '5. **免责声明**',
      '   - 公司对因AI生成内容而产生的直接或间接损害不承担责任。',
      '   - 用户对使用AI生成内容承担所有法律责任。'
    ]
  }
};

// Notion 블록 생성 함수
function createNotionBlocks(language) {
  const clause = AI_CLAUSES[language];
  const blocks = [];

  // 제목 추가
  blocks.push({
    object: 'block',
    type: 'heading_2',
    heading_2: {
      rich_text: [{
        type: 'text',
        text: { content: clause.title }
      }]
    }
  });

  // 내용 추가
  clause.content.forEach(line => {
    if (line === '') {
      // 빈 줄
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: []
        }
      });
    } else {
      // 텍스트 줄
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{
            type: 'text',
            text: { content: line }
          }]
        }
      });
    }
  });

  return blocks;
}

// 특정 언어의 이용약관 업데이트
async function updateTermsForLanguage(language) {
  try {
    const pageId = PAGE_IDS[`terms-${language}`];
    if (!pageId) {
      console.error(`❌ Page ID not found for language: ${language}`);
      return false;
    }

    console.log(`📝 Updating terms for ${language.toUpperCase()}...`);

    // AI 조항 블록 생성
    const aiBlocks = createNotionBlocks(language);

    // 페이지에 블록 추가
    const response = await notion.blocks.children.append({
      block_id: pageId,
      children: [
        // 구분선 추가
        {
          object: 'block',
          type: 'divider',
          divider: {}
        },
        ...aiBlocks
      ]
    });

    console.log(`✅ Successfully updated ${language.toUpperCase()} terms`);
    return true;

  } catch (error) {
    console.error(`❌ Error updating ${language} terms:`, error.message);
    return false;
  }
}

// 모든 언어의 이용약관 업데이트
async function updateAllTerms() {
  console.log('🚀 Starting AI clauses update for all languages...');

  const languages = ['ko', 'en', 'ja', 'zh'];
  const results = [];

  for (const language of languages) {
    const success = await updateTermsForLanguage(language);
    results.push({ language, success });

    // API 요청 간격 (Rate limiting 방지)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 결과 요약
  console.log('\n📊 Update Results:');
  results.forEach(({ language, success }) => {
    const status = success ? '✅ Success' : '❌ Failed';
    console.log(`  ${language.toUpperCase()}: ${status}`);
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n🎉 ${successCount}/${results.length} languages updated successfully`);
}

// 스크립트 실행
if (require.main === module) {
  updateAllTerms().catch(console.error);
}

module.exports = {
  updateAllTerms,
  updateTermsForLanguage
};