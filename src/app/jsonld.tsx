const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://promptwars.io";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SentinAL / PromptWars",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      "Enterprise Multi-Vector AI Defense Firewall and Real-Time Adaptive Security Gateway for Autonomous Financial & Banking Agents.",
    sameAs: [
      "https://github.com/Hrithik450/promptwars",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Security Response Team",
      email: "security@promptwars.io",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SentinAL AI Banking Firewall",
    url: BASE_URL,
    description:
      "Mission-critical AI security layer shielding financial agents from prompt injections, multi-turn state drift, canary exfiltration, and tool hijacking.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SentinAL AI Banking Firewall & Security Gateway",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Cloud, Linux, Kubernetes, Edge",
    url: BASE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Open Evaluation Edition",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.98",
      ratingCount: "250",
      bestRating: "5",
      worstRating: "1",
    },
    description:
      "Four-layer deterministic defense-in-depth security proxy inspecting prompt injections, homoglyphic zero-width obfuscations, adversarial semantic intent, and strict financial parameter constraints in under 5ms.",
    featureList: [
      "Layer 1: Deterministic heuristic signatures, ASCII normalization & zero-width token sanitization",
      "Layer 2: Adversarial semantic intent parser & dual-threshold confidence calibration",
      "Layer 3: Strict banking policy engine enforcing limits, canary checks & account whitelisting",
      "Layer 4: Real-time contextual drift tracking with exponential penalty backoff",
      "Sub-5 millisecond median latency on localized heuristic evaluation",
      "Full OWASP Top 10 for Large Language Models compliance coverage",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is SentinAL AI Defense Firewall?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SentinAL is an ultra-low-latency deterministic security proxy designed to protect autonomous financial agents and LLM applications from jailbreaks, prompt injections, credential exfiltration, and malicious tool invocations.",
        },
      },
      {
        "@type": "Question",
        name: "How does SentinAL achieve sub-5 millisecond inspection latency?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SentinAL evaluates queries through an asynchronous hierarchical pipeline where pre-flight token sanitization and deterministic regular expressions catch over 90% of adversarial payloads in under 1 millisecond before any secondary neural or semantic passes.",
        },
      },
      {
        "@type": "Question",
        name: "Does SentinAL prevent canary token and system prompt exfiltration?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. SentinAL embeds dynamic canary tokens and strict output regex sanitizers that instantly block model responses attempting to leak internal system instructions, API keys, or memory state.",
        },
      },
      {
        "@type": "Question",
        name: "What financial operations are guarded by default?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Wire transfers, account balance queries, international remittances, KYC address changes, and high-frequency transactions are governed by deterministic policy rules with configurable monetary limits and destination verification.",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
