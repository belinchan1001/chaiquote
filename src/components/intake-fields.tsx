import type { ReactNode } from "react";
import { EsportsLineToggle } from "@/components/esports-line-tag";
import { useI18n } from "@/lib/i18n";
import type { Category, Housing } from "@/lib/plans";
import {
  BUSINESS_SPEEDS,
  EXPIRY_OPTIONS,
  FIBRE_SPEEDS,
  MOBILE_NEEDS,
  currentOptions,
  excludeProvider,
  isTargetConflict,
  targetOptions,
  type BusinessSpeedId,
  type CurrentId,
  type ExpiryId,
  type FibreSpeedId,
  type MobileNeedId,
  type TargetId,
} from "@/lib/port-in";
import { HOUSING_OPTIONS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Chip({
  selected,
  urgent,
  disabled,
  title,
  dataId,
  onSelect,
  children,
}: {
  selected: boolean;
  urgent?: boolean;
  disabled?: boolean;
  title?: string;
  dataId?: string;
  onSelect: () => void;
  children: ReactNode;
}) {
  const button = (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      title={title}
      data-chip={dataId}
      onClick={onSelect}
      className={cn(
        "chip-press inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        disabled
          ? "cursor-not-allowed bg-surface text-muted opacity-40"
          : selected && urgent
            ? "bg-hot text-hot-foreground"
            : selected
              ? "bg-primary text-primary-foreground"
              : "bg-surface text-fg hover:bg-border",
      )}
    >
      {children}
    </button>
  );
  if (disabled && title) {
    return (
      <span title={title} className="inline-flex">
        {button}
      </span>
    );
  }
  return button;
}

const HOUSING_KEYS = {
  public: "housingPublic",
  hos: "housingHos",
  private: "housingPrivate",
  village: "housingVillage",
} as const;

export function IntakeFields({
  cat,
  housing,
  onHousing,
  current,
  onCurrent,
  target,
  onTarget,
  expiry,
  onExpiry,
  fibreSpeed,
  onFibreSpeed,
  businessSpeed,
  onBusinessSpeed,
  mobileNeed,
  onMobileNeed,
  esports,
  onEsports,
  currentError,
  extraHousing,
}: {
  cat: Category;
  housing: string;
  onHousing: (id: Housing) => void;
  current: CurrentId | "";
  onCurrent: (id: CurrentId) => void;
  target: TargetId;
  onTarget: (id: TargetId) => void;
  expiry: ExpiryId | "";
  onExpiry: (id: ExpiryId) => void;
  fibreSpeed: FibreSpeedId | "";
  onFibreSpeed: (id: FibreSpeedId) => void;
  businessSpeed: BusinessSpeedId | "";
  onBusinessSpeed: (id: BusinessSpeedId) => void;
  mobileNeed: MobileNeedId | "";
  onMobileNeed: (id: MobileNeedId | "") => void;
  esports: boolean;
  onEsports: (next: boolean) => void;
  currentError?: string;
  extraHousing?: ReactNode;
}) {
  const { t } = useI18n();
  const showHousing = cat === "broadband" || cat === "home5g";
  const providerChoices = currentOptions(cat);
  const targetChoices = targetOptions(cat);

  return (
    <>
      {showHousing ? (
        <fieldset>
          <legend className="text-xs font-medium tracking-wider text-muted">{t("intakeHousing")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {HOUSING_OPTIONS.map((option) => (
              <Chip key={option.id} selected={housing === option.id} onSelect={() => onHousing(option.id)}>
                {t(HOUSING_KEYS[option.id])}
              </Chip>
            ))}
            {extraHousing}
          </div>
        </fieldset>
      ) : null}

      <fieldset id="intake-current">
        <legend className="text-xs font-medium tracking-wider text-muted">
          {cat === "mobile" ? t("intakeCurrentMobile") : t("intakeCurrentBb")}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {providerChoices.map((option) => (
            <Chip
              key={option.id}
              selected={current === option.id}
              dataId={`current-${option.id}`}
              onSelect={() => onCurrent(option.id)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
        {currentError ? <p className="mt-2 text-sm text-hot">{currentError}</p> : null}
      </fieldset>

      <fieldset>
        <legend className="text-xs font-medium tracking-wider text-muted">{t("intakeTarget")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {targetChoices.map((option) => {
            const blocked = isTargetConflict(current, option.id);
            return (
              <Chip
                key={option.id}
                selected={!blocked && target === option.id}
                disabled={blocked}
                title={blocked ? t("intakeTargetHint") : undefined}
                dataId={`target-${option.id}`}
                onSelect={() => {
                  if (blocked) return;
                  onTarget(option.id);
                }}
              >
                {option.id === "all" ? t("intakeTargetAny") : option.label}
              </Chip>
            );
          })}
        </div>
        {excludeProvider(current) ? <p className="mt-2 text-xs text-muted">{t("intakeTargetHint")}</p> : null}
      </fieldset>

      <fieldset>
        <legend className="text-xs font-medium tracking-wider text-muted">{t("intakeExpiry")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXPIRY_OPTIONS.map((option) => (
            <Chip
              key={option.id}
              selected={expiry === option.id}
              urgent={option.urgent}
              dataId={`expiry-${option.id}`}
              onSelect={() => onExpiry(option.id)}
            >
              {option.urgent
                ? t("intakeUrgent")
                : option.id === "2-3m"
                  ? t("intakeExpiry23")
                  : option.id === "4-6m"
                    ? t("intakeExpiry46")
                    : t("intakeExpiry6")}
            </Chip>
          ))}
        </div>
      </fieldset>

      {cat === "broadband" ? (
        <fieldset>
          <legend className="text-xs font-medium tracking-wider text-muted">{t("intakeSpeedNeed")}</legend>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {FIBRE_SPEEDS.map((option) => (
              <Chip
                key={option.id}
                selected={fibreSpeed === option.id}
                dataId={`speed-${option.id}`}
                onSelect={() => onFibreSpeed(option.id)}
              >
                {option.id === "any" ? t("intakeSpeedAny") : option.label}
              </Chip>
            ))}
            <EsportsLineToggle
              armed={esports}
              onToggle={() => onEsports(!esports)}
            />
          </div>
        </fieldset>
      ) : null}

      {cat === "business" ? (
        <fieldset>
          <legend className="text-xs font-medium tracking-wider text-muted">{t("intakeSpeedNeed")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {BUSINESS_SPEEDS.map((option) => (
              <Chip
                key={option.id}
                selected={businessSpeed === option.id}
                dataId={`biz-speed-${option.id}`}
                onSelect={() => onBusinessSpeed(option.id)}
              >
                {option.id === "any" ? t("intakeSpeedAny") : option.label}
              </Chip>
            ))}
          </div>
        </fieldset>
      ) : null}

      {cat === "mobile" ? (
        <fieldset>
          <legend className="text-xs font-medium tracking-wider text-muted">{t("intakeMobileNeed")}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {MOBILE_NEEDS.map((option) => (
              <Chip
                key={option.id}
                selected={mobileNeed === option.id}
                dataId={`need-${option.id}`}
                onSelect={() => onMobileNeed(mobileNeed === option.id ? "" : option.id)}
              >
                {option.label}
              </Chip>
            ))}
          </div>
        </fieldset>
      ) : null}
    </>
  );
}
