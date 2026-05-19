import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface KanbanCard {
  id: number;
  company: string;
  position: string;
  stage: "applied" | "interview" | "offer";
}

const initialCards: KanbanCard[] = [
  { id: 1, company: "Google", position: "Software Engineer", stage: "applied" },
  { id: 2, company: "Meta", position: "Frontend Developer", stage: "applied" },
  { id: 3, company: "Amazon", position: "SDE Intern", stage: "interview" },
  {
    id: 4,
    company: "Microsoft",
    position: "Product Manager",
    stage: "interview",
  },
];

export default function KanbanPreview() {
  const [cards, setCards] = useState(initialCards);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  // Automatic animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prevCards) => {
        const updatedCards = [...prevCards];
        const randomIndex = Math.floor(Math.random() * updatedCards.length);
        const card = updatedCards[randomIndex];

        // Cycle through stages
        if (card.stage === "applied") {
          card.stage = "interview";
        } else if (card.stage === "interview") {
          card.stage = "offer";
        } else {
          card.stage = "applied";
        }

        setActiveCard(card.id);
        setTimeout(() => setActiveCard(null), 800);

        return updatedCards;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getCardsByStage = (stage: KanbanCard["stage"]) => {
    return cards.filter((card) => card.stage === stage);
  };

  const stages = [
    {
      id: "applied",
      label: "Applied",
      color: "bg-neutral-100",
      count: getCardsByStage("applied").length,
    },
    {
      id: "interview",
      label: "Interview",
      color: "bg-brand-50",
      count: getCardsByStage("interview").length,
    },
    {
      id: "offer",
      label: "Offer",
      color: "bg-success-light",
      count: getCardsByStage("offer").length,
    },
  ] as const;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold text-neutral-700">
                {stage.label}
              </h3>
              <span className="text-xs font-medium text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded-full">
                {stage.count}
              </span>
            </div>

            <div
              className={`${stage.color} rounded-xl p-3 min-h-[240px] space-y-2 transition-colors`}
            >
              <AnimatePresence mode="popLayout">
                {getCardsByStage(stage.id as KanbanCard["stage"]).map(
                  (card) => (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        boxShadow:
                          activeCard === card.id
                            ? "0 10px 25px rgba(59, 130, 246, 0.2)"
                            : "0 1px 3px rgba(0, 0, 0, 0.1)",
                      }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={`bg-white rounded-lg p-3 cursor-pointer hover:shadow-elevation-2 transition-shadow ${
                        activeCard === card.id ? "ring-2 ring-brand-500" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-semibold text-neutral-900 truncate">
                          {card.company}
                        </h4>
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${
                            stage.id === "applied"
                              ? "bg-neutral-400"
                              : stage.id === "interview"
                                ? "bg-brand-500"
                                : "bg-success-DEFAULT"
                          }`}
                        />
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-2">
                        {card.position}
                      </p>
                    </motion.div>
                  ),
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center"></div>
    </div>
  );
}
