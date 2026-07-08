import { JiraBoard, JiraIssue, BoardItemsResponse } from '../schemas/jiraSchemas'

export class JiraService {
  private baseUrl: string
  private email: string
  private apiToken: string

  constructor(domain: string, email: string, apiToken: string) {
    const normalizedDomain = this.normalizeDomain(domain)
    this.baseUrl = `https://${normalizedDomain}/rest/agile/1.0`
    this.email = email
    this.apiToken = apiToken
  }

  private normalizeDomain(domain: string): string {
    const trimmed = domain.trim()

    try {
      if (/^https?:\/\//i.test(trimmed)) {
        return new URL(trimmed).hostname
      }

      return new URL(`https://${trimmed}`).hostname
    } catch {
      return trimmed.replace(/^https?:\/\//i, '').replace(/\/$/, '')
    }
  }

  private getAuthHeader(): string {
    const credentials = `${this.email}:${this.apiToken}`
    const encoded = Buffer.from(credentials).toString('base64')
    return `Basic ${encoded}`
  }

  async getBoards(): Promise<JiraBoard[]> {
    const endpoint = `${this.baseUrl}/board?maxResults=100`

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (response.status === 401 || response.status === 403) {
          throw new Error('JIRA authentication failed. Please verify your email and API token.')
        }
        throw new Error(`JIRA API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json() as any
      const boards = data.values || []

      return boards.map((board: any) => ({
        id: board.id,
        key: board.location?.projectKey || board.key || null,
        name: board.location?.name || board.name,
        locationName: board.location?.name || null,
        projectKey: board.location?.projectKey || null,
        type: board.type || board.location?.type || null
      }))
    } catch (error) {
      console.error('Error fetching JIRA boards:', error)
      throw error
    }
  }

  async getBoardItems(boardId: string): Promise<JiraIssue[]> {
    const endpoint = `${this.baseUrl}/board/${boardId}/issue?maxResults=100`

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (response.status === 401 || response.status === 403) {
          throw new Error('JIRA authentication failed. Please verify your email and API token.')
        }
        throw new Error(`JIRA API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json() as any
      const issues = data.issues || []

      return issues.map((issue: any) => ({
        key: issue.key,
        id: issue.id,
        fields: {
          summary: issue.fields?.summary || '',
          customfield_10083: issue.fields?.customfield_10083 || null,
          customfield_10082: issue.fields?.customfield_10082 || null,
          description: issue.fields?.description || null
        }
      }))
    } catch (error) {
      console.error('Error fetching JIRA board items:', error)
      throw error
    }
  }

  async getIssueDetails(issueKey: string): Promise<JiraIssue> {
    const normalizedDomain = this.baseUrl.split('/rest/')[0]
    const endpoint = `${normalizedDomain}/rest/api/2/issue/${issueKey}`

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': this.getAuthHeader()
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (response.status === 401 || response.status === 403) {
          throw new Error('JIRA authentication failed. Please verify your email and API token.')
        }
        throw new Error(`JIRA API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const issue = await response.json() as any

      return {
        key: issue.key,
        id: issue.id,
        fields: {
          summary: issue.fields?.summary || '',
          customfield_10083: issue.fields?.customfield_10083 || null,
          customfield_10082: issue.fields?.customfield_10082 || null,
          description: issue.fields?.description || null
        }
      }
    } catch (error) {
      console.error('Error fetching JIRA issue details:', error)
      throw error
    }
  }
}
