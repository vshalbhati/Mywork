import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import Footer from "@/components/Footer";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Footer/>
        </AuthProvider>
      </body>
    </html>
  );
}