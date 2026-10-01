"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ButtonChecker from "@/components/ButtonChecker";
import { useAuth } from "@/components/providers/AuthProvider";
import { getDisplayName } from "@/utils/auth";
import { createClient } from "@/lib/supabase/client";
import { updateUserProfile } from "@/services/users";
import toast from "react-hot-toast";

export default function DatosView() {
  const { user } = useAuth();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [telefono, setTelefono] = React.useState("");
  const [dni, setDni] = React.useState("");
  const [nombreCompleto, setNombreCompleto] = React.useState("");
  const { data: cliente, isPending } = useQuery({
    queryKey: ["cliente", user?.id],
    queryFn: async () => {
      if (!user) return null;
      await supabase.auth.refreshSession();
      const { data, error } = await supabase
        .from("clientes")
        .select("telefono, dni")
        .eq("id_cliente", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching cliente:", error);
      }
      return data;
    },
    enabled: !!user,
  });

  React.useEffect(() => {
    setTelefono(
      cliente?.telefono || user?.user_metadata?.telefono || user?.phone || "",
    );
    setDni(
      cliente?.dni ||
        user?.user_metadata?.dni ||
        user?.user_metadata?.documento ||
        "",
    );
    if (user) {
      setNombreCompleto(getDisplayName(user));
    }
  }, [cliente, user]);

  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: async () => {
      // Invalidar queries para forzar recarga si es necesario
      await queryClient.invalidateQueries({ queryKey: ["cliente", user?.id] });
      toast.success("Perfil actualizado correctamente");
    },
    onError: (error) => {
      console.error("Error saving profile:", error);
      toast.error("Error al actualizar el perfil", { icon: "⚠️" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    
    // Separar nombre y apellido
    const parts = nombreCompleto.trim().split(" ");
    const nombre = parts[0] || "";
    const apellido = parts.slice(1).join(" ") || "";

    updateMutation.mutate({
      nombre,
      apellido,
      telefono: telefono || null,
      dni: dni ? Number(dni) : null,
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="font-display mb-6 text-2xl font-900 tracking-tight">
        Telemetría del Piloto
      </h3>
      <form
        onSubmit={handleSubmit}
        key={user?.id}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
            Nombre Completo
          </label>
          <input
            type="text"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            disabled={isPending}
            placeholder={isPending ? "Cargando..." : "Ingresar nombre completo"}
            className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600] disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
            Correo Electrónico
          </label>
          <input
            type="email"
            defaultValue={user?.email ?? ""}
            disabled
            placeholder={
              isPending ? "Cargando..." : "Ingresar correo electrónico"
            }
            className="w-full rounded-sm border border-[#1C1D24] bg-[#0B0B10] px-4 py-3.5 text-sm text-[#5C5D66] outline-none opacity-70 cursor-not-allowed"
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
            Teléfono
          </label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            disabled={isPending}
            placeholder={isPending ? "Cargando..." : "Insertar teléfono"}
            className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600] disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
            Pasaporte / ID (Para Vuelos y Hotel)
          </label>
          <input
            type="number"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            disabled={isPending}
            placeholder={isPending ? "Cargando..." : "Ingresar DNI"}
            className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600] disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div className="md:col-span-2 mt-4 flex items-center gap-4 border-t border-[#1C1D24] pt-6">
          <ButtonChecker
            type="submit"
            showArrow={true}
            disabled={updateMutation.isPending || isPending}
            className="px-8 py-3"
          >
            {updateMutation.isPending ? "Actualizando..." : "Actualizar Setup"}
          </ButtonChecker>

          
        </div>
      </form>
    </div>
  );
}
