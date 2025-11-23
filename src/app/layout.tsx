import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZeuZ Bank - Digital Banking Platform",
  description: "Modern banking platform with card management and payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <Header />
          {children}
        </Providers>
        <Toaster />

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Company Info */}
              <div className="sm:col-span-2 lg:col-span-4 space-y-6">
                <div className="flex gap-2">
                  <img
                    className="w-8 h-8"
                    src="/zeuz-logo.png"
                    alt="ZeuZ Bank Logo"
                  />
                  <span className="text-xl font-bold text-gray-900">ZeuZ Bank</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
                  ZeuZ Bank provides secure, modern banking solutions with advanced card management and seamless payment processing for all your financial needs.
                </p>
                <div className="text-gray-600 font-medium">info@zeuz.ai</div>
                <div className="flex gap-2">
                  <a
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-300 p-2 hover:bg-blue-50 rounded-full"
                    aria-label="Facebook"
                    href="https://www.facebook.com/zeuzai"
                  >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    className="text-gray-600 hover:text-red-600 transition-colors duration-300 p-2 hover:bg-red-50 rounded-full"
                    aria-label="YouTube"
                    href="https://www.youtube.com/@zeuzai"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                      <path d="m10 15 5-3-5-3z"/>
                    </svg>
                  </a>
                  <a
                    className="text-gray-600 hover:text-blue-700 transition-colors duration-300 p-2 hover:bg-blue-50 rounded-full"
                    aria-label="LinkedIn"
                    href="https://www.linkedin.com/company/zeuzai/"
                  >
                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Product */}
              <div className="sm:col-span-1 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                <ul className="space-y-3">
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/features/all-features">All Features</a></li>
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/products/professional-services">Professional Services</a></li>
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/products/license">ZeuZ tool License</a></li>
                </ul>
                <h3 className="font-semibold mt-6 text-gray-900 mb-4">Company</h3>
                <ul className="space-y-3">
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/about">About Us</a></li>
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/event">Events</a></li>
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/career">Career</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div className="sm:col-span-1 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
                <ul className="space-y-3">
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/success-stories">Case Studies</a></li>
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/documentation">Documentation</a></li>
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/community">Community</a></li>
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/resources/support">Support & Training</a></li>
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/blog">Blogs</a></li>
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/testimonials">Testimonial</a></li>
                  <li><a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/faq">FAQs</a></li>
                </ul>
              </div>

              {/* Newsletter/CTA */}
              <div className="sm:col-span-2 lg:col-span-4">
                <h3 className="font-semibold text-gray-900 mb-4">Stay Updated</h3>
                <p className="text-gray-600 text-sm mb-4">Get the latest banking tips and security updates.</p>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-300">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-12 pt-8 border-t border-gray-300">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-gray-600 text-sm">© 2025, All Rights Reserved</div>
                <div className="flex gap-6">
                  <a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/terms-of-service">Terms of use</a>
                  <a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/privacy-policy">Privacy policy</a>
                  <a className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-300" href="https://zeuz.ai/contact-us">Contact Us</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
