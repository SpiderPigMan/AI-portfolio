import "./globals.css";
import { Inter } from "next/font/google";
import { ChatProvider } from '@/context/ChatContext';

const inter = Inter({ subsets: ["latin"] });

/**
 * Punto de entrada obligatorio del Root Layout.
 * Configura los metadatos globales y el contenedor HTML base de la aplicación.
 */
export const metadata = {
  title: "JM | AI Portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <ChatProvider>
        {children}
        </ChatProvider>
      </body>
    </html>
  );
}