"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Upload } from "lucide-react"

interface DepositFormProps {
  onSubmit: (amount: number, currency: string, receiptImage: File) => Promise<void>
}

const DepositForm: React.FC<DepositFormProps> = ({ onSubmit }) => {
  const [amount, setAmount] = useState<number>(0)
  const [currency, setCurrency] = useState<string>("USD")
  const [receiptImage, setReceiptImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setReceiptImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!receiptImage) return

    setIsSubmitting(true)
    try {
      await onSubmit(amount, currency, receiptImage)
      // Reset form
      setAmount(0)
      setCurrency("USD")
      setReceiptImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error submitting deposit:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Deposit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount || ""}
              onChange={(e) => setAmount(Number.parseFloat(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Upload Receipt</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="receipt-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or PDF (MAX. 10MB)</p>
                </div>
                <Input
                  id="receipt-upload"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleImageChange}
                  required
                />
              </label>
            </div>

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Receipt preview"
                  className="max-h-48 rounded-md mx-auto"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !receiptImage}>
            {isSubmitting ? "Submitting..." : "Submit Deposit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default DepositForm

