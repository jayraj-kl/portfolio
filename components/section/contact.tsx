import { ContactCard } from "@/components/contact-card";
import { DATA } from "@/data/resume";
import { TextAnimate } from "@/components/ui/text-animate";

export function ContactSection() {
  return (
    <>
      <section
        id="contact"
        className="pt-4 sm:pt-6 md:pt-8 lg:pt-10 xl:pt-12 pb-4 sm:pb-6 md:pb-8 lg:pb-10 xl:pb-12"
      >
        {" "}
        <TextAnimate
          animation="slideLeft"
          by="character"
          className="text-heading text-balance text-xl font-bold leading-none tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-3"
        >
          Contact
        </TextAnimate>
        <ContactCard contact={DATA.contact} address="Gurugram, India" />
      </section>
    </>
  );
}
