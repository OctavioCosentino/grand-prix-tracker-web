import React, { useState } from "react";
import toast from "react-hot-toast";
import Reveal from "./Reveal";
import Eyebrow from "./EyeBrow";
import TextBox from "./TextBox";
import ButtonChecker from "./ButtonChecker";

export default function FeedbackSection() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim() || submitted) return;
    setSubmitted(true);
    toast.success("Mensaje enviado con exito");
  }

  return (
    <section
      id="lista-de-espera"
      className="relative overflow-hidden border-t border-[#1C1D24] py-24 md:py-32"
    >
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-[#7C4DFF]/15 blur-[120px]" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <Eyebrow>Ayudanos a mejorar</Eyebrow>
          <h2 className="font-display mt-4 text-3xl font-900 tracking-tight md:text-5xl">
            Feedback y sugerencias del TP.
          </h2>
          <p className="mt-4 text-[#93949F]">
            GrandPrix Tracker es un proyecto universitario en desarrollo. ¿Encontraste algún bug o tenés ideas para mejorar la plataforma? Dejanos tu comentario para ayudarnos a pulir la experiencia.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-8">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-3">
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex w-full flex-col gap-4"
            >
              <TextBox
                value={feedback}
                onChange={(val) => setFeedback(val)}
                placeholder="Escribí acá tu sugerencia o error..."
                disabled={submitted}
              />
              <ButtonChecker
                className="mx-auto w-11/12 py-3.5 sm:w-5/6"
                showArrow={!submitted}
                type="submit"
                disabled={submitted}
              >
                {submitted ? "Mensaje enviado" : "Enviar"}
              </ButtonChecker>
            </form>
          </div>
          <p className="font-mono mt-4 text-[10px] tracking-[0.15em] text-[#5C5D66]">
            TODOS LOS COMENTARIOS SON BIENVENIDOS
          </p>
        </Reveal>
      </div>
    </section>
  );
}

