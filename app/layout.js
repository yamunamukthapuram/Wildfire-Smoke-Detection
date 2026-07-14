import './globals.css';

export const metadata = {
  title: 'Wildfire Smoke Detector',
  description: 'Upload an image to estimate wildfire or smoke risk.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
