import { ContactCard } from "@/components/contact-card";
import { DATA } from "@/data/resume";
import { TextAnimate } from "@/components/ui/text-animate";

export function ContactSection() {
  return (
    <>
      <section className="pt-4 sm:pt-6 md:pt-8 pb-0">
        <TextAnimate
          animation="slideLeft"
          by="character"
          className="text-heading text-balance text-xl font-bold leading-none tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-3"
        >
          Contact
        </TextAnimate>
        <ContactCard contact={DATA.contact} address="Gurugram, India" />
      </section>
    </>
  );
}
