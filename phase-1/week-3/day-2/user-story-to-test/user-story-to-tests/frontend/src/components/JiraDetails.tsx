import { useState } from 'react'
import { JiraCredentials, JiraBoard, BoardItem } from '../types'
import { fetchJiraBoards, fetchBoardItems, fetchIssueDetails } from '../api'

interface JiraDetailsProps {
  onNavigateToTestGenerator?: (data: { storyTitle?: string; description?: string; acceptanceCriteria?: string }) => void
}

function JiraDetails({ onNavigateToTestGenerator }: JiraDetailsProps) {
  const [currentStep, setCurrentStep] = useState<'auth' | 'boards' | 'items'>('auth')
  const [credentials, setCredentials] = useState<JiraCredentials>({
    domain: '',
    email: '',
    apiToken: ''
  })
  const [boards, setBoards] = useState<JiraBoard[]>([])
  const [items, setItems] = useState<BoardItem[]>([])
  const [selectedBoard, setSelectedBoard] = useState<JiraBoard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCredentialChange = (field: keyof JiraCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
  }

  const handleFetchBoards = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const boardsList = await fetchJiraBoards(credentials)
      setBoards(boardsList)
      setCurrentStep('boards')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch boards')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBoardSelect = async (board: JiraBoard) => {
    setIsLoading(true)
    setError(null)

    try {
      const boardItems = await fetchBoardItems(credentials, board.id.toString())
      const tableItems: BoardItem[] = boardItems.map((item, index) => ({
        serialNumber: index + 1,
        jiraId: item.key,
        storyId: item.fields.customfield_10083 || null,
        summary: item.fields.summary
      }))
      setItems(tableItems)
      setSelectedBoard(board)
      setCurrentStep('items')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch board items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchDetails = async (jiraId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const issueDetails = await fetchIssueDetails(credentials, jiraId)
      if (onNavigateToTestGenerator) {
        const getDescriptionText = (desc: any): string => {
          if (!desc) return ''
          if (typeof desc === 'string') return desc
          const texts: string[] = []
          const walk = (node: any) => {
            if (!node) return
            if (typeof node === 'string') {
              texts.push(node)
              return
            }
            if (Array.isArray(node)) {
              node.forEach(walk)
              return
            }
            if (node.type === 'text' && typeof node.text === 'string') {
              texts.push(node.text)
              return
            }
            if (node.content) {
              walk(node.content)
            }
            if (node.text && typeof node.text === 'string') {
              texts.push(node.text)
            }
          }

          walk(desc.content || desc)
          return texts.join('\n')
        }

        const cf10083 = issueDetails.fields.customfield_10083 || ''
        const summary = issueDetails.fields.summary || ''
        const storyTitle = cf10083 ? `${cf10083} - ${summary}` : summary
        const description = getDescriptionText(issueDetails.fields.description)
        const acceptanceCriteria = issueDetails.fields.customfield_10082 || ''

        onNavigateToTestGenerator({
          storyTitle,
          description,
          acceptanceCriteria
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issue details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToBoards = () => {
    setCurrentStep('boards')
    setSelectedBoard(null)
    setItems([])
  }

  const handleBackToAuth = () => {
    setCurrentStep('auth')
    setBoards([])
    setItems([])
    setSelectedBoard(null)
  }

  return (
    <div>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background-color: #f5f5f5;
          color: #333;
          line-height: 1.6;
        }

        .container {
          max-width: 95%;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
        }

        @media (min-width: 768px) {
          .container {
            max-width: 90%;
            padding: 30px;
          }
        }

        @media (min-width: 1024px) {
          .container {
            max-width: 85%;
            padding: 40px;
          }
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
        }

        .title {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .subtitle {
          color: #666;
          font-size: 1.1rem;
        }

        .breadcrumb {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #666;
        }

        .breadcrumb-item {
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .breadcrumb-item:hover:not(.disabled) {
          background-color: #e0e0e0;
        }

        .breadcrumb-item.disabled {
          cursor: not-allowed;
          color: #999;
        }

        .breadcrumb-item.active {
          background-color: #3498db;
          color: white;
        }

        .form-container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c3e50;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3498db;
        }

        .submit-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: #2980b9;
        }

        .submit-btn:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .secondary-btn {
          background: #95a5a6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .secondary-btn:hover {
          background: #7f8c8d;
        }

        .error-banner {
          background: #e74c3c;
          color: white;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
          font-size: 18px;
        }

        .boards-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .board-card {
          background: white;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .board-card:hover {
          border-color: #3498db;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
          transform: translateY(-2px);
        }

        .board-name {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .board-key {
          color: #666;
          font-size: 14px;
        }

        .board-type {
          display: inline-block;
          background: #ecf0f1;
          color: #2c3e50;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-top: 10px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .items-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .items-title {
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;
        }

        .table-container {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 20px;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
        }

        .items-table th,
        .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e1e8ed;
        }

        .items-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        .items-table tr:hover {
          background: #f8f9fa;
        }

        .fetch-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .fetch-btn:hover {
          background: #229954;
        }

        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1 className="title">JIRA Board Manager</h1>
          <p className="subtitle">Connect to JIRA and manage your boards</p>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="breadcrumb">
          <div className={`breadcrumb-item ${currentStep === 'auth' ? 'active' : ''}`} onClick={handleBackToAuth}>
            1. Authentication
          </div>
          <span>→</span>
          <div className={`breadcrumb-item ${currentStep === 'boards' ? 'active' : ''} ${boards.length === 0 ? 'disabled' : ''}`} onClick={currentStep === 'boards' || currentStep === 'items' ? handleBackToAuth : undefined}>
            2. Select Board
          </div>
          <span>→</span>
          <div className={`breadcrumb-item ${currentStep === 'items' ? 'active' : ''} ${items.length === 0 ? 'disabled' : ''}`}>
            3. View Items
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {isLoading && <div className="loading">Loading...</div>}

        {/* Step 1: Authentication Form */}
        {currentStep === 'auth' && !isLoading && (
          <div className="form-container">
            <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>JIRA Configuration</h2>
            <form onSubmit={handleFetchBoards}>
              <div className="form-group">
                <label htmlFor="domain" className="form-label">
                  JIRA Domain *
                </label>
                <input
                  type="text"
                  id="domain"
                  className="form-input"
                  value={credentials.domain}
                  onChange={(e) => handleCredentialChange('domain', e.target.value)}
                  placeholder="e.g., sarbajit1210.atlassian.net or https://sarbajit1210.atlassian.net"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  value={credentials.email}
                  onChange={(e) => handleCredentialChange('email', e.target.value)}
                  placeholder="e.g., your-email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apiToken" className="form-label">
                  API Token *
                </label>
                <input
                  type="password"
                  id="apiToken"
                  className="form-input"
                  value={credentials.apiToken}
                  onChange={(e) => handleCredentialChange('apiToken', e.target.value)}
                  placeholder="Enter your JIRA API token"
                  required
                />
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                  Your API token is sent securely to the backend and not stored.
                </small>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Connecting...' : 'Fetch Boards'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Boards List */}
        {currentStep === 'boards' && !isLoading && (
          <div className="form-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#2c3e50', margin: 0 }}>Available Boards ({boards.length})</h2>
              <button className="secondary-btn" onClick={handleBackToAuth}>
                Back
              </button>
            </div>
            <div className="boards-container">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="board-card"
                  onClick={() => handleBoardSelect(board)}
                >
                  <div className="board-name">{board.locationName || board.name}</div>
                    <div className="board-key">Key: {board.projectKey || board.key || 'N/A'}</div>
                    <div className="board-type">{board.type || 'Unknown'}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Board Items Table */}
        {currentStep === 'items' && !isLoading && (
          <div>
            <div className="items-header">
              <div>
                <h2 className="items-title">
                  {selectedBoard?.name} - Items
                </h2>
                <small style={{ color: '#666' }}>{items.length} items found</small>
              </div>
              <button className="secondary-btn" onClick={handleBackToBoards}>
                Back to Boards
              </button>
            </div>

            <div className="table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Serial No.</th>
                    <th>JIRA ID</th>
                    <th>Story ID</th>
                    <th>Summary</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Fetch Details</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.jiraId}>
                      <td>{item.serialNumber}</td>
                      <td>{item.jiraId}</td>
                      <td>{item.storyId || '-'}</td>
                      <td>{item.summary}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="fetch-btn"
                          onClick={() => handleFetchDetails(item.jiraId)}
                          disabled={isLoading}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default JiraDetails
