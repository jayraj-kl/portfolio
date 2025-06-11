"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Linkedin, Github, Twitter } from "lucide-react";
import { DotPattern } from "./backgrounds/Dot";

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
    <div className="mx-auto mb-4 max-w-7xl px-2 md:mb-8 xl:px-3">
      <div className="relative flex flex-col items-center border border-black dark:border-white">
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]"
          )}
        />
        <div className="absolute -left-1.5 -top-1.5 h-3 w-3 bg-black dark:bg-white text-white" />
        <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-black dark:bg-white text-white" />
        <div className="absolute -right-1.5 -top-1.5 h-3 w-3 bg-black dark:bg-white text-white" />{" "}
        <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-black dark:bg-white text-white" />
        <div className="relative z-20 p-2 lg:p-4 w-full">
          <div className="flex flex-col lg:flex-row items-start justify-between space-y-6 lg:space-y-0 lg:space-x-16 w-full">
            {/* Left side - Contact Info */}
            <div className="flex-1 w-full lg:w-auto">
              {" "}
              <h2 className="text-heading text-lg lg:text-xl mb-5">
                {"Let's connect"}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Mail className="w-4 h-4 text-foreground mt-1 flex-shrink-0" />{" "}
                  <div className="min-w-0 flex-1">
                    {" "}
                    <p className="text-body font-medium text-sm">Email</p>{" "}
                    <p className="text-muted text-sm break-all">
                      {contact.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="w-4 h-4 text-foreground mt-1 flex-shrink-0" />{" "}
                  <div className="min-w-0 flex-1">
                    {" "}
                    <p className="text-body font-medium text-sm">Phone</p>
                    <p className="text-muted text-sm">{contact.tel}</p>
                  </div>
                </div>{" "}
                <div className="flex items-start space-x-4">
                  <MapPin className="w-4 h-4 text-foreground mt-1 flex-shrink-0" />{" "}
                  <div className="min-w-0 flex-1">
                    {" "}
                    <p className="text-body font-medium text-sm">Address</p>
                    <p className="text-muted text-sm">{address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex flex-col items-start lg:items-end space-y-6 w-full lg:w-auto lg:flex-shrink-0">
              {/* Social Links */}
              <div className="w-full lg:w-auto">
                {" "}
                <p className="text-body font-medium text-sm mb-2 lg:text-right">
                  Follow me
                </p>
                <div className="flex space-x-3 justify-start lg:justify-end">
                  {Object.entries(contact.social).map(([key, social]) => {
                    const IconComponent =
                      Icons[social.icon as keyof typeof Icons];
                    return (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSocialClick(social.url)}
                        className="p-2.5 hover:bg-accent hover:text-accent-foreground"
                        title={social.name}
                      >
                        <IconComponent className="w-3 h-3" />
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full lg:w-auto">
                {" "}
                <p className="text-body font-medium text-sm mb-2 lg:text-right">
                  Get in touch
                </p>
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-2 xl:space-y-0 xl:space-x-3 w-full lg:w-auto">
                  <Button
                    onClick={handleEmailClick}
                    className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-full sm:w-auto"
                  >
                    Email me
                  </Button>
                  <Button
                    onClick={handlePhoneClick}
                    variant="outline"
                    className="px-6 py-2.5 hover:bg-accent hover:text-accent-foreground w-full sm:w-auto"
                  >
                    Call me
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
