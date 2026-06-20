import './auth.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="auth-route-content">{children}</div>
      <Footer />
    </>
  );
}
