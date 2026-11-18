import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { friendlyAuthError } from '../../utils/authErrors.js';
import { homePathFor } from '../../utils/homePath.js';
import { Modal } from '../ui/Modal.jsx';
import { ConsentCheckbox } from '../ui/ConsentCheckbox.jsx';
import { Button } from '../ui/Button.jsx';

export function GoogleIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/**
 * DPDP Act 2023: a brand-new account can never be created with consent we
 * assumed on the user's behalf. The initial Google call carries no consent
 * flag at all — the backend (authService.loginWithGoogle) only needs one
 * when it's about to create an account, and responds 428 with the Google
 * profile it already has when that happens. This component then shows the
 * person an actual Terms & Privacy checkbox they must click themselves
 * before retrying the same call with consent:true — no popup reopened, no
 * consent inferred from clicking "Sign in with Google" itself.
 */
export function GoogleAuthButton({
  label = 'Sign in with Google',
  redirectPath,
  onSuccess,
  className = '',
}) {
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pendingConsent, setPendingConsent] = useState(null); // { payload, profile } | null
  const [consentChecked, setConsentChecked] = useState(false);
  const tokenClientRef = useRef(null);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    window.__DUTYLAUNCH_GOOGLE_CLIENT_ID__ ||
    '';

  const finishLogin = (user) => {
    toast.success(`Signed in as ${user.name || user.email} via Google`);
    if (onSuccess) {
      onSuccess(user);
    } else {
      navigate(redirectPath || homePathFor(user.role), { replace: true });
    }
  };

  const executeGoogleLogin = async (payload) => {
    setLoading(true);
    try {
      const user = await loginWithGoogle(payload);
      finishLogin(user);
    } catch (err) {
      // api.js's response interceptor normalises AxiosError into a plain
      // Error with .status and .data (see services/api.js normalise()) —
      // there is no .response here.
      if (err?.status === 428 && err?.data?.requiresConsent) {
        // New account, nothing created yet — ask the person directly.
        setPendingConsent({ payload, profile: err.data.profile });
        setConsentChecked(false);
      } else {
        toast.error(friendlyAuthError(err, 'Could not complete Google Sign-In. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmConsentAndCreate = async () => {
    if (!pendingConsent || !consentChecked) return;
    const { payload } = pendingConsent;
    setPendingConsent(null);
    await executeGoogleLogin({ ...payload, consent: true });
  };

  useEffect(() => {
    // Initialize real Google Identity Services client if Google GIS is loaded and client ID exists
    if (clientId && window.google?.accounts?.oauth2) {
      try {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                // Fetch real userinfo from Google's official userinfo endpoint
                const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await userinfoRes.json();
                await executeGoogleLogin({
                  token: tokenResponse.access_token,
                  email: profile.email,
                  name: profile.name,
                  avatar: profile.picture,
                  googleId: profile.sub,
                });
              } catch (fetchErr) {
                toast.error('Failed to retrieve Google profile information.');
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          },
          error_callback: (err) => {
            setLoading(false);
            if (err?.type !== 'popup_closed') {
              toast.error('Google Sign-In was cancelled or could not be completed.');
            }
          },
        });
      } catch (err) {
        console.warn('Google Identity Services initialization warning:', err);
      }
    }
  }, [clientId]);

  const handleClick = () => {
    // If real Google Client ID is configured, trigger Google's real official OAuth popup
    if (clientId) {
      if (tokenClientRef.current) {
        setLoading(true);
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
        return;
      }
      if (window.google?.accounts?.oauth2) {
        try {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse?.access_token) {
                const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await userinfoRes.json();
                await executeGoogleLogin({
                  token: tokenResponse.access_token,
                  email: profile.email,
                  name: profile.name,
                  avatar: profile.picture,
                  googleId: profile.sub,
                });
              } else {
                setLoading(false);
              }
            },
          });
          setLoading(true);
          client.requestAccessToken({ prompt: 'select_account' });
          return;
        } catch (err) {
          console.error(err);
        }
      }
    }

    // If client ID is not yet provided in .env, clearly notify the user without fake accounts
    toast.error(
      'Google Sign-In is ready! To connect your real Google account, please set VITE_GOOGLE_CLIENT_ID in DutyLaunch-Frontend/.env.'
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`relative inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        <GoogleIcon className="h-5 w-5 shrink-0" />
        <span>{loading ? 'Opening Google Sign-In…' : label}</span>
      </button>

      <Modal
        open={Boolean(pendingConsent)}
        onClose={() => setPendingConsent(null)}
        title="Create your DutyLaunch account"
        description={
          pendingConsent?.profile?.email
            ? `There's no DutyLaunch account for ${pendingConsent.profile.email} yet. Agree to the terms below to create one.`
            : "There's no DutyLaunch account for this Google sign-in yet. Agree to the terms below to create one."
        }
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setPendingConsent(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!consentChecked || loading}
              loading={loading}
              onClick={confirmConsentAndCreate}
            >
              Agree & Create Account
            </Button>
          </div>
        }
      >
        <ConsentCheckbox
          data-autofocus
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
        />
      </Modal>
    </>
  );
}
