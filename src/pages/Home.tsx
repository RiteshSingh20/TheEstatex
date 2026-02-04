import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Briefcase, Shield } from "lucide-react";
import { useAuth } from "../utils/authContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { fetchBanners } from "../utils/fetchBanners";
import { Banner } from "../types";
import { getUserSubscribedLocations } from "../utils/helper";
import logo from "../assets/EstateX-Logo.png";
import BannerVertical from "../components/ui/BannerVertical";

const Home = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSet, setCurrentSet] = useState(0);

  useEffect(() => {
    const loadBanners = async () => {
      let locations = ["Mumbai", "Thane", "Mira Road"];
      if (user) {
        const userLocations = getUserSubscribedLocations(user);
        if (userLocations.length > 0) {
          locations = userLocations;
        }
      }
      const data = await fetchBanners(locations);
      setBanners(data);
    };
    loadBanners();
  }, [user]);

  const bannersPerSet = 4;
  const bannerSets = Math.ceil(banners.length / bannersPerSet);

  // Remove nextSet and prevSet functions as they are unused

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Your One-Stop Platform for Real Estate Brokers
              </h1>
              <p className="text-base sm:text-lg mb-6 sm:mb-8 text-neutral-100 max-w-lg">
                Connect with clients, manage your inventory, and grow your real
                estate business with EstateX.
              </p>
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="mr-0 sm:mr-4 w-full sm:w-auto">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link to="/signup">
                    <Button size="lg" className="w-full sm:w-auto">
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-white border-white hover:bg-primary-light w-full sm:w-auto"
                    >
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="md:w-1/2 flex justify-center w-full max-w-md">
              <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-500 hover:scale-105">
                <div className="h-48 sm:h-56 md:h-64 bg-neutral-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-white/90 rounded-xl shadow-2xl p-4 transition duration-300 hover:bg-white hover:shadow-2xl hover:scale-105">
                      <img
                        src={logo}
                        alt="Logo"
                        className="w-32 h-32 sm:w-44 sm:h-44 object-contain opacity-100 drop-shadow-lg"
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 sm:p-6 z-20">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div>
                        <h3 className="text-white text-lg sm:text-xl font-bold">
                          Premium Properties
                        </h3>
                        <p className="text-neutral-200 text-xs sm:text-sm">
                          Exclusive access to high-value listings
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Updated Features Section with Equal Height Cards and 2-per-row */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-neutral-800 mb-12">
            Why Choose Estatex?
          </h2>
          <div className="flex flex-wrap -mx-2">
            {[
              {
                icon: <Search className="h-8 w-8 text-primary" />,
                title: "Find Properties Faster",
                desc: "Our advanced filtering system helps you find the perfect property match for your clients in seconds.",
                bg: "bg-primary/10",
              },
              {
                icon: <Briefcase className="h-8 w-8 text-accent" />,
                title: "Manage Your Inventory",
                desc: "Upload and manage all your property listings in one place with our easy-to-use inventory management system.",
                bg: "bg-accent/10",
              },
              {
                icon: <Shield className="h-8 w-8 text-success" />,
                title: "Subscription Based",
                desc: "Choose the locations you want to serve and pay only for what you need with our flexible subscription model.",
                bg: "bg-success/10",
              },
              {
                icon: <ArrowRight className="h-8 w-8 text-purple-600" />,
                title: "Close Deals Faster",
                desc: "Streamlined communication tools help you close more deals in less time.",
                bg: "bg-purple-100",
              },
            ].map((item, index) => (
              <div key={index} className="w-full sm:w-1/2 px-2 mb-4">
                <Card className="h-full transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="flex flex-col items-center text-center p-6 h-full">
                    <div
                      className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mb-4`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-neutral-600">{item.desc}</p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Grow Your Real Estate Business?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of successful real estate brokers who are already
            using EstateX to find properties and close deals faster.
          </p>
          {user ? (
            <Link to="/subscription">
              <Button className="text-black" variant="primary">
                Explore Subscription Plans
              </Button>
            </Link>
          ) : (
            <Link to="/signup">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-black hover:bg-neutral-100"
              >
                Sign Up Now
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
