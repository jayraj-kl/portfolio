"use client";

import { PixelCard } from "@/components/backgrounds/Pixel";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Linkedin, Github, Twitter } from "lucide-react";

// Icons object to match your data structure
const Icons = {
  github: Github,
  linkedin: Linkedin,
  x: Twitter,
};

interface SocialLink {
  name: string;
  url: string;
  icon: keyof typeof Icons;
}

interface ContactData {
  email: string;
  tel: string;
  social: {
    GitHub: SocialLink;
    LinkedIn: SocialLink;
    X: SocialLink;
  };
}

interface ContactCardProps {
  contact: ContactData;
  address?: string;
}

export function ContactCard({
  contact,
  address = "Gurugram, India",
}: ContactCardProps) {
  const handleEmailClick = () => {
    window.open(`mailto:${contact.email}`, "_blank");
  };

  const handlePhoneClick = () => {
    window.open(`tel:${contact.tel}`, "_blank");
  };
  const handleSocialClick = (url: string) => {
    window.open(url, "_blank");
  };
  return (
    <PixelCard variant="default" className="w-full">
      <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between space-y-2 lg:space-y-0 lg:space-x-4 px-1 py-0 w-full">
        <div className="text-center lg:text-left">
          <h2 className="text-heading text-2xl mb-1">{"Let's connect"}</h2>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2 justify-center lg:justify-start">
              <Mail className="w-4 h-4 text-foreground" />
              <div>
                {" "}
                <p className="text-body font-medium">Email</p>
                <p className="text-muted">{contact.email}</p>
              </div>
            </div>{" "}
            <div className="flex items-center space-x-2 justify-center lg:justify-start">
              <Phone className="w-4 h-4 text-foreground" />
              <div>
                <p className="text-body font-medium">Phone</p>
                <p className="text-muted">{contact.tel}</p>
              </div>
            </div>{" "}
            <div className="flex items-center space-x-2 justify-center lg:justify-start">
              <MapPin className="w-4 h-4 text-foreground" />
              <div>
                <p className="text-body font-medium">Address</p>
                <p className="text-muted">{address}</p>
              </div>
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex space-x-2">
            {Object.entries(contact.social).map(([key, social]) => {
              const IconComponent = Icons[social.icon];
              return (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialClick(social.url)}
                  className="p-2 hover:bg-accent hover:text-accent-foreground"
                  title={social.name}
                >
                  <IconComponent className="w-4 h-4" />
                </Button>
              );
            })}
          </div>

          <div className="flex space-x-2">
            {" "}
            <Button
              onClick={handleEmailClick}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Email me
            </Button>
            <Button
              onClick={handlePhoneClick}
              variant="outline"
              className="px-4 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              Call me
            </Button>
          </div>
        </div>
      </div>
    </PixelCard>
  );
}
