import "./globals.css";
import { Inter, Poppins } from "next/font/google";

/* EXISTING FONT (unchanged) */
const inter = Inter({ subsets: ["latin"] });

/* ✅ ADDITION: Poppins font for landing page */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "FinWin Signup",
  description: "BankFlow account creation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* ✅ ADDITION: Bootstrap + Icons CSS */}
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
        />
      </head>

      {/* ✅ ADDITION: Combine Inter + Poppins */}
      <body className={`${inter.className} ${poppins.className}`}>
        {children}
      </body>
    </html>
  );
}
