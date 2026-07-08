import { GenerateRequest, GenerateResponse, JiraCredentials, JiraBoard, JiraIssue } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api'

export async function generateTests(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: GenerateResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error generating tests:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}

// JIRA API Methods
export async function fetchJiraBoards(credentials: JiraCredentials): Promise<JiraBoard[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const raw = await response.text().catch(() => '')
      let message = raw
      try {
        const parsed = JSON.parse(raw)
        message = parsed.error || raw
      } catch {
        message = raw || response.statusText || 'Unknown error'
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid JIRA credentials. Please verify your domain, email, and API token.')
      }
      throw new Error(message || `HTTP error! status: ${response.status}`)
    }

    const data: { success: boolean; boards: JiraBoard[] } = await response.json()
    return data.boards
  } catch (error) {
    console.error('Error fetching JIRA boards:', error)
    throw error instanceof Error ? error : new Error('Unable to fetch JIRA boards')
  }
}

export async function fetchBoardItems(credentials: JiraCredentials, boardId: string): Promise<JiraIssue[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/board-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...credentials, boardId }),
    })

    if (!response.ok) {
      const raw = await response.text().catch(() => '')
      let message = raw
      try {
        const parsed = JSON.parse(raw)
        message = parsed.error || raw
      } catch {
        message = raw || response.statusText || 'Unknown error'
      }
      throw new Error(message || `HTTP error! status: ${response.status}`)
    }

    const data: { success: boolean; items: JiraIssue[] } = await response.json()
    return data.items
  } catch (error) {
    console.error('Error fetching board items:', error)
    throw error instanceof Error ? error : new Error('Unable to fetch board items')
  }
}

export async function fetchIssueDetails(credentials: JiraCredentials, issueKey: string): Promise<JiraIssue> {
  try {
    const response = await fetch(`${API_BASE_URL}/jira/issue-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...credentials, issueKey }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data: { success: boolean; issue: JiraIssue } = await response.json()
    return data.issue
  } catch (error) {
    console.error('Error fetching issue details:', error)
    throw error instanceof Error ? error : new Error('Unknown error occurred')
  }
}