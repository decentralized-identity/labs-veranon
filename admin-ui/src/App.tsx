import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Header } from "./components/Header"
import { Home } from "./components/Home"
import { Manager } from "./components/Manager"
import { ServiceProvider } from "./components/ServiceProvider"
import { MembersManagement } from "./components/manager/MembersManagement"

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manager" element={<Manager />} />
            <Route path="/manager/members" element={<MembersManagement />} />
            <Route path="/service-provider" element={<ServiceProvider />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
