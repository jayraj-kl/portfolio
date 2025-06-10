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
          className="text-balance text-xl font-semibold leading-none tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6"
        >
          Contact
        </TextAnimate>
        <ContactCard contact={DATA.contact} address="Mumbai, India" />
      </section>
    </>
  );
}
