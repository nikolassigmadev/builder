import { CSSProperties } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type SectionStyle = {
  layout?: string;
  background?: { type: "color" | "gradient" | "image"; value: string };
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  textAlign?: "left" | "center" | "right";
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
  shadow?: "none" | "sm" | "md" | "lg";
  animation?: "none" | "fadeIn" | "slideUp" | "slideLeft";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  colorOverrides?: { bg?: string; text?: string; accent?: string; primary?: string };
  customCSS?: string;
};

export type Section = {
  id: string;
  type: string;
  visible: boolean;
  style?: SectionStyle;
  data: any;
};

export type Typography = {
  headingFont?: string;
  bodyFont?: string;
  headingWeight?: "bold" | "extrabold" | "black";
  baseSize?: "sm" | "md" | "lg";
};

export type GlobalStyle = {
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
  cardStyle?: "flat" | "elevated" | "bordered" | "glass";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  sectionSpacing?: "compact" | "normal" | "relaxed";
  animations?: boolean;
  navStyle?: "solid" | "transparent" | "floating";
};

export type FooterColumn =
  | { type: "brand"; logo?: string; logoImageUrl?: string; tagline?: string }
  | { type: "links"; title?: string; links: { label: string; href: string }[] }
  | { type: "social"; title?: string; socialLinks: { platform: string; icon: string; href: string }[] }
  | { type: "text"; title?: string; text: string }
  | { type: "contact"; title?: string; phone?: string; email?: string; address?: string };

export type SiteContent = {
  siteTitle: string;
  colors: { primary: string; secondary: string; accent: string; background: string; text: string };
  nav: {
    ctaText: string;
    ctaLink: string;
    logoText?: string;
    logoImageUrl?: string;
    links?: { label: string; href: string }[];
    layout?: "default" | "centered" | "minimal";
  };
  footer: {
    tagline?: string;
    socialLinks?: string[];
    layout?: "three-column" | "two-column" | "centered" | "minimal";
    backgroundColor?: string;
    columns?: FooterColumn[];
    copyright?: string;
    customCSS?: string;
  };
  typography?: Typography;
  globalStyle?: GlobalStyle;
  globalCSS?: string;
  sections: Section[];
};

// Shorthand section props
export type SP = {
  data: any;
  colors: SiteContent["colors"];
  ss?: SectionStyle;
  gs?: GlobalStyle;
  ty?: Typography;
};
