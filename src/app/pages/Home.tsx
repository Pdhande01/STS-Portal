import { Link } from "react-router";
import { Wrench, ShoppingCart, Users, Shield, Zap, Clock, ArrowRight, CheckCircle, Star, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { motion } from "framer-motion";

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Tech Service
              </h1>
              <p className="text-xs text-gray-500">Your Tech Partner</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="outline" className="hover:border-blue-600 hover:text-blue-600 transition-all">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-left space-y-6"
            >
              <div className="inline-block">
                <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium">
                  ⚡ #1 Tech Service Platform
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Professional Computer Repair
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  At Your Doorstep
                </span>
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl">
                Book certified technicians for home or shop repair services and purchase premium hardware components—all in one platform.
              </p>
              <div className="flex gap-4 pt-4">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all group">
                    Book Repair Service
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 backdrop-blur-sm">
                    Shop Hardware
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-blue-200 text-sm">Happy Clients</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50+</div>
                  <div className="text-blue-200 text-sm">Expert Technicians</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-blue-200 text-sm">Success Rate</div>
                </div>
              </div>
            </motion.div>
            
            {/* Hero Image */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl blur-2xl opacity-30"></div>
              <img 
                src="https://images.unsplash.com/photo-1709102884400-b50ca1a12bc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHJlcGFpciUyMHRlY2huaWNpYW4lMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzcxMDAyMTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Computer Repair Service"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover border-4 border-white/20"
              />
              
              {/* Floating Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-2xl p-4 max-w-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Fast Service</div>
                    <div className="text-sm text-gray-600">Same-day repairs available</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose Us
            </h3>
            <p className="text-gray-600 text-lg">Delivering excellence in every service</p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
              hidden: { opacity: 0 }
            }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 30 } }}>
              <Card className="border-2 hover:border-blue-500 transition-all hover:shadow-xl group h-full">
                <CardHeader>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Easy Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Book repair services in seconds with our intuitive platform
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 30 } }}>
              <Card className="border-2 hover:border-purple-500 transition-all hover:shadow-xl group h-full">
                <CardHeader>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Certified Experts</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Connect with verified and skilled technicians
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 30 } }}>
              <Card className="border-2 hover:border-green-500 transition-all hover:shadow-xl group h-full">
                <CardHeader>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Online Shopping</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Premium hardware products delivered to your door
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 30 } }}>
              <Card className="border-2 hover:border-orange-500 transition-all hover:shadow-xl group h-full">
                <CardHeader>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Live Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Monitor repair progress in real-time with updates
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Our Services</h3>
            <p className="text-gray-600 text-lg">Comprehensive tech solutions for all your needs</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1768633647910-7e6fb53e5b0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjByZXBhaXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcxMDQ1ODE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Repair Services"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                <div>
                  <h4 className="text-3xl font-bold text-white mb-2">Repair Services</h4>
                  <p className="text-gray-200 mb-4">Professional laptop & desktop repair at your location</p>
                  <Link to="/register">
                    <Button className="bg-white text-black hover:bg-gray-100">
                      Book Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="relative group overflow-hidden rounded-2xl shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1758159234965-9d259875cf35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMGhhcmR3YXJlJTIwY29tcG9uZW50c3xlbnwxfHx8fDE3NzA5NDk4ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Hardware Shop"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                <div>
                  <h4 className="text-3xl font-bold text-white mb-2">Hardware Store</h4>
                  <p className="text-gray-200 mb-4">Premium components & accessories delivered fast</p>
                  <Link to="/register">
                    <Button className="bg-white text-black hover:bg-gray-100">
                      Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>Laptop & Desktop Repair</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Professional repair services for all brands with genuine parts
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Round-the-clock customer support for your convenience
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>Warranty Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All repairs come with comprehensive warranty coverage
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">What Our Clients Say</h3>
            <p className="text-gray-600 text-lg">Trusted by thousands of satisfied customers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "Business Owner", rating: 5, text: "Excellent service! My laptop was repaired in just 2 hours. Highly recommend!" },
              { name: "Michael Chen", role: "Freelancer", rating: 5, text: "Professional technicians and great prices. The online shop has everything I need." },
              { name: "Emily Davis", role: "Student", rating: 5, text: "Fast, reliable, and affordable. They saved my thesis when my laptop crashed!" }
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-2 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base italic text-gray-700">
                    "{testimonial.text}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers and experience premium tech services today
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                Login Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-6 h-6" />
                <span className="font-bold">Smart Tech Service Portal</span>
              </div>
              <p className="text-gray-400">
                Professional computer repair services and online hardware store
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/user/book-service" className="hover:text-white">Book Service</Link></li>
                <li><Link to="/user/shop" className="hover:text-white">Shop Hardware</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Technology Stack</h4>
              <p className="text-gray-400 text-sm">
                Frontend: React, TypeScript<br />
                Backend: Node.js / PHP<br />
                Responsive & Secure Design
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Smart Tech Service Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
