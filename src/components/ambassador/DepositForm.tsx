import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Upload } from "lucide-react";

interface DepositFormProps {
  onSubmit: (amount: number, currency: string, receiptImage: File) => Promise<void>;
}

const DepositForm: React.FC<DepositFormProps> = ({ onSubmit }) => {
  const [amount, setAmount] = useState<number | "">("");
  const [currency, setCurrency] = useState<string>("USD");
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) {
        alert("File size should not exceed 10MB.");
        return;
      }

      setReceiptImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptImage || amount === "" || amount <= 0) {
      alert("Please enter a valid amount and upload a receipt.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(amount, currency, receiptImage);
      setAmount(""); // Reset amount
      setCurrency("USD");
      setReceiptImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error submitting deposit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Deposit</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Field */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
              required
            />
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
              required
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="receipt">Upload Receipt</Label>
            <label
              htmlFor="receipt-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, or PDF (Max 10MB)</p>
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

            {/* Preview Image */}
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Receipt preview"
                  className="max-h-48 rounded-md mx-auto"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting || !receiptImage}>
            {isSubmitting ? "Submitting..." : "Submit Deposit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DepositForm;
