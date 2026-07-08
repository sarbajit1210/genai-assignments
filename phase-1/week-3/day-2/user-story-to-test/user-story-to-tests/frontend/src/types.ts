export interface GenerateRequest {
  storyTitle: string
  acceptanceCriteria: string
  description?: string
  additionalInfo?: string
}

export interface TestCase {
  id: string
  title: string
  steps: string[]
  testData?: string
  expectedResult: string
  category: string
}

export interface CostBreakdown {
  inputCost: number
  outputCost: number
  totalCost: number
  currency: 'USD'
  estimated: boolean
}

export interface GenerateResponse {
  cases: TestCase[]
  model?: string
  promptTokens: number
  completionTokens: number
  cost?: CostBreakdown
}

// JIRA Types
export interface JiraCredentials {
  domain: string
  email: string
  apiToken: string
}

export interface JiraBoard {
  id: number
  key?: string | null
  name: string
  type?: string | null
  locationName?: string | null
  projectKey?: string | null
}

export interface JiraIssue {
  key: string
  id: string
  fields: {
    summary: string
    customfield_10083?: string | null
    customfield_10082?: string | null
    description?: any
  }
}

export interface BoardItem {
  serialNumber: number
  jiraId: string
  storyId: string | null
  summary: string
}