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
  address = "Mumbai, India",
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
      <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between space-y-6 lg:space-y-0 lg:space-x-8 p-6 w-full">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">
            {"Let's connect"}
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2 justify-center lg:justify-start">
              <Mail className="w-4 h-4 text-black dark:text-white" />
              <div>
                <p className="font-medium text-black dark:text-white">Email</p>
                <p className="opacity-80 text-black dark:text-white">
                  {contact.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 justify-center lg:justify-start">
              <Phone className="w-4 h-4 text-black dark:text-white" />
              <div>
                <p className="font-medium text-black dark:text-white">Phone</p>
                <p className="opacity-80 text-black dark:text-white">
                  {contact.tel}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 justify-center lg:justify-start">
              <MapPin className="w-4 h-4 text-black dark:text-white" />
              <div>
                <p className="font-medium text-black dark:text-white">
                  Address
                </p>
                <p className="opacity-80 text-black dark:text-white">
                  {address}
                </p>
              </div>
            </div>
          </div>
        </div>{" "}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-2">
            {Object.entries(contact.social).map(([key, social]) => {
              const IconComponent = Icons[social.icon];
              return (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialClick(social.url)}
                  className="p-2 border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
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
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition-opacity"
            >
              Email me
            </Button>
            <Button
              onClick={handlePhoneClick}
              variant="outline"
              className="px-4 py-2 border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
            >
              Call me
            </Button>
          </div>
        </div>
      </div>
    </PixelCard>
  );
}
