import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface KoalaWelcomeEmailProps {
  forename: string;
  token: string;
}

const baseUrl = process.env.BASE_URL;

export const ResetEmail = ({ forename, token }: KoalaWelcomeEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Lecturetheplanet - Live, online lectures</Preview>
      <Container style={container}>
        <Img
          src={`${baseUrl}/logo.png`}
          width="160"
          height="160"
          alt="Lecturetheplanet Logo"
          style={heading}
        />

        <Text style={paragraph}>Hi {forename},</Text>
        <Text style={paragraph}>
          Thanks for requesting a password reset token. If you did not request
          this you do not need to do anything.
        </Text>
        <Section style={btnContainer}>
          <Button
            style={button}
            href={`${baseUrl}/reset-password?token=${token}`}
          >
            Reset your password
          </Button>
        </Section>
        <Text style={paragraph}>
          Best,
          <br />
          The Lecturetheplanet Team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Lecturetheplanet Ltd. <br />
          71-75 Shelton St. <br />
          Covent Garden, <br />
          London, <br />
          WC2H 9JQ.
        </Text>
      </Container>
    </Body>
  </Html>
);

ResetEmail.PreviewProps = {
  forename: "Alan",
} as KoalaWelcomeEmailProps;

export default ResetEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const heading = {
  margin: "0 auto",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

// const logo = {
//   margin: "0 auto",
// };

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const btnContainer = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#000",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};
