import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { CheckCircle } from 'lucide-react';

export default function ActivateAccount() {
  const [activationStatus, setActivationStatus] = useState<"pending" | "success" | "error">("pending");
  const navigate = useNavigate();

  useEffect(() => {
    const activateUser = async () => {
      const user = auth.currentUser;

      if (!user) {
        setActivationStatus("error");
        return;
      }

      try {
        // Reload the user to get the latest email verification status
        await user.reload();
        if (!user.emailVerified) {
          setActivationStatus("error");
          return;
        }

        // Fetch the user's document from Firestore
        const userDocRef = doc(db, "staffs", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setActivationStatus("error");
          return;
        }

        // Update the user's status to "active"
        await updateDoc(userDocRef, {
          status: "active",
          verifiedAt: serverTimestamp(),
        });

        setActivationStatus("success");

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        console.error("Error activating account:", error);
        setActivationStatus("error");
      }
    };

    activateUser();
  }, [navigate]);

  if (activationStatus === "pending") {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Activating Your Account</CardTitle>
          <CardDescription className="text-center">
            Please wait while we activate your account...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (activationStatus === "error") {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Activation Failed</CardTitle>
          <CardDescription className="text-center">
            There was an error activating your account. Please try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Account Activated</CardTitle>
        <CardDescription className="text-center">
          Your account has been successfully activated.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <p className="text-center max-w-md">
          You will be redirected to the login page shortly.
        </p>
      </CardContent>
    </Card>
  );
}