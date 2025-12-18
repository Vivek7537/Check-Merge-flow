
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, LogIn } from "lucide-react";
import Logo from "@/components/app/shared/Logo";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRole } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LoginPage() {
  const router = useRouter();
  const { login, editors } = useAuth();
  const [role, setRole] = useState<UserRole>("Editor");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (role === 'Editor' && !name) {
      setError("Please select an editor.");
      setIsLoading(false);
      return;
    }
    
    const loginName = role === 'Team Leader' ? 'Team Leader' : name;

    const success = login(loginName, password, role);

    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Welcome to MergeFlow</CardTitle>
            <CardDescription>
              Sign in to access your dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label>Role</Label>
                <RadioGroup
                  defaultValue="Editor"
                  className="flex gap-4"
                  onValueChange={(value: UserRole) => setRole(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Editor" id="r1" />
                    <Label htmlFor="r1">Editor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Team Leader" id="r2" />
                    <Label htmlFor="r2">Team Leader</Label>
                  </div>
                </RadioGroup>
              </div>

              {role === 'Editor' && (
                 <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                   <Select onValueChange={setName} value={name}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your name" />
                      </SelectTrigger>
                    <SelectContent>
                      {editors.map(editor => (
                        <SelectItem key={editor.id} value={editor.name}>{editor.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
                <LogIn className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
