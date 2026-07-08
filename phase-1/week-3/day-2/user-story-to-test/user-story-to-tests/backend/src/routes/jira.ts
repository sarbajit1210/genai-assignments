import express from 'express'
import { JiraService } from '../services/jiraService'
import { 
  BoardRequestSchema, 
  BoardItemsRequestSchema,
  IssueDetailsRequestSchema
} from '../schemas/jiraSchemas'

export const jiraRouter = express.Router()

jiraRouter.post('/boards', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = BoardRequestSchema.safeParse(req.body)

    if (!validationResult.success) {
      res.status(400).json({
        error: `Validation error: ${validationResult.error.message}`
      })
      return
    }

    const { domain, email, apiToken } = validationResult.data

    try {
      const jiraService = new JiraService(domain, email, apiToken)
      const boards = await jiraService.getBoards()

      res.json({
        success: true,
        boards
      })
    } catch (jiraError) {
      console.error('JIRA API error:', jiraError)
      res.status(502).json({
        error: jiraError instanceof Error ? jiraError.message : 'Failed to fetch boards from JIRA'
      })
      return
    }
  } catch (error) {
    console.error('Error in boards route:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

jiraRouter.post('/board-items', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = BoardItemsRequestSchema.safeParse(req.body)

    if (!validationResult.success) {
      res.status(400).json({
        error: `Validation error: ${validationResult.error.message}`
      })
      return
    }

    const { domain, email, apiToken, boardId } = validationResult.data

    try {
      const jiraService = new JiraService(domain, email, apiToken)
      const items = await jiraService.getBoardItems(boardId)

      res.json({
        success: true,
        items
      })
    } catch (jiraError) {
      console.error('JIRA API error:', jiraError)
      res.status(502).json({
        error: jiraError instanceof Error ? jiraError.message : 'Failed to fetch board items from JIRA'
      })
      return
    }
  } catch (error) {
    console.error('Error in board-items route:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

jiraRouter.post('/issue-details', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = IssueDetailsRequestSchema.safeParse(req.body)

    if (!validationResult.success) {
      res.status(400).json({
        error: `Validation error: ${validationResult.error.message}`
      })
      return
    }

    const { domain, email, apiToken, issueKey } = validationResult.data

    try {
      const jiraService = new JiraService(domain, email, apiToken)
      const issue = await jiraService.getIssueDetails(issueKey)

      res.json({
        success: true,
        issue
      })
    } catch (jiraError) {
      console.error('JIRA API error:', jiraError)
      res.status(502).json({
        error: jiraError instanceof Error ? jiraError.message : 'Failed to fetch issue details from JIRA'
      })
      return
    }
  } catch (error) {
    console.error('Error in issue-details route:', error)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
})
