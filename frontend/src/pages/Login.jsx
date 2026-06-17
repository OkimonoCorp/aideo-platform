import React, {useState} from 'react';
import FormField from '../components/FormField';
import AuthLayout from '../components/AuthLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import {useNavigate} from "react-router-dom";

/**
 *
 * @param loginCallback
 */
function Login({loginCallback = () => {}}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const nav = useNavigate();

    const handleLogin = () => {
        if (isLoading) return;
        let settled = false;
        let timeoutId = null;
        const settle = () => {
            if (settled) return;
            settled = true;
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
        };

        setIsLoading(true);

        // Fallback: si pour une raison la tentative reste bloquée, on réactive le bouton après 10s
        timeoutId = setTimeout(() => {
            if (!settled) {
                settled = true;
                setIsLoading(false);
                alert('Le serveur ne répond pas. Réessayez.');
            }
        }, 10000);

        const onSuccess = () => {
            settle();
            nav('/info');
        };

        const onError = () => {
            settle();
            alert('Échec de la connexion. Vérifiez vos identifiants.');
        };

        try {
            const maybePromise = loginCallback(email, password, onSuccess, onError);

            // Safety net if loginCallback returns a promise instead of using callbacks.
            if (maybePromise?.finally) {
                maybePromise.finally(settle);
            } else if (maybePromise?.then) {
                maybePromise.then(settle).catch(settle);
            }
        } catch (err) {
            onError();
        }
    };

    return (
        <AuthLayout title="Connectez Vous" bottomLinkText="Nouveau sur Aidéo ?" bottomLinkHref="/register">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}
                className="flex flex-col gap-3"
            >
                <FormField
                    //dataTestId="field-identifiant"
                    icon={'/icons/account_circle.svg'}
                    iconAlt="account"
                    placeholder="Identifiant"
                    currentValue={email}
                    onChange={(value) => setEmail(value)}
                />

                {/* Mdp */}
                <FormField
                    //dataTestId="field-mdp"
                    icon={'/icons/lock.svg'}
                    iconAlt="lock"
                    placeholder="Mot de passe"
                    currentValue={password}
                    type={show ? "text" : "password"}
                    onChange={setPassword}

                iconExtra={show ? "/icons/visibility.svg" : "/icons/visibility_off.svg"}
                iconExtraAlt="toggle password visibility"
                extraIconButtonLabel="Afficher/Masquer le mot de passe"
                onExtraIconClick={() => setShow((s) => !s)}
                          
            />

            <button
                data-testid="button-connect-login"
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="mt-1 w-full py-3 rounded-full bg-primary text-on-primary dark:bg-primary dark:text-on-primary font-semibold flex items-center justify-center gap-2 transition-all duration-150 ease-in-out shadow-md hover:bg-primary/90 dark:hover:bg-primary/80 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary active:translate-y-[1px] active:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner size={18} color="white" />
                        <span>Connexion...</span>
                    </>
                ) : (
                    'Se connecter'
                )}
            </button>
            </form>
        </AuthLayout>
    );
}

export default Login;
