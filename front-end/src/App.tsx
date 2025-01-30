import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Human</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link to="/login" className="block">
            <Button variant="default" size="lg" className="w-full">
              Login
            </Button>
          </Link>
          <Link to="/signup" className="block">
            <Button variant="outline" size="lg" className="w-full">
              Sign Up
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
