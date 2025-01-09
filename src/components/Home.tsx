import { Button } from "./ui/button"

export function Home() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center py-24">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          VerAnon
        </h1>
        <p className="text-muted-foreground max-w-[600px]">
          Securely manage and verify group memberships with zero-knowledge proofs
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-6">
        <Button size="lg" variant="outline" asChild>
          <a href="/manager">For Managers</a>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a href="/service-provider">For Service Providers</a>
        </Button>
      </div>
    </div>
  )
} 