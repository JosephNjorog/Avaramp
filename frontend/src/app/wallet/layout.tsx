import BottomNav from "@/components/payer/BottomNav";

export const metadata = {
  title:       "AvaRamp Pay",
  description: "Pay with crypto, receive fiat",
};

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg" style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}>
      {children}
      <BottomNav />
    </div>
  );
}
