export interface IMessageRequest {
  rolePrompt: string
  commandPrompt: string
  signal?: AbortSignal
  onMessage: (message: { content: string; isFinished: boolean }) => void
  onFinished: (reason: string) => void
  onError: (error: Error) => void
  onStatusCode?: (statusCode: number) => void
}

export abstract class AbstractEngine {
  abstract getAPIKey(): string
  abstract getAPIURL(): string
  abstract getAPIModel(): string
  abstract getAPIURLPath(): string
  abstract getTargetLanguage(): string

  // This method is implemented in child classes
  abstract sendMessage(req: IMessageRequest): Promise<void>
}
