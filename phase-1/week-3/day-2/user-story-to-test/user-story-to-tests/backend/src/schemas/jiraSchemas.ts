import { z } from 'zod'

export const JiraCredentialsSchema = z.object({
  domain: z.string().min(1, 'JIRA domain is required'),
  email: z.string().email('Valid email is required'),
  apiToken: z.string().min(1, 'API token is required')
})

export const BoardRequestSchema = z.object({
  domain: z.string().min(1, 'JIRA domain is required'),
  email: z.string().email('Valid email is required'),
  apiToken: z.string().min(1, 'API token is required')
})

export const BoardItemsRequestSchema = z.object({
  domain: z.string().min(1, 'JIRA domain is required'),
  email: z.string().email('Valid email is required'),
  apiToken: z.string().min(1, 'API token is required'),
  boardId: z.string().min(1, 'Board ID is required')
})

export const IssueDetailsRequestSchema = z.object({
  domain: z.string().min(1, 'JIRA domain is required'),
  email: z.string().email('Valid email is required'),
  apiToken: z.string().min(1, 'API token is required'),
  issueKey: z.string().min(1, 'Issue key is required')
})

// Response schemas from JIRA API
export const JiraBoardSchema = z.object({
  id: z.number(),
  key: z.string().nullable().optional(),
  name: z.string(),
  type: z.string().nullable().optional(),
  location: z.any().optional()
})

export const JiraIssueSchema = z.object({
  key: z.string(),
  id: z.string(),
  fields: z.object({
    summary: z.string(),
    customfield_10083: z.string().nullable().optional(),
    customfield_10082: z.string().nullable().optional(),
    description: z.any().nullable().optional()
  }).passthrough()
})

export const BoardItemsResponseSchema = z.object({
  issues: z.array(JiraIssueSchema)
})

// Type exports
export type JiraCredentials = z.infer<typeof JiraCredentialsSchema>
export type BoardRequest = z.infer<typeof BoardRequestSchema>
export type BoardItemsRequest = z.infer<typeof BoardItemsRequestSchema>
export type IssueDetailsRequest = z.infer<typeof IssueDetailsRequestSchema>
export type JiraBoard = z.infer<typeof JiraBoardSchema>
export type JiraIssue = z.infer<typeof JiraIssueSchema>
export type BoardItemsResponse = z.infer<typeof BoardItemsResponseSchema>
