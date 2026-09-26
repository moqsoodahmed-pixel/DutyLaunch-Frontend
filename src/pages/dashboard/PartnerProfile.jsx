import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, ExternalLink, XCircle } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LoadingBlock, ErrorState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { partnerService } from '../../services/contentService.js';
import { TRACKS, programmesIn, programmeHref } from '../../data/programmes.js';
import { cn } from '../../utils/cn.js';

const MODES = ['Online', 'Distance', 'Regular', 'Classroom', 'Hybrid'];

function StatusBanner({ profile }) {
  if (!profile) {
    return (
      <div className="rounded-lg border border-line bg-paper p-4 text-small text-slate-600">
        Complete your profile below. Once our team has reviewed it, your institute appears on the DutyLaunch pages for
        every programme you select.
      </div>
    );
  }
  const live = programmesIn(profile.track).filter((p) => profile.programmes?.includes(p.slug));
  const cfg = {
    pending: { icon: Clock, tone: 'border-amber-500/30 bg-amber-500/10', title: 'Under review', body: 'Thanks — our team is reviewing your profile. It becomes visible on DutyLaunch once approved, usually within one working day.' },
    approved: { icon: CheckCircle2, tone: 'border-success/30 bg-success/10', title: 'Live on DutyLaunch', body: `Your institute is listed as a DutyLaunch partner on ${live.length} ${TRACKS[profile.track].noun} page${live.length === 1 ? '' : 's'}.` },
    rejected: { icon: XCircle, tone: 'border-danger/30 bg-danger/10', title: 'Changes needed', body: 'Your profile wasn’t approved yet. Update it below and save to send it for review again.' },
  }[profile.status];
  const Icon = cfg.icon;
  return (
    <div className={cn('rounded-lg border p-4', cfg.tone)}>
      <p className="flex items-center gap-2 text-body font-bold text-ink">
        <Icon className="h-5 w-5" aria-hidden />
        {cfg.title}
      </p>
      <p className="mt-1 text-small text-slate-700">{cfg.body}</p>
      {profile.status === 'rejected' && profile.reviewNote && (
        <p className="mt-2 rounded bg-white/70 px-3 py-2 text-small text-ink">
          <span className="font-semibold">Note from our team:</span> {profile.reviewNote}
        </p>
      )}
      {profile.status === 'approved' && live.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {live.map((p) => (
            <li key={p.slug}>
              <Link
                to={programmeHref(profile.track, p.item)}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-caption font-semibold text-azure-700 hover:border-azure-300"
              >
                {p.item}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PartnerProfile() {
  const toast = useToast();
  const { data, loading, error, refetch } = useApi(() => partnerService.mine(), []);
  // A new institute has no profile yet: the API answers { data: null }, and
  // useApi's `response.data ?? response` then hands back the whole envelope.
  // Only treat it as a profile if it's a real saved document.
  const profile = data?._id ? data : null;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: { name: '', location: '', mode: '', website: '', contactPhone: '', about: '' },
  });
  // Track and programmes are set by buttons, not typed into inputs, so they
  // live in React state rather than the form (react-hook-form's watch()
  // returns undefined for fields no input registered).
  const [track, setTrack] = useState('education');
  const [selected, setSelected] = useState([]);
  const [choicesDirty, setChoicesDirty] = useState(false);

  // Load the saved profile into the form once it arrives.
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        track: profile.track || 'education',
        location: profile.location || '',
        mode: profile.mode || '',
        website: profile.website || '',
        contactPhone: profile.contactPhone || '',
        about: profile.about || '',
      });
      setTrack(profile.track || 'education');
      setSelected(profile.programmes || []);
      setChoicesDirty(false);
    }
  }, [profile, reset]);

  const about = watch('about') || '';

  // Group this track's programmes the same way the public pages do.
  const groups = useMemo(() => {
    const out = [];
    for (const p of programmesIn(track)) {
      let g = out.find((x) => x.title === p.group);
      if (!g) out.push((g = { title: p.group, items: [] }));
      g.items.push(p);
    }
    return out;
  }, [track]);

  const changeTrack = (next) => {
    setTrack(next);
    // Programmes belong to one track — clear them when switching.
    setSelected([]);
    setChoicesDirty(true);
  };

  const toggle = (slug) => {
    setSelected((cur) => (cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]));
    setChoicesDirty(true);
    clearErrors('programmes');
  };

  const onSubmit = async (values) => {
    if (!selected.length) {
      setError('programmes', { message: `Choose at least one ${TRACKS[track].noun}` });
      return;
    }
    try {
      const saved = (await partnerService.saveMine({ ...values, track, programmes: selected }))?.data;
      toast.success(saved?.status === 'pending' ? 'Saved — sent to our team for review' : 'Profile updated');
      refetch();
    } catch (err) {
      err.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      toast.error(err.message || 'Could not save your profile');
    }
  };

  if (loading) return <LoadingBlock label="Loading your profile" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <>
      <PanelHeader
        title="Partner profile"
        description="How your institute appears on DutyLaunch, and which programmes you're listed under."
      />

      <StatusBanner profile={profile} />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8" noValidate>
        <section className="tile space-y-5 p-5 sm:p-6">
          <h2 className="text-h3 font-bold text-ink">Institute details</h2>
          <Input
            label="Institute name"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Enter your institute name', minLength: { value: 2, message: 'Enter your institute name' } })}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="City"
              hint='Or "Online" if you teach online only'
              required
              error={errors.location?.message}
              {...register('location', { required: 'Enter a city, or "Online"' })}
            />
            <Select
              label="Study mode"
              required
              placeholder="Select a mode"
              options={MODES}
              error={errors.mode?.message}
              {...register('mode', { required: 'Choose a study mode' })}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Website"
              placeholder="https://"
              type="url"
              error={errors.website?.message}
              {...register('website', {
                validate: (v) => !v || /^https?:\/\/.+\..+/.test(v) || 'Enter a full URL, starting with https://',
              })}
            />
            <Input
              label="Contact phone"
              hint="For our team only — not shown publicly"
              type="tel"
              error={errors.contactPhone?.message}
              {...register('contactPhone')}
            />
          </div>
          <Textarea
            label="Short description"
            hint={`${about.length}/280 · shown on your listing`}
            rows={3}
            maxLength={280}
            error={errors.about?.message}
            {...register('about', { maxLength: { value: 280, message: 'Keep it under 280 characters' } })}
          />
        </section>

        <section className="tile p-5 sm:p-6">
          <h2 className="text-h3 font-bold text-ink">What do you offer?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Partner type">
            {Object.entries(TRACKS).map(([key, t]) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={track === key}
                onClick={() => track !== key && changeTrack(key)}
                className={cn(
                  'rounded-lg border-[1.5px] p-4 text-left transition-all',
                  track === key ? 'border-azure-500 bg-azure-50' : 'border-line bg-white hover:border-azure-300'
                )}
              >
                <span className={cn('block text-small font-bold', track === key ? 'text-azure-700' : 'text-ink')}>
                  {t.label}
                </span>
                <span className="text-caption text-slate-500">
                  {key === 'education' ? 'Schools, colleges and universities' : 'Training and certification providers'}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-small font-semibold text-ink">
            {TRACKS[track].label}: choose every {TRACKS[track].noun} you offer
            <span className="ml-2 font-normal text-slate-500">({selected.length} selected)</span>
          </p>
          {errors.programmes && <p className="mt-1 text-caption text-danger">{errors.programmes.message}</p>}

          <div className="mt-4 space-y-5">
            {groups.map((g) => (
              <fieldset key={g.title}>
                <legend className="mb-2 text-caption font-semibold uppercase tracking-wide text-slate-500">{g.title}</legend>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((p) => {
                    const on = selected.includes(p.slug);
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(p.slug)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-small font-medium transition-colors',
                          on ? 'border-azure-500 bg-azure-500 text-white' : 'border-line bg-paper text-slate-700 hover:border-azure-300'
                        )}
                      >
                        {on && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
                        {p.item}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" size="lg" loading={isSubmitting} disabled={isSubmitting || (profile && !isDirty && !choicesDirty)}>
            {profile ? 'Save changes' : 'Submit for review'}
          </Button>
          {profile?.status === 'approved' && (
            <p className="text-caption text-slate-500">
              Changing your institute name or website sends the profile back for a quick review.
            </p>
          )}
        </div>
      </form>
    </>
  );
}
