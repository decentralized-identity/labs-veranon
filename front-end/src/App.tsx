import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen w-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 bg-white/5 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-white mb-8">
          Welcome Humans
        </h1>
        <div className="flex flex-col gap-4">
          <Button variant="default" size="lg" className="w-full">
            Login
          </Button>
          <Button variant="outline" size="lg" className="w-full">
            Sign Up
          </Button>
        </div>
      </div>
    </main>
  )
}
