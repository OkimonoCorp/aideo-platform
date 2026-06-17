import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import IconButton from "../../components/IconButton";
import LightModeIcon from "/icons/light_mode.svg?react";
import DarkModeIcon from "/icons/dark_mode.svg?react";
import Exit from "/icons/logout.svg?react";
import Button from "../../components/Button";
import FormField from "../../components/FormField";

/**
 * AdminAdvantagesPage
 * - UI 2 colonnes pleine hauteur
 * - Liste des demandes à gauche (sélection + surbrillance)
 * - Détails + prix + actions à droite
 * - 1 fake request (mock) tant que l'API n'existe pas
 *
 * Tailwind requis: dark mode via class (dark:)
 */
export default function AdminAdvantagesPage() {
  // Mock data (1 fake request)
  const initialRequests = useMemo(
    () => [
      {
        id: "req_001",
        companyName: "Garage Orion",
        createdAt: new Date().toISOString(),
        title: "Lavage premium gratuit",
        description:
          "Un lavage intérieur + extérieur offert pour toute prestation supérieure à 200€. Valable du lundi au vendredi, sur rendez-vous.",
        status: "PENDING",
      },
       {
        id: "req_002",
        companyName: " Orion",
        createdAt: new Date().toISOString(),
        title: "Lavage delux gratuit",
        description:
          "Un lavage intérieur + extérieur offert pour toute prestation supérieure à 200€. Valable du lundi au vendredi, sur rendez-vous.",
        status: "PENDING",
      },
    ],
    [],
  );

  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const selected = useMemo(
    () => requests.find((r) => r.id === selectedId) || null,
    [requests, selectedId],
  );

  const [price, setPrice] = useState(""); // string for controlled input
  const [flash, setFlash] = useState(null); // {type:'success'|'error', msg:string}
  const [showPriceError, setShowPriceError] = useState(false);

  // Use global theme context so toggle affects the whole app
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setRequests(initialRequests);
    setSelectedId(initialRequests[0]?.id ?? null);
  }, [initialRequests]);

  useEffect(() => {
    // Reset price when selecting a different request
    setPrice("");
    setFlash(null);
    setShowPriceError(false);
  }, [selectedId]);

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const priceNumber = Number(price);
  const isPriceValid = Number.isInteger(priceNumber) && priceNumber > 0;

  const removeAndAutoselect = (idToRemove) => {
    setRequests((prev) => {
      const idx = prev.findIndex((x) => x.id === idToRemove);
      const next = prev.filter((x) => x.id !== idToRemove);

      // choose next selection
      const nextSelected =
        next[idx]?.id ?? next[idx - 1]?.id ?? next[0]?.id ?? null;

      setSelectedId(nextSelected);
      return next;
    });
  };

  const handleReject = () => {
    if (!selected) return;
    const ok = window.confirm("Rejeter cette offre ?");
    if (!ok) return;

    setFlash(null);

    // Simule action (pas d'API)
    removeAndAutoselect(selected.id);
    setFlash({ type: "success", msg: "Offre rejetée." });
  };

  const handleApprove = () => {
    if (!selected) return;

    setFlash(null);

    if (!isPriceValid) {
      setFlash({
        type: "error",
        msg: "Prix invalide. Entrez un entier positif.",
      });
      return;
    }

    // Simule action (pas d'API)
    removeAndAutoselect(selected.id);
    setFlash({
      type: "success",
      msg: `Offre approuvée (prix: ${priceNumber} points).`,
    });
  };

  const handleLogout = () => {
    // Branche ton vrai logout ici (clear token, redirect, etc.)
    // Exemple:
    // localStorage.removeItem("token");
    // navigate("/login");
    alert("Logout (stub) — branche ton système d'auth ici.");
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-surface-field/90 text-on-surface relative overflow-hidden">
        
        {/* Background submark (same as AuthLayout) */}
        <img
          src={'/logo/logo_submark_secondaire.svg'}
          alt="submark"
          className="h-screen object-cover object-center absolute top-center left-1/2 -translate-x-1/2 w-250 opacity-90 filter drop-shadow-2xl" 
        />

        {/* Header top actions (theme + logout) */}
        <header className="rounded-3xl mx-4 sticky top-2 z-10 border-b border-outline bg-surface-container-high backdrop-blur-xl text-on-surface shadow-sm">
          <div className="mx-auto px-4 py-3 flex items-center justify-between">
            <div className="font-semibold tracking-tight">
              Admin · Validation des avantages
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
              <IconButton
                className="icon"
                icon={
                  isDark ? (
                    <DarkModeIcon className="fill-on-surface/80" />
                  ) : (
                    <LightModeIcon className="fill-on-surface/70" />
                  )
                }
                onClick={toggleTheme}
                title={isDark ? "Mode clair" : "Mode sombre"}
              />

              {/* Logout Button */}
              <IconButton
                className="icon"
                icon={<Exit className="fill-on-surface/70" />}
                onClick={handleLogout}
                title="Se déconnecter"
              />
            </div>
          </div>
        </header>

        {/* Main 2 columns */}
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left column */}
            <section className="lg:w-[46%]">
              <div className="h-[calc(100vh-140px)] rounded-[28px] border border-black/10 bg-surface-field backdrop-blur-xl shadow-sm flex flex-col">
                <div className="px-5 pt-5 pb-3">
                  <h2 className="text-lg font-semibold">Nouveaux avantages</h2>
                  <p className="text-sm text-on-surface/70 mt-1">
                    Demandes en attente de validation.
                  </p>
                </div>

                <div className="px-3 pb-3 flex-1 overflow-auto">
                  {requests.length === 0 ? (
                    <div className="p-4 rounded-2xl border border-black/10 bg-surface-field/95 shadow">
                      <div className="font-medium">Aucune nouvelle demande</div>
                      <div className="text-sm text-on-surface/70 mt-1">
                        Quand un partenaire soumet un avantage, il apparaîtra
                        ici.
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {requests.map((r) => {
                        const isSelected = r.id === selectedId;
                        return (
                          <li key={r.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedId(r.id)}
                              className={[
                                  "w-full text-left rounded-[22px] border px-4 py-4 transition",
                                  "focus:outline-none focus:ring-2 focus:ring-black/20",
                                  isSelected
                                    ? "border-black/10 bg-purple-200/90 shadow bg-purple-500/30"
                                    : "border-black/10 bg-white/95 hover:bg-white shadow bg-surface-container hover:bg-surface-container",
                                ].join(" ")}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold leading-tight">
                                    {r.companyName}
                                  </div>
                                  <div className="text-sm text-on-surface/70 mt-1">
                                    {formatDate(r.createdAt)}
                                  </div>
                                </div>

                                <span className="text-xs rounded-full px-2 py-1 border border-black/10 bg-surface-field/95 border-outline bg-surface-container dark:border-white/15 dark:text-on-surface">
                                  {r.status}
                                </span>
                              </div>

                              <div className="mt-3">
                                <div className="font-medium">{r.title}</div>
                                <p className="text-sm opacity-80 mt-1 line-clamp-2">
                                  {r.description}
                                </p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            {/* Right column */}
            <section className="lg:w-[54%]">
              <div className="h-[calc(100vh-140px)] rounded-[28px] border border-black/10 bg-surface-field backdrop-blur-xl shadow-sm flex flex-col">
                <div className="px-5 pt-5 pb-3">
                  <h2 className="text-lg font-semibold">
                    Approuver cette offre ?
                  </h2>
                  <p className="text-sm text-black/70 mt-1">
                    Vérifie les infos, attribue un prix en points, puis décide.
                  </p>
                </div>

                {/* Content */}
                <div className="px-5 pb-4 flex-1 overflow-auto">
                  {!selected ? (
                    <div className="p-4 rounded-2xl border border-black/10 bg-surface-field/95  shadow">
                      <div className="font-medium">Sélectionne une offre</div>
                      <div className="text-sm text-on-surface/70 mt-1">
                        Clique sur une demande à gauche pour voir les détails
                        ici.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 ">
                      {flash && (
                        <div
                          className={[
                            "rounded-2xl border px-4 py-3 text-sm ",
                            flash.type === "success"
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : "border-red-500/30 bg-red-500/10",
                          ].join(" ")}
                        >
                          {flash.msg}
                        </div>
                      )}

                      {/* Details block */}
                      <div className="text-on-surface/70 rounded-2xl border  border-black/10 bg-surface-field/95 shadow p-4">
                        <div className="text-sm text-on-surface/70 text-purple-500 ">Entreprise</div>
                        <div className="text-base font-semibold mt-1">
                          {selected.companyName}
                        </div>

                        <div className="mt-4 text-sm text-on-surface/70 text-purple-500 ">Libellé</div>
                        <div className="text-base font-semibold mt-1">
                          {selected.title}
                        </div>

                        <div className="mt-4 text-sm text-on-surface/70 text-purple-500 ">
                          Description
                        </div>
                        <p className="text-sm text-on-surface/90 mt-1 leading-relaxed">
                          {selected.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer (price + actions) */}
                <div className="px-5 pb-5 pt-4  rounded-3xl shadow m-1 bg-surface-field/50 ">
                  <div className="my-2 gap-3 flex flex-row items-center">

                    <div className="text-sm font-medium ">Prix</div>

                    {selected && ((price.length > 0 && !isPriceValid) || showPriceError) && (
                      <div className="w-fit rounded-2xl px-2  py-0.5 text-xs text-error bg-surface-field/40 shadow-inner shadow-error/50">
                        {price === "" && showPriceError 
                          ? "Veuillez saisir un prix." 
                          : "Le prix doit être un entier positif."}
                      </div>
                    )}
                  </div>
                  <FormField
                    type="number"
                    currentValue={price}
                    onChange={(v) => setPrice(v)}
                    placeholder="Affecter un prix"
                    className="w-full rounded-2xl bg-surface-field"
                    disabled={!selected}
                  />

                  <div className="mt-3 flex gap-3">
                    <Button
                      className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold bg-surface-field"
                      text="Rejeter"
                      onClick={handleReject}
                      onMouseEnter={() => setShowPriceError(false)}
                      onMouseLeave={() => setShowPriceError(false)}
                      active={!!selected}
                      activeStyle={"border border-black/10 bg-surface-field/70 hover:bg-surface-field transition border-outline bg-surface-container hover:bg-surface-container"}
                      inactiveStyle={"opacity-50 cursor-not-allowed"}
                    />

                    <Button
                      className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold bg-surface-field"
                      text="Approuver"
                      onClick={handleApprove}
                      onMouseEnter={() => {
                        if (selected && price === "") setShowPriceError(true);
                      }}
                      onMouseLeave={() => setShowPriceError(false)}
                      active={!!selected && isPriceValid}
                      activeStyle={"border border-black/10 bg-emerald-500/80 hover:bg-emerald-500 transition border-outline"}
                      inactiveStyle={"opacity-50 cursor-not-allowed"}
                    />
                  </div>

                  
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
