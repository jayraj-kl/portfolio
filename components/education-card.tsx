import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface EducationCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  description?: string;
}

export const EducationCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
}: EducationCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0">
      <CardContent className="p-1 md:p-2">
        <div className="flex items-start gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
            <Image
              src={logoUrl || "/placeholder.svg"}
              alt={altText}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>{" "}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1">
              {href ? (
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <h3 className="text-heading text-xs md:text-sm group-hover:text-primary transition-colors flex items-center gap-1">
                    {title}
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                </Link>
              ) : (
                <h3 className="text-heading text-xs md:text-sm">{title}</h3>
              )}
              <Badge
                variant="secondary"
                className="text-muted text-xs px-2 py-0.5 self-start"
              >
                {period}
              </Badge>
            </div>{" "}
            {subtitle && (
              <p className="text-body font-medium mb-1 text-xs">{subtitle}</p>
            )}
            {description && (
              <p className="text-muted text-xs mb-1">{description}</p>
            )}
            {badges && badges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-2xs text-muted"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
