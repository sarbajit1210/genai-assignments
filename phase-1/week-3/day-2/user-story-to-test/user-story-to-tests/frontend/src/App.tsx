import { useState } from 'react'
import JiraDetails from './components/JiraDetails'
import TestGenerator from './components/TestGenerator'

type PageType = 'jira' | 'test-generator'

interface StoryData {
  storyTitle?: string
  description?: string
  acceptanceCriteria?: string
}

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('jira')
  const [storyData, setStoryData] = useState<StoryData>({})

  const handleNavigateToTestGenerator = (data: StoryData) => {
    setStoryData(data)
    setCurrentPage('test-generator')
  }

  const handleBackToJira = () => {
    setCurrentPage('jira')
    setStoryData({})
  }

  return (
    <>
      {currentPage === 'jira' && (
        <JiraDetails onNavigateToTestGenerator={handleNavigateToTestGenerator} />
      )}
      {currentPage === 'test-generator' && (
        <TestGenerator initialData={storyData} onBack={handleBackToJira} />
      )}
    </>
  )
}

export default App
