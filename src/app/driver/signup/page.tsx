"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

const GoogleIcon = (props: any) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.66 1.67-3.86 0-6.99-3.16-6.99-7.12s3.13-7.12 6.99-7.12c2.1 0 3.63.82 4.54 1.72l2.5-2.5C18.04 1.62 15.54 0 12.48 0 5.88 0 .5 5.31.5 11.91s5.38 11.91 11.98 11.91c3.18 0 5.63-1.09 7.4-2.84 1.88-1.88 2.38-4.96 2.38-8.08 0-.66-.07-1.32-.19-1.97z"
    />
  </svg>
)

const AppleIcon = (props: any) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.028-3.91 1.183-4.961 3.014-2.117 3.675-.536 9.159 1.541 12.241.952 1.444 2.036 3.033 3.555 3.004 1.519-.028 2.01-1.01 3.86-1.01s2.35.981 3.86 1.01c1.52.03 2.583-1.518 3.527-2.976 1.284-1.992 1.822-3.933 1.851-4.01-.128-.009-3.321-1.232-3.35-4.838-.028-3.252 2.47-4.662 2.62-4.809-1.465-2.256-3.8-2.6-4.66-2.632-1.898-.057-3.562 1.07-4.524 1.07zM15.53 3.8c.95-.02 2.62.9 3.57 2.22-.96.02-2.63-.9-3.57-2.22z"
    />
  </svg>
)

export default function DriverSignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Devenez Chauffeur</CardTitle>
        <CardDescription>
          Créez votre compte pour commencer à livrer avec nous.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline"><GoogleIcon className="mr-2 h-4 w-4" /> Google</Button>
            <Button variant="outline"><AppleIcon className="mr-2 h-4 w-4" /> Apple</Button>
        </div>
        <div className="flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs text-muted-foreground">OU</span>
            <Separator className="flex-1" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="chauffeur@exemple.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button asChild className="w-full">
            <Link href="/driver/wizard/personal">Créer mon compte</Link>
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Déjà chauffeur?{" "}
          <Link href="/driver/login" className="font-medium text-primary hover:underline">
            Connectez-vous
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
