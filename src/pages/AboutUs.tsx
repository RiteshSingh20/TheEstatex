import React from 'react';

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">About EstateX</h1>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="prose max-w-none">
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                Welcome to EstateX, your premier digital partner in the real estate industry. We are an innovative technology platform dedicated to empowering real estate brokers across India. Our mission is to transform how property professionals operate by providing a comprehensive, data-driven ecosystem that makes real estate transactions more seamless, efficient, and profitable.
              </p>
              
              <hr className="border-gray-300 mb-6" />
              
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Our Vision & Mission</h2>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                <strong>Our Vision:</strong> To be the catalyst for a smarter, more connected real estate market in India, where every broker has the tools to succeed and grow their business exponentially.
              </p>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                <strong>Our Mission:</strong> To revolutionize the real estate landscape by providing a robust, all-in-one platform that connects brokers with quality listings, delivers actionable market intelligence, and equips them with the resources needed to streamline their workflow and achieve their professional goals.
              </p>
              
              <hr className="border-gray-300 mb-6" />
              
              <h2 className="text-xl font-semibold mb-4 text-gray-800">What We Offer: Your Tools for Success</h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Our platform is designed to give you a significant competitive advantage. We go beyond simple listings to provide a complete suite of professional tools:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-2 leading-relaxed">
                <li><strong>Comprehensive Nationwide Property Database:</strong> Gain access to a vast and meticulously curated database of rental, resale, and new properties across all available locations of India in EstateX Data. Our extensive coverage ensures you never miss an opportunity, no matter where your clients are looking.</li>
                <li><strong>Advanced Search & Filtering:</strong> Say goodbye to endless scrolling. Our powerful, intelligent search engine allows you to pinpoint the perfect property in seconds. Filter by location, price, type, and numerous other criteria to match your clients with their dream property faster and more efficiently.</li>
                <li><strong>Real-time Market Insights & Analytics:</strong> Make data-driven decisions that give you an edge. Our platform provides exclusive access to real-time market trends, pricing analytics, and demand forecasts, helping you stay ahead of the curve and offer expert advice to your clients.</li>
                <li><strong>Secure & Reliable Platform:</strong> Your data and your business are our top priority. We've built a secure and dependable platform with state-of-the-art technology to ensure your information is protected and your workflow is never interrupted.</li>
                <li><strong>Dedicated 24/7 Customer Support:</strong> We are committed to your success. Our expert support team is available around the clock to assist you with any questions or technical issues, ensuring you get the most out of your EstateX subscription.</li>
              </ul>
              
              <hr className="border-gray-300 mb-6" />
              
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Why Choose EstateX?</h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                With a deep understanding of the challenges faced by today's real estate professionals, we've engineered a platform that doesn't just list properties—it transforms your business. By choosing EstateX, you are choosing to:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1 leading-relaxed">
                <li><strong>Streamline Your Workflow:</strong> Drastically reduce the time spent on manual tasks and property searches.</li>
                <li><strong>Increase Your Productivity:</strong> Focus on what matters most—building client relationships and closing deals.</li>
                <li><strong>Gain a Competitive Edge:</strong> Leverage exclusive data and insights to become a market leader.</li>
                <li><strong>Partner with a Trusted Name:</strong> Join a community of successful brokers who rely on our platform to grow their business.</li>
              </ul>
              
              <p className="text-base text-gray-800 font-medium text-center leading-relaxed">
                Experience the future of real estate. Join EstateX and let's build your success story together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;