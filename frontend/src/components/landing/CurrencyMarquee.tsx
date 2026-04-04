const ITEMS = [
  { label: "USDC → KES",   sub: "Kenya Shilling"     },
  { label: "USDC → NGN",   sub: "Nigerian Naira"      },
  { label: "USDC → GHS",   sub: "Ghanaian Cedi"       },
  { label: "USDC → TZS",   sub: "Tanzanian Shilling"  },
  { label: "USDC → UGX",   sub: "Ugandan Shilling"    },
  { label: "M-Pesa",       sub: "Kenya & Tanzania"    },
  { label: "MTN Money",    sub: "Ghana & Uganda"      },
  { label: "Airtel Money", sub: "Uganda & Tanzania"   },
];

const ALL = [...ITEMS, ...ITEMS]; // duplicate for seamless loop

function Item({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-card border border-border rounded-lg shrink-0">
      <div>
        <div className="text-sm font-medium text-primary">{label}</div>
        <div className="text-xs text-muted">{sub}</div>
      </div>
    </div>
  );
}

export default function CurrencyMarquee() {
  return (
    <section className="py-12 border-t border-border overflow-hidden">
      <p className="text-center text-xs font-medium text-muted uppercase tracking-widest mb-6">
        Supported corridors
      </p>
      <div className="relative mask-fade">
        <div className="flex gap-3 animate-marquee w-max">
          {ALL.map((item, i) => <Item key={i} {...item} />)}
        </div>
      </div>
    </section>
  );
}
