import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
const SITE_URL = "https://villacottages.in";
const BRAND_NAME = "Villa Cottages";
const LOCATION = "Gulab Bagh, Srinagar, Jammu & Kashmir 190006";

interface WelcomeEmailProps {
  firstName?: string;
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  const greeting = firstName ? `Hi ${firstName},` : "Hello,";

  return (
    <Html>
      <Head />
      <Preview>Welcome to Villa Cottages — your private Kashmir orchard stay</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>
              Villa <em>Cottages</em>
            </Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>You're on the list.</Heading>
            <Text style={tagline}>A private cottage on a Srinagar apple orchard.</Text>

            <Hr style={divider} />

            <Text style={p}>{greeting}</Text>
            <Text style={p}>
              Thanks for joining. You'll hear from us first — when dates open up, when the
              orchard is at its best, and when we run offers for returning guests.
            </Text>
            <Text style={p}>
              We keep it quiet. No weekly newsletters. Just the useful stuff.
            </Text>

            <Button style={cta} href={`${SITE_URL}/#book`}>
              Check Availability
            </Button>

            <Hr style={divider} />

            <Text style={meta}>
              {BRAND_NAME} · {LOCATION}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#080705",
  fontFamily: "-apple-system, sans-serif",
};

const container = {
  maxWidth: "560px",
  margin: "0 auto",
};

const header = {
  padding: "32px 32px 0",
};

const logo = {
  fontFamily: "Georgia, serif",
  fontSize: "18px",
  fontWeight: "300",
  color: "#f2ead8",
  margin: "0",
};

const content = {
  padding: "32px",
};

const h1 = {
  fontFamily: "Georgia, serif",
  fontSize: "28px",
  fontWeight: "300",
  color: "#f2ead8",
  margin: "0 0 8px",
};

const tagline = {
  fontSize: "13px",
  letterSpacing: "0.06em",
  color: "rgba(242,234,216,0.45)",
  margin: "0 0 24px",
};

const divider = {
  borderColor: "rgba(255,255,255,0.08)",
  margin: "24px 0",
};

const p = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "rgba(242,234,216,0.8)",
  margin: "0 0 16px",
};

const cta = {
  backgroundColor: "#D4AF37",
  color: "#080705",
  padding: "12px 28px",
  borderRadius: "2px",
  fontSize: "11px",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  fontWeight: "600",
  textDecoration: "none",
  display: "inline-block",
  margin: "8px 0 24px",
};

const meta = {
  fontSize: "11px",
  letterSpacing: "0.1em",
  color: "rgba(242,234,216,0.25)",
  margin: "0",
};
