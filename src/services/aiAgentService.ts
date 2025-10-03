import AsyncStorage from "@react-native-async-storage/async-storage";
import { AIAgent } from "../components/settings/AIAgentSettings";

const AI_AGENT_STORAGE_KEY = "@ai_agent_preference";

class AIAgentService {
  private static instance: AIAgentService;
  private currentAgent: AIAgent = "gpt-mini";

  private constructor() {
    this.loadAIAgent();
  }

  public static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService();
    }
    return AIAgentService.instance;
  }

  // AI 에이전트 로드
  private async loadAIAgent(): Promise<void> {
    try {
      const savedAgent = await AsyncStorage.getItem(AI_AGENT_STORAGE_KEY);
      if (savedAgent && (savedAgent === "gpt-mini" || savedAgent === "gemini")) {
        this.currentAgent = savedAgent as AIAgent;
      }
    } catch (error) {
      console.error("Failed to load AI agent:", error);
    }
  }

  // 현재 AI 에이전트 가져오기
  public async getCurrentAIAgent(): Promise<AIAgent> {
    await this.loadAIAgent(); // 최신 설정 로드
    return this.currentAgent;
  }

  // AI 에이전트 설정
  public async setAIAgent(agent: AIAgent): Promise<void> {
    try {
      await AsyncStorage.setItem(AI_AGENT_STORAGE_KEY, agent);
      this.currentAgent = agent;
      console.log(`AI Agent changed to: ${agent}`);
    } catch (error) {
      console.error("Failed to save AI agent:", error);
      throw error;
    }
  }

  // AI 에이전트를 서버 모델명으로 변환
  public getModelName(agent: AIAgent): string {
    switch (agent) {
      case "gpt-mini":
        return "gpt-4o-mini";
      case "gemini":
        return "gemini-2.5-flash-lite";
      default:
        // 폴백 없음 - 명시적으로 설정된 모델만 사용
        console.warn(`[AIAgentService] Unknown agent: ${agent}, using as-is`);
        return agent;
    }
  }

  // 현재 에이전트의 모델명 가져오기
  public async getCurrentModelName(): Promise<string> {
    const agent = await this.getCurrentAIAgent();
    const modelName = this.getModelName(agent);
    console.log(`[AIAgentService] Current agent: ${agent} → Model: ${modelName}`);
    return modelName;
  }
}

export default AIAgentService.getInstance();
