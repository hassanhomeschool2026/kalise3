import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const RESOURCES = [
  {
    name: "988 Suicide & Crisis Lifeline",
    action: "Call or Text 988",
    href: "tel:988",
    icon: Phone,
    color: "bg-red-50 border-red-200 text-red-700",
    iconColor: "text-red-500",
  },
  {
    name: "Crisis Text Line",
    action: "Text HOME to 741741",
    href: "sms:741741?body=HOME",
    icon: MessageCircle,
    color: "bg-orange-50 border-orange-200 text-orange-700",
    iconColor: "text-orange-500",
  },
  {
    name: "International Association for Suicide Prevention",
    action: "Find help worldwide",
    href: "https://www.iasp.info/resources/Crisis_Centres/",
    icon: Heart,
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconColor: "text-purple-500",
  },
];

export default function CrisisModal({ open, onClose, onContinue }) {
  // Prevent scroll behind modal
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold">You matter. I'm here.</h2>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    What you're feeling is real, and you deserve real support right now. Please reach out — you don't have to do this alone.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground ml-3 mt-1 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Resources */}
            <div className="px-6 py-4 space-y-3">
              {RESOURCES.map((r) => {
                const Icon = r.icon;
                return (
                  <a
                    key={r.name}
                    href={r.href}
                    target={r.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all hover:shadow-sm ${r.color}`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${r.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold leading-tight">{r.name}</p>
                      <p className="text-xs opacity-75 mt-0.5">{r.action}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-1 space-y-2">
              <Button
                onClick={onContinue}
                variant="outline"
                className="w-full rounded-xl"
              >
                I'm okay — continue chatting with Kalise
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">
                Kalise is not a substitute for professional mental health care.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}