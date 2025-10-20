import { useState } from 'react'
import { ButtonTest } from 'ui-kit';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Vite + React + UI-Kit</h1>
      <div className="card">
        <ButtonTest onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </ButtonTest>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

