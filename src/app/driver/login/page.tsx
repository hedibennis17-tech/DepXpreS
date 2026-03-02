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
import Link from "next/link"

export default function DriverLoginPage() {
  return (
     <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Connexion Chauffeur</CardTitle>
        <CardDescription>
          Entrez votre email ou téléphone pour recevoir un code de connexion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email ou Téléphone</Label>
          <Input id="email" type="email" placeholder="chauffeur@exemple.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="otp">Code (OTP)</Label>
          <Input id="otp" type="text" placeholder="123456 (code de test)" required />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button asChild className="w-full">
            <Link href="/driver/dashboard">Se Connecter</Link>
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Pas encore de compte?{" "}
          <Link href="/driver/signup" className="font-medium text-primary hover:underline">
            Devenez chauffeur
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
