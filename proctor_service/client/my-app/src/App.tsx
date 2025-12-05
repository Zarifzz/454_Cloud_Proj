import { Route, Routes } from 'react-router-dom'
import LandingPage from './landingpage'
import Login from './login'
import { Toaster } from './ui/sonner'
import './App.css'
import SignUp from './signup'

type PlaceholderProps = {
  title: string
  description?: string
}

//const PlaceholderPage = ({ title, description }: PlaceholderProps) => (
  //<main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
    //<h1 className="text-3xl font-semibold text-blue-600">{title}</h1>
    //{description ? <p className="max-w-md text-gray-600">{description}</p> : null}
    //<p className="text-gray-500">Replace this placeholder with the real page.</p>
  //</main>
//)


// Screen
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
