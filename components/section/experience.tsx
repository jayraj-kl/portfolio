"use client";

import React from "react";
import { TextAnimate } from "@/components/ui/text-animate";

export function ExperienceSection() {
  return (
    <>
      <section className="py-4 sm:py-6 md:py-8">
        {" "}
        <TextAnimate
          animation="slideLeft"
          by="character"
          className="text-heading text-balance text-xl font-bold leading-none tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4"
        >
          Experience
        </TextAnimate>
        <ul className="max-w-7xl mx-auto w-full gap-4 px-2 xl:px-3">
          {cards.map((card, index) => (
            <div
              key={`card-${card.title}-${index}`}
              className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl"
            >
              <div className="flex gap-4 flex-col md:flex-row ">
                <div>
                  <img
                    width={100}
                    height={100}
                    src={card.src || "/placeholder.svg"}
                    alt={card.title}
                    className="h-40 w-40 md:h-14 md:w-14 rounded-lg object-cover object-top"
                  />
                </div>
                <div className="">
                  {" "}
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left text-sm">
                    {card.title}
                  </h3>{" "}
                  <p className="text-neutral-600 dark:text-neutral-400 text-center md:text-left text-sm">
                    {card.description}
                  </p>{" "}
                  <p className="text-neutral-500 dark:text-neutral-500 text-xs font-medium text-center md:text-left">
                    {card.duration}
                  </p>
                </div>
              </div>
              <a
                href={card.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs rounded-full font-bold bg-gray-100 text-black mt-4 md:mt-0 transition-colors hover:bg-[#928DAB] hover:text-white"
              >
                {card.ctaText}
              </a>
            </div>
          ))}
        </ul>
      </section>
    </>
  );
}

const cards = [
  {
    description: "Software Development Intern",
    title: "Centre for Development of Advanced Computing (C-DAC)",
    duration: "Dec'24 - Feb'25",
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJWO9MyNOBGhMu-prp-Rr3a9rWCGzW4AlzUg&s",
    ctaText: "Learn More",
    ctaLink:
      "https://drive.google.com/file/d/1yYKWpBH5MFxKSCrhBHCude-0St0slr_U/view",
  },
];
