import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PageHero, Panel } from "@/components/layout/app-shell";
import { marketControl } from "@/components/market-controls";
import { ItemIcon } from "@/components/ui/item-icon";
import { usePlayer } from "@/hooks/use-account";
import {
  calculateSimulation,
  ARTISANAL_SHORTBOW_ID,
  isOwnedMeleeWeapon,
  MOB_TARGETS,
  readDisplayedCombatStats,
  type CombatStats,
} from "@/lib/damage-simulator";
import { fetchSimulatorWeapons } from "@/lib/hypixel.functions";
import { getPetCombatStats, PET_CATALOG } from "@/lib/pet-catalog";
import { formatFull } from "@/lib/skyblock";

export const Route = createFileRoute("/simulator")({
  validateSearch: (search: Record<string, unknown>): { weapon?: string } =>
    typeof search["weapon"] === "string" && /^[A-Z0-9_]{1,100}$/.test(search["weapon"])
      ? { weapon: search["weapon"] }
      : {},
  head: () => ({ meta: [{ title: "Damage Simulator — SkyForge" }] }),
  component: SimulatorPage,
});

const control = marketControl + " mt-1 block w-full";
const editableStats = [
  ["STRENGTH", "Strength"],
  ["CRIT_DAMAGE", "Crit Damage (%)"],
  ["HEALTH", "Health"],
  ["DEFENSE", "Defense"],
] as const;

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = "any",
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number | "any";
  placeholder?: string;
}) {
  return (
    <label className="block min-w-0 text-sm text-muted-foreground">
      {label}
      <input
        type="number"
        inputMode="decimal"
        className={control}
        value={value ?? ""}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(event) => {
          const number = event.target.valueAsNumber;
          onChange(Number.isFinite(number) ? number : null);
        }}
      />
    </label>
  );
}

function StatFields({
  values,
  onChange,
}: {
  values: CombatStats;
  onChange: (stats: CombatStats) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {editableStats.map(([key, label]) => (
        <NumberField
          key={key}
          label={label}
          placeholder="0"
          value={values[key] ?? null}
          onChange={(value) => {
            const next = { ...values };
            if (value === null) delete next[key];
            else next[key] = value;
            onChange(next);
          }}
        />
      ))}
    </div>
  );
}

function SimulatorPage() {
  const player = usePlayer();
  const profile = player.data;
  const catalog = useQuery({
    queryKey: ["simulator-weapons"],
    queryFn: () => fetchSimulatorWeapons(),
    staleTime: 30 * 60_000,
    retry: false,
  });

  const { weapon: initialWeapon } = Route.useSearch();
  const [weaponChoice, setWeaponChoice] = useState(initialWeapon ?? "");
  const [customWeapon, setCustomWeapon] = useState<CombatStats>({});
  const [combatLevel, setCombatLevel] = useState<number | null>(0);
  const [petChoice, setPetChoice] = useState<{
    id: string;
    rarity: string;
    level: number | null;
  } | null>(null);
  const [gearProfile, setGearProfile] = useState<string | null>(null);
  const [additional, setAdditional] = useState<CombatStats>({});
  const [targetId, setTargetId] = useState("");
  const [targetDefense, setTargetDefense] = useState<number | null>(null);

  const weaponLookup = useMemo(
    () => new Map(catalog.data?.map((weapon) => [weapon.id, weapon])),
    [catalog.data],
  );
  const readableContainers = profile?.availability?.containerIds ?? [];
  const profileKey = profile ? profile.uuid + ":" + profile.activeProfileId : null;
  const readableGear =
    readableContainers.includes("armor") || readableContainers.includes("equipment");
  const usingGear = gearProfile !== null && gearProfile === profileKey && readableGear;
  const gearItems =
    profile?.containers
      .filter(
        (container) =>
          (container.id === "armor" || container.id === "equipment") &&
          readableContainers.includes(container.id) &&
          !container.locked,
      )
      .flatMap((container) => container.items) ?? [];
  const gear = usingGear
    ? gearItems.flatMap((item) => {
        const stats = readDisplayedCombatStats(item);
        return stats ? [stats] : [];
      })
    : [];

  const ownedWeapons =
    profile?.containers.flatMap((container) =>
      readableContainers.includes(container.id) && !container.locked
        ? container.items
            .filter((item) => isOwnedMeleeWeapon(item, weaponLookup))
            .map((item) => ({
              value: `owned:${profileKey}:${container.id}:${item.slot}`,
              item,
              label: `${item.name} · ${container.label} #${item.slot + 1}`,
            }))
        : [],
    ) ?? [];
  const ownedWeapon = ownedWeapons.find((entry) => entry.value === weaponChoice)?.item;
  const catalogWeapon = weaponLookup.get(weaponChoice);
  const flintArrow = catalogWeapon?.id === ARTISANAL_SHORTBOW_ID;
  const supportedWeapon = Boolean(catalogWeapon?.melee || flintArrow);
  const weapon =
    weaponChoice === "unarmed"
      ? { DAMAGE: 0 }
      : weaponChoice === "custom"
        ? customWeapon
        : ownedWeapon
          ? readDisplayedCombatStats(ownedWeapon)
          : supportedWeapon
            ? (catalogWeapon?.stats ?? null)
            : null;
  const weaponIcon = ownedWeapon ?? catalogWeapon;

  const petEntry = PET_CATALOG.find((entry) => entry.id === petChoice?.id);
  const petStats =
    petChoice === null
      ? {}
      : petChoice.level === null
        ? null
        : getPetCombatStats(petChoice.id, petChoice.rarity, petChoice.level);
  const ownedPets = (profile?.pets ?? []).filter((pet) => pet.typeId);
  const activeCombat = profile?.skills.find(
    (skill) => skill.key === "COMBAT" && profile.availability?.skillKeys.includes(skill.key),
  );

  const mob = MOB_TARGETS.find((target) => target.id === targetId);
  const projectileBlocked = flintArrow && mob?.flintArrow === "immune";
  const projectileUnverified = flintArrow && mob !== undefined && mob.flintArrow === undefined;
  const result = calculateSimulation({
    combatLevel: combatLevel ?? Number.NaN,
    weapon,
    pet: petStats,
    gear,
    additional,
    targetDefense: mob && !projectileBlocked && !projectileUnverified ? targetDefense : null,
    flintArrow,
  });

  const damageContext = result.afterDefense ? "After target defense" : "Before target defense";
  const shownNormal = projectileBlocked
    ? 0
    : projectileUnverified
      ? null
      : (result.afterDefense?.normal ?? result.normalHit);
  const shownCrit = projectileBlocked
    ? 0
    : projectileUnverified
      ? null
      : (result.afterDefense?.critical ?? result.critHit);
  const hitContext = projectileBlocked ? "Target avoids Flint Arrows" : damageContext;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHero title="Damage Simulator" />
      <p className="text-sm text-muted-foreground">
        Estimate an overworld melee hit or a single shot from a base Artisanal Shortbow with a Flint
        Arrow.
      </p>

      <div aria-live="polite" className="grid gap-3 sm:grid-cols-3">
        <Panel className="p-4">
          <p className="text-sm text-muted-foreground">Normal hit</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {shownNormal === null ? "—" : formatFull(shownNormal)}
          </p>
          {shownNormal !== null && <p className="text-xs text-muted-foreground">{hitContext}</p>}
        </Panel>
        <Panel className="p-4">
          <p className="text-sm text-muted-foreground">Critical hit</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {shownCrit === null ? "—" : formatFull(shownCrit)}
          </p>
          {shownCrit !== null && <p className="text-xs text-muted-foreground">{hitContext}</p>}
        </Panel>
        <Panel className="p-4">
          <p className="text-sm text-muted-foreground">Effective health</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {result.effectiveHealth === null ? "—" : formatFull(result.effectiveHealth)}
          </p>
          <p className="text-xs text-muted-foreground">Against damage reduced by Defense</p>
        </Panel>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Panel className="space-y-4">
          <h2 className="font-semibold">Weapon</h2>
          <label className="block text-sm text-muted-foreground">
            Select weapon
            <select
              value={weaponChoice}
              onChange={(e) => setWeaponChoice(e.target.value)}
              className={control}
            >
              <option value="">Choose a weapon</option>
              <option value="unarmed">Unarmed</option>
              <option value="custom">Enter melee weapon stats</option>
              {ownedWeapons.length > 0 && (
                <optgroup label="Owned melee weapons">
                  {ownedWeapons.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </optgroup>
              )}
              {catalog.data && (
                <>
                  <optgroup label="Catalog · Melee weapons">
                    {catalog.data
                      .filter((item) => item.melee)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Catalog · Bows and wands">
                    {catalog.data
                      .filter((item) => !item.melee)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </optgroup>
                </>
              )}
            </select>
          </label>
          {catalog.isPending && (
            <p role="status" className="text-sm text-muted-foreground">
              Loading weapon catalog…
            </p>
          )}
          {(catalog.isError || catalog.data?.length === 0) && (
            <p role="status" className="text-sm text-muted-foreground">
              Catalog unavailable. You can enter weapon stats manually.{" "}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => void catalog.refetch()}
              >
                Retry
              </button>
            </p>
          )}
          {weaponIcon && (
            <div className="flex items-start gap-3">
              <ItemIcon
                id={weaponIcon.id}
                name={weaponIcon.name}
                {...(ownedWeapon?.texture ? { texture: ownedWeapon.texture } : {})}
                className="size-8 shrink-0"
              />
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium">{weaponIcon.name}</p>
                <p className="text-xs text-muted-foreground">
                  {ownedWeapon ? "Displayed stats from this copy" : "Catalog base stats"}
                  {ownedWeapon?.stars ? ` · ${ownedWeapon.stars} stars` : ""}
                  {ownedWeapon?.rarityUpgrades ? " · Rarity upgraded" : ""}
                </p>
                {catalogWeapon && (
                  <Link
                    to="/wiki/$itemId"
                    params={{ itemId: catalogWeapon.id }}
                    className="text-xs text-primary hover:underline"
                  >
                    View item requirements
                  </Link>
                )}
              </div>
            </div>
          )}
          {flintArrow && (
            <p className="text-sm text-muted-foreground">
              One Flint Arrow adds 1 base Damage. The estimate is per shot, without attack speed or
              extra projectile effects.
            </p>
          )}
          {catalogWeapon && !supportedWeapon && (
            <p role="status" className="text-sm text-muted-foreground">
              Choose a melee weapon to calculate a hit. This item uses a separate damage model.
            </p>
          )}
          {(ownedWeapon || supportedWeapon) && weapon?.DAMAGE === undefined && (
            <p role="status" className="text-sm text-muted-foreground">
              Weapon damage is unavailable. Enter the displayed stats manually.
            </p>
          )}
          {weaponChoice === "custom" && (
            <div className="space-y-3">
              <NumberField
                label="Weapon damage"
                value={customWeapon.DAMAGE ?? null}
                min={0}
                onChange={(value) => {
                  const next = { ...customWeapon };
                  if (value === null) delete next.DAMAGE;
                  else next.DAMAGE = value;
                  setCustomWeapon(next);
                }}
              />
              <StatFields values={customWeapon} onChange={setCustomWeapon} />
            </div>
          )}
          {player.connected && profile && !readableContainers.includes("inventory") && (
            <p className="text-xs text-muted-foreground">
              Main inventory is unavailable for this profile.
            </p>
          )}
        </Panel>

        <Panel className="space-y-4">
          <h2 className="font-semibold">Pet</h2>
          <div className="block text-sm text-muted-foreground">
            <label htmlFor="simulator-pet">Select pet</label>
            <select
              id="simulator-pet"
              className={control}
              value={petChoice?.id ?? ""}
              onChange={(event) => {
                const pet = PET_CATALOG.find((entry) => entry.id === event.target.value);
                setPetChoice(pet ? { id: pet.id, rarity: pet.rarities[0] ?? "", level: 1 } : null);
              }}
            >
              <option value="">No pet</option>
              {PET_CATALOG.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              ))}
            </select>
          </div>
          {ownedPets.length > 0 && (
            <label className="block text-sm text-muted-foreground">
              Import an owned pet
              <select
                className={control}
                value=""
                onChange={(event) => {
                  const pet = ownedPets[Number(event.target.value)];
                  if (event.target.value && pet?.typeId)
                    setPetChoice({ id: pet.typeId, rarity: pet.rarity, level: pet.level });
                }}
              >
                <option value="">Choose from profile</option>
                {ownedPets.map((pet, index) => (
                  <option key={pet.instanceId ?? index} value={index}>
                    {pet.name} · {pet.rarity} · Lv {pet.level ?? "—"}
                    {pet.active ? " · Active" : ""}
                  </option>
                ))}
              </select>
            </label>
          )}
          {petChoice && petEntry && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-muted-foreground">
                Pet rarity
                <select
                  className={control}
                  value={petChoice.rarity}
                  onChange={(event) => setPetChoice({ ...petChoice, rarity: event.target.value })}
                >
                  {!petEntry.rarities.includes(petChoice.rarity) && (
                    <option value={petChoice.rarity}>{petChoice.rarity}</option>
                  )}
                  {petEntry.rarities.map((rarity) => (
                    <option key={rarity} value={rarity}>
                      {rarity}
                    </option>
                  ))}
                </select>
              </label>
              <NumberField
                label="Pet level"
                value={petChoice.level}
                min={1}
                max={petEntry.maxLevel}
                step={1}
                onChange={(level) => setPetChoice({ ...petChoice, level })}
              />
            </div>
          )}
          {petChoice && !petStats && (
            <p role="status" className="text-sm text-muted-foreground">
              Combat stats are unavailable for this pet, rarity, or level.
            </p>
          )}
          {petChoice && petStats && (
            <p className="text-xs text-muted-foreground">
              Includes estimated base pet stats. Pet perks and held items require a separate
              calculation.
            </p>
          )}
        </Panel>

        <Panel className="space-y-4">
          <h2 className="font-semibold">Player stats</h2>
          <div className="flex flex-wrap items-end gap-3">
            <NumberField
              label="Combat level"
              value={combatLevel}
              min={0}
              max={60}
              step={1}
              onChange={setCombatLevel}
            />
            {activeCombat && (
              <button
                type="button"
                className={marketControl}
                onClick={() => setCombatLevel(activeCombat.level)}
              >
                Use profile Combat {activeCombat.level}
              </button>
            )}
            {readableGear && (
              <button
                type="button"
                className={marketControl}
                aria-pressed={usingGear}
                onClick={() => setGearProfile(usingGear ? null : profileKey)}
              >
                {usingGear ? "Remove imported gear" : "Use equipped gear"}
              </button>
            )}
          </div>
          {usingGear && (
            <p className="text-xs text-muted-foreground">
              Using displayed stats from {gear.length} equipped{" "}
              {gear.length === 1 ? "piece" : "pieces"}.
              {gearItems.length > gear.length
                ? ` ${gearItems.length - gear.length} pieces have no readable combat stats.`
                : ""}
              {!readableContainers.includes("armor") ? " Armor data is unavailable." : ""}
              {!readableContainers.includes("equipment") ? " Equipment data is unavailable." : ""}
            </p>
          )}
          <div>
            <p className="mb-2 text-sm font-medium">Additional stats</p>
            <StatFields values={additional} onChange={setAdditional} />
            <p className="mt-2 text-xs text-muted-foreground">
              Enter other bonuses from your in-game stats breakdown, such as Accessories or effects.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-sm tabular-nums">
            {(
              [
                ["Strength", result.strength],
                ["Crit Damage", result.critDamage],
                ["Health", result.health],
                ["Defense", result.defense],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>
                  {value.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  {label === "Crit Damage" ? "%" : ""}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel className="space-y-4">
          <h2 className="font-semibold">Target mob</h2>
          <label className="block text-sm text-muted-foreground">
            Choose a target
            <select
              className={control}
              value={targetId}
              onChange={(event) => {
                const selected = MOB_TARGETS.find((entry) => entry.id === event.target.value);
                setTargetId(event.target.value);
                setTargetDefense(selected?.defense ?? null);
              }}
            >
              <option value="">Compare before target defense</option>
              {MOB_TARGETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>
          {mob && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{formatFull(mob.health)} HP</p>
              <NumberField
                label="Target Defense"
                value={targetDefense}
                min={0}
                placeholder="Unknown"
                onChange={setTargetDefense}
              />
              {projectileUnverified && (
                <p className="text-xs text-muted-foreground">
                  Flint Arrow behavior is unverified for this target. Choose another target or
                  compare before target defense.
                </p>
              )}
              {targetDefense === null && !projectileUnverified && !projectileBlocked && (
                <p className="text-xs text-muted-foreground">
                  Defense is unverified for this target. Hit values are shown before mitigation.
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Dungeon scaling, enchantment bonuses, abilities, and mob-specific modifiers require
            separate calculations.
          </p>
          <a
            className="text-xs text-primary hover:underline"
            href="https://hypixelskyblock.minecraft.wiki/w/Damage_Calculation"
          >
            Damage formula
          </a>
          <a
            className="ml-3 text-xs text-primary hover:underline"
            href="https://hypixelskyblock.minecraft.wiki/w/Mobs"
          >
            Mob data
          </a>
        </Panel>
      </div>
    </div>
  );
}
