import { ButtonTest } from './components/Buttons/ButtonTest'

function App() {
  return (
    <div className='p-5'>
      <h1 className='text-2xl font-bold'>UI Kit - Dev Preview</h1>
      <div className='text-4xl'>
        <h2>ButtonTest Component</h2>
        <ButtonTest onClick={() => alert('Button clicked!')}>
          Click me
        </ButtonTest>
      </div>
    </div>
  )
}

export default App
