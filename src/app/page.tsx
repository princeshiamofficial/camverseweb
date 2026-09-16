import type { Metadata } from "next";
import { SITE } from "@/lib/seo";
import { PLANS } from "@/data/plans";
import { FAQ_ITEMS } from "@/data/audience";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { TrustBar } from "@/components/trust-bar";
import { InteractiveComparison } from "@/components/interactive-comparison";
import { BentoGrid } from "@/components/bento-grid";
import { Workflow } from "@/components/workflow";
import { DownloadSection } from "@/components/download-section";
import { Pricing } from "@/components/pricing";
import { Faq, FinalCta } from "@/components/payment-faq";
import { CheckoutProvider } from "@/components/checkout-context";
import { AutoCheckout } from "@/components/auto-checkout";
import { StickyMobileCta } from "@/components/sticky-cta";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function JsonLd() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Windows, macOS, Linux, Web",
    description: SITE.description,
    slogan: SITE.slogan,
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: "BDT",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: String(PLANS.pro.monthlyPrice),
        priceCurrency: "BDT",
      },
      {
        "@type": "Offer",
        name: "Agency",
        price: String(PLANS.agency.monthlyPrice),
        priceCurrency: "BDT",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

export default function HomePage() {
  return (
    <CheckoutProvider>
      <AutoCheckout />
      <JsonLd />
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-clip pb-[72px] lg:pb-0">
        <Hero />
        <TrustBar />
        <InteractiveComparison />
        <BentoGrid />
        <Workflow />
        <DownloadSection />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <StickyMobileCta />
    </CheckoutProvider>
  );
}
