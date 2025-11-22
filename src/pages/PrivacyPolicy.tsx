import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

const PrivacyPolicy = () => {
  const [contactEmail, setContactEmail] = useState("info@theestatex.com");
  const [contactAddress, setContactAddress] = useState("123 Real Estate Avenue, Mumbai, Maharashtra 400001");

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const contactDoc = await getDoc(doc(db, "settings", "contact"));
        if (contactDoc.exists()) {
          const contact = contactDoc.data();
          setContactEmail(contact.email || "info@theestatex.com");
          setContactAddress(contact.address || "123 Real Estate Avenue, Mumbai, Maharashtra 400001");
        }
      } catch (error) {
        
      }
    };

    fetchContactInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">
            EstateX Privacy Policy
          </h1>
          <p className="mb-4 text-gray-500 text-sm">
            Effective Date: January 2025
          </p>
          
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            1. Introduction
          </h2>
          <p className="mb-4 text-gray-600 text-sm leading-relaxed">
            Welcome to EstateX! We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <p className="mb-4 text-gray-600 text-sm leading-relaxed">
            By using the EstateX website and services, you agree to the terms of this Privacy Policy. If you do not agree, please do not use our platform.
          </p>
          
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            2. Information We Collect
          </h2>
          <p className="mb-3 text-gray-600 text-sm leading-relaxed">
            We collect information that helps us provide and improve our services. The types of information we collect may include:
          </p>
          <ul className="mb-4 text-gray-600 text-sm leading-relaxed list-disc list-inside space-y-1">
            <li><strong>Personal Identification Information:</strong> Your name, email address, phone number, and company name when you sign up for an account or contact us.</li>
            <li><strong>Usage Data:</strong> Information about how you access and use our platform, such as your IP address, browser type, pages you visit, and the time and date of your visit.</li>
            <li><strong>Financial Information:</strong> We do not store or process your credit card or bank details. All payment processing is handled by our third-party payment gateway, Razorpay.</li>
            <li><strong>Account Information:</strong> Your subscription plan details and billing history.</li>
            <li><strong>Listing Data:</strong> Information you provide when using our platform to manage property listings, such as property details, images, and addresses.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            3. How We Use Your Information
          </h2>
          <p className="mb-3 text-gray-600 text-sm leading-relaxed">
            We use the information we collect for various purposes, including to:
          </p>
          <ul className="mb-4 text-gray-600 text-sm leading-relaxed list-disc list-inside space-y-1">
            <li>Provide, maintain, and improve our services.</li>
            <li>Manage your subscription and process payments.</li>
            <li>Communicate with you about your account, services, and promotional offers.</li>
            <li>Personalize your experience on our platform.</li>
            <li>Monitor and analyze usage and trends to enhance the user experience.</li>
            <li>Detect, prevent, and address technical issues or fraud.</li>
            <li>Comply with legal obligations.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            4. Data Sharing and Disclosure
          </h2>
          <p className="mb-3 text-gray-600 text-sm leading-relaxed">
            We will not share your personal information with third parties without your consent, except in the following situations:
          </p>
          <ul className="mb-4 text-gray-600 text-sm leading-relaxed list-disc list-inside space-y-1">
            <li><strong>Service Providers:</strong> We may share your information with trusted third-party service providers who assist us in operating our platform, such as payment processors (Razorpay) and hosting services. These third parties are obligated to protect your information and use it only for the purposes we specify.</li>
            <li><strong>Legal Compliance:</strong> We may disclose your information if required by law or in response to valid requests by public authorities.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your personal information may be transferred to the new owner.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            5. Data Security
          </h2>
          <p className="mb-4 text-gray-600 text-sm leading-relaxed">
            We are committed to protecting your data and employ a variety of security measures, including encryption, secure servers, and access controls, to safeguard your personal information from unauthorized access, alteration, disclosure, or destruction. However, please remember that no method of transmission over the internet or electronic storage is 100% secure.
          </p>
          
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            6. Your Rights
          </h2>
          <p className="mb-3 text-gray-600 text-sm leading-relaxed">
            You have the right to:
          </p>
          <ul className="mb-4 text-gray-600 text-sm leading-relaxed list-disc list-inside space-y-1">
            <li><strong>Access and Update Your Information:</strong> You can access and update your account information by logging into your profile.</li>
            <li><strong>Delete Your Account:</strong> You may request the deletion of your account and associated data by contacting us.</li>
            <li><strong>Opt-Out of Communications:</strong> You can unsubscribe from our marketing emails at any time by following the instructions in the email.</li>
          </ul>
          
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            7. Third-Party Websites
          </h2>
          <p className="mb-4 text-gray-600 text-sm leading-relaxed">
            Our platform may contain links to other websites that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </p>
          
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            8. Changes to This Privacy Policy
          </h2>
          <p className="mb-4 text-gray-600 text-sm leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Effective Date" at the top. We encourage you to review this policy periodically.
          </p>
          
          <h2 className="text-lg font-semibold mb-2 text-gray-800">
            9. Contact Us
          </h2>
          <p className="mb-3 text-gray-600 text-sm leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="mb-4 text-gray-600 text-sm leading-relaxed list-disc list-inside space-y-1">
            <li><strong>Email:</strong> {contactEmail}</li>
            <li><strong>Website:</strong> www.theestatex.com</li>
            <li><strong>Address:</strong> {contactAddress}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;