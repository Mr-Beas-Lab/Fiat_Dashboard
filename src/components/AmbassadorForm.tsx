"use client"

import type React from "react"
import { useState } from "react"
import type { Ambassador, PaymentMethod } from "../types"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { X, Plus } from "lucide-react"

interface AmbassadorFormProps {
  ambassador?: Ambassador
  onSubmit: (ambassador: Omit<Ambassador, "id" | "createdAt">) => void
}

const AmbassadorForm: React.FC<AmbassadorFormProps> = ({ ambassador, onSubmit }) => {
  const [name, setName] = useState(ambassador?.name || "")
  const [email, setEmail] = useState(ambassador?.email || "")
  const [phone, setPhone] = useState(ambassador?.phone || "")
  const [address, setAddress] = useState(ambassador?.address || "")
  const [country, setCountry] = useState(ambassador?.country || "")
  const [photoUrl, setPhotoUrl] = useState(ambassador?.photoUrl || "")
  const [paymentMethods, setPaymentMethods] = useState<Omit<PaymentMethod, "id">[]>(
    ambassador?.paymentMethods.map((pm) => ({
      bankName: pm.bankName,
      accountNumber: pm.accountNumber,
      accountName: pm.accountName,
      swiftCode: pm.swiftCode,
    })) || [],
  )

  const addPaymentMethod = () => {
    setPaymentMethods([...paymentMethods, { bankName: "", accountNumber: "", accountName: "", swiftCode: "" }])
  }

  const removePaymentMethod = (index: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index))
  }

  const updatePaymentMethod = (index: number, field: keyof Omit<PaymentMethod, "id">, value: string) => {
    const updatedMethods = [...paymentMethods]
    updatedMethods[index] = { ...updatedMethods[index], [field]: value }
    setPaymentMethods(updatedMethods)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      email,
      phone,
      address,
      country,
      photoUrl,
      paymentMethods: paymentMethods as PaymentMethod[],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoUrl">Photo URL</Label>
        <Input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} required />
        {photoUrl && (
          <div className="mt-2">
            <img
              src={photoUrl || "/placeholder.svg"}
              alt="Ambassador preview"
              className="w-24 h-24 object-cover rounded-full"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Payment Methods</Label>
          <Button
            type="button"
            onClick={addPaymentMethod}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Bank
          </Button>
        </div>

        {paymentMethods.map((method, index) => (
          <div key={index} className="p-4 border rounded-md relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => removePaymentMethod(index)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`bankName-${index}`}>Bank Name</Label>
                <Input
                  id={`bankName-${index}`}
                  value={method.bankName}
                  onChange={(e) => updatePaymentMethod(index, "bankName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`accountName-${index}`}>Account Name</Label>
                <Input
                  id={`accountName-${index}`}
                  value={method.accountName}
                  onChange={(e) => updatePaymentMethod(index, "accountName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`accountNumber-${index}`}>Account Number</Label>
                <Input
                  id={`accountNumber-${index}`}
                  value={method.accountNumber}
                  onChange={(e) => updatePaymentMethod(index, "accountNumber", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`swiftCode-${index}`}>Swift Code (Optional)</Label>
                <Input
                  id={`swiftCode-${index}`}
                  value={method.swiftCode || ""}
                  onChange={(e) => updatePaymentMethod(index, "swiftCode", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">
        {ambassador ? "Update Ambassador" : "Create Ambassador"}
      </Button>
    </form>
  )
}

export default AmbassadorForm

