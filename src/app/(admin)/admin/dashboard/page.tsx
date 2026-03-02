"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Car, DollarSign, Clock, AlertTriangle, ShieldCheck } from "lucide-react"
import { DRIVERS, MOCK_ALERTS } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_ORDERS } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const kpiData = [
  { title: "Ventes du Jour", value: "1,250.75 $", icon: DollarSign, change: "+5.2%" },
  { title: "Commandes Aujourd'hui", value: "78", icon: Box, change: "+12" },
  { title: "Chauffeurs en Ligne", value: "4", icon: Car, change: "-1" },
  { title: "Temps moyen livraison", value: "24 min", icon: Clock, change: "-2 min" },
]

const salesData = [
  { name: 'Lun', sales: 400 },
  { name: 'Mar', sales: 300 },
  { name: 'Mer', sales: 600 },
  { name: 'Jeu', sales: 800 },
  { name: 'Ven', sales: 700 },
  { name: 'Sam', sales: 1100 },
  { name: 'Dim', sales: 1300 },
];

const severityIcon = {
    high: <AlertTriangle className="h-5 w-5 text-red-500" />,
    medium: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    low: <ShieldCheck className="h-5 w-5 text-blue-500" />,
}

const driverStatusColor = {
    'En ligne': "bg-green-500",
    'Hors ligne': "bg-gray-400",
    'En livraison': "bg-blue-500",
}

export default function AdminDashboardPage() {
  const onlineDrivers = DRIVERS.filter(d => d.status !== 'Hors ligne');
    
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Vue générale</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change} vs hier</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Ventes de la Semaine</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <RechartsBarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))'}}/>
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ORDERS.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={order.driver?.avatarUrl} />
                                    <AvatarFallback>{order.driver?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-medium">{order.driver?.name}</div>
                                    <div className="text-xs text-muted-foreground">{order.id}</div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={order.status === 'delivered' ? 'secondary' : 'default'} className={cn(order.status === 'en_route' ? 'bg-blue-600' : '', order.status === 'delivered' ? 'bg-green-600' : '')}>
                                {order.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Chauffeurs Connectés</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {onlineDrivers.map(driver => (
                        <div key={driver.id} className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={driver.avatarUrl} data-ai-hint="person portrait" />
                                <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-medium">{driver.name}</p>
                                <p className="text-xs text-muted-foreground">Note: {driver.rating} ({driver.deliveries} livraisons)</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn("h-2 w-2 rounded-full", driverStatusColor[driver.status])}></span>
                                <span className="text-xs font-medium text-muted-foreground">{driver.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Incidents & Alertes</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {MOCK_ALERTS.map(alert => (
                        <div key={alert.id} className="flex items-start gap-4">
                            <div>{severityIcon[alert.severity]}</div>
                            <div className="flex-1">
                                <p className="font-medium">{alert.title}</p>
                                <p className="text-sm text-muted-foreground">{alert.description}</p>
                            </div>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(alert.createdAt).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
