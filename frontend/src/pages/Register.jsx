import React, {useState, useEffect} from "react";
import FormField from "../components/FormField";
import AuthLayout from "../components/AuthLayout";
import CGUModal from "../components/CGUModal";
import TextArea from "../components/TextArea.jsx";
import {Post} from "../util/APIUtils.js";

function Register({createAccountCallback}) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        address: "",
        phone: "",
        companyName: "",
        siret: "",
        contactPerson: "",
        about: "",
    });
    const [role, setRole] = useState("aidant");

    const [hasReadCgu, setHasReadCgu] = useState(() => {
        return sessionStorage.getItem("cguRead") === "true";
    });
    const [agreed, setAgreed] = useState(false);
    const [flashInvalid, setFlashInvalid] = useState(false);
    const [showCguModal, setShowCguModal] = useState(false);

    useEffect(() => {
        if (hasReadCgu) {
            sessionStorage.setItem("cguRead", "true");
        }
    }, [hasReadCgu]);

    const handleChange = (field) => (value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isPartner = role === "partner";

        if (formData.password !== formData.confirmPassword) {
            alert("Les mots de passe ne correspondent pas.");
            return;
        }

        if (isPartner) {
            const siretClean = (formData.siret || "").replace(/\D/g, "");
            if (siretClean.length !== 14) {
                alert("Le SIRET doit contenir 14 chiffres.");
                return;
            }
            if (!formData.contactPerson.trim()) {
                alert("Veuillez renseigner une personne à contacter.");
                return;
            }
            if (!formData.phone.trim()) {
                alert("Un numéro de téléphone est requis pour un partenaire.");
                return;
            }
        }

        createAccountCallback({
            email: formData.email,
            nom: formData.lastName,
            prenom: formData.firstName,
            password: formData.password,
            adresse: formData.address || '',
            telephone: formData.phone || '',
            type: isPartner ? "professionnel" : "aidant",
            siret: isPartner ? formData.siret.replace(/\D/g, "") : undefined,
            nomContact: isPartner ? formData.contactPerson.trim() : undefined,
        });
    };

    return (
        <AuthLayout
            title="Créer un compte"
            bottomLinkText="J'ai déjà un compte Aidéo"
            bottomLinkHref="/login"
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div
                    className="w-full rounded-2xl bg-surface-container/70 backdrop-blur px-2 py-2 flex items-center justify-between border border-outline-variant shadow-sm">
                    <div
                        className="flex-1 flex items-center justify-between bg-surface-container-low rounded-xl p-1 text-sm font-medium text-on-surface-variant">
                        <button
                            type="button"
                            onClick={() => setRole("aidant")}
                            className={`flex-1 py-2 rounded-lg transition-all ${role === "aidant" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"} cursor-pointer`}
                        >
                            Particulier / Aidant
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("partner")}
                            className={`flex-1 py-2 rounded-lg transition-all ${role === "partner" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"} cursor-pointer`}
                        >
                            Partenaire
                        </button>
                    </div>
                </div>

                <div className="text-xs text-on-surface-variant text-center -mt-1 mb-2">
                    Choisissez votre espace : même expérience, droits adaptés.
                </div>

                <div className="flex gap-2 w-full">
                    <div className="flex-1 w-0.5">
                        <FormField
                            placeholder={role === 'partner' ? "Nom de l'entreprise" : "Nom"}
                            currentValue={formData.lastName}
                            onChange={handleChange("lastName")}
                            required={true}
                        />
                    </div>
                    {role === 'aidant' && (
                        < div className="flex-1 w-0.5">
                            <FormField
                                placeholder="Prénom"
                                currentValue={formData.firstName}
                                onChange={handleChange("firstName")}
                                required={true}
                            />
                        </div>
                    )}
                </div>

                <FormField
                    icon={"/icons/phone.svg"}
                    iconAlt="phone"
                    placeholder="Téléphone"
                    type="tel"
                    currentValue={formData.phone}
                    onChange={handleChange("phone")}
                />

                <FormField
                    icon={"/icons/location_on_blanc.svg"}
                    placeholder="Adresse"
                    currentValue={formData.address}
                    onChange={handleChange("address")}
                />

                {role === "partner" && (
                    <div
                        className="space-y-2 rounded-2xl bg-surface-container-low p-3 border border-outline-variant shadow-inner">
                        <div className="flex gap-2 w-full">
                            <div className="flex-1 w-0.5">
                                <FormField
                                    placeholder="SIRET (14 chiffres)"
                                    currentValue={formData.siret}
                                    onChange={handleChange("siret")}
                                    required={true}
                                />
                            </div>
                        </div>

                        <FormField
                            placeholder="Personne à contacter"
                            currentValue={formData.contactPerson}
                            onChange={handleChange("contactPerson")}
                            required={true}
                        />

                        <TextArea
                            className="w-full bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-inner text-on-surface placeholder-on-surface-variant"
                            placeholder="À propos de l'entreprise (optionnel) Ex:"
                            currentValue={formData.about}
                            onChange={handleChange("about")}
                        />
                    </div>
                )}

                <FormField
                    icon={"/icons/mail.svg"}
                    iconAlt="email"
                    placeholder="Email"
                    type="email"
                    currentValue={formData.email}
                    onChange={handleChange("email")}
                    required={true}
                />

                <FormField
                    icon={"/icons/lock.svg"}
                    iconAlt="password"
                    placeholder="Mot de passe"
                    type="password"
                    currentValue={formData.password}
                    onChange={handleChange("password")}
                    required={true}
                />

                <FormField
                    icon={"/icons/lock.svg"}
                    iconAlt="confirm"
                    placeholder="Confirmer le mot de passe"
                    type="password"
                    currentValue={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    required={true}
                />

                <div className="flex items-center gap-3 mt-2">
                    <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => {
                            if (!hasReadCgu) {
                                setFlashInvalid(true);
                                setTimeout(() => setFlashInvalid(false), 900);
                                return;
                            }
                            setAgreed(e.target.checked);
                        }}
                        className={`w-4 h-4 rounded border border-outline focus:ring-0 accent-primary ${
                            flashInvalid ? "border-error" : ""
                        }`}
                    />

                    <label className="text-sm text-on-surface">
                        J'ai lu et j'accepte les {" "}
                        <button
                            type="button"
                            onClick={() => {
                                setShowCguModal(true);
                            }}
                            className={`underline font-medium inline-block ${
                                hasReadCgu
                                    ? "text-primary"
                                    : flashInvalid
                                        ? "text-error"
                                        : "text-on-surface"
                            }`}
                        >
                            CGU
                        </button>
                    </label>
                </div>

                <button
                    type="submit"
                    className={`mt-2 w-full py-2 rounded-full bg-primary text-on-primary font-semibold hover:bg-primary/90 transition ${!agreed ? "opacity-70 cursor-not-allowed" : ""}`}
                    disabled={!agreed}
                >
                    Créer un compte
                </button>
            </form>

            <CGUModal
                isOpen={showCguModal}
                onClose={() => setShowCguModal(false)}
                onAccept={() => {
                    setHasReadCgu(true);
                    setShowCguModal(false);
                }}
            />
        </AuthLayout>
    );
};

export default Register;
