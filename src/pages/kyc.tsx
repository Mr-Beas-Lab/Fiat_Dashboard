import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { CheckCircle, ArrowRight } from 'lucide-react';
import { FileUpload } from "../components/FileUpload";

export default function kyc() {
  const router = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Personal information
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    city: "",
    postalCode: "",
  });
  
  // ID verification
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | null>>({
    fullName: null,
    email: null,
    phone: null,
    address: null,
    country: null,
    idFront: null,
    idBack: null,
    selfie: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (fileType: 'idFront' | 'idBack' | 'selfie', file: File | null) => {
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          [fileType]: "File size exceeds 5MB limit" 
        }));
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      if (fileType === 'idFront') {
        setIdFrontFile(file);
        setIdFrontPreview(previewUrl);
      } else if (fileType === 'idBack') {
        setIdBackFile(file);
        setIdBackPreview(previewUrl);
      } else {
        setSelfieFile(file);
        setSelfiePreview(previewUrl);
      }
      
      // Clear error
      setErrors(prev => ({ ...prev, [fileType]: null }));
    } else {
      // Clear file and preview
      if (fileType === 'idFront') {
        setIdFrontFile(null);
        setIdFrontPreview(null);
      } else if (fileType === 'idBack') {
        setIdBackFile(null);
        setIdBackPreview(null);
      } else {
        setSelfieFile(null);
        setSelfiePreview(null);
      }
    }
  };

  const validatePersonalInfo = () => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }
    
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
      isValid = false;
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const validateIdVerification = () => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;
    
    if (!idFrontFile) {
      newErrors.idFront = "Front side of ID is required";
      isValid = false;
    }
    
    if (!idBackFile) {
      newErrors.idBack = "Back side of ID is required";
      isValid = false;
    }
    
    if (!selfieFile) {
      newErrors.selfie = "Selfie photo is required";
      isValid = false;
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNextStep = () => {
    if (activeTab === "personal") {
      if (validatePersonalInfo()) {
        setActiveTab("verification");
      }
    }
  };

  const handlePrevStep = () => {
    if (activeTab === "verification") {
      setActiveTab("personal");
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate both steps
    const isPersonalValid = validatePersonalInfo();
    const isIdValid = validateIdVerification();
    
    if (!isPersonalValid) {
      setActiveTab("personal");
      return;
    }
    
    if (!isIdValid) {
      setActiveTab("verification");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Upload files to Firebase Storage
      const applicationId = uuidv4();
      const idFrontUrl = await uploadFile(
        idFrontFile as File, 
        `kyc/${applicationId}/id_front.jpg`
      );
      
      const idBackUrl = await uploadFile(
        idBackFile as File, 
        `kyc/${applicationId}/id_back.jpg`
      );
      
      const selfieUrl = await uploadFile(
        selfieFile as File, 
        `kyc/${applicationId}/selfie.jpg`
      );
      
      // Save application to Firestore
      await setDoc(doc(db, "kycApplications", applicationId), {
        applicationId,
        personalInfo: formData,
        documents: {
          idFront: idFrontUrl,
          idBack: idBackUrl,
          selfie: selfieUrl
        },
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setSubmitSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router("/ambassador");
      }, 2000);
      
    } catch (error) {
      console.error("Error submitting KYC application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Application Submitted</CardTitle>
          <CardDescription className="text-center">
            Your KYC application has been submitted successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <p className="text-center max-w-md">
            Thank you for submitting your KYC application. We will review your information and get back to you shortly.
            You will be redirected to your dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-3xl mx-auto my-5">
        <CardHeader>
          <CardTitle>Ambassador Registration</CardTitle>
          <CardDescription>
            Complete your KYC verification to become an ambassador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="verification">ID Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="United States"
                    className={errors.country ? "border-red-500" : ""}
                  />
                  {errors.country && (
                    <p className="text-sm text-red-500">{errors.country}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, Apt 4B"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>
                

              </div>
            </TabsContent>
            
            <TabsContent value="verification" className="space-y-6">
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">ID Verification Requirements</h3>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Government-issued ID (passport, driver's license, or national ID)</li>
                    <li>Both front and back sides of your ID</li>
                    <li>Clear, unobstructed view of the entire document</li>
                    <li>All text and photos must be clearly visible</li>
                    <li>Files must be less than 5MB in size</li>
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUpload
                    id="idFront"
                    label="Front side of ID"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(file) => handleFileChange('idFront', file)}
                    previewUrl={idFrontPreview}
                    error={errors.idFront}
                  />
                  
                  <FileUpload
                    id="idBack"
                    label="Back side of ID"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(file) => handleFileChange('idBack', file)}
                    previewUrl={idBackPreview}
                    error={errors.idBack}
                  />
                </div>
                
                <div className="mt-8">
                  <h3 className="font-medium mb-4">Selfie Verification</h3>
                  <div className="bg-muted/50 p-4 rounded-lg mb-4">
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      <li>Take a clear photo of your face</li>
                      <li>Ensure good lighting and a neutral background</li>
                      <li>Remove sunglasses, hats, or anything covering your face</li>
                      <li>Your face should match the photo on your ID</li>
                    </ul>
                  </div>
                  
                  <FileUpload
                    id="selfie"
                    label="Selfie Photo"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(file) => handleFileChange('selfie', file)}
                    previewUrl={selfiePreview}
                    error={errors.selfie}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {activeTab === "verification" ? (
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {activeTab === "personal" ? (
            <Button type="button" onClick={handleNextStep} className="ml-auto">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting} className="ml-auto">
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}