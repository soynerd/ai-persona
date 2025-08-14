"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const router = useRouter();

  const personas = [
    {
      id: "hitesh",
      name: "Hitesh Choudhary",
      bio: "Founder & Educator",
      image: "/hitesh-choudhary-portrait.jpg",
    },
    {
      id: "piyush",
      name: "Piyush Garg",
      bio: "Developer & Youtuber",
      image: "/piyush-garg-portrait.jpg",
    },
  ];

  const handlePersonaClick = (personaId: string) => {
    router.push(`/chat/${personaId}`);
  };

  const handleGroupChatClick = () => {
    router.push("/chat/tapari");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-orange-500 mb-4 tracking-tight">
            Chai aur Chat
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Start a fresh conversation anytime. Chats are not saved.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 justify-center items-center max-w-4xl mx-auto mb-4">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className={`persona-card bg-card rounded-3xl p-8 cursor-pointer border-2 transition-all duration-300 w-full max-w-sm ${
                hoveredCard === persona.id
                  ? "border-orange-500 shadow-xl"
                  : "border-transparent shadow-lg hover:border-orange-500"
              }`}
              onMouseEnter={() => setHoveredCard(persona.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => handlePersonaClick(persona.id)}
            >
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-6 overflow-hidden rounded-2xl">
                  <Image
                    src={persona.image || "/placeholder.svg"}
                    alt={`${persona.name} - ${persona.bio}`}
                    fill
                    className="persona-image object-cover"
                  />
                </div>

                <h2 className="text-2xl font-bold text-card-foreground mb-2">
                  {persona.name}
                </h2>
                <p className="text-muted-foreground text-lg font-medium">
                  {persona.bio}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center ">
          <p className="text-muted-foreground text-lg">
            Click on a persona to start your conversation
          </p>
        </div>

        <div className="text-center mt-20">
          <button
            onClick={handleGroupChatClick}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            🫖 Chai Tapari - Group Chat
          </button>
          <p className="text-sm text-muted-foreground mt-2">
            Join the community tea stall for group discussions
          </p>
        </div>
      </div>
    </div>
  );
}
