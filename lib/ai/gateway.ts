import { createOpenAI } from "@ai-sdk/openai"

function getProvider(): { provider: ReturnType<typeof createOpenAI>; model: string } {
  const baseURL = process.env.OPENAI_BASE_URL ?? ""
  const apiKey = process.env.OPENAI_API_KEY ?? ""
  const modelName = process.env.AI_MODEL ?? "gpt-4o-mini"

  const provider = createOpenAI({
    apiKey,
    baseURL: baseURL || undefined,
  })

  return { provider, model: modelName }
}

export function getModel() {
  const { provider, model } = getProvider()
  return provider(model)
}

export function getModelName(): string {
  return process.env.AI_MODEL ?? "gpt-4o-mini"
}

export function isAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0)
}
