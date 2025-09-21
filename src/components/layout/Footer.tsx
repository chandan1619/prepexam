import Link from "next/link";
import { BookOpen, Users, Award, Mail, Phone, MapPin, Linkedin, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <h3 className="text-2xl font-bold">Edmission</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner for government exam preparation. Master your exams with our comprehensive courses and expert guidance.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Users className="h-4 w-4" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Award className="h-4 w-4" />
                <span>95% Success Rate</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/exams" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Exams
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Exam Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Popular Exams</h4>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">UPSC Civil Services</li>
              <li className="text-gray-400 text-sm">SSC CGL</li>
              <li className="text-gray-400 text-sm">Banking Exams</li>
              <li className="text-gray-400 text-sm">Railway Exams</li>
              <li className="text-gray-400 text-sm">State PSC</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col space-y-1">
                  <a href="tel:+918809586507" className="text-gray-400 text-sm hover:text-white transition-colors">
                    +91 88095 86507
                  </a>
                  <a href="tel:+918789449507" className="text-gray-400 text-sm hover:text-white transition-colors">
                    +91 87894 49507
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  India
                </span>
              </div>
              
              {/* Social Media Links */}
              <div className="pt-2">
                <h5 className="text-sm font-medium text-gray-300 mb-3">Connect With Us</h5>
                <div className="flex space-x-4">
                  <a
                    href="https://www.linkedin.com/in/chandannitap/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/161995chandan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="https://x.com/chandan88052726"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                    aria-label="Twitter/X"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Edmission. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link href="/support" className="text-gray-400 hover:text-white transition-colors text-sm">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
