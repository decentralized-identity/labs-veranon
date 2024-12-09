import { Header } from "./components/Header"
import { Home } from "./components/Home"

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Home />
      </main>
    </div>
  )
}

export default App
