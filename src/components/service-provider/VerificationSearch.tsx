import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Search, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "../ui/alert"

export function VerificationSearch() {
  const [accountId, setAccountId] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResult, setSearchResult] = useState<'verified' | 'not_verified' | null>(null)

  const handleSearch = async () => {
    if (!accountId.trim()) return
    
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setSearchResult(Math.random() > 0.5 ? 'verified' : 'not_verified')
      setIsSearching(false)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Search</CardTitle>
        <CardDescription>
          Search for account verification status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter account ID..."
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={isSearching}
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !accountId.trim()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {searchResult && (
          <Alert>
            <AlertDescription>
              {searchResult === 'verified' ? (
                <span className="text-green-500 font-medium">Account is verified</span>
              ) : (
                <span className="text-red-500 font-medium">Account is not verified</span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 